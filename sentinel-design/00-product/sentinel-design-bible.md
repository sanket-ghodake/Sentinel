# Sentinel Design Bible

**Version:** 1.0
**Status:** Approved
**Author:** Product Director / Lead Architect

---

## Part I — Executive Summary: The Engineering Experience Platform (EEP)

Sentinel is not just a desktop application. It is an **Engineering Experience Platform**.

The desktop application is simply the **first client** of a unified, headless architecture. Every frontend interface (CLI, VS Code extension, CI/CD gates, dashboard) communicates with a core Knowledge Engine through a standardized, headless local API.

This design bible is the complete blueprint for the product, organizing the entire scope of Sentinel into structured volumes, roadmap phases, maturity levels, and validation loops.

```text
                  ┌───────────────────────────────────┐
                  │          USER INTERFACES          │
                  │  CLI  │  VS Code  │ Desktop │ CI  │
                  └─────────────────┬─────────────────┘
                                    │ Local JSON-RPC
                  ┌─────────────────▼─────────────────┐
                  │         KNOWLEDGE ENGINE          │
                  │  Objects │ Quality │ Events │ DB  │
                  └─────────────────┬─────────────────┘
                                    │ Plugin API
                  ┌─────────────────▼─────────────────┐
                  │         ANALYZER PLUGINS          │
                  │   Clang-Tidy  │  Cppcheck  │  IWYU│
                  └───────────────────────────────────┘
```

---

## Part II — The Blueprint Index

To keep implementation organized and modular, all specifications, designs, and developer handbooks are grouped into the following volumes:

### PART I — PRODUCT

- **Volume 000: Product Philosophy** — Core vision and platform-centric values. (See: [spec_001_product_vision.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/spec_001_product_vision.md))
- **Volume 001: Product Architecture** — Modular monolith architecture, headless designs, client separation. (See: [product-architecture.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/09-engineering-rfcs/product-architecture.md))
- **Volume 002: User Personas** — Embedded, aerospace, robotics, native HPC developers.
- **Volume 003: Design Principles** — Restrained colors, calm typography, progressive disclosure, 5-second rule. (See: [spec_003_design_language.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/03-design-system/spec_003_design_language.md))
- **Volume 004: Navigation System** — Fixed global navigation panel, context retention, drawer inspector. (See: [spds_volume_1_product_overview_and_navigation.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/spds_volume_1_product_overview_and_navigation.md))
- **Volume 005: Information Architecture** — Structural maps of projects, issues, trends, profiles. (See: [spec_002_product_scope_ia.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/02-information-architecture/spec_002_product_scope_ia.md))
- **Volume 006: Object Model** — Domain structures (Project, Issue, Task, Action, Quality Snapshot). (See: [object-model.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/object-model.md))
- **Volume 007: User Journeys** — Scenarios: First-run onboarding, scan and review, batch autofixing.

### PART II — DESIGN SYSTEM

- **Volume 100: Design Tokens** — JSON tokens for layouts, colors, sizing.
- **Volume 101: Colors** — High contrast semantic greens/reds, dark-mode palettes, glassmorphism.
- **Volume 102: Typography** — Interface font stacks, mono code font sizing, readability guidelines.
- **Volume 103: Spacing** — Consistent spacing grid rules (4px, 8px, 12px, 16px, 24px, 32px).
- **Volume 104: Grid** — Workspace dashboard cards positioning, layouts, responsive parameters.
- **Volume 105: Icons** — Icon selection, sizes, colors representing severities.
- **Volume 106: Motion** — Transition timings, scan progress sliders, drawer opening animations.
- **Volume 107: Elevation** — Shadows, borders, z-index layering rules.
- **Volume 108: Themes** — Light/Dark theme configuration, synchronization.
- **Volume 109: Accessibility** — WAI-ARIA roles, focus styles, keyboard navigation.

### PART III — COMPONENT LIBRARY

- **Volume 200: Buttons** — Secondary, primary, success, hazard buttons.
- **Volume 201: Inputs** — Search bars, filter selects, toggle switches.
- **Volume 202: Cards** — Overview metric blocks, project selection tiles.
- **Volume 203: Tables** — Unified issue queue tables.
- **Volume 204: Tree View** — Codebase file explorer component.
- **Volume 205: Inspector** — Drawer inspector detailing rules, issues, and objects.
- **Volume 206: Sidebar** — Collapsible primary navigation panel.
- **Volume 207: Toolbar** — Top panel featuring project indicators and scanning control.
- **Volume 208: Status Bar** — Bottom execution state bar.
- **Volume 209: Search** — Global context-aware search engine UI.
- **Volume 210: Command Palette** — Ctrl+Shift+P hotkey action picker.
- **Volume 211: Context Menu** — Right-click issue action triggers.
- **Volume 212: Diff Viewer** — Inline code change viewer.
- **Volume 213: Code Viewer** — Code view panel supporting syntax highlighting.
- **Volume 214: Charts** — SVGs for quality score graphs over historical commits.
- **Volume 215: Dependency Graph** — Visual architectural maps.
- **Volume 216: Timeline** — Historical activity track logs.
- **Volume 217: Toasts** — Dynamic execution state notifications.
- **Volume 218: Dialogs** — Safe/unsafe confirmation popups.
- **Volume 219: Wizards** — First-run folder selection step guides.

