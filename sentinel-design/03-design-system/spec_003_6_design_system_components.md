# SPEC-003.6: Design System Component Catalog

**Document ID:** SPEC-003.6
**Title:** Sentinel Design System (SDS) Component Specifications
**Version:** 1.0
**Status:** Approved

---

## 1. Objectives & Guidelines

This document serves as the formal specification for all core components of the Sentinel Design System (SDS). All layouts, workspaces, and pages must be assembled using these modular building blocks.

As per the **Product Philosophy (SPDS-000)**:

- Components must reduce developer cognitive load (Clarity).
- Action triggers are prioritized over simple text dumps (Confidence).
- Theme uniformity must be preserved via CSS design tokens.
- Interactive states (hover, focus, disabled) must follow standard micro-animations.

---

## 2. Design Tokens Mapping

All CSS properties in SDS components utilize the token variables defined in `index.css`:

```css
/* Color Tokens */
--sds-bg;             /* Core app background */
--sds-surface;        /* Card and container surface */
--sds-surface-hover;  /* Highlight state for interactive cards */
--sds-border;         /* Subdued dividers and outlines */
--sds-primary;        /* Focus and brand accents */

/* Semantic Colors */
--sds-success;        /* Green (Good / Clean) */
--sds-warning;        /* Orange (Attention) */
--sds-danger;         /* Red (Blocking) */
--sds-info;           /* Blue (Context / Info) */

/* Typography */
--sds-font-sans;      /* 'Outfit', system-sans-serif */
--sds-font-mono;      /* 'JetBrains Mono', code blocks */
```

---

## 3. Component Catalog

### 3.1 Project Card

Used in the **Home** (Pinned/Recent projects) and **Projects** views.

- **Layout Structure:**
  - Standard card border (`--sds-border`), `--sds-radius-lg` (12px radius), `--sds-space-24` padding.
  - Header: Project Name (H2 size), Branch indicator (`lucide/GitBranch`), Last scan time (Caption size).
  - Body: Horizontal flex container displaying:
    - **Quality Score Gauge:** Large numeric display (e.g., `95%`) with color-coded label.
    - **Key Metrics:** File count, open tasks/blockers.
  - Footer: Primary action button ("Continue Working") and optional secondary options.
- **States:**
  - _Default:_ Dark border and clean spacing.
  - _Hover:_ Background transitions to `--sds-surface-hover` and border to `--sds-border-hover` over 150ms.
  - _Active:_ Slight inset shadow.
- **JSON-RPC API Bindings:**
  - Consumes `Project` struct: `{ id, name, branch, qualityScore, status, lastScanTime }`

---

### 3.2 Quality Card / Gauge

Circular percentage or gauge indicator representing overall or category-specific scores.

- **Layout Structure:**
  - Standard container displaying a circular SVG path representation.
  - Value text positioned precisely at the center (e.g., `95%`).
  - Semantic colors applied to the stroke:
    - `>= 90%` $\rightarrow$ `--sds-success` (Green)
    - `70% - 89%` $\rightarrow$ `--sds-warning` (Orange)
    - `< 70%` $\rightarrow$ `--sds-danger` (Red)
- **States:**
  - _Hover:_ Displays details tooltip showing categories breakdown (Performance, Memory, Security, Style).
- **JSON-RPC API Bindings:**
  - Triggered via `GetProjectSummary(ProjectId)`.

---

### 3.3 Task / Focus Card

