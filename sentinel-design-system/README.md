# Sentinel Design System (SDS)

Welcome to the Sentinel Design System (SDS) repository. This repository defines the standard design tokens, core components, and interaction patterns for building highly polished, developer-focused desktop, web, and extension user interfaces.

## Repository Structure

```text
sentinel-design-system/
├── tokens/                   # Design token scales
│   ├── colors.json           # Color definitions (neutrals, brands, semantics)
│   ├── spacing.json          # 8-point pixel spacing grids
│   └── typography.json       # Font family, weight, size, and height hierarchy
├── components/               # SDS core component specifications
│   ├── button/               # Primitives for CTA buttons and states
│   ├── project-card/         # Compound project card displaying quality metrics
│   ├── issue-card/           # Progressive disclosure diagnostic cards
│   ├── task-card/            # Smart Action cards prioritizing outcomes
│   ├── quality-card/         # Circular SVG score indicators
│   ├── inspector/            # Contextual details right panel
│   └── sidebar/              # Left navigation hub
├── patterns/                 # Multi-component layouts and workflows
│   ├── workspaces/           # Main view designs (Home, Projects, Analyze, Improve)
│   ├── navigation/           # Page and project routing workflows
│   ├── dialogs/              # Modals and transient overlays
│   └── search/               # Command palettes and Ctrl+K search overlays
└── figma/                    # Figma components and sync guides
```

## Design Philosophy

Sentinel UI is guided by a single core objective: **reducing developer cognitive anxiety**.

1. **Calm visual defaults**: Elegant dark theme surfaces coupled with high typography contrast ratios.
2. **Progressive disclosure**: Detailed compiler warnings and diagnostic blocks slide open only when selected.
3. **Outcome prioritization**: Focus on actionable "Improve" tasks over simple diagnostics dashboards.
4. **Keyboard-driven efficiency**: Navigate and route between workspaces in under a second using optimized shortcuts.
