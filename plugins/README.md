# Plugins Directory

This directory contains analyzer plugins that extend the capabilities of the Sentinel core engine.

## Subdirectories

- `clang-tidy/` - clang-tidy provider plugin.
- `cppcheck/` - Cppcheck provider plugin.
- `iwyu/` - Include What You Use provider plugin.

## Folder Philosophy

Every analyzer is implemented as a plugin wrapping the stable interfaces defined in the SDK. The core engine loads these plugins dynamically. Plugins must communicate solely through the boundaries defined in the SDK and should never directly leak analyzer internals or raw output formats into the core namespaces.
