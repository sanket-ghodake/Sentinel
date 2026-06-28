# RFC 006: Modular Monolith Architecture Blueprint

**Document ID:** RFC-006
**Title:** Modular Monolith Architecture Blueprint (formerly Spec 004)
**Version:** 1.0
**Status:** Approved
**Author:** Lead Architect / CTO

---

## 1. Architectural Philosophy: The Modular Monolith

Sentinel rejects a microservices architecture for local developer environment execution. A distributed microservices setup (REST APIs across multiple local services) introduces unnecessary latency, serialization overhead, complex container routing, and debugging difficulty.

Instead, Sentinel is built as a **Modular Monolith** running within a single process.

- **Communication:** Components communicate via in-process abstract interfaces and a shared, asynchronous event bus.
- **Performance:** Leverages direct in-memory structures and thread schedulers, bypassing local HTTP network roundtrips.
- **Future-Proofing:** Should remote execution or cloud offloading become necessary in the future, modular boundaries allow individual domains to be extracted easily into microservices.

---

## 2. Bounded Context Domain Definitions

The system is divided into eleven distinct domain modules:

1. **Workspace:** Handles projects, directory structures, file system trackers, and local project index profiles.
2. **Scanner:** Schedules, runs, monitors, and cancels analysis jobs. It is agnostic to analyzer-specific rules.
3. **Analyzer:** Defines the common provider interface (`IAnalyzer`) and loads provider implementations (clang-tidy, Cppcheck, IWYU) dynamically.
4. **Diagnostics:** Receives raw analyzer results and normalizes them into a single, standardized diagnostic structure.
5. **Quality:** Evaluates project health scores, compliance snapshots, trends, and release readiness.
6. **Rules:** Manages checking rule lists, active profiles, and organization rule packs.
7. **Plugin System:** Exposes dynamic loading mechanisms (VS Code-style extension manifests, commands, and views) for modular extensions.
8. **Git:** Reads history, detects branches, identifies changed files (staged vs. unstaged), and tracks quality deltas across commits.
9. **Reporting:** Exports code health details into standardized formats (SARIF, JSON, HTML, PDF).
10. **Cache:** Optimizes performance by storing cryptographic file hashes, indexing results, and scan history.
11. **Event System:** Dispatches in-process events (e.g., `ScanStarted`, `IssueCreated`) to decouple components.

---

## 3. Storage Layer: SQLite

To support historical trends, plugin metadata, rule mappings, and scan reports without requiring external database servers, Sentinel uses **SQLite**. SQLite stores relations and indexing details locally in a single, highly performant cache file located inside the named user volume.

---

## 4. Quality Engine Pipeline

Instead of feeding raw compiler warnings directly to the UI, the engine processes data through a structured pipeline:

```text
Static Analyzer Output
        ↓
Normalized Diagnostics
        ↓
Knowledge Engine (Code Graph & AST Mapper)
        ↓
Quality Engine (Aggregates severity, impact, history)
        ↓
Actionable Insights & Safe Autofixes
        ↓
Presentation Layer UI
```

---

## 5. Development Strategy (Implementation Order)

We decouple the user interface from complex LLVM backend code by building Sentinel in a strict order:

1. **Domain Model (Pure C++20):** Define common types and structures.
2. **Core Engine:** Implement the event bus and workspace indexing.
3. **Plugin SDK:** Expose plugin boundaries and manifests.
4. **Quality Engine:** Design score and readiness calculations.
5. **Fake Analyzer:** Implement a mock service layer yielding fake issues.
6. **Desktop UI (Qt/React):** Build layouts and test workflows with mock data.
7. **Real clang-tidy Integration:** Bind compiler data compilation databases.
8. **VS Code Extension & CLI:** Add alternative client wrappers over the Core API.
