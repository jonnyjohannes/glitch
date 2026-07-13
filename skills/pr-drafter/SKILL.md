---
name: pr-drafter
description: >-
  Drafts or creates team-ready pull requests from the repo template, git diff,
  linked issue, build status, plan docs, and relevant internal context. Treats
  repository PR templates as required output contracts. Use when the user asks
  to "draft a PR", "write my PR description", or "create a pull request".
tools: [Bash, Read, Glob]
tags: [skill, github, authoring]
---

# PR Drafter

## Interface

**Inputs**: branch with commits ready for PR (use [[git-committer]] to prep), optional base branch or template choice
**Outputs**: user-approved PR title/body conforming to the selected repository template
**Side effects**: creates GitHub PR via `gh pr create` only after approval (default `--draft`)

## Core Contract: Template First

A repository PR template is the output contract, not inspiration.

When a template exists:

- Preserve its headings, order, checklists, and requested sections.
- Fill the template in place; do not substitute the fallback format.
- Do not rename, reorder, or remove sections because another structure reads better.
- Use `N/A — <reason>` for genuinely inapplicable sections rather than deleting them.
- Preserve HTML guidance comments unless they explicitly instruct authors to remove them.
- Replace visible placeholders such as `<description>` or `TODO`; do not ship unfilled prompts.
- Check a box only when evidence supports it. Keep unsupported boxes unchecked.
- Put extra context into the closest template section. Ask before adding new top-level headings.

The approved preview and the `--body-file` passed to `gh pr create` must be the same content.

## Phase 1: Select the Template and Gather Repository Context

1. **Current branch, remote, and base** — run `git branch --show-current` and
   `git remote get-url origin`. Resolve the base from the user, existing PR metadata,
   or the remote default branch; do not assume `main` when the repo says otherwise.

2. **Select the PR template before drafting** — search case-insensitively in the
   base branch and working tree for:

   - `pull_request_template.md` at repo root, `.github/`, or `docs/`
   - `PULL_REQUEST_TEMPLATE/*.md` at repo root, `.github/`, or `docs/`

   Exclude generated/vendor directories. Prefer the base-branch version because that
   is the target repository contract; use the working-tree copy when no base version
   is available.

   Selection rules:

   - User explicitly names a template → use it.
   - Exactly one applicable template → use it automatically.
   - Multiple named templates → show filenames/titles and ask which one to use.
   - Default template plus named alternatives → use the default unless the user asks
     for a named alternative.
   - No template → use the fallback structure in Phase 5.

   Read and retain the exact selected template before gathering prose. Record its path
   so the review phase can validate the final body against it.

3. **Full diff** — `git diff <base>...HEAD`. Note changed behavior, files,
   functions, tests, configuration, migrations, and operational impact.

4. **Commits on this branch** — `git log <base>..HEAD --oneline`. Understand the
   change narrative and whether multiple concerns need to be grouped in prose.

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

8. **Search for relevant internal docs** — use `glean search "<PR topic keywords>"`,
   e.g. "keyword mapper performance" or "BigQuery CTE refactor".

   Look for: design docs, ADRs, Confluence pages, or prior related PRs to link in the
   description. At most 2–3 links — do not flood the PR with tangential references.

9. **Search for related PRs** — `gh pr list --search "<keywords>" --state all` on the
   same repo. Note if a similar change was previously attempted or reverted — flag this
   to the user.

## Phase 5: Draft Against the Contract

### Template exists

Start from an exact copy of the selected template and fill it in place.

For every heading, prompt, and checklist item:

1. Identify what evidence it requests.
2. Fill it from the diff, issue, build, plan doc, or verified internal context.
3. If it does not apply, write `N/A — <specific reason>` while retaining the section.
4. Leave checklist items unchecked unless they are demonstrably complete.
5. Preserve the original section order and wording.

Do not graft the fallback headings below onto a repository template. If useful context
has no obvious home, ask the user whether to append it rather than silently changing
the contract.

### No template exists

Use this fallback structure:

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

## Phase 6: Template Fidelity Check and Approval

When a template was selected, compare the draft with it line by line before presenting.

Template fidelity checklist:

- [ ] Selected template path is stated.
- [ ] Every template heading is present with exact wording and original order.
- [ ] Every requested section contains content or an explicit `N/A — <reason>`.
- [ ] Template checklist items are preserved and truthfully checked/unchecked.
- [ ] Required HTML comments/instructions are preserved.
- [ ] No visible placeholder text remains.
- [ ] No fallback headings replaced or displaced template sections.
- [ ] No new top-level heading was added without user approval.

If any check fails, fix the body before showing it to the user.

Present the title and complete body, naming the template used. Ask:

> "This draft follows `<template path>`. Does it look accurate? Should I create the PR now, or do you want to edit first?"

When no template exists, say that explicitly and note that the fallback structure was
used.

Do **not** run `gh pr create` until the user explicitly confirms. After edits, rerun
the fidelity check. Write the exact approved body to a file, then run:

```bash
gh pr create --draft \
  --base main \
  --title "<derived from issue title or first summary bullet>" \
  --body-file <path-to-approved-draft>
# --head defaults to the current branch; drop --draft for ready-for-review;
# change --base if the user specified a different target branch.
```

## Rules

- **Template beats house style** — repository template structure always takes priority
  over the fallback format and personal formatting preferences.
- **No silent template drift** — never remove, rename, reorder, or replace template
  sections without explicit user approval.
- Never push commits or force-push before creating the PR.
- Default to `draft: true` — let the user promote to ready-for-review.
- If the build is failing, block PR creation and surface the failure first.
- Do not invent issue numbers, doc links, test commands, or checked boxes — include
  only what the gathered evidence supports.
- If no linked issue exists, follow the template's convention; otherwise omit
  `Closes #` rather than leaving a broken reference.
- Keep summaries concise unless the selected template requests otherwise.
