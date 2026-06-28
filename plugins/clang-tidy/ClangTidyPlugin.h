#pragma once

#include "sentinel/IAnalyzer.h"

namespace sentinel {

class ClangTidyPlugin : public IAnalyzer
{
public:
    ClangTidyPlugin() = default;
    ~ClangTidyPlugin() override = default;

    std::string GetId() const override;
    std::string GetName() const override;
    std::string GetVersion() const override;

    Expected<void, Error> Initialize(const std::string& configJson) override;
    Expected<std::vector<Rule>, Error> GetSupportedRules() override;

    Expected<std::vector<Issue>, Error> Analyze(const ProjectId& projectId,
                                                const std::string& projectPath,
                                                const std::vector<std::string>& filePaths,
                                                const std::vector<RuleId>& activeRules) override;
};

}  // namespace sentinel
