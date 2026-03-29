---
name: git-committer
aliases: [git-committer, smart-committer]
description: >-
  Analyze a git diff, group related changes into logical commits, stage each
  group, and commit with concise punchy messages. Use when the user says
  "smart commit", "group and commit", "chunk commits", "commit these changes",
  or wants to break a messy working tree into clean atomic commits.
tags: [skill, git, workflow]
---

# Git Committer

Break a dirty working tree into clean, atomic commits — each with a punchy message.

## Phase 1: Survey the Damage

1. **Unstaged + staged changes** — run `git diff --stat` and `git diff --cached --stat`.
   Capture the full picture of what's changed.

2. **Untracked files** — run `git status --short`. Note any new files (`??`).

3. **Full diff content** — run `git diff` (unstaged) and `git diff --cached` (staged).
   Read the actual changes, not just filenames.

4. **If nothing to commit** — tell the user, stop.

## Phase 2: Group Related Changes

Analyze every hunk across all changed files. Group by **logical concern**, not by file.

### Grouping heuristics

- **Same feature/behavior**: changes that implement or modify a single behavior
  belong together even if they span multiple files (e.g., handler + test + migration)
- **Refactors**: renames, extractions, restructurings that don't change behavior — separate commit
- **Config/infra**: dependency bumps, CI changes, linter config — group together
- **Docs**: README, comments, docstrings — group together
- **Formatting**: whitespace, import sorting — separate commit (or skip if trivial)
- **Unrelated fixes**: a drive-by typo fix or bug fix unrelated to the main work — its own commit

### Splitting within a file

When a single file contains changes belonging to different groups, use
`git add -p` (via `git add --patch`) or stage specific hunks. Present the
grouping plan to the user before staging anything.

### Ordering

Commits should be ordered so that each one leaves the tree in a valid state:

1. Infra/config changes first
2. Refactors that enable the feature
3. The feature/fix itself
4. Tests
5. Docs / cleanup last

## Phase 3: Present the Plan

Show the user a table:

```

commit 1: <message>
  - path/to/file.py (hunks 1-3)
  - path/to/other.py

commit 2: <message>
  - path/to/file.py (hunk 4)
  - path/to/test_file.py

```

Ask: **"look good, or want to shuffle anything?"**

Do **not** stage or commit until the user confirms.

## Phase 4: Stage and Commit

For each group, in order:

1. **Reset staging area** — `git reset HEAD` (only if needed to unstage prior state)
2. **Stage the group** — `git add <files>` for whole-file groups.
   For partial-file groups, use `git add -p` with explicit hunk selection,
   or write a temporary patch and apply with `git apply --cached`.
3. **Verify staging** — `git diff --cached --stat` to confirm only the intended
   files/hunks are staged.
4. **Commit** — `git commit -m "<message>"`

### Commit message style

- **Lowercase**, no period at the end
- **Present tense imperative**: "add", "fix", "remove", "extract", "update"
- **Short** — aim for under 50 chars, hard cap at 72
- Lead with the _what_, not the _why_ (save _why_ for the body if needed)
- No conventional-commit prefixes unless the repo already uses them
  (check `git log --oneline -10` first)

**Good**: `extract query builder into standalone module`
**Good**: `fix off-by-one in pagination offset`
**Bad**: `Updated some files and fixed stuff`

## Phase 5: Confirm

After all commits land, run `git log --oneline -<n>` (where n = number of commits created)
and show the user the result.

## Rules

- **Never force-push or rewrite history** — only create new commits.
- **Never commit secrets** — skip `.env`, credentials, tokens. Warn if detected.
- **Preserve existing staging** — if the user had changes already staged, ask
  whether to include them in the grouping or leave them as-is.
- **Ask before acting** — always show the plan first unless the user explicitly
  said "just commit it" or "yolo."
- **One concern per commit** — if in doubt, split further rather than lumping.
- **Leave the tree clean** — after all commits, `git status` should show nothing
  (or only intentionally untracked files).
