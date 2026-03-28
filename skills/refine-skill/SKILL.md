---
name: refine-skill
description: >-
  Refine an existing skill by incorporating manual edits (git diffs) back into
  a clean SKILL.md that follows the create-skill template. Use when the user
  says "refine skill", "update skill", "clean up skill", or has manually edited
  a SKILL.md and wants the changes properly integrated.
tags: [skill]
---

# Refine Skill

Companion to [[create-skill]]. Takes a skill that already exists on disk — especially one with uncommitted manual edits — and rewrites it so the content reflects those edits while conforming to the [[create-skill]] template. Updates the `skills/README.md` TOC entry if the description changed.

## Determine approach

**Skill directory exists?** -> Continue with refinement below.
**Skill directory missing?** -> Tell the user: _"that skill doesn't exist yet — run [[create-skill]] to scaffold it first."_ Stop here.

## Workflow

- [ ] Step 1: Detect changes
- [ ] Step 2: Understand intent
- [ ] Step 3: Rewrite SKILL.md
- [ ] Step 4: Update README TOC
- [ ] Step 5: Verify

### Step 1: Detect changes

Run `git diff -- skills/<skill-name>/SKILL.md` (unstaged) and `git diff --cached -- skills/<skill-name>/SKILL.md` (staged). If both are empty, also check `git diff HEAD -- skills/<skill-name>/SKILL.md` in case the file was already committed since last clean state.

- **Diffs found** -> capture the diff output and proceed.
- **No diffs and file is tracked** -> tell the user there are no pending changes to incorporate. Ask if they want to do a general cleanup pass instead.
- **File is untracked** -> the skill was just created manually. Read the full file and treat the entire content as "new edits" to integrate.

### Step 2: Understand intent

Read the current SKILL.md in full. Compare the diff hunks against the [[create-skill]] template structure:

1. **Frontmatter** — did `name`, `description`, or `tags` change?
2. **Body sections** — were sections added, removed, reordered, or rewritten?
3. **Supporting files** — were new files (reference.md, examples.md, scripts/) added or removed alongside the SKILL.md?

Summarize what changed and why (infer intent from the diff context). Present this summary to the user before rewriting — one or two sentences is fine.

### Step 3: Rewrite SKILL.md

Produce an updated SKILL.md that:

1. **Preserves the user's edits** — the manual changes are the source of truth for _what_ the skill should do.
2. **Conforms to [[create-skill]] template** — proper frontmatter (`name`, `description`, `tags: [skill]`), concise body, wikilinks where natural, under 500 lines.
3. **Fixes template drift** — if the manual edit broke structure (missing frontmatter field, inconsistent terminology, verbose explanations), fix it while keeping the user's intent.
4. **Maintains wikilinks** — ensure `[[references]]` to other skills and `[[AGENTS]]` are present where appropriate.

Write the updated file. Do not ask for confirmation on the rewrite unless the changes are ambiguous — the user already made the edits, you're just cleaning up the shape.

### Step 4: Update README TOC

If the skill's `description` changed, update the matching row in `skills/README.md`:

```markdown
| [[skill-name]] | Updated description here |
```

If the skill isn't in the TOC yet (untracked new file scenario), add it following alphabetical order or the existing grouping convention.

Also update root `README.md` if it exists and has a skills table.

### Step 5: Verify

Run the [[create-skill]] verification checklist:

- [ ] `name` field: lowercase, hyphens only, max 64 chars
- [ ] `description`: third person, includes what + when, has trigger terms
- [ ] `tags: [skill]` in frontmatter
- [ ] Wikilinks to related skills and [[AGENTS]] where appropriate
- [ ] Body under 500 lines
- [ ] Consistent terminology
- [ ] `skills/README.md` entry matches current description
