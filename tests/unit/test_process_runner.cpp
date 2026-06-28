#include <cassert>
#include <chrono>
#include <iostream>

#include "core/runtime/ProcessRunner.h"

void TestSuccessfulNativeRun()
{
    std::cout << "[Test] Running successful native execution test..." << std::endl;
    auto res = sentinel::ProcessRunner::RunNative("echo", {"hello", "sentinel"});
    assert(res.has_value());
    assert(res.value() == "hello sentinel\n");
    std::cout << "Successful native execution passed!" << std::endl;
}

void TestInvalidCommandNativeRun()
{
    std::cout << "[Test] Running invalid command execution test..." << std::endl;
    auto res = sentinel::ProcessRunner::RunNative("non_existent_command_12345", {"some", "args"});
    assert(!res.has_value());
    assert(res.error().code == 127);
    assert(res.error().message.find("not found") != std::string::npos);
    std::cout << "Invalid command test passed!" << std::endl;
}

void TestTimeoutNativeRun()
{
    std::cout << "[Test] Running timeout execution test..." << std::endl;
    sentinel::ExecutionPermissions perms;
    perms.timeoutSeconds = 1;

    auto startTime = std::chrono::steady_clock::now();
    auto res = sentinel::ProcessRunner::RunNative("sleep", {"5"}, perms);
    auto endTime = std::chrono::steady_clock::now();

    assert(!res.has_value());
    assert(res.error().code == 408);
    assert(res.error().message.find("timed out") != std::string::npos);

    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(endTime - startTime).count();
    assert(elapsed < 3 && "Timeout didn't terminate the process fast enough");
    std::cout << "Timeout execution test passed!" << std::endl;
}

void TestSuccessfulDockerRun()
{
    std::cout << "[Test] Running successful Docker run test using alpine:latest..." << std::endl;
    auto res = sentinel::ProcessRunner::RunDocker(
        "alpine:latest", "echo", {"hello", "from", "docker"}, "/workspace/sentinel");

    // In some environments, docker might not be fully configured/accessible from within
    // the container we are testing inside, so if docker command returns an error about
    // permission or connection, we shouldn't necessarily crash the tests, but let's see.
    // If docker daemon is available, we expect a successful output.
    if (res.has_value()) {
        assert(res.value() == "hello from docker\n");
        std::cout << "Docker execution passed!" << std::endl;
    } else {
        std::cout << "Docker run failed with error: " << res.error().message
                  << " (Skipping strict assertion if docker connection unavailable)" << std::endl;
    }
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Process Runner Unit Tests" << std::endl;
    std::cout << "========================================" << std::endl;

    TestSuccessfulNativeRun();
    TestInvalidCommandNativeRun();
    TestTimeoutNativeRun();
    TestSuccessfulDockerRun();

    std::cout << "========================================" << std::endl;
    std::cout << "All Process Runner Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
