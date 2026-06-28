#include "ClangTidyPlugin.h"

#include <iostream>

namespace sentinel {

std::string ClangTidyPlugin::GetId() const
{
    return "clang-tidy";
}

std::string ClangTidyPlugin::GetName() const
{
    return "LLVM Clang-Tidy static analyzer";
}

std::string ClangTidyPlugin::GetVersion() const
{
    return "1.0.0";
}

Expected<void, Error> ClangTidyPlugin::Initialize(const std::string& /*configJson*/)
{
    return {};
}

Expected<std::vector<Rule>, Error> ClangTidyPlugin::GetSupportedRules()
{
    std::vector<Rule> rules;

    Rule r1;
    r1.id = RuleId("clang-diagnostic-error");
    r1.name = "Clang Compilation Error";
    r1.category = "Security";
    r1.description = "Compiler diagnostic reported as a hard compilation error.";
    r1.severity = Severity::Critical;
    r1.source = "clang-tidy";
    r1.enabled = true;
    rules.push_back(r1);

    Rule r2;
    r2.id = RuleId("modernize-use-override");
    r2.name = "Use override keyword";
    r2.category = "Readability";
    r2.description = "Suggests override on virtual functions overriding base methods.";
    r2.severity = Severity::Low;
    r2.source = "clang-tidy";
    r2.enabled = true;
    rules.push_back(r2);

    Rule r3;
    r3.id = RuleId("performance-unnecessary-value-param");
    r3.name = "Unnecessary value parameter";
    r3.category = "Performance";
    r3.description = "Passes heavy parameter by value instead of const reference.";
    r3.severity = Severity::Medium;
    r3.source = "clang-tidy";
    r3.enabled = true;
    rules.push_back(r3);

    return rules;
}

Expected<std::vector<Issue>, Error> ClangTidyPlugin::Analyze(
    const ProjectId& projectId,
    const std::string& /*projectPath*/,
    const std::vector<std::string>& filePaths,
    const std::vector<RuleId>& activeRules)
{
    std::vector<Issue> issues;

    // Simulate issues for files scanned based on active rules
    for (const auto& filePath : filePaths) {
        for (const auto& ruleId : activeRules) {
            if (ruleId.value() == "modernize-use-override") {
                Issue issue;
                issue.id = IssueId("clang-tidy-override-" + projectId.value() + "-" +
                                   filePath.substr(filePath.find_last_of('/') + 1));
                issue.title = "Use override";
                issue.description = "Virtual function inherits base method but lacks override.";
                issue.severity = Severity::Low;
                issue.confidence = Confidence::High;
                issue.category = "Readability";
                issue.analyzerId = AnalyzerId("clang-tidy");
                issue.ruleId = RuleId("modernize-use-override");
                issue.location =
                    Location{.fileId = FileId(filePath), .line = 12, .column = 5, .length = 8};
                issue.status = IssueStatus::Open;

                Fix fix;
                fix.id = FixId("fix-override");
                fix.issueId = issue.id;
                fix.description = "Add override keyword.";
                Action action;
                action.type = "insert";
                action.estimatedTime = 1.0;
                action.risk = Severity::Low;
                action.safe = true;
                action.description = "Append 'override' to function declaration.";
                action.preview = "virtual void process() override;";
                fix.actions.push_back(action);
                issue.fix = fix;

                issues.push_back(issue);
            } else if (ruleId.value() == "performance-unnecessary-value-param") {
                Issue issue;
                issue.id = IssueId("clang-tidy-perf-" + projectId.value() + "-" +
                                   filePath.substr(filePath.find_last_of('/') + 1));
                issue.title = "Unnecessary value parameter";
                issue.description = "std::string parameter is copied. Pass by const reference.";
                issue.severity = Severity::Medium;
                issue.confidence = Confidence::High;
                issue.category = "Performance";
                issue.analyzerId = AnalyzerId("clang-tidy");
                issue.ruleId = RuleId("performance-unnecessary-value-param");
                issue.location =
                    Location{.fileId = FileId(filePath), .line = 45, .column = 18, .length = 15};
                issue.status = IssueStatus::Open;
                issues.push_back(issue);
            }
        }
    }

    return issues;
}

}  // namespace sentinel

extern "C" {

sentinel::IAnalyzer* CreateAnalyzer()
{
    return new sentinel::ClangTidyPlugin();
}

void DestroyAnalyzer(sentinel::IAnalyzer* analyzer)
{
    delete analyzer;
}
}
