# Sentinel Product Roadmap & Sprints

**Title:** Product Roadmap & Sprints (formerly after_spec_004)
**Version:** 1.0
**Status:** Approved
**Author:** Lead PM / CTO

---

## 1. Roadmap Overview

Sentinel is built as an **engineering knowledge platform**, not just a collection of static analysis wrappers. To ensure design decisions are validated early by developers and architects, the roadmap is divided into ten distinct sequential phases.

---

## 2. Milestone Sprints

### Phase 1: Product Design & Clickable Prototype (Weeks 1-2)

- **Goal:** Validate screen flow, layouts, and navigation without writing backend code.
- **Deliverables:**
  - Figma component system (SDS).
  - High-fidelity click-through prototype.
  - User journeys validation (Open project, run scan, preview fix, install plugin).
  - Sign-off from 10-15 native developers.

### Phase 2: Core Domain Model Design (Weeks 2-3)

- **Goal:** Define compile-time types, namespaces, and standard objects in C++20.
- **Deliverables:**
  - Struct declarations for Workspace, Project, Scan, Issue, Rule, and QualitySnapshot.
  - In-process event loop and dispatcher architecture.

### Phase 3: Public API Design (Week 3)

- **Goal:** Establish standard contracts for all frontend clients.
- **Deliverables:**
  - JSON-RPC 2.0 schemas over local IPC boundaries.
  - Client endpoints: `OpenProject()`, `RunScan()`, `GetIssues()`, `ApplyFix()`.

### Phase 4: Frontend Component Library (Weeks 3-4)

- **Goal:** Construct UI building blocks using the React design system.
- **Deliverables:**
  - Reusable widgets: `IssueCard`, `QualityCard`, `DiffViewer`, `Inspector`.

### Phase 5: Fake Data Backend (Week 4)

- **Goal:** Create a mock service provider yielding static objects.
- **Deliverables:**
  - Fake Project structures, simulated scans, and test reports database.

### Phase 6: Desktop MVP (Weeks 4-5)

- **Goal:** Assemble the Qt shell and React application.
- **Deliverables:**
  - Functional front-end loading and displaying fake project metrics.
  - Working inspector, workspace tree navigation, and mock autofix previews.

### Phase 7: Real Quality Engine (Weeks 5-6)

- **Goal:** Swap out simulated data with real index calculations.
- **Deliverables:**
  - Database adapters, cache indexing, event dispatchers.

### Phase 8: Plugin SDK & Analyzer Providers (Week 6)

- **Goal:** Wrap static analyzers in isolated plugins.
- **Deliverables:**
  - `IAnalyzer` interface bindings, dynamic library loading wrappers.

### Phase 9: LLVM & Clang-Tidy Integration (Weeks 6-7)

- **Goal:** Read live compiler setups and compilation databases.
- **Deliverables:**
  - Live parser for `compile_commands.json` and clang-tidy scanner executor.

### Phase 10: VS Code Extension & CLI Wrapper (Week 8)

- **Goal:** Ship alternative interface clients.
- **Deliverables:**
  - VS Code json-rpc client extension and CLI reporting tools.
