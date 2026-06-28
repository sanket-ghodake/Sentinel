# Dialogs & Modals Pattern Specification

## Overview

Dialogs and Modals are transient overlays containing interactive search controls, action confirmations, or prompt palettes. They temporarily intercept user inputs.

## Visual Design

- Backdrop: `rgba(5, 6, 8, 0.75)` dark overlay with a blur factor `backdrop-filter: blur(6px)`.
- Container: Border `var(--sds-border-hover)` centered, rounded borders `var(--sds-radius-lg)`, shadow level `var(--sds-shadow-lg)`.
- Animation: `modalSlideDown` slide down translate transition over `150ms`.

## Escape Hatch & Focus

- Clicking outside the container limits dismissed dialogs.
- Pressing `Escape` intercepts input focus and closes overlays.
