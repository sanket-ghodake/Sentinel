# Sentinel Product Design Specification (SPDS)

# Volume 11 — Component Library (SDS Core)

**Version:** 1.0
**Status:** Foundation
**Author:** Lead UI Designer / Principal Frontend Architect

---

## 1. Introduction & Golden Rules

This document specifies the exact states, spacing patterns, accessibility hooks, keyboard behaviors, and layout configurations for the Sentinel Design System (SDS) core component catalog.

All widgets and workspace elements must be assembled exclusively from these primitives. Ad-hoc styling values are strictly prohibited.

### The 4 Pillars of SDS Components

1. **Strict Token Adherence:** Every pixel of padding, border, or margin must map directly to an SDS token value.
2. **State Completeness:** Every component must design for `Default`, `Hover`, `Focus`, `Active/Pressed`, and `Disabled` states.
3. **Keyboard Accessibility:** Interactive elements must support tab indexes, keypress activation (`Enter`/`Space`), and focus rings.
4. **Responsive Layout:** Flexbox and CSS Grid containers must automatically flow and stack down to a minimum application width of `1024px`.

---

## 2. Shared Layout Primitives

### Spacing Grid & Padding Strategy

- All layouts are built on an **8-point spacing grid**:
  - `--sds-space-4` (4px) - Fine icon/text spacing
  - `--sds-space-8` (8px) - Micro gaps, inline badge spacing
  - `--sds-space-12` (12px) - Tight layout padding (badges, items)
  - `--sds-space-16` (16px) - Standard layout padding / gutter
  - `--sds-space-24` (24px) - Large card internal padding
  - `--sds-space-32` (32px) - Workspace main margin / outer gutters
  - `--sds-space-48` (48px) - Section dividers
  - `--sds-space-64` (64px) - Header / Global layout bands

### Card Container Wrapper (`.sds-card`)

Every card container uses a standardized glassmorphic surface:

- **Background:** `var(--sds-surface)`
- **Border:** `1px solid var(--sds-border)`
- **Radii:** `var(--sds-radius-lg)` (12px)
- **Shadow:** `var(--sds-shadow-md)`
- **Transition:** `border-color var(--sds-transition-fast), background-color var(--sds-transition-fast)`
- **Hover State:** `border-color: var(--sds-border-hover); background-color: var(--sds-surface-hover);`

---

## 3. Component Specification Catalog

### 3.1 Pinned / Hero Project Card

The primary hero block displayed on the Home Workspace to present the active codebase.

```text
┌─────────────────────────────────────────────────────────────┐
│ 📁 Project Name                                    [Branch] │
├─────────────────────────────────────────────────────────────┤
│  🟢 Quality Score                                           │
│     96%                                                     │
├─────────────────────────────────────────────────────────────┤
│  Scan: 2 min ago                           [ Continue → ]   │
└─────────────────────────────────────────────────────────────┘
```

- **Structure:**
  - Outer frame: `.sds-card` wrapper.
  - Header: Flex row. Left side displays the project name (Heading 2, `--sds-text-heading`). Right side displays branch badge (`lucide/GitBranch`, secondary border, `--sds-text`).
  - Body: Display grid. Large Quality Score Gauge (percentage indicator, `--sds-success`) paired with horizontal stats: Changed Files count, Open Tasks count.
  - Footer: Flex row. Last scan status label (`--sds-text-muted`, caption text). Right aligned primary action `Continue →`.
- **States & Transitions:**
  - _Default:_ Border `--sds-border`.
  - _Hover:_ Background transitions to `--sds-surface-hover`, border to `--sds-border-hover`, scale increases by `1.01x` over 150ms.
  - _Active/Focus:_ Focus ring outline `2px solid var(--sds-primary)` with offset `2px`.
- **Accessibility:**
  - `role="button"` and `tabindex="0"` on the card.
  - `aria-label="Project: Flight Controller, Quality Score 96 percent, branch feature memory. Press Enter to continue working."`
