---
trigger: always_on
description: Mandatory Sentinel agent rules, environment constraints, context optimization, and SQLite security checks.
---

# Sentinel AI Agent Rules & Workspace Constraints

## 1. Environment Constraints: Docker-Only Execution

- **Strict Host Cleanliness:** Do not compile, format, test, or run any code directly on the host system. All toolchains must be run inside Docker containers.
- **Command Routing:** Execute commands through the docker container context (e.g., `docker run ...` or `docker compose exec backend ...`).
- **Dependency Installation:** Do not use host-level package managers. Edit Dockerfiles inside `docker/` and rebuild.
- **Commit Prevention:** Do not commit changes by yourself. AI agents must stage changes and leave them for the developer to review and commit.

## 2. Context Optimization: Graphify & RTK Workflows

- **Minimize Raw Tree Parsing:** Avoid reading or parsing raw source code trees recursively. Query the structured code graph map first.
- **Graphify Usage (No API Key Required):**
  - Run `graphify update .` to initialize or update AST codebase graph without an LLM API key (runs offline, zero API cost).
  - Use `graphify query "<question>"`, `graphify path "<node1>" "<node2>"`, or `graphify explain "<node>"` to get scoped subgraphs.
  - Run `graphify update .` after adding, deleting, or modifying source files to keep the graph in sync.
- **RTK Commands:** Prefix common CLI commands with `rtk` to filter/minify outputs and conserve token context:
  - Use `rtk ls` instead of `ls`
  - Use `rtk tree` instead of `tree`
  - Use `rtk find` instead of `find`
  - Use `rtk grep` instead of `grep`/`ripgrep`
  - Use `rtk diff` instead of `git diff`
  - Use `rtk read <file>` to read files
  - Use `rtk err <command>` or `rtk test <command>` to run build/tests and only print errors/failures.

## 3. Strict Compliance with the AI Engineering Contract (RFC-004)

- **Design Approval Gate:** Before generating code or modifying architectural files, present a design explanation, list tradeoffs, identify extension points, and wait for human approval.
- **Domain Object Mapping:** Align classes, tables, APIs, and UI fields with domain objects defined in the Object Model (`sentinel-design/00-product/object-model.md`).
- **Modular Monolith Boundaries:** Do not introduce microservices or HTTP-based IPC between internal core modules. Communication occurs in-process via interfaces and domain events.
- **Directory Hygiene:** Never create directories outside the permitted root structure. Banned names: `helpers`, `utils`, `misc`, `backup`, `temp`, `old`.

## 4. SQLite Database & Security Checks

- **Secret Scanning:** Never commit TLS keys, API keys, or raw secrets (verified by `detect-private-key`).
- **Binary Database Blocker:** Do not commit SQLite database files, journals, or snapshots to the repository (blocked by `check-sqlite-files` for `\.(db|sqlite|sqlite3|db-journal)$`).
- **SQL Injection Audit:** Avoid dynamic SQL construction in C++. The pre-commit gate runs `scripts/check-sqlite-security.py` to reject:
  - String concatenation (`+` or `+=`) inside SQL query strings.
  - String formatting (`std::format`, `fmt::format`, or `sqlite3_mprintf`) directly embedding dynamic variables inside SQL statements.
  - Using `std::stringstream` to construct SQL statements.
  - **Requirement:** Parameterized placeholder bindings (`sqlite3_bind_*` or wrapper placeholder bindings) must be used.
