#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "TypedId.h"

namespace sentinel {

enum class Severity
{
    Info,
    Low,
    Medium,
    High,
    Critical
};

enum class Confidence
{
    Low,
    Medium,
    High
};

enum class IssueStatus
{
    Open,
    Resolved,
    Ignored
};

struct Location
{
    FileId fileId;
    int line = 0;
    int column = 0;
    int length = 0;

    auto operator<=>(const Location&) const = default;
};

struct Action
{
    std::string type;  // replace, insert, delete
    double estimatedTime = 0.0;
    Severity risk = Severity::Low;
    bool safe = true;
    double impact = 0.0;
    std::string description;
    std::string preview;
    std::string undoStrategy;

    auto operator<=>(const Action&) const = default;
};

struct Fix
{
    FixId id;
    IssueId issueId;
    std::string description;
    std::vector<Action> actions;

    auto operator<=>(const Fix&) const = default;
};

struct Issue
{
    IssueId id;
    std::string title;
    std::string description;
    Severity severity = Severity::Medium;
    Confidence confidence = Confidence::Medium;
    std::string category;
    AnalyzerId analyzerId;
    RuleId ruleId;
    Location location;
    std::string impact;
    Fix fix;
    IssueStatus status = IssueStatus::Open;
    std::string owner;

    // V2 properties appended at the end to preserve designated initializer order
    std::string repository;
    std::string file;
    int line = 0;
    int column = 0;
    std::string message;
    std::string evidence;
    std::vector<std::string> references;
    std::vector<std::string> tags;

    auto operator<=>(const Issue&) const = default;
};

struct Rule
{
    RuleId id;
    std::string name;
    std::string category;
    std::string description;
    Severity severity = Severity::Medium;
    std::string runner;             // V2 runner field (formerly source)
    std::string documentation;      // V2 documentation URL or content
    std::vector<std::string> tags;  // V2 metadata tags
    bool supportsAutofix = false;   // V2 flag
    bool supportsPreview = false;   // V2 flag
    bool enabled = true;
    std::string configuration;
    std::vector<std::string> references;
    std::string source;  // V1 Compatibility source (maps to runner)

    auto operator<=>(const Rule&) const = default;
};

struct QualitySnapshot
{
    QualitySnapshotId id;
    ProjectId projectId;
    double overall = 0.0;
    double performance = 0.0;
    double memory = 0.0;
    double security = 0.0;
    double architecture = 0.0;
    double maintainability = 0.0;
    double readability = 0.0;
    double compliance = 0.0;
    double confidence = 0.0;

    auto operator<=>(const QualitySnapshot&) const = default;
};

struct Scan
{
    ScanId id;
    ProjectId projectId;
    ProfileId profileId;
    std::vector<RuleId> rules;
    std::vector<PluginId> plugins;
    std::vector<AnalyzerId> analyzers;
    uint64_t startTime = 0;
    uint64_t endTime = 0;
    std::string status;  // completed, failed, scanning

    auto operator<=>(const Scan&) const = default;
};

struct Analyzer
{
    AnalyzerId id;
    PluginId pluginId;
    std::string name;
    std::vector<RuleId> supportedRules;
    bool supportsFixes = false;

    auto operator<=>(const Analyzer&) const = default;
};

}  // namespace sentinel
