# Search & Command Palette Pattern Specification

## Overview

Search handles keyboard-driven retrieval of symbols, files, rules, plugins, and commands, acting as a global router.

## Interception Shortcuts

- `Ctrl + K`: Opens Global Search Modal.
- `Ctrl + Shift + P`: Opens Command Palette.
- `Ctrl + F`: Navigates to Analyze page and focuses filters.

## Results Organization

- No tabular segmentation. Renders unified flat scroll lists organized into clear category headers (e.g., Commands, Projects, Files, Issues).
- Pressing `ArrowUp` or `ArrowDown` updates active indicator index.
- Pressing `Enter` runs target action item.
