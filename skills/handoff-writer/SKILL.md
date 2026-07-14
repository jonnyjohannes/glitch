---
name: handoff-writer
description: >-
  Captures the current session's state so a fresh agent can resume. Prefer
  replacing `## Handoff` in an active docs/plans plan doc; otherwise write or
  update a standalone handoff doc. Use when the user says "hand off", "save
  state", "write handoff", "checkpoint", "snapshot the session", "context
  dump", "continue later", or "another agent will take over".
tools: [Read, Write, Edit, Glob, Grep, Bash]
tags: [skill, workflow, session, handoff]
---

# Handoff Writer

Writes the latest resume state so a new agent instance can continue without the original conversation.

## Interface

**Inputs**: optional file path arg, active `docs/plans/<slug>.md` plan doc, or current session state
**Outputs**: replaced `## Handoff` section in the active plan doc, or a standalone handoff markdown doc
**Side effects**: edits plan docs or standalone handoff docs

## Core Principle

The handoff is **the briefing for a stranger who just walked in**.

They don't see this conversation. Everything they need to continue must be in durable markdown — goal, where the plan stands, why decisions were made, what to do next.

If there is an active `docs/plans/<slug>.md` plan doc, its `## Handoff` section is the preferred resume point. Keep it current by replacing stale content with the latest state. Git history carries older handoffs.

If there is no active plan doc, write a standalone handoff doc.

## Resolve Target File

Resolve in this order — stop at the first hit:

1. **User-provided path** → arg to the skill (absolute or relative to cwd). Use as-is.
2. **Active plan doc** → if the conversation or working tree clearly points at `docs/plans/<slug>.md`, update that file's `## Handoff` section.
3. **Plan doc discovery** → if `docs/plans/` contains exactly one likely active plan for this task, ask before using it; if ambiguous, present 2-3 concrete choices + `other`.
4. **Existing standalone handoff** → if `docs/handoff-<slug>.md` already exists for the active topic, update it.
5. **Fallback** → derive a slug from the active topic (task, branch, or main goal), then use `<cwd>/docs/handoff-<slug>.md`. Create `<cwd>/docs/` if missing.

If the resolved target is a plan doc, read it first and replace only its `## Handoff` body. If it lacks `## Handoff`, add one near the top after `## Current State` when present.

If the resolved target is a standalone handoff file, read it first — preserve prior context, update in place. If it doesn't exist, scaffold from the [standalone output format](#standalone-output-format).

## Workflow

- [ ] Step 1: Resolve target (plan doc preferred, standalone handoff fallback)
- [ ] Step 2: Gather session state
- [ ] Step 3: Write or update the target
- [ ] Step 4: Confirm with the user

### Step 2: Gather Session State

Pull from the live conversation — do not re-investigate. Capture:

- **goal** — what the user is trying to accomplish (the _why_, not just the _what_)
- **plan** — the overall approach, with status markers per step (`[x]`, `[~]`, `[ ]`)
- **done** — concrete work completed (files written, commits, decisions landed)
- **in flight** — anything mid-stream right now (uncommitted edits, open PRs, half-implemented features)
- **next** — the very next action a fresh agent should take, specific enough to start immediately
- **decisions** — non-obvious choices made, with the _reason_ (so the next agent doesn't re-litigate)
- **files touched** — paths edited or created this session, with one-line purpose each
- **blockers / open questions** — anything stuck, ambiguous, or awaiting input
- **resume commands** — the literal shell commands or tool calls needed to get back in
- **context references** — links to specs, tickets, PRs, and related docs

Skip sections that don't apply. Don't pad.

### Step 3: Write or Update

**Active plan doc** → replace the `## Handoff` section with the latest resume state. Keep it concise and current:

- what to read first
- what is already decided
- what is in flight
- next concrete action
- blockers / open questions
- relevant commands or paths

Also update `## Current State` when present if the status, focus, or next action changed. Do not append stale handoff history into the plan doc.

**New standalone file** → scaffold using the [standalone output format](#standalone-output-format) and fill every applicable section.

**Existing standalone file** → read it, reconcile with current session:

- update plan status markers
- append to "done" rather than replacing
- replace "in flight" / "next" / "blockers" — these are point-in-time
- preserve user-authored sections verbatim unless the user said to edit them
- add a new entry under "session log" with today's date and a one-line summary

### Step 4: Confirm

Tell the user the resolved path and a one-line summary of what was captured. If you updated a plan doc, say that `## Handoff` now contains the latest resume state. Offer to commit if the file is under git.

## Plan Doc Handoff Format

When updating a plan doc, replace the body under `## Handoff` with a concise latest-state block:

```markdown
## Handoff

Resume here by reading this plan doc top to bottom, then continue from [specific section or next action].

Current state:

- Done: ...
- In flight: ...
- Next: ...
- Blockers: ...
- Key context: ...
```

Omit bullets that do not apply. Keep this section current, not historical.

## Standalone Output Format

```markdown
# Handoff: [topic]

> Last updated: YYYY-MM-DD — by agent session
> Resume by: reading this file end-to-end, then `<next action>`

## Goal

[1-3 sentences. What is the user ultimately trying to accomplish, and why does it matter?]

## Plan

- [x] Step that's done
- [~] Step that's in flight
- [ ] Step not yet started

## Done

- [Concrete deliverable] — [file path or commit if relevant]
- ...

## In Flight

[Anything mid-stream right now. Uncommitted edits, open PRs, half-written code. Be specific about the state.]

## Next

1. [Immediate next action — specific enough to start without thinking]
2. [Then this]
3. [Then this]

## Key Decisions

- **[decision]** — [reason]. [Alternative considered, if any, and why it was rejected.]
- ...

## Files Touched

| Path           | Purpose               |
| -------------- | --------------------- |
| `path/to/file` | What was done and why |

## Blockers / Open Questions

- [Question or blocker] — [what's needed to unblock]

## Resume Commands

\`\`\`bash

# commands to get the next agent back into the working state

\`\`\`

## Context

- spec: [link or path]
- ticket: [link]
- related PR: [link]

## Session Log

- YYYY-MM-DD — [one-line summary of what this session accomplished]
```

## Conventions

### the doc is for a stranger

Assume zero shared context with the next agent. No "we", no "you'll remember". State things plainly.

### specific > complete

A short, accurate handoff beats a long, vague one. If a section doesn't apply, omit it. If you'd write "TBD" — figure it out or surface as a blocker.

### preserve, don't overwrite

When updating a standalone handoff doc, treat the file as a living artifact. Append to history, replace point-in-time state, never silently drop user-authored content.

When updating a plan doc, preserve the surrounding plan and replace only `## Handoff` plus small `## Current State` fields as needed.

### compose with [[tech-specer]]

If there's already a `docs/plans/<slug>.md` plan doc for the work, update its `## Handoff` section instead of creating a separate handoff. The plan doc is about _what we're building_ and _where we are_.

If using a standalone handoff because no plan doc exists, link to any relevant plan/spec in Context — do not duplicate it.

### compose with [[git-committer]]

After writing the handoff, if the file is tracked by git, offer to commit it via [[git-committer]] so the handoff travels with the branch.

## Failure Modes

- writing the handoff as a stream-of-consciousness session diary instead of an oriented briefing
- appending stale handoff entries into a plan doc instead of replacing `## Handoff`
- skipping the _why_ on decisions — next agent re-debates them
- vague "next" steps the next agent can't act on
- losing user-authored content on update

## Heuristic

> Read the doc as if you've never seen this project.
> If you couldn't pick up the work in five minutes, it's not a handoff — it's notes.
