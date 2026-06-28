# RFC 003: Sentinel Engineering Handbook

**Document ID:** RFC-003
**Title:** Sentinel Engineering Handbook
**Version:** 1.0
**Status:** Approved
**Author:** Principal Architect / CTO

---

## Introduction

The _Sentinel Engineering Handbook_ serves as the definitive reference for the design, architecture, implementation, and governance of the Sentinel platform. All software engineers—both human contributors and AI agents—must adhere to the guidelines and specifications contained herein.

---

## Chapter 1: Product Principles

Every feature in Sentinel must satisfy these six foundational product principles:

1. **Developer First:** Prioritize developer cognitive load over all else. The product must make decisions easier, not present a wall of raw diagnostics.
2. **Offline First:** Sentinel must operate completely offline. There are no mandatory cloud logins, cloud dependencies, or telemetry requirements. All data stays local.
3. **Plugin First:** Every analyzer is a plugin. Core logic must never be tightly coupled to specific analyzers (e.g., clang-tidy or Cppcheck).
4. **API First:** Desktop shells, CLI, IDE extensions, and CI pipelines must interact with the Sentinel Core via the exact same public API interfaces.
5. **Explain Before Configure:** Do not expose complex configuration options before explaining the issue, its impact, its solution, and our confidence in it.
6. **Object Based:** The product is built around concrete engineering domain objects, not static UI screens. Every user action operates on these objects.

---

## Chapter 2: Engineering Principles

Sentinel is built to be a reliable native developer tool for the next decade.

- **Simplicity and modularity** must be maintained at all levels of development.
- **Optimize for Reading:** Code is read far more often than it is written. Optimize for readability, debugging, and clean architecture rather than speed of execution of the coding task itself.
- **Host Cleanliness:** No developer should be required to install toolchains or frameworks on their host machine. Everything runs within Docker. The host only requires Git and Docker.

---

## Chapter 3: Architecture Principles

Sentinel is structured as a **Modular Monolith**.

```text
       Presentation (Qt QWebEngineView / React UI)
                           ↓
             Application API (JSON-RPC over IPC)
                           ↓
             Knowledge Engine (Core Domain Objects)
                           ↓
           Domain Services (Scanning, Rules, Git)
                           ↓
           Analyzer Providers (clang-tidy, Cppcheck)
                           ↓
             Infrastructure (Storage, Filesystem)
```

- **No Microservices:** Maintain a single process monolith. Do not introduce network latency or distributed routing protocols between internal domain modules.
- **Loose Coupling:** Modules communicate exclusively using public abstract interfaces and an internal domain event bus.
- **In-Process Performance:** Exploit C++ structure alignment, cache locality, and asynchronous task scheduling instead of network-based scalability models.

---

## Chapter 4: Repository Standards

The folder layout is designed to maintain a clean root.

- **Strict Root Directory:** Only standardized root-level folders (`apps/`, `core/`, `plugins/`, `sdk/`, `docs/`, `docker/`, `scripts/`, `tools/`, `tests/`, `third_party/`, `.github/`) are permitted.
- **No Ambiguous Folders:** Generic folders like `utils`, `helpers`, `misc`, or `temp` are banned. Helper logic must belong to the module it supports or a concrete domain module (e.g., `core/concurrency/thread_pool.hpp`).
- **Folder Ownership:** Every subfolder must have a single responsibilty and answer exactly one architectural question.

---

## Chapter 5: Coding Standards

Sentinel requires modern, high-quality systems programming.

- **Language Standard:** Modern C++20.
- **Ownership & RAII:** Strictly adhere to Resource Acquisition Is Initialization. Raw pointers (`T*`) represent non-owning references. Use `std::unique_ptr` for exclusive ownership and `std::shared_ptr` only when ownership is shared.
- **Error Handling:** Avoid throwing exceptions for recoverable errors. Use `std::expected` (or equivalent outcome wrappers) to return errors explicitly to the caller.
- **No Global State:** Global mutable state is prohibited. Use dependency injection to supply configuration and service handles to components.
- **Cohesion & Coupling:** Strive for high cohesion within modules and low coupling between modules. Keep abstract interfaces small (prefer many specialized interfaces over one monolithic interface).

---

## Chapter 6: UI/UX Standards

The desktop experience must feel premium, visual, and highly responsive—comparable to modern products like Figma, Linear, or GitHub Desktop.

