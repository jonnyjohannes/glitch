# Skill Suite Reorg

## Current State

- Status: core skill updates complete / scope check
- Last updated: 2026-07-12
- Current focus: decide whether PR/review skills need lightweight plan-doc awareness now, or defer until the core `docs/plans` convention has more mileage.
- Handoff lives in: [`## Handoff`](#handoff)
- Next action: choose whether to update PR/review skills now or stop after the core trio ([[tech-specer]], [[feature-builder]], [[handoff-writer]]).

## Handoff

Resume here by reading this file top to bottom, then continue from [`## Open Questions`](#open-questions) and [`## Plan Ledger`](#plan-ledger).

Current direction from the user:

- Keep the workflow fundamentals simple.
- Standardize on `docs/plans/<slug>.md`.
- Prefer `1 feature ~= 1 plan doc`.
- Centralize workflow state in markdown.
- Do not prioritize a dashboard/index entrypoint right now.
- Make current state and handoff obvious inside the plan doc itself.
- Treat `## Handoff` as the latest resume state, replacing stale content rather than accumulating append-only history.
- Defer composed/new skills until the fundamentals feel solid.
- [[tech-specer]] has been updated for the flat `docs/plans/<slug>.md` convention.
- [[feature-builder]] has been updated to maintain active `docs/plans/<slug>.md` docs while implementing.
- [[handoff-writer]] has been updated to replace `## Handoff` in active plan docs before falling back to standalone handoff docs.
- Next decision: whether to update PR/review skills now or defer them.

## Summary

This plan simplifies the earlier skill-suite reorg idea. Instead of a multi-artifact markdown bus with workflow indexes, task files, verification files, and dashboards, the first iteration should standardize a single markdown plan document per feature or workflow. Existing core skills should learn to read and update that plan doc consistently before any new composed skills are added.

## Problem Statement

The current skill suite has useful building blocks — planning, implementation, handoff, commit grouping, PR drafting, PR review, CI diagnosis, and meta-skill maintenance — but longer-running work still depends too much on chat context and ad hoc conventions.

The first attempted design introduced too much structure too early: workflow directories, an `index.md` dashboard, artifact maps, generated blocks, task artifacts, verification artifacts, and future composed skills. That may become useful later, but it is not the next fundamental layer.

The missing primitive is simpler:

```text
one feature / workflow -> one durable markdown plan doc
```

That plan doc should make current state, handoff, decisions, tasks, and verification clear enough that a later agent or skill can resume without reconstructing the chat.

## Goals

- Standardize a simple, flat markdown plan-doc structure.
- Use one plan doc as the default durable workflow state for a feature.
- Make current state and handoff/resume instructions obvious near the top of the doc.
- Keep existing skills composable through shared plan-doc conventions before adding new skills.
- Preserve markdown as the central workflow medium.
- Keep optional supporting docs possible, but exceptional.

## Non-Goals

- Do not build a workflow dashboard/index system in the first iteration.
- Do not create `workflow-indexer`, `task-sharder`, `verification-planner`, or similar composed skills yet.
- Do not require custom YAML frontmatter or machine-specific metadata blocks.
- Do not split every feature into multiple workflow artifacts by default.
- Do not rewrite every skill at once.

## Proposed Solution

### Directory Convention

Use a flat plan-doc directory:

```text
docs/plans/
  <slug>.md
```

Examples:

```text
docs/plans/skill-suite-reorg.md
docs/plans/checkout-replatform.md
docs/plans/search-ranking-debug.md
```

A single plan doc is the default. If supporting files become necessary later, they should be added intentionally, not as part of the baseline protocol.

### Plan Doc Contract

Each plan doc should include these sections, in this order when practical:

```markdown
# [Feature / Workflow Name]

## Current State

- Status: [planning | ready | implementing | blocked | done]
- Last updated: YYYY-MM-DD
- Current focus: ...
- Handoff lives in: [`## Handoff`](#handoff)
- Next action: ...

## Handoff

[How to resume, what matters now, what to read next.]

## Summary

[1-3 sentence overview.]

## Problem Statement

[What problem are we solving?]

## Goals

- ...

## Non-Goals

- ...

## Context

[Relevant repo/system/background notes.]

## Decisions

- ...

## Implementation Plan

1. ...

## Plan Ledger

Status: `[ ]` not started, `[~]` in progress, `[x]` done and verified, `[!]` blocked.

- [ ] 1. ... — deliverable: ...; verify: ...

## Verification

- ...

## Open Questions

- ...
```

The required core is:

- `## Current State`
- `## Handoff`
- `## Implementation Plan` or equivalent next-step section
- `## Plan Ledger` for non-trivial work
- `## Open Questions` when decisions remain

Everything else can scale with the problem.

### Current State Section

`## Current State` is the quick status surface. It should be short and updated whenever a skill materially changes the plan or implementation state.

It answers:

- What phase are we in?
- What is the current focus?
- Where is the handoff/resume information?
- What is the next action?
- Is anything blocked?

This replaces the earlier dashboard/index idea for now.

### Handoff Section

`## Handoff` is the explicit resume point. It should be written for a fresh agent or future self.

It should include:

- What to read first.
- What is already decided.
- What is in flight.
- What must not be forgotten.
- The next concrete action.

`## Handoff` should be a replace-current section: it contains the latest resume instructions, not an append-only history. Old handoff states are recoverable through git history. This keeps the plan doc useful for a fresh agent without forcing it to interpret stale resume notes.

`handoff-writer` should prefer replacing this section in the active plan doc before creating a separate handoff file. Separate handoff docs remain useful only when there is no active plan doc or when a very large handoff would clutter the plan.

### Skill Behavior Updates

#### `tech-specer`

- Default non-trivial planning output should be `docs/plans/<slug>.md`.
- Create the plan doc early.
- Keep `## Current State`, `## Handoff`, `## Implementation Plan`, `## Plan Ledger`, and `## Open Questions` current.
- Do not introduce workflow dashboards or multi-artifact structures by default.

#### `feature-builder`

- Accept `docs/plans/<slug>.md` as the preferred plan input.
- Read `## Current State`, `## Handoff`, `## Implementation Plan`, and `## Plan Ledger` before implementing.
- Maintain the active plan doc while implementing: update `## Current State`, `## Handoff`, and ledger rows at meaningful milestones.
- If blocked, mark affected ledger rows `[!]` and replace the handoff with the blocker and next options.

#### `handoff-writer`

- If an active plan doc exists, update its `## Handoff` section instead of defaulting to a separate handoff file.
- If no plan doc exists, continue writing a standalone handoff doc.
- Always make the resume path obvious.

#### `git-committer`

- No major behavior change.
- When committing plan-doc updates, keep commits scoped and readable.

#### `pr-drafter` / `pr-reviewer` / `pr-responder`

- If a plan doc exists, read it for context.
- Prefer `## Summary`, `## Decisions`, `## Verification`, and `## Current State` over reconstructing context from chat.
- Do not require additional workflow artifacts.

#### `skill-creator` / `skill-sharpener`

- Use this plan to update existing skill contracts once the simplified plan-doc convention is approved.
- Do not create new composed skills until the plan-doc convention has been dogfooded.

## Deferred Ideas

These may be useful later, but should wait:

- `workflow-indexer`
- `task-sharder`
- `verification-planner`
- `blast-radius-mapper`
- `review-packet-builder`
- generated artifact maps
- multi-file workflow directories
- dashboard-style progress indexes

If they return, they should compose around the single plan doc rather than replace it.

## Implementation Plan

1. Collapse this workflow from nested artifacts to one flat plan doc — deliverable: `docs/plans/skill-suite-reorg.md`; verify: old `docs/workflows/skill-suite-reorg/` artifacts are removed.
2. Finalize the plan-doc section contract — deliverable: approved section list, `docs/plans/<slug>.md` path, and replace-current handoff behavior; verify: no blocking open questions about structure.
3. Update `tech-specer` — deliverable: skill prefers `docs/plans/<slug>.md` and maintains `Current State`/`Handoff`; verify: skill instructions mention the simple flat convention.
4. Update `feature-builder` — deliverable: skill reads and updates plan docs; verify: ledger/current-state update behavior is explicit.
5. Update `handoff-writer` — deliverable: skill updates plan-doc `## Handoff` when available; verify: standalone handoff remains fallback.
6. Optionally update PR/review skills — deliverable: skills look for plan docs as context; verify: no multi-artifact assumptions are introduced.
7. Run skill cleanup — deliverable: touched skills are sharpened and `skills/README.md` is consistent; verify: final diff is scoped and readable.

## Plan Ledger

Status: `[ ]` not started, `[~]` in progress, `[x]` done and verified, `[!]` blocked.

- [x] 1. Simplify workflow artifact model — deliverable: this plan defines `1 feature ~= 1 plan doc`; verify: previous dashboard/index approach is deferred.
- [x] 2. Flatten this workflow — deliverable: `docs/plans/skill-suite-reorg.md`; verify: nested `docs/workflows/skill-suite-reorg/` files are removed.
- [x] 3. Finalize plan-doc contract — deliverable: required sections, `docs/plans/<slug>.md` path, and replace-current handoff behavior; verify: user confirmed the shape is enough.
- [x] 4. Update `tech-specer` — deliverable: revised skill instructions; verify: new plans are created as flat docs with `Current State` and `Handoff`.
- [x] 5. Update `feature-builder` — deliverable: revised skill instructions; verify: implementation progress updates the plan doc.
- [x] 6. Update `handoff-writer` — deliverable: revised skill instructions; verify: active plan docs receive handoff updates.
- [~] 7. Decide whether PR/review skills need lightweight plan-doc awareness now — deliverable: scope decision; verify: no unnecessary skill churn.
- [ ] 8. Commit final skill updates — deliverable: clean commits; verify: `git status` is clean except intentionally unrelated user edits.

## Verification

- `git status --short` shows the old nested workflow files removed and `docs/plans/skill-suite-reorg.md` present.
- The flat plan doc contains `## Current State` and `## Handoff` near the top.
- The plan does not require `index.md`, generated blocks, task-card directories, or custom workflow metadata.
- Existing skill update plan is limited to fundamentals: `tech-specer`, `feature-builder`, and `handoff-writer` first.

## Decisions

- Use markdown as the central workflow state.
- Prefer one flat plan doc per feature/workflow under `docs/plans/<slug>.md`.
- Put current state and handoff near the top of the plan doc.
- Treat `## Handoff` as replace-current resume state; git history carries older handoffs.
- Defer composed/new skills until the plan-doc convention is stable.
- Avoid custom top-level YAML frontmatter for workflow state.

## Open Questions

1. Are the required sections enough: `Current State`, `Handoff`, implementation/ledger, and open questions?
2. Which skills should be updated in the first pass: only `tech-specer`/`feature-builder`/`handoff-writer`, or also PR/review skills?

## Implementability Check

Current verdict: **mostly ready**.

Remaining scope decision:

- Decide whether to update PR/review skills now or defer them until the core `docs/plans` convention has been dogfooded more.
