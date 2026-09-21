---
name: flow-specer
description: >-
  Defines how to flow through an evolving body of work using a concrete spec
  artifact, an opt-in BRAINS conversation, and an autonomous MUSCLE executor.
  Use when Jonny invokes flow-specer, asks to get dialed in, or resumes an
  existing spec flow.
tools: [Read, Bash, Edit, Write]
tags: [skill, planning, workflow]
---

# Flow-specer

A spec for how to flow with the spec.

The default mode is **BRAINS**: contextualize the work around the interaction
protocol prescribed in [`references/BRAINS.md`](./references/BRAINS.md), and shape
the conversation into the concrete spec described by
[`assets/FLOW_SHAPE.md`](./assets/FLOW_SHAPE.md). The spec is the durable source
of truth; the conversation is the working surface.

## Interface

**Inputs**: the current conversation, repository context, and any active spec

**Outputs**: a context-shaped spec, a `ready` / `not ready` implementation
verdict, and—only when explicitly authorized—a handoff to MUSCLE

**Side effects**: may create or update spec and orientation files; implementation
and external handoffs require explicit authorization

## Activate

Read BRAINS completely when flow-specer is invoked. Enter BRAINS by default and
stay there while the work still needs thinking: establish shared vocabulary,
contextualize the body of work, pressure-test assumptions, smell-test the model,
and reconcile the spec artifact at meaningful checkpoints.

Use FLOW_SHAPE for a new spec unless the repository already has a compatible
convention. Do not impose this workflow outside an active flow-specer flow.

## Route MUSCLE

The existing implementation triggers remain explicit authorization to route the
single unambiguous active spec: “muscle it”, “implement it”, “hit it”, “spin it”,
or “execute it”. Do not interpret unrelated uses of “hit” or “spin” as
authorization.

The spec must be `ready`. If it is not, report `not ready` with the concrete
gaps and remain in BRAINS. If no single spec is unambiguous, ask the human to
select one.

MUSCLE is the autonomous implementation side of the boundary. Give the executor:

- the complete ready spec
- repository and git branch context
- the complete [`references/MUSCLE.md`](./references/MUSCLE.md) contract, supplied
  exactly once by the handoff mechanism

The executor has no special persona from flow-specer; repository instructions
and applicable `AGENTS.md` files provide its operating context. On return,
reconcile implementation changes, spec-state changes, verification evidence,
and commits against the spec rather than trusting a completion claim.

## Boundary

BRAINS owns thinking and spec readiness. MUSCLE owns execution after the spec is
implementation-ready. The boundary is simple: if an autonomous agent can
implement without inventing important requirements, route to MUSCLE; otherwise,
stay in BRAINS. Keep BRAINS and MUSCLE independently tunable: changes to one
should not require duplicating its behavior in this routing skill.
