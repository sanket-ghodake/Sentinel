#pragma once

#include <string>
#include <vector>

#include "TypedId.h"

namespace sentinel {

enum class PluginStatus
{
    Disabled,
    Enabled,
    Error
};

struct Plugin
{
    PluginId id;
    std::string name;
    std::string provider;
    std::string version;
    std::vector<std::string> capabilities;
    PluginStatus status = PluginStatus::Disabled;
    std::vector<std::string> permissions;
    std::string configuration;

    auto operator<=>(const Plugin&) const = default;
};

struct RulePack
{
    RulePackId id;
    std::string name;
    PluginId pluginId;
    std::vector<RuleId> rules;

    auto operator<=>(const RulePack&) const = default;
};

struct Profile
{
    ProfileId id;
    ProjectId projectId;
    std::string name;
    std::vector<RulePackId> enabledRulePacks;
    std::vector<RuleId> enabledRules;
    std::vector<AnalyzerId> enabledAnalyzers;
    std::vector<PluginId> enabledPlugins;

    auto operator<=>(const Profile&) const = default;
};

struct Organization
{
    OrganizationId id;
    std::string name;
    std::vector<ProjectId> projects;
    std::vector<ProfileId> profiles;
    std::vector<RulePackId> rulePacks;

    auto operator<=>(const Organization&) const = default;
};

}  // namespace sentinel
