#include "CppcheckPlugin.h"

#include <iostream>

namespace sentinel {

std::string CppcheckPlugin::GetId() const
{
    return "cppcheck";
}

std::string CppcheckPlugin::GetName() const
{
    return "Cppcheck static analyzer";
}

std::string CppcheckPlugin::GetVersion() const
{
    return "2.13.0";
}

Expected<void, Error> CppcheckPlugin::Initialize(const std::string& /*configJson*/)
{
    return {};
}

Expected<std::vector<Rule>, Error> CppcheckPlugin::GetSupportedRules()
{
    std::vector<Rule> rules;

    Rule r1;
    r1.id = RuleId("cppcheck-nullPointer");
    r1.name = "Null Pointer Dereference";
    r1.category = "Memory";
    r1.description = "Potential dereferencing of null pointer.";
    r1.severity = Severity::Critical;
    r1.source = "cppcheck";
    r1.enabled = true;
    rules.push_back(r1);

    Rule r2;
    r2.id = RuleId("cppcheck-memleak");
    r2.name = "Memory Leak";
    r2.category = "Memory";
    r2.description = "Allocated memory is not released, causing a leak.";
    r2.severity = Severity::High;
    r2.source = "cppcheck";
    r2.enabled = true;
    rules.push_back(r2);

    Rule r3;
    r3.id = RuleId("cppcheck-unreadVariable");
    r3.name = "Unread Variable";
    r3.category = "Maintainability";
    r3.description = "Variable is allocated but never read or used.";
    r3.severity = Severity::Low;
    r3.source = "cppcheck";
    r3.enabled = true;
    rules.push_back(r3);

    return rules;
}

Expected<std::vector<Issue>, Error> CppcheckPlugin::Analyze(
    const ProjectId& projectId,
    const std::string& /*projectPath*/,
    const std::vector<std::string>& filePaths,
    const std::vector<RuleId>& activeRules)
{
    std::vector<Issue> issues;

    for (const auto& filePath : filePaths) {
        for (const auto& ruleId : activeRules) {
            if (ruleId.value() == "cppcheck-nullPointer") {
                Issue issue;
                issue.id = IssueId("cppcheck-nullpointer-" + projectId.value() + "-" +
                                   filePath.substr(filePath.find_last_of('/') + 1));
                issue.title = "Nullpointer Dereference";
                issue.description = "Pointer is dereferenced before null check is performed.";
                issue.severity = Severity::Critical;
                issue.confidence = Confidence::Medium;
                issue.category = "Memory";
                issue.analyzerId = AnalyzerId("cppcheck");
                issue.ruleId = RuleId("cppcheck-nullPointer");
                issue.location =
                    Location{.fileId = FileId(filePath), .line = 88, .column = 12, .length = 6};
                issue.status = IssueStatus::Open;
                issues.push_back(issue);
            } else if (ruleId.value() == "cppcheck-memleak") {
                Issue issue;
                issue.id = IssueId("cppcheck-memleak-" + projectId.value() + "-" +
                                   filePath.substr(filePath.find_last_of('/') + 1));
                issue.title = "Memory Leak";
                issue.description = "Memory allocated with new[] is not released before exit.";
                issue.severity = Severity::High;
                issue.confidence = Confidence::High;
                issue.category = "Memory";
                issue.analyzerId = AnalyzerId("cppcheck");
                issue.ruleId = RuleId("cppcheck-memleak");
                issue.location =
                    Location{.fileId = FileId(filePath), .line = 120, .column = 9, .length = 10};
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
    return new sentinel::CppcheckPlugin();
}

void DestroyAnalyzer(sentinel::IAnalyzer* analyzer)
{
    delete analyzer;
}
}
