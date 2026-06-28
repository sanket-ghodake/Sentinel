This is where I think we can do something really special.

Most developer tools are designed by engineers.

Very few are designed by **product designers**.

I don't want Sentinel to feel like:

- Eclipse
- Jenkins
- SonarQube
- Old Visual Studio
- Enterprise Java software

I want someone to open it and think:

> **"This feels like GitHub Desktop, Linear, Docker Desktop and Apple designed a code quality tool together."**

---

# Sentinel Specification

# Spec 003

# Design Language & UX Philosophy

Version 1.0

---

# One Sentence

> **Sentinel should reduce anxiety, not create it.**

Think about this.

Most developer tools scream.

```text
❌ 432 Warnings

❌ 18 Errors

❌ Build Failed

❌ Compiler Failed
```

Developers immediately become stressed.

Sentinel shouldn't.

---

# Design Goal

When someone opens Sentinel they should feel

```text
Calm

Focused

Confident

In Control
```

Not

```text
Overwhelmed
```

---

# Emotional Journey

This sounds strange.

But companies like Apple literally design products around emotions.

Let's do the same.

---

## Step 1

Open Project

Feeling

> Curious

---

## Step 2

Scanning

Feeling

> Waiting confidently

---

## Step 3

Results

Feeling

> I understand my project.

---

## Step 4

Issues

Feeling

> These are fixable.

---

## Step 5

Fixes

Feeling

> I'm making progress.

---

## Step 6

Quality improves

Feeling

> Satisfaction

---

That emotional journey matters.

---

# Product Personality

If Sentinel was a person...

It would be

```text
Calm

Professional

Helpful

Honest

Predictable

Knowledgeable

Never arrogant

Never noisy
```

---

It is NOT

```text
Excited

Flashy

Funny

Overly colorful

Chatty
```

---

# Information Philosophy

This is probably the most important page.

Most products show

```text
Everything.
```

Sentinel should show

```text
Only what matters now.
```

Example

Don't show

```text
487 Warnings
```

Show

```text
Project Health

92%

↓

5 Blocking

↓

18 Suggestions

↓

27 Safe Fixes
```

The user can drill deeper if needed.

---

# Progressive Disclosure

This principle is used heavily by Apple.

Information appears in layers.

```text
Overview

↓

Category

↓

Issue

↓

Explanation

↓

Technical Details

↓

Tool Output
```

Not all at once.

---

# Visual Hierarchy

Priority

```text
Project

↓

Quality

↓

Actions

↓

Insights

↓

Details

↓

Logs
```

Logs are almost never on the first screen.

---

# Density

This is where I disagree with many developer tools.

Developer != Dense UI

GitHub proves this.

Linear proves this.

Apple proves this.

Whitespace increases productivity.

---

Target

```text
60%

Content

40%

Whitespace
```

Never fill every pixel.

---

# Cards vs Tables

Most tools use tables.

I think cards should dominate.

Example

Instead of

```text
Issue

Severity

Rule

Tool

```

Use

```text
Performance

Vector copied

Estimated impact

3%

Apply

Explain
```

Much more readable.

---

Tables are still useful.

For

```text
Reports

History

Export

Rules
```

---

# Navigation

Always visible.

No hamburger menu.

Sidebar

```text
Overview

Project

Issues

Actions

Trends

Extensions

Settings
```

Simple.

---

# Search

Search is first-class.

Not hidden.

At top.

```text
Ctrl + K
```

Everything searchable.

---

# Command Palette

Everything should be executable.

```text
Run Scan

Apply Safe Fixes

Scan Changed Files

Install Plugin

Export Report
```

Keyboard-first users will love it.

---

# Notifications

Never interrupt.

Never popup.

Instead

Small indicator.

```text
3 New Suggestions
```

Developer decides when to review.

---

# Colors

This is where I have a strong opinion.

Don't use lots of colors.

Base UI

```text
White

Gray

Black
```

Accent

```text
Green

Healthy

Blue

Information

Orange

Suggestion

Red

Blocking
```

Nothing else.

---

# Icons

Minimal.

Lucide-style.

No skeuomorphic icons.

No gradients.

---

# Typography

Modern.

Readable.

Large headings.

Comfortable spacing.

Not tiny text.

---

# Animations

Extremely subtle.

Think

Apple.

Not gaming UI.

Every transition

150–250 ms.

Nothing should bounce.

---

# Language

Words matter.

Don't say

```text
Diagnostics
```

Say

```text
Insights
```

Don't say

```text
Compiler Output
```

Say

```text
Analysis Results
```

Don't say

```text
Violation
```

Say

```text
Issue
```

Don't say

```text
Fatal Error
```

Say

```text
Blocking Issue
```

---

# Health instead of Warnings

Huge mindset shift.

Current tools

```text
437 Warnings
```

Sentinel

```text
Quality

93%
```

Immediately feels better.

---

# Positive Reinforcement

Example

Instead of

```text
No Issues
```

Show

```text
Excellent.

Your project passed all enabled checks.

```

Psychology.

---

# Empty States

Beautiful.

Example

```text
No Plugins Installed

Install clang-tidy

Browse Marketplace
```

Not blank.

---

# Loading

Instead of spinner

```text
Scanning

Checking Performance

Checking Memory

Checking Architecture

Generating Summary
```

Developers like feedback.

---

# Dashboard Philosophy

The dashboard should answer

```text
Can I merge?

Can I release?

Should I worry?

```

Everything else is secondary.

---

# Issue Philosophy

Every issue should answer

```text
What happened?

Why?

How important?

Can I fix it?

Can Sentinel fix it?

```

---

# Reports

Reports shouldn't look like compiler logs.

They should look like executive dashboards.

Clean.

Printable.

Understandable.

---

# Accessibility

Mandatory.

Keyboard navigation.

Screen readers.

High contrast.

Scalable fonts.

Color-independent indicators.

---

# Design Inspirations

Not for copying.

Only inspiration.

## Apple

Minimalism

---

## GitHub

Information hierarchy

---

## Linear

Speed

---

## Docker Desktop

Dashboard organization

---

## Arc Browser

Polish

---

## Figma

Panels

---

## GitKraken

Git visualization

---

## Beyond Compare

Diff UX

---

# Three UX Principles I'd add

These are the ones I think could become Sentinel's signature.

## 1. "Quality at a Glance"

Every page should answer its main question in under five seconds. Users shouldn't hunt through tabs to understand the state of their project.

## 2. "Actions Before Explanations"

If there's something useful the developer can do—apply a safe fix, review a change, export a report—that action should be more prominent than the technical explanation. Details remain available, but the workflow starts with progress.

## 3. "Consistent Everywhere"

Whether someone is using the desktop app, a future VS Code extension, or the CLI output, the terminology, severity levels, icons, and quality metrics should all match. A developer should never have to relearn Sentinel because they're using a different client.

---

# One thing I would change before Spec 004

Everything we've written so far describes **how Sentinel should feel**.

Before we design individual screens, I would insert one more specification that many teams skip:

> **Spec 003.5 – Design System & Component Library**

This would define every reusable UI building block—navigation, cards, tables, charts, issue panels, quality gauges, dialogs, empty states, notifications, diff viewers, plugin cards, etc.

Why?

Because if we design the components first, then every screen in Sentinel will naturally look and behave consistently. That's how products like GitHub, Figma, Linear, and VS Code maintain a cohesive experience even as they grow over many years.

I think that extra investment will save enormous effort once implementation begins.
