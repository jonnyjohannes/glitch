---
name: feature-builder
description: >-
  Implements approved features from docs/plans or other plan docs, preserving
  scope, maintaining Current State, Handoff, and Plan Ledger, verifying work, and
  committing. Use when the user says "build this", "implement this spec", "code
  this plan", "build the feature", or wants working code from an approved plan.
tools: [Read, Write, Edit, Bash, Glob, Grep, Skill]
tags: [skill, implementation, planning, workflow]
---

# Feature Builder

Turn an approved plan into working code while keeping durable progress state in sync.

## Interface

**Inputs**: `docs/plans/<slug>.md`, implementation plan, [[tech-specer]] output, Plan Ledger, or structured feature request
**Outputs**: working code implementing the approved plan, with the active plan doc kept current
**Side effects**: file writes, Current State/Handoff/Plan Ledger updates, verification commands, git commits via [[git-committer]], optional checkpoints via [[handoff-writer]]

## Core Contract

This is the execution half of a skill-centered plan mode:

```text
tech-specer = investigate + decide + document
feature-builder = approve + implement + update progress
handoff-writer = checkpoint + resume context
```

Before approval, stay read-only with respect to implementation/source files. You may edit the active plan doc to capture clarified scope, approach, or approval state. After approval, implement only the confirmed scope.

## Workflow

- [ ] Phase 1: Ingest the Plan
- [ ] Phase 2: Present Implementation Approach + Approval Gate
- [ ] Phase 3: Build and Track Progress
- [ ] Phase 4: Verify, Commit, and Handoff

## Phase 1: Ingest the Plan

Accept the plan from wherever it lives:

- **Plan doc path** — prefer `docs/plans/<slug>.md`
- **Other file path** — read it (`foo-plan.md`, `docs/specs/foo.md`, etc.)
- **Inline** — user pastes or describes it in conversation
- **Reference** — user names a plan written by [[tech-specer]] or similar
- **Structured doc** — any markdown with goals, steps, requirements, or a `## Plan Ledger`

Extract from the plan:

1. **Goal** — what are we building?
2. **Current state / handoff** — prefer `## Current State` and `## Handoff` when present
3. **Implementation steps** — ordered units of work; prefer `## Plan Ledger`, then `## Implementation Plan`
4. **Current status** — done, in-progress, blocked, and not-started work
5. **Constraints** — tech stack, patterns, conventions, performance requirements
6. **Scope boundaries** — what's in, what's out
7. **Verification** — tests, build steps, manual checks, or acceptance criteria

Read existing code to understand conventions, patterns, and architecture before proposing anything.

If the work is long-running and only exists inline, do not let it become ephemeral. Offer 2-3 concrete options:

- create or continue a `docs/plans/<slug>.md` plan doc via [[tech-specer]] — best for multi-session work
- add `## Current State`, `## Handoff`, and `## Plan Ledger` to an existing markdown plan — best when design is settled but progress must persist
- proceed inline — acceptable only for small, single-session work
- other

If the plan is vague or missing steps, ask the user to clarify — don't invent requirements.

## Phase 2: Present Implementation Approach + Approval Gate

Share your implementation approach as an ordered list of steps. Each step should be:

- **Concrete** — name the files, functions, or components you'll create/modify
- **Independently verifiable** — include the test, build, or check that proves completion
- **Small enough to reason about** — one logical concern per step
- **Scope-bound** — tied back to the approved plan or ledger row

```text
step 1: <what you'll do>
  - ledger: <matching Plan Ledger row, if present>
  - files: path/to/file.py, path/to/other.py
  - details: <brief explanation of approach>
  - verify: <test/build/manual check>

step 2: <what you'll do>
  - ledger: <matching Plan Ledger row, if present>
  - files: path/to/new_file.py
  - details: <brief explanation>
  - verify: <test/build/manual check>
```

Ask for an explicit go-ahead before writing implementation code. Accept clear phrases such as `go`, `build it`, `execute`, `looks good`, `approved`, or equivalent.

**Do not modify implementation/source files until the user confirms.** Before confirmation, you may read code, run read-only inspection commands, and edit the plan/spec only when the user asks to capture revisions.

Cycle on feedback — adjust steps, reorder, add/remove scope — until the user explicitly says go. If an active plan doc exists, capture approved scope changes there before implementation begins.

## Phase 3: Build and Track Progress

Implement each step from the confirmed plan, in order.

### Progress tracking

If the input is an active `docs/plans/<slug>.md` plan doc, maintain it while building:

- Update `## Current State` at meaningful milestones: status, current focus, and next action.
- Replace `## Handoff` with the latest resume instructions before stopping, when blocked, or after major milestones.
- Update `## Plan Ledger` as work progresses.

If the input plan/spec contains a checklist or `## Plan Ledger`, update it as work progresses:

- `[ ]` → `[~]` when starting a step
- `[~]` → `[x]` only after the step is verified
- `[~]` → `[!]` when blocked

Keep plan updates close to the code changes they describe. For larger features, commit progress updates with code changes at natural milestones.

If there is no durable ledger and the work becomes long-running, stop and offer to create or update a `docs/plans/<slug>.md` plan doc before continuing.

### Per step

1. **Mark progress** — update `## Current State` and the matching ledger row to `[~]`, if present
2. **Read** relevant existing code to match conventions
3. **Write/edit** the code — prefer editing existing files over creating new ones
4. **Verify** — run the step's test, build, typecheck, or manual check; catch breakage early
5. **Mark complete** — update the ledger row to `[x]` only after verification passes
6. **Refresh handoff** — for meaningful milestones, replace `## Handoff` with the latest resume state
7. **Brief status** — tell the user what completed and what verification ran

### Surprise protocol

If you hit a blocker or discover the plan needs adjustment, stop before improvising. If a ledger exists, mark the affected row `[!]`. If an active plan doc exists, update `## Current State` to `blocked` and replace `## Handoff` with the blocker and resume options. Then present:

- what changed
- why the existing plan is unsafe or stale
- 2-3 revised options
- your recommendation

After the user chooses, update the plan doc/ledger and continue from the revised approved scope.

## Phase 4: Verify, Commit, and Handoff

Once implementation is complete, or at natural checkpoints for larger features:

1. Run the relevant verification suite or clearly state what could not be run and why
2. Update the active plan doc: `## Current State`, `## Handoff`, `## Plan Ledger`, and verification notes
3. Invoke [[git-committer]] to group and commit cohesive changes, including plan-doc updates with related implementation changes where sensible
4. Show the user the final commit log and verification summary
5. For long-running work without an active plan doc, consider invoking [[handoff-writer]] before stopping

**Large features**: for plans with 5+ steps, commit at logical milestones rather than all at the end unless the user requests otherwise.

## Rules

- **Plan first, code second** — never skip the review and approval phase
- **Explicit approval required** — wait for a clear go-ahead before editing implementation/source files
- **Stay in scope** — implement what the plan says, nothing more
- **Track durable progress** — update `## Current State`, `## Handoff`, and `## Plan Ledger` when present; create a `docs/plans/<slug>.md` plan doc if long-running work would otherwise be ephemeral
- **Replace handoff, don't append stale handoffs** — `## Handoff` should always be the latest resume state; git history carries older versions
- **Surface surprises early** — if reality diverges from the plan, stop and discuss using the surprise protocol
- **Never commit secrets** — inherited from [[git-committer]] but worth repeating
- **Respect existing code** — read before writing, match conventions, don't reorganize what you weren't asked to touch
