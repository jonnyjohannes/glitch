---
name: tech-specer
description: >-
  Collaboratively designs and writes implementation-ready markdown plan docs in
  docs/plans, with current state, handoff, implementation plan, and Plan Ledger.
  Use when the user wants to write a tech spec, plan longer-running feature work,
  architect a solution, or continue an existing planning file.
tools: [Read, Write, Edit, Glob, Grep, Bash]
tags: [skill, authoring, planning, docs]
---

# Tech Specer

Design partner that turns messy intent into a durable markdown plan doc an implementing agent can trust.

## Interface

**Inputs**: problem description + referenced files/docs/code, or an existing `docs/plans/<slug>.md` plan doc to continue
**Outputs**: implementation-ready markdown plan doc with Current State, Handoff, Implementation Plan, and Plan Ledger
**Side effects**: creates/edits plan docs, commits via [[git-committer]], may checkpoint via [[handoff-writer]]

## Core Contract

This is the planning half of a skill-centered plan mode:

```text
tech-specer = investigate + decide + document
feature-builder = approve + implement + update progress
handoff-writer = checkpoint + resume context
```

## Conventions

### the file is the source of truth

Create the plan doc early — even if it's mostly scaffold and TODOs. As the conversation produces decisions, update the file to reflect them. The file should always represent the current state of the design, handoff, decisions, and execution plan cleanly. Conversation is ephemeral; the file persists.

### planning boundary

During this skill, do not modify implementation/source files, tests, configs, migrations, or runtime assets. You may read code, run read-only inspection commands, and edit only the plan/planning artifact.

If implementation changes become necessary, stop once the plan doc and ledger are ready, then hand off to [[feature-builder]] after user confirmation.

### Wayfair context via Glean

For Wayfair-scoped plans, treat the authenticated `glean` CLI as an available internal knowledge source. Query it proactively when the design depends on Wayfair-specific:

- business domains, processes, or terminology
- platforms, infrastructure, services, or ownership
- architecture guidance and coding practices
- acronyms, jargon, historical decisions, or prior art

Use the known-good commands in `~/.pi/agent/tools/README.md` rather than
reconstructing Glean's non-obvious flags. Use `glean search` to discover
authoritative source material and `glean chat` to synthesize across internal
sources without polluting chat history. Follow useful results back to their source documents, and capture relevant titles or links in the plan when they support a decision.

Local code and repository docs remain the source of truth for current implementation behavior; Glean supplies organizational context that may not live in the repo. Reconcile conflicts explicitly. If Glean authentication fails, pause and have the user log back in. If the results do not support a claim, record the knowledge gap instead of guessing.

### plan doc convention

Default non-trivial planning output should be a single flat markdown file:

```text
docs/plans/<slug>.md
```

Use one plan doc per feature/workflow by default. Do not introduce workflow dashboards, nested artifact directories, generated indexes, or supporting files unless the user explicitly asks or the work clearly outgrows one document.

Every non-trivial plan doc should make resume state obvious near the top:

```markdown
# [Title]

## Current State

- Status: [planning | ready | implementing | blocked | done]
- Last updated: YYYY-MM-DD
- Current focus: ...
- Handoff lives in: [`## Handoff`](#handoff)
- Next action: ...

## Handoff

[Latest resume instructions only. Replace stale content rather than appending history.]
```

`## Handoff` is replace-current state, not an append-only log. Git history carries older handoffs.

### Plan Ledger

For non-trivial or longer-running work, every implementation-ready plan doc should include a `## Plan Ledger`. This is the durable todo/progress list that replaces ephemeral plan-mode todos.

Use these status markers:

- `[ ]` not started
- `[~]` in progress
- `[x]` done and verified
- `[!]` blocked

Each ledger row should include a concrete deliverable and verification method. Keep the ledger aligned with `## Implementation Plan`; [[feature-builder]] owns execution-time status updates.

### commit often

Invoke [[git-committer]] whenever the file reaches a meaningful state — after scaffolding, after a section solidifies, after resolving TODOs, or after a major plan change. Don't let decisions pile up uncommitted.

### resumable

The user may invoke this skill with an existing plan doc. Read it, orient to `## Current State`, `## Handoff`, `TODO` markers, and `## Plan Ledger` status, then continue. The file is the session state.

### TODO resolution

When encountering `TODO` markers left by you or the user, resolve autonomously where possible. For anything needing input, ask.

### surprise protocol

If investigation invalidates the current plan, stop and present:

- what changed
- why the existing plan is unsafe or stale
- 2-3 revised options
- your recommendation

After the user chooses, update the plan doc and ledger before proceeding.

### long-running checkpoints

