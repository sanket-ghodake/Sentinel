I actually think **Spec 002** is the most important document of the entire project.

Most products fail here.

People jump into designing screens.

Google, Apple, Microsoft don't.

They first decide **what product they are building**.

Everything else becomes much easier.

---

# Sentinel Specification

# Spec 002

## Product Scope & Information Architecture

**Version:** 1.0

**Status:** Foundation

---

# 1. Product Definition

## Sentinel is

> A desktop-first developer experience platform that provides a unified interface for understanding, improving, and maintaining code quality across projects, regardless of the editor, IDE, or underlying analysis tools.

---

## Sentinel is NOT

To keep the product focused, Sentinel intentionally does **not** become:

❌ IDE

❌ Compiler

❌ Build System

❌ Git Client

❌ AI Code Generator

❌ IDE Replacement

❌ Compiler Explorer

❌ Text Editor

This is extremely important.

Every future feature should pass this filter.

---

# 2. Core Jobs

Instead of features...

Think Jobs.

Google PMs use this extensively.

---

## Job 1

I want to know

**Is my project healthy?**

---

## Job 2

I want to know

**What changed?**

---

## Job 3

I want to know

**Can I merge confidently?**

---

## Job 4

I want to know

**Which issues matter most?**

---

## Job 5

I want to know

**Which fixes are safe?**

---

## Job 6

I want to understand

**Why this rule exists.**

---

## Job 7

I want to apply

**Organization rules easily.**

---

Everything else is secondary.

---

# 3. User Personas

Instead of

Developer

We define real users.

---

## Persona A

Embedded Engineer

Uses

```text
Eclipse

Visual Studio

VS Code

Terminal
```

Needs

```text
Fast checks

Offline

MISRA

DO-178

AUTOSAR

```

---

## Persona B

Backend Engineer

Uses

```text
VS Code

CLion

Vim
```

Needs

```text
Modern C++

Performance

Quick Fixes

```

---

## Persona C

Team Lead

Needs

```text
Reports

History

Quality Trends

```

---

## Persona D

CI Engineer

Needs

```text
CLI

JSON

SARIF

Automation

```

---

# 4. Product Pillars

Every feature belongs to exactly one pillar.

---

## Pillar 1

Project Understanding

Questions answered

```text
What is this project?

How healthy?

What changed?
```

---

## Pillar 2

Issue Understanding

```text
What failed?

Why?

How severe?

How to fix?
```

---

## Pillar 3

Quality Improvement

```text
Autofix

Suggestions

Preview

Diff
```

---

## Pillar 4

Configuration

```text
Rules

Plugins

Profiles

Organizations

```

---

## Pillar 5

Reporting

```text
Trend

Export

History

Quality
```

---

Notice

Everything fits.

Nothing extra.

---

# 5. Navigation Model

This is where I slightly disagree with almost every developer tool.

Most tools expose

```text
Settings

Rules

Files

Compiler

JSON

YAML

Logs
```

Developers don't think like that.

---

Instead

Sentinel should expose

```text
🏠 Home

📁 Workspace

🔍 Insights

⚡ Actions

📈 Trends

🧩 Extensions

⚙ Settings
```

Notice

We say

Insights

Not Warnings.

Actions

Not Fixes.

---

# 6. Screen Hierarchy

```text
Sentinel

│

├── Home

│

├── Workspace

│

│      ├── File Tree

│      ├── Search

│      ├── File Overview

│

├── Insights

│

│      ├── Performance

│      ├── Memory

│      ├── Security

│      ├── Architecture

│      ├── Style

│

├── Actions

│

│      ├── Safe Fixes

│      ├── Batch Fix

│      ├── Preview

│

├── Trends

│

│      ├── Timeline

│      ├── Reports

│      ├── Comparison

│

├── Extensions

│

│      ├── Plugins

│      ├── Rule Packs

│

├── Settings
```

Only seven top-level pages.

---

# 7. Home Screen

The most important screen.

Should answer

within

5 seconds

```text
Is project healthy?

↓

Quality

95%

↓

Blocking Issues

0

↓

Changed Files

8

↓

Safe Fixes

12

↓

Ready to Merge

YES
```

