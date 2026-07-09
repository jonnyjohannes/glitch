---
name: pr-drafter
description: >-
  Drafts a complete, team-ready pull request description by combining the git
  diff, linked issue context, build status, and relevant internal documentation.
  Matches the repo's PR template if one exists. Use when the user asks to
  "draft a PR", "write my PR description", or "create a pull request".
tools: [Bash, Read, Glob]
tags: [skill, github, authoring]
---

# PR Drafter

## Interface

**Inputs**: branch with commits ready for PR (use [[git-committer]] to prep)
**Outputs**: draft pull request on GitHub
**Side effects**: creates GitHub PR via `gh pr create` (default `--draft`)

## Phase 1: Gather Repository Context

1. **Current branch and remote** — run `git branch --show-current` and
   `git remote get-url origin`. Extract `owner` and `repo`.

2. **Full diff** — `git diff main...HEAD` (or the base branch). Note all changed
   files, added/removed functions, and config changes.

3. **Commits on this branch** — `git log main..HEAD --oneline`. Understand the
   narrative: is this one logical change or several squashed?

4. **PR template** — search the repo for a PR template. GitHub (and `gh pr create`)
   resolve templates case-insensitively from the repo root, `.github/`, and `docs/`.
   Cover all variants:

   - `pull_request_template.md` / `PULL_REQUEST_TEMPLATE.md` (repo root)
   - `.github/pull_request_template.md` / `.github/PULL_REQUEST_TEMPLATE.md`
   - `docs/pull_request_template.md` / `docs/PULL_REQUEST_TEMPLATE.md`
   - `PULL_REQUEST_TEMPLATE/*.md` (root multi-template folder)
   - `.github/PULL_REQUEST_TEMPLATE/*.md`
   - `docs/PULL_REQUEST_TEMPLATE/*.md`

   One-shot lookup:
   `find . .github docs -maxdepth 2 -iname 'pull_request_template*' -not -path '*/node_modules/*' 2>/dev/null`

   If found, read it. The draft **must** populate every section of the template.
   If multiple templates exist (multi-template folder), ask the user which to use.

## Phase 2: Linked Issue

5. Check the branch name for an issue number (e.g. `feat/123-add-caching` → `#123`).
   If found, fetch it: `gh issue view <number> --json title,body,url`.

6. Read the issue title, description, and any linked design docs or acceptance criteria.
   These drive the "why" sections of the PR.

## Phase 3: Build Status

7. **Confirm CI is green** — `bk build list --branch "$(git branch --show-current)"`.
   Check the `state` of the most recent build.
   - If `passed`: note this in the PR ("CI: ✓ passing").
   - If no build found: note "CI not yet triggered".

## Phase 4: Internal Context (Glean)

8. **Search for relevant internal docs** — `glean search "<PR topic keywords>"` (see
   [[glean-knowledge-search]]), e.g. "keyword mapper performance", "BigQuery CTE refactor".

   Look for: design docs, ADRs, Confluence pages, or prior related PRs to link in the
   description. At most 2–3 links — do not flood the PR with tangential references.

9. **Search for related PRs** — `gh pr list --search "<keywords>" --state all` on the
   same repo. Note if a similar change was previously attempted or reverted — flag this
   to the user.

## Phase 5: Draft

Compose the PR description. If a template exists, fill every section.
If no template exists, use this structure:

```markdown
## Summary

<!-- 2–4 bullet points: what changed and why -->

-
-

## Motivation

<!-- Link to issue, design doc, or explain the problem being solved -->

Closes #<issue> (if applicable)

## Changes

<!-- Grouped by concern, not by file -->

- **<Component A>**: <what changed>
- **<Component B>**: <what changed>

## Test plan

<!-- How to verify this works; what tests were added or updated -->

- [ ] Unit tests: `pytest tests/unit/...`
- [ ] Manual verification: <steps>

## Performance / cost impact

<!-- Especially for BQ query changes, batch size changes, or new API calls -->

N/A <!-- or fill in -->

## Rollback plan

<!-- How to revert if this causes issues in prod -->

Revert this PR. No schema or data migrations required. <!-- adjust as needed -->

## Related

<!-- Internal docs, ADRs, prior PRs -->

-
```

## Phase 6: Review Before Posting

Present the draft to the user. Ask:

> "Does this look accurate? Should I create the PR now, or do you want to edit first?"

Do **not** run `gh pr create` until the user explicitly confirms.

Once confirmed (write the approved draft to a file, then):

```bash
gh pr create --draft \
  --base main \
  --title "<derived from issue title or first summary bullet>" \
  --body-file <path-to-approved-draft>
# --head defaults to the current branch; drop --draft for ready-for-review;
# change --base if the user specified a different target branch.
```

## Rules

- Never push commits or force-push before creating the PR.
- Default to `draft: true` — let the user promote to ready-for-review.
- If the build is failing, block PR creation and surface the failure first.
- Do not invent issue numbers, doc links, or test commands — only include what was
  actually found.
- If no linked issue exists, omit "Closes #" rather than leaving a broken reference.
- Keep the summary ≤ 4 bullets. If there are more changes, group them by concern.
