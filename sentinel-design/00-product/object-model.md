# Sentinel Object Model

## Purpose

Sentinel is an object-based product.

Screens, panels, CLI commands, reports, plugins, and APIs should all operate on the same core objects. This keeps Desktop, IDE extensions, CLI, CI, and future clients coherent.

## Product Principle

Design objects before screens.

GitHub is built around repositories, issues, pull requests, commits, branches, and releases. Docker is built around images, containers, volumes, and networks. Sentinel should be built around engineering knowledge objects.

## Domain Model

```text
Knowledge
├── Project
├── Module
├── Folder
├── File
└── Symbol

Quality
├── Scan
├── Analyzer
├── Issue
├── Rule
├── Fix
└── Quality Snapshot

Engineering
├── Git Commit
├── Branch
├── Pull Request
└── Release

Configuration
├── Plugin
├── Rule Pack
├── Profile
└── Organization

Insights
├── Trend
├── Report
├── Recommendation
└── Task
```

## Core Objects

### Project

Purpose:

Represents a software repository and acts as Sentinel's primary object.

Properties:

- name
- path
- language
- git status
- branch
- quality
- rules
- plugins
- history
- owner
- tags
- status
- statistics

Actions:

- open
- close
- scan
- rescan
- delete
- export
- share
- bookmark
- pin

Events:

- ProjectOpened
- ProjectClosed
- ScanStarted
- ScanFinished
- RulesChanged
- PluginChanged

### Issue

Purpose:

Represents a finding that may need attention.

Properties:

- title
- description
- severity
- confidence
- category
- analyzer
- rule
- location
- impact
- fix
- status
- owner

Actions:

- apply fix
- ignore
- assign
- bookmark
- explain
- open file
- compare

Events:

- IssueCreated
- IssueResolved
- IssueIgnored
- FixApplied

### Quality Snapshot

Purpose:

Represents project health at a point in time.

Properties:

- overall
- performance
- memory
- security
- architecture
- maintainability
- readability
- compliance
- trend
- confidence

Actions:

- compare
- view history
- explain
- export

Events:

- QualityChanged
- TrendUpdated

### Task

Purpose:

Represents recommended work the user can choose to perform.

Tasks are the main workflow object. Issues create tasks; tasks create actions.

Properties:

- type
- title
- description
- estimated time
- risk
- safety
- impact
- confidence
- source object

Actions:

- execute
- preview
- defer
- assign
- undo

Events:

- TaskCreated
- TaskCompleted
- TaskDeferred
- TaskUndone

### Action

Purpose:

Represents an executable operation that changes project state or Sentinel state.

Properties:

- type
- estimated time
- risk
- safe
- impact
- description
- preview
- undo strategy

Actions:

- execute
- preview
- undo

Events:

- ActionPreviewed
- ActionExecuted
- ActionUndone

### Rule

Purpose:

Represents a quality rule from Sentinel, a plugin, a rule pack, or an organization profile.

Properties:

- id
- name
- category
- description
- severity
- source
- enabled state
- configuration
- references

Actions:

- enable
- disable
- configure
- explain
- export

Events:

- RuleEnabled
- RuleDisabled
- RuleConfigured

### Plugin

Purpose:

Represents an installed or available capability provider.

Properties:

- name
- provider
- version
- capabilities
- status
- permissions
- configuration

Actions:

- install
- enable
- disable
- update
- configure
- uninstall

Events:

- PluginInstalled
- PluginEnabled
- PluginDisabled
- PluginUpdated
- PluginRemoved

## Object Catalog

The following objects complete the initial Sentinel domain catalog. Each should later be expanded into the universal object contract.

### Module

Purpose:

Represents a logical subsystem inside a project.

Key relationships:

- belongs to Project
- contains Folder, File, and Symbol objects
- depends on other Module or Dependency objects
- contributes to Quality Snapshot and Trend objects

Primary views:

- overview
- health
- dependencies
- files
- ownership

### Folder

Purpose:

Represents a filesystem grouping inside a project.

Key relationships:

- belongs to Project
- contains File and Folder objects
- may map to one or more Module objects

Primary views:

- contents
- quality
- recent activity

### File

Purpose:

Represents a source, header, configuration, or generated file known to Sentinel.

Key relationships:

- belongs to Project
- belongs to Folder
- may belong to Module
- contains Symbol objects
- can be referenced by Issue, Fix, Task, and Report objects

