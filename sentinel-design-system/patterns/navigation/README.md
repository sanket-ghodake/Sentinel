# Navigation Pattern Specification

## Overview

Navigation handles transitions between application contexts (e.g., changing active workspaces, projects, or selected issues).

## Hierarchy & Flow

1. **Global Sidebar Selection**: Swaps the central layout view instantly. Updates document context and URL parameters.
2. **Project Switcher Dropdown**: Switches active project metrics across the entire application workspace context.
3. **Card Selection**: Clicking a card (Project, Issue, Recommendation) automatically focuses that entity's metadata details inside the right Inspector panel.
4. **Action Redirection**: Clicking actionable focus card elements (e.g., "Review") redirects focus directly to the target workspace (e.g., redirection to the Issues Queue).
