# Sidebar Component Specification

## Overview

The Sidebar is the primary application navigation hub. It remains docked to the left edge of the screen.

## Layout Configuration

- Height: `100vh`
- Width: `240px` (Expanded) or `72px` (Collapsed)
- Layout: Flexbox column.
  - Top: Navigation workspace menu options.
  - Bottom: Collapse toggle action button.

## Menu Options List

- `🏠 Home` - Dashboard command center
- `📁 Projects` - Repository explorers
- `🔎 Analyze` - Issues and warnings queue
- `✨ Improve` - Actionable autofixes workspace (renamed from "Fix")
- `📈 Insights` - Quality and metric trends
- `🧩 Extensions` - Linter and analyzer plugin configurations
- `⚙ Settings` - Global config parameters

## States & Highlighting

- **Active Workspace**: Nav item has background `var(--sds-surface-hover)` and a left border indicator `3px solid var(--sds-primary)`.
- **Hover**: Background shifts to `var(--sds-surface-hover)`.
- **Badge Indicators**: Small circular count badges overlaying relevant icons (e.g., green recommendation dot, red blocking issue count).

## Accessibility

- Uses `role="navigation"` and `aria-label="Sidebar Navigation"`.
- `aria-current="page"` applied to the button matching the active workspace.
