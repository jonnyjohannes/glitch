---
name: doc-tagger
description: >-
  Scan document contents and synthesize 3-5 meaningful tags as YAML frontmatter.
  Use when the user says "tag this", "tag these docs", or wants tags added to notes.
tags: [skill]
---

# Doc Tagger

Reads document content and produces a small set of meaningful, intentional tags. Tags connect notes across the vault graph — every tag should earn its place.

## Workflow

- [ ] Step 1: Identify targets
- [ ] Step 2: Read and synthesize tags
- [ ] Step 3: Apply tags

### Step 1: Identify targets

Accept a file path, folder path, or "all".
In "all" mode scan all dirs and follow symlinks.
Skip:
- `.obsidian/` — config, not notes

### Step 2: Read and synthesize tags

For each target, read the full content and derive 3-5 tags.

**Tagging principles:**

- **Substance over structure** — tag what the doc is *about*, not what format it is ("api-auth" not "notes")
- **Graph-aware** — tags are shared across skills and notes. Prefer tags that create meaningful connections in the vault graph over one-off labels
- **Sparse and deliberate** — 3-5 tags max. If you can't justify a tag's existence in the graph, drop it
- **Flat hierarchy** — no nested tags (`topic/subtopic`), just simple lowercase kebab-case tokens
- **Stable vocabulary** — reuse existing tags from the vault before coining new ones. Scan sibling files or the vault for prior art

**What to tag for:**

- Core domain/topic (e.g., `auth`, `observability`, `ml-pipeline`)
- Technology or tool when central (e.g., `bigquery`, `kubernetes`)
- Document purpose when non-obvious (e.g., `runbook`, `decision-record`, `spec`)

**What NOT to tag:**

- Generic labels that apply to everything (`important`, `notes`, `misc`)
- Redundant tags derivable from the file path or folder name
- Temporal markers (`q1-2026`, `sprint-42`) — these belong in frontmatter fields, not tags

### Step 3: Apply tags

Add or update YAML frontmatter at the top of each file:

```yaml
---
tags: [tag1, tag2, tag3]
---
```

- Preserve any existing non-tag frontmatter fields
- If tags already exist, merge — don't replace. Drop any that violate the principles above
- If orphaned inline `#hashtags` exist as metadata (not prose), migrate them to frontmatter and remove the inline version
- **Never delete or restructure body content** — only touch metadata
