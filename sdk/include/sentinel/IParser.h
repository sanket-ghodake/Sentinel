#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"
#include "sentinel/Quality.h"
#include "sentinel/TypedId.h"

namespace sentinel {

class IParser
{
public:
    virtual ~IParser() = default;

    // Parse raw analyzer output into a structured vector of Issues
    virtual Expected<std::vector<Issue>, Error> Parse(const std::string& rawOutput,
                                                      const ProjectId& projectId) = 0;
};

}  // namespace sentinel
