# Sentinel Product Design Specification (SPDS)

# Volume 1 — Product Overview & Navigation

Version: 1.0 (Draft)

---

# 1. Product Goal

Sentinel is the desktop home for engineering quality.

It is the first application a developer opens before coding and the last application they check before committing.

The application answers five questions:

1. Is my project healthy?
2. What changed?
3. What needs attention?
4. What can I safely improve?
5. Can I commit with confidence?

---

# 2. Window Layout

Every workspace uses the exact same application shell.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Global Toolbar                                                              │
├──────────────┬────────────────────────────────────────────┬─────────────────┤
│ Navigation   │ Main Workspace                            │ Inspector        │
│              │                                            │                 │
│              │                                            │                 │
│              │                                            │                 │
├──────────────┴────────────────────────────────────────────┴─────────────────┤
│ Status Bar                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

Users should never feel "lost" because the application frame never changes.

---

# 3. Global Toolbar

Purpose:
Provide global actions available everywhere.

Height:
64 px

Contents (left → right):

- Sentinel logo
- Current workspace title
- Project switcher
- Global search (Ctrl+K)
- Run Scan button
- Notifications
- User/Profile menu

Rules:

- Toolbar is always visible.
- Search always remains accessible.
- Run Scan never moves location.
- No page-specific controls belong in the toolbar.

---

# 4. Navigation Sidebar

Width:
240 px (expanded)

Collapsed:
72 px

Items:

🏠 Home

📁 Projects

🔎 Analyze

🛠 Fix

📈 Insights

🧩 Extensions

⚙ Settings

Behavior:

- Single click changes workspace.
- Active item highlighted.
- Hover shows tooltip.
- Keyboard navigation supported.
- Badges may appear (e.g. pending fixes).

No nested menus in the main navigation.

---

# 5. Main Workspace

Purpose:

Displays the primary content for the selected workspace.

Rules:

- Maximum content width for readability.
- Consistent page header.
- Cards arranged on an 8-point spacing grid.
- No horizontal scrolling.
- Primary action always visible without scrolling.

---

# 6. Inspector Panel

Width:
360–420 px

Purpose:

Displays details for the currently selected object.

Supported objects:

- Project
- Folder
- File
- Module
- Issue
- Rule
- Plugin
- Report
- Recommendation

The inspector updates dynamically without opening modal dialogs.

Sections may include:

- Summary
- Details
- Properties
- Related Items
- Actions
- History

---

# 7. Status Bar

Height:
28 px

Shows:

- Current branch
- Last scan time
- Active profile
- Active analyzer count
- Background scan status

Never display logs here.

---

# 8. Global Search (Ctrl+K)

Searches across:

- Projects
- Files
- Symbols
- Issues
- Rules
- Plugins
- Reports
- Commands

Results grouped by category.

Keyboard-only workflow supported.

---

# 9. Command Palette

Invoked with Ctrl+Shift+P.

Typical commands:

- Run Full Scan
- Scan Changed Files
- Apply Safe Fixes
- Open Recent Project
- Export Report
- Install Plugin
- Import Rule Pack
- Toggle Theme

Each command supports keyboard execution without mouse interaction.

---

# 10. Design Rules

Every page must answer one primary question.

Only one primary CTA per page.

Cards preferred over dense tables.

Whitespace is intentional.

Warnings are grouped into meaningful categories (Performance, Memory, Security, etc.) rather than by analyzer.

Every issue provides:

- Why it happened
- Impact
- Suggested action
- Estimated effort
- Safe/Manual indicator

---

# 11. Universal Component Rules

Buttons:

Primary:

- Filled
- Highest emphasis

Secondary:

- Outlined

Ghost:

- Minimal emphasis

Danger:

- Red, destructive only

Icon Button:

- Toolbar and compact actions only

Badges:

- Success
- Warning
- Error
- Info

Cards:

Every card contains:

- Title
- Summary
- Optional trend
- Primary action
- Optional secondary action

---

# 12. Universal States

Every screen must define:

Loading state

Empty state

Offline state

Permission error

Plugin unavailable

Analyzer unavailable

Scan in progress

Background update

No exceptions.

---

# 13. Keyboard Principles

Everything important should be reachable without a mouse.

Examples:

Ctrl+K — Search

Ctrl+Shift+P — Command Palette

Ctrl+R — Run Scan

Ctrl+F — Search within current workspace

Esc — Close inspector/dialog

Enter — Execute primary action

---

# 14. Accessibility

- Full keyboard navigation
- Screen reader labels
- High-contrast theme
- Focus indicators
- Minimum touch target of 44 px
- Color never used as the sole indicator of state

---

# 15. Navigation Philosophy

Sentinel is organized around developer goals, not implementation details.

Each workspace answers a specific question:

Home — What should I do today?

Projects — Help me understand this repository.

Analyze — What needs attention?

Fix — What can I safely improve?

Insights — How is quality changing?

Extensions — How do I extend Sentinel?

Settings — How should Sentinel behave?

Every future feature must fit naturally into one of these workspaces or it should be reconsidered.