Nothing else.

---

# 8. Workspace

Not editor.

Project Explorer.

Think Finder.

Explorer.

GitHub.

Not VS Code.

Purpose

```text
Browse

Search

Inspect

Understand
```

---

# 9. Insights

This is where Sentinel becomes different.

Not

```text
Errors

Warnings

```

Instead

```text
Performance

Memory

Security

Architecture

Maintainability

Modernization

```

Those are meaningful.

---

# 10. Actions

One of the strongest ideas.

Instead of

```text
Diagnostics
```

We show

```text
What can I do?
```

Example

```text
Apply

17 Safe Fixes

Review

4 Manual Fixes

Export

SARIF

Generate

HTML Report
```

Action oriented.

---

# 11. Trends

Nobody does this well.

Imagine

```text
Monday

89%

↓

Tuesday

90%

↓

Wednesday

93%

↓

Friday

95%
```

Click Wednesday

```text
Performance

+8

Memory

+3

Security

No Change
```

Awesome.

---

# 12. Extensions

Think VS Code Marketplace.

```text
Installed

clang-tidy

Cppcheck

clang-format

```

Future

```text
Marketplace

MISRA

AUTOSAR

Google

LLVM

Embedded

Qt

```

---

# 13. Design Rules

This becomes mandatory.

---

## Rule 1

No screen should exceed

7 major sections.

---

## Rule 2

No page should require horizontal scrolling.

---

## Rule 3

Developer should never read YAML.

Everything configurable through UI.

---

## Rule 4

Every warning must explain

```text
Why

Impact

Fix

```

---

## Rule 5

Never expose raw tool output.

Always normalize.

---

## Rule 6

Every page should have

```text
Primary Action
```

Example

Workspace

```text
Scan
```

Insights

```text
Review
```

Actions

```text
Apply
```

Reports

```text
Export
```

---

# 14. Universal Search

Like

VS Code

Notion

Linear

```text
Ctrl + K
```

Search

```text
Files

Issues

Rules

Plugins

Reports

Functions

Classes
```

One search.

---

# 15. Command Palette

Every action.

```text
Run Scan

Scan Changed

Export

Apply Safe Fixes

Install Plugin

Open Reports

```

Keyboard first.

---

# 16. Empty States

Very important.

Instead of

```text
No Issues
```

Show

```text
Excellent.

Project passed all enabled checks.

```

Psychology matters.

---

# 17. Error States

Never

```text
Compilation Database Missing
```

Instead

```text
Sentinel couldn't locate compile_commands.json.

Create one?

Open Guide

Browse

Ignore
```

Huge UX difference.

---

# 18. Product Flow

This becomes the golden path.

```text
Open Project

↓

Scan

↓

Understand

↓

Fix

↓

Review

↓

Commit

↓

Done
```

Every feature must support this flow.

---

# 19. Success Criteria

A first-time user should

without documentation

be able to

```text
Open project

Run scan

Understand quality

Fix issues

Export report

```

within

10 minutes.

---

# 20. My biggest recommendation (this is the one I'd insist on if I were your Chief Product Officer)

I think the navigation above is **good**, but I think we can make it even better by changing how we think about the product.

Instead of organizing Sentinel around **features**, organize it around **developer questions**.

Imagine the sidebar looked like this:

```text
🏠 Overview
📂 Project
❗ What's Wrong?
🛠 What Can I Fix?
📊 Progress
🧩 Rules & Extensions
⚙ Settings
```

Every item answers a question a developer naturally asks.

That is easier to learn than menus named after implementation concepts like "Diagnostics," "Analyzers," or "Plugins."

---

## Before we design any pixels

I think we should produce **Spec 003**, but I would **not** jump into colors or buttons yet.

Instead, Spec 003 should define the **Design Language**:

- What kind of product should Sentinel feel like?
- What emotional response should it create?
- What typography philosophy should it follow?
- How dense should information be?
- When should we use cards versus tables?
- How do we visualize quality without overwhelming developers?

That's the document that turns Sentinel from "another engineering tool" into a product developers genuinely enjoy opening every day. I think it's the step that will have the biggest impact on the final UX.
