#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "Quality.h"
#include "TypedId.h"

namespace sentinel {

struct Recommendation
{
    RecommendationId id;
    std::string title;
    std::string description;
    double priority = 0.0;
    std::vector<IssueId> sourceIssues;
    std::vector<TaskId> tasks;

    auto operator<=>(const Recommendation&) const = default;
};

struct Task
{
    TaskId id;
    std::string type;
    std::string title;
    std::string description;
    double estimatedTime = 0.0;
    Severity risk = Severity::Low;
    bool safety = true;
    double impact = 0.0;
    double confidence = 0.0;
    std::string sourceObjectId;

    auto operator<=>(const Task&) const = default;
};

struct TrendPoint
{
    uint64_t timestamp = 0;
    double value = 0.0;

    auto operator<=>(const TrendPoint&) const = default;
};

struct Trend
{
    TrendId id;
    std::string name;
    std::vector<TrendPoint> points;

    auto operator<=>(const Trend&) const = default;
};

}  // namespace sentinel
