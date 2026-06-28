# Sentinel Specification

**Document:** Spec 002
**Title:** Product Scope & Information Architecture
**Version:** 1.0
**Status:** Approved
**Author:** Lead PM / Product Architect

---

# 1. Product Definition

Sentinel is a desktop-first developer experience platform that provides a unified interface for understanding, improving, and maintaining code quality across projects, regardless of the editor, IDE, or underlying analysis tools.

## Sentinel is NOT

Sentinel intentionally does **not** become:

- ❌ IDE or Compiler
- ❌ Build System or compiler explorer
- ❌ Git Client or Text Editor
- ❌ AI Code Generator

Every future feature must pass this filter to prevent scope creep.

---

# 2. Core Jobs

Every feature must map directly to these user jobs:

- **Job 1:** Is my project healthy?
- **Job 2:** What changed?
- **Job 3:** Can I merge confidently?
- **Job 4:** Which issues matter most?
- **Job 5:** Which fixes are safe?
- **Job 6:** Why does this rule exist?
- **Job 7:** Can I apply organization rules easily?

---

# 3. User Personas

- **Persona A (Embedded Engineer):** Eclipse / VS / VS Code user. Needs fast, offline checks for compliance rules (MISRA, AUTOSAR, DO-178).
- **Persona B (Backend Engineer):** VS Code / CLion / Vim user. Focuses on modern C++, performance, and quick fixes.
- **Persona C (Team Lead):** Focuses on quality trends, code health metrics, and release reports.
- **Persona D (CI Engineer):** Automation-focused. Requires CLI, JSON/SARIF output, and CI runners.

---

# 4. Product Pillars

Every feature belongs to exactly one product pillar:

1. **Project Understanding:** What is the codebase structure, and how healthy is it?
2. **Issue Understanding:** What failed, why, and how should it be fixed?
3. **Quality Improvement:** Automatic previews, diffs, and safe, single-click fixes.
4. **Configuration:** Profiles, plugins, rule packs, and organization settings.
5. **Reporting:** Historical snapshots, trends, and compliance reports.

---

# 5. Navigation Model

Instead of exposing low-level system/analyzers configuration, Sentinel structures information around stable developer questions:

- `🏠 Home` $\rightarrow$ Overview of ready status, blockers, and recent changes.
- `📁 Workspace` $\rightarrow$ Projects, modules, file trees, symbols, and dependencies.
- `🔍 Insights` $\rightarrow$ Categorized views on Performance, Memory, Security, and Style.
- `⚡ Actions` $\rightarrow$ List of executable recommendations (Autofixes, manual tasks, reports).
- `📈 Trends` $\rightarrow$ Timelines of quality scores, rule changes, and release reports.
- `🧩 Extensions` $\rightarrow$ Installed plugins, rule packs, and marketplace.
- `⚙ Settings` $\rightarrow$ Profiles, user accounts, and layout parameters.

---

# 6. Technical Layout and Empty/Error States

- **Rule of 7:** No view screen should contain more than 7 major sections.
- **Search / Command Palette:** First-class global keyboard utility (`Ctrl + K` or `Cmd + K`) capable of searching files, symbols, issues, rules, and executing commands (Run Scan, Apply Fixes).
- **Positive Empty States:** Avoid showing "No issues" warnings. Frame it positively: "Excellent. Project passed all enabled checks."
- **Actionable Errors:** When files like `compile_commands.json` are missing, provide direct guides, search browse buttons, or templates instead of static stack traces.

---

# 7. Success Criteria

A first-time developer must be able to open a native codebase, run a scan, review quality, apply an autofix, and export a report within **10 minutes** without reading external documentation.
