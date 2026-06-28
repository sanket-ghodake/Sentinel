#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"
#include "sentinel/Quality.h"
#include "sentinel/Workspace.h"

namespace sentinel {

class IAnalyzer
{
public:
    virtual ~IAnalyzer() = default;

    // Retrieve unique identifier for this analyzer provider (e.g., "clang-tidy", "cppcheck")
    virtual std::string GetId() const = 0;

    // Retrieve user-friendly display name
    virtual std::string GetName() const = 0;

    // Retrieve version of the analyzer provider plugin
    virtual std::string GetVersion() const = 0;

    // Initialize the analyzer with configuration if any
    virtual Expected<void, Error> Initialize(const std::string& configJson) = 0;

    // Query rules supported by this analyzer
    virtual Expected<std::vector<Rule>, Error> GetSupportedRules() = 0;

    // Execute static analysis on a set of files in a project
    virtual Expected<std::vector<Issue>, Error> Analyze(const ProjectId& projectId,
                                                        const std::string& projectPath,
                                                        const std::vector<std::string>& filePaths,
                                                        const std::vector<RuleId>& activeRules) = 0;
};

}  // namespace sentinel
