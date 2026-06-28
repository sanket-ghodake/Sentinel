#pragma once

#include <memory>
#include <string>

#include "sentinel/Expected.h"
#include "sentinel/IParser.h"
#include "sentinel/IRulePack.h"
#include "sentinel/IRuleRunner.h"

namespace sentinel {

class IPlugin
{
public:
    virtual ~IPlugin() = default;

    // Retrieve the rule pack definition
    virtual std::shared_ptr<IRulePack> GetRulePack() = 0;

    // Retrieve the decoupled runner
    virtual std::shared_ptr<IRuleRunner> GetRunner() = 0;

    // Retrieve the decoupled parser
    virtual std::shared_ptr<IParser> GetParser() = 0;

    // Initialize the plugin with configuration if any
    virtual Expected<void, Error> Initialize(const std::string& configJson) = 0;
};

}  // namespace sentinel