- **JSON-RPC Binding:** Consumes the `Project` model interface.

---

### 3.2 Today Task / Focus Card

Actionable task item cards rendered within the Today Focus Panel.

- **Structure:**
  - Outer frame: Border 1px outline (`--sds-border`) with a thick 4px left-border accent matching the task severity class:
    - Blocker/Danger $\rightarrow$ `--sds-danger`
    - Warning/Suggestion $\rightarrow$ `--sds-warning`
    - Info/Safe Fix $\rightarrow$ `--sds-info`
  - Body Layout: Flex row. Left displays task status icon (e.g., `lucide/ShieldAlert`, `lucide/Sparkles`), Title, Estimated Duration, and Safety Rating (Star symbols, e.g., `★★★★★`). Right displays execution CTA button (e.g., `Apply` / `Review`).
- **States & Transitions:**
  - _Default:_ Subdued gray card.
  - _Hover:_ Transitions background to `--sds-surface-hover`, displays subtle shadow glow.
  - _Applying:_ Action button state transitions to disabled with loading animation. Task label fades to `0.6` opacity.
- **Accessibility:**
  - Contains specific screen reader instructions for the progress status: `aria-live="polite"` when applying changes.
- **JSON-RPC Binding:** Triggers `ApplyAutofix(IssueId)` or updates `GetBranchStatus()`.

---

### 3.3 Quality Score Gauge

A circular visual indicator showing score percentages.

- **Structure:**
  - Circular SVG path container (`width: 80px`, `height: 80px`).
  - Background path track stroke: `#1e293b`.
  - Foreground indicator path track stroke matches the semantic quality bounds:
    - `>= 90%` $\rightarrow$ `--sds-success`
    - `70% - 89%` $\rightarrow$ `--sds-warning`
    - `< 70%` $\rightarrow$ `--sds-danger`
  - Text: Centered numeric text (`var(--sds-font-sans)`, Bold, `18px`).
- **States & Tooltips:**
  - _Hover:_ Renders overlay Tooltip element detailing score categories breakdown (Performance: 94%, Memory: 91%, Security: 100%, Architecture: 92%).
- **Accessibility:**
  - Requires `role="img"` and `aria-valuenow="96"` along with descriptive text.

---

### 3.4 Recommendation Card

A compact suggestions widget prompting tools or guidelines.

- **Structure:**
  - Flex row alignment. Padding: `--sds-space-12`.
  - Left side: Action icon (`lucide/Wrench` or `lucide/Download`).
  - Center: Recommendation title, subtitle, and estimated setup time.
  - Right side: Tiny action button (`[Install]`, `[Enable]`).
- **States & Transitions:**
  - _Hover:_ Visual outline glow using the primary brand color (`var(--sds-primary)`) over 150ms.
- **JSON-RPC Binding:** Context mapped to `GetRecommendedTasks()`.

---

### 3.5 Timeline Card

A vertical event tracker showing repository and workspace history.

- **Structure:**
  - Vertical container with a thin center alignment line (`width: 2px`, background `var(--sds-border)`).
  - Chronological nodes: Checkmark node (`lucide/CheckCircle`) or status node.
  - Label: Flex column. Title ("Applied 12 Safe Fixes"), quality change indicators (`+2%` colored green, `-1%` colored red).
- **States:**
  - _Hover:_ Node scale expands to `1.2x`. Shows full Git commit hash, date, and author metadata.
- **JSON-RPC Binding:** Consumes the `Timeline` event interface.

---

### 3.6 Inspector Panel (`.sds-inspector`)

The dynamic context panel occupying the right-hand area of the main grid frame.

- **Structure:**
  - Fixed panel layout. Width: `360px`. Border-left: `1px solid var(--sds-border)`.
  - Header: Title, close button (`lucide/X`), and action icon.
  - Body: Dynamic modules. Auto-selects renderer:
    - _Default:_ Tip of the day + Plugins list.
    - _Project:_ Repository path, active profile configuration selectors.
    - _Task:_ Execution requirements, dependency files, safety report.
