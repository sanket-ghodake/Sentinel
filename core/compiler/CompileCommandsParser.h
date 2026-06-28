#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"

namespace sentinel {

struct CompileCommand
{
    std::string directory;
    std::string file;
    std::string command;
    std::vector<std::string> arguments;
};

class CompileCommandsParser
{
public:
    // Parses a compile_commands.json file at the given filesystem path.
    // Returns a list of parsed CompileCommand structs or an Error.
    static Expected<std::vector<CompileCommand>, Error> Parse(const std::string& filePath);

    // Splits a command line string into separate arguments, respecting double-quotes and escapes.
    static std::vector<std::string> SplitCommand(const std::string& commandStr);
};

}  // namespace sentinel
