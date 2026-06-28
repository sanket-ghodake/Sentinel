# Tests Directory

This directory contains automated test suites that cover the Sentinel platform.

## Subdirectories

- `unit/` - Unit tests for core algorithms.
- `integration/` - Integration tests verifying IPC, data layers, and plugin adapters.
- `ui/` - Headless automated GUI tests.
- `performance/` - Benchmarking suites tracking incremental scanning memory and cpu regression.
- `fake_data/` - Mock database states and objects for interactive prototype testing.

## Folder Philosophy

All tests must execute inside the Docker testing container. No local test harness executions are allowed on the host machine.
