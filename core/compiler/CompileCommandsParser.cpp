#include "core/compiler/CompileCommandsParser.h"

#include <cctype>
#include <fstream>
#include <iostream>
#include <sstream>

#include "core/ipc/Json.h"

namespace sentinel {

std::vector<std::string> CompileCommandsParser::SplitCommand(const std::string& commandStr)
{
    std::vector<std::string> args;
    std::string current;
    bool inQuotes = false;
    bool escaped = false;

    for (size_t i = 0; i < commandStr.size(); ++i) {
        char c = commandStr[i];
        if (escaped) {
            current += c;
            escaped = false;
        } else if (c == '\\') {
            escaped = true;
        } else if (c == '"') {
            inQuotes = !inQuotes;
        } else if (std::isspace(static_cast<unsigned char>(c)) && !inQuotes) {
            if (!current.empty()) {
                args.push_back(current);
                current.clear();
            }
        } else {
            current += c;
        }
    }
    if (!current.empty()) {
        args.push_back(current);
    }
    return args;
}

Expected<std::vector<CompileCommand>, Error> CompileCommandsParser::Parse(
    const std::string& filePath)
{
    std::ifstream file(filePath);
    if (!file.is_open()) {
        return Unexpected<Error>(
            Error{.message = "Failed to open compilation database: " + filePath, .code = 404});
    }

    std::stringstream ss;
    ss << file.rdbuf();
    std::string content = ss.str();
    file.close();

    try {
        Json json = Json::parse(content);
        if (!json.is_array()) {
            return Unexpected<Error>(Error{
                .message = "Invalid compilation database: root must be a JSON array", .code = 400});
        }

        std::vector<CompileCommand> commands;
        const auto& arr = json.as_array();
        for (const auto& item : arr) {
            if (!item.is_object()) {
                continue;
            }

            CompileCommand cmd;
            cmd.directory = item.get_string("directory");
            cmd.file = item.get_string("file");

            if (item.contains("arguments") && item["arguments"].is_array()) {
                const auto& argsArr = item["arguments"].as_array();
                for (const auto& arg : argsArr) {
                    if (arg.is_string()) {
                        cmd.arguments.push_back(arg.as_string());
                    }
                }
                // Reconstruct command string from arguments array
                std::ostringstream commandStream;
                for (size_t i = 0; i < cmd.arguments.size(); ++i) {
                    if (i > 0) {
                        commandStream << " ";
                    }
                    commandStream << cmd.arguments[i];
                }
                cmd.command = commandStream.str();
            } else if (item.contains("command") && item["command"].is_string()) {
                cmd.command = item.get_string("command");
                cmd.arguments = SplitCommand(cmd.command);
            } else {
                // Must have either arguments array or command string to be valid
                continue;
            }

            commands.push_back(std::move(cmd));
        }

        return commands;
    } catch (const std::exception& e) {
        return Unexpected<Error>(
            Error{.message = "Failed to parse compilation database JSON: " + std::string(e.what()),
                  .code = 400});
    }
}

}  // namespace sentinel
