#include <cassert>
#include <fstream>
#include <iostream>

#include "core/compiler/CompileCommandsParser.h"

void TestSplitCommand()
{
    std::cout << "[Test] Running SplitCommand tests..." << std::endl;

    std::string cmd = "g++ -c -I\"/path to/include\" -DVERSION=\\\"1.0.0\\\" main.cpp";
    auto args = sentinel::CompileCommandsParser::SplitCommand(cmd);

    assert(args.size() == 5);
    assert(args[0] == "g++");
    assert(args[1] == "-c");
    assert(args[2] == "-I/path to/include");
    assert(args[3] == "-DVERSION=\"1.0.0\"");
    assert(args[4] == "main.cpp");

    std::cout << "SplitCommand tests passed!" << std::endl;
}

void TestParseArgumentsStyle()
{
    std::cout << "[Test] Running Parse (arguments style) tests..." << std::endl;

    // Create temp compile_commands.json
    std::string path = "temp_compile_commands_args.json";
    std::ofstream out(path);
    out << R"([
        {
            "directory": "/workspace/project",
            "file": "src/main.cpp",
            "arguments": ["g++", "-c", "src/main.cpp", "-Iinclude"]
        }
    ])";
    out.close();

    auto res = sentinel::CompileCommandsParser::Parse(path);
    std::remove(path.c_str());

    assert(res.has_value());
    const auto& cmds = res.value();
    assert(cmds.size() == 1);
    assert(cmds[0].directory == "/workspace/project");
    assert(cmds[0].file == "src/main.cpp");
    assert(cmds[0].arguments.size() == 4);
    assert(cmds[0].arguments[0] == "g++");
    assert(cmds[0].arguments[3] == "-Iinclude");
    assert(cmds[0].command == "g++ -c src/main.cpp -Iinclude");

    std::cout << "Parse (arguments style) passed!" << std::endl;
}

void TestParseCommandStyle()
{
    std::cout << "[Test] Running Parse (command style) tests..." << std::endl;

    // Create temp compile_commands.json
    std::string path = "temp_compile_commands_cmd.json";
    std::ofstream out(path);
    out << R"([
        {
            "directory": "/workspace/project",
            "file": "src/utils.cpp",
            "command": "clang++ -c src/utils.cpp -DDEBUG"
        }
    ])";
    out.close();

    auto res = sentinel::CompileCommandsParser::Parse(path);
    std::remove(path.c_str());

    assert(res.has_value());
    const auto& cmds = res.value();
    assert(cmds.size() == 1);
    assert(cmds[0].directory == "/workspace/project");
    assert(cmds[0].file == "src/utils.cpp");
    assert(cmds[0].arguments.size() == 4);
    assert(cmds[0].arguments[0] == "clang++");
    assert(cmds[0].arguments[3] == "-DDEBUG");
    assert(cmds[0].command == "clang++ -c src/utils.cpp -DDEBUG");

    std::cout << "Parse (command style) passed!" << std::endl;
}

void TestParseInvalid()
{
    std::cout << "[Test] Running Parse (invalid/non-existent) tests..." << std::endl;

    // Non-existent file
    auto res1 = sentinel::CompileCommandsParser::Parse("non_existent_file_9876.json");
    assert(!res1.has_value());
    assert(res1.error().code == 404);

    // Invalid JSON format
    std::string path = "temp_invalid.json";
    std::ofstream out(path);
    out << "{ \"invalid\": true }";  // should be array
    out.close();

    auto res2 = sentinel::CompileCommandsParser::Parse(path);
    std::remove(path.c_str());

    assert(!res2.has_value());
    assert(res2.error().code == 400);

    std::cout << "Parse (invalid/non-existent) tests passed!" << std::endl;
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Compile Commands Parser Unit Tests" << std::endl;
    std::cout << "========================================" << std::endl;

    TestSplitCommand();
    TestParseArgumentsStyle();
    TestParseCommandStyle();
    TestParseInvalid();

    std::cout << "========================================" << std::endl;
    std::cout << "All Compile Commands Parser Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
