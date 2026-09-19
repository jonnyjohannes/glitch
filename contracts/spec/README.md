# Spec contract

Portable contract for turning an idea into durable, resumable, verifiable work. It applies whether execution happens locally, in Devin, in another agent harness, or by a human.

## Roles

```text
idea-specer                         active executor
───────────                         ───────────────
discover and model                 claim one execution branch
write/revise the plan ledger       advance ledger statuses
run readiness gate       ───────▶  implement approved rows
approve execution baseline         attach verification evidence
resume planning on surprises       stop when the spec is contradicted
```

The spec file owns state. Skills and agents only perform state transitions.

## Single-writer rule

Exactly one executor may own execution at a time. Its implementation branch contains the authoritative in-progress ledger.

- Local execution updates the spec beside local changes.
- Remote execution updates the spec on the remote implementation branch.
- The base branch remains the last accepted state until the implementation branch is merged.
- Do not independently advance the base-branch ledger while remote execution is active.

## Status transitions

```text
planning ──readiness gate──▶ ready ──claim──▶ implementing ──verify──▶ done
   ▲                           │                    │
   └──── revise spec ◀─────────┴──── blocked ◀─────┘
```

Allowed document statuses:

- `planning` — the spec and ledger may be structurally revised
- `ready` — the approved execution baseline; no executor has claimed it
- `implementing` — one executor is advancing the ledger
- `blocked` — execution found a contradiction, missing decision, or failed dependency
- `done` — every required ledger row is verified

## Plan ledger

Use stable row IDs and these markers:

- `[ ]` not started
- `[~]` in progress
- `[x]` completed and verified
- `[!]` blocked

Canonical row form:

```markdown
- [ ] P1 — concise step — deliverable: concrete artifact or change; verify: command or observable check; evidence: —
```

Rules:

1. `idea-specer` may add, remove, split, or reorder rows while planning.
2. The readiness gate freezes the ledger as the approved execution baseline.
3. The active executor may change row status and evidence, not silently change scope or verification.
4. At most one row should be `[~]` unless the spec explicitly allows parallel execution with separate ownership.
5. A row becomes `[x]` only after its verification succeeds; replace `evidence: —` with the result.
6. A contradiction moves the row to `[!]`, the document to `blocked`, and control back to planning.
7. Git history is the event log. Keep the current ledger concise rather than appending progress diaries.

## Readiness gate

A spec is `ready` when a fresh executor can proceed without inventing important requirements:

- desired outcome, current state, scope, and non-goals are explicit
- the boxes-and-arrows flow or equivalent operating model is understandable
- decisions affecting execution are made
- dependencies and affected systems or files are named where knowable
- ledger rows have concrete deliverables and verification methods
- important failure modes and stop conditions are identified
- open questions are resolved or explicitly deferred outside the approved scope
- the handoff names the next action
- `spec-check` passes

Readiness means safe to execute, not exhaustive or perfect.

## Execution protocol

The local `spec-implementer` skill and remote handoff prompts apply the same protocol:

1. Read the complete spec and confirm it is `ready`.
2. Treat execution authorization as a separate gate: local execution needs explicit approval; a remote implementation handoff is itself approval.
3. Claim execution by setting status to `implementing`, naming the executor, and moving one row to `[~]`.
4. Implement only the approved row.
5. Run its declared verification and record concise evidence.
6. Move it to `[x]`, then claim the next row.
7. If reality contradicts the spec, mark `[!]`, set status to `blocked`, update the handoff, and stop for a planning decision.
8. When all rows are verified, set status to `done`, refresh the handoff, and apply repository git discipline.

## Handoff section

`## Handoff` is a current resume view over the spec, not a second plan or an append-only journal. The active role replaces it at readiness, meaningful checkpoints, blockers, and completion.

It should say:

- what was just established or completed
- who or what currently owns execution
- the next concrete action
- blockers or decisions needed
- relevant branch, PR, session, paths, or commands when available

## Remote reconciliation

For remote execution, the returned branch or PR must include both implementation and plan-state changes. Reconciliation checks:

- every `[x]` row has credible evidence
- code/files and ledger state agree
- blocked or added work is visible rather than silently omitted
- verification results are reported
- commits are intentional and contain no unrelated or secret material

Only merging the remote branch makes its ledger state authoritative on the base branch.
