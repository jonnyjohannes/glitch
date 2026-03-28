---
name: note-sharpener
description: >-
  Standardize note frontmatter and tagging across the Obsidian vault.
  Use when the user says "sharpen note", "clean up notes", "standardize",
  or wants to bring notes into compliance with vault tag conventions.
tags: [skill]
---

# Sharpen Note

Ensures vault notes have proper YAML frontmatter with tags. Does not restructure body content — only touches metadata.

## Workflow

- [ ] Step 1: Identify targets
- [ ] Step 2: Apply frontmatter + tags
- [ ] Step 3: Flag overlaps

### Step 1: Identify targets

Accept a file path, folder path, or "all".
In "all" mode scan all dirs and follow symlinks.
Skip:
- `smrtrobot/` — has its own [[skill-sharpener]]
- `.obsidian/` — config, not notes

**Scratch notes** — when targeting scratch/:

1. List `.markdown` files with their `.meta` context (cwd, branch, date) and content preview
2. User picks which to promote
3. Ask for target folder
4. Move, apply frontmatter, clean up original + `.meta`

### Step 2: Apply frontmatter + tags

Every note should have this shape:

```yaml
---
tags: [tag1, tag2]
---
```

```markdown
# note title

Body content.
```

- **Add/fix YAML frontmatter** — `tags` as bracket-list, tag sparingly and meaningfully
- **Tag sparingly** — 2-4 tags per note. Tags are shared with smrtrobot skills so graph connections emerge.
- **Remove orphaned inline hashtags** — if `#tags` exist in the body as metadata (not prose), move them to frontmatter
- **Never delete body content** — only touch metadata

### Step 3: Flag overlaps

If processing multiple notes, check for overlapping content across folders.

**Do not auto-merge.** Present duplicates to the user with:
- File paths
- Brief content summary of each
- Recommendation (which to keep, which to link/archive)
