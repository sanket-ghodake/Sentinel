#pragma once

#include <string>
#include <vector>

#include "TypedId.h"

namespace sentinel {

struct Symbol
{
    SymbolId id;
    FileId fileId;
    std::string name;
    std::string kind;  // class, function, enum, macro, namespace, type, variable
    int startLine = 0;
    int endLine = 0;

    auto operator<=>(const Symbol&) const = default;
};

struct File
{
    FileId id;
    ProjectId projectId;
    std::string path;
    std::vector<SymbolId> symbols;

    auto operator<=>(const File&) const = default;
};

struct Folder
{
    FolderId id;
    ProjectId projectId;
    std::string path;
    std::vector<FileId> files;
    std::vector<FolderId> subfolders;

    auto operator<=>(const Folder&) const = default;
};

struct Module
{
    ModuleId id;
    ProjectId projectId;
    std::string name;
    std::vector<FolderId> folders;
    std::vector<FileId> files;
    std::vector<SymbolId> symbols;
    std::vector<ModuleId> dependencies;

    auto operator<=>(const Module&) const = default;
};

struct Project
{
    ProjectId id;
    std::string name;
    std::string path;
    std::string language;
    std::string gitStatus;
    std::string branch;
    double quality = 0.0;
    std::vector<RuleId> rules;
    std::vector<PluginId> plugins;
    std::vector<CommitId> history;
    std::string owner;
    std::vector<std::string> tags;
    std::string status;  // active, scanning, error
    int totalFiles = 0;
    int totalLines = 0;
    int totalIssues = 0;

    auto operator<=>(const Project&) const = default;
};

struct Workspace
{
    WorkspaceId id;
    std::string name;
    std::vector<ProjectId> projects;

    auto operator<=>(const Workspace&) const = default;
};

}  // namespace sentinel
