#pragma once

#include "sentinel/IPlugin.h"

namespace sentinel {

class CppcheckRulePack : public IRulePack
{
public:
    CppcheckRulePack() = default;
    ~CppcheckRulePack() override = default;

    std::string GetId() const override;
    std::string GetName() const override;
    std::string GetVersion() const override;
    Expected<std::vector<Rule>, Error> GetSupportedRules() override;
};

class CppcheckRuleRunner : public IRuleRunner
{
public:
    CppcheckRuleRunner() = default;
    ~CppcheckRuleRunner() override = default;

    Expected<std::string, Error> Run(const ProjectId& projectId,
                                     const std::string& projectPath,
                                     const std::vector<std::string>& filePaths,
                                     const std::vector<RuleId>& activeRules) override;
};

class CppcheckParser : public IParser
{
public:
    CppcheckParser() = default;
    ~CppcheckParser() override = default;

    Expected<std::vector<Issue>, Error> Parse(const std::string& rawOutput,
                                              const ProjectId& projectId) override;
};

class CppcheckPlugin : public IPlugin
{
public:
    CppcheckPlugin();
    ~CppcheckPlugin() override = default;

    std::shared_ptr<IRulePack> GetRulePack() override;
    std::shared_ptr<IRuleRunner> GetRunner() override;
    std::shared_ptr<IParser> GetParser() override;

    Expected<void, Error> Initialize(const std::string& configJson) override;

private:
    std::shared_ptr<CppcheckRulePack> rulePack_;
    std::shared_ptr<CppcheckRuleRunner> runner_;
    std::shared_ptr<CppcheckParser> parser_;
};

}  // namespace sentinel
