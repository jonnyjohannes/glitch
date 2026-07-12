---
type: workflow-artifact
workflow: skill-suite-reorg
artifact: spec
status: draft
owner_skill: tech-specer
inputs:
  - chat://current-session
outputs:
  - ./10-spec.md
next:
  - workflow-indexer
  - task-sharder
  - verification-planner
updated: 2026-07-12
---

# Skill Suite Reorg: Markdown Artifact Bus

## Summary

This spec proposes reorganizing the local skill suite around composable markdown artifacts on disk. Instead of relying on hidden chat/session state or monolithic orchestration skills, each skill should act like a small bounded transform over durable `.md` files: read artifact(s), perform one workflow operation, write the next artifact(s), and advertise likely downstream skills.

## Problem Statement

The current skill suite has a strong lifecycle spine for planning, implementation, committing, PR delivery, review, CI triage, handoff, and meta-skill maintenance. However, composition between skills is mostly implicit: skills reference each other through wikilinks and conventions, but there is no shared artifact protocol that makes workflow state, handoffs, and next actions obvious from files alone.

This makes longer-running work more dependent on chat context and agent memory than desired. It also makes skill discoverability and orchestration drift easier: for example, `skills/README.md` can fall out of sync with actual `skills/*/SKILL.md` files.

## Goals

- Define a markdown artifact bus for skill workflows, using files on disk as the primary composition layer.
- Preserve small, single-responsibility skills instead of creating a monolithic project-manager skill.
- Make long-running workflows resumable from files without requiring the original chat context.
- Make downstream skill invocation explicit through artifact frontmatter and workflow indexes.
- Add complementary skills that fill routing, sharding, verification, risk, review-packet, and index-maintenance gaps.
- Dogfood the new workflow layout with this spec under `docs/workflows/skill-suite-reorg/`.

## Non-Goals

- Do not rewrite every existing skill at once.
- Do not introduce source-code/runtime implementation changes while planning this reorg.
- Do not replace `tech-specer`, `feature-builder`, `handoff-writer`, or `git-committer`; sharpen their interfaces where needed.
- Do not require a database, external state store, or hidden agent memory for workflow state.
- Do not make every artifact mandatory for every task; lightweight workflows should stay lightweight.

## Background

### Current Skill Suite

Current local skills observed in `skills/*/SKILL.md`:

#### Meta / Skill System

- `skill-creator` — creates new canonical skills.
- `skill-sharpener` — refines existing skills and updates README descriptions.

#### Planning / Execution Spine

- `tech-specer` — turns messy intent into implementation-ready specs with a Plan Ledger.
- `feature-builder` — implements approved plans/specs and updates durable ledgers.
- `handoff-writer` — snapshots session state into a handoff doc.
- `git-committer` — groups dirty working tree changes into atomic commits.

#### GitHub / Delivery

- `pr-drafter` — drafts PR descriptions from diffs, issues, builds, and docs.
- `pr-reviewer` — reviews GitHub PRs and posts summary/inline feedback.
- `pr-responder` — resolves review comments and replies inline.
- `renovate-pr-consolidator` — consolidates Renovate dependency PRs.

#### CI / Infra / Data / Delegation

- `buildkite-satisfier` — investigates Buildkite failures.
- `bigquery-data-explorer` — queries Wayfair BigQuery datasets safely.
- `devin-handoff` — delegates parallel/long-running tasks to cloud Devin sessions.

#### Docs / Knowledge

- `doc-polisher` — formats markdown and standardizes frontmatter metadata.
- `readme-updater` — updates repo README from current repo state.
- `jira-ticket-writer` — drafts Jira tickets from issue/code context.

#### Domain-Specific

- `rosetta-stoner` — transliterates/translates classical or sacred texts.

### Current Lifecycle Shape

```text
intent
  -> tech-specer
  -> feature-builder
  -> git-committer
  -> pr-drafter
  -> pr-reviewer / pr-responder
  -> buildkite-satisfier
  -> handoff-writer
```

This backbone is useful, but it currently lacks first-class workflow artifacts between stages.

## Proposed Solution

### Overview

Adopt a lightweight markdown artifact protocol and a workflow directory convention. Skills should compose by reading and writing typed `.md` artifacts with YAML frontmatter. A workflow-local `index.md` acts as the durable router: it inventories artifacts, summarizes current state, and recommends next skills.