Used to present specific actionable items (e.g. "Fix 2 Blocking Issues" in Home Today's Focus).

- **Layout Structure:**
  - Border: 1px outline (`--sds-border`) with a thick 4px left-border accent matching the issue severity category:
    - Blocker / Danger $\rightarrow$ `--sds-danger` (Red)
    - Warning / Suggestion $\rightarrow$ `--sds-warning` (Orange)
    - Info / Safe Fix $\rightarrow$ `--sds-info` (Blue)
  - Layout: Flex row. Left details (Title, target file, estimated fix duration). Right action button ("Apply Fix").
- **States:**
  - _Hover:_ Background transitions to `--sds-surface-hover`.
  - _Applying:_ Action button disables and displays a mini spinner; status transitions to active.
- **JSON-RPC API Bindings:**
  - Consumes `Task` or `Issue` struct.
  - Action trigger: `ApplyAutofix(IssueId)`.

---

### 3.4 Recommendation Card

Subtle task-oriented suggestions for clean code practices.

- **Layout Structure:**
  - Compact container, `--sds-space-12` padding.
  - Bulleted or flat layout with a primary title (e.g., "Apply Formatting") and execution effort estimation (e.g., "20 sec").
- **States:**
  - _Hover:_ Visual border glow using the primary brand color.
- **JSON-RPC API Bindings:**
  - Context bound to `GetRecommendedTasks()`.

---

### 3.5 Timeline / Activity Card

Used on the **Home** and **Insights** views to track historical updates.

- **Layout Structure:**
  - Vertical layout with a thin timeline thread (`--sds-border`).
  - Nodes showing commit events:
    - Node icon represents the status (Success check, warning mark).
    - Details: Commit description, quality delta indicator (e.g., `+2%` green, or `-1%` red).
- **States:**
  - _Hover:_ Node scale expands slightly, showing full commit hash and author details.
- **JSON-RPC API Bindings:**
  - Bound to `GetHistoricalSnapshots()`.

---

### 3.6 Inspector Panel

The right-hand panel (`360px` width) displaying contextual data for the selected entity.

- **Layout Structure:**
  - Fixed sidebar with header, content body, and action footer.
  - Responsive content modules matching the active object type (dynamic registration).
- **Dynamic Renderers:**
  - **Issue Detail:** Displays Category, Severity badge, detailed explanation (Why this matters), compiler rules references, and inline comparative diff viewer.
  - **Project Detail:** Quality stats gauges, plugin versions catalog, configuration profiles selector.
  - **File/Folder Detail:** LOC, issue densities, file modification summary.
- **States:**
  - _Transition:_ Slides/fades in from the right edge over 250ms when an item is selected.
  - _Loading:_ Renders skeleton lines mimicking text blocks.
- **JSON-RPC API Bindings:**
  - Populates via selected entity schemas.

---

### 3.7 Global Toolbar

Top-aligned banner (`64px` height).

- **Layout Structure:**
  - Contains Sentinel brand icon.
  - Active Project Selector (custom selector dropdown).
  - Search trigger box ("Search symbols, files, issues... Ctrl+K").
  - Run Scan Button: Shows an integrated circle progress loader during active scans.
- **States:**
  - _Scanning:_ The "Run Scan" button switches to active mode, disabling secondary inputs and animating scan progress.
- **JSON-RPC API Bindings:**
  - Switcher: `GetProjects()`.
  - Trigger: `RunScan()`.

---

### 3.8 Navigation Sidebar

Left-aligned vertical menu (Width: `240px` expanded, `72px` collapsed).

- **Layout Structure:**
  - Lists the 7 workspace icons (Lucide line-art icons) with text labels.
  - Dynamic count badges positioned beside relevant labels (e.g., unresolved issue count next to "Analyze", safe fixes next to "Fix").
  - Collapse button at the bottom.
- **States:**
  - _Active:_ Text/icon colored with primary brand color (`--sds-primary`) with subtle background pill.
- **JSON-RPC API Bindings:**
  - Counts synchronized on scan state completion event dispatch.

---

### 3.9 Buttons & Status Chips

Atomic actions and indicator elements.

- **Buttons Specifications:**
  - **Primary:** Filled (`--sds-primary`), white text. Cyber glow hover shadow.
  - **Secondary:** Outlined, `--sds-surface` background, gray text.
  - **Ghost:** Borderless, background turns to `--sds-surface-hover` on hover.
  - **Danger:** Red background (`--sds-danger-bg`), red text. Destructive actions.
- **Status Chips Specifications:**
  - Small pill-shaped tags showing severities (Critical, High, Medium, Low) or task categories.
  - Formatted exclusively with semantic tokens (Green, Blue, Orange, Red).

---

## 4. Keyboard Navigation & Accessibility Rules

- **Focus Outlines:** Focused interactive elements must display a distinct `--sds-primary` glow outline.
- **Global Keys:**
  - `Ctrl + K` $\rightarrow$ Launch Search Modal
  - `Ctrl + Shift + P` $\rightarrow$ Open Command Palette
  - `Ctrl + R` $\rightarrow$ Trigger Scan
  - `Escape` $\rightarrow$ Close Inspector or active modal dialogs
  - `Enter` $\rightarrow$ Execute primary CTA action
- **Tab Order:** Navigation sidebar $\rightarrow$ Toolbar Project Switcher $\rightarrow$ Workspace content panel $\rightarrow$ Right Inspector. Focus must never get locked within an element.
