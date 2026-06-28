# Button Component Specification

## Overview

Buttons are core interactive elements representing primary, secondary, destructive, ghost, or link-based triggers.

## Primitives and Styling

Buttons are styled using SDS design tokens exclusively:

- **Primary (`.sds-btn-primary`)**:
  - Background: `var(--sds-primary)`
  - Text: `#ffffff`
  - Hover: Background transitions to `var(--sds-primary-hover)` with shadow glow `0 0 12px rgba(99, 102, 241, 0.4)` over `100ms` (transition fast).
- **Secondary (`.sds-btn-secondary`)**:
  - Background: `var(--sds-surface)`
  - Border: `1px solid var(--sds-border)`
  - Text: `var(--sds-text-heading)`
  - Hover: Background transitions to `var(--sds-surface-hover)`, border to `var(--sds-border-hover)`.
- **Danger (`.sds-btn-danger`)**:
  - Background: `var(--sds-danger-bg)`
  - Border: `1px solid rgba(239, 68, 68, 0.2)`
  - Text: `var(--sds-danger)`
  - Hover: Background transitions to `var(--sds-danger)`, text to `#ffffff`.
- **Ghost (`.sds-btn-ghost`)**:
  - Background: `transparent`
  - Text: `var(--sds-text)`
  - Hover: Background transitions to `var(--sds-surface-hover)`, text to `var(--sds-text-heading)`.
- **Link (`.sds-btn-link`)**:
  - Background: `transparent`
  - Text: `var(--sds-primary)`
  - Hover: Text underlines, color changes to `var(--sds-primary-hover)`.

## Accessibility (A11y)

- Must render distinct outline focus indicator when tab-navigated: `outline: 2px solid var(--sds-primary); outline-offset: 2px;`
- Screen readers read the content of the button. Disabled buttons must have `disabled` attribute or `aria-disabled="true"`.