The reorg should add a few narrowly scoped skills that operate on this artifact bus rather than enlarging existing skills.

### Detailed Design

#### Workflow Directory Layout

Default layout for non-trivial workflows:

```text
docs/workflows/<slug>/
  index.md                 # workflow router / current state
  00-brief.md              # problem, evidence, context, hypotheses
  10-spec.md               # design/spec; usually owned by tech-specer
  20-tasks.md              # task overview generated from spec/plan
  30-verification.md       # test/quality plan
  40-risk-impact.md        # blast radius, rollout, rollback, test gaps
  50-review-packet.md      # PR/reviewer-ready summary
  90-handoff.md            # resume point / continuation instructions
  99-retro.md              # lessons learned / suite improvements

  tasks/
    001-example-task.md
    002-example-task.md

  decisions/
    0001-example-decision.md
```

Artifacts are optional. A small change might only need `10-spec.md` or `20-tasks.md`; a larger change may use the full sequence.

#### Artifact Frontmatter Contract

Each workflow artifact should use minimal YAML frontmatter that makes it machine- and agent-readable:

```yaml
---
type: workflow-artifact
workflow: skill-suite-reorg
artifact: spec
status: draft
owner_skill: tech-specer
inputs:
  - ./00-brief.md
outputs:
  - ./10-spec.md
next:
  - task-sharder
  - verification-planner
updated: 2026-07-12
---
```

Recommended fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | string | Usually `workflow-artifact`. |
| `workflow` | string | Stable workflow slug. |
| `artifact` | string | Artifact kind: `index`, `brief`, `spec`, `tasks`, `verification`, `risk-impact`, `review-packet`, `handoff`, `retro`, `decision`, etc. |
| `status` | string | `draft`, `ready`, `in-progress`, `blocked`, `done`, or `superseded`. |
| `owner_skill` | string | Skill primarily responsible for maintaining the artifact. |
| `inputs` | list | Relative artifact paths or external context references consumed. |
| `outputs` | list | Relative artifact paths produced/updated. |
| `next` | list | Suggested downstream skills. |
| `updated` | date | Last material update date. |

This should stay intentionally small. Skill-specific metadata can be added only when it improves composition.

#### Skill Composition Model

Skills should behave like bounded transforms:

```text
inputs: markdown artifact(s), repo state, external context
work: one bounded operation
outputs: updated markdown artifact(s), optional external side effects
next: explicit recommended downstream skill(s)
```

Design principle:

```text
small skills + explicit artifact contracts + markdown files as workflow state
```

Avoid:

```text
one giant orchestration skill that plans, implements, tests, reviews, and documents everything
```

#### Existing Skill Adjustments

##### `tech-specer`

Update expected behavior so it can suggest workflow-local specs for non-trivial work:

- Current default: `docs/specs/<name>.md`.
- New preferred option for composable workflows: `docs/workflows/<slug>/10-spec.md`.
- Add artifact frontmatter when writing workflow-local specs.
- Preserve `## Plan Ledger` as the implementation-ready execution list.
- Include `next` suggestions such as `task-sharder`, `verification-planner`, or `feature-builder`.

##### `feature-builder`

Update ingestion priority:

1. Workflow task cards in `docs/workflows/<slug>/tasks/*.md`.
2. `docs/workflows/<slug>/20-tasks.md`.
3. `## Plan Ledger` in `10-spec.md` or other spec file.
4. `## Implementation Plan` in spec file.
5. Inline structured user request.

When working inside a workflow directory, it should update task-card status and/or Plan Ledger status close to implementation changes.

##### `handoff-writer`

Prefer workflow-local handoffs when a workflow directory is active:

```text
docs/workflows/<slug>/90-handoff.md
```

The handoff should link the relevant index/spec/tasks/verification artifacts.

##### `pr-drafter`

If a workflow directory is present, use `50-review-packet.md` first, then fall back to spec/tasks/verification/risk artifacts.

##### `pr-reviewer`

If reviewing a PR connected to a workflow directory, use `30-verification.md` and `40-risk-impact.md` as review context when available.

##### `skill-sharpener`

Continue ensuring individual skills are clean and discoverable, but delegate full index regeneration to `skill-indexer` once it exists.

