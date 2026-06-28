# Figma Asset Specification & Synchronization Guidelines

## Overview

Acts as a guidelines document tracking design sync processes and Figma visual components asset library definitions.

## Design Components Library Organization

The library mirrors the SDS tokens structure:

1. **SDS Core Primitives**: Styled buttons, input fields, badges, and icon libraries.
2. **SDS Compound Components**: Standardized project cards, task/focus elements, circular gauges, diff structures, toolbar layout bands.
3. **SDS Wireframe Workspaces**: Pre-assembled home view layouts, file trees, trend charts, extension tables.

## Synchronization Pipeline

- Figma Tokens plugin exports to `sentinel-design-system/tokens/*.json` colors, typography, and spacing scales.
- Automated code linter validations verify standard token naming consistency against stylesheet references.
- Designer review reviews changes before production branch code commits.
