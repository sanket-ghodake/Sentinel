# Issue Card Component Specification

## Overview

The Issue Card handles warning, security, performance, and architecture diagnostics with a design focused on progressive disclosure.

## States

1. **Collapsed (Default)**:
   - Visual: 1px border outline (`var(--sds-border)`) with 4px left-border accent matching the severity:
     - Blocker / Danger $\rightarrow$ `var(--sds-danger)`
     - Warning / Suggestion $\rightarrow$ `var(--sds-warning)`
     - Info / Safe Fix $\rightarrow$ `var(--sds-info)`
   - Title: Short diagnostics description (H3 size).
   - Metadata: File location, estimated fix time, severity badge.
2. **Expanded**:
   - Slides down on click/expand trigger.
   - **Problem Details**: Why this matters, what compile rule it violates.
   - **Suggested Fix**: Clear explanation of how to improve it.
   - **Interactive Diff Viewer**: Inline git-style diff previewing changes.
   - **Action Buttons**: `Apply Fix` (automated) or `Dismiss`.

## Accessibility

- Uses `aria-expanded="false|true"` on the expand toggle.
- Uses semantic markup for diffs (green/red background panels clearly described).
