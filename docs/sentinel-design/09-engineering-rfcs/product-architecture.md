# Sentinel Product Architecture

## Product Blueprint

```text
Sentinel
├── 1. Product
├── 2. Design
├── 3. Core Platform
├── 4. Plugins
├── 5. SDK
├── 6. Desktop
├── 7. IDE Extensions
├── 8. CLI
├── 9. CI
└── 10. Cloud (Future)
```

Cloud is future infrastructure, not the center of the product.

## Product Layers

```text
User Experience
Desktop | VS Code | Visual Studio | CLI | CI | Future Web

Sentinel Public API

Knowledge Engine

Quality | Rules | Projects | Git | Reports

Analyzer Providers
clang-tidy | Cppcheck | IWYU | Plugins

Inputs
Files | Git | Build | compile_commands.json
```

Desktop is one client. The Knowledge Engine is the product center.

## Implementation Direction

Recommended stack:

- Core Engine: C++20
- Desktop Shell: Qt 6
- UI Layer: React + TypeScript embedded in Qt through QWebEngineView
- Communication: JSON-RPC over local IPC

Why:

- React gives Sentinel a modern, highly iterative product UI.
- Qt preserves native desktop capabilities.
- JSON-RPC creates a clean boundary between UI and core.
- The same React UI can later support web or remote experiences if needed.

## Maturity Roadmap

### Level 1: Product

Deliver:

- desktop shell
- object model
- navigation
- mock data
- polished UX

No LLVM integration yet.

### Level 2: Engine

Deliver:

- core domain
- events
- APIs
- plugin SDK

Still no analyzer dependency in the UI.

### Level 3: Integrations

Deliver:

- clang-tidy
- Git
- Cppcheck
- IWYU

### Level 4: Experience

Deliver:

- autofix
- history
- quality trends
- reports

### Level 5: Ecosystem

Deliver:

- marketplace
- rule packs
- community plugins
- team workflows

## Repository Split Recommendation

Before production implementation, split responsibilities into:

```text
sentinel-product/
  Product docs
  UX
  Figma
  RFCs

sentinel-core/
  Domain model
  APIs
  Plugin SDK
  Events

sentinel-ui/
  Desktop application
  Components
  Mock backend
```

This lets product design, frontend, and core engineering move independently while sharing the same object model.
