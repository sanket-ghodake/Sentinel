#pragma once

#include "sentinel/IPlugin.h"

namespace sentinel {

class ClangTidyRulePack : public IRulePack
{
public:
    ClangTidyRulePack() = default;
    ~ClangTidyRulePack() override = default;

    std::string GetId() const override;
    std::string GetName() const override;
    std::string GetVersion() const override;
    Expected<std::vector<Rule>, Error> GetSupportedRules() override;
};

class ClangTidyRuleRunner : public IRuleRunner
{
public:
    ClangTidyRuleRunner() = default;
    ~ClangTidyRuleRunner() override = default;

    Expected<std::string, Error> Run(const ProjectId& projectId,
                                     const std::string& projectPath,
                                     const std::vector<std::string>& filePaths,
                                     const std::vector<RuleId>& activeRules) override;
};

class ClangTidyParser : public IParser
{
public:
    ClangTidyParser() = default;
    ~ClangTidyParser() override = default;

    Expected<std::vector<Issue>, Error> Parse(const std::string& rawOutput,
                                              const ProjectId& projectId) override;
};

class ClangTidyPlugin : public IPlugin
{
public:
    ClangTidyPlugin();
    ~ClangTidyPlugin() override = default;

    std::shared_ptr<IRulePack> GetRulePack() override;
    std::shared_ptr<IRuleRunner> GetRunner() override;
    std::shared_ptr<IParser> GetParser() override;

    Expected<void, Error> Initialize(const std::string& configJson) override;

private:
    std::shared_ptr<ClangTidyRulePack> rulePack_;
    std::shared_ptr<ClangTidyRuleRunner> runner_;
    std::shared_ptr<ClangTidyParser> parser_;
};

}  // namespace sentinel
