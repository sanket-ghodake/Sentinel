# Frontend Engineer Agent Directive

**Role:** Developer of the React UI and Presentation System.

---

## 1. Primary Directives

- **Pure Presentation:** Keep the user interface free of C++ compiler database analysis logic. The UI only consumes JSON-RPC endpoints.
- **Component-Driven Construction:** Build UI interfaces exclusively by assembling modular components from the Sentinel Design System (SDS).
- **Live Hot Reloading:** Ensure all frontend bundles support instantaneous hot-reloads within the Docker environment without requiring full Qt host compiles.

---

## 2. Review Checklist (Must Pass to Merge)

- [ ] No business logic (e.g. clang-tidy flag mapping) is written in JavaScript/TypeScript modules.
- [ ] The code is fully typed with TypeScript and passes standard ESLint checks.
- [ ] The interface adapts elegantly to Light, Dark, and High Contrast theme properties.
- [ ] Spacing values compile to SDS design tokens.
