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

**Inputs**: the current conversation, repository context, and—when resuming—an
active spec or enough information to locate it

**Outputs**: a context-shaped spec, a `ready` / `not ready` implementation
verdict, and—only when explicitly authorized—a handoff to MUSCLE

**Side effects**: may create or update spec and orientation files; implementation
and external handoffs require explicit authorization

## Activate

First decide whether this is a **new flow** or a **resume**. A `/flow-specer`
invocation in a fresh agent, session, or worktree can resume an existing flow;
that is not a request to create another worktree.

### Resume

1. Use a plan path the human provides. If none is provided, inspect the
   repository's conventional `docs/plans/` location and identify a clearly
   matching active plan. If there are multiple plausible plans, ask which one;
   do not guess.
2. Read the whole plan and applicable repository instructions. Treat the plan's
   current state as the durable context; do not require or try to reconstruct the
   conversation that produced it. Then continue in BRAINS or MUSCLE according to
   the plan's status and the human's request.
3. Stay in the current worktree. Do not create, switch, or claim another
   worktree just because this is a new session. If the plan is not available in
   this checkout, explain that it must be made available (for example, provide
   its path, or copy/commit it into this worktree) and pause rather than
   creating a replacement plan or worktree.

### New flow

For a genuinely new flow in a git repository, begin in a dedicated worktree
before starting spec work:

1. Check `git status --short`. If the current worktree has uncommitted changes,
   stop and ask how to preserve or carry them; `git wt` creates a new branch from
   the current commit and does not move dirty files.
2. Choose a short, descriptive kebab-case topic name (for example,
   `checkout-flow`) and run `git wt <name>`. This creates a sibling worktree and
   a new branch with that name. Continue the flow from the new worktree.
3. If the alias is unavailable, explain that and ask before substituting an
   equivalent `git worktree add <path> -b <name>` command. If branch/path creation
   fails, stop and resolve the conflict rather than silently choosing another
   name or reusing a different branch.

If there is no git repository, continue without a worktree. After establishing
context, read BRAINS completely. Enter BRAINS by default and stay there while
the work still needs thinking: establish shared vocabulary, contextualize the
body of work, pressure-test assumptions, smell-test the model, and reconcile
the spec artifact at meaningful checkpoints.

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
