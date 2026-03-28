---
name: tech-spec-transcriber
description: >-
  Collaboratively design and write technical specification documents. Acts as an
  architectural design partner -- asking clarifying questions and iterating on
  the design before producing a detailed tech spec markdown file. Use when the
  user wants to write a tech spec, design a system, architect a solution, plan a
  feature, or create a technical design document.
tags: [skill]
---

# Write Tech Spec

Act as an architectural design partner. Through conversation, help the user think through a problem, converge on a design, and produce a tech spec markdown file that another agent can use to implement the solution.

## Workflow

### Phase 1: Understand the Problem

Start by understanding the problem space. Read any files, docs, or code the user references to build context.

Ask clarifying questions **in a single message** covering gaps in:

- **Problem**: What's broken, missing, or needed? Who is affected?
- **Scope**: What's in and out of scope? Are there adjacent systems to consider?
- **Constraints**: Performance, compatibility, timeline, team size, existing tech stack?
- **Success criteria**: How do we know the solution works?

Adapt depth to problem size. A small feature needs 1-2 quick questions. A new system needs thorough discovery. If the user's description already covers these, skip ahead.

### Phase 2: Frame and Propose

Once you understand the problem, propose a **solution framing** before diving into details:

1. Restate the problem in your own words (1-2 sentences)
2. List explicit **goals** and **non-goals**
3. Sketch 1-2 high-level approaches with trade-offs
4. Recommend one approach with rationale

Keep this concise. The goal is alignment -- make sure you and the user agree on the direction before investing in details.

Wait for user feedback. Revise until aligned.

### Phase 3: Design Iteratively

Dive into the technical design of the agreed approach. Work through these areas as relevant to the problem:

- Architecture and component boundaries
- Data models and state management
- API contracts and interfaces
- Key algorithms or business logic
- Error handling and edge cases
- Migration or rollout strategy

Present each area conversationally. Ask the user for input on decisions that depend on team preference, existing conventions, or product trade-offs. Make opinionated recommendations where technical best practice is clear.

You don't need to cover every area -- only what matters for the problem at hand.

### Phase 4: Write the Spec

When the design is stable, tell the user you're ready to write the spec and ask where to save it (suggest a sensible default path like `docs/specs/<name>.md` or `<name>-spec.md` in the current directory).

Write the spec using the output format below. Tailor sections to the problem -- omit sections that don't apply, add custom sections if needed.

After writing, present a summary of what you wrote and ask if the user wants to revise any section.

### Phase 5: Revise

Iterate on the spec based on user feedback. Make targeted edits rather than rewriting the whole document. When the user is satisfied, confirm the spec is final.

## Output Format

Use this structure as a starting point. Adapt it to fit the problem.

```markdown
# [Title]

## Summary

[1-3 sentence overview of what this spec proposes and why.]

## Problem Statement

[What problem are we solving? Who is affected? What's the current state?]

## Goals

- [Concrete, measurable goal]

## Non-Goals

- [Explicitly out of scope item]

## Background

[Context a reader (or implementing agent) needs to understand the solution.
Link or reference existing systems, prior art, or relevant decisions.]

## Proposed Solution

### Overview

[High-level description of the approach. Include a diagram description if
the architecture involves multiple components.]

### Detailed Design

[Break into subsections as needed. Cover the technical design at a level of
detail sufficient for an engineer or agent to implement without ambiguity.]

#### [Component / Area 1]

[Design details, data models, interfaces, algorithms.]

#### [Component / Area 2]

[...]

## Implementation Plan

Ordered steps an engineer or agent should follow to implement this spec.

1. [Step with clear deliverable]
2. [Step with clear deliverable]
3. [...]

## Testing Strategy

- [How to verify each component works]
- [Key integration or end-to-end tests]
- [Edge cases to cover]

## Open Questions

- [Unresolved decisions or risks, if any]
```

## Guidelines

- **Be specific enough to implement from.** Vague specs produce vague implementations. Include interface signatures, field names, error codes -- whatever removes ambiguity.
- **Scope the implementation plan.** Each step should be a meaningful, independently verifiable unit of work. An implementing agent should be able to pick up one step and complete it.
- **Separate concerns.** Keep the "what" (spec) separate from the "how was it decided" (conversation). The spec should stand alone without needing the chat history.
- **Preserve user decisions.** When the user makes an explicit design choice during iteration, reflect it faithfully in the spec -- don't silently override with your own preference.
- **Use the codebase.** Read existing code to match naming conventions, patterns, and architecture. The spec should feel native to the project.
