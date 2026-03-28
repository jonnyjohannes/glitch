---
name: note-sharpener
description: >-
  Standardize note metadata structure and tagging across the vault.
tags: [skill]
---

# Sharpen Note

## Step 1: Identify targets

Accept a file path, folder path, or "all". In "all" mode, scan j2/ and wayfair/ for .md files recursively. Skip:
- `smrtrobot/` — has its own [[skill-sharpener]]
- `.obsidian/` — config, not notes

### Notes from `scratch/`

1. **List scratch files** — read the `.markdown` files and their `.meta` companions. Show: filename, date, working directory context, branch, and content preview
2. **User picks** which notes to promote
3. **Classify and format** — ask the user which folder (j2/ or wayfair/) and apply the standard format
4. **Move the file** — rename from hash-based `.markdown` to a descriptive `.md` filename in the target folder
5. **Clean up** — optionally delete the original scratch file and its `.meta`

## Step 2: Apply standard format

```yaml
---
tags: [tag1, tag2]
---
```

```markdown
# note title

Body content.
```

## Step 3: Apply Tags

1. **Add/fix YAML frontmatter** - tag sparingly and meaningfully

## Step 4: Flag high-degree of overlap

If processing multiple notes, check for overlapping content across folders.

**Do not auto-merge.** Present duplicates to the user with:
- File paths
- Brief content summary of each
- Recommendation (which to keep, which to link/archive)

