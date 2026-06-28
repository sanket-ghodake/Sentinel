# Home Workspace Brief

## Purpose

Home answers:

> What should I do today?

This is the first workspace a developer sees when Sentinel opens. It should feel personal, calm, and immediately useful.

## Desired First Impression

The user should understand the current project state within five seconds.

Ideal read:

```text
Good morning
Continue Flight Controller
Ready to commit
Quality 95%
0 blocking issues
3 recommended actions
Estimated time 6 minutes
```

## Primary User Story

As a developer returning to a project, I want Sentinel to tell me what changed, whether I can commit, and what action matters most, so I can continue work without scanning through diagnostic noise.

## Main Layout

```text
Global Toolbar

Sidebar      Main Content                         Inspector
Home         Continue Working                     Selected task
Projects     Project Health                       Why it matters
Analyze      Recommended Actions                  Impact
Fix          Ready To Commit                      Action buttons
Insights     Quality Trend
Extensions   Recent Activity
Settings

Status Bar
```

## Main Content Order

1. Continue Working
2. Ready To Commit
3. Project Health
4. Recommended Actions
5. Recent Activity
6. Quality Trend
7. Recent Projects

The first viewport should contain Continue Working, Ready To Commit, Project Health, and Recommended Actions.

## Components

### Continue Working

Shows:

- greeting
- active project
- last meaningful progress
- today's priority
- estimated time
- continue button

Example:

```text
Good morning
Continue Flight Controller
Yesterday you fixed 12 issues
Today's priority: review 3 memory tasks
Estimated time: 6 minutes
Continue
```

### Ready To Commit

Shows:

- commit readiness
- blocking count
- changed files
- safe fixes
- last scan time

States:

- Ready
- Needs Review
- Blocked
- Unknown

### Project Health

Shows:

- quality score
- trend
- blocking issues
- suggestions
- safe fixes

Do not show analyzer versions, rule counts, plugin counts, or scan duration in the primary card.

### Recommended Actions

Shows a short task queue.

Each task includes:

- action title
- category
- estimated time
- safety level
- impact
- primary action

Example tasks:

```text
Apply 8 safe formatting fixes
Safe
30 seconds
Impact: cleaner diff
```

```text
Review possible null dereference
Manual
3 minutes
Impact: release confidence
```

```text
Export SARIF for CI
Safe
15 seconds
Impact: team visibility
```

### Recent Activity

Shows progress, not noise.

Examples:

- Fixed 12 issues yesterday
- Quality improved from 92% to 95%
- 3 files changed since last scan
- clang-tidy plugin updated

### Quality Trend

Small chart showing quality movement over recent scans.

Use it to reassure and orient, not to create a data dashboard.

## Inspector Behavior

Default state:

- current project summary
- last scan
- active profile
- next suggested action

When a recommended action is selected:

- why this matters
- impacted files
- confidence
- estimated time
- preview action
- apply or review action

## Interaction Requirements

- `Continue` opens the most relevant workspace for the top task, usually Analyze or Fix.
- `Run Quick Scan` starts a simulated scan in the prototype.
- Selecting a task updates the inspector.
- Applying a safe fix shows a diff preview before confirmation.
- Commit readiness updates after tasks are completed.

## Object Mapping

Home is a workspace view over these objects:

- Project: Flight Controller
- Branch: feature/sensor-fusion
- Quality Snapshot: current score and trend
- Tasks: recommended actions
- Issues: backing evidence for manual review tasks
- Actions: safe fixes, scan, export
- Profile: Embedded Strict
- Plugin: clang-tidy

## Prototype Data

Use a fake embedded C++ project:

```text
Project: Flight Controller
Branch: feature/sensor-fusion
Quality: 95%
Trend: +2%
Blocking Issues: 0
Suggestions: 12
Safe Fixes: 8
Changed Files: 6
Last Scan: 12 minutes ago
Profile: Embedded Strict
Compliance: MISRA 98%, Company Rules Pass
```

## Success Criteria

The Home workspace is successful if a developer can answer these questions without opening a secondary screen:

1. Can I commit?
2. What changed?
3. What should I do next?
4. How long will it take?
5. Is this project getting better or worse?
