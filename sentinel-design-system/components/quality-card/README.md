# Quality Card & Quality Gauge Specification

## Overview

Indicates the quality, safety, performance, memory, and compliance score of a project or module.

## Layout Configuration

- Displays a clean circular gauge (SVG circle stroke) with a central percentage label.
- Color Bounds:
  - Quality score `>= 90%` $\rightarrow$ `var(--sds-success)` (Green)
  - Quality score `70% - 89%` $\rightarrow$ `var(--sds-warning)` (Orange)
  - Quality score `< 70%` $\rightarrow$ `var(--sds-danger)` (Red)

## States

- **Hover**: Displays detail tooltip overlay mapping category performance (Performance: 94%, Memory: 91%, Security: 100%, Architecture: 92%).
- **Click**: Opens the full Trend Analytics / Insights Workspace.

## Accessibility

- Requires `role="img"` or `role="progressbar"`.
- `aria-valuenow="<Score>"`
- `aria-valuemin="0"`
- `aria-valuemax="100"`
- `aria-label="Quality score: <Score> percent"`
