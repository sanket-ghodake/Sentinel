#pragma once

#include <memory>
#include <mutex>
#include <thread>
#include <unordered_map>
#include <vector>

#include "core/event_bus/EventBus.h"
#include "core/storage/Database.h"
#include "sentinel/ClientApi.h"

namespace sentinel {

class FakeClientApi : public IClientApi
{
public:
    explicit FakeClientApi(EventBus& eventBus, const std::string& dbPath = "sentinel_cache.db");
    ~FakeClientApi() override;

    // IClientApi implementation
    Expected<Project, Error> OpenProject(const std::string& path) override;
    Expected<Scan, Error> RunScan(const ProjectId& projectId) override;
    Expected<std::vector<Issue>, Error> GetIssues(const ProjectId& projectId) override;
    Expected<bool, Error> ApplyAutofix(const IssueId& issueId) override;
    Expected<Project, Error> GetProjectSummary(const ProjectId& projectId) override;
    Expected<std::vector<Project>, Error> GetProjects() override;
    Expected<std::vector<Recommendation>, Error> GetRecommendations(
        const ProjectId& projectId) override;

private:
    void initializeMockData();
    void simulateScan(ScanId scanId, ProjectId projectId, std::stop_token stopToken);

    EventBus& eventBus_;
    std::mutex mutex_;

    std::unique_ptr<Database> db_;
    std::vector<std::jthread> scanThreads_;
};

}  // namespace sentinel
