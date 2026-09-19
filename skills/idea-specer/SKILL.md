---
name: idea-specer
description: >-
  Collaboratively turns a fuzzy idea, desired outcome, or existing plan into a
  durable implementation-ready spec with a visual flow, Plan Ledger, readiness
  verdict, and current handoff. Use when the user asks what the plan is, wants to
  develop an idea, design technical or non-technical work, or continue a plan doc.
tools: [Read, Write, Edit, Glob, Grep, Bash]
tags: [skill, planning, design, workflow]
---

# Idea Specer

Start with “what do I want?” and shape the answer into a durable spec another executor can safely implement.

## Interface

**Inputs**: fuzzy intent, desired outcome, referenced context, or an existing `docs/plans/<slug>.md`
**Outputs**: a current plan file conforming to [`contracts/spec`](../../contracts/spec/README.md), with a ready or not-ready verdict
**Side effects**: creates or edits plan files, runs the spec checker, and may commit meaningful plan milestones via [[git-committer]]

## Contract

Read and follow:

- [`contracts/spec/README.md`](../../contracts/spec/README.md) — state, ownership, ledger, readiness, and handoff rules
- [`contracts/spec/template.md`](../../contracts/spec/template.md) — canonical plan shape
- [`contracts/spec/spec-check.py`](../../contracts/spec/spec-check.py) — deterministic structural gate

The plan file is the source of truth. Conversation discovers and challenges the idea; the file retains what lands.

## Boundaries

This is planning work. Read repositories and references, run read-only investigation, and edit only the plan artifact. Do not modify implementation, runtime, migration, configuration, or test files.

If implementation is requested, finish the readiness gate and hand the approved spec to [[spec-implementer]] locally or a remote execution adapter such as [[devin-handoff]].

If `reference.local.md` exists beside this skill and the plan depends on organization-specific context, read it as a private overlay. Keep the portable spec free of unsupported internal assumptions.

## Workflow

- [ ] Phase 1: Orient around the want
- [ ] Phase 2: Materialize the spec
- [ ] Phase 3: Shape the model and decisions
- [ ] Phase 4: Build the execution baseline
- [ ] Phase 5: Run the readiness gate

### Phase 1: Orient around the want

For new work, establish:

1. **Want** — what should become true, and why does it matter?
2. **Now** — what is true today?
3. **Boundary** — what belongs inside and outside this effort?
4. **Proof** — what observable result would satisfy the user?

Investigate referenced code, docs, systems, or prior art before asking questions those sources can answer. Ask remaining questions as 2-3 concrete alternatives plus `other`. Develop shared vocabulary rather than forcing premature terminology.

For existing work, read the whole plan and summarize its status, ledger, decisions, open questions, handoff, and likely next move.

### Phase 2: Materialize the spec

Create `docs/plans/<slug>.md` early from the canonical template. Suggest that path unless the repository has another convention. Fill known information and mark genuine unknowns explicitly while status remains `planning`.

Keep the dashboard sections near the top current:

- Metadata
- Abstract
- Current State
- Plan Ledger
- Readiness
- Handoff

Do not create parallel dashboards, standalone handoffs, or supporting artifact trees unless the work clearly outgrows one file.

### Phase 3: Shape the model and decisions

Design conversationally. Reflect settled decisions into the file as they emerge rather than transcribing the chat.

Use an ASCII boxes-and-arrows model by default when components, actors, states, or dependencies interact. The model should make ownership and transitions understandable to the user and a fresh executor.

Cover only what the work needs:

- desired and current states
- system or operating boundaries
- interfaces, inputs, outputs, and ownership
- decisions and rejected alternatives
- failure modes and stop conditions
- rollout, migration, or human actions
- verification and acceptance

When investigation invalidates the current direction, stop and present what changed, why it matters, 2-3 revised paths plus `other`, and a recommendation. Update the spec after the user decides.

### Phase 4: Build the execution baseline

Translate the design into stable ledger rows following the spec contract. Every row needs:

- a stable ID
- one concrete deliverable
- an observable verification method
- empty evidence until execution

Order rows so each leaves the work in a coherent state. Name affected files, systems, dependencies, or human actions where knowable. Do not duplicate the ledger into a second implementation checklist.

Refresh `## Handoff` with the latest established state and the next planning or execution action. The handoff is a resume view, not a separate plan or history log.

### Phase 5: Run the readiness gate

Resolve or explicitly defer open questions, then run:

```bash
python3 /path/to/glitch/contracts/spec/spec-check.py docs/plans/<slug>.md
```

Also apply the qualitative readiness gate in the contract. The checker validates shape; it cannot prove that decisions or verification are good.

**Not ready?** Keep status `planning`, set verdict `not-ready`, list concrete gaps, and continue shaping the spec.

**Ready?**

1. set Metadata status to `ready` and Executor to `unassigned`
2. set Readiness verdict to `ready` and record no blocking gaps
3. refresh the handoff with the chosen next path: local or remote execution
4. rerun `spec-check`
5. use [[git-committer]] at this meaningful durable boundary
6. report that [[spec-implementer]] can proceed without inventing important requirements

## Rules

- Start from the human want; do not mistake the first proposed solution for the goal.
- Preserve explicit user decisions and make uncertainty visible.
- Keep one plan file and one ledger as the durable center of gravity.
- Planning owns ledger structure; execution owns row status and evidence.
- Readiness means safe to execute without important guessing, not exhaustive perfection.
- Never mark implementation work complete while acting as the specer.
