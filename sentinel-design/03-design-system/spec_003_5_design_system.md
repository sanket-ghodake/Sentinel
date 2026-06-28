# Sentinel Specification

**Document:** Spec 003.5
**Title:** Sentinel Design System (SDS)
**Version:** 1.0
**Status:** Approved
**Author:** Lead Designer / Principal Architect

---

# 1. Philosophy

Sentinel is not just an application; it is a platform. Every screen must feel coherent and unified, using standardized components.

- **Component-Driven Layouts:** Never design directly on a page. Every element must represent a defined component with a single, dedicated responsibility.
- **Design Tokens:** All colors, sizes, borders, radii, fonts, and shadows are defined as abstract tokens, ensuring theme independence (Light, Dark, High Contrast support).

---

# 2. Design Tokens Scale

- **Color Tokens:** `Background`, `Surface`, `Surface Hover`, `Primary`, `Secondary`, `Border`, `Success`, `Warning`, `Danger`, `Information`.
- **Spacing Scale (px):** 4, 8, 12, 16, 24, 32, 48, 64. No custom margin/padding values.
- **Border Radii:** `Small`, `Medium`, `Large`, `Pill`.
- **Typography Hierarchy:** `Display`, `H1`, `H2`, `H3`, `Body`, `Caption`, `Code`.

---

# 3. Core Component Catalog

## Navigation & Input

- **Sidebar:** Left-aligned menu containing workspace selectors.
- **Command Palette:** Keyboard-driven execution list (`Ctrl + K` or `Cmd + K`).
- **Interactive Pickers:** File/Folder Pickers, Slider controls, and Checkbox/Toggle buttons.

## Information & Analytics

- **Project Health Card:** The main entry point card showing name, quality score, changed files count, and safety status.
- **Quality Card:** Standardized circular or percentage indicator representing scores in Performance, Memory, Security, and Style.
- **Issue Card:** Multi-state card supporting Collapsed (brief category/severity check) and Expanded (explanation, location, and inline actions).
- **Diff Viewer:** Unified or split comparative view displaying inline file modifications with syntax highlighting, word diffs, and apply/undo state buttons.

## Actions & Feedback

- **Action Buttons:** Five types only: Primary (e.g., Run Scan), Secondary (Settings), Danger (Delete), Ghost (Cancel), and Link.
- **Toast & Toppers:** Non-modal notification popups that fade out automatically.
- **Progress Rings & Steps:** Multi-stage loading indicators that explain what index or analyzer is currently running.
- **Empty/Error States:** Visual illustrations with positive validation prompts and executable action links.
