# Flow cues

A portable protocol for turning an evolving conversation into a durable plan, then handing that plan to a general-purpose local or remote agent for implementation.

The plan file is the source of truth for the work. Conversation is the working surface; the plan is the latest coherent projection of what matters.

## When to use a spec

Use a durable spec when work is multi-step, decision-heavy, likely to span sessions, crosses system boundaries, carries meaningful risk, or may be handed to another executor.

Skip it for small, obvious, single-session changes where the plan would cost more than the work.

Default plan location:

```text
docs/plans/<slug>.md
```

Use [`FLOW_SHAPE.md`](./FLOW_SHAPE.md) for new plans unless the repository has an established compatible convention.

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
5. keep incomplete work and uncertainty explicit
6. briefly tell the human what materially changed in the file

The plan records current truth, not every path taken to reach it. Preserve rationale only when it captures a non-obvious constraint, explains a consequential rejected alternative, or prevents likely re-litigation. Git history carries incidental evolution.

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

Before changing status to `ready`, read the whole plan as if arriving without the conversation.

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

## Execution authorization

Implementation requires an explicit human `go`, `implement`, `execute`, `approved`, or equivalent. Creating a remote implementation handoff for a ready plan counts as authorization for that remote executor.

Before mutation, the executor must:

1. read the complete plan and repository instructions
2. confirm status is `ready` and no executor is active
3. inspect the relevant current implementation
4. present or internally validate the ledger execution order
5. claim execution in the plan: set status to `implementing`, name the executor and branch, update Current State, and mark one row `[~]`

## Single-writer rule

One plan has one active executor on one implementation branch.

- Local execution updates the plan beside local implementation changes.
- Remote execution updates the plan on its remote branch.
- The base branch remains the last accepted state while a remote branch is active.
- Do not independently advance the base-branch ledger during remote execution.
- Merging the implementation branch makes its plan state authoritative on the base branch.

Session status is not implementation evidence. The returned diff, plan updates, tests, and other verification establish what happened.

## Implementation loop

Process one ledger row at a time unless the plan explicitly defines safe parallel ownership:

1. mark the row `[~]`
2. read the relevant code, docs, and repository conventions
3. implement only the approved deliverable
4. run its declared verification
5. record concise evidence and mark `[x]` only after verification succeeds
6. reconcile Current State and the next action
7. commit at coherent, verified boundaries when appropriate
8. claim the next row

Routine implementation details inside an approved boundary are the executor's responsibility. Do not bounce trivial choices back to planning.

## Surprise and blocked protocol

Stop before improvising when reality materially contradicts the plan, requires changed scope, invalidates an important interface, removes a required dependency, or makes the declared verification insufficient.

Then:

1. mark the active row `[!]`
2. set status to `blocked`
3. record what changed, why the plan is unsafe, and the next decision in Current State
4. return control to the human for planning
5. revise ledger structure or design only after that decision
6. rerun the readiness gate and obtain execution authorization again

Do not use `blocked` for ordinary implementation details that remain within approved scope.

## Completion

Before marking `done`:

- every required ledger row is `[x]`
- each completed row has credible verification evidence
- cross-cutting and end-to-end checks in `## Verification` have run or are explicitly recorded as external pending
- implementation and plan state agree
- Current State summarizes what landed, what was verified, what was not, and any human-owned follow-up
- commits are intentional and contain no unrelated or secret material

Code completion and operational verification may differ. Use status `done` only for the approved implementation scope, and keep deployment, production, or other external verification truthfully visible in the separate Verification field and section.

## Remote handoff

A remote executor receives:

- repository and branch context
- the approved plan path or contents
- this workflow as the execution protocol
- any minimal task-specific context not already in the plan

The remote branch must return implementation and plan-state updates together. On return, reconcile rather than trusting a remote `done` claim:

- compare each `[x]` row with the diff and evidence
- confirm blocked or omitted work remains visible
- review or rerun declared verification
- inspect commits for scope and secrets
- merge only when implementation and plan state agree

If a remote executor cannot access the plan by path, include the plan contents in the handoff payload. Never assume a local-only file exists in the remote checkout.

## Template evolution

Use the current template for new plans. Existing plans do not need mechanical migration when the template changes. Reconcile an active plan to newer structure only when doing so materially improves clarity, state accuracy, or handoff safety.
