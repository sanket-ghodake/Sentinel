#pragma once

#include <string>
#include <vector>

#include "sentinel/Expected.h"
#include "sentinel/Quality.h"

namespace sentinel {

class IRulePack
{
public:
    virtual ~IRulePack() = default;

    // Retrieve unique identifier for this rule pack provider
    virtual std::string GetId() const = 0;

    // Retrieve user-friendly display name
    virtual std::string GetName() const = 0;

    // Retrieve version of the rule pack provider
    virtual std::string GetVersion() const = 0;

    // Query rules supported by this rule pack
    virtual Expected<std::vector<Rule>, Error> GetSupportedRules() = 0;
};

}  // namespace sentinel
