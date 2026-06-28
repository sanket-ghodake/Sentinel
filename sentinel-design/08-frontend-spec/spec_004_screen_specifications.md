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
- Projects       |                                           |
- Analyze        |                                           |
- Fix            |                                           |
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

## 2. Projects Workspace

- **Purpose:** Answer: **"Help me understand this codebase's architecture and modules."**
- **Layout Grid:** Split layout (Left: interactive Folder/Module tree; Right: interactive codebase graph).
- **SDS Components:** `ModuleTree`, `CodebaseDependencyGraph`, `FileBadge`.
- **User Interactions:**
  - Double-clicking a file in the tree opens the file viewer.
  - Clicking a node in the dependency graph displays module properties in the right-side Inspector.
- **Dynamic States:**
  - _Loading:_ Renders skeleton loaders mapping the file tree structure.
  - _Empty:_ "No modules found. Please verify your folder contains valid native source code."
- **Required APIs:** `GetFilesystemTree()`, `GetModuleDependencyGraph()`.

---

## 3. Analyze Workspace

- **Purpose:** Answer: **"What issues currently exist in my project, and where are they?"**
- **Layout Grid:** Two-panel split (Left: issue list queue with severity filters; Right: file code viewer with highlighted annotations).
- **SDS Components:** `IssueCard`, `CodeViewer`, `SeverityTag`.
- **User Interactions:**
  - Selecting an issue in the queue scrolls the code viewer to the exact line.
  - Right-clicking a diagnostic line opens a context menu to ignore the rule or check documentation.
- **Required APIs:** `GetIssueQueue()`, `GetFileContent(FilePath)`.

---

## 4. Fix Workspace

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