- **Universal Layout:** A consistent structural layout is maintained across all workspaces:
  - **Top Toolbar:** Navigation, project switching, search.
  - **Left Navigation:** Switching workspaces (Home, Projects, Analyze, Fix, Insights, Extensions, Settings).
  - **Main Workspace:** The main functional area for the selected workspace.
  - **Right Inspector:** Contextual detail panel showing properties of the currently active/selected object.
  - **Bottom Status Bar:** Running tasks, background compilation state, static analysis status.
- **Inspector Paradigm:** Every domain object has an inspector representation. Clicking an object anywhere must update the right-side inspector instead of launching pop-ups or modal dialogs.
- **Actionable Framing:** Frame issues as executable tasks rather than warnings. Give estimations of time, impact, and safety for each recommendation.

---

## Chapter 7: API Standards

- **Protocol:** JSON-RPC 2.0 over standard local IPC (e.g., domain sockets or named pipes).
- **Interface Definition:** All APIs must be defined using formal schemas (e.g., JSON Schema or custom IDL).
- **Zero UI Leakage:** Presentation layer logic or Qt specifics must never leak into the API contracts. The API remains purely representation-oriented, passing standardized domain objects.

---

## Chapter 8: Plugin Standards

- **Analyzer Isolation:** Underlying analyzers like clang-tidy, Cppcheck, and IWYU must be wrapped behind the standard plugin SDK interface.
- **Stable SDK ABI:** The SDK must expose stable C-style ABI boundaries or clear JSON serialization interfaces to avoid binary incompatibilities across compiler versions.
- **Versioning:** All plugins and the SDK must follow Semantic Versioning 2.0.0 (SemVer).

---

## Chapter 9: Documentation Standards

- **Mandatory README:** Every folder must contain a `README.md` defining its inputs, outputs, responsibilities, and how to test it.
- **Code Documentation:** Public headers must use standard Doxygen-format comments.
- **Controlling Bloat:** Keep documentations updated inline with code. PR reviews will fail if APIs are added or changed without matching documentation updates.

---

## Chapter 10: Testing Standards

- **Unit Testing:** Write unit tests for all core business logic and algorithms using a modern testing framework (e.g., Catch2 or GTest).
- **Integration Testing:** Verify communication channels and domain event dispatching between core components.
- **UI Testing:** Run automated GUI testing (e.g., Playwright/Puppeteer driving the QWebEngineView frontend) inside headless Docker containers.
- **Prototype Mocking:** Build features using a mock data layer first. UI and APIs must be validated with fakes before binding them to real C++ compiler/static-analysis pipelines.

---

## Chapter 11: Security Standards

- **No Telemetry:** All intelligence is computed locally. Never send user code, names, or metadata to external servers.
- **Buffer Safety:** Prevent buffer overflows and undefined behavior. Run regular sanitizer builds (ASan, UBSan, MSan).
- **Container Hardening:** Run Docker services as non-root users where possible. Keep runtime environments stripped of unnecessary OS packages.

---

## Chapter 12: Performance Standards

- **Incremental Scanning:** Never re-scan files that have not changed. Compute cryptographic file hashes to track changes.
- **Background Processing:** Long-running compilation database parsing or analyzer scanning must run in background threads, keeping the UI at a constant 60 FPS.
- **Multithreading:** Core engine tasks must utilize a work-stealing thread pool to utilize all available CPU cores.

---

## Chapter 13: Release Standards

- **Automated Packaging:** One orchestrator script handles building portable zip/tar archives, system installers (.msi, .deb, .dmg), and cryptographic signatures.
- **Metadata & Compliance:** Every release must output a Software Bill of Materials (SBOM) listing all dependencies and compiler configurations.

---

## Chapter 14: AI Development Standards

- **Context Budgeting:** AI agents must optimize their token usage by asking for structural maps (ASTs, graphs, schemas) first, instead of reading large codebases directly.
- **Self-Review Pipeline:** Human code modifications and AI-generated PRs must pass the same five-phase review check (Architecture, Security, Performance, UX, Documentation) before merge.

---

## Chapter 15: Open Source Governance

- **Commit Control:** No developer has write access to the `main` branch directly. All changes must be approved via Pull Requests.
- **Branch Policy:** Maintain green build status on the `main` branch. Any PR that breaks builds or fails tests is automatically rolled back.
