# Sentinel Product Design Specification (SPDS)

# Volume 2 — Home Workspace

**Version:** 1.0
**Status:** Foundation
**Author:** Product Architect / Lead UX Designer

---

## 1. Purpose

The Home Workspace is the heart of Sentinel. It is the screen developers see first when they start their day, and the primary dashboard they return to throughout the day. It functions not as a generic dashboard, a static project explorer, or a simple diagnostic report, but as a **daily engineering command center**.

Its design must allow a developer to answer these five core questions in under **5 seconds**:

1. **Which project should I work on?** (Welcome CTA and Current Project Hero Card)
2. **Can I commit today?** (Commit Readiness Check and Health Metrics)
3. **What changed?** (Activity Timeline and Changed Files Count)
4. **What should I fix first?** (Today's Work prioritized tasks queue)
5. **Is everything healthy?** (Five-dimension Health score cards)

If a developer cannot answer all five of these questions within five seconds of landing on the Home Workspace, the screen has failed its primary design objective.

---

## 2. Emotional Goal

The UI layout, color balance, density, and animation speeds are configured to invoke a specific set of emotional responses in the developer:

- **Calm:** Clean spacing grids, high ratio of whitespace to content, no blinking indicators, and subdued warning labels.
- **Focused:** One main project highlight, and a single prioritized queue of actions. No multi-project overload.
- **In Control:** Offline-first verification, local scan controls, and direct human-actionable buttons.
- **Confident:** Clear explanation of scores, transparent reasoning, and safe, automated fixes with inline previews.

The workspace must never feel **overwhelming**, **stressful**, or **confused**.

---

## 3. Layout Grid

The Home Workspace is rendered within the universal three-column layout frame defined in Volume 1:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Global Toolbar                                                               │
├──────────────┬─────────────────────────────────────────────┬─────────────────┤
│ Navigation   │ Home Workspace Area                         │ Inspector       │
│ Sidebar      │ (Scrollable Center Pane)                    │ Panel           │
│              │                                             │ (Contextual     │
│              │                                             │  Details)       │
│              │                                             │                 │
├──────────────┴─────────────────────────────────────────────┴─────────────────┤
│ Status Bar / Footer                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Navigation Sidebar (Left):** Width: `240px`. Highlighting the `🏠 Home` icon.
- **Home Workspace Area (Center):** Width: Flex/Fluid. Max-width `1200px` for readability. Scrollable container.
- **Inspector Panel (Right):** Width: `360px`. Displays contextual tip, project config, or task info.
- **Status Bar (Bottom):** Height: `28px`. Inline status indicators.

---

## 4. The 7 Core Sections

The center pane of the Home Workspace is divided into exactly **seven sections**, arranged vertically on an 8-point spacing grid. No additional sections may be introduced.

### Section 1: Welcome Header

Positioned at the top-left of the workspace area. It must be compact and polite.

```text
Good Morning, Sanket 👋
Welcome back.

Last session: Yesterday at 7:42 PM
```

Directly adjacent to the header text is the primary CTA of the entire workspace:

- **Continue Working** (Large primary button, indigo background with cyber glow on hover). Clicking this action launches the workspace into the active file from the last session.

_Why?_ Developers should never start their day asking "Where did I leave off?". Sentinel remembers and provides a one-click resumption path.

### Section 2: Current Project Hero Card

A large, prominent hero container (`.sds-card`) highlighting the active codebase.

- **Title:** Name of the project (e.g., `Flight Controller`).
- **Quality Score Gauge:** Large numeric display (`96%`) colored Emerald Green (`--sds-success`).
- **Commit Readiness:** Checkmark icon with label `Ready to Commit: Yes` (or warning badge if blockers exist).
- **Branch Indicator:** `lucide/GitBranch` icon displaying the current active branch (e.g., `feature/memory`).
- **Last Scan:** Timestamp indicating how recently the local code was scanned (e.g., `2 min ago`).
- **Primary CTA Button:** `Continue →` (Ghost style button transitioning to border highlight on hover).

_Why only one?_ Multi-project dashboards dilute focus. A human can only work effectively on one project at a time.

### Section 3: Today's Focus Panel (The "Today" Productivity Panel)

Located in the center. This is a persistent productivity panel that transforms the Home Workspace from a reporting dashboard into an engineering execution center. It contains a list of high-priority tasks tailored to the developer's current local workspace.

```text
Today's Work

┌──────────────────────────────────────────────────────────────────────────────┐
│  Review Memory Issues                                       3 min  [ Review ]│
├──────────────────────────────────────────────────────────────────────────────┤
│  Apply Safe Fixes (5 Files Changed)                         20 sec [ Apply  ]│
├──────────────────────────────────────────────────────────────────────────────┤
│  Run Scan (Changed Files: 5)                                1 min  [ Scan   ]│
├──────────────────────────────────────────────────────────────────────────────┤
│  Review Performance Metrics                                 5 min  [ Review ]│
└──────────────────────────────────────────────────────────────────────────────┘
```

Each Task Card in this panel contains:

1. **Icon:** Matching the task category (e.g., `lucide/Memory` for memory issues, `lucide/Shield` for security).
2. **Title:** Short verb-based description (e.g., `Apply Safe Fixes`).
3. **Estimated Time:** Time investment expected (e.g., `20 sec`, `3 min`, `5 min`).
4. **Priority Tag:** Small status chip (High, Medium, Low).
5. **Safety Rating:** Star rating showing automation confidence (e.g., `Safe: ★★★★★`).
6. **Action Button:** Inline CTA (e.g., `[Apply]`, `[Review]`).

### Section 4: Project Health Metrics

A horizontal flex row of five health dimension cards, avoiding tabular layouts:

- **Quality:** `96%` (Green)
- **Performance:** `94%` (Green)
- **Memory:** `91%` (Green)
- **Security:** `100%` (Green)
- **Architecture:** `92%` (Green)

_Interactions:_

- **Hover:** Displays an overlay explaining how the score is calculated (e.g., "Memory score based on 2 lifetime memory leaks found in main loop").
- **Click:** Navigates directly to the **Insights** Workspace, focusing on that specific dimension's historical timeline.

### Section 5: Activity Timeline

A vertical timeline tracking incremental developer progress. It provides positive reinforcement:

- **Yesterday:** `Applied 12 Safe Fixes` $\rightarrow$ `Quality Score +2%` $\rightarrow$ `Memory Improved` $\rightarrow$ `Clang-Tidy Analyzer Plugin Updated`.

_Why?_ Standard dashboards only report errors, creating anxiety. Sentinel celebrates progress, creating a feeling of forward momentum.

### Section 6: Actionable Recommendations

Two column grid displaying system suggestions. Action triggers are prioritized over warnings:

- **Recommendation 1:** `Install IWYU (Include What You Use)` $\rightarrow$ Estimated Effort: `2 min` $\rightarrow$ Action: `[Install]`
- **Recommendation 2:** `Enable MISRA C++ Rules Profile` $\rightarrow$ Estimated Effort: `1 click` $\rightarrow$ Action: `[Enable]`

### Section 7: Recent Projects List

A clean, minimal list at the bottom of the workspace pane.

- `Flight Controller` | `95%` | `Yesterday`
- `Embedded SDK` | `91%` | `Today`
- `Motor Driver` | `99%` | `2 days ago`

---

## 5. Right Inspector Panel States

The Home Inspector panel displays contextual data based on what is selected in the center pane:

### State A: Nothing Selected (Default View)

- **Tip of the Day:** Keyboard shortcut hints (e.g., "Press `Ctrl+K` to search anything instantly").
- **Release Notes:** Highlights of the latest installed Sentinel core features.
- **Plugin Statuses:** Quick checklist of active local analyzers (e.g., `Clang-Tidy: Active`, `Cppcheck: Active`).
- **Offline Mode Indicator:** Confirms that data is computed entirely locally: `Offline: ✓`.

### State B: Project Selected

- **Project Details:** Local repository path, active branch name, and commit hash.
- **Scan History:** Sparkline chart showing quality trend over the last 10 commits.
- **Active Rules Profile:** Display of active profile (e.g., `Strict Safety Profile`) with edit link.

### State C: Task Selected

- **Description:** Clear explanation of what the task accomplishes.
- **Estimated Effort:** Broken down by indexing and repair times.
- **Safety Audit:** Lists potential risks (e.g., "Modifies header files; compilation check will run automatically").
- **Dependencies:** List of files that will be touched by applying the task.

---

## 6. Shell & Navigation Bindings

### The Global Toolbar

The top bar must be static and identical across all views:

- **Logo:** Sentinel line-art brand icon.
- **Project Switcher:** Dropdown list of folders.
- **Search Input:** Triggers the search modal (`Ctrl+K`).
- **Run Scan Dropdown Button:** Triggers scanning. Clicking the dropdown arrow reveals:
  - `Scan Project` (Full workspace)
  - `Scan Changed Files` (Git diff only)
  - `Quick Scan` (Fast syntax checking)
  - `Cancel Scan` (Disabled unless scanning)
  - `Recent Scans` (Access scan logs)

### Navigation Sidebar

The left-aligned navigation remains constant:

- `🏠 Home` (Active)
- `📁 Projects`
- `🔎 Analyze`
- `🛠 Fix`
- `📈 Insights`
- `🧩 Extensions`
- `⚙ Settings`

### Status Bar / Footer

- **Left Section:** Active branch (e.g., `branch: feature/memory`).
- **Middle Section:** Analyzer status (e.g., `Analyzer: LLVM 21` | `Last Scan: 2 min ago`).
- **Right Section:** System status (e.g., `Offline: ✓` | `Pre-commit: Configured`).

---

## 7. Dynamic Shell States

### Empty State (Fresh Installation)

Displayed when Sentinel is opened for the first time without a mapped project:

```text
Welcome to Sentinel

Open your first repository to begin.
[ Open Local Folder ]
[ Clone Repository ]
[ Import Project ]
```

### Loading State (Incremental Verification)

Displayed during indexing and background scanning. Never display a generic rotating spinner. Use step-by-step validation:

```text
Loading Workspace ... ✓
Verifying Git Status ... ✓
Initializing Plugins ... ✓
Running Quality Analyzer ... (92% completed)
```

---

## 8. Animations & Micro-Interactions

To maintain a premium, responsive feel, all transitions are capped at a maximum duration of **200ms**:

- **Workspace Transitions:** Fade-in (`opacity: 0` to `opacity: 1`) over `150ms` using `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Inspector Panel:** Slide-in from the right edge (`transform: translateX(100%)` to `transform: translateX(0)`) over `200ms`.
- **Hover states:** Micro-elevation changes (card scale increased by `1.01x` or border glow using `--sds-primary`) must transition over `150ms`.

---

## 9. Keyboard Shortcuts

The Home Workspace supports full keyboard interaction:

- `Ctrl+K` / `Cmd+K` $\rightarrow$ Focus Global Search / Command Palette.
- `Ctrl+R` $\rightarrow$ Trigger Default Project Scan.
- `Ctrl+O` $\rightarrow$ Trigger File/Folder Picker to open project.
- `Escape` $\rightarrow$ Dismiss current modal or close the Right Inspector Panel.
- `Alt + 1` $\rightarrow$ Navigate to Home.
- `Alt + 2` $\rightarrow$ Navigate to Projects.
- `Alt + 3` $\rightarrow$ Navigate to Analyze.

---

## 10. Performance Budget

To meet the Developer OS standard, the Home Workspace must load in under **300ms** after application startup:

- **Initial Render:** Local SQLite project metadata cached in memory to paint the UI skeleton immediately.
- **Incremental Parsing:** Heavy file trees and compiler database models are lazy-loaded in worker threads.
- **Zero Main Thread Blocking:** The UI thread must remain active (60fps) even during intensive background compiles and static analysis runs.
