#include "FakeClientApi.h"

#include <chrono>

#include "core/event_bus/Event.h"

namespace sentinel {

FakeClientApi::FakeClientApi(EventBus& eventBus) : eventBus_(eventBus)
{
    initializeMockData();
}

FakeClientApi::~FakeClientApi()
{
    // std::jthread vectors automatically request stop and join on destruction
}

void FakeClientApi::initializeMockData()
{
    // 1. Sentinel Core (C++) Project
    ProjectId p1Id("proj-sentinel");
    Project p1{.id = p1Id,
               .name = "Sentinel Core",
               .path = "/workspace/sentinel",
               .language = "C++",
               .gitStatus = "clean",
               .branch = "main",
               .quality = 85.5,
               .rules = {RuleId("rule-sql-injection"), RuleId("rule-unused-variable")},
               .plugins = {PluginId("plugin-cppcheck"), PluginId("plugin-clang-tidy")},
               .history = {CommitId("commit-a1b2"), CommitId("commit-c3d4")},
               .owner = "Sanket",
               .tags = {"core", "c++20", "security"},
               .status = "active",
               .totalFiles = 42,
               .totalLines = 12500,
               .totalIssues = 2};

    // Pre-populated C++ Issues
    Issue cppIssue1{
        .id = IssueId("issue-sql-1"),
        .title = "SQL Injection Risk in Database Query",
        .description =
            "Using string concatenation to build raw SQL queries can lead to SQL injection.",
        .severity = Severity::Critical,
        .confidence = Confidence::High,
        .category = "Security",
        .analyzerId = AnalyzerId("cppcheck"),
        .ruleId = RuleId("rule-sql-injection"),
        .location =
            Location{.fileId = FileId("IpcServer.cpp"), .line = 42, .column = 12, .length = 15},
        .impact = "Allows attackers to execute arbitrary SQL commands on the SQLite database.",
        .fix =
            Fix{.id = FixId("fix-sql-1"),
                .issueId = IssueId("issue-sql-1"),
                .description =
                    "Use parameterized placeholder bindings instead of string concatenation.",
                .actions = {Action{
                    .type = "replace",
                    .estimatedTime = 10.0,
                    .risk = Severity::Low,
                    .safe = true,
                    .impact = 1.0,
                    .preview =
                        "BEFORE: SELECT * FROM users WHERE name = input_val;\nAFTER: "
                        "SELECT * FROM users WHERE name = ?;\n        sqlite3_bind_text(stmt, 1, "
                        "input_val.c_str(), -1, SQLITE_TRANSIENT);",
                    .undoStrategy = "Revert to string concatenation"}}},
        .status = IssueStatus::Open,
        .owner = "Sanket"};

    Issue cppIssue2{
        .id = IssueId("issue-unused-1"),
        .title = "Unused Variable 'tempCode'",
        .description = "The local variable 'tempCode' is declared but never referenced.",
        .severity = Severity::Low,
        .confidence = Confidence::High,
        .category = "Style",
        .analyzerId = AnalyzerId("clang-tidy"),
        .ruleId = RuleId("rule-unused-variable"),
        .location =
            Location{.fileId = FileId("JsonRpcHandler.cpp"), .line = 85, .column = 9, .length = 8},
        .impact = "Redundant code that reduces readability.",
        .fix = Fix{.id = FixId("fix-unused-1"),
                   .issueId = IssueId("issue-unused-1"),
                   .description = "Remove the unused variable declaration.",
                   .actions = {Action{.type = "delete",
                                      .estimatedTime = 2.0,
                                      .risk = Severity::Info,
                                      .safe = true,
                                      .impact = 0.1,
                                      .description = "Delete unused variable",
                                      .preview = "- int tempCode = 5;",
                                      .undoStrategy = "Restore variable declaration"}}},
        .status = IssueStatus::Open,
        .owner = "Sanket"};

    // 2. SG Dashboard (TypeScript) Project
    ProjectId p2Id("proj-dashboard");
    Project p2{.id = p2Id,
               .name = "Sg Dashboard",
               .path = "/workspace/sg-dashboard",
               .language = "TypeScript",
               .gitStatus = "modified",
               .branch = "feature-ui",
               .quality = 92.0,
               .rules = {RuleId("rule-console-log")},
               .plugins = {PluginId("plugin-eslint")},
               .history = {CommitId("commit-e5f6")},
               .owner = "Sanket",
               .tags = {"frontend", "react"},
               .status = "active",
               .totalFiles = 18,
               .totalLines = 3400,
               .totalIssues = 1};

    // Pre-populated TS Issues
    Issue tsIssue1{
        .id = IssueId("issue-eslint-1"),
        .title = "Console.log Warning",
        .description = "Avoid using console.log in production code.",
        .severity = Severity::Info,
        .confidence = Confidence::Medium,
        .category = "Style",
        .analyzerId = AnalyzerId("eslint"),
        .ruleId = RuleId("rule-console-log"),
        .location = Location{.fileId = FileId("App.tsx"), .line = 12, .column = 5, .length = 11},
        .impact = "Pollutes console output in production.",
        .fix = Fix{.id = FixId("fix-eslint-1"),
                   .issueId = IssueId("issue-eslint-1"),
                   .description = "Remove console.log or replace with production logger.",
                   .actions = {Action{.type = "delete",
                                      .estimatedTime = 1.0,
                                      .risk = Severity::Info,
                                      .safe = true,
                                      .impact = 0.0,
                                      .description = "Remove console.log",
                                      .preview = "- console.log(data);",
                                      .undoStrategy = "Restore console.log"}}},
        .status = IssueStatus::Open,
        .owner = "Sanket"};

    projects_[p1Id] = p1;
    pathToProjectId_[p1.path] = p1Id;
    issues_[p1Id] = {cppIssue1, cppIssue2};

    projects_[p2Id] = p2;
    pathToProjectId_[p2.path] = p2Id;
    issues_[p2Id] = {tsIssue1};

    Recommendation cppRec1{
        .id = RecommendationId("rec-sql-1"),
        .title = "SQL Injection Risk in Database Query",
        .description =
            "Using string concatenation to build raw SQL queries can lead to SQL injection.",
        .origin = "cppcheck/rule-sql-injection",
        .fileId = "IpcServer.cpp",
        .line = 42,
        .matchedPattern = "sql += input_val",
        .explanationSimple =
            "User input is directly inserted into database queries without validation.",
        .explanationTechnical =
            "SQL query constructed via string concatenation, allowing parameter injection.",
        .explanationExpert =
            "Input parameter is bound via raw string concatenation rather than parameterized SQL "
            "placeholder bindings, violating OWASP A03:2021-Injection guidelines.",
        .confidenceScore = 98.0,
        .confidenceLevel = "High",
        .confidenceSignals = {"Rule certainty",
                              "Analyzer agreement",
                              "Local code context",
                              "Historical false-positive rate"},
        .safeAutomationLevel = "PREVIEW",
        .previewCurrentCode =
            "std::string query = \"SELECT * FROM users WHERE name = \'\""
            " + input_val + \"\';\";",
        .previewSuggestedCode =
            "std::string query = \"SELECT * FROM users WHERE name = ?;\";\nsqlite3_bind_text(stmt, "
            "1, input_val.c_str(), -1, SQLITE_TRANSIENT);",
        .previewDiff =
            "- std::string query = \"SELECT * FROM users WHERE name = \'\""
            " + input_val + \"\';\";\n"
            "+ std::string query = \"SELECT * FROM users WHERE name = ?;\";\n"
            "+ sqlite3_bind_text(stmt, 1, input_val.c_str(), -1, SQLITE_TRANSIENT);",
        .rollbackSupport = true,
        .whyNowReasons = {"Rule enabled yesterday", "File modified in current branch"},
        .blastRadiusAffectedFiles = 1,
        .blastRadiusAffectedModule = "Database",
        .blastRadiusPublicApiChanged = false,
        .blastRadiusTestsImpacted = 2,
        .blastRadiusBinaryCompatibility = "Unchanged",
        .learningConcept = "SQL Injection & Parameterization",
        .learningRationale =
            "Raw SQL concatenation opens vectors for database compromise, leading to information "
            "leakage or arbitrary command execution.",
        .learningBestPractice =
            "Always bind user inputs using parameters rather than concatenation.",
        .learningReferences = {"OWASP Injection Guide", "C++ Core Guidelines Security"}};

    Recommendation cppRec2{
        .id = RecommendationId("rec-unused-1"),
        .title = "Unused Variable 'tempCode'",
        .description = "The local variable 'tempCode' is declared but never referenced.",
        .origin = "clang-tidy/rule-unused-variable",
        .fileId = "JsonRpcHandler.cpp",
        .line = 85,
        .matchedPattern = "int tempCode = 5;",
        .explanationSimple = "This variable is declared but never used.",
        .explanationTechnical = "Local variable does not participate in any subsequent operations.",
        .explanationExpert =
            "Redundant stack variable allocation increases bytecode noise and complicates "
            "readability without contributing to function semantics.",
        .confidenceScore = 99.0,
        .confidenceLevel = "High",
        .confidenceSignals = {"Syntax parsing accuracy", "No usage matched"},
        .safeAutomationLevel = "YES",
        .previewCurrentCode = "int tempCode = 5;",
        .previewSuggestedCode = "",
        .previewDiff = "- int tempCode = 5;",
        .rollbackSupport = true,
        .whyNowReasons = {"New rule activated in style guide"},
        .blastRadiusAffectedFiles = 1,
        .blastRadiusAffectedModule = "IPC",
        .blastRadiusPublicApiChanged = false,
        .blastRadiusTestsImpacted = 0,
        .blastRadiusBinaryCompatibility = "Unchanged",
        .learningConcept = "Dead Code Elimination",
        .learningRationale =
            "Keeping unused variables pollutes the codebase and can hide logical bugs where the "
            "developer intended to use the variable.",
        .learningBestPractice =
            "Proactively remove dead variables or mark with [[maybe_unused]] if intended for debug "
            "scenarios.",
        .learningReferences = {"C++ Core Guidelines ES.2"}};

    Recommendation tsRec1{
        .id = RecommendationId("rec-eslint-1"),
        .title = "Console.log Warning",
        .description = "Avoid using console.log in production code.",
        .origin = "eslint/rule-console-log",
        .fileId = "App.tsx",
        .line = 12,
        .matchedPattern = "console.log(data);",
        .explanationSimple = "Avoid printing logs directly to console in production.",
        .explanationTechnical = "console.log usage bypasses central logging configuration.",
        .explanationExpert =
            "Direct console invocation can leak sensitive runtime structures and slows browser UI "
            "thread rendering during intensive loops.",
        .confidenceScore = 90.0,
        .confidenceLevel = "Medium",
        .confidenceSignals = {"Rule certainty"},
        .safeAutomationLevel = "YES",
        .previewCurrentCode = "console.log(data);",
        .previewSuggestedCode = "",
        .previewDiff = "- console.log(data);",
        .rollbackSupport = true,
        .whyNowReasons = {"Commit hook check ESLint failed"},
        .blastRadiusAffectedFiles = 1,
        .blastRadiusAffectedModule = "App UI",
        .blastRadiusPublicApiChanged = false,
        .blastRadiusTestsImpacted = 1,
        .blastRadiusBinaryCompatibility = "Unchanged",
        .learningConcept = "Production Logging Rules",
        .learningRationale =
            "Use structured loggers that can toggle severity filters instead of exposing "
            "development logs to users.",
        .learningBestPractice = "Leverage logger services instead of raw stdout console streams.",
        .learningReferences = {"12-Factor App Logging guidelines"}};

    recommendations_[p1Id] = {cppRec1, cppRec2};
    recommendations_[p2Id] = {tsRec1};
}

Expected<Project, Error> FakeClientApi::OpenProject(const std::string& path)
{
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = pathToProjectId_.find(path);
    if (it == pathToProjectId_.end()) {
        return Unexpected<Error>(Error{.message = "Project path does not exist", .code = 404});
    }

    return projects_[it->second];
}

Expected<Scan, Error> FakeClientApi::RunScan(const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = projects_.find(projectId);
    if (it == projects_.end()) {
        return Unexpected<Error>(Error{.message = "Project ID not found", .code = 404});
    }

    // If already scanning, return the active scan
    for (const auto& [scanId, scan] : scans_) {
        if (scan.projectId == projectId && scan.status == "scanning") {
            return scan;
        }
    }

    std::string scanIdStr = "scan-" + std::to_string(scans_.size() + 1);
    ScanId scanId(scanIdStr);

    auto now = std::chrono::duration_cast<std::chrono::milliseconds>(
                   std::chrono::system_clock::now().time_since_epoch())
                   .count();

    Scan scan{.id = scanId,
              .projectId = projectId,
              .profileId = ProfileId("default"),
              .rules = it->second.rules,
              .plugins = it->second.plugins,
              .analyzers = {AnalyzerId("cppcheck"), AnalyzerId("clang-tidy")},
              .startTime = static_cast<uint64_t>(now),
              .endTime = 0,
              .status = "scanning"};

    it->second.status = "scanning";
    scans_[scanId] = scan;

    scanThreads_.emplace_back([this, scanId, projectId](std::stop_token stopToken) {
        simulateScan(scanId, projectId, stopToken);
    });

    return scan;
}

Expected<std::vector<Issue>, Error> FakeClientApi::GetIssues(const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = projects_.find(projectId);
    if (it == projects_.end()) {
        return Unexpected<Error>(Error{.message = "Project ID not found", .code = 404});
    }

    return issues_[projectId];
}

Expected<bool, Error> FakeClientApi::ApplyAutofix(const IssueId& issueId)
{
    std::lock_guard<std::mutex> lock(mutex_);

    for (auto& [projectId, list] : issues_) {
        for (auto& issue : list) {
            if (issue.id == issueId) {
                if (issue.status == IssueStatus::Resolved) {
                    return true;  // Already resolved
                }
                issue.status = IssueStatus::Resolved;

                // Update project issues count and quality score
                auto projIt = projects_.find(projectId);
                if (projIt != projects_.end()) {
                    if (projIt->second.totalIssues > 0) {
                        projIt->second.totalIssues--;
                    }
                    projIt->second.quality = std::min(100.0, projIt->second.quality + 1.5);
                }
                return true;
            }
        }
    }

    return Unexpected<Error>(Error{.message = "Issue ID not found", .code = 404});
}

Expected<Project, Error> FakeClientApi::GetProjectSummary(const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = projects_.find(projectId);
    if (it == projects_.end()) {
        return Unexpected<Error>(Error{.message = "Project ID not found", .code = 404});
    }

    return it->second;
}

Expected<std::vector<Project>, Error> FakeClientApi::GetProjects()
{
    std::lock_guard<std::mutex> lock(mutex_);

    std::vector<Project> result;
    result.reserve(projects_.size());
    for (const auto& [id, project] : projects_) {
        result.push_back(project);
    }

    return result;
}

void FakeClientApi::simulateScan(ScanId scanId, ProjectId projectId, std::stop_token stopToken)
{
    // Sleep to simulate scan startup delay
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
    if (stopToken.stop_requested())
        return;

    auto now = std::chrono::duration_cast<std::chrono::milliseconds>(
                   std::chrono::system_clock::now().time_since_epoch())
                   .count();

    // 1. Publish ScanStarted
    eventBus_.publish(ScanStarted{
        .scanId = scanId, .projectId = projectId, .timestamp = static_cast<uint64_t>(now)});

    // Sleep to simulate scan runtime and issue discovery
    std::this_thread::sleep_for(std::chrono::milliseconds(300));
    if (stopToken.stop_requested())
        return;

    // 2. Discover a simulated issue
    std::string simIssueIdStr = "issue-simulated-" + std::to_string(now % 1000);
    IssueId simIssueId(simIssueIdStr);

    Issue simIssue{
        .id = simIssueId,
        .title = "Unused Header Include",
        .description = "Header file <iostream> is included but no symbols from it are used.",
        .severity = Severity::Low,
        .confidence = Confidence::Medium,
        .category = "Style",
        .analyzerId = AnalyzerId("clang-tidy"),
        .ruleId = RuleId("rule-unused-include"),
        .location =
            Location{.fileId = FileId("EventBus.cpp"), .line = 5, .column = 1, .length = 19},
        .impact = "Increases compilation time and bloats dependency tree.",
        .fix = Fix{.id = FixId("fix-simulated-" + std::to_string(now % 1000)),
                   .issueId = simIssueId,
                   .description = "Remove the unused header include.",
                   .actions = {Action{.type = "delete",
                                      .estimatedTime = 1.0,
                                      .risk = Severity::Info,
                                      .safe = true,
                                      .impact = 0.0,
                                      .description = "Remove include <iostream>",
                                      .preview = "- #include <iostream>",
                                      .undoStrategy = "Restore include <iostream>"}}},
        .status = IssueStatus::Open,
        .owner = "Sanket"};

    {
        std::lock_guard<std::mutex> lock(mutex_);
        issues_[projectId].push_back(simIssue);

        auto projIt = projects_.find(projectId);
        if (projIt != projects_.end()) {
            projIt->second.totalIssues++;
        }
    }

    eventBus_.publish(IssueFound{.scanId = scanId,
                                 .projectId = projectId,
                                 .issue = simIssue,
                                 .timestamp = static_cast<uint64_t>(now)});

    // Sleep to simulate scan finalization
    std::this_thread::sleep_for(std::chrono::milliseconds(300));
    if (stopToken.stop_requested())
        return;

    auto endTime = std::chrono::duration_cast<std::chrono::milliseconds>(
                       std::chrono::system_clock::now().time_since_epoch())
                       .count();

    // 3. Complete the scan
    {
        std::lock_guard<std::mutex> lock(mutex_);
        auto scanIt = scans_.find(scanId);
        if (scanIt != scans_.end()) {
            scanIt->second.status = "completed";
            scanIt->second.endTime = static_cast<uint64_t>(endTime);
        }

        auto projIt = projects_.find(projectId);
        if (projIt != projects_.end()) {
            projIt->second.status = "active";
            // Slightly improve quality to reflect "cleanup analysis completed"
            projIt->second.quality = std::min(100.0, projIt->second.quality + 0.5);
        }
    }

    eventBus_.publish(ScanCompleted{.scanId = scanId,
                                    .projectId = projectId,
                                    .timestamp = static_cast<uint64_t>(endTime),
                                    .totalIssuesFound = 1,
                                    .success = true});
}

Expected<std::vector<Recommendation>, Error> FakeClientApi::GetRecommendations(
    const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = projects_.find(projectId);
    if (it == projects_.end()) {
        return Unexpected<Error>(Error{.message = "Project ID not found", .code = 404});
    }

    return recommendations_[projectId];
}

}  // namespace sentinel
