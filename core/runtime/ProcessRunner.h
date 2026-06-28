#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "sentinel/Expected.h"

namespace sentinel {

struct ExecutionPermissions
{
    bool readFilesystem = true;
    bool writeFilesystem = false;
    bool allowNetwork = false;
    uint32_t timeoutSeconds = 60;
};

class ProcessRunner
{
public:
    // Spawns a native command on the local system with arguments and execution
    // permissions/timeouts. Captured stdout and stderr are merged and returned on success.
    static Expected<std::string, Error> RunNative(
        const std::string& command,
        const std::vector<std::string>& args,
        const ExecutionPermissions& permissions = ExecutionPermissions{});

    // Spawns a command inside a specific Docker container using container mounts and permissions.
    static Expected<std::string, Error> RunDocker(
        const std::string& image,
        const std::string& command,
        const std::vector<std::string>& args,
        const std::string& mountPath,
        const ExecutionPermissions& permissions = ExecutionPermissions{});
};

}  // namespace sentinel
