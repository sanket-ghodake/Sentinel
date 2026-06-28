#include <cassert>
#include <chrono>
#include <cstring>
#include <iostream>
#include <sys/socket.h>
#include <sys/un.h>
#include <thread>
#include <unistd.h>

#include "core/ipc/IpcServer.h"
#include "core/ipc/Json.h"
#include "core/ipc/JsonRpcHandler.h"

class MockClientApi : public sentinel::IClientApi
{
public:
    sentinel::Expected<sentinel::Project, sentinel::Error> OpenProject(
        const std::string& path) override
    {
        sentinel::Project proj{.id = sentinel::ProjectId("proj-test"),
                               .name = "IPC Integration Project",
                               .path = path,
                               .language = "C++"};
        return proj;
    }

    sentinel::Expected<sentinel::Scan, sentinel::Error> RunScan(
        const sentinel::ProjectId& projectId) override
    {
        sentinel::Scan scan{
            .id = sentinel::ScanId("scan-1"), .projectId = projectId, .status = "running"};
        return scan;
    }

    sentinel::Expected<std::vector<sentinel::Issue>, sentinel::Error> GetIssues(
        const sentinel::ProjectId& projectId) override
    {
        return std::vector<sentinel::Issue>{};
    }

    sentinel::Expected<bool, sentinel::Error> ApplyAutofix(
        const sentinel::IssueId& issueId) override
    {
        return true;
    }

    sentinel::Expected<sentinel::Project, sentinel::Error> GetProjectSummary(
        const sentinel::ProjectId& projectId) override
    {
        sentinel::Project proj{.id = projectId, .name = "Summary Project"};
        return proj;
    }
};

void TestIpcCommunication(const std::string& socketPath)
{
    std::cout << "[Test] Running IPC integration tests..." << std::endl;

    MockClientApi api;
    sentinel::JsonRpcHandler handler(api);
    sentinel::IpcServer server(socketPath, handler);

    std::cout << "[Test] Starting server on " << socketPath << "..." << std::endl;
    server.start();
    assert(server.isRunning());
    std::cout << "[Test] Server started successfully." << std::endl;

    // Give it a tiny bit of time to start the thread and open the socket
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Connect client socket
    std::cout << "[Test] Creating client socket..." << std::endl;
    int clientFd = socket(AF_UNIX, SOCK_STREAM, 0);
    assert(clientFd != -1);

    sockaddr_un addr;
    std::memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    std::strncpy(addr.sun_path, socketPath.c_str(), sizeof(addr.sun_path) - 1);

    std::cout << "[Test] Client socket connecting to server..." << std::endl;
    int connResult = connect(clientFd, reinterpret_cast<struct sockaddr*>(&addr), sizeof(addr));
    if (connResult == -1) {
        std::cerr << "Connect failed: " << std::strerror(errno) << std::endl;
        assert(false);
    }
    std::cout << "[Test] Client connected successfully. Sending request 1..." << std::endl;

    // Send Request: OpenProject
    std::string req1 =
        "{\"jsonrpc\": \"2.0\", \"method\": \"OpenProject\", \"params\": {\"path\": "
        "\"/my/workspace\"}, \"id\": 101}\n";
    ssize_t sent1 = send(clientFd, req1.c_str(), req1.size(), 0);
    assert(sent1 == static_cast<ssize_t>(req1.size()));
    std::cout << "[Test] Request 1 sent. Waiting for response 1..." << std::endl;

    // Read Response
    char buffer[1024];
    std::memset(buffer, 0, sizeof(buffer));
    ssize_t bytesRead = recv(clientFd, buffer, sizeof(buffer) - 1, 0);
    std::cout << "[Test] Read from socket returned " << bytesRead << " bytes." << std::endl;
    assert(bytesRead > 0);

    std::string respStr(buffer);
    std::cout << "[Test] Response 1 content: " << respStr << std::endl;
    auto resp = sentinel::Json::parse(respStr);
    assert(resp.contains("result"));
    assert(resp["id"].as_number() == 101.0);
    assert(resp["result"].get_string("id") == "proj-test");
    assert(resp["result"].get_string("language") == "C++");

    // Send another Request: RunScan
    std::cout << "[Test] Sending request 2..." << std::endl;
    std::string req2 =
        "{\"jsonrpc\": \"2.0\", \"method\": \"RunScan\", \"params\": {\"projectId\": "
        "\"proj-test\"}, \"id\": 102}\n";
    ssize_t sent2 = send(clientFd, req2.c_str(), req2.size(), 0);
    assert(sent2 == static_cast<ssize_t>(req2.size()));
    std::cout << "[Test] Request 2 sent. Waiting for response 2..." << std::endl;

    // Read Response
    std::memset(buffer, 0, sizeof(buffer));
    bytesRead = recv(clientFd, buffer, sizeof(buffer) - 1, 0);
    std::cout << "[Test] Read 2 from socket returned " << bytesRead << " bytes." << std::endl;
    assert(bytesRead > 0);

    respStr = std::string(buffer);
    std::cout << "[Test] Response 2 content: " << respStr << std::endl;
    resp = sentinel::Json::parse(respStr);
    assert(resp.contains("result"));
    assert(resp["id"].as_number() == 102.0);
    assert(resp["result"].get_string("id") == "scan-1");
    assert(resp["result"].get_string("status") == "running");

    // Close client connection
    std::cout << "[Test] Closing client socket..." << std::endl;
    close(clientFd);

    // Stop server
    std::cout << "[Test] Stopping server..." << std::endl;
    server.stop();
    assert(!server.isRunning());
    std::cout << "[Test] Server stopped successfully." << std::endl;

    // Check that socket file was unlinked/removed
    assert(access(socketPath.c_str(), F_OK) == -1);

    std::cout << "Successfully verified IPC local socket loop!" << std::endl;
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel IPC Integration Test" << std::endl;
    std::cout << "========================================" << std::endl;

    std::string socketPath = "./test_sentinel.sock";
    TestIpcCommunication(socketPath);

    std::cout << "========================================" << std::endl;
    std::cout << "IPC Integration Test Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
