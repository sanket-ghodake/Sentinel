#pragma once

#include <mutex>
#include <stop_token>
#include <string>
#include <thread>
#include <vector>

#include "JsonRpcHandler.h"

namespace sentinel {

class IpcServer
{
public:
    IpcServer(const std::string& socketPath, JsonRpcHandler& handler);
    ~IpcServer();

    // Disable copy and move
    IpcServer(const IpcServer&) = delete;
    IpcServer& operator=(const IpcServer&) = delete;
    IpcServer(IpcServer&&) = delete;
    IpcServer& operator=(IpcServer&&) = delete;

    void start();
    void stop();

    bool isRunning() const;

private:
    void listenLoop(std::stop_token stopToken);
    void handleClient(int clientFd, std::stop_token stopToken);

    std::string socketPath_;
    JsonRpcHandler& handler_;
    int serverFd_{-1};
    bool isRunning_{false};
    std::mutex serverMutex_;
    std::vector<int> clientFds_;
    std::jthread listenThread_;
};

}  // namespace sentinel
