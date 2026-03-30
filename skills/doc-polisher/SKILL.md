---
name: doc-polisher
description: >-
  Format documents via nvim conform and update YAML frontmatter metadata (tags,
  etc.). Use when the user says "polish docs", "format notes", "tag this",
  "clean up notes", or wants docs formatted and metadata standardized.
tools: [Read, Edit, Bash, Glob]
tags: [skill, docs, workflow]
---

# Doc Polisher

## Interface

**Inputs**: file path, folder path, or "all"
**Outputs**: formatted files with standardized YAML frontmatter (tags, etc.)
**Side effects**: modifies files on disk (autoformat via nvim conform + frontmatter updates)

Format and standardize documents — autoformat first, then metadata. Designed as a pipeline: each step is independent so new steps can be added later.

## Pipeline

- [ ] Step 1: Identify targets
- [ ] Step 2: Autoformat via nvim conform
- [ ] Step 3: Synthesize and apply tags
- [ ] Step 4: Report

## Step 1: Identify targets

Accept a file path, folder path, or "all".
In "all" mode scan all dirs and follow symlinks.
Skip:

- `.obsidian/` — config, not notes
- binary files, images, PDFs

## Step 2: Autoformat via nvim conform

For each target, run the user's nvim conform config headless:

```bash
nvim --headless -c "lua require('conform').format({ lsp_fallback = true, async = false })" -c "wqa" <file>
```

This applies whatever formatters the user has configured (prettier, stylua, etc.) without reimplementing them.

- Run per-file, not in batch — isolate failures
- If nvim exits non-zero, warn and skip to the next file
- Do not attempt to format if the file has no conform formatter configured — nvim will handle that gracefully via `lsp_fallback`

## Step 3: Synthesize and apply tags

Read each target's full content and derive 3-5 tags.

### Tagging principles

- **Substance over structure** — tag what the doc is _about_, not what format it is ("api-auth" not "notes")
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

### Applying tags

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

## Step 4: Report

After processing, show a summary:

```
polished 12 files
  formatted: 10
  skipped (no formatter): 2
  tags added/updated: 8
```

## Adding future steps

New metadata or formatting steps slot into the pipeline between formatting and reporting. Each step should:

- operate on a single file at a time
- fail gracefully and skip to the next file
- only touch metadata or formatting — never restructure body content
