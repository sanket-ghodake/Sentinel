# Spec 004: Screen Specifications

**Document ID:** SPEC-004
**Title:** Frontend Screen Specifications & Layout Blueprints
**Version:** 1.0
**Status:** Approved
**Author:** Lead UX Designer / Frontend Engineer

---

## Executive Summary

This document specifies the layout, components, interactions, states, and API requirements for the seven primary screens of the Sentinel Desktop application. All implementations must utilize the components and design tokens defined in the **Sentinel Design System (SDS)**.

---

## Universal Shell Layout

Every screen in Sentinel is rendered within a unified three-column grid wrapper:

```text
--------------------------------------------------------------------------------
Global Toolbar: [Logo] | [Project Switcher dropdown] | [Search input] | [Notifications]
--------------------------------------------------------------------------------
Left Navigation  | Center Workspace Area                     | Right Inspector
- Home           |                                           | (Dynamic Context)
- Codebase       |                                           |
- Analyze        |                                           |
- Improve        |                                           |
- Insights       |                                           |
- Extensions     |                                           |
- Settings       |                                           |
--------------------------------------------------------------------------------
Status Bar: [Scan State Indicator] | [Running Background Tasks] | [C++20 Compiler Status]
--------------------------------------------------------------------------------
```

---

## 1. Home Workspace

- **Purpose:** Answer the core developer question: **"Is my project healthy, and what should I do next?"**
- **Layout Grid:** 2-column layout (Left: health overview and active branch status; Right: prioritized recommendations queue).
- **SDS Components:** `ProjectHealthCard`, `StatsBadge`, `PrioritizedTaskCard`.
- **User Interactions:**
  - Clicking "Run Scan" in the toolbar launches background scanner tasks.
  - Clicking any item in the task list updates the right-side Inspector with the task detail and execution buttons.
- **Dynamic States:**
  - _Loading:_ Displays step-by-step progress metrics (e.g., "Indexing filesystem...", "Running Clang-Tidy...").
  - _Empty:_ Rendered when all checks pass: "Excellent. Project passed all enabled checks."
  - _Error:_ Actionable guide if a compiler database is missing.
- **Required APIs:** JSON-RPC calls `GetProjectSummary()`, `GetBranchStatus()`, `GetRecommendedTasks()`.

---

## 2. Codebase Workspace

- **Purpose:** Answer the core developer question: **"Help me understand this codebase."**
- **Layout Grid:** Interchangeable 5-perspective layout in the center canvas.
- **SDS Components:** `ProjectHero`, `RepositoryOverview`, `ModuleExplorer`, `FolderTree`, `CodebaseDependencyGraph`, `QualityHeatmap`, `RecentActivity`.
- **User Interactions:**
  - Toggling between **Structure**, **Architecture**, **Quality**, **Git**, and **Performance** perspectives overlaying different metrics and graph highlights.
  - Clicking a module, folder, or file updates the right-side Inspector with context-aware metrics and dependency lists.
  - Double-clicking a file in the tree opens the file viewer in the Analyze Workspace or external IDE.
- **Dynamic States:**
  - _Loading:_ Displays progress indicator sequence: "Reading Git ➔ Mapping Folders ➔ Parsing Modules ➔ Computing Dependencies".
  - _Empty:_ "No codebase opened. Use Open Folder to initialize a repository."
- **Required APIs:** `GetFilesystemTree()`, `GetModuleDependencyGraph()`, `GetHistoricalSnapshots()`.

---

## 3. Analyze Workspace & Investigation Mode

- **Purpose:** Answer: **"Why does this issue exist, how does it affect the project, and can I safely fix it?"**
- **Layout Grid:** Three-column grid wrapper:
  - Center Workspace Pane: Hosts the 8 core sections (Readiness Hero, Priorities, Issue Categories, Smart Filters, Issue List, Smart Explanation, Related Issues, Recommended Actions).
  - Center Investigation Mode Pane: Transformed call graph, editor, and git history workspace.
  - Right Inspector Panel: Dynamic tabbed info panel (Overview, Explanation, History, References, Diff, Documentation, Raw Analyzer).
- **SDS Components:** `ReadinessHero`, `PrioritiesQueue`, `IssueCategoryGrid`, `SmartFiltersBar`, `IssueMiniCard`, `InvestigationCallGraph`, `ConfidenceMeterBadge`, `InspectorTabGroup`.
- **User Interactions:**
  - Double-clicking or pressing `E` on an issue card swaps the center workspace to Investigation Mode.
  - Hovering issue cards reveals quick actions (Preview, Explain, Ignore, Bookmark, Open IDE).
  - Clicking a category card collapses the workspace into a scoped domain drilldown view.
  - Key bindings: `J` (Next), `K` (Previous), `E` (Explain), `P` (Preview), `A` (Apply), `I` (Ignore).
- **Required APIs:** `GetIssueQueue()`, `GetFileContent(FilePath)`, `ApplyAutofix(IssueId)`, `IgnoreIssue(IssueId, Reason)`, `GetCallGraph(IssueId)`, `GetGitMetadata(IssueId)`.

---

## 4. Improve Workspace

- **Purpose:** Answer: **"Help me safely improve my code."**
- **Layout Grid:** Main diff comparative layout (Left: original file lines; Right: proposed modifications).
- **SDS Components:** `DiffViewer`, `ApplyButton`, `UndoButton`.
- **User Interactions:**
  - Clicking "Preview Fix" computes and shows the side-by-side diff.
  - Clicking "Apply Fix" modifies the source code on the filesystem and updates the quality score.
- **Required APIs:** `GetProposedFixes()`, `GetFixDiff()`, `ApplyAutofix()`.

---

## 5. Insights Workspace

- **Purpose:** Answer: **"How has code quality changed over time?"**
- **Layout Grid:** Multi-chart dashboard.
- **SDS Components:** `TrendLineChart`, `QualityGauge`, `IssueDistributionBarChart`.
- **User Interactions:**
  - Hovering over line chart points shows historical commit metrics.
  - Clicking a time slice compares quality snapshots between two commits.
- **Required APIs:** `GetHistoricalSnapshots()`, `CompareCommits()`.

---

## 6. Extensions Workspace

- **Purpose:** Answer: **"What plugins and rule packs are installed or available?"**
- **Layout Grid:** Flexbox card grid.
- **SDS Components:** `PluginCard`, `MarketplaceListingCard`.
- **User Interactions:**
  - Toggling the checkbox on a plugin card enables/disables the analyzer provider.
  - Clicking "Install" downloads and compiles extensions inside the Docker container.
- **Required APIs:** `GetInstalledPlugins()`, `TogglePluginStatus()`, `InstallPluginFromMarketplace()`.

---

## 7. Settings Workspace

- **Purpose:** Answer: **"Customize Sentinel and profiles."**
- **Layout Grid:** Form-control list layout.
- **SDS Components:** `ToggleSwitch`, `DropdownSelector`, `ProfileCard`.
- **User Interactions:**
  - Switching profiles changes the enabled analysis rules.
  - Adjusting settings parameters updates user settings configurations.
- **Required APIs:** `GetActiveProfiles()`, `UpdateProfileConfiguration()`.
