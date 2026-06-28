# Sentinel Product Roadmap & Sprints

**Version:** 2.0
**Status:** Approved
**Author:** Product Director / CTO

---

## 1. Roadmap Strategy: Maturity Levels

Sentinel is built as an **Engineering Experience Platform (EEP)** rather than a single-client desktop tool. To reflect this, our roadmap is structured around **Product Maturity Levels** instead of raw screen implementations:

- **Level 0 — Product Foundation (Completed):** Vision, Object Model, design system, interactive desktop prototype, mock client.
- **Level 1 — Sentinel Core (Active Sprint):** Git tracking, SQLite local persistence, codebase dashboard, workspaces.
- **Level 2 — Analyzer Platform:** compilation database loader (`compile_commands.json`), Plugin SDK, clang-tidy/cppcheck providers.
- **Level 3 — Developer Workflow:** Investigation dashboard, commit helper, verification build runner, rollback.
- **Level 4 — Quality Platform:** Module health scorecards, dependency graph, release readiness checks.
- **Level 5 — Team Features:** Shared profiles, PR summaries, CI integrations.
- **Level 6 — Enterprise:** Org compliance rule packs, audit log histories, role access permissions.

For the full detailed blueprints, indexes, and structures, refer to the [Sentinel Design Bible](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/sentinel-design-bible.md).

---

## 2. Engineering Execution Sequence

All core platform items are built in the following order to ensure stability and clean boundaries:

```text
1. Repository Initialization ✔
2. Dev Environment Config (Docker, Devcontainer) ✔
3. Build System (CMake setup) ✔
4. Design System Tokens (SDS) ✔
5. Pure C++ Domain Object Model ✔
6. In-Process Event Bus dispatcher ✔
7. Public APIs JSON-RPC schema contracts ✔
8. Headless Fake Data Client service ✔
9. Desktop Qt Window Shell (QWebEngineView container) ✔
10. Global Shell Navigation layout ✔
11. Local mock data payload generators ✔
12. Shared UI Component library (Sidebar, Inspector, etc.) ✔
13. Home Workspace View (Today's Focus, Health metrics) ✔
14. Codebase Workspace View (Module Dependency tree) ✔
15. Unified Issues Queue & Filter view ✔
16. Universal Inspector Sidebar (Contextual information drawer) ✔
17. Settings & Configuration interfaces (Profile selector) ✔
18. SQLite Local Database persistence (Phase 7 - Active)
19. Dynamic analyzer plugin loading SDK (Phase 8)
20. Compilation database support (`compile_commands.json` parser)
21. Clang-Tidy provider plugin (Phase 9)
22. Cppcheck provider plugin (Phase 8)
23. Dynamic scanning event subscriber loop
24. Inline code diff visual execution
25. Git commit assistant & staging integrations
26. Custom Quality report exports (SARIF, HTML, JSON)
27. Rule profile sharing packages (JSON import/export)
28. Headless CLI Wrapper reporting tool
29. VS Code client extension wrapper
30. Deployment pipeline builder (AppImage)
```

---

## 3. Current Sprints (Level 1)

### Sprint 1.1: Local Database & Caching (Current)

- **Goal:** Add persistence to the C++ headless core.
- **Tasks:**
  - Initialize SQLite schema representing projects, history, and scanning snapshots.
  - Implement cached indexing of symbols and issues.
  - Write event subscribers to persist scans as they occur.

### Sprint 1.2: Git Workspace Tracking

- **Goal:** Detect Git changes and identify scopes for scan execution.
- **Tasks:**
  - Query git status from core service.
  - Map altered files to projects and modules in the active workspace view.

---

## 4. Milestone Gates & Verification

Each major release level is subjected to human-centered testing:

- **Alpha Gate:** Run real scanning on live repositories, verifying clang-tidy outputs are accurately represented as core objects in under 5 seconds.
- **Beta Gate:** Daily dogfooding by 10-15 native developers, checking git flow and commit assist pipelines.
