---
name: skill-creator
description: >-
  Creates new skills from scratch by gathering requirements and generating a
  canonical SKILL.md. Use when a skill does not exist or when starting from a
  blank slate.
tags: [skill, meta-skill]
---

# Create Skill

Defines how new skills are introduced into the system.

If a skill already exists or has been manually edited, **do not use this directly** — use [[skill-sharpener]] instead.

## Core Principle

Creation is **structured extraction**.

The goal is to turn vague intent into a **canonical skill** that:

- activates reliably
- integrates cleanly
- requires minimal future correction

## Determine Approach

**Skill already exists?** →
Delegate to [[skill-sharpener]] (refinement flow)

**New skill?** → Continue

## Workflow

- [ ] Step 1: Gather Requirements
- [ ] Step 2: Author SKILL.md
- [ ] Step 3: Link into System
- [ ] Step 4: Add Supporting Files (optional)
- [ ] Step 5: Register + Verify

## Step 1: Gather Requirements

Extract or infer:

1. **What** does the skill do?
2. **When** should it trigger?
3. **What knowledge is non-obvious?**
4. **What output shape is required?**
5. **Are scripts needed?**

If obvious from context, infer.
If unclear, ask — don't guess.

## Step 2: Author SKILL.md

### Frontmatter (required)

```yaml
---
name: your-skill-name
aliases: [your-skill-name]
description: >-
  What it does and when to use it. Include trigger language.
tags: [skill]
---
```

### Body Principles

- Be concise — no basics
- Prefer:
  - **workflows** for procedures
  - **templates** for outputs
  - **conditionals** for branching
- Keep under 300 lines
- Use consistent terminology

### Patterns

#### Workflow

```markdown
- [ ] Step 1: ...
- [ ] Step 2: ...
```

#### Template

```markdown
## Output format

\`\`\`
...
\`\`\`
```

#### Conditional

```markdown
**Case A?** → do X
**Case B?** → do Y
```

## Step 3: Link into System

Add [[wikilinks]] naturally:

- Reference related skills
- Link [[AGENTS]] if persona-aligned
- Connect companion skills

## Step 4: Supporting Files (optional)

- `reference.md` → deep detail
- `examples.md` → input/output pairs
- `scripts/` → deterministic helpers

Keep everything **one level deep**

## Step 5: Register + Verify

### Register

Add to:

```markdown
| [[skill-name]] | Description (≤100 chars) |
```

- `skills/README.md`
- root `README.md`

### Verify

- [ ] Correct directory
- [ ] Valid frontmatter
- [ ] Description includes what + when
- [ ] Aliases match name
- [ ] Under 300 lines
- [ ] Terminology consistent
- [ ] Wikilinks present where useful
- [ ] README entries updated

## Failure Modes

- Creating vague or overly broad skills
- Over-explaining basics
- Missing activation cues in description
- Not linking into the ecosystem

## Heuristic

> If the skill feels "obvious," it's probably underspecified.
> Make activation precise, not clever.
