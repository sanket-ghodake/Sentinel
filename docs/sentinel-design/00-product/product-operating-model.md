# Sentinel Product Operating Model

## Positioning

Sentinel is a desktop-first developer experience platform for code quality.

It owns the experience of understanding and improving code health. It does not own compilers, editors, source control, or static analysis engines.

## North Star

> Know your code. Ship with confidence.

Every product decision should strengthen this promise.

## Product Mental Model

Sentinel is object-based first and workspace-based second.

It should feel closer to Photoshop, Figma, Linear, GitHub Desktop, and Docker Desktop than to a traditional analyzer UI. Users do not navigate a pile of pages. They move between stable workspaces, each built around one job, but every workspace is ultimately a view over shared Sentinel objects.

## Platform Model

Sentinel is not centered on the desktop application. It is centered on the Knowledge Engine.

```text
User Experience
Desktop | VS Code | Visual Studio | CLI | CI | Future Web

Sentinel Public API

Knowledge Engine

Quality | Rules | Projects | Git | Reports

Analyzer Providers
clang-tidy | Cppcheck | IWYU | Plugins

Inputs
Files | Git | Build | compile_commands.json
```

The UI never consumes LLVM, clang-tidy, Cppcheck, or raw analyzer output directly. The UI consumes knowledge: projects, issues, quality snapshots, recommendations, tasks, reports, and history.

## Universal Layout

Every workspace uses the same shell.

```text
Global Toolbar
Sentinel | Project Switcher | Search | Notifications | Profile

Navigation | Main Content | Inspector
Home       | Workspace    | Details
Projects   | content      | Context
Analyze    | changes      | Actions
Fix
Insights
Extensions
Settings

Status Bar
```

Only the center content changes. The toolbar, navigation, inspector, and status bar remain stable so the product becomes easy to learn.

## Workspaces

### Home

Question answered:

> What should I do today?

Primary widgets:

- Continue Working
- Project Health
- Ready To Commit
- Recommended Actions
- Recent Projects
- Recent Activity
- Quality Trend
- Quick Scan

### Projects

Question answered:

> Help me understand this project.

Primary widgets:

- Project Overview
- Folder Tree
- Module Tree
- Dependencies
- Ownership
- Statistics
- Search

### Analyze

Question answered:

> What needs my attention?

Primary widgets:

- Issue Queue
- Blocking Issues
- Review Queue
- Pull Request View
- Diff
- Inspector

### Fix

Question answered:

> Help me improve my project.

Primary widgets:

- Safe Fixes
- Manual Fixes
- Optimization
- Formatting
- Refactoring
- Autofix Preview

### Insights

Question answered:

> How has quality changed?

Primary widgets:

- Timeline
- Heatmap
- Quality Score
- Folder Trend
- Rule Trend
- Reports

### Extensions

Question answered:

> What capabilities are installed or available?

Primary widgets:

- Plugins
- Rule Packs
- Analyzer Providers
- Marketplace

### Settings

Question answered:

> Customize Sentinel.

Primary widgets:

- Profiles
- Organization
- Settings
- Themes

## Five-Second Rule

Every workspace must answer its primary question in under five seconds.

Examples:

```text
Home
Ready to Commit
Quality 95%
3 Recommended Actions
No Blocking Issues
```

```text
Analyze
5 Blocking Issues
12 Suggestions
Estimated Fix Time 8 minutes
```

```text
Fix
17 Safe Fixes
4 Manual Fixes
Estimated Improvement +3%
```

If a workspace cannot answer its question quickly, the design is too noisy.

## Tasks, Not Warnings

Sentinel should frame issues as tasks.

Do not lead with:

```text
Performance Warning
```

Lead with:

```text
Improve Performance
Estimated Time 30 seconds
Safe
One click
```

Developers respond better to prioritized work than raw diagnostics.

## Developer Modes

The same product should support different operating modes.

### Individual Mode

- Focused on the current project
- Minimal UI
- Fast scan and fix loop
- Personal progress

### Team Mode

- Multi-project awareness
- Reports
- Shared rule packs
- Trends
- Review readiness

### Enterprise Mode

- Compliance
- Organization rules
- Release readiness
- Audit reports
- Governance

Modes should change emphasis, not fragment the product into separate applications.

## Product Language

Preferred language:

- Tasks
- Actions
- Insights
- Blocking issue
- Safe fix
- Ready to commit
- Project health
- Recommended action

Avoid leading with:

- Diagnostics
- Warnings
- Violations
- Raw output
- Compiler dump
- Fatal error

Raw tool output is still available, but it belongs in detail layers, not the first view.

## Universal Inspector

Every object opens in the same right-hand inspector.

Clicking a project, issue, rule, plugin, report, recommendation, task, file, or quality snapshot should update the inspector rather than opening a modal. Destructive confirmations can still use modal dialogs.

The inspector should answer:

- What is this object?
- Why does it matter?
- What changed?
- What can I do?
- What is the confidence or risk?
- What raw evidence supports it?

## Product Rules

1. One primary action per workspace.
2. Every object has an inspector representation.
3. No modal dialogs unless the action is destructive.
4. Every scan produces a "What's New" summary.
5. No analyzer terminology in the main workflow.
6. Project is the primary object; files belong inside project views.
7. Global search can find any object.
