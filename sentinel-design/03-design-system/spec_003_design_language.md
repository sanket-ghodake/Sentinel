# Sentinel Specification

**Document:** Spec 003
**Title:** Design Language & UX Philosophy
**Version:** 1.0
**Status:** Approved
**Author:** Lead Designer / Product Architect

---

# 1. UX Philosophy: Sentinel reduces anxiety

Most developer tools are designed by compilers, not designers. They scream error warnings and diagnostics, inducing developer stress. Sentinel is designed to make developers feel **Calm, Focused, Confident, and In Control**.

## Emotional Journey

1. **Open Project:** Curious about the project's health.
2. **Scanning:** Confident that the check is fast and accurate.
3. **Results:** Direct clarity ("I understand my codebase").
4. **Issues:** Reassurance ("These are prioritized and fixable").
5. **Fixes:** Satisfaction ("I am making steady progress").
6. **Improvement:** Confidence ("My project is ready to commit").

---

# 2. Product Personality

If Sentinel were a person, it would be:

- **Calm, Professional, Helpful, Honest, Predictable, Knowledgeable.**
  It is **not** flashy, noisy, excited, or overly chatty.

---

# 3. Information Philosophy: Progressive Disclosure

Do not dump 400 warnings on the user. Show simple, high-level summaries first, and let developers expand to technical details when they want to.

- **Layout Density:** Keep a ratio of 60% content and 40% whitespace to maintain a calm, premium visual aesthetic (modeled after Linear and Apple).
- **Cards vs. Tables:** Prefer interactive cards for listing issues (to show category, severity, preview diffs, and action buttons clearly). Tables are reserved for index lookups like settings lists, rule catalogs, and historical trends.

---

# 4. Signature UX Principles

1. **Quality at a Glance:** Every screen answers its main question in under five seconds.
2. **Actions Before Explanations:** Prominently expose the solution (e.g., "Apply 12 Safe Fixes") before showing the technical diagnostics details.
3. **Consistent Everywhere:** Terms, severities, calculations, and icons match identically between Desktop, CLI, and IDE extensions.

---

# 5. Core Visual Elements

- **Calm Color Palette:** Neutral grays, whites, and blacks for the core UI shell. Primary colors are reserved for semantics: Green (Success/Healthy), Blue (Info), Orange (Suggestion/Warn), Red (Danger/Blocker).
- **lucide-style Icons:** Flat, clean line art. No skeuomorphic icons or heavy gradients.
- **Comfortable Typography:** Large clear headings, readable body text, and distinct code blocks.
- **Subtle Transitions:** Micro-animations and page changes must be limited to 150-250ms transitions. No bouncing or heavy slide animations.
