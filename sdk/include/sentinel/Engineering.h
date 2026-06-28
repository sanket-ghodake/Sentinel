#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "TypedId.h"

namespace sentinel {

struct Commit
{
    CommitId id;
    ProjectId projectId;
    std::string hash;
    std::string author;
    std::string message;
    uint64_t timestamp = 0;

    auto operator<=>(const Commit&) const = default;
};

struct Branch
{
    BranchId id;
    ProjectId projectId;
    std::string name;
    std::vector<CommitId> commits;

    auto operator<=>(const Branch&) const = default;
};

struct PullRequest
{
    ProjectId projectId;
    BranchId sourceBranch;
    BranchId targetBranch;
    std::vector<IssueId> resolvedIssues;
    std::vector<TaskId> blockingTasks;

    auto operator<=>(const PullRequest&) const = default;
};

struct Release
{
    ProjectId projectId;
    std::string version;
    BranchId branchId;
    CommitId commitId;
    QualitySnapshotId qualitySnapshotId;
    ProfileId profileId;

    auto operator<=>(const Release&) const = default;
};

struct Report
{
    ReportId id;
    ProjectId projectId;
    std::string title;
    QualitySnapshotId qualitySnapshotId;
    std::vector<IssueId> issues;
    std::vector<RuleId> rules;
    std::vector<TaskId> tasks;
    uint64_t timestamp = 0;

    auto operator<=>(const Report&) const = default;
};

}  // namespace sentinel
