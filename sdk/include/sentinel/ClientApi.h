#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"
#include "sentinel/Insights.h"
#include "sentinel/Quality.h"
#include "sentinel/Workspace.h"

namespace sentinel {

class IClientApi
{
public:
    virtual ~IClientApi() = default;

    virtual Expected<Project, Error> OpenProject(const std::string& path) = 0;
    virtual Expected<Scan, Error> RunScan(const ProjectId& projectId) = 0;
    virtual Expected<std::vector<Issue>, Error> GetIssues(const ProjectId& projectId) = 0;
    virtual Expected<bool, Error> ApplyAutofix(const IssueId& issueId) = 0;
    virtual Expected<Project, Error> GetProjectSummary(const ProjectId& projectId) = 0;
    virtual Expected<std::vector<Project>, Error> GetProjects() = 0;
    virtual Expected<std::vector<Recommendation>, Error> GetRecommendations(
        const ProjectId& projectId) = 0;
};

}  // namespace sentinel
