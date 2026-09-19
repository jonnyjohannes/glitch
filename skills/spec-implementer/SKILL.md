---
name: spec-implementer
description: >-
  Executes an approved plan file locally while maintaining its Current State,
  Plan Ledger, verification evidence, and handoff. Use when the user says to
  implement, execute, or build a ready spec and wants files changed accordingly.
tools: [Read, Write, Edit, Bash, Glob, Grep]
tags: [skill, implementation, execution, workflow]
---

# Spec Implementer

Turn an approved spec into verified reality without letting execution state drift away from the plan file.

## Interface

**Inputs**: a ready plan file conforming to [`contracts/spec`](../../contracts/spec/README.md) and execution approval
**Outputs**: implemented and verified ledger rows, with the plan file kept current beside the changed files
**Side effects**: edits project and plan files, runs verification commands, and creates commits via [[git-committer]]

## Contract

Read and follow [`contracts/spec/README.md`](../../contracts/spec/README.md). The same execution protocol applies locally and through remote adapters. This skill is the local orchestration entrypoint.

The plan file owns state. The implementation branch owns in-progress execution. Do not maintain a parallel todo list or standalone handoff.

## Approval boundary

Before approval, inspect the spec and repository read-only. Confirm:

- Metadata status is `ready`
- Readiness verdict is `ready`
- Executor is `unassigned`
- the ledger has concrete deliverables and verification methods
- the implementation branch is appropriate and no other executor owns the work
- `spec-check` passes

Present the execution order, affected areas, and verification commands. Require an explicit `go`, `implement`, `execute`, `approved`, or equivalent before modifying implementation files.

A remote handoff created specifically to implement a ready spec is the remote executor's approval. Do not require a second conversational gate inside the remote session unless the handoff says otherwise.

## Workflow

- [ ] Phase 1: Ingest and validate
- [ ] Phase 2: Confirm execution
- [ ] Phase 3: Claim and execute rows
- [ ] Phase 4: Reconcile, verify, and commit

### Phase 1: Ingest and validate

Read the complete plan, linked context, and relevant existing files. Run:

```bash
python3 /path/to/glitch/contracts/spec/spec-check.py docs/plans/<slug>.md
```

If the spec is not ready, do not invent missing requirements. Return to [[idea-specer]] with the concrete gaps.

Map ledger rows to affected files, systems, commands, and human actions. Preserve the approved order unless a dependency makes it unsafe.

### Phase 2: Confirm execution

Present a concise execution preview:

```text
P1 — <step>
  changes: <files, systems, or actions>
  verify: <declared check>

P2 — <step>
  changes: ...
  verify: ...
```

Cycle on scope feedback and update the spec while it remains in planning control. Once approved, treat the ledger as frozen except for status and evidence.

### Phase 3: Claim and execute rows

Claim execution in the plan before implementation:

- set Metadata status to `implementing`
- set Executor to `local`
- update Current State and Handoff
- move the first row from `[ ]` to `[~]`

Then process one row at a time:

1. Read the relevant existing files and conventions.
2. Make only the approved change.
3. Run the row's declared verification.
4. On success, replace `evidence: —` with a concise result and move `[~]` to `[x]`.
5. Refresh Current State and Handoff at meaningful checkpoints.
6. Move the next row to `[~]` and continue.

Keep plan-state edits close to the implementation they describe. For larger work, invoke [[git-committer]] at coherent verified milestones.

### Surprise protocol

If reality contradicts the spec or requires changed scope:

1. stop before improvising
2. move the active row to `[!]`
3. set Metadata status to `blocked`
4. record the contradiction and next decision in Current State and Handoff
5. present what changed, why the approved plan is unsafe, 2-3 options plus `other`, and a recommendation
6. return control to [[idea-specer]] for structural ledger or design changes

Resume only after the revised spec is ready and execution is approved again.

A routine implementation detail that stays within the approved deliverable is not a surprise. Use judgment; do not bounce trivial coding choices back to planning.

### Phase 4: Reconcile, verify, and commit

When all rows are `[x]`:

1. run cross-row and end-to-end verification from `## Verification`
2. ensure each completed row has credible evidence
3. set Metadata status to `done`, update Current State, and replace Handoff with the completed state and any human follow-up
4. rerun `spec-check`
5. invoke [[git-committer]] to create intentional atomic commits
6. report commits, verification, residual risks, and user-owned next actions

If verification fails, do not mark the affected row or document done. Record the failure and either continue within approved scope or use the surprise protocol.

## Remote equivalence

When execution is delegated, the remote adapter must give the executor this same contract. The remote implementation branch—not the local base branch—owns in-progress ledger updates. Its PR must return implementation, plan-state changes, verification evidence, and intentional commits together.

Only merging that branch makes its completed ledger authoritative on the base branch.

## Rules

- One spec, one ledger, one active executor, one execution branch.
- Never silently change approved scope, goals, row structure, or verification.
- Mark `[x]` only after verification succeeds and evidence is recorded.
- Git history carries progress history; the plan file shows current state.
- Never commit secrets or unrelated changes.
