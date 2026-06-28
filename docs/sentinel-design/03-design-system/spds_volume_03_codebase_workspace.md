# Sentinel Product Design Specification (SPDS)

# Volume 3 — Codebase Workspace

**Version:** 1.0
**Status:** Approved
**Author:** Lead UI Designer / Principal Architect

---

## 1. Introduction & Philosophy

The **Codebase Workspace** is the foundational explorer interface of Sentinel. It is designed to answer the core developer question: **"Help me understand this codebase."**

Unlike traditional file managers or IDE trees that treat a repository as a flat hierarchy of directories and files, Sentinel views the codebase as a rich **Engineering Knowledge Graph**. The Codebase Workspace exposes this graph through five interchangeable, context-aware **Perspectives**.

### Core Pillars

1. **Cognitive Offloading:** Help the developer build a mental model of the codebase's modules, quality, risks, and structure in under 10 seconds.
2. **Context Preservation:** All navigation, dependency maps, and metrics share a unified viewport layout. Selection updates are routed directly to the global **Right Inspector** without context switching.
3. **No Editing (Read-Only Explorer):** Sentinel is not an IDE. It is an analyzer and knowledge viewer. Interactive elements focus on navigation, analysis, and execution triggers rather than code editing or file drag-and-drop.

---

## 2. Universal Workspace Layout

The Codebase Workspace operates within the three-column grid wrapper defined in [SPEC-004](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/08-frontend-spec/spec_004_screen_specifications.md):

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Global Toolbar (Active Project, Global Search, Run Scan Button)            │
├──────────────┬───────────────────────────────────────┬─────────────────────┤
│ Left Nav     │ Codebase Workspace Viewport           │ Right Inspector     │
│ - Home       │                                       │ (Folder, Module,    │
│ - Codebase   │ (7 Core Sections rendered according   │  or File details)   │
│ - Analyze    │  to the active Perspective lens)      │                     │
│ - Improve    │                                       │                     │
│ - Insights   │                                       │                     │
│ - Extensions │                                       │                     │
│ - Settings   │                                       │                     │
├──────────────┴───────────────────────────────────────┴─────────────────────┤
│ Status Bar (Background tasks, compiler status, active branch indicator)    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 5 Workspace Perspectives

Instead of routing to different pages, the user toggles the active **Perspective** at the top of the Codebase Workspace. Toggling a perspective changes the overlay visual properties, primary rendering metrics, and focus of the 7 core workspace sections.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Perspectives:  [📁 Structure]  [🏗 Architecture]  [📊 Quality]  [🔄 Git]  [⚡ Performance] │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 📁 Structure Perspective

- **Core Focus:** Physical organization of directories, modules, and files.
- **Visual Highlights:** Standard file/folder icons, basic file sizing, line counts.
- **Inspector Output:** Basic file metadata (size, language, primary functions).

### 3.2 🏗 Architecture Perspective

- **Core Focus:** Code module boundaries, dependency graphs, cyclic imports, and layer violations.
- **Visual Highlights:** Interactive nodes mapping C++ module declarations and import paths. Lines highlight coupling.
- **Inspector Output:** Import/export dependencies, risk coefficients, structural cyclic chains.

### 3.3 📊 Quality Perspective

- **Core Focus:** Technical debt hotspots, risk profiles, and commit readiness.
- **Visual Highlights:** Heatmap overlays (Red/Orange/Green) mapping issue densities onto directories and modules.
- **Inspector Output:** Code quality ratings, outstanding static analysis issues list, technical debt estimation.

### 3.4 🔄 Git Perspective

- **Core Focus:** Recent changes, active branch updates, and developer velocity.
- **Visual Highlights:** Diff/modification heat overlays on folders, showing active file churn.
- **Inspector Output:** Recent commits history, changed files delta, quality change indicators (`+2%` or `-3%`).

### 3.5 ⚡ Performance Perspective

- **Core Focus:** Compile-time bottlenecks, heavy include chains, and performance hotspots.
- **Visual Highlights:** Color gradient mapping compilation duration or header inclusion weight (e.g. tracking `#include` depth).
- **Inspector Output:** Include counts, compiler bottleneck details, optimization tips.

---

## 4. The 7 Core Workspace Sections

The workspace consists of 7 sections, laid out vertically in a clean, scrollable canvas.

### 4.1 Project Hero

Located at the top of the workspace. A large, high-density dashboard header.

- **Content Elements:**
  - Project Title & Domain Category (e.g., `Flight Controller` | `Embedded Firmware`).
  - Circular Quality Gauge (e.g., `96%` - Success styling).
  - Telemetry parameters:
    - Last Scan: `2 min ago`
    - Branch: `feature/memory`
    - Commit Status: `✓ Ready to Commit`
- **Actions:**
  - Primary CTA: `Open in IDE` (Launches IDE using local scheme handlers).
  - Secondary CTA: `Run Scan` (Triggers static analyses in background container).

### 4.2 Repository Overview

Horizontal row of cards containing high-level stats.

- **KPI Cards:**
  - **Files:** `2,843`
  - **Folders:** `176`
  - **Modules:** `42`
  - **Classes:** `931`
  - **Functions:** `13,212`
  - **Lines:** `2.4M`
- **Hover Micro-Interaction:** Hovering over a card triggers an explanation popover (e.g., "Modules represents distinct C++ library targets specified in CMakeLists.txt").

### 4.3 Module Explorer

