#pragma once

#include <compare>
#include <cstdint>
#include <ostream>
#include <string>
#include <utility>

namespace sentinel {

template <typename Tag, typename Underlying = std::string>
class TypedId
{
public:
    using tag_type = Tag;
    using value_type = Underlying;

    constexpr TypedId() : value_{} {}
    constexpr explicit TypedId(const Underlying& val) : value_{val} {}
    constexpr explicit TypedId(Underlying&& val) noexcept(
        std::is_nothrow_move_constructible_v<Underlying>)
        : value_{std::move(val)}
    {
    }

    constexpr const Underlying& value() const noexcept { return value_; }
    constexpr Underlying& value() noexcept { return value_; }

    constexpr bool operator==(const TypedId& other) const = default;
    constexpr auto operator<=>(const TypedId& other) const = default;

    friend std::ostream& operator<<(std::ostream& os, const TypedId& id)
    {
        os << id.value_;
        return os;
    }

private:
    Underlying value_;
};

struct WorkspaceTag
{
};
using WorkspaceId = TypedId<WorkspaceTag>;

struct RepositoryTag
{
};
using RepositoryId = TypedId<RepositoryTag>;
using ProjectId = RepositoryId;

struct ModuleTag
{
};
using ModuleId = TypedId<ModuleTag>;

struct FolderTag
{
};
using FolderId = TypedId<FolderTag>;

struct FileTag
{
};
using FileId = TypedId<FileTag>;

struct SymbolTag
{
};
using SymbolId = TypedId<SymbolTag>;

struct ScanTag
{
};
using ScanId = TypedId<ScanTag>;

struct AnalyzerTag
{
};
using AnalyzerId = TypedId<AnalyzerTag>;

struct IssueTag
{
};
using IssueId = TypedId<IssueTag>;

struct RuleTag
{
};
using RuleId = TypedId<RuleTag>;

struct FixTag
{
};
using FixId = TypedId<FixTag>;

struct QualitySnapshotTag
{
};
using QualitySnapshotId = TypedId<QualitySnapshotTag>;

struct CommitTag
{
};
using CommitId = TypedId<CommitTag>;

struct BranchTag
{
};
using BranchId = TypedId<BranchTag>;

struct ReportTag
{
};
using ReportId = TypedId<ReportTag>;

struct TrendTag
{
};
using TrendId = TypedId<TrendTag>;

struct PluginTag
{
};
using PluginId = TypedId<PluginTag>;

struct RulePackTag
{
};
using RulePackId = TypedId<RulePackTag>;

struct ProfileTag
{
};
using ProfileId = TypedId<ProfileTag>;

struct OrganizationTag
{
};
using OrganizationId = TypedId<OrganizationTag>;

struct RecommendationTag
{
};
using RecommendationId = TypedId<RecommendationTag>;

struct TaskTag
{
};
using TaskId = TypedId<TaskTag>;

}  // namespace sentinel

namespace std {

template <typename Tag, typename Underlying>
struct hash<sentinel::TypedId<Tag, Underlying>>
{
    size_t operator()(const sentinel::TypedId<Tag, Underlying>& id) const noexcept
    {
        return hash<Underlying>{}(id.value());
    }
};

}  // namespace std
