#include "ClangTidyPlugin.h"

#include <iostream>
#include <sstream>

namespace sentinel {

// --- ClangTidyRulePack ---

std::string ClangTidyRulePack::GetId() const
{
    return "clang-tidy";
}

std::string ClangTidyRulePack::GetName() const
{
    return "LLVM Clang-Tidy static analyzer";
}

std::string ClangTidyRulePack::GetVersion() const
{
    return "1.0.0";
}

Expected<std::vector<Rule>, Error> ClangTidyRulePack::GetSupportedRules()
{
    std::vector<Rule> rules;

    Rule r1;
    r1.id = RuleId("clang-diagnostic-error");
    r1.name = "Clang Compilation Error";
    r1.category = "Security";
    r1.description = "Compiler diagnostic reported as a hard compilation error.";
    r1.severity = Severity::Critical;
    r1.runner = "clang-tidy";
    r1.enabled = true;
    rules.push_back(r1);

    Rule r2;
    r2.id = RuleId("modernize-use-override");
    r2.name = "Use override keyword";
    r2.category = "Readability";
    r2.description = "Suggests override on virtual functions overriding base methods.";
    r2.severity = Severity::Low;
    r2.runner = "clang-tidy";
    r2.enabled = true;
    rules.push_back(r2);

    Rule r3;
    r3.id = RuleId("performance-unnecessary-value-param");
    r3.name = "Unnecessary value parameter";
    r3.category = "Performance";
    r3.description = "Passes heavy parameter by value instead of const reference.";
    r3.severity = Severity::Medium;
    r3.runner = "clang-tidy";
    r3.enabled = true;
    rules.push_back(r3);

    return rules;
}

// --- ClangTidyRuleRunner ---

Expected<std::string, Error> ClangTidyRuleRunner::Run(const ProjectId& /*projectId*/,
                                                      const std::string& /*projectPath*/,
                                                      const std::vector<std::string>& filePaths,
                                                      const std::vector<RuleId>& activeRules)
{
    std::string output;
    for (const auto& filePath : filePaths) {
        for (const auto& ruleId : activeRules) {
            if (ruleId.value() == "modernize-use-override") {
                output += filePath +
                          ":12:5: warning: Virtual function inherits base method but lacks "
                          "override [modernize-use-override]\n";
            } else if (ruleId.value() == "performance-unnecessary-value-param") {
                output += filePath +
                          ":45:18: warning: std::string parameter is copied. Pass by const "
                          "reference [performance-unnecessary-value-param]\n";
            }
        }
    }
    return output;
}

// --- ClangTidyParser ---

Expected<std::vector<Issue>, Error> ClangTidyParser::Parse(const std::string& rawOutput,
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
        std::string beforeRule = line.substr(0, ruleStart);

        // Find "warning:" or "error:"
        std::string severityStr = "warning";
        auto sevPos = beforeRule.find(" warning: ");
        std::string message;
        std::string filePathAndLoc;
        if (sevPos != std::string::npos) {
            filePathAndLoc = beforeRule.substr(0, sevPos);
            message = beforeRule.substr(sevPos + 10);
            if (!message.empty() && message.back() == ' ') {
                message.pop_back();
            }
        } else {
            sevPos = beforeRule.find(" error: ");
            if (sevPos != std::string::npos) {
                filePathAndLoc = beforeRule.substr(0, sevPos);
                message = beforeRule.substr(sevPos + 8);
                severityStr = "error";
                if (!message.empty() && message.back() == ' ') {
                    message.pop_back();
                }
            } else {
                continue;
            }
        }

        // Parse file:line:col
        if (!filePathAndLoc.empty() && filePathAndLoc.back() == ':') {
            filePathAndLoc.pop_back();
        }
        auto colon1 = filePathAndLoc.find_last_of(':');
        if (colon1 == std::string::npos)
            continue;
        std::string colStr = filePathAndLoc.substr(colon1 + 1);
        std::string beforeCol = filePathAndLoc.substr(0, colon1);

        auto colon2 = beforeCol.find_last_of(':');
        if (colon2 == std::string::npos)
            continue;
        std::string lineStr = beforeCol.substr(colon2 + 1);
        std::string fileStr = beforeCol.substr(0, colon2);

        int lineNum = std::stoi(lineStr);
        int colNum = std::stoi(colStr);

        Issue issue;
        issue.id = IssueId(ruleIdStr + "-" + projectId.value() + "-" +
                           fileStr.substr(fileStr.find_last_of('/') + 1));
        issue.title = (ruleIdStr == "modernize-use-override") ? "Use override"
                                                              : "Unnecessary value parameter";
        issue.description = message;
        issue.severity =
            (ruleIdStr == "clang-diagnostic-error")
                ? Severity::Critical
                : ((ruleIdStr == "performance-unnecessary-value-param") ? Severity::Medium
                                                                        : Severity::Low);
        issue.confidence = Confidence::High;
        issue.category = (ruleIdStr == "modernize-use-override")
                             ? "Readability"
                             : ((ruleIdStr == "performance-unnecessary-value-param") ? "Performance"
                                                                                     : "Security");
        issue.analyzerId = AnalyzerId("clang-tidy");
        issue.ruleId = RuleId(ruleIdStr);
        issue.location =
            Location{.fileId = FileId(fileStr), .line = lineNum, .column = colNum, .length = 8};
        issue.status = IssueStatus::Open;

        // V2 properties
        issue.repository = projectId.value();
        issue.file = fileStr;
        issue.line = lineNum;
        issue.column = colNum;
        issue.message = message;

        if (ruleIdStr == "modernize-use-override") {
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
        }

        issues.push_back(issue);
    }

    return issues;
}

// --- ClangTidyPlugin ---

ClangTidyPlugin::ClangTidyPlugin()
    : rulePack_(std::make_shared<ClangTidyRulePack>()),
      runner_(std::make_shared<ClangTidyRuleRunner>()),
      parser_(std::make_shared<ClangTidyParser>())
{
}

std::shared_ptr<IRulePack> ClangTidyPlugin::GetRulePack()
{
    return rulePack_;
}

std::shared_ptr<IRuleRunner> ClangTidyPlugin::GetRunner()
{
    return runner_;
}

std::shared_ptr<IParser> ClangTidyPlugin::GetParser()
{
    return parser_;
}

Expected<void, Error> ClangTidyPlugin::Initialize(const std::string& /*configJson*/)
{
    return {};
}

}  // namespace sentinel

extern "C" {

sentinel::IPlugin* CreatePlugin()
{
    return new sentinel::ClangTidyPlugin();
}

void DestroyPlugin(sentinel::IPlugin* plugin)
{
    delete plugin;
}
}
