#include "core/runtime/ProcessRunner.h"

#include <chrono>
#include <cstring>
#include <fcntl.h>
#include <iostream>
#include <poll.h>
#include <signal.h>
#include <sstream>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

namespace sentinel {

Expected<std::string, Error> ProcessRunner::RunNative(const std::string& command,
                                                      const std::vector<std::string>& args,
                                                      const ExecutionPermissions& permissions)
{
    int pipefds[2];
    if (pipe(pipefds) < 0) {
        return Unexpected<Error>(Error{
            .message = "Failed to create pipes: " + std::string(strerror(errno)), .code = 500});
    }

    pid_t pid = fork();
    if (pid < 0) {
        close(pipefds[0]);
        close(pipefds[1]);
        return Unexpected<Error>(Error{
            .message = "Failed to fork process: " + std::string(strerror(errno)), .code = 500});
    }

    if (pid == 0) {
        // --- Child Process ---
        // Redirect stdout and stderr to the pipe
        if (dup2(pipefds[1], STDOUT_FILENO) < 0 || dup2(pipefds[1], STDERR_FILENO) < 0) {
            std::cerr << "Child process failed to redirect standard streams" << std::endl;
            _exit(127);
        }

        close(pipefds[0]);
        close(pipefds[1]);

        // Build command-line arguments array
        std::vector<char*> argv;
        argv.push_back(const_cast<char*>(command.c_str()));
        for (const auto& arg : args) {
            argv.push_back(const_cast<char*>(arg.c_str()));
        }
        argv.push_back(nullptr);

        execvp(command.c_str(), argv.data());

        // If execvp returns, it failed
        std::cerr << "Failed to execute: " << command << " (" << strerror(errno) << ")"
                  << std::endl;
        _exit(127);
    }

    // --- Parent Process ---
    close(pipefds[1]);  // Close unused write end

    std::string output;
    struct pollfd pfd;
    pfd.fd = pipefds[0];
    pfd.events = POLLIN;

    int timeoutMs = static_cast<int>(permissions.timeoutSeconds * 1000);
    auto startTime = std::chrono::steady_clock::now();
    int remainingTimeoutMs = timeoutMs;

    bool timedOut = false;
    char buf[4096];

    while (true) {
        int pollRet = poll(&pfd, 1, remainingTimeoutMs);
        if (pollRet < 0) {
            if (errno == EINTR) {
                continue;
            }
            close(pipefds[0]);
            return Unexpected<Error>(
                Error{.message = "Poll failed: " + std::string(strerror(errno)), .code = 500});
        }

        if (pollRet == 0) {
            timedOut = true;
            break;
        }

        if (pfd.revents & (POLLIN | POLLHUP)) {
            ssize_t bytesRead = read(pipefds[0], buf, sizeof(buf) - 1);
            if (bytesRead > 0) {
                output.append(buf, bytesRead);
            } else if (bytesRead == 0) {
                // EOF reached
                break;
            } else {
                if (errno == EINTR || errno == EAGAIN) {
                    continue;
                }
                close(pipefds[0]);
                return Unexpected<Error>(
                    Error{.message = "Read failed: " + std::string(strerror(errno)), .code = 500});
            }
        }

        // Calculate remaining timeout
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
                           std::chrono::steady_clock::now() - startTime)
                           .count();
        remainingTimeoutMs = timeoutMs - static_cast<int>(elapsed);
        if (remainingTimeoutMs <= 0) {
            timedOut = true;
            break;
        }
    }

    close(pipefds[0]);

    if (timedOut) {
        // Terminate child process
        kill(pid, SIGKILL);
        int status;
        waitpid(pid, &status, 0);
        return Unexpected<Error>(Error{.message = "Process execution timed out after " +
                                                  std::to_string(permissions.timeoutSeconds) +
                                                  " seconds",
                                       .code = 408});
    }

    int status = 0;
    if (waitpid(pid, &status, 0) < 0) {
        return Unexpected<Error>(
            Error{.message = "Waitpid failed: " + std::string(strerror(errno)), .code = 500});
    }

    if (WIFEXITED(status)) {
        int exitCode = WEXITSTATUS(status);
        if (exitCode == 127) {
            return Unexpected<Error>(
                Error{.message = "Command not found or execution failed: " + command, .code = 127});
        }
        // Note: For linters, exit codes can be non-zero (indicating warnings/errors found).
        // We still return the captured stdout/stderr output.
    } else if (WIFSIGNALED(status)) {
        return Unexpected<Error>(
            Error{.message = "Process terminated by signal: " + std::to_string(WTERMSIG(status)),
                  .code = 500});
    }

    return output;
}

Expected<std::string, Error> ProcessRunner::RunDocker(const std::string& image,
                                                      const std::string& command,
                                                      const std::vector<std::string>& args,
                                                      const std::string& mountPath,
                                                      const ExecutionPermissions& permissions)
{
    // Build docker runner arguments
    std::vector<std::string> dockerArgs;
    dockerArgs.push_back("run");
    dockerArgs.push_back("--rm");

    // Mount workspace directory
    dockerArgs.push_back("-v");
    dockerArgs.push_back(mountPath + ":/workspace");
    dockerArgs.push_back("-w");
    dockerArgs.push_back("/workspace");

    // Run as current host user/group to prevent permissions issues
    dockerArgs.push_back("-u");
    dockerArgs.push_back(std::to_string(getuid()) + ":" + std::to_string(getgid()));

    // Target image
    dockerArgs.push_back(image);

    // Command to execute in the container
    dockerArgs.push_back(command);

    // Add command arguments
    for (const auto& arg : args) {
        dockerArgs.push_back(arg);
    }

    return RunNative("docker", dockerArgs, permissions);
}

}  // namespace sentinel