Primary views:

- summary
- issues
- symbols
- history
- diff

### Symbol

Purpose:

Represents a named code element such as a class, function, enum, macro, namespace, type, or variable.

Key relationships:

- belongs to File
- may belong to Module
- may be referenced by Issue, Dependency, and Recommendation objects

Primary views:

- definition
- references
- quality
- dependencies

### Scan

Purpose:

Represents an analysis run over a project, changed files, or selected scope.

Key relationships:

- belongs to Project
- uses Profile, Rule, Rule Pack, Plugin, and Analyzer objects
- produces Issue, Quality Snapshot, Recommendation, Task, Trend, and Report objects

Primary views:

- what's new
- results
- log
- configuration
- performance

### Analyzer

Purpose:

Represents an underlying analysis provider such as clang-tidy, Cppcheck, or IWYU.

Key relationships:

- provided by Plugin
- emits raw findings that Sentinel normalizes into Issue objects
- supports Rule and Fix objects

Primary views:

- capabilities
- status
- rules
- raw output

### Fix

Purpose:

Represents a proposed code or configuration change.

Key relationships:

- belongs to Issue or Task
- produces Action previews
- modifies File objects

Primary views:

- summary
- diff
- risk
- undo

### Git Commit

Purpose:

Represents a source-control change point.

Key relationships:

- belongs to Project
- belongs to Branch
- contributes to History, Trend, and Report objects

Primary views:

- summary
- changed files
- quality change
- related issues

### Branch

Purpose:

Represents an active line of development.

Key relationships:

- belongs to Project
- contains Git Commit objects
- can be compared with another Branch

Primary views:

- readiness
- changes
- quality delta
- history

### Pull Request

Purpose:

Represents a reviewable change set from a Git provider or local comparison.

Key relationships:

- belongs to Project
- compares Branch objects
- references Issue, Task, Report, and Quality Snapshot objects

Primary views:

- readiness
- diff
- quality change
- blocking tasks

### Release

Purpose:

Represents a release candidate or shipped version.

Key relationships:

- belongs to Project
- references Branch, Git Commit, Report, Quality Snapshot, and Profile objects

Primary views:

- readiness
- compliance
- evidence
- reports

### Rule Pack

Purpose:

Represents a grouped set of rules, usually for a language, framework, organization, or compliance standard.

Key relationships:

- contains Rule objects
- belongs to Plugin or Organization
- can be enabled by Profile

Primary views:

- overview
- rules
- coverage
- changes

### Profile

Purpose:

Represents an applied configuration for analysis, rules, plugins, and product behavior.

Key relationships:

- belongs to Project or Organization
- enables Rule Pack, Rule, Analyzer, and Plugin objects

Primary views:

- summary
- rules
- plugins
- inheritance

### Organization

Purpose:

Represents a team or company context for shared rules, profiles, reports, and governance.

Key relationships:

- owns Profile and Rule Pack objects
- may own Project objects
- produces Report and Trend objects

Primary views:

- projects
- profiles
- compliance
- reports

### Trend

Purpose:

Represents change over time for quality, issues, fixes, folders, modules, rules, or releases.

Key relationships:

- derived from History, Scan, Quality Snapshot, Issue, and Report objects

Primary views:

- timeline
- comparison
- breakdown
- explanation

### Report

Purpose:

Represents a shareable quality, compliance, or readiness artifact.

Key relationships:

- belongs to Project, Organization, Release, or Pull Request
- references Quality Snapshot, Issue, Rule, Task, and Trend objects

Primary views:

- summary
- evidence
- export
- history

### Recommendation

Purpose:

Represents a prioritized insight generated from project knowledge.

Key relationships:

- derived from Issue, Quality Snapshot, Trend, Rule, and History objects
- may create Task objects

Primary views:

- summary
- rationale
- impact
- related tasks

## Universal Object Contract

Every core object should eventually define:

- purpose
- relationships
- properties
- actions
- events
- permissions
- inspector representation
- API schema
- storage model

## Object Views

Every object can have multiple views.

Example Project views:

- overview
- quality
- files
- modules
- dependencies
- timeline
- reports
- activity
- settings

Example Issue views:

- summary
- explanation
- diff
- history
- references
- related issues
- fix

The UI should not treat these as unrelated screens. They are different perspectives on the same object.
