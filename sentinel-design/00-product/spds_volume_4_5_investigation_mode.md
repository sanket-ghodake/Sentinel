# Sentinel Product Design Specification (SPDS)

# Volume 4.5 — Investigation Mode (Detective Mode)

**Version:** 1.1
**Status:** Approved
**Author:** Head of Product / Principal UX Architect

---

## 1. Vision & Goals

Traditional static analysis tools identify an issue but leave the developer to investigate the root cause, call sequence, and git history in isolation.

**Investigation Mode** is Sentinel's signature workflow. It transforms the center workspace from a standard card list into a multi-pane diagnostic playground that answers three questions:

1. **Why did this happen?** (Call Graph & Code Context)
2. **Who is impacted?** (Ownership & Related Functions)
3. **Can I trust the suggested fix?** (Confidence Meter)

---

## 2. Abstraction Gate: The Recommendation Object

All operations in Investigation Mode and the Improve Workspace are modeled around `Recommendation` objects rather than raw diagnostics. A `Recommendation` object represents an actionable engineering suggestion with:

- **Origin:** The compiler/static analyzer rule identifier.
- **Evidence:** Target file, line number, column, and matched text pattern.
- **Explanation:** Text split into three audiences: Simple, Technical, and Expert.
- **Confidence:** Composite score representing local context agreements, rule certainty, and historical false-positive rates.
- **Estimated Effort:** Minutes or seconds required to apply.
- **Estimated Impact:** Impact on performance, readability, or reliability.
- **Safe Automation Level:** `YES` (Auto-apply on scan), `PREVIEW` (Requires diff view review), `NO` (Requires manual implementation).
- **Preview & Patches:** Before and after code snippets with diff outputs.
- **Rollback Support:** Boolean flag indicating whether changes are safely undoable.

---

## 3. Workspace Layout

When a developer clicks "Explain" or presses `E` while highlighting an issue, the center workspace transforms:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Breadcrumbs: Project > Module > File > Issue > Investigation                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Investigation Toolbar: [Prev] [Next] [Explain] [Preview] [Apply] [Ignore]   │
├───────────────────────────────────────────────────────┬─────────────────────┤
│ Center Workspace                                      │ Right Inspector     │
│ ┌───────────────────────────┬───────────────────────┐ │ (Tabbed Inspector:  │
│ │ Panel Selector            │ Active Panel Content  │ │  Contextual to the  │
│ │ - Summary                 │                       │ │  active panel       │
│ │ - Why Flow                │                       │ │  properties)        │
│ │ - Call Flow               │                       │ │                     │
│ │ - Ownership Flow          │                       │ │                     │
│ │ ...                       │                       │ │                     │
│ └───────────────────────────┴───────────────────────┘ │                     │
└───────────────────────────────────────────────────────┴─────────────────────┘
```

### The 10 Interactive Panels

1. **Summary Panel:** Core details, risk assessment, confidence score, evidence properties, blast radius, and "why now?" reasons.
2. **Why? Panel:** Visual timeline explanation showing how the issue occurs (e.g. `Allocate -> Pass Pointer -> Lose Ownership -> Exit Function -> Leak`).
3. **Call Flow Panel:** Interactive calling chain. Clicking any function updates the right inspector with function properties (Parameters, Owner, Complexity).
4. **Ownership Flow Panel:** Visual diagram showing C++ object lifetime lifecycle (`Create -> Pass -> Copy -> Move -> Delete`) and where ownership is lost.
5. **Related Knowledge Panel:** Links other issues matching: Same Rule, Same File, Same Module, Same Author, Same Commit, Same Pattern.
6. **Git History Panel:** Tracks the introducing commit (hash, author, date, message) and file churn.
7. **Analyzer Reasoning Panel:** Logical diagnosis steps formatted as `Rule -> Condition -> Evidence -> Decision`.
8. **Preview Panel:** Interactive side-by-side or comparison diff view of the suggestion, compilation risk, estimated effort, and apply action.
9. **Documentation Panel:** Reference standard rules (C++ Standard, Google Style, MISRA, AUTOSAR, Internal Docs).
10. **Discussion Panel:** Workspace comment threads, bookmarks, and bookmarks list.

---

## 4. Confidence & Automation Gates

The **Confidence Meter** determines how safely an issue can be resolved automatically.

- **95% – 99% (Safe to Auto-Apply):** Remove unused includes/formatting. Runs compile checks post-apply.
- **80% – 94% (Preview Required):** Convert raw pointer to `std::unique_ptr`. Requires user review of the diff before execution.
- **Below 80% (Manual Review):** Complex structural refactorings. Requires manual edit in IDE.

---

## 5. Navigation & Keyboard Shortcuts

Using VS Code-style keyboard-driven navigation:

- `J` $\rightarrow$ Highlight and move to the Next Issue.
- `K` $\rightarrow$ Highlight and move to the Previous Issue.
- `Left Arrow` $\rightarrow$ Exit Detective Mode and return to the issues list.
- `Right Arrow` $\rightarrow$ Move forward / Cycle current panel.
- `F` $\rightarrow$ Open the Preview / Diff Panel (Panel 8).
- `G` $\rightarrow$ Open the Git History Panel (Panel 6).
- `D` $\rightarrow$ Open the Documentation Panel (Panel 9).
- `T` $\rightarrow$ Trigger the "Teach Me" learning mode overlay.