### PART IV — WORKSPACES

- **Volume 300: Home** — Welcome center, recent items, recommended tasks. (See: [spds_volume_2_home_workspace.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/spds_volume_2_home_workspace.md))
- **Volume 301: Codebase** — Code explorer, module architecture, symbol structures. (See: [spds_volume_03_codebase_workspace.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/03-design-system/spds_volume_03_codebase_workspace.md))
- **Volume 302: Analyze** — Unified issues list, severity filter rules. (See: [spds_volume_4_analyze_workspace.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/spds_volume_4_analyze_workspace.md))
- **Volume 303: Investigation** — Interactive exploration of deep bugs, call stacks. (See: [spds_volume_4_5_investigation_mode.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/00-product/spds_volume_4_5_investigation_mode.md))
- **Volume 304: Plan** — Grouped improvements to implement.
- **Volume 305: Execute** — Autofix deployment workflows.
- **Volume 306: Verify** — Local build trigger testing after improvements.
- **Volume 307: Insights** — Metric trends and module health reports.
- **Volume 308: Extensions** — Analyzer plugin configuration controls.
- **Volume 309: Settings** — General and organizational rulesets options.

### PART V — ENTERPRISE

- **Volume 400: Organization** — Multi-user config and profile hierarchy rules.
- **Volume 401: Rule Packs** — Company-wide custom rule specifications.
- **Volume 402: Compliance** — Rules verifying MISRA, AUTOSAR, CERT C/C++.
- **Volume 403: Review** — Pull request and merge verification workflows.
- **Volume 404: Reports** — Compliance audit exports (PDF, HTML, JSON).
- **Volume 405: Release Readiness** — Quality score release validation gates.
- **Volume 406: Audit** — Full action history tracking database rules.
- **Volume 407: Teams** — Collaborative progress graphs and workspace assignments.

### PART VI — ENGINEERING

- **Volume 500: API Design** — Local named pipes JSON-RPC 2.0 signatures.
- **Volume 501: Event Model** — Asynchronous event dispatch schema. (See: [rfc-008-event-bus-proposal.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/09-engineering-rfcs/rfc-008-event-bus-proposal.md))
- **Volume 502: Plugin SDK** — Binary dynamic-library analyzer API definitions.
- **Volume 503: IPC** — Bidirectional bridge details (Qt-React JSON-RPC).
- **Volume 504: Storage** — Local file system caching specifications.
- **Volume 505: SQLite Schema** — Persistence details for trends and rule parameters.
- **Volume 506: Cache** — Diagnostic results indexing rules.
- **Volume 507: Background Workers** — Scan queues thread pools design.
- **Volume 508: Security** — Secret screening and SQL injection prevention principles.
- **Volume 509: Logging** — Console diagnostic print formats.
- **Volume 510: Telemetry** — Opt-in usage logging (strictly transparent).
- **Volume 511: Packaging** — AppImage, Flatpak, and standalone installers.

### PART VII — FRONTEND

- **Volume 600: React Architecture** — Folder designs, React routing, structure rules.
- **Volume 601: Qt Integration** — Host widget wrapping design details.
- **Volume 602: State Management** — Local contexts, selections, events hook.
- **Volume 603: Routing** — Sub-workspace panels routing.
- **Volume 604: Data Fetching** — JSON-RPC caller client.
- **Volume 605: Error Handling** — Diagnostic boundaries UI.
- **Volume 606: Theme Engine** — Real-time CSS custom property swaps.
- **Volume 607: Keyboard Shortcuts** — Global and workspace hotkey registrations.
- **Volume 608: Accessibility** — Contrast, text-only configurations.
- **Volume 609: Performance** — Large DOM virtualized issue lists.

### PART VIII — QUALITY

- **Volume 700: Testing Strategy** — C++ and React unit test coverages.
- **Volume 701: UI Testing** — Headless React Component testing.
- **Volume 702: Performance Testing** — Rendering tests with 10k issues.
- **Volume 703: Security Testing** — Database sanitization testing scripts.
- **Volume 704: Plugin Testing** — Analyzer emulator validation frameworks.
- **Volume 705: Release Checklist** — QA validation checks.

