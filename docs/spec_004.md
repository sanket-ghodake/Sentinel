Now we're entering my favorite part.

This is where I think most open-source projects become messy.

People start with

```text
src/
utils/
common/
helpers/
```

Six months later...

```text
utils2/
helpers_new/
common_final/
```

😂

Google, Microsoft and Apple **never** start from folders.

They start from **Bounded Contexts** (Domain Driven Design).

---

# 🚨 First, I want to change one thing

You mentioned earlier

> microservices

I think **microservices are the wrong architecture**.

Let me explain.

---

## Why Google would reject Microservices

Suppose Sentinel has

```text
Desktop

↓

API

↓

Scanner Service

↓

Git Service

↓

Plugin Service

↓

Workspace Service

↓

Rule Service

↓

Quality Service
```

Now imagine user clicks

```text
Scan Project
```

Desktop calls

```text
Workspace

↓

Scanner

↓

Rules

↓

Plugins

↓

Git

↓

Analyzer
```

Now imagine all these are REST APIs.

😅

You've just introduced

- latency
- serialization
- authentication
- deployment
- debugging
- versioning

for absolutely no benefit.

---

Google calls this

> **Premature Distribution**

One of the biggest architectural mistakes.

---

# Instead

I'd build

## Modular Monolith

```text
Desktop

↓

Sentinel Core

↓

Modules

↓

Shared Event Bus
```

One process.

One executable.

Very fast.

Very easy.

---

Then after 5 years

Need cloud?

Need remote scanning?

Need distributed workers?

Split modules.

Done.

---

# Sentinel Architecture

```text
                    Sentinel

-------------------------------------------------------

Desktop

CLI

VSCode

Visual Studio

CI

Future Web

-------------------------------------------------------

↓

Sentinel Core API

-------------------------------------------------------

↓

Workspace

Project

Scanner

Quality

Rules

Plugins

Git

Reporting

Cache

Settings

Events

-------------------------------------------------------

↓

Analyzer Providers

↓

clang-tidy

Cppcheck

IWYU

Future

```

Notice something.

Everything talks only to

```text
Core API
```

Nothing else.

---

# Golden Rule

No module knows another module.

Only interfaces.

Example

Workspace

doesn't know

Git.

Git doesn't know

Rules.

Scanner doesn't know

Desktop.

Everything goes through interfaces.

---

# Now let's define the Domains

This is exactly how I'd organize the project.

---

# Domain 1

## Workspace

Responsibility

Everything related to

```text
Projects

Folders

Files

Recent Projects

Search

Workspace State
```

Nothing else.

---

# Domain 2

## Scanner

Only responsible for

```text
Scheduling

Running

Stopping

Cancelling

Monitoring
```

Scanner does NOT understand

clang-tidy.

Huge difference.

---

# Domain 3

## Analyzer

Probably the most important.

Interface

```text
IAnalyzer
```

Implementations

```text
ClangTidy

Cppcheck

IWYU

MISRA

Future
```

Desktop never knows.

---

# Domain 4

## Diagnostics

Normalizes everything.

Regardless of source.

Example

```text
clang-tidy

↓

Cppcheck

↓

Compiler

↓

Custom Rule

↓

Diagnostic
```

One format.

---

# Domain 5

## Quality

One of the most valuable modules.

Responsible for

```text
Health

Score

Categories

Trends

Readiness

```

Notice

Quality does NOT know

clang.

---

# Domain 6

## Rules

Responsible for

```text
Profiles

Organization Rules

Rule Packs

Enable

Disable

Severity

```

---

# Domain 7

## Plugin System

Very important.

Everything

EVERYTHING

should be a plugin.

Even

```text
clang-tidy
```

---

Future

```text
Qt

Embedded

Security

Google

Medical

```

---

# Domain 8

## Git

Responsible only for

```text
Current Branch

Changed Files

Staged

Unstaged

Commit

History
```

---

# Domain 9

## Reporting

```text
SARIF

JSON

HTML

PDF

CSV
```

---

# Domain 10

## Cache

Huge performance improvement.

Stores

```text
Hashes

Scan Results

Diagnostics

Indexes

Quality

```

---

# Domain 11

## Event System

My favorite.

Nothing should call anything directly.

