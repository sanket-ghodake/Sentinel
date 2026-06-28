# Inspector Panel Component Specification

## Overview

The Inspector is Sentinel's context engine. It docks to the right side of the main workspace grid (`360px` width) and displays metadata, descriptions, histories, and execution triggers for whichever item is selected. It avoids intrusive modal popups.

## Layout Configuration

- Fixed panel on the right. Border-left: `1px solid var(--sds-border)`.
- Header: Section Title, metadata categories, and Close Action (`lucide/X` icon).
- Body: Scrollable area loading context-specific renderer modules:
  - **Issue Inspector**: Severity indicators, rule name, "Why this matters", impact metrics, and action list.
  - **Project Inspector**: Folder location, configure active rule profiles, active linting plugin versions.
  - **File Inspector**: LOC (lines of code), issue density ratios, history of recent edits.
- Footer: Outlined primary call-to-actions (e.g., `Apply Autofix`).

## Motion & Transitions

- Slides/fades in from the right edge over `250ms` using CSS translate transform.
- Renders loading text skeleton lines during context switching.

## Accessibility

- Pressing `Escape` closes the active Inspector panel.
- Focus trap constraints are active inside the panel when sub-actions are focused.