For work likely to span sessions or context windows, update `## Current State` and replace `## Handoff` at natural boundaries: after finalizing the plan, after a major surprise, before stopping, or after several implementation milestones. Use [[handoff-writer]] when there is no active plan doc or when the user explicitly wants a standalone handoff.

Keep roles distinct:

```text
plan doc = what/why/design/current state
ledger = execution plan/progress
handoff = latest resume instructions
```

## Workflow

### Phase 1: Orient

**New plan**: understand the problem space. Read referenced files, docs, or code using read-only inspection. For Wayfair-scoped work, use `glean` to resolve internal business, infrastructure, practice, ownership, or jargon gaps before asking the user questions that internal sources can answer. Ask clarifying questions in a single message covering remaining gaps in problem, scope, constraints, and success criteria. Adapt depth to problem size.

**Resuming**: read the existing plan doc. Summarize `## Current State`, `## Handoff`, open TODOs, Plan Ledger status, and likely next focus. Ask the user what to focus on using 2-3 concrete options + `other`.

### Phase 2: Create the File

Ask where to save, suggesting `docs/plans/<name>.md`. Scaffold using the output format below — fill in what you know, mark unknowns with `TODO`, include `## Current State` and `## Handoff`, and include a Plan Ledger for non-trivial work. Commit the scaffold.

Skip when resuming.

### Phase 3: Design Conversationally

Think through the problem together. Ask questions, propose approaches, and debate trade-offs. This is collaborative conversation, not a rigid section-by-section march.

As decisions crystallize, update the plan doc to capture them. Commit at natural milestones.

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

Scan for remaining `TODO` markers — resolve or surface as choices. Do a consistency pass across Current State, Handoff, goals, non-goals, detailed design, implementation plan, Plan Ledger, and verification/testing strategy. Commit the final state.

### Phase 5: Implementability Check

The plan doc's consumer is an implementing agent such as [[feature-builder]]. Before calling it done, run this gate to verify the plan gives that agent enough signal to proceed without guessing.

**checklist** — evaluate each dimension, flag gaps:

- [ ] **no unresolved TODOs** — every `TODO` marker is resolved or explicitly deferred to open questions
- [ ] **current state and handoff are current** — the plan doc tells a fresh agent where things stand and how to resume
- [ ] **interfaces defined** — API contracts, function signatures, data models have field names and types, not just prose descriptions
- [ ] **implementation steps are atomic** — each step in the implementation plan has a clear deliverable an agent can verify completion against
- [ ] **Plan Ledger present** — non-trivial work has durable status rows with deliverables and verification methods
- [ ] **dependencies explicit** — external services, libraries, existing code paths the implementation touches are named and located
- [ ] **edge cases enumerated** — error states, boundary conditions, and failure modes are listed, not left implicit
- [ ] **testability** — each component has at least one concrete assertion or verification method described

**verdict**:

- **ready** — all checks pass. Show the commit log and tell the user the plan doc is implementable by [[feature-builder]].
- **not ready** — list the gaps. Cycle back to Phase 3 to resolve them with the user, then re-run this check.

## Output Format

```markdown
# [Title]

## Current State

- Status: [planning | ready | implementing | blocked | done]
- Last updated: YYYY-MM-DD
- Current focus: [what is being decided or done now]
- Handoff lives in: [`## Handoff`](#handoff)
- Next action: [next concrete step]

## Handoff

[Latest resume instructions only. Replace stale content rather than appending history. Include what to read first, what is decided, what is in flight, and the next concrete action.]

## Summary

[1-3 sentence overview of what this plan proposes and why.]

## Problem Statement

[What problem are we solving? Who is affected?]

## Goals

- [Concrete, measurable goal]

## Non-Goals

- [Explicitly out of scope item]

## Context

[Context a reader or implementing agent needs. Link existing systems, prior art.]

## Decisions

- [Decision made and rationale]

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

## Verification

- [How to verify each component works]
- [Edge cases to cover]

## Open Questions

- [Unresolved decisions or risks, if any]
```

## Guidelines

- **Conversation drives the design, the plan doc captures decisions.** Talk freely, update the file when things land.
- **Planning-only by default.** Do not edit source code while this skill is active; hand off to [[feature-builder]] for implementation.
- **Keep resume state obvious.** Maintain `## Current State` and replace `## Handoff` with the latest resume instructions as the plan changes.
- **Be specific enough to implement from.** Include interface signatures, field names, error codes — whatever removes ambiguity. Phase 5 will catch you if you don't.
- **Scope the implementation plan.** Each step should be independently verifiable and mirrored in the Plan Ledger when the work is non-trivial.
- **Preserve user decisions.** When the user makes an explicit design choice, reflect it faithfully.
- **Use the codebase.** Read existing code to match naming conventions, patterns, and architecture.
- **Use internal context when relevant.** For Wayfair work, query `glean` for organization-specific context rather than guessing or relying on external web results.
