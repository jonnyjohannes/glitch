---
name: skill-sharpener
description: >-
  Refines an existing skill by reconciling manual edits, diffs, and drift back
  into a clean, template-compliant SKILL.md. Use when updating, cleaning up, or
  aligning a skill with current agentic best practices.
tools: [Read, Edit, Bash, Glob]
tags: [skill, meta-skill]
---

# Refine Skill

## Interface

**Inputs**: existing skill with pending edits, drift, or cleanup needed
**Outputs**: rewritten SKILL.md aligned with [[skill-creator]] template
**Side effects**: modifies SKILL.md, may update `skills/README.md` descriptions

Companion to [[skill-creator]].

Rewrites an existing skill so that **manual edits, implicit intent, and structural drift** are reconciled into a clean, canonical SKILL.md aligned with the current skill system.

Also ensures the skill remains discoverable and consistent within the broader [[AGENTS]] ecosystem.

## Core Principle

A skill is not just a file — it is an interface between:

- human intent (messy, evolving)
- system constraints (structured, predictable)
- agent behavior (contextual, adaptive)

This process aligns all three.

## Determine Approach

**Skill directory exists?** → Continue
**Missing?** → _"That skill doesn't exist yet — run [[skill-creator]] to scaffold it first."_ Stop.

## Workflow

- [ ] Step 1: Detect Changes
- [ ] Step 2: Understand Intent
- [ ] Step 3: Best Practices Check
- [ ] Step 4: Rewrite SKILL.md
- [ ] Step 5: Reconcile Ecosystem
- [ ] Step 6: Verify Integrity

## Step 1: Detect Changes

Check all possible change surfaces:

```bash
git diff -- skills/<skill-name>/SKILL.md
git diff --cached -- skills/<skill-name>/SKILL.md
git diff HEAD -- skills/<skill-name>/SKILL.md
```

Also check for untracked or new supporting files.

### Outcomes

- **Diffs found** → capture the diff output and proceed.
- **No diffs and file is tracked** → tell the user there are no pending changes. Ask if they want a general cleanup pass instead.
- **File is untracked** → the skill was just created manually. Read the full file and treat the entire content as "new edits" to integrate.

## Step 2: Understand Intent

Read the current SKILL.md in full. Compare the diff hunks against the [[skill-creator]] template structure:

1. **Frontmatter** — did `name`, `description`, or `tags` change?
2. **Body sections** — were sections added, removed, reordered, or rewritten?
3. **Supporting files** — were new files (reference.md, examples.md, scripts/) added or removed alongside the SKILL.md?

Summarize what changed and why (infer intent from the diff context). Present this summary to the user before rewriting — one or two sentences is fine.

## Step 3: Rewrite SKILL.md

Produce an updated SKILL.md that:

1. **Preserves the user's edits** — the manual changes are the source of truth for _what_ the skill should do.
2. **Conforms to [[skill-creator]] template** — proper frontmatter, concise body, wikilinks where natural, under 300 lines.
3. **Fixes template drift** — if the manual edit broke structure (missing frontmatter field, inconsistent terminology, verbose explanations), fix it while keeping the user's intent.
4. **Maintains wikilinks** — ensure `[[references]]` to other skills and `[[AGENTS]]` are present where appropriate.

Write the updated file. Do not ask for confirmation on the rewrite unless the changes are ambiguous — the user already made the edits, you're just cleaning up the shape.

## Step 4: Reconcile Ecosystem

### README

If the skill's `description` changed, update the matching row in `skills/README.md`:

```markdown
| [[skill-name]] | Short description (max 100 chars) |
```

TOC descriptions must be **100 characters or fewer**. The full description lives in the SKILL.md frontmatter.

If the skill isn't in the TOC yet, add it following alphabetical order or the existing grouping convention.

Also update root `README.md` if it exists and has a skills table.

### Ecosystem Fit

- Overlap with other skills?
- Missing wikilinks?
- Supporting files aligned?

## Step 5: Verify Integrity

Run the [[skill-creator]] verification checklist:

- [ ] `name` field: lowercase, hyphens only, max 64 chars
- [ ] `description`: third person, includes what + when, has trigger terms
- [ ] `tools`: lists required tools (Bash, Read, Edit, Glob, etc.)
- [ ] `tags: [skill, ...]` includes `skill` + at least one domain tag
- [ ] `## Interface` section present with inputs, outputs, side effects
- [ ] Cross-links to composable skills where natural
- [ ] Wikilinks to related skills and [[AGENTS]] where appropriate
- [ ] Body under 300 lines
- [ ] Consistent terminology
- [ ] `skills/README.md` entry matches current description

## Delegation Pattern

- **Creation needed?** → [[skill-creator]]
- **Refinement needed?** → stay here

This skill is the **default entry point** for all skill work.

