# RFC 002: Sentinel Engineering Standards

**Document ID:** RFC-002
**Title:** Sentinel Engineering Standards
**Version:** 1.0
**Status:** Approved (Mandatory)
**Author:** Principal Architect / CTO

---

## Executive Summary

This document establishes the non-negotiable engineering standards for the Sentinel project. Every contributor—human or AI—must adhere strictly to these principles before writing, modifying, or reviewing code. The primary goal is to ensure Sentinel remains clean, modular, maintainable, and scalable for the next 10 years.

---

## 1. Development Philosophy

Sentinel is built for the long term. Speed of implementation must never come at the cost of software quality.

- **Cleanliness Over Speed:** Never optimize for writing code quickly. Always optimize for keeping the repository clean, structured, and legible.
- **Core Qualities:** Every architectural decision and code submission must prioritize:
  - **Simplicity:** Minimize complexity and avoid over-engineering.
  - **Maintainability:** Code must be structured so that any developer can easily modify it.
  - **Modularity:** Separate concerns strictly. Keep components isolated and interface-driven.
  - **Scalability:** Ensure the architecture handles growing codebases and plugins without degradation.
  - **Readability:** Write self-documenting code with clear naming and minimal magic.
  - **Deterministic Behavior:** Avoid race conditions, undefined behaviors, or unpredictable logic.

---

## 2. Development Environment

To maintain a clean and reproducible development workflow, **the host machine must remain clean.**

- **No Host-Level Tools:** Developers do not need to install local runtimes or compilers on their host system (e.g., Node.js, npm, pnpm, Qt, LLVM, CMake, Conan, Python, clang, GCC, vcpkg).
- **Dockerized Workflows:** Everything runs inside Docker containers.
- **Host Requirements:** The host machine only requires:
  1. Docker Engine / Docker Desktop
  2. Git
  3. VS Code / cursor (optional, with Remote Containers extension)
  4. Sentinel Extension (future)

---

## 3. Development Containers (Docker Philosophy)

Sentinel uses a modular container architecture instead of a single, monolithic container.

```text
docker/
├── base/          # Common base configuration and operating system
├── frontend/      # React and frontend dev environment
├── backend/       # C++20 Core Knowledge Engine build environment
├── llvm/          # LLVM/Clang analysis toolchain container
├── docs/          # Static site generator and documentation compiler
├── ci/            # Continuous Integration runner environment
└── devtools/      # Graphify, RTK, and AST visualization tools
```

### Docker Rules

- **Multi-stage Builds:** Always use multi-stage builds to produce minimal runtime footprints.
- **Alpine & Minimal Images:** Use Alpine Linux or distroless images for runtimes to minimize security vulnerabilities and size.
- **Layer Caching:** Structure Dockerfiles to maximize layer caching efficiency.
- **BuildKit Enabled:** Utilize Docker BuildKit for advanced caching and parallelized build processes.
- **Named Volumes:** Store persistent database state and user profiles in named Docker volumes.
- **Compose Profiles:** Implement Docker Compose profiles (`--profile`) to spin up only the services needed for a specific workflow.
- **No Runtime Modifications:** Never run `apt install` or equivalent package installation commands inside a running container. All dependencies must be defined in the container image.
- **No Committing Container State:** Never save or commit the runtime state of a container. Containers must remain completely ephemeral.

---

## 4. Development vs. Production

Development and production environments must remain strictly separated.

| Feature / Environment | Development Mode                     | Production Mode                     |
| :-------------------- | :----------------------------------- | :---------------------------------- |
| **Code Assembly**     | Hot Reload / Source Mounted          | Compiled & Optimized Bundles        |
| **File Permissions**  | Read-Write                           | Read-Only                           |
| **Logging**           | Detailed / Trace / Debug             | Info / Warning / Error Only         |
| **Dev Tools**         | Enabled (Graphify, RTK, Debuggers)   | Disabled / Omitted                  |
| **Dependencies**      | Include all development requirements | Minimal / Runtime-only dependencies |

- **Compose Files:** Use separate compose files (e.g., `docker-compose.yml` for production-like verification and `docker-compose.dev.yml` for local development).

---

## 5. Repository Structure

The root directory of Sentinel must remain clean and uncluttered.

```text
sentinel/
├── .github/          # CI/CD workflows, issue templates, PR guidelines
├── apps/             # Runnable applications (Desktop, CLI, future Web)
├── core/             # Business logic, Knowledge Engine, domain event bus
├── plugins/          # Analyzer plugins (clang-tidy, Cppcheck, IWYU)
├── sdk/              # Plugin SDK and stable extension interfaces
├── docs/             # Technical specifications, user manuals, and RFCs
├── docker/           # Dockerfiles and docker-compose configurations
├── scripts/          # Automation scripts (setup, validation, clean-up)
├── tools/            # Internal engineering tools (Graphify, RTK)
├── tests/            # System, integration, and end-to-end tests
└── third_party/      # Tracked third-party source dependencies
```

