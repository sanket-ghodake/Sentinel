#include <cassert>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include "core/analyzer/PluginLoader.h"

// Helper to create a temporary test C++ file with violations
void CreateTempTestFile(const std::string& path)
{
    std::ofstream out(path);
    out << R"(#include <string>

struct Base {
    virtual ~Base() = default;
    virtual void doSomething() {}
};

struct Derived : public Base {
    // Missing override keyword - triggers modernize-use-override
    virtual void doSomething() {}
};

// Parameter passed by value instead of const reference - triggers performance-unnecessary-value-param
void checkString(std::string value) {
    (void)value;
}

void testIssues() {
    // Null pointer dereference - triggers cppcheck-nullPointer
    int* p = nullptr;
    *p = 42;

    // Memory leak - triggers cppcheck-memleak
    int* arr = new int[10];
    // delete[] arr; // missing delete triggers memleak
}
)";
    out.close();
}

void TestLoadInvalidPlugin()
{
    std::cout << "[Test] Loading non-existent plugin..." << std::endl;
    auto res = sentinel::PluginLoader::LoadPlugin("non_existent_plugin.so");
    assert(!res.has_value());
    std::cout << "Invalid plugin loading test passed (failed correctly)!" << std::endl;
}

void TestClangTidyPlugin(const std::string& soPath)
{
    std::cout << "[Test] Loading Clang-Tidy plugin from " << soPath << "..." << std::endl;
    auto res = sentinel::PluginLoader::LoadPlugin(soPath);
    assert(res.has_value());

    auto loaded = std::move(res.value());
    auto* plugin = loaded->GetPlugin();
    assert(plugin != nullptr);

    auto rulePack = plugin->GetRulePack();
    assert(rulePack != nullptr);
    assert(rulePack->GetId() == "clang-tidy");
    assert(rulePack->GetName() == "LLVM Clang-Tidy static analyzer");
    assert(rulePack->GetVersion() == "1.0.0");

    auto initRes = plugin->Initialize("");
    assert(initRes.has_value());

    auto rulesRes = rulePack->GetSupportedRules();
    assert(rulesRes.has_value());
    assert(rulesRes.value().size() == 3);
    assert(rulesRes.value()[0].id.value() == "clang-diagnostic-error");

    // Write temp files to check
    std::string tempCpp = "temp_test_analysis_clang.cpp";
    CreateTempTestFile(tempCpp);

    // Create a temp compile_commands.json
    std::string dbPath = "compile_commands.json";
    std::ofstream dbOut(dbPath);
    dbOut << R"([
        {
            "directory": ".",
            "file": "temp_test_analysis_clang.cpp",
            "arguments": ["g++", "-c", "temp_test_analysis_clang.cpp", "-std=c++20"]
        }
    ])";
    dbOut.close();

    std::vector<std::string> files = {tempCpp};
    std::vector<sentinel::RuleId> activeRules = {
        sentinel::RuleId("modernize-use-override"),
        sentinel::RuleId("performance-unnecessary-value-param")};

    auto runner = plugin->GetRunner();
    assert(runner != nullptr);
    auto parser = plugin->GetParser();
    assert(parser != nullptr);

    auto runRes = runner->Run(sentinel::ProjectId("test-proj"), ".", files, activeRules);

    // Clean up temporary test files
    std::remove(tempCpp.c_str());
    std::remove(dbPath.c_str());

    assert(runRes.has_value());

    auto parseRes = parser->Parse(runRes.value(), sentinel::ProjectId("test-proj"));
    assert(parseRes.has_value());

    // Verify that at least override and unnecessary-value-param were detected
    bool foundOverride = false;
    bool foundParam = false;
    for (const auto& issue : parseRes.value()) {
        if (issue.ruleId.value() == "modernize-use-override") {
            foundOverride = true;
        }
        if (issue.ruleId.value() == "performance-unnecessary-value-param") {
            foundParam = true;
        }
    }
    assert(foundOverride);
    assert(foundParam);

    std::cout << "Clang-Tidy plugin test passed!" << std::endl;
}

void TestCppcheckPlugin(const std::string& soPath)
{
    std::cout << "[Test] Loading Cppcheck plugin from " << soPath << "..." << std::endl;
    auto res = sentinel::PluginLoader::LoadPlugin(soPath);
    assert(res.has_value());

    auto loaded = std::move(res.value());
    auto* plugin = loaded->GetPlugin();
    assert(plugin != nullptr);

    auto rulePack = plugin->GetRulePack();
    assert(rulePack != nullptr);
    assert(rulePack->GetId() == "cppcheck");
    assert(rulePack->GetName() == "Cppcheck static analyzer");
    assert(rulePack->GetVersion() == "2.13.0");

    auto initRes = plugin->Initialize("");
    assert(initRes.has_value());

    auto rulesRes = rulePack->GetSupportedRules();
    assert(rulesRes.has_value());
    assert(rulesRes.value().size() == 3);
    assert(rulesRes.value()[0].id.value() == "cppcheck-nullPointer");

    // Write temp files to check
    std::string tempCpp = "temp_test_analysis_cppcheck.cpp";
    CreateTempTestFile(tempCpp);

    std::vector<std::string> files = {tempCpp};
    std::vector<sentinel::RuleId> activeRules = {sentinel::RuleId("cppcheck-nullPointer"),
                                                 sentinel::RuleId("cppcheck-memleak")};

    auto runner = plugin->GetRunner();
    assert(runner != nullptr);
    auto parser = plugin->GetParser();
    assert(parser != nullptr);

    auto runRes = runner->Run(sentinel::ProjectId("test-proj"), ".", files, activeRules);

    // Clean up temporary test files
    std::remove(tempCpp.c_str());

    assert(runRes.has_value());

    auto parseRes = parser->Parse(runRes.value(), sentinel::ProjectId("test-proj"));
    assert(parseRes.has_value());

    // Verify that at least nullPointer and memleak were detected
    bool foundNullPointer = false;
    bool foundMemleak = false;
    for (const auto& issue : parseRes.value()) {
        if (issue.ruleId.value() == "cppcheck-nullPointer") {
            foundNullPointer = true;
        }
        if (issue.ruleId.value() == "cppcheck-memleak") {
            foundMemleak = true;
        }
    }
    assert(foundNullPointer);
    assert(foundMemleak);

    std::cout << "Cppcheck plugin test passed!" << std::endl;
}

int main(int argc, char* argv[])
{
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <path_to_clang_tidy_so> <path_to_cppcheck_so>"
                  << std::endl;
        return 1;
    }

    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Plugin Loader Unit Test Suite" << std::endl;
    std::cout << "========================================" << std::endl;

    TestLoadInvalidPlugin();
    TestClangTidyPlugin(argv[1]);
    TestCppcheckPlugin(argv[2]);

    std::cout << "========================================" << std::endl;
    std::cout << "All Plugin Loader Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
