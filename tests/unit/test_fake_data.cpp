#include <cassert>
#include <chrono>
#include <condition_variable>
#include <iostream>
#include <mutex>

#include "core/event_bus/Event.h"
#include "core/event_bus/EventBus.h"
#include "core/fake_data/FakeClientApi.h"

void TestOpenProject()
{
    std::cout << "[Test] Running FakeClientApi::OpenProject tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    // Test Open success
    auto res1 = api.OpenProject("/workspace/sentinel");
    assert(res1.has_value());
    assert(res1.value().name == "Sentinel Core");
    assert(res1.value().language == "C++");

    // Test Open fail
    auto res2 = api.OpenProject("/invalid");
    assert(!res2.has_value());
    assert(res2.error().code == 404);
    assert(res2.error().message == "Project path does not exist");
}

void TestGetIssuesAndSummary()
{
    std::cout << "[Test] Running GetIssues and GetProjectSummary tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    sentinel::ProjectId pId("proj-sentinel");
    auto summary = api.GetProjectSummary(pId);
    assert(summary.has_value());
    assert(summary.value().name == "Sentinel Core");

    auto issuesRes = api.GetIssues(pId);
    assert(issuesRes.has_value());
    assert(issuesRes.value().size() == 2);
    assert(issuesRes.value()[0].id == sentinel::IssueId("issue-sql-1"));
}

void TestApplyAutofix()
{
    std::cout << "[Test] Running ApplyAutofix tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    sentinel::ProjectId pId("proj-sentinel");
    sentinel::IssueId issueId("issue-sql-1");

    // Check status before
    auto issuesBefore = api.GetIssues(pId);
    assert(issuesBefore.has_value());
    assert(issuesBefore.value()[0].status == sentinel::IssueStatus::Open);
    int totalIssuesBefore = api.GetProjectSummary(pId).value().totalIssues;

    // Apply autofix
    auto fixRes = api.ApplyAutofix(issueId);
    assert(fixRes.has_value());
    assert(fixRes.value() == true);

    // Check status after
    auto issuesAfter = api.GetIssues(pId);
    assert(issuesAfter.has_value());
    assert(issuesAfter.value()[0].status == sentinel::IssueStatus::Resolved);

    auto summaryAfter = api.GetProjectSummary(pId);
    assert(summaryAfter.value().totalIssues == totalIssuesBefore - 1);
}

void TestRunScanAsynchronous()
{
    std::cout << "[Test] Running RunScan asynchronous simulation tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    sentinel::ProjectId pId("proj-sentinel");

    // Setup EventBus monitoring
    std::mutex mtx;
    std::condition_variable cv;
    bool scanStartedCalled = false;
    bool issueFoundCalled = false;
    bool scanCompletedCalled = false;

    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted& ev) {
        std::lock_guard<std::mutex> lock(mtx);
        if (ev.projectId == pId) {
            scanStartedCalled = true;
            cv.notify_all();
        }
    });

    bus.subscribe<sentinel::IssueFound>([&](const sentinel::IssueFound& ev) {
        std::lock_guard<std::mutex> lock(mtx);
        if (ev.projectId == pId) {
            issueFoundCalled = true;
            cv.notify_all();
        }
    });

    bus.subscribe<sentinel::ScanCompleted>([&](const sentinel::ScanCompleted& ev) {
        std::lock_guard<std::mutex> lock(mtx);
        if (ev.projectId == pId) {
            scanCompletedCalled = true;
            cv.notify_all();
        }
    });

    // Run scan
    auto scanRes = api.RunScan(pId);
    assert(scanRes.has_value());
    assert(scanRes.value().status == "scanning");

    // Verify project status is scanning
    assert(api.GetProjectSummary(pId).value().status == "scanning");

    // Wait with timeout
    std::unique_lock<std::mutex> lock(mtx);
    bool completed = cv.wait_for(lock, std::chrono::seconds(3), [&]() {
        return scanStartedCalled && issueFoundCalled && scanCompletedCalled;
    });

    assert(completed && "Scan simulation took too long or failed to dispatch events");

    // Verify project and scan statuses are updated back to active / completed
    assert(api.GetProjectSummary(pId).value().status == "active");
}

void TestGetProjects()
{
    std::cout << "[Test] Running GetProjects tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    auto projectsRes = api.GetProjects();
    assert(projectsRes.has_value());
    assert(projectsRes.value().size() == 2);

    bool hasSentinel = false;
    bool hasDashboard = false;
    for (const auto& proj : projectsRes.value()) {
        if (proj.id == sentinel::ProjectId("proj-sentinel")) {
            hasSentinel = true;
        } else if (proj.id == sentinel::ProjectId("proj-dashboard")) {
            hasDashboard = true;
        }
    }
    assert(hasSentinel);
    assert(hasDashboard);
}

void TestGetRecommendations()
{
    std::cout << "[Test] Running GetRecommendations tests..." << std::endl;
    sentinel::EventBus bus;
    sentinel::FakeClientApi api(bus);

    sentinel::ProjectId pId("proj-sentinel");
    auto recsRes = api.GetRecommendations(pId);
    assert(recsRes.has_value());
    assert(recsRes.value().size() == 2);
    assert(recsRes.value()[0].id == sentinel::RecommendationId("rec-sql-1"));
    assert(recsRes.value()[1].id == sentinel::RecommendationId("rec-unused-1"));
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Fake Data Unit Tests" << std::endl;
    std::cout << "========================================" << std::endl;

    TestOpenProject();
    TestGetIssuesAndSummary();
    TestApplyAutofix();
    TestGetProjects();
    TestGetRecommendations();
    TestRunScanAsynchronous();

    std::cout << "========================================" << std::endl;
    std::cout << "All Fake Data Unit Tests Passed!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
