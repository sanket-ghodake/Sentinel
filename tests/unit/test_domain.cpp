#include <cassert>
#include <iostream>
#include <map>
#include <unordered_map>

#include "sentinel/Configuration.h"
#include "sentinel/Engineering.h"
#include "sentinel/Expected.h"
#include "sentinel/Insights.h"
#include "sentinel/Quality.h"
#include "sentinel/TypedId.h"
#include "sentinel/Workspace.h"

// Unit tests for TypedId
void TestTypedId()
{
    std::cout << "[Test] Running TypedId tests..." << std::endl;

    // Default construction
    sentinel::ProjectId defaultProjId;
    assert(defaultProjId.value() == "");

    // Value construction
    sentinel::ProjectId projId("project-alpha");
    assert(projId.value() == "project-alpha");

    sentinel::IssueId issueId1("issue-1");
    sentinel::IssueId issueId2("issue-1");
    sentinel::IssueId issueId3("issue-2");

    // Equality and comparisons
    assert(issueId1 == issueId2);
    assert(issueId1 != issueId3);
    assert(issueId1 < issueId3);

    // Typing verification: compilation would fail if we assign mismatched ID types:
    // sentinel::ProjectId pId = issueId1; // Expected compilation failure

    // Hashing support in unordered containers
    std::unordered_map<sentinel::ProjectId, std::string> projectNames;
    projectNames[projId] = "Alpha Core Workspace";
    assert(projectNames[projId] == "Alpha Core Workspace");

    // Printing representation check
    std::cout << "Successfully verified TypedId: " << projId << std::endl;
}

// Unit tests for Expected
void TestExpected()
{
    std::cout << "[Test] Running Expected tests..." << std::endl;

    // Value path
    sentinel::Expected<int, sentinel::Error> success(42);
    assert(success.has_value());
    assert(static_cast<bool>(success) == true);
    assert(success.value() == 42);
    assert(*success == 42);

    // Error path
    sentinel::Error err{.message = "Failed to load database file", .code = 404};
    sentinel::Expected<int, sentinel::Error> failure{sentinel::Unexpected<sentinel::Error>(err)};
    assert(!failure.has_value());
    assert(static_cast<bool>(failure) == false);
    assert(failure.error().message == "Failed to load database file");
    assert(failure.error().code == 404);

    // Error path exceptions
    try {
        (void)failure.value();
        assert(false && "Should have thrown bad_variant_access");
    } catch (const std::bad_variant_access&) {
        // Expected
    }

    try {
        (void)success.error();
        assert(false && "Should have thrown bad_variant_access");
    } catch (const std::bad_variant_access&) {
        // Expected
    }

    // Expected<void> tests
    sentinel::Expected<void, sentinel::Error> voidSuccess;
    assert(voidSuccess.has_value());
    voidSuccess.value();  // Should not throw

    sentinel::Expected<void, sentinel::Error> voidFailure{
        sentinel::Unexpected<sentinel::Error>(err)};
    assert(!voidFailure.has_value());
    assert(voidFailure.error().code == 404);
}

// Unit tests for Domain Structures and Comparisons
void TestDomainStructures()
{
    std::cout << "[Test] Running Domain Structures tests..." << std::endl;

    // Workspace & Project objects
    sentinel::Project projA{.id = sentinel::ProjectId("proj-a"),
                            .name = "Sentinel Core",
                            .path = "/workspace/sentinel",
                            .language = "C++"};
    sentinel::Project projB{.id = sentinel::ProjectId("proj-b"),
                            .name = "Sentinel Desktop",
                            .path = "/workspace/sentinel-desktop",
                            .language = "TypeScript"};

    assert(projA.name == "Sentinel Core");
    assert(projB.language == "TypeScript");
    assert(projA != projB);

    // Quality objects & Location
    sentinel::Location loc1{.fileId = sentinel::FileId("main.cpp"), .line = 42, .column = 10};
    sentinel::Location loc2{.fileId = sentinel::FileId("main.cpp"), .line = 42, .column = 10};
    sentinel::Location loc3{.fileId = sentinel::FileId("main.cpp"), .line = 50, .column = 1};

    assert(loc1 == loc2);
    assert(loc1 < loc3);

    // Action and Fix
    sentinel::Action action1{.type = "replace",
                             .description = "Fix SQLite injection risk",
                             .preview = "- sql += val;\n+ sqlite3_bind_text(...);"};
    sentinel::Fix fix{.id = sentinel::FixId("fix-1"),
                      .issueId = sentinel::IssueId("issue-1"),
                      .description = "Use parameterized binding",
                      .actions = {action1}};

    assert(fix.actions.size() == 1);
    assert(fix.actions[0].type == "replace");

    // Issue
    sentinel::Issue issue{.id = sentinel::IssueId("issue-1"),
                          .title = "Unparameterized SQL Query",
                          .description = "Constructing SQL query with string concatenation",
                          .severity = sentinel::Severity::Critical,
                          .confidence = sentinel::Confidence::High,
                          .category = "Security",
                          .analyzerId = sentinel::AnalyzerId("cppcheck"),
                          .ruleId = sentinel::RuleId("sqlite-injection-check"),
                          .location = loc1,
                          .fix = fix,
                          .status = sentinel::IssueStatus::Open};

    assert(issue.severity == sentinel::Severity::Critical);
    assert(issue.status == sentinel::IssueStatus::Open);

    // Recommendation and Task
    sentinel::Task task{.id = sentinel::TaskId("task-1"),
                        .type = "refactor",
                        .title = "Refactor database query interface",
                        .estimatedTime = 15.0,
                        .risk = sentinel::Severity::Low,
                        .safety = true,
                        .sourceObjectId = "issue-1"};

    assert(task.estimatedTime == 15.0);
    assert(task.safety == true);
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Domain Unit Test Suite" << std::endl;
    std::cout << "========================================" << std::endl;

    TestTypedId();
    TestExpected();
    TestDomainStructures();

    std::cout << "========================================" << std::endl;
    std::cout << "All Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
