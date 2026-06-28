# Project Card Component Specification

## Overview

Represent a single code repository. It communicates the project name, branch, active quality score, readiness status, and last scan time at a single glance.

## Layout Configuration

- Frame: `.sds-card` wrapper (border `var(--sds-border)`, radius `var(--sds-radius-lg)`, padding `var(--sds-space-24)`, shadow `var(--sds-shadow-md)`).
- Header: Flexbox row.
  - Left: Project Name (`H2` size, `var(--sds-text-heading)`).
  - Right: Branch Indicator Badge (lucide `GitBranch` icon, secondary borders).
- Body: Horizontally-arranged grid structure.
  - Left: Large numeric quality gauge display (percentage representation).
  - Right: Metadata stats (Files count, blockers/unresolved issues).
- Footer: Flexbox row.
  - Left: Last Scan details (`var(--sds-text-muted)` caption).
  - Right: Call To Action button (Primary: `Continue Working →` / `Open Project`).

## States

- **Idle**: Standard dark borders, no offset.
- **Hover**: Lift `2px` using `transform: translateY(-2px)`, shadow increases, border transitions to `var(--sds-border-hover)` and background to `var(--sds-surface-hover)`. Action buttons appear/glow.
- **Click**: Initiates opening the Project Workspace.
- **Right Click (Context Menu)**: Contextual dropdown options:
  - Open, Pin, Favorite, Export, Scan, Rename, Delete.

## Accessibility

- Needs `role="button"` and `tabindex="0"`.
- `aria-label="Project: <ProjectName>, Quality score <Quality>%, branch <Branch>. Click to open project workspace."`
