#include <cassert>
#include <iostream>

#include "core/analyzer/PluginLoader.h"

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
    auto* analyzer = loaded->GetAnalyzer();
    assert(analyzer != nullptr);

    assert(analyzer->GetId() == "clang-tidy");
    assert(analyzer->GetName() == "LLVM Clang-Tidy static analyzer");
    assert(analyzer->GetVersion() == "1.0.0");

    auto initRes = analyzer->Initialize("");
    assert(initRes.has_value());

    auto rulesRes = analyzer->GetSupportedRules();
    assert(rulesRes.has_value());
    assert(rulesRes.value().size() == 3);
    assert(rulesRes.value()[0].id.value() == "clang-diagnostic-error");

    std::vector<std::string> files = {"src/main.cpp", "src/helper.h"};
    std::vector<sentinel::RuleId> activeRules = {
        sentinel::RuleId("modernize-use-override"),
        sentinel::RuleId("performance-unnecessary-value-param")};
    auto analyzeRes =
        analyzer->Analyze(sentinel::ProjectId("test-proj"), "/workspace/test", files, activeRules);
    assert(analyzeRes.has_value());
    // 2 files x 2 active rules = 4 issues
    assert(analyzeRes.value().size() == 4);

    std::cout << "Clang-Tidy plugin test passed!" << std::endl;
}

void TestCppcheckPlugin(const std::string& soPath)
{
    std::cout << "[Test] Loading Cppcheck plugin from " << soPath << "..." << std::endl;
    auto res = sentinel::PluginLoader::LoadPlugin(soPath);
    assert(res.has_value());

    auto loaded = std::move(res.value());
    auto* analyzer = loaded->GetAnalyzer();
    assert(analyzer != nullptr);

    assert(analyzer->GetId() == "cppcheck");
    assert(analyzer->GetName() == "Cppcheck static analyzer");
    assert(analyzer->GetVersion() == "2.13.0");

    auto initRes = analyzer->Initialize("");
    assert(initRes.has_value());

    auto rulesRes = analyzer->GetSupportedRules();
    assert(rulesRes.has_value());
    assert(rulesRes.value().size() == 3);
    assert(rulesRes.value()[0].id.value() == "cppcheck-nullPointer");

    std::vector<std::string> files = {"src/main.cpp"};
    std::vector<sentinel::RuleId> activeRules = {sentinel::RuleId("cppcheck-nullPointer"),
                                                 sentinel::RuleId("cppcheck-memleak")};
    auto analyzeRes =
        analyzer->Analyze(sentinel::ProjectId("test-proj"), "/workspace/test", files, activeRules);
    assert(analyzeRes.has_value());
    // 1 file x 2 active rules = 2 issues
    assert(analyzeRes.value().size() == 2);

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
