#include "CppcheckPlugin.h"

#include <iostream>
#include <sstream>

namespace sentinel {

// --- CppcheckRulePack ---

std::string CppcheckRulePack::GetId() const
{
    return "cppcheck";
}

std::string CppcheckRulePack::GetName() const
{
    return "Cppcheck static analyzer";
}

std::string CppcheckRulePack::GetVersion() const
{
    return "2.13.0";
}

Expected<std::vector<Rule>, Error> CppcheckRulePack::GetSupportedRules()
{
    std::vector<Rule> rules;

    Rule r1;
    r1.id = RuleId("cppcheck-nullPointer");
    r1.name = "Null Pointer Dereference";
    r1.category = "Memory";
    r1.description = "Potential dereferencing of null pointer.";
    r1.severity = Severity::Critical;
    r1.runner = "cppcheck";
    r1.enabled = true;
    rules.push_back(r1);

    Rule r2;
    r2.id = RuleId("cppcheck-memleak");
    r2.name = "Memory Leak";
    r2.category = "Memory";
    r2.description = "Allocated memory is not released, causing a leak.";
    r2.severity = Severity::High;
    r2.runner = "cppcheck";
    r2.enabled = true;
    rules.push_back(r2);

    Rule r3;
    r3.id = RuleId("cppcheck-unreadVariable");
    r3.name = "Unread Variable";
    r3.category = "Maintainability";
    r3.description = "Variable is allocated but never read or used.";
    r3.severity = Severity::Low;
    r3.runner = "cppcheck";
    r3.enabled = true;
    rules.push_back(r3);

    return rules;
}

// --- CppcheckRuleRunner ---

Expected<std::string, Error> CppcheckRuleRunner::Run(const ProjectId& /*projectId*/,
                                                     const std::string& /*projectPath*/,
                                                     const std::vector<std::string>& filePaths,
                                                     const std::vector<RuleId>& activeRules)
{
    std::string output;
    for (const auto& filePath : filePaths) {
        for (const auto& ruleId : activeRules) {
            if (ruleId.value() == "cppcheck-nullPointer") {
                output += "[" + filePath +
                          ":88]: (error) Nullpointer Dereference: Pointer is dereferenced before "
                          "null check is performed. [cppcheck-nullPointer]\n";
            } else if (ruleId.value() == "cppcheck-memleak") {
                output += "[" + filePath +
                          ":120]: (warning) Memory Leak: Memory allocated with new[] is not "
                          "released before exit. [cppcheck-memleak]\n";
            }
        }
    }
    return output;
}

// --- CppcheckParser ---

Expected<std::vector<Issue>, Error> CppcheckParser::Parse(const std::string& rawOutput,
                                                          const ProjectId& projectId)
{
    std::vector<Issue> issues;
    std::string line;
    std::istringstream stream(rawOutput);

    while (std::getline(stream, line)) {
        if (line.empty())
            continue;

        // Find last '[' to extract ruleId
        auto ruleStart = line.find_last_of('[');
        auto ruleEnd = line.find_last_of(']');
        if (ruleStart == std::string::npos || ruleEnd == std::string::npos ||
            ruleStart >= ruleEnd) {
            continue;
        }
        std::string ruleIdStr = line.substr(ruleStart + 1, ruleEnd - ruleStart - 1);

        // Find first '[' and matching ']' for file and line
        if (line[0] != '[')
            continue;
        auto fileEnd = line.find("]: ");
        if (fileEnd == std::string::npos)
            continue;
        std::string fileLocStr = line.substr(1, fileEnd - 1);

        auto colonPos = fileLocStr.find_last_of(':');
        if (colonPos == std::string::npos)
            continue;
        std::string fileStr = fileLocStr.substr(0, colonPos);
        std::string lineStr = fileLocStr.substr(colonPos + 1);
        int lineNum = std::stoi(lineStr);

        // Parse severity, title, message from rest
        std::string rest = line.substr(fileEnd + 3);
        if (rest[0] != '(')
            continue;
        auto sevEnd = rest.find(')');
        if (sevEnd == std::string::npos)
            continue;
        std::string severityStr = rest.substr(1, sevEnd - 1);

        // title and message
        std::string content = rest.substr(sevEnd + 2, ruleStart - (fileEnd + 3 + sevEnd + 2) - 1);
        auto colonMsg = content.find(": ");
        std::string titleStr;
        std::string messageStr;
        if (colonMsg != std::string::npos) {
            titleStr = content.substr(0, colonMsg);
            messageStr = content.substr(colonMsg + 2);
        } else {
            titleStr = content;
            messageStr = content;
        }

        Issue issue;
        issue.id = IssueId(ruleIdStr + "-" + projectId.value() + "-" +
                           fileStr.substr(fileStr.find_last_of('/') + 1));
        issue.title = titleStr;
        issue.description = messageStr;
        issue.severity = (severityStr == "error") ? Severity::Critical : Severity::High;
        issue.confidence =
            (ruleIdStr == "cppcheck-nullPointer") ? Confidence::Medium : Confidence::High;
        issue.category = "Memory";
        issue.analyzerId = AnalyzerId("cppcheck");
        issue.ruleId = RuleId(ruleIdStr);
        issue.location =
            Location{.fileId = FileId(fileStr), .line = lineNum, .column = 12, .length = 6};
        issue.status = IssueStatus::Open;

        // V2 properties
        issue.repository = projectId.value();
        issue.file = fileStr;
        issue.line = lineNum;
        issue.column = 12;
        issue.message = messageStr;

        issues.push_back(issue);
    }

    return issues;
}

// --- CppcheckPlugin ---

CppcheckPlugin::CppcheckPlugin()
    : rulePack_(std::make_shared<CppcheckRulePack>()),
      runner_(std::make_shared<CppcheckRuleRunner>()),
      parser_(std::make_shared<CppcheckParser>())
{
}

std::shared_ptr<IRulePack> CppcheckPlugin::GetRulePack()
{
    return rulePack_;
}

std::shared_ptr<IRuleRunner> CppcheckPlugin::GetRunner()
{
    return runner_;
}

std::shared_ptr<IParser> CppcheckPlugin::GetParser()
{
    return parser_;
}

Expected<void, Error> CppcheckPlugin::Initialize(const std::string& /*configJson*/)
{
    return {};
}

}  // namespace sentinel

extern "C" {

sentinel::IPlugin* CreatePlugin()
{
    return new sentinel::CppcheckPlugin();
}

void DestroyPlugin(sentinel::IPlugin* plugin)
{
    delete plugin;
}
}
