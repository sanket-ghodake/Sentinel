#include <cassert>
#include <chrono>
#include <iostream>
#include <thread>

#include "core/event_bus/EventBus.h"
#include "core/storage/Database.h"

void TestDatabaseInitialization()
{
    std::cout << "[Test] Initializing database schema in-memory..." << std::endl;
    sentinel::Database db(":memory:");
    auto initRes = db.InitializeSchema();
    assert(initRes.has_value());
    std::cout << "Database schema initialization passed!" << std::endl;
}

void TestProjectPersistence()
{
    std::cout << "[Test] Verifying project saving and retrieval..." << std::endl;
    sentinel::Database db(":memory:");
    auto initRes = db.InitializeSchema();
    assert(initRes.has_value());

    sentinel::Project proj;
    proj.id = sentinel::ProjectId("proj-1");
    proj.name = "Sentinel Project";
    proj.path = "/workspace/sentinel";
    proj.language = "C++";
    proj.gitStatus = "clean";
    proj.branch = "main";
    proj.quality = 95.5;
    proj.status = "active";
    proj.totalFiles = 10;
    proj.totalLines = 1500;
    proj.totalIssues = 2;

    auto saveRes = db.SaveProject(proj);
    assert(saveRes.has_value());

    auto getRes = db.GetProject(proj.id);
    assert(getRes.has_value());
    assert(getRes.value().id == proj.id);
    assert(getRes.value().name == proj.name);
    assert(getRes.value().path == proj.path);
    assert(getRes.value().language == proj.language);
    assert(getRes.value().gitStatus == proj.gitStatus);
    assert(getRes.value().branch == proj.branch);
    assert(getRes.value().quality == proj.quality);
    assert(getRes.value().status == proj.status);
    assert(getRes.value().totalFiles == proj.totalFiles);
    assert(getRes.value().totalLines == proj.totalLines);
    assert(getRes.value().totalIssues == proj.totalIssues);

    // List projects check
    auto listRes = db.GetProjects();
    assert(listRes.has_value());
    assert(listRes.value().size() == 1);
    assert(listRes.value()[0].id == proj.id);

    std::cout << "Project persistence tests passed!" << std::endl;
}

void TestIssuesAndQualityCalculation()
{
    std::cout << "[Test] Verifying issues persistence and Quality recalculation..." << std::endl;
    sentinel::Database db(":memory:");
    auto initRes = db.InitializeSchema();
    assert(initRes.has_value());

    // Save project
    sentinel::Project proj;
    proj.id = sentinel::ProjectId("proj-2");
    proj.name = "Quality Test";
    proj.path = "/workspace/quality";
    proj.language = "C++";
    proj.status = "active";
    db.SaveProject(proj);

    // Save scan
    sentinel::ScanId scanId("scan-1");
    sentinel::Scan scan;
    scan.id = scanId;
    scan.projectId = proj.id;
    scan.status = "completed";
    scan.startTime = 1000;
    scan.endTime = 2000;
    db.SaveScan(scan);

    // 1. Critical Issue
    sentinel::Issue issue1;
    issue1.id = sentinel::IssueId("issue-crit");
    issue1.title = "Critical Security Injection";
    issue1.description = "SQL injection risk detected.";
    issue1.severity = sentinel::Severity::Critical;
    issue1.category = "Security";
    issue1.status = sentinel::IssueStatus::Open;
    issue1.location =
        sentinel::Location{.fileId = sentinel::FileId("db.cpp"), .line = 42, .column = 1};

    // 2. High Issue
    sentinel::Issue issue2;
    issue2.id = sentinel::IssueId("issue-high");
    issue2.title = "High Performance Loop";
    issue2.description = "Inefficient loop allocation.";
    issue2.severity = sentinel::Severity::High;
    issue2.category = "Performance";
    issue2.status = sentinel::IssueStatus::Open;
    issue2.location =
        sentinel::Location{.fileId = sentinel::FileId("perf.cpp"), .line = 10, .column = 5};

    db.SaveIssue(proj.id, scanId, issue1);
    db.SaveIssue(proj.id, scanId, issue2);

    auto issuesRes = db.GetIssues(proj.id);
    assert(issuesRes.has_value());
    assert(issuesRes.value().size() == 2);

    // Bind to EventBus and simulate scan completion to run RecalculateQuality
    sentinel::EventBus eventBus;
    db.BindToEventBus(eventBus);

    // Publish ScanCompleted event
    sentinel::ScanCompleted scanCompletedEv{.scanId = scanId,
                                            .projectId = proj.id,
                                            .timestamp = 2500,
                                            .totalIssuesFound = 2,
                                            .success = true};
    eventBus.publishSync(scanCompletedEv);

    // Retrieve updated project
    auto updatedProj = db.GetProject(proj.id);
    assert(updatedProj.has_value());
    // Deductions: Critical (-15), High (-8) -> Total overall quality score: 100 - 23 = 77.0
    assert(updatedProj.value().quality == 77.0);
    assert(updatedProj.value().totalIssues == 2);
    assert(updatedProj.value().status == "active");

    // Check Quality Snapshots table
    auto historyRes = db.GetQualityHistory(proj.id);
    assert(historyRes.has_value());
    assert(historyRes.value().size() == 1);
    assert(historyRes.value()[0].overall == 77.0);
    assert(historyRes.value()[0].security == 85.0);     // 100 - 15 = 85.0
    assert(historyRes.value()[0].performance == 92.0);  // 100 - 8 = 92.0

    // Resolve an issue and verify recalculation
    auto resolveRes = db.ResolveIssue(issue1.id);
    assert(resolveRes.has_value());

    // Trigger recalculation via a new Completed event
    sentinel::ScanId scanId2("scan-2");
    sentinel::ScanCompleted scanCompletedEv2{.scanId = scanId2,
                                             .projectId = proj.id,
                                             .timestamp = 3000,
                                             .totalIssuesFound = 1,
                                             .success = true};
    eventBus.publishSync(scanCompletedEv2);

    auto finalProj = db.GetProject(proj.id);
    assert(finalProj.has_value());
    // Deductions: High (-8) only, since Critical is resolved -> Total overall quality score: 100 -
    // 8 = 92.0
    assert(finalProj.value().quality == 92.0);
    assert(finalProj.value().totalIssues == 1);

    std::cout << "Issues and Quality calculation tests passed!" << std::endl;
}

