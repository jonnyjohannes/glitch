---
name: create-skill
description: >-
  Create new agent skills in the skills library. Use when the user wants to
  create, write, author, or add a new skill, or asks about skill structure,
  SKILL.md format, or this skills library.
tags: [skill]
---

# Create Skill

Guide for adding new skills to this library. Each skill is a directory under `skills/` containing a `SKILL.md` and optional supporting files. Skills are cross-compatible with both Cursor and Claude Code.

## Repo Layout

```
skills/
├── README.md
├── create-skill/          # this meta-skill
│   └── SKILL.md
├── <skill-name>/
│   ├── SKILL.md           # required - main instructions
│   ├── reference.md       # optional - detailed docs
│   ├── examples.md        # optional - usage examples
│   └── scripts/           # optional - utility scripts
└── ...
```

## Step 1: Gather Requirements

Before writing anything, clarify with the user:

1. **What** does the skill do? (specific task or workflow)
2. **When** should the agent use it? (trigger scenarios)
3. **What domain knowledge** does the agent need that it wouldn't already have?
4. **What output format** is expected? (templates, conventions, styles)
5. **Are scripts needed?** (validation, automation, etc.)

If context from the conversation makes any of these obvious, infer rather than ask.

## Step 2: Write the SKILL.md

### Frontmatter (required)

```yaml
---
name: your-skill-name        # lowercase, hyphens, max 64 chars
description: >-
  What it does and when to use it. Write in third person.
  Include trigger terms the agent can match on.
tags: [skill]                # required - enables Obsidian graph/search
---
```

The `description` is critical -- the agent uses it to decide whether to activate the skill. Include both **what** it does and **when** to use it. Be specific.

Good: "Generate commit messages from staged git diffs following conventional commits. Use when the user asks for help writing commit messages or committing changes."

Bad: "Helps with git stuff."

### Body

Write the body as instructions the agent should follow. Key principles:

- **Be concise.** The agent is already smart. Only include knowledge it wouldn't have -- project conventions, API quirks, team preferences, domain-specific patterns.
- **Under 500 lines.** Use progressive disclosure: put essentials in SKILL.md, details in reference files one level deep.
- **Set appropriate freedom.** High freedom (prose guidelines) for subjective tasks, low freedom (exact scripts/templates) for fragile operations.
- **Use consistent terminology.** Pick one term for each concept and stick with it.

### Common Patterns

**Template pattern** -- provide an output format:

```markdown
## Output format

\`\`\`markdown
# [Title]
## Summary
[overview]
## Details
[specifics]
\`\`\`
```

**Workflow pattern** -- step-by-step with a checklist:

```markdown
## Workflow

- [ ] Step 1: Analyze input
- [ ] Step 2: Transform data
- [ ] Step 3: Validate output
```

**Conditional pattern** -- decision trees:

```markdown
## Determine approach

**New file?** -> Follow "Creation" section
**Existing file?** -> Follow "Editing" section
```

**Feedback loop pattern** -- for quality-critical tasks:

```markdown
1. Make changes
2. Run `python scripts/validate.py`
3. If validation fails, fix and re-run
4. Only proceed when validation passes
```

## Step 3: Add Wikilinks

Use `[[wikilinks]]` to connect skills in the Obsidian graph:

- If the skill **composes or references another skill**, link it: `[[buildkite-failure-investigator]]`
- If the skill **maps to an agent persona** in [[AGENTS]], mention it: `Used by the **Builder** persona (see [[AGENTS]]).`
- If the skill has a **companion skill** (e.g., review-gh-pr ↔ gh-pr-review-resolver), cross-link them

Wikilinks go in the body text where the reference is natural — don't add a dedicated "links" section. This keeps the graph accurate and the content readable.

## Step 4: Add Supporting Files (if needed)

- `reference.md` -- detailed API docs, extended examples, edge cases
- `examples.md` -- concrete input/output pairs
- `scripts/` -- utility scripts that are more reliable than generated code

Keep references **one level deep** from SKILL.md. No nested chains.

## Step 5: Register in READMEs

After creating the skill, add it to both tables:

1. `skills/README.md` — the skill index
2. `README.md` (root) — the vault table of contents

```markdown
| [[skill-name]] | Brief description of what it does |
```

If the skill maps to an agent persona in [[AGENTS]], add it to that persona's skill list there and in the root README agents table too.

## Step 6: Verify

Before finishing, check:

- [ ] Directory is under `skills/`: `skills/<skill-name>/SKILL.md`
- [ ] `name` field: lowercase, hyphens only, max 64 chars
- [ ] `description`: third person, includes what + when, has trigger terms
- [ ] `tags: [skill]` in frontmatter
- [ ] Wikilinks to related skills and [[AGENTS]] where appropriate
- [ ] Body is under 500 lines
- [ ] Terminology is consistent throughout
- [ ] Any file references from SKILL.md are one level deep
- [ ] `skills/README.md` is updated with the new skill
- [ ] Root `README.md` skills table is updated
- [ ] If skill maps to an agent persona: [[AGENTS]] and root README agents table updated

## Anti-Patterns

- **Verbose explanations** of things the agent already knows (what a PDF is, how Python imports work)
- **Multiple tool options** without a clear default ("use pypdf, or pdfplumber, or PyMuPDF...") -- pick one, mention alternatives only for specific edge cases
- **Time-sensitive info** ("if before August 2025...") -- use a "deprecated" section instead
- **Vague names** like `helper`, `utils`, `tools` -- be specific: `review-pull-request`, `generate-migration`