A grid of Sentinel Module cards. This replaces traditional directory browsing with structural boundaries.

- **Interface Elements:**
  - Cards for modules (e.g., `Memory (91%)`, `Networking (97%)`, `Drivers (86%)`, `Parser (93%)`).
- **Interactive Flow:**
  - Clicking a module card expands the card into a scoped **Module View** overlay:
    - Lists related files (e.g., `28 files`).
    - Lists direct dependencies (e.g., `Memory`, `Socket`, `Logger`, `Thread`).
    - Shows outstanding issues count (e.g., `12 issues`).
    - Lists recent commits (e.g., `3 changes`).

### 4.4 Folder Tree

A git-style tree directory browser.

- **Configuration:**
  - Collapsed by default.
  - Interactive items: `src/`, `include/`, `drivers/`, `network/`, `tests/`.
- **Health Badges:**
  - Each directory and file displays an inline, color-coded health rating (e.g., `drivers/ [83%]`, `network/ [91%]`, `memory.cpp [91%]`).

### 4.5 Dependency Map

A visual graph mapping connections between codebase components.

- **Layout:**
  - Directed node graph (e.g., `Network ➔ Socket ➔ Logger ➔ Thread ➔ Memory`).
- **Interactive Flow:**
  - Clicking a node highlights its dependency chain, fades unrelated modules, and populates the Right Inspector with structural risk details.

### 4.6 Quality Heatmap

A grid of colored blocks representing physical directories, sized by LOC and colored by quality rating.

- **Layout:**
  - Treemap layout (similar to Disk Space analyzers).
  - Sizing represents file size/LOC.
  - Coloring matches health categories:
    - Green (>=90%)
    - Orange (70%-89%)
    - Red (<70%)

### 4.7 Recent Activity

Chronological feed detailing code changes integrated with Quality indicators.

- **Telemetry Entries:**
  - Node: `Yesterday` ➔ File: `memory.cpp` ➔ Quality Delta: `+2%` ➔ Message: `3 compiler warnings resolved`.

---

## 5. Right Inspector Integration

The Right Inspector is the universal detail panel. It dynamically adapts its layouts based on the active selection in the Codebase Workspace:

```text
┌──────────────────────────────────────────────────────────┐
│ Selected Object Type ➔ Rendered Inspector Tabs           │
├──────────────────────────────────────────────────────────┤
│ 📂 Folder            ➔ [Folder Info] [Quality] [History]  │
│                        [Files] [Issues] [Trend] [Actions]│
├──────────────────────────────────────────────────────────┤
│ 📦 Module            ➔ [Dependencies] [Risk]             │
│                        [History] [Coverage]              │
├──────────────────────────────────────────────────────────┤
│ 📄 File              ➔ [Size] [Quality] [Issues]         │
│                        [Functions] [Open IDE]            │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Micro-Interactions, Animation & Shortcuts

### Navigation & Input

- **Search (Ctrl+K):** Launches unified search overlays. Matches keywords against Project names, Folders, Modules, Files, C++ Classes, Functions, and static analyzer Issues.
- **Double Click:** Always triggers `Open` behavior (e.g., open a module view, open a file in the code viewer, or open in external IDE).
- **Right Click Context Menus:** Minimalist and non-disruptive:
  - _Project Context:_ `Run Scan`, `Export Report`, `Bookmark`, `Open IDE Settings`.
  - _Module Context:_ `Analyze Module`, `Export Graph`, `View Changelog`, `Dependency Analysis`.
  - _File Context:_ `Open Code Viewer`, `Run Analysis`, `Show History`, `Compare Snapshot`.

### Animation Timings

- **Module Expand/Collapse Transition:** `150ms` spring easing.
- **Dependency Highlight Glow:** `120ms` border/path fade.
- **Right Inspector Panel Transition:** `180ms` slide-in-fade.

### Key Bindings

- `Ctrl + O`: Open new repository directory.
- `Ctrl + Shift + F`: Search file titles.
- `Ctrl + L`: Locate symbol or function name.
- `Alt + Left`: Collapse current node.
- `Alt + Right`: Expand current node.

---

## 7. Tradeoffs & Extension Points

### Tradeoffs

1. **Interactive Graph rendering vs Performance:** Rendering large scale dependency maps in browser/Qt layers for codebases with >1,000 files can bottleneck memory and layout threads. **Resolution:** Graph rendering is constrained to Module level nodes (average 20-50 nodes). File-level dependencies are listed textually in the Right Inspector.
2. **Static Compilation Heuristics vs Recompiling:** Measuring build time bottlenecks (Performance Perspective) requires running complex builds. **Resolution:** Sentinel uses static heuristics (header file count, include depth, file sizes) to estimate compilation hot-spots without requiring constant project recompilation.
3. **Perspectives State Sync:** Keeping 5 perspectives synced with the currently selected file/folder requires high-efficiency React state management. **Resolution:** A global codebase context provider handles the selection state, so switching perspectives updates the visual overlays instantly without resetting the scroll position.

### Extension Points

1. **Custom Lenses:** Plugins can register new perspectives (e.g., `Compliance Perspective` mapping licenses, or `Security Perspective` tracking buffer overflow risks).
2. **IDE Protocols:** Scheme mappings for `Open in IDE` are customizable via Settings (e.g., VS Code, CLion, Xcode, QtCreator).
3. **Inspector Widgets:** Custom analyzer extensions can inject tabs or widgets into the Right Inspector for specific file or module types.
