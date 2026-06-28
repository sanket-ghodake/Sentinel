# Tools Directory

This directory contains internal development utilities used by Sentinel contributors and AI agents.

## Subdirectories

- `graphify/` - AST mapping, dependency graph generators, and visualization generators.
- `rtk/` - Repository Context Compression tools to optimize context window size for LLMs.

## Folder Philosophy

Tools in this directory exist solely to optimize developer and AI context optimization during the design and construction of Sentinel. They must remain completely isolated from runtime packages.
