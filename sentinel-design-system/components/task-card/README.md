# Task Card Component Specification

## Overview

Task Cards represent discrete actionable units in Sentinel (e.g., today's focus queue). Instead of just showing diagnostics (what happened), they highlight outcomes (what you can accomplish).

## Smart Action Card Concept

Traditional tools show lists of issues. Sentinel displays **Smart Actions**:

- Header: Bold action outcome (e.g., `🚀 Improve Performance`, `🧹 Modernize Code`, `📦 Optimize Includes`).
- Metadata:
  - Estimated impact (e.g., `+4%`, `8% compilation speedup`).
  - Estimated time (e.g., `30 seconds`, `2 minutes`).
  - Risk rating (e.g., Low, Medium, High).
- Action CTA: Primary CTA button (`[Preview Changes]` or `[Apply]`).

## States

- **Idle**: Clean spacing, left-accent severity border.
- **Hover**: Background shifts to `var(--sds-surface-hover)`, shadows glow.
- **Selected**: Highlighted outline showing active details in the Inspector.
- **Running / Applying**: Disables action trigger, runs spinner, opacity set to `0.6`.
- **Completed**: Runs checkmark animation (e.g., checkmark scales up, card transitions out smoothly).
- **Failed**: Left border changes to full red, action button resets with error prompt.
- **Disabled**: Greyed out with warning tooltip explaining missing dependencies.

## Animation & Motion

- Completion transition: checkmark scale `0.2` $\rightarrow$ `1.0` $\rightarrow$ fade out parent card over `200ms`.
- Transition timing: Cards hover `120ms` slide ease.