### Prohibited Names

Never create folders with generic, ambiguous names such as:

- `helpers`
- `utils`
- `misc`
- `backup`
- `temp`
- `old`

If functionality needs to be shared, abstract it into a properly named domain or infrastructure module (e.g., `core/storage` or `core/concurrency`).

---

## 6. Folder Philosophy

Every folder must answer exactly **one** question:

- `apps/` $\rightarrow$ What runnable applications can a developer start?
- `core/` $\rightarrow$ Where is the core domain logic and Knowledge Engine?
- `plugins/` $\rightarrow$ What analyzer plugins are supported?
- `sdk/` $\rightarrow$ How do third-party developers write analyzer plugins?

---

## 7. Git Standards

Maintain a strict branch and commit policy to keep git logs legible.

- **No Direct Commits:** Never commit directly to the `main` or `release` branch.
- **PR Process:** Feature Branch $\rightarrow$ Pull Request $\rightarrow$ Automated Tests & AI Review $\rightarrow$ Human Review $\rightarrow$ Merge.
- **Branch Naming Convention:**
  - `feature/` : New capabilities or extensions
  - `bugfix/` : Correcting defects
  - `hotfix/` : Emergency patches for releases
  - `refactor/` : Code cleanup without behavior changes
  - `docs/` : Documentation improvements
  - `release/` : Release preparation branches
- **Conventional Commits:** Every commit message must follow the Conventional Commits specification:
  - `feat: add clang-tidy project configuration capability`
  - `fix: prevent race condition in event dispatcher queue`
  - `docs: update plugin SDK documentation`
  - `refactor: extract rule checker interface out of engine`

---

## 8. Code Reviews

Every Pull Request must undergo a structured self-review process by AI agents before a human reviews or merges the branch:

1. **Architecture Review:** Verification of module boundaries, dependency rules, and interface standards.
2. **Security Review:** Ensuring no memory leaks, buffer overflows, injection points, or insecure credentials exist.
3. **Performance Review:** Verifying loop bounds, thread safety, memory allocation frequency, and cache locality.
4. **UX Review:** Checking UI layouts, loading states, accessibility guidelines, and keyboard shortcuts.
5. **Documentation Review:** Ensuring public APIs, READMEs, and guides are fully documented.

---

## 9. AI Context Optimization

Every AI-assisted development task must minimize context size while maximizing architectural understanding.

- **Reason Over Architecture:** AI agents should reason over high-level architectures, schemas, and dependency graphs instead of parsing raw source files.
- **Artifact Extraction:** Use tools like Graphify to generate AST maps, RTK to compress contextual codebases, and RFC summaries to feed agents with architecture-level information.

---

## 10. Documentation Standards

- **README Presence:** Every directory in `apps/`, `core/`, and `plugins/` must contain a detailed `README.md` explaining its purpose and boundaries.
- **Public APIs:** Every public function, interface, and class must be documented with inline code annotations (e.g., Doxygen for C++).
- **No Delay:** Never defer documentation with placeholder text or "we'll document later" promises.

---

## 11. Core Technical Rules

### Live Development (Hot Reloading)

- Frontend modifications must automatically reload the UI in real-time.
- Desktop UI changes (rendered inside the Qt QWebEngineView wrapper) must hot-reload instantly upon saving, without requiring a complete restart of the C++ host container or application.

### Layer Separation

- **Frontend:** Must contain **zero** business logic. The frontend only consumes APIs and presents domain objects.
- **Backend:** Must contain **zero** UI presentation or Qt dependencies. The backend focuses strictly on analysis, data persistence, and domain events.
- **API Unification:** Desktop, CLI, VS Code, and CI integrations must consume identical APIs exposed by the Sentinel Core.

### Plugin SDK

- The Plugin SDK is subject to semantic versioning (SemVer).
- Any breaking changes to the SDK must bump the major version and provide an automated migration guide.

### Testing Requirements

- Every core module and analyzer plugin must have a corresponding test suite (unit and integration).
- Automated UI, performance regression, and system integration tests must run as part of the CI pipeline.

### Logging Standards

- Never use raw console outputs (`std::cout`, `printf`, or `console.log`).
- Use structured logging with fields for error contexts.
- Log Levels: `Trace` $\rightarrow$ `Debug` $\rightarrow$ `Info` $\rightarrow$ `Warning` $\rightarrow$ `Error` $\rightarrow$ `Fatal`.

### Build & Release

- One single command (`docker compose up`) must build and launch the entire development stack.
- One release script must automatically cross-compile binaries for Windows, macOS, Linux, bundle installers, and generate SHA-256 checksums, Software Bill of Materials (SBOM), and documentation.
