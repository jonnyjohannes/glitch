# Brains

The interactive planning protocol for turning an evolving conversation into a durable plan, pressure-testing it with the human, and handing the ready plan to an independent executor.

The plan file is the source of truth for the work. Conversation is the working surface; the plan is the latest coherent projection of what matters.

Current state is more important than process history. Git preserves how the repository arrived here; plans, READMEs, indexes, and harness instructions must describe what is true now so a fresh executor can act without reconstructing the past.

Keeping the repository's orientation layer current is part of the flow, not optional cleanup. When behavior, structure, workflow, or ownership changes, update the relevant README, `GLITCH.md`, flow or skill index, and agent-harness adapter together. A stale README or harness instruction is an operational defect: it causes future work to begin from a false current state.

## When to use a spec

Use a durable spec when work is multi-step, decision-heavy, likely to span sessions, crosses system boundaries, carries meaningful risk, or may be handed to another executor.

Skip it for small, obvious, single-session changes where the plan would cost more than the work.

Default plan location:

```text
docs/plans/<slug>.md
```

Use [`FLOW_SHAPE.md`](../assets/FLOW_SHAPE.md) for new plans unless the repository has an established compatible convention.

## Lifecycle

```text
conversation ──materialize──▶ planning ──readiness──▶ ready
                                  ▲                    │
                                  │                    │ authorize + claim
                                  │                    ▼
                               blocked ◀──────── implementing ──verify──▶ done
```

Allowed lifecycle statuses:

- `planning` — the current model is still being formed; scope, design, and ledger may change
- `ready` — a general-purpose agent can implement without inventing important requirements
- `implementing` — one named executor owns execution on one branch
- `blocked` — implementation found a material contradiction, missing decision, or unavailable dependency
- `done` — approved work is complete and its claimed verification is recorded

Track verification separately from lifecycle status. Useful verification descriptions include `not run`, `partial`, `local passed`, `external pending`, and `verified`.

## Planning interaction

Planning starts conversationally. The human may provide incomplete, overlapping, provisional, or medium-coherent thoughts. Help establish shared vocabulary, expose structure, challenge weak premises, and draw the emerging flow without demanding premature completeness.

Do not treat the conversation as the durable artifact.

Create a plan when the user requests one or when enough stable shape exists that losing the current understanding would be costly. Usually this means there is a working topic, a roughly expressible desired outcome, and at least one meaningful boundary, flow, decision, constraint, or open question.

The plan may remain incomplete while its status is `planning`. Explicit uncertainty is valid; stale or internally contradictory state is not.

## Reconciliation

Once a plan exists, reconcile it after semantic checkpoints rather than after every message. A checkpoint occurs when:

- shared vocabulary stabilizes or changes
- the desired outcome, scope, or non-goals change
- the boxes-and-arrows model materially changes
- a consequential decision lands
- an open question is discovered or resolved
- ledger structure or verification expectations change
- the human edits the plan
- implementation reports a contradiction
- the conversation changes focus, stops, or hands off

At each checkpoint:

1. reread the current plan and preserve human-authored edits
2. determine what is now stale
3. replace stale descriptions instead of appending a session diary
4. reconcile Current State, Abstract, Flow, Decisions, Plan Ledger, Verification, and Open Questions
5. reconcile affected READMEs, indexes, `GLITCH.md`, and agent-harness instructions with the new current state
6. keep incomplete work and uncertainty explicit
7. briefly tell the human what materially changed in the files

The plan and orientation documents record current truth, not every path taken to reach it. Preserve rationale only when it captures a non-obvious constraint, explains a consequential rejected alternative, or prevents likely re-litigation. Git history carries incidental evolution: use it to investigate the past, not as a substitute for updating the current state.

## Visual model

Use an ASCII boxes-and-arrows model when three or more components, actors, states, stores, steps, or dependencies interact.

```text
boxes  = components, actors, or durable stores
arrows = named events, reads, writes, or contracts
labels = ownership, boundaries, and important guarantees
```

Show failure, blocked, or return paths when they affect design or execution. A diagram communicates the model; detailed interfaces and verification still belong in prose or tables.

## Plan Ledger

The Plan Ledger is the durable execution queue.

Use stable row IDs and these markers:

- `[ ]` not started
- `[~]` in progress
- `[x]` complete with the stated verification performed
- `[!]` blocked

Each row should identify:

- one bounded deliverable
- the verification that supports completion
- concise evidence once verified

Planning owns ledger structure: adding, removing, splitting, reordering, or changing scope and verification. Execution owns row status and evidence. Once status becomes `ready`, the ledger is the approved execution baseline.

Prefer rows that are independently understandable, verifiable, commit-sized, and resumable. Do not duplicate the ledger into a second implementation checklist.

## Readiness gate

Before changing status to `ready`, read the whole plan as if arriving without the conversation. Check that the repository's relevant README, indexes, `GLITCH.md`, and agent-harness instructions do not contradict the plan or current implementation.

A plan is ready when:

- the desired outcome and current state are concrete
- goals, non-goals, and important boundaries are explicit
- the flow and ownership model are understandable
- consequential decisions have landed
- dependencies and affected systems or files are named where knowable
- ledger rows have bounded deliverables and verification methods
- important failure modes and stop conditions are visible
- open questions are resolved or explicitly deferred outside approved scope
- Current State names the next action
- a general-purpose executor can proceed without guessing about important requirements

Readiness means safe to execute, not exhaustive or perfect. If the human asks whether a plan is implementable, report a clear `ready` or `not ready` verdict and concrete gaps. A fresh-context review is useful for consequential work but is not mandatory ceremony.

Changing status to `ready` does not itself authorize implementation.

## Handoff boundary

A ready plan is the handoff boundary. BRAINS does not claim implementation, mutate the
approved ledger, or replay the executor's implementation loop. Route the plan with
repository and branch context to an independent executor that receives the separate
MUSCLE contract exactly once.

The executor's returned diff, plan-state updates, verification evidence, and commits
are the evidence of implementation. Reconcile those results against the plan before
calling the work complete. If implementation reports a contradiction, return to BRAINS,
make the changed decision explicit, revise the plan, and rerun readiness.

## Template evolution

Use the current template for new plans. Existing plans do not need mechanical migration
when the template changes. Reconcile an active plan to newer structure only when doing
so materially improves clarity, state accuracy, or handoff safety.
