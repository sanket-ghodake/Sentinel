# Workspaces Pattern Specification

## Overview

Workspace layouts structure the central section of Sentinel's screen space. Workspaces coordinate visual views over domain objects.

## Layout Rules

- Workspace outer padding: `var(--sds-space-32)` surrounding gutters.
- Flexbox flow layouts utilizing `gap: var(--sds-space-24)`.
- Scroll bars are customized globally using webkit-scroll thumb elements.

## Workspaces Map

- **Home**: Aggregated statistics dashboard displaying active projects, prioritized focus cards, metrics breakdown, recent events timeline, and recommended setup.
- **Projects**: Core file and folder tree layout paired with dependency architecture graph.
- **Analyze**: Severity filtering, issue list cards, and active file code viewers.
- **Improve**: Side-by-side or unified interactive diff screens displaying pending automated improvements.
- **Insights**: Clean SVG historic score line charts and categorical issue bars.
- **Extensions**: Grid cards enabling/disabling Cppcheck, Clang-Tidy, and dynamic plugins.
- **Settings**: Configuration selector inputs and user profile settings.
