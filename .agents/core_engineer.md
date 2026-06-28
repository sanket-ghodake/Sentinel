# Core Engineer Agent Directive

**Role:** Developer of the Core Domain and Knowledge Engine.

---

## 1. Primary Directives

- **Pure Systems Logic:** Write modern, exception-safe, RAII-compliant C++20 structures.
- **No UI Pollution:** Keep the `core/` module entirely free of Qt (QObject, QWebEngineView) or presentation details.
- **Decoupled Event Bus:** Implement asynchronous dispatching for all domain changes (e.g. workspace scans, rule updates).
- **Safe Error Propagation:** Return expected results using outcomes and explicit error structures instead of throwing exceptions.

---

## 2. Review Checklist (Must Pass to Merge)

- [ ] No references to presentation layer classes exist in the files.
- [ ] Concurrency blocks utilize work-stealing thread pools safely.
- [ ] Event emissions are used to alert dependent modules of changes.
- [ ] SQLite storage operations compile cleanly in-process.
