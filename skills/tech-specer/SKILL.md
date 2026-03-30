---
name: tech-specer
description: >-
  Collaboratively design and write technical specs through conversation, persisting
  decisions to a spec file and committing often. Use when the user wants to write
  a tech spec, design a system, architect a solution, plan a feature, or continue
  working on an existing spec file.
tools: [Read, Write, Edit, Glob, Grep, Bash, Skill]
tags: [skill, authoring, docs]
---

# Tech Specer

Design partner that thinks through problems in conversation and persists decisions to a living spec file.

## Interface

**Inputs**: problem description + referenced files/docs/code, or an existing spec file to continue
**Outputs**: tech spec markdown file (`docs/specs/<name>.md` or `<name>-spec.md`)
**Side effects**: creates/edits spec file, commits via [[git-committer]]

## Conventions

### the file is the source of truth

create the spec file early — even if it's mostly scaffold and TODOs. as the conversation produces decisions, update the file to reflect them. the file should always represent the current state of the design, clean and readable. conversation is ephemeral; the file persists.

### commit often

invoke [[git-committer]] whenever the file reaches a meaningful state — after scaffolding, after a section solidifies, after resolving TODOs. don't let decisions pile up uncommitted.

### resumable

the user may invoke this skill with an existing spec file. read it, orient to where things stand, check for `TODO` markers, and continue. the file *is* the session state.

### TODO resolution

when encountering `TODO` markers (left by you or the user), resolve autonomously where possible. for anything needing input, use [[AGENTS]] structured feedback — present 2-3 alternatives + "other)" and cycle.

## Workflow

### Phase 1: Orient

**New spec**: understand the problem space. read referenced files, docs, or code. ask clarifying questions in a single message covering gaps in problem, scope, constraints, and success criteria. adapt depth to problem size.

**Resuming**: read the existing spec. summarize current state and open items. ask the user what to focus on.

### Phase 2: Create the File

ask where to save (suggest `docs/specs/<name>.md`). scaffold using the output format below — fill in what you know, mark unknowns with `TODO`. commit the scaffold.

skip when resuming.

### Phase 3: Design Conversationally

think through the problem together. ask questions, propose approaches, debate trade-offs — use [[AGENTS]] structured feedback for non-trivial choices. this is collaborative conversation, not a rigid section-by-section march.

as decisions crystallize, update the spec file to capture them. commit at natural milestones.

areas to cover as relevant:

- architecture and component boundaries
- data models and state management
- API contracts and interfaces
- key algorithms or business logic
- error handling and edge cases
- migration or rollout strategy
- implementation plan (ordered, independently verifiable steps)
- testing strategy

only cover what matters for the problem at hand.

### Phase 4: Finalize

scan for remaining `TODO` markers — resolve or surface as choices. do a consistency pass. commit the final state.

### Phase 5: Implementability Check

the spec's consumer is an implementing agent (e.g. [[feature-builder]]). before calling it done, run this gate to verify the spec gives that agent enough signal to proceed without guessing.

**checklist** — evaluate each dimension, flag gaps:

- [ ] **no unresolved TODOs** — every `TODO` marker is resolved or explicitly deferred to open questions
- [ ] **interfaces defined** — API contracts, function signatures, data models have field names and types, not just prose descriptions
- [ ] **implementation steps are atomic** — each step in the implementation plan has a clear deliverable an agent can verify completion against
- [ ] **dependencies explicit** — external services, libraries, existing code paths the implementation touches are named and located
- [ ] **edge cases enumerated** — error states, boundary conditions, and failure modes are listed, not left implicit
- [ ] **testability** — each component has at least one concrete assertion or verification method described

**verdict**:

- **ready** — all checks pass. show the commit log and tell the user the spec is implementable.
- **not ready** — list the gaps. cycle back to Phase 3 to resolve them with the user, then re-run this check.

## Output Format

```markdown

# [Title]

## Summary

[1-3 sentence overview of what this spec proposes and why.]

## Problem Statement

[What problem are we solving? Who is affected?]

## Goals

- [Concrete, measurable goal]

## Non-Goals

- [Explicitly out of scope item]

## Background

[Context a reader or implementing agent needs. Link existing systems, prior art.]

## Proposed Solution

### Overview

[High-level description of the approach.]

### Detailed Design

[Break into subsections at implementation-ready detail.]

#### [Component / Area 1]

[Design details, data models, interfaces, algorithms.]

## Implementation Plan

1. [Step with clear deliverable]
2. [Step with clear deliverable]

## Testing Strategy

- [How to verify each component works]
- [Edge cases to cover]

## Open Questions

- [Unresolved decisions or risks, if any]

```

## Guidelines

- **Conversation drives the design, the file captures decisions.** talk freely, update the file when things land.
- **Be specific enough to implement from.** include interface signatures, field names, error codes — whatever removes ambiguity. Phase 5 will catch you if you don't.
- **Scope the implementation plan.** each step should be independently verifiable.
- **Preserve user decisions.** when the user makes an explicit design choice, reflect it faithfully.
- **Use the codebase.** read existing code to match naming conventions, patterns, and architecture.
