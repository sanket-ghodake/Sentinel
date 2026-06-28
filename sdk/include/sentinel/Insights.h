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
    std::string origin;

    // Evidence & Context
    std::string fileId;
    int line = 0;
    std::string matchedPattern;

    // Explanation
    std::string explanationSimple;
    std::string explanationTechnical;
    std::string explanationExpert;

    // Confidence & Automation
    double confidenceScore = 0.0;
    std::string confidenceLevel;
    std::vector<std::string> confidenceSignals;
    std::string safeAutomationLevel;  // "YES", "NO", "PREVIEW"

    // Patch / Preview
    std::string previewCurrentCode;
    std::string previewSuggestedCode;
    std::string previewDiff;
    bool rollbackSupport = true;

    // Why Now?
    std::vector<std::string> whyNowReasons;

    // Blast Radius
    int blastRadiusAffectedFiles = 0;
    std::string blastRadiusAffectedModule;
    bool blastRadiusPublicApiChanged = false;
    int blastRadiusTestsImpacted = 0;
    std::string blastRadiusBinaryCompatibility;

    // Learning Mode
    std::string learningConcept;
    std::string learningRationale;
    std::string learningBestPractice;
    std::vector<std::string> learningReferences;

    // V2 properties appended at the end to preserve designated initializer order
    std::string estimatedEffort;  // V2: e.g., '10m'
    std::string estimatedImpact;  // V2: e.g., 'High'
    std::string preview;          // V2: Diff patch or code
    bool rollback = true;         // V2: Rollback flag

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