void TestRecommendations()
{
    std::cout << "[Test] Verifying recommendations saving and retrieval..." << std::endl;
    sentinel::Database db(":memory:");
    db.InitializeSchema();

    sentinel::ProjectId projectId("proj-rec");

    sentinel::Recommendation rec;
    rec.id = sentinel::RecommendationId("rec-1");
    rec.title = "Fix SQL Injection";
    rec.description = "Use parameterized placeholder binding instead of raw string concatenation.";
    rec.origin = "clang-tidy/security";
    rec.fileId = "Database.cpp";
    rec.line = 42;
    rec.matchedPattern = "sql += param";
    rec.explanationSimple =
        "Concatenation of input parameters directly in query strings enables injection.";
    rec.explanationTechnical = "Constructing query strings dynamically via concatenation.";
    rec.explanationExpert = "Use parameterized placeholder binding.";
    rec.confidenceScore = 98.5;
    rec.confidenceLevel = "High";
    rec.confidenceSignals = {"Certain rule matched", "Input string verified"};
    rec.safeAutomationLevel = "PREVIEW";
    rec.previewCurrentCode = "sql += param;";
    rec.previewSuggestedCode = "sqlite3_bind_text(...);";
    rec.previewDiff = "- sql += param;\n+ sqlite3_bind_text(...);";
    rec.rollbackSupport = true;
    rec.whyNowReasons = {"Security vulnerability", "High risk"};
    rec.blastRadiusAffectedFiles = 1;
    rec.blastRadiusAffectedModule = "Database";
    rec.blastRadiusPublicApiChanged = false;
    rec.blastRadiusTestsImpacted = 2;
    rec.blastRadiusBinaryCompatibility = "Unchanged";
    rec.learningConcept = "SQL Injection Prevention";
    rec.learningRationale = "Raw concatenation leaves SQL variables unescaped.";
    rec.learningBestPractice = "Always bind query values parameterized.";
    rec.learningReferences = {"CWE-89", "OWASP top 10"};

    auto saveRes = db.SaveRecommendation(projectId, rec);
    assert(saveRes.has_value());

    auto getRes = db.GetRecommendations(projectId);
    assert(getRes.has_value());
    assert(getRes.value().size() == 1);

    auto retrieved = getRes.value()[0];
    assert(retrieved.id == rec.id);
    assert(retrieved.title == rec.title);
    assert(retrieved.description == rec.description);
    assert(retrieved.origin == rec.origin);
    assert(retrieved.fileId == rec.fileId);
    assert(retrieved.line == rec.line);
    assert(retrieved.matchedPattern == rec.matchedPattern);
    assert(retrieved.explanationSimple == rec.explanationSimple);
    assert(retrieved.explanationTechnical == rec.explanationTechnical);
    assert(retrieved.explanationExpert == rec.explanationExpert);
    assert(retrieved.confidenceScore == rec.confidenceScore);
    assert(retrieved.confidenceLevel == rec.confidenceLevel);
    assert(retrieved.safeAutomationLevel == rec.safeAutomationLevel);
    assert(retrieved.previewCurrentCode == rec.previewCurrentCode);
    assert(retrieved.previewSuggestedCode == rec.previewSuggestedCode);
    assert(retrieved.previewDiff == rec.previewDiff);
    assert(retrieved.rollbackSupport == rec.rollbackSupport);
    assert(retrieved.whyNowReasons == rec.whyNowReasons);
    assert(retrieved.blastRadiusAffectedFiles == rec.blastRadiusAffectedFiles);
    assert(retrieved.blastRadiusAffectedModule == rec.blastRadiusAffectedModule);
    assert(retrieved.blastRadiusPublicApiChanged == rec.blastRadiusPublicApiChanged);
    assert(retrieved.blastRadiusTestsImpacted == rec.blastRadiusTestsImpacted);
    assert(retrieved.blastRadiusBinaryCompatibility == rec.blastRadiusBinaryCompatibility);
    assert(retrieved.learningConcept == rec.learningConcept);
    assert(retrieved.learningRationale == rec.learningRationale);
    assert(retrieved.learningBestPractice == rec.learningBestPractice);
    assert(retrieved.learningReferences == rec.learningReferences);

    std::cout << "Recommendations persistence tests passed!" << std::endl;
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Database Unit Test Suite" << std::endl;
    std::cout << "========================================" << std::endl;

    TestDatabaseInitialization();
    TestProjectPersistence();
    TestIssuesAndQualityCalculation();
    TestRecommendations();

    std::cout << "========================================" << std::endl;
    std::cout << "All Database Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
