#pragma once

#include <mutex>
#include <sqlite3.h>
#include <string>
#include <vector>

#include "core/event_bus/EventBus.h"
#include "sentinel/Expected.h"
#include "sentinel/Insights.h"
#include "sentinel/Quality.h"
#include "sentinel/Workspace.h"

namespace sentinel {

class Database
{
public:
    explicit Database(const std::string& dbPath);
    ~Database();

    // Disable copy/move
    Database(const Database&) = delete;
    Database& operator=(const Database&) = delete;
    Database(Database&&) = delete;
    Database& operator=(Database&&) = delete;

    Expected<void, Error> InitializeSchema();

    Expected<void, Error> SaveProject(const Project& project);
    Expected<Project, Error> GetProject(const ProjectId& projectId);
    Expected<std::vector<Project>, Error> GetProjects();

    Expected<void, Error> SaveScan(const Scan& scan);
    Expected<Scan, Error> GetScan(const ScanId& scanId);

    Expected<void, Error> SaveIssue(const ProjectId& projectId,
                                    const ScanId& scanId,
                                    const Issue& issue);
    Expected<std::vector<Issue>, Error> GetIssues(const ProjectId& projectId);
    Expected<void, Error> ResolveIssue(const IssueId& issueId);

    Expected<void, Error> SaveQualitySnapshot(const QualitySnapshot& snapshot);
    Expected<std::vector<QualitySnapshot>, Error> GetQualityHistory(const ProjectId& projectId);

    Expected<void, Error> SaveRecommendation(const ProjectId& projectId,
                                             const Recommendation& recommendation);
    Expected<std::vector<Recommendation>, Error> GetRecommendations(const ProjectId& projectId);

    Expected<void, Error> RecalculateQuality(const ProjectId& projectId, const ScanId& scanId);
    void BindToEventBus(EventBus& eventBus);

private:
    sqlite3* db_{nullptr};
    std::mutex dbMutex_;
    std::vector<SubscriptionId> subscriptions_;
    EventBus* eventBus_{nullptr};

    Expected<void, Error> executeQuery(const std::string& sql);
};

}  // namespace sentinel
