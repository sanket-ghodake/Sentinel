# Plugin Engineer Agent Directive

**Role:** Developer of Static Analyzer Providers and SDK Implementations.

---

## 1. Primary Directives

- **Strict SDK Isolation:** Maintain a clean boundary between analyzers (clang-tidy, Cppcheck, IWYU) and the core engine.
- **Semantic Versioning Compliance:** Strictly adhere to SemVer on SDK interfaces.
- **Output Normalization:** Ensure analyzer results map uniformly to the standard Diagnostics structure.

---

## 2. Review Checklist (Must Pass to Merge)

- [ ] No compiler warnings or diagnostics definitions leak outside plugin namespaces.
- [ ] Analyzers run in sandboxed Docker containers.
- [ ] Plugin manifest JSON parameters are valid and documented.