#### New Skill: `workflow-indexer`

Purpose: maintain the workflow router artifact.

Owns:

```text
docs/workflows/<slug>/index.md
```

Responsibilities:

- Inventory workflow artifacts and task cards.
- Summarize current state from artifact frontmatter and key sections.
- List blockers/open questions.
- Recommend next 2-3 skills/actions.
- Detect stale links, missing expected artifacts, or status inconsistencies.

Non-responsibilities:

- Does not design solutions; use `tech-specer`.
- Does not implement; use `feature-builder`.
- Does not expand tasks; use `task-sharder`.

#### New Skill: `task-sharder`

Purpose: split an approved spec/implementation plan into independently executable task cards.

Inputs:

```text
docs/workflows/<slug>/10-spec.md
```

Outputs:

```text
docs/workflows/<slug>/20-tasks.md
docs/workflows/<slug>/tasks/*.md
```

Each task card should include:

- Objective.
- Dependencies.
- Likely files/directories touched.
- Acceptance criteria.
- Verification commands/checks.
- Delegateability: `local`, `devin`, `human`, or `either`.
- Status marker compatible with Plan Ledger markers: `[ ]`, `[~]`, `[x]`, `[!]`.

#### New Skill: `verification-planner`

Purpose: create a reusable verification plan independent of implementation.

Owns:

```text
docs/workflows/<slug>/30-verification.md
```

Responsibilities:

- Extract unit/integration/e2e/manual test needs from spec and task cards.
- Name concrete commands to run where discoverable.
- Define expected outputs or assertions.
- List edge cases and failure modes.
- Track skipped verification and rationale.

Composes with:

- `feature-builder` — implementation-time checks.
- `pr-drafter` — PR testing summary.
- `pr-reviewer` — review checklist.
- `buildkite-satisfier` — CI failure context.

#### New Skill: `blast-radius-mapper`

Purpose: document risk and impact of a planned or actual change.

Owns:

```text
docs/workflows/<slug>/40-risk-impact.md
```

Responsibilities:

- Identify touched systems/modules/data flows.
- Call out risky assumptions.
- List downstream consumers or behavior changes.
- Identify config/schema/migration implications.
- Describe rollout, rollback, and observability needs when relevant.
- Highlight test gaps.

#### New Skill: `review-packet-builder`

Purpose: compile reviewer/PR-ready context from workflow artifacts.

Owns:

```text
docs/workflows/<slug>/50-review-packet.md
```

Responsibilities:

- Summarize what changed and why.
- Link brief/spec/tasks/verification/risk artifacts.
- Include test evidence and known limitations.
- Identify reviewer focus areas.
- Provide concise PR-body-ready content for `pr-drafter`.

#### New Skill: `skill-indexer`

Purpose: regenerate skill indexes from actual skill files.

Owns:

```text
skills/README.md
```

Optional secondary output:

```text
README.md
```

Responsibilities:

- Parse `skills/*/SKILL.md` frontmatter.
- Regenerate skills table sorted by skill name or category.
- Detect missing/duplicate/malformed descriptions.
- Avoid manual drift between skill files and index docs.

This is immediately useful because the current `skills/README.md` does not list all observed skills.

#### Optional Later Skill: `repo-cartographer`

Purpose: cache repo/system discovery in durable maps.

Potential outputs:

```text
docs/maps/repo.md
docs/maps/<subsystem>.md
```

This can reduce repeated discovery across `tech-specer`, `feature-builder`, `pr-reviewer`, and `readme-updater`, but it should be added after the workflow artifact bus stabilizes.

#### Optional Later Skill: `adr-writer`

Purpose: capture durable architectural decisions separately from implementation specs.

Potential outputs:

```text
docs/adr/0001-some-decision.md
docs/workflows/<slug>/decisions/0001-some-decision.md
```

This is useful when a decision should outlive a workflow-specific spec.

## Implementation Plan

