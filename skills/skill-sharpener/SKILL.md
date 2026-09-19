---
name: skill-sharpener
description: >-
  Creates or refines skills by reconciling human intent, pending edits, and
  structural drift into a concise canonical SKILL.md. Use when adding, updating,
  cleaning up, or aligning a skill with the current agent workflow.
tools: [Read, Write, Edit, Glob, Grep, Bash]
tags: [skill, meta-skill, maintenance]
---

# Skill Sharpener

Turn an emerging or edited workflow into a focused skill without sanding away the human's intent.

## Interface

**Inputs**: a skill name or path plus the intended behavior, pending edits, or cleanup request
**Outputs**: canonical `SKILL.md` and aligned skill indexes or supporting files
**Side effects**: creates or edits skill files and may update repository indexes

## Core principle

A skill earns its place when invocation changes agent behavior in a valuable, non-obvious way. Keep durable formats and invariants in templates, scripts, or process documentation rather than turning every convention into another skill.

Human edits are the source of truth for what the workflow should become. Sharpen their shape, activation, and boundaries without replacing that intent with generic best practices.

## Canonical skill contract

A skill should have:

- frontmatter with a lowercase hyphenated `name`, trigger-oriented `description`, minimal `tools`, and `tags` containing `skill`
- a concise `## Interface` stating inputs, outputs, and side effects
- explicit activation cues and boundaries
- workflows, conditionals, or output templates only where they reduce ambiguity
- approval gates for destructive or external actions
- links to genuinely composable skills or `[[AGENTS]]` conventions
- progressive disclosure into one-level-deep supporting files when detail would obscure the core workflow
- a body under 300 lines unless complexity clearly justifies otherwise
- a matching entry in the appropriate shared or local skill index

Prefer direct instructions over explanations of obvious model capabilities. Remove stale harness-specific integrations, duplicated global guidance, and ceremonial steps that do not alter behavior.

## Workflow

- [ ] Step 1: Inspect the skill and pending changes
- [ ] Step 2: Recover intent and evaluate whether a skill is warranted
- [ ] Step 3: Rewrite or create the skill
- [ ] Step 4: Reconcile the surrounding ecosystem
- [ ] Step 5: Verify the result

### Step 1: Inspect

For an existing skill, read its complete `SKILL.md` and inspect every change surface:

```bash
git diff -- skills/<name>/
git diff --cached -- skills/<name>/
git status --short -- skills/<name>/
```

Also inspect supporting files and the relevant skill indexes.

**Pending changes?** Treat them as the primary evidence of evolving intent.

**No pending changes?** If the user requested cleanup or alignment, continue with a general audit. Otherwise report that there is nothing pending and offer concrete refinement targets.

**Missing skill?** Infer a first draft from the request and comparable skills, then apply the same sharpening workflow. Ask only when activation, side effects, or required behavior is genuinely ambiguous.

Before editing, summarize the inferred intent in one or two sentences.

### Step 2: Evaluate

Ask whether the proposed behavior should be a skill at all:

- **Agent behavior requiring judgment, branching, tools, or interaction?** A skill may be appropriate.
- **Stable protocol shared by humans and multiple agent environments?** Prefer process documentation.
- **Durable file shape or invariant?** Prefer a template, schema, linter, or deterministic check.
- **Generic capability the model already performs reliably?** Use direct instructions instead of adding a skill.

If a skill remains appropriate, audit:

- precise triggers rather than broad capability claims
- a clear boundary with adjacent skills
- minimal required tools
- current, locally verified commands where applicable
- explicit approval and external-side-effect rules
- portable core behavior separated from private or organization-specific overlays
- useful composition through links rather than duplicated instructions

If the behavior does not warrant a skill, explain why and propose 2-3 concrete alternatives plus `other` before removing or relocating anything.

### Step 3: Rewrite or create

Produce a concise `SKILL.md` that:

1. preserves explicit human decisions and useful personality
2. conforms to the canonical skill contract above
3. makes activation and stopping conditions obvious
4. keeps the core workflow readable without unnecessary ceremony
5. moves deep reference material into supporting files only when useful

Do not ask for confirmation when the requested direction is clear. Do not silently broaden scope or change external behavior.

### Step 4: Reconcile the ecosystem

- update the matching shared or local index entry when the name or description changes
- add a missing index entry according to the repository's grouping convention
- remove stale links after renames or deletions
- inspect related skills for duplicated ownership or broken composition
- update supporting files when the refined workflow invalidates them

Keep index descriptions concise and consistent with the skill's actual behavior.

### Step 5: Verify

Check:

- [ ] frontmatter parses and follows the canonical contract
- [ ] description says what the skill does and when to use it
- [ ] listed tools are necessary
- [ ] interface names inputs, outputs, and side effects
- [ ] triggers, boundaries, approval gates, and stopping conditions are clear
- [ ] process docs and artifact contracts have not been needlessly embedded as skills
- [ ] related links and supporting files resolve
- [ ] body is concise and terminology is consistent
- [ ] shared or local index matches the final skill
- [ ] diff contains only intended changes

Report the paths changed, the important behavioral decisions preserved, verification performed, and any remaining ambiguity.
