#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"
#include "sentinel/TypedId.h"

namespace sentinel {

class IRuleRunner
{
public:
    virtual ~IRuleRunner() = default;

    // Execute static analysis and return the raw output (stdout/stderr or report content)
    virtual Expected<std::string, Error> Run(const ProjectId& projectId,
                                             const std::string& projectPath,
                                             const std::vector<std::string>& filePaths,
                                             const std::vector<RuleId>& activeRules) = 0;
};

}  // namespace sentinel
