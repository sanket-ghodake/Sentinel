# SPDS-000: Sentinel Product Philosophy

**Document ID:** SPDS-000
**Title:** Sentinel Product Philosophy
**Version:** 1.0
**Status:** Approved

---

## 1. One Sentence

> **Sentinel transforms engineering knowledge into confidence.**

Everything else comes after this.

---

## 2. Core Belief

Developers don't want **Warnings**.
Developers want **Confidence**.

This changes every UI design decision in Sentinel.

---

## 3. Every Screen Answers ONE Question

Each workspace has exactly one purpose and answers exactly one question:

| Workspace      | Question Answered                | Primary Action   |
| :------------- | :------------------------------- | :--------------- |
| **Home**       | What should I do today?          | Continue Working |
| **Projects**   | Help me understand this project. | Open Project     |
| **Analyze**    | What needs attention?            | Review Issues    |
| **Fix**        | What should I improve?           | Apply Safe Fixes |
| **Insights**   | Is quality improving?            | Export Report    |
| **Extensions** | How do I extend Sentinel?        | Browse Plugins   |
| **Settings**   | How should Sentinel behave?      | Save Settings    |

---

## 4. What Sentinel Is and Is Not

### Sentinel is NOT

- A compiler.
- A static analyzer.
- A Git client.
- An IDE.
- A text editor.

### Sentinel IS

- **The Home of Engineering Knowledge.**

---

## 5. Product Values

Every feature must increase at least one of these values. If it doesn't, we do not build it.

- **Clarity**
- **Confidence**
- **Speed**
- **Understanding**
- **Consistency**
- **Trust**

---

## 6. Every UI Element Must Justify Its Existence

Every UI element must answer: **Why does this exist?**
If there is no clear answer, it must be deleted.

---

## 7. No Data Dumps

We never display raw collections of warnings (e.g., "473 Issues"). Instead, developers think in actions. We group and classify:

- **5 Blocking**
- **12 Suggestions**
- **21 Safe Fixes**

---

## 8. No Hidden Intelligence

Sentinel never asks for blind trust ("Trust us.").
Every score, recommendation, and issue must explain **WHY** transparently. Transparency builds trust.

---

## 9. Progressive Disclosure

Information is presented in structured layers. Never show everything at once.

```text
Overview
   ↓
Category
   ↓
Issue
   ↓
Explanation
   ↓
Diff
   ↓
Raw Analyzer
```

---

## 10. The Four Levels

Every object in Sentinel has four distinct levels of resolution:

- **Level 1 — Summary:** Short explanation (e.g., `"Vector copied every loop."`)
- **Level 2 — Details:** Impact detail (e.g., `"Performance impact."`)
- **Level 3 — Technical:** Core rule reference (e.g., `"clang-tidy rule."`)
- **Level 4 — Raw Data:** Original tool output (e.g., Raw analyzer JSON/text output)

---

## 11. UI Language

Words matter. We choose professional, non-intrusive language:

| Avoid Saying    | Instead Say     |
| :-------------- | :-------------- |
| Violation       | Issue           |
| Diagnostic      | Finding         |
| Compiler Output | Analysis        |
| Errors          | Blocking Issues |

---

## 12. Colors

Only four semantic colors are permitted in the interface. Nothing else:

- 🟢 **Green:** Good / Success
- 🔵 **Blue:** Information / Context
- 🟠 **Orange:** Needs attention
- 🔴 **Red:** Blocking

---

## 13. Animation

Animations must have a clear functional purpose (e.g., communicating state changes). They must never be used solely for decoration.

---

## 14. Empty States

Every empty state must teach the user.

- **Bad:** "No Plugins"
- **Good:** "Install your first analyzer. Recommended: clang-tidy [Install]"

---

## 15. Notifications

Notifications must never interrupt. Use small, non-intrusive toasts and let the developer decide when to review.

---

## 16. Product Personality

If Sentinel were a person, it would be:

- **Calm, Professional, Knowledgeable, Quiet, and Helpful.**

It would never be:

- **Loud, Funny, or Overexcited.**
