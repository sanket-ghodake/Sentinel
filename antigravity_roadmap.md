# Sentinel V2 Development Roadmap

This roadmap tracks the transition of the Sentinel platform to the **V2 Engineering Constitution** (Offline-First Rule Orchestration Platform). Completed tasks are marked with `[x]`.

---

## 🟢 Legacy Foundation (V1 Completed Steps)

* [x] Codify Engineering Standards, Handbook & AI Engineering Contract
* [x] Implement Pure C++20 Core Domain Model & Event Bus Dispatcher
* [x] Establish Public JSON-RPC 2.0 Named Pipe / IPC Loop
* [x] Design React-based Desktop Shell & component library (Vite/React UI inside Qt QWebEngineView)
* [x] Initialize SQLite database integrations for caching, history, and snapshots

---

## 🏃 Phase 8: V2 Runtime Execution & Tool Sandboxing

* [x] **Process Execution Engine (`ProcessRunner`)**
  * [x] Implement type-safe native command executor spawning child processes with timeouts and limit gates.
  * [x] Implement Docker executor routing tool runtimes into containers for sandbox security.
* [x] **Compilation Database Support**
  * [x] Write parser for `compile_commands.json` (`CompileCommandsParser`) to resolve target compilation arguments.
* [x] **Unit Testing & Database Isolation**
  * [x] Fix test suite database interference (use unique file paths/memory db for test runs).

---

## 🔧 Phase 9: Real LLVM Compiler & Cppcheck Integration

* [ ] **Real Clang-Tidy Execution**
  * [ ] Refactor Clang-Tidy Runner to spawn local or Dockerized `clang-tidy` binary.
  * [ ] Connect compilation database arguments for targeted file scanning.
* [ ] **Real Cppcheck Execution**
  * [ ] Refactor Cppcheck Runner to spawn local or Dockerized `cppcheck` binary.
* [ ] **Output Parser Validation**
  * [ ] Test parser adapters against real CLI diagnostics instead of mock fixtures.

---

## 🚀 Phase 10: Commit Readiness & Verification

* [ ] **Auto-Fix & Verification**
  * [ ] Implement post-fix compilation checks to verify code health before staging.
* [ ] **Commit Status Gateway**
  * [ ] Wire backend validation state to the UI Commit Status panel (🟢 Ready / 🔴 Blocked).
