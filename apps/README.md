# Apps Directory

This directory contains the runnable applications of the Sentinel platform.

## Subdirectories

- `desktop/` - The main desktop shell application (Qt + embedded React UI).
- `cli/` - The command-line interface for running scans, exporting reports, and integrating with terminal workflows.
- `vscode/` - The Visual Studio Code extension (consumes core APIs).
- `ci/` - Automated runner wrappers for continuous integration environments.

## Folder Philosophy

All apps must consume identical APIs exposed by the Knowledge Engine in the `core/` module. No application in this folder is allowed to contain business logic, database configurations, or direct static analyzer dependencies.