### PART IX — OPEN SOURCE

- **Volume 800: Repository Standards** — Lint, format, commit message specifications. (See: [rfc-002-engineering-standards.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/09-engineering-rfcs/rfc-002-engineering-standards.md))
- **Volume 801: Contributor Guide** — Dev environment onboarding guide. (See: [rfc-003-engineering-handbook.md](file:///home/sanket/Desktop/Sanket/Sentinel/sentinel-design/09-engineering-rfcs/rfc-003-engineering-handbook.md))
- **Volume 802: RFC Process** — Proposing and passing product architectural updates.
- **Volume 803: Governance** — Decision-making processes for rule additions.
- **Volume 804: Documentation** — API website generation pipelines.
- **Volume 805: Release Process** — Distribution pipeline.
- **Volume 806: Roadmap** — Public-facing feature pipeline.

---

## Part III — Product Maturity Roadmap

Rather than planning in loose versions, Sentinel tracks progress using six logical **Maturity Levels** representing integration readiness and deployment capabilities:

### Level 0 — Product Foundation (Completed)

- **Goal:** Make the product feel real, validate design systems.
- **Deliverables:**
  - Unified Product Philosophy & Vision.
  - C++ Core Object model defined.
  - Sentinel Design System (SDS) tokens.
  - Interactive desktop prototype (Fake data client, React UI).
  - No analyzer integration.

### Level 1 — Sentinel Core (Under Active Development)

- **Goal:** Working local desktop application utilizing actual filesystems.
- **Deliverables:**
  - Git repository tracking and indexing detection.
  - Core Workspace, Codebase, and Home views fully wired.
  - SQLite caching database.
  - Settings configuration panels.
  - Mock analysis engine runner.

### Level 2 — Analyzer Platform

- **Goal:** True local code analysis execution.
- **Deliverables:**
  - Compilation database support (`compile_commands.json` parser).
  - Analyzer Plugin SDK (dynamic loading of `.so`/`.dll`).
  - Integrations for `clang-tidy`, `Cppcheck`, and `IWYU`.

### Level 3 — Developer Workflow

- **Goal:** High-velocity local scan-to-fix experience.
- **Deliverables:**
  - Advanced Investigation mode dashboard.
  - Commit assistance & Git staging tool.
  - Verification compile execution inside container context.
  - Safe rollback for applied improvements.

### Level 4 — Quality Platform

- **Goal:** Actionable project insights.
- **Deliverables:**
  - Quality score indicators & module-level health trends.
  - Architectural dependency graphs visualization.
  - Technical debt calculator.
  - Release readiness compliance checkers.

### Level 5 — Team Features

- **Goal:** Small-team scaling.
  - Shared repository rule profiles.
  - Export/import profile settings.
  - CI/CD summary reporting tool integrations.

### Level 6 — Enterprise

- **Goal:** Full corporate governance & safety compliance.
  - Organizational policies, strict compliance packs.
  - Role-based access permissions, audit logs.
  - Multi-repository code health comparison panels.

---

## Part IV — Engineering Roadmap

All core components are implemented in the following strict order to avoid rework and preserve architectural sanity:

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
18. SQLite Local Database persistence (Phase 7 - Next Step)
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

## Part V — Repository Roadmap

To keep package boundaries clean and avoid circular dependencies, the Sentinel project separates codebases into focused repositories, which may later be unified into a structured monorepo:

- `sentinel-design` — Product specs, Figma links, design tokens, and mock HTML prototypes. (Current workspace)
- `sentinel-core` — Headless C++ Knowledge Engine, SQLite storage layer, and IPC Named Pipes.
- `sentinel-desktop` — Desktop interface client wrapping Qt and React.
- `sentinel-plugins` — Extensible analyzer wrappers (`clang-tidy`, `cppcheck`, `iwyu`).
- `sentinel-docs` — Website, RFCs, and API documentation templates.
- `sentinel-samples` — Test compilation workspaces and reference plugins.

---

## Part VI — User Validation Strategy

To prevent design echo chambers, Sentinel maintains a feedback gate at every major milestone:

1. **Post-Prototype (Completed):** 10-15 native developers complete mock scans, verifying layout predictability and the "5-second rule" before shipping.
2. **Post-Analyzer Integration:** Developers run local live scans. We measure time-to-finding and the clarity of raw output translation.
3. **Post-Autofix Implementation:** Testing confidence levels of applied fixes, ensuring that the diff preview matches expectation and build verification passes.
4. **v1.0 Release Candidate:** Testing across varied toolchains (embedded developers vs. backend server developers) to optimize performance and ruleset boundaries.
