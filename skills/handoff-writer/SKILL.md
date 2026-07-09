---
name: handoff-writer
description: >-
  Capture the current session's state into a handoff doc so a fresh agent
  instance can pick up where this one left off. Resolves the target file from
  user arg, then memory, then falls back to `<cwd>/docs/<derived>.md`. Use
  when the user says "hand off", "save state", "write handoff", "checkpoint",
  "snapshot the session", "context dump", "continue later", or "another agent
  will take over".
tools: [Read, Write, Edit, Glob, Grep, Bash]
tags: [skill, workflow, session, handoff]
---

# Handoff Writer

Writes a self-contained handoff doc so a new agent instance can resume the work without the original conversation.

## Interface

**Inputs**: optional file path arg; otherwise resolves from memory or falls back to `<cwd>/docs/<derived>.md`
**Outputs**: a handoff markdown doc containing goal, plan progress, what's done, what's next, key decisions, files touched, blockers, resume commands
**Side effects**: writes/updates the handoff file; on first creation, saves a `project`-type memory pointing at it so future invocations find the same file

## Core Principle

The handoff doc is **the briefing for a stranger who just walked in**.

They don't see this conversation. Everything they need to continue must be in the doc — goal, where the plan stands, why decisions were made, what to do next.

If a future-you couldn't resume from the doc alone, it's not done.

## Resolve Target File

Resolve in this order — stop at the first hit:

1. **User-provided path** → arg to the skill (absolute or relative to cwd). Use as-is.
2. **Memory lookup** → search current project's memory dir for an entry pointing at a handoff doc. The path is stored as `handoff_doc_path` in a memory of type `project`. If found and the file still exists, use it.
3. **Fallback** → derive a slug from the active topic (task, branch, or main goal), then use `<cwd>/docs/handoff-<slug>.md`. Create `<cwd>/docs/` if missing.

If the resolved file exists, **read it first** — preserve prior context, update in place. If it doesn't exist, scaffold from the [output format](#output-format).

## Workflow

- [ ] Step 1: Resolve target file (above)
- [ ] Step 2: Gather session state
- [ ] Step 3: Write or update the doc
- [ ] Step 4: Persist the path to memory (first creation only)
- [ ] Step 5: Confirm with the user

### Step 2: Gather Session State

Pull from the live conversation — do not re-investigate. Capture:

- **goal** — what the user is trying to accomplish (the *why*, not just the *what*)
- **plan** — the overall approach, with status markers per step (`[x]`, `[~]`, `[ ]`)
- **done** — concrete work completed (files written, commits, decisions landed)
- **in flight** — anything mid-stream right now (uncommitted edits, open PRs, half-implemented features)
- **next** — the very next action a fresh agent should take, specific enough to start immediately
- **decisions** — non-obvious choices made, with the *reason* (so the next agent doesn't re-litigate)
- **files touched** — paths edited or created this session, with one-line purpose each
- **blockers / open questions** — anything stuck, ambiguous, or awaiting input
- **resume commands** — the literal shell commands or tool calls needed to get back in
- **context references** — links to specs, tickets, PRs, related memory entries

Skip sections that don't apply. Don't pad.

### Step 3: Write or Update

**New file** → scaffold using the [output format](#output-format) and fill every applicable section.

**Existing file** → read it, reconcile with current session:

- update plan status markers
- append to "done" rather than replacing
- replace "in flight" / "next" / "blockers" — these are point-in-time
- preserve user-authored sections verbatim unless the user said to edit them
- add a new entry under "session log" with today's date and a one-line summary

### Step 4: Persist Path to Memory

If this is a new handoff doc (target didn't exist before this run), save a `project`-type memory in the current project's memory dir:

```yaml
---
name: handoff-doc-location
description: Path to the active handoff doc for this project
metadata:
  type: project
---

Active handoff doc: `<absolute path>`

**Why:** future handoff-writer invocations should update this file rather than creating a new one.
**How to apply:** when [[handoff-writer]] runs, check this memory before falling back to a derived path.
```

Then add a line to `MEMORY.md`. Skip if the memory already exists.

### Step 5: Confirm

Tell the user the resolved path and a one-line summary of what was captured. Offer to commit if the file is under git.

## Output Format

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

| Path | Purpose |
| ---- | ------- |
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
- memory: [[relevant-memory-slug]]

## Session Log

- YYYY-MM-DD — [one-line summary of what this session accomplished]
```

## Conventions

### the doc is for a stranger

Assume zero shared context with the next agent. No "we", no "you'll remember". State things plainly.

### specific > complete

A short, accurate handoff beats a long, vague one. If a section doesn't apply, omit it. If you'd write "TBD" — figure it out or surface as a blocker.

### preserve, don't overwrite

When updating, treat the file as a living artifact. Append to history, replace point-in-time state, never silently drop user-authored content.

### compose with [[tech-specer]]

If there's already a tech spec for the work, **link to it** in Context — do not duplicate the spec into the handoff. The handoff is about *where we are*, the spec is about *what we're building*.

### compose with [[git-committer]]

After writing the handoff, if the file is tracked by git, offer to commit it via [[git-committer]] so the handoff travels with the branch.

## Failure Modes

- writing the doc as a stream-of-consciousness session diary instead of an oriented briefing
- skipping the *why* on decisions — next agent re-debates them
- vague "next" steps the next agent can't act on
- forgetting to save the memory pointer → future invocations create duplicate docs
- losing user-authored content on update

## Heuristic

> Read the doc as if you've never seen this project.
> If you couldn't pick up the work in five minutes, it's not a handoff — it's notes.
