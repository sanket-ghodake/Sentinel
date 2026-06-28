# Sentinel Product Design Specification (SPDS)

# Volume 4.5 — Investigation Mode

**Version:** 1.0
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

## 2. Workspace Layout

When a developer double-clicks an issue card or presses `E` while highlighting an issue in the Analyze Workspace, the center area transitions into the Investigation Mode Layout:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Investigation Header: [Issue Name] | [Confidence Score] | [Apply Fix]       │
├───────────────────────────────────────────────────────┬─────────────────────┤
│ Center Workspace                                      │ Right Inspector     │
│ ┌───────────────────────────┬───────────────────────┐ │ (Tabbed Inspector:  │
│ │ 1. Call Graph             │ 2. Code Context       │ │  References,        │
│ │    Visualizer             │    Editor             │ │  Documentation,     │
│ ├───────────────────────────┼───────────────────────┤ │  MISRA/Google Rules)│
│ │ 3. Git History            │ 4. Recommended Fix    │ │                     │
│ │    & Blame Churn          │    Diff               │ │                     │
│ └───────────────────────────┴───────────────────────┘ │                     │
└───────────────────────────────────────────────────────┴─────────────────────┘
```

### Component Details

1. **Call Graph Visualizer:** A directed node graph displaying the call hierarchy leading to the issue.
2. **Code Context Editor:** Read-only view of the file containing syntax-highlighted annotations mapping variables and lifetimes.
3. **Git History & Blame Churn:** Integrated Git metrics detailing which commit introduced the issue, the change author, and file churn rates.
4. **Recommended Fix Diff:** A side-by-side or inline diff showing the before-and-after of applying the Sentinel correction.

---

## 3. The Confidence Meter

The **Confidence Meter** determines how safely an issue can be resolved automatically. It acts as an automation gate, preventing unintended regressions in embedded or safety-critical C++ codebases.

### Confidence Levels

| Confidence    | Typical Rule / Recommendation                | Action Style           | Validation Gate                                    |
| :------------ | :------------------------------------------- | :--------------------- | :------------------------------------------------- |
| **95% – 99%** | Remove unused `#include` / formatting.       | **Safe to Auto-Apply** | Runs compile checks post-apply.                    |
| **80% – 94%** | Convert raw pointer to `std::unique_ptr`.    | **Preview Required**   | Requires user review of the diff before execution. |
| **Below 80%** | Replace search algorithm / change interface. | **Manual Review**      | Highlights lines and files; requires manual edit.  |

- **Calculation Engine:** Confidence is dynamically determined by the Sentinel Core Engine using static heuristics, parser reliability, and rule-set classifications.

---

## 4. Navigation & Exit Triggers

- **Entering Investigation Mode:** Double-click issue, click `Explain` in Inspector, or press `E` on selected list card.
- **Exiting Investigation Mode:** Press `Escape` or click the back/close button in the workspace header to return to the standard Analyze Workspace issue queue list.
- **Transitions:** Smooth fade-and-translate animation (200ms duration, cubic-bezier transition).