1. Define the workflow artifact convention in this spec — deliverable: completed `10-spec.md`; verify: frontmatter and layout sections are present.
2. Create `docs/workflows/skill-suite-reorg/index.md` manually or via the future `workflow-indexer` design — deliverable: workflow router artifact; verify: links to this spec and current next actions.
3. Add `workflow-indexer` skill — deliverable: `skills/workflow-indexer/SKILL.md`; verify: it can regenerate/update workflow `index.md` from artifacts.
4. Add `task-sharder` skill — deliverable: `skills/task-sharder/SKILL.md`; verify: it can produce `20-tasks.md` and `tasks/*.md` from this spec.
5. Add `verification-planner` skill — deliverable: `skills/verification-planner/SKILL.md`; verify: it can produce `30-verification.md` for this reorg.
6. Add `skill-indexer` skill — deliverable: `skills/skill-indexer/SKILL.md`; verify: it updates `skills/README.md` to include all current skills.
7. Sharpen existing core skills for the artifact bus — deliverable: updates to `tech-specer`, `feature-builder`, `handoff-writer`, `pr-drafter`, and `pr-reviewer`; verify: each mentions workflow-local artifacts where relevant.
8. Add optional `blast-radius-mapper` and `review-packet-builder` skills if the first wave proves useful — deliverable: new SKILL.md files; verify: they produce their owned artifacts from this workflow.
9. Run index/docs cleanup — deliverable: refreshed `skills/README.md` and any root README skill references; verify: index matches `skills/*/SKILL.md`.
10. Final consistency pass — deliverable: all new/updated skills have coherent frontmatter, wikilinks, and bounded responsibilities; verify: `skill-sharpener` checklist passes for touched skills.

## Plan Ledger

Status: `[ ]` not started, `[~]` in progress, `[x]` done and verified, `[!]` blocked.

- [~] 1. Scaffold skill suite reorg spec — deliverable: `docs/workflows/skill-suite-reorg/10-spec.md`; verify: file exists with workflow artifact frontmatter and initial plan.
- [ ] 2. Decide artifact protocol details — deliverable: finalized frontmatter fields and workflow layout; verify: no unresolved protocol open questions.
- [ ] 3. Create workflow index artifact — deliverable: `docs/workflows/skill-suite-reorg/index.md`; verify: index links spec and lists next actions.
- [ ] 4. Design `workflow-indexer` — deliverable: skill contract in spec; verify: responsibilities, inputs, outputs, and non-responsibilities are clear.
- [ ] 5. Design `task-sharder` — deliverable: skill contract in spec; verify: task card schema is implementable.
- [ ] 6. Design `verification-planner` — deliverable: skill contract in spec; verify: verification artifact schema is implementable.
- [ ] 7. Design `skill-indexer` — deliverable: skill contract in spec; verify: README regeneration behavior is clear.
- [ ] 8. Decide first implementation wave — deliverable: prioritized list of skills/updates; verify: user confirms scope.
- [ ] 9. Prepare for implementation handoff — deliverable: final spec with no blocking TODOs; verify: implementability check passes for `feature-builder` or `skill-creator`/`skill-sharpener`.

## Testing Strategy

- Validate artifact protocol by using this workflow as the dogfood case.
- Confirm each new skill has a bounded artifact owner and does not overlap heavily with existing skills.
- Confirm existing skills have clear read/write behavior when workflow-local artifacts are present.
- Regenerate or manually compare `skills/README.md` against `skills/*/SKILL.md` to prove index drift is addressed.
- For generated task cards, verify each task can be implemented independently or has explicit dependencies.
- For verification artifacts, verify each test/check maps to a specific component, task, or risk.

## Open Questions

1. Should `docs/workflows/<slug>/index.md` be mandatory for every workflow, or only for multi-artifact workflows?
2. Should workflow artifact frontmatter use strict status values, or stay loose/freeform?
3. Should `task-sharder` create one overview plus task cards by default, or only task cards for larger specs?
4. Should `skill-indexer` fully own `skills/README.md`, making manual edits disposable, or preserve custom prose around a generated table?
5. Should optional skills like `blast-radius-mapper` and `review-packet-builder` be first-wave skills or wait until the core bus proves itself?

## Implementability Check

Current verdict: **not ready**.

Known gaps:

- Need user decisions on the open questions above.
- Need exact artifact templates for `index.md`, `20-tasks.md`, task cards, and `30-verification.md` before implementation.
- Need prioritization of first-wave skill creation vs existing skill sharpening.
- Need final scope boundary for whether this reorg should update only local `skills/` or also global installed skill locations.
