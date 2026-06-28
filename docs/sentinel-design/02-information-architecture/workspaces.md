# Sentinel Workspaces

## Workspace Map

```text
Sentinel
├── Home
├── Projects
├── Analyze
├── Fix
├── Insights
├── Extensions
└── Settings
```

This replaces the earlier feature-first model:

```text
Dashboard
Explorer
Issues
Fixes
Trends
Extensions
Settings
```

The old model grouped features. The new model groups user intent and presents views over shared Sentinel objects.

## Workspace Rules

1. Each workspace answers one primary question.
2. Each workspace has one primary outcome.
3. Each workspace uses the universal shell.
4. Each workspace exposes tasks before details.
5. Each workspace can open the inspector for context, explanation, and actions.

## Navigation Labels

Use these top-level labels in the product shell:

- Home
- Projects
- Analyze
- Fix
- Insights
- Extensions
- Settings

These labels are intentionally plain. Developers understand them without learning Sentinel's internal vocabulary.

## MVP Sitemap

```text
Sentinel
├── Home
├── Projects
│   ├── Overview
│   ├── Files
│   ├── Modules
│   ├── Dependencies
│   ├── Git
│   ├── Metrics
│   ├── Reports
│   └── Settings
├── Analyze
│   ├── Queue
│   ├── Issues
│   ├── Diff
│   ├── References
│   └── Compare
├── Fix
│   ├── Safe Fixes
│   ├── Manual Fixes
│   ├── Formatting
│   ├── Refactoring
│   ├── Optimization
│   └── Undo
├── Insights
│   ├── Timeline
│   ├── Trends
│   ├── Heatmaps
│   ├── Quality
│   ├── Releases
│   └── Reports
├── Extensions
│   ├── Installed
│   ├── Browse
│   ├── Plugins
│   ├── Analyzer Providers
│   └── Rule Packs
└── Settings
    ├── Profiles
    ├── Organizations
    ├── Themes
    └── Preferences
```

## Seven MVP Screens

Ship these first:

- Home
- Project Overview
- Analyze
- Issue Inspector
- Fix Queue
- Extensions
- Settings

If these seven are excellent, Sentinel is already a useful product.

## Inspector Role

The inspector is the persistent right-side context layer.

It should show:

- selected task details
- issue explanation
- rule information
- impact
- confidence
- suggested action
- diff preview
- raw analyzer output, when needed

The inspector should not become a second main content area. It supports focus; it does not compete with the workspace.

## Status Bar Role

The status bar should remain quiet and operational.

It can show:

- current project
- scan state
- git branch
- analyzer state
- offline status
- last scan time

It should not show marketing messages, tips, or noisy alerts.
