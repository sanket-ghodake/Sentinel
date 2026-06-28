# Docker Directory

This directory contains all Docker files, configuration templates, and Compose scripts for running the Sentinel development environment and production assemblies.

## Subdirectories

- `base/` - Base OS and toolchain build context.
- `frontend/` - React application development server.
- `backend/` - C++20 Core Knowledge Engine environment.
- `llvm/` - LLVM and compiler toolchain container environment.
- `docs/` - Documentation compiler container.
- `ci/` - Continuous integration test runner container.
- `devtools/` - Developer environment tools (Graphify, RTK).

## Compose Configurations

- `docker-compose.yml` - Launches the runtime configuration.
- `docker-compose.dev.yml` - Launches the hot-reload source-mounted development environment.
