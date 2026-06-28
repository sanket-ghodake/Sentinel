# Sentinel Design Repository

Sentinel is being designed as an object-based engineering knowledge platform, not as a collection of disconnected screens.

This repository contains the product artifacts that should guide design, prototype, and implementation decisions before production code is written.

## Product North Star

> Know your code. Ship with confidence.

## Current Milestone

Sentinel v0.1 Interactive Product Prototype

The prototype should validate the first-run and daily-use experience before real analyzer integration begins.

## Repository Structure

```text
sentinel-design/
├── 00-product/
│   ├── sentinel-design-bible.md   <-- Unified blueprint & roadmaps
│   ├── object-model.md
│   ├── product-operating-model.md
│   └── product-roadmap-and-sprints.md
├── 01-research/
├── 02-information-architecture/
├── 03-design-system/
├── 04-wireframes/
├── 05-high-fidelity/
├── 06-prototypes/
├── 07-user-testing/
├── 08-frontend-spec/
└── 09-engineering-rfcs/
    ├── product-architecture.md
    ├── rfc-002-engineering-standards.md
    ├── rfc-003-engineering-handbook.md
    ├── rfc-004-ai-engineering-contract.md
    └── rfc-005-specialized-agent-roles.md
```

## Design Order

1. Define the product architecture, object model, and Design Bible.
2. Establish non-negotiable Engineering Standards and the AI Engineering Contract.
3. Design the workspace map as views over those objects.
4. Build clickable v0.1 prototypes with fake object data.
5. Test the prototypes with developers.
6. Convert validated flows into frontend, API, and domain contracts.

## Architecture Principle

The Knowledge Engine is the center of Sentinel.

Sentinel is an **Engineering Experience Platform**. Desktop, IDE extensions, CLI, CI, and future clients consume the same core objects through the same public API. No UI should consume analyzer output directly.
