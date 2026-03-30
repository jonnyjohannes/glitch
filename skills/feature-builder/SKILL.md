---
name: feature-builder
aliases: [feature-builder]
description: >-
  Implement a feature from a plan or spec — review the approach with the user,
  cycle on feedback, then code it up and commit via git-committer. Use when the
  user says "build this", "implement this spec", "code this plan", "build the
  feature", or hands you an implementation plan and wants working code.
tools: [Read, Write, Edit, Bash, Glob, Grep, Skill]
tags: [skill, implementation, workflow]
---

# Feature Builder

Turn a plan into working code — with human review before implementation.

## Interface

**Inputs**: implementation plan (inline, file path, [[tech-specer]] output, or any structured description)
**Outputs**: working code implementing the plan
**Side effects**: file writes, git commits (via [[git-committer]])

## Workflow

- [ ] Phase 1: Ingest the Plan
- [ ] Phase 2: Present Implementation Approach
- [ ] Phase 3: Build
- [ ] Phase 4: Commit

## Phase 1: Ingest the Plan

Accept the plan from wherever it lives:

- **File path** — read it (`docs/specs/foo.md`, `foo-spec.md`, etc.)
- **Inline** — user pastes or describes it in conversation
- **Reference** — user names a spec written by [[tech-specer]] or similar
- **Structured doc** — any markdown with goals, steps, or requirements

Extract from the plan:

1. **Goal** — what are we building?
2. **Implementation steps** — ordered units of work (if the plan has an `## Implementation Plan` section, use it directly)
3. **Constraints** — tech stack, patterns, conventions, performance requirements
4. **Scope boundaries** — what's in, what's out

If the plan is vague or missing steps, ask the user to clarify — don't invent requirements.

Read existing code to understand conventions, patterns, and architecture before proposing anything.

## Phase 2: Present Implementation Approach

Share your implementation approach as an ordered list of steps. Each step should be:

- **Concrete** — name the files, functions, or components you'll create/modify
- **Independently verifiable** — the user can check each step's output
- **Small enough to reason about** — one logical concern per step

```

step 1: <what you'll do>
  - files: path/to/file.py, path/to/other.py
  - details: <brief explanation of approach>

step 2: <what you'll do>
  - files: path/to/new_file.py
  - details: <brief explanation>

```

Ask: **"look good, or want to change anything?"**

**Do not write code until the user confirms.**

Cycle on feedback — adjust steps, reorder, add/remove scope — until the user says go.

## Phase 3: Build

Implement each step from the confirmed plan, in order.

### Per step

1. **Read** relevant existing code to match conventions
2. **Write/edit** the code — prefer editing existing files over creating new ones
3. **Verify** — if there are tests, run them. if there's a build step, run it. catch breakage early.
4. **Brief status** — tell the user what you just completed ("done with step 2 — added the query builder")

### Guidelines

- Match the project's existing style, naming, and patterns
- Don't add extras beyond what the plan calls for
- If you hit a blocker or discover the plan needs adjustment, stop and ask before improvising
- Keep each step's changes cohesive — don't mix concerns

## Phase 4: Commit

Once implementation is complete (or at natural checkpoints for larger features):

1. Invoke [[git-committer]] to group and commit the changes
2. Show the user the final commit log

**Large features**: for plans with 5+ steps, consider committing at logical milestones rather than all at the end. Ask the user's preference.

## Rules

- **Plan first, code second** — never skip the review phase
- **Stay in scope** — implement what the plan says, nothing more
- **Surface surprises early** — if something doesn't work as the plan expected, stop and discuss
- **Never commit secrets** — inherited from [[git-committer]] but worth repeating
- **Respect existing code** — read before writing, match conventions, don't reorganize what you weren't asked to touch