- **Transitions & Loading:**
  - _Slide:_ Shifts in from right edge using CSS translate over `200ms` (`var(--sds-transition-normal)`).
  - _Skeleton:_ Text lines display a fading pulse skeleton animation (`@keyframes pulse`) when loading new data.
- **Accessibility:**
  - Uses keyboard trap constraints when a sub-action is active. Pressing `Escape` refocuses the triggering card.

---

### 3.7 Global Toolbar (`.sds-toolbar`)

The horizontal window band positioned at the top of the application shell.

- **Structure:**
  - Height: `64px`. Padding: `0 var(--sds-space-24)`. Border-bottom: `1px solid var(--sds-border)`.
  - Layout: Flex container (space-between).
    - _Left:_ Logo container, project folder path switcher dropdown.
    - _Center:_ Global Search Bar (`Ctrl+K`).
    - _Right:_ Scan Action Trigger, Notifications icon, Profile dropdown.
- **Scan Trigger Dropdown:**
  - A split action button: Left button is "Run Scan", right button is caret arrow icon. Clicking the caret drops down a custom menu pane for selecting scan scope.
- **Accessibility:**
  - Project switcher dropdown is fully keyboard navigable (`ArrowUp`/`ArrowDown`, `Enter` to select).

---

### 3.8 Navigation Sidebar (`.sds-sidebar`)

The vertical icon and navigation panel docked on the left.

- **Structure:**
  - Width: `240px` (expanded), `72px` (collapsed).
  - Internal layout: Flex column. Top sections contain Navigation Items (Home, Projects, etc.). Bottom section contains the Collapse Toggle.
  - Active Pill: Highlighted navigation item renders with background `--sds-surface-hover` and left accent line (`3px` solid `--sds-primary`).
- **Status Badges:**
  - Badge overlays show count updates (e.g., green dot for new recommendations, red number for blocking issues).
- **Accessibility:**
  - `aria-current="page"` applied to the active link.

---

### 3.9 Status Chips & Badges (`.sds-badge`)

Atomic metadata markers indicating severities and categories.

- **Structure:**
  - Height: `20px`. Border radius: `var(--sds-radius-pill)`. Internal padding: `2px 8px`.
  - Typography: Caption weight, monospace font family.
- **Categories:**
  - _Blocker/Critical:_ Red theme (`--sds-danger-bg` / `--sds-danger`).
  - _High/Warning:_ Orange theme (`--sds-warning-bg` / `--sds-warning`).
  - _Info/Safe:_ Blue theme (`--sds-info-bg` / `--sds-info`).
  - _Success:_ Green theme (`--sds-success-bg` / `--sds-success`).

---

### 3.10 Action Buttons (`.sds-btn`)

The core interactive action controls.

- **Primary Button (`.sds-btn-primary`):**
  - Filled background: `--sds-primary`. Text: White.
  - _Hover:_ Background `--sds-primary-hover`, shadow glow `0 0 12px rgba(99, 102, 241, 0.4)`.
- **Secondary Button (`.sds-btn-secondary`):**
  - Outlined border `--sds-border`. Background `--sds-surface`. Text `--sds-text-heading`.
  - _Hover:_ Background `--sds-surface-hover`, border `--sds-border-hover`.
- **Ghost Button (`.sds-btn-ghost`):**
  - Borderless. Text `--sds-text`.
  - _Hover:_ Background `--sds-surface-hover`, text `--sds-text-heading`.
- **Danger Button (`.sds-btn-danger`):**
  - Background `--sds-danger-bg`, border `rgba(239, 68, 68, 0.2)`, text `--sds-danger`.
  - _Hover:_ Background `--sds-danger`, text: White.
- **Focus Ring (Universal):**
  - All buttons must render `outline: 2px solid var(--sds-primary); outline-offset: 2px;` when navigating via keyboard tabs.
