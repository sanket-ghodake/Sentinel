#include "IpcServer.h"

#include <algorithm>
#include <cstring>
#include <iostream>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

namespace sentinel {

IpcServer::IpcServer(const std::string& socketPath, JsonRpcHandler& handler)
    : socketPath_(socketPath), handler_(handler)
{
}

IpcServer::~IpcServer()
{
    stop();
}

void IpcServer::start()
{
    std::lock_guard<std::mutex> lock(serverMutex_);
    if (isRunning_)
        return;

    // Create Unix Domain Socket
    serverFd_ = socket(AF_UNIX, SOCK_STREAM, 0);
    if (serverFd_ == -1) {
        std::cerr << "[IpcServer] Failed to create socket: " << std::strerror(errno) << std::endl;
        return;
    }

    // Bind socket to path
    sockaddr_un addr;
    std::memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    std::strncpy(addr.sun_path, socketPath_.c_str(), sizeof(addr.sun_path) - 1);

    // Unlink the path first in case it already exists
    unlink(socketPath_.c_str());

    if (bind(serverFd_, reinterpret_cast<struct sockaddr*>(&addr), sizeof(addr)) == -1) {
        std::cerr << "[IpcServer] Failed to bind socket to " << socketPath_ << ": "
                  << std::strerror(errno) << std::endl;
        close(serverFd_);
        serverFd_ = -1;
        return;
    }

    if (listen(serverFd_, 10) == -1) {
        std::cerr << "[IpcServer] Failed to listen on socket: " << std::strerror(errno)
                  << std::endl;
        close(serverFd_);
        serverFd_ = -1;
        unlink(socketPath_.c_str());
        return;
    }

    isRunning_ = true;
    listenThread_ = std::jthread([this](std::stop_token token) { listenLoop(token); });
}

void IpcServer::stop()
{
    {
        std::lock_guard<std::mutex> lock(serverMutex_);
        if (!isRunning_)
            return;
        isRunning_ = false;
    }

    // Request stop on threads
    listenThread_.request_stop();

    // To wake up accept() portably (especially on Alpine/musl inside Docker),
    // we connect to our own socket path.
    int wakeFd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (wakeFd != -1) {
        sockaddr_un addr;
        std::memset(&addr, 0, sizeof(addr));
        addr.sun_family = AF_UNIX;
        std::strncpy(addr.sun_path, socketPath_.c_str(), sizeof(addr.sun_path) - 1);
        connect(wakeFd, reinterpret_cast<struct sockaddr*>(&addr), sizeof(addr));
        close(wakeFd);
    }

    // Close server socket and client sockets under lock
    {
        std::lock_guard<std::mutex> lock(serverMutex_);
        if (serverFd_ != -1) {
            close(serverFd_);
            serverFd_ = -1;
        }

        for (int clientFd : clientFds_) {
            if (clientFd != -1) {
                close(clientFd);
            }
        }
        clientFds_.clear();
    }

    // Unlink the socket file
    unlink(socketPath_.c_str());

    // Join the listen thread WITHOUT holding serverMutex_ to prevent deadlock
    if (listenThread_.joinable()) {
        listenThread_.join();
    }
}

bool IpcServer::isRunning() const
{
    return isRunning_;
}

void IpcServer::listenLoop(std::stop_token stopToken)
{
    while (!stopToken.stop_requested()) {
        int clientFd = accept(serverFd_, nullptr, nullptr);
        if (clientFd == -1) {
            if (stopToken.stop_requested()) {
                break;
            }
            std::cerr << "[IpcServer] accept error: " << std::strerror(errno) << std::endl;
            continue;
        }

        {
            std::lock_guard<std::mutex> lock(serverMutex_);
            if (!isRunning_) {
                close(clientFd);
                break;
            }
            clientFds_.push_back(clientFd);
        }

        // Spawn a thread to handle client
        std::jthread([this, clientFd](std::stop_token clientToken) {
            handleClient(clientFd, clientToken);
        }).detach();
    }
}

void IpcServer::handleClient(int clientFd, std::stop_token stopToken)
{
    std::string buffer;
    char temp[512];

    while (!stopToken.stop_requested()) {
        ssize_t bytesRead = recv(clientFd, temp, sizeof(temp) - 1, 0);
        if (bytesRead <= 0) {
            break;  // EOF or connection closed / interrupted
        }

        temp[bytesRead] = '\0';
        buffer += temp;

        size_t pos;
        while ((pos = buffer.find('\n')) != std::string::npos) {
            std::string line = buffer.substr(0, pos);
            buffer.erase(0, pos + 1);

            // Strip trailing carriage return if any (for CRLF compatibility)
            if (!line.empty() && line.back() == '\r') {
                line.pop_back();
            }

            if (line.empty()) {
                continue;
            }

            std::string response = handler_.handleRequest(line);
            response += "\n";

            send(clientFd, response.c_str(), response.size(), 0);
        }
    }

    close(clientFd);

    // Remove from tracked clients list
    std::lock_guard<std::mutex> lock(serverMutex_);
    auto it = std::find(clientFds_.begin(), clientFds_.end(), clientFd);
    if (it != clientFds_.end()) {
        clientFds_.erase(it);
    }
}

}  // namespace sentinel
