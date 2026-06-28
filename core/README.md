# Core Directory

This directory contains the central business logic, knowledge computation, and event loops for Sentinel.

## Subdirectories

- `knowledge/` - The Knowledge Engine containing AST databases, dependency structures, and code graph builders.
- `event_bus/` - The in-process event loop handling publisher-subscriber notifications.
- `rules/` - Rule check definitions, configuration layers, and standard compliance engines.
- `git/` - Interface layers and cache utilities for git commit history parsing and code quality snapshots delta computation.
- `storage/` - Persistence services, compile database trackers, and cache file storage.

## Folder Philosophy

The `core/` directory is built using Modern C++20 and has **zero** dependencies on Qt, React, or static analyzer implementations. It communicates outward using abstract interfaces and receives actions from the public Application API layer.