Instead

Everything emits events.

Example

```text
Scan Started

↓

Workspace receives

↓

UI updates

↓

Logger updates

↓

Notification updates

↓

Progress updates
```

Nobody knows each other.

Beautiful.

---

# APIs

Every UI

Desktop

CLI

VSCode

Visual Studio

uses same APIs.

Example

```text
OpenProject()

RunScan()

GetIssues()

GetQuality()

GetTrend()

ApplyFix()

Export()

InstallPlugin()
```

Notice

No UI

ever

talks to

clang.

---

# Plugin Architecture

This is where Sentinel becomes future proof.

Every plugin

```text
Manifest

Capabilities

Commands

Views

Analyzer

Rules

Actions
```

Very similar to VS Code.

---

# Internal Bus

I would NOT use REST internally.

I'd use

```text
Event Bus
```

Example

```text
Workspace Opened
```

↓

```text
Scanner

Quality

Git

UI

Logger

```

receive event.

No coupling.

---

# Database

I would actually use

SQLite.

Not because we need SQL.

Because

Eventually

you'll have

```text
History

Quality

Reports

Settings

Plugins

Projects

Scans
```

SQLite is perfect.

---

# Big Architectural Change

Here's the part where I disagree with almost every open-source tool.

Most tools think

```text
Project

↓

Scan

↓

Issues
```

I think Sentinel should think

```text
Project

↓

Knowledge

↓

Actions
```

Meaning

Scanning is only one way of collecting knowledge.

Later

Could add

```text
Compiler

Git

Coverage

Tests

Profiling

Benchmarks
```

All contribute.

Now Sentinel becomes

Engineering Dashboard.

Huge difference.

---

# I Want to Introduce One New Concept

This is my biggest contribution.

## Quality Engine

Currently

Everyone thinks

```text
Analyzer

↓

Warnings
```

No.

Instead

```text
Analyzer

↓

Diagnostics

↓

Knowledge Engine

↓

Quality Engine

↓

Insights

↓

Actions

↓

UI
```

This is what makes Sentinel unique.

Because UI never sees warnings.

It sees

Knowledge.

---

# Project Structure

This is NOT final.

But something like

```text
Sentinel/

    apps/

        desktop/

        cli/

        vscode/

        visualstudio/

    core/

        workspace/

        scanner/

        analyzer/

        diagnostics/

        quality/

        plugins/

        git/

        reports/

        cache/

        events/

        settings/

    sdk/

    plugins/

        clangtidy/

        cppcheck/

        iwyu/

    docs/

    tests/

    tools/

    samples/

```

Notice

No

```text
helpers

common

misc

utils
```

😁

Those folders destroy architectures.

---

# ⭐ Now I'm going to challenge one assumption you've had since day one

I don't think **Sentinel should start as a Desktop Application**.

😄 Hear me out.

I think the Desktop App should be **the first user-facing product**, but **not** the first software you build.

If I were CTO, the implementation order would be:

```text
1. Domain Model (pure C++)
        ↓
2. Core Engine (no UI)
        ↓
3. Plugin SDK
        ↓
4. Quality Engine
        ↓
5. Fake Analyzer (for testing UI)
        ↓
6. Desktop UI
        ↓
7. Real clang-tidy integration
        ↓
8. VS Code extension
        ↓
9. CLI
```

Why?

Because then **every UI is built on the exact same engine**, and you can develop the desktop interface using predictable fake data before worrying about LLVM integration. That's how teams at companies like Microsoft often decouple product development from complex backend integration.

---

# 🚀 If I were your co-founder

I'd actually stop writing architecture specs here.

The next document I'd create isn't **Spec 005**.

I'd create something much more important:

> **Sentinel RFC-001: The Quality Engine**

Because I believe **the Quality Engine is the heart of Sentinel**.

It's the piece that no existing tool really has.

It's what transforms raw diagnostics from clang-tidy, Cppcheck, and future analyzers into:

- A quality score
- Project readiness
- Prioritized actions
- Safe autofix opportunities
- Historical trends
- Developer guidance

That engine is what differentiates Sentinel from "a nice UI over existing tools." If we get that right, the rest of the platform naturally builds around it. I think that's where the real innovation lies.
