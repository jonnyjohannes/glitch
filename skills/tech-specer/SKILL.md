---
name: tech-specer
description: >-
  Collaboratively designs and writes implementation-ready technical specs,
  durable plans, and progress ledgers through conversation. Use when the user
  wants to write a tech spec, plan longer-running feature work, architect a
  solution, or continue an existing planning file.
tools: [Read, Write, Edit, Glob, Grep, Bash, Skill]
tags: [skill, authoring, planning, docs]
---

# Tech Specer

Design partner that turns messy intent into a durable planning artifact an implementing agent can trust.

## Interface

**Inputs**: problem description + referenced files/docs/code, or an existing spec file to continue
**Outputs**: implementation-ready tech spec markdown file with an implementation plan and Plan Ledger
**Side effects**: creates/edits planning docs, commits via [[git-committer]], may checkpoint via [[handoff-writer]]

## Core Contract

This is the planning half of a skill-centered plan mode:

```text
tech-specer = investigate + decide + document
feature-builder = approve + implement + update progress
handoff-writer = checkpoint + resume context
```

## Conventions

### the file is the source of truth

Create the spec file early — even if it's mostly scaffold and TODOs. As the conversation produces decisions, update the file to reflect them. The file should always represent the current state of the design, clean and readable. Conversation is ephemeral; the file persists.

### planning boundary

During this skill, do not modify implementation/source files, tests, configs, migrations, or runtime assets. You may read code, run read-only inspection commands, and edit only the spec/planning artifact.

If implementation changes become necessary, stop once the spec and ledger are ready, then hand off to [[feature-builder]] after user confirmation.

### Plan Ledger

For non-trivial or longer-running work, every implementation-ready spec should include a `## Plan Ledger`. This is the durable todo/progress list that replaces ephemeral plan-mode todos.

Use these status markers:

- `[ ]` not started
- `[~]` in progress
- `[x]` done and verified
- `[!]` blocked

Each ledger row should include a concrete deliverable and verification method. Keep the ledger aligned with `## Implementation Plan`; [[feature-builder]] owns execution-time status updates.

### commit often

Invoke [[git-committer]] whenever the file reaches a meaningful state — after scaffolding, after a section solidifies, after resolving TODOs, or after a major plan change. Don't let decisions pile up uncommitted.

### resumable

The user may invoke this skill with an existing spec file. Read it, orient to where things stand, check `TODO` markers and `## Plan Ledger` status, then continue. The file is the session state.

### TODO resolution

When encountering `TODO` markers left by you or the user, resolve autonomously where possible. For anything needing input, use [[AGENTS]] structured feedback — present 2-3 alternatives + `other` and cycle.

### surprise protocol

If investigation invalidates the current plan, stop and present:

- what changed
- why the existing plan is unsafe or stale
- 2-3 revised options
- your recommendation

After the user chooses, update the spec and ledger before proceeding.

### long-running checkpoints

For work likely to span sessions or context windows, use [[handoff-writer]] at natural boundaries: after finalizing the spec, after a major surprise, before stopping, or after several implementation milestones.

Keep roles distinct:

```text
spec = what/why/design
ledger = execution plan/progress
handoff = where this session stopped and how to resume
```

## Workflow

### Phase 1: Orient

**New spec**: understand the problem space. Read referenced files, docs, or code using read-only inspection. Ask clarifying questions in a single message covering gaps in problem, scope, constraints, and success criteria. Adapt depth to problem size.

**Resuming**: read the existing spec. Summarize current state, open TODOs, Plan Ledger status, and likely next focus. Ask the user what to focus on using 2-3 concrete options + `other`.

### Phase 2: Create the File

Ask where to save, suggesting `docs/specs/<name>.md`. Scaffold using the output format below — fill in what you know, mark unknowns with `TODO`, and include a Plan Ledger for non-trivial work. Commit the scaffold.

Skip when resuming.

### Phase 3: Design Conversationally

Think through the problem together. Ask questions, propose approaches, debate trade-offs — use [[AGENTS]] structured feedback for non-trivial choices. This is collaborative conversation, not a rigid section-by-section march.

As decisions crystallize, update the spec file to capture them. Commit at natural milestones.

Areas to cover as relevant:

- architecture and component boundaries
- data models and state management
- API contracts and interfaces
- key algorithms or business logic
- error handling and edge cases
- migration or rollout strategy
- implementation plan: ordered, independently verifiable steps
- Plan Ledger: durable status list for the same work
- testing strategy

Only cover what matters for the problem at hand.

### Phase 4: Finalize

Scan for remaining `TODO` markers — resolve or surface as choices. Do a consistency pass across goals, non-goals, detailed design, implementation plan, Plan Ledger, and testing strategy. Commit the final state.

### Phase 5: Implementability Check

The spec's consumer is an implementing agent such as [[feature-builder]]. Before calling it done, run this gate to verify the spec gives that agent enough signal to proceed without guessing.

**checklist** — evaluate each dimension, flag gaps:

- [ ] **no unresolved TODOs** — every `TODO` marker is resolved or explicitly deferred to open questions
- [ ] **interfaces defined** — API contracts, function signatures, data models have field names and types, not just prose descriptions
- [ ] **implementation steps are atomic** — each step in the implementation plan has a clear deliverable an agent can verify completion against
- [ ] **Plan Ledger present** — non-trivial work has durable status rows with deliverables and verification methods
- [ ] **dependencies explicit** — external services, libraries, existing code paths the implementation touches are named and located
- [ ] **edge cases enumerated** — error states, boundary conditions, and failure modes are listed, not left implicit
- [ ] **testability** — each component has at least one concrete assertion or verification method described

**verdict**:

- **ready** — all checks pass. Show the commit log and tell the user the spec is implementable by [[feature-builder]].
- **not ready** — list the gaps. Cycle back to Phase 3 to resolve them with the user, then re-run this check.

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

1. [Step with clear deliverable and verification method]
2. [Step with clear deliverable and verification method]

## Plan Ledger

Status: `[ ]` not started, `[~]` in progress, `[x]` done and verified, `[!]` blocked.

- [ ] 1. [Step name] — deliverable: [artifact/change]; verify: [test/check]
- [ ] 2. [Step name] — deliverable: [artifact/change]; verify: [test/check]

## Testing Strategy

- [How to verify each component works]
- [Edge cases to cover]

## Open Questions

- [Unresolved decisions or risks, if any]
```

## Guidelines

- **Conversation drives the design, the file captures decisions.** Talk freely, update the file when things land.
- **Planning-only by default.** Do not edit source code while this skill is active; hand off to [[feature-builder]] for implementation.
- **Be specific enough to implement from.** Include interface signatures, field names, error codes — whatever removes ambiguity. Phase 5 will catch you if you don't.
- **Scope the implementation plan.** Each step should be independently verifiable and mirrored in the Plan Ledger when the work is non-trivial.
- **Preserve user decisions.** When the user makes an explicit design choice, reflect it faithfully.
- **Use the codebase.** Read existing code to match naming conventions, patterns, and architecture.
