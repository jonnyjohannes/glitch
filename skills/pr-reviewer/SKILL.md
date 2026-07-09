---
name: pr-reviewer
description: >-
  Reviews GitHub pull requests with structured, actionable feedback prioritizing
  correctness, simplicity, readability, maintainability, and team-appropriate best
  practices, then posts a full summary review on the PR plus inline comments on
  specific lines where feedback maps cleanly to a location, via the gh CLI unless
  the user asked for a local/draft-only review. Use when the user asks
  for a PR review, code review before merge, feedback on a pull request, or to
  post review comments to a GitHub PR by URL or number.
tools: [Read, Bash]
tags: [skill, github, code-review]
---

# Review GitHub PR

## Interface

**Inputs**: PR number/URL, or current branch with an open PR
**Outputs**: structured review markdown (verdict + summary + inline comments)
**Side effects**: posts GitHub review with inline comments via `gh api`

This skill **writes a review, posts the full summary as the PR review body, and adds inline comments on relevant lines**. It does **not** implement code fixes. For **addressing** existing review threads and posting **inline replies** as an author, use [[pr-responder]].

## When to post

- **Post** the composed review to GitHub when the user wants feedback on the PR and did **not** ask for draft-only, local-only, or “don’t post.”
- **Do not post** if the user asked only to preview, draft, or discuss privately — share the markdown in chat only.
- If authentication fails (`gh auth status`), show the review in chat and give the `gh` commands to post manually.

Derive `owner` and `repo` from `git remote get-url origin` (strip `.git`). Ensure `gh auth status` is authenticated before posting.

## Principles

- **Simplicity first** — prefer the smallest change that meets the requirement; flag unnecessary abstraction, premature generalization, and scope creep.
- **Readability** — clear names, short functions, obvious control flow, consistent style with the surrounding codebase.
- **Maintainability** — coupling, testability, docs/comments where the code is non-obvious, migration or rollback considerations when relevant.
- **Best practices** — match project patterns; call out security, error handling, and API contract risks with concrete evidence.
- **Constructive and specific** — every issue should cite `path` and approximate line or symbol; avoid vague or purely subjective nits unless the team’s conventions demand them.

## Phase 1: Context gathering (align with resolver)

Mirror the resolver’s opening steps so reviews are grounded in the same facts:

1. **Identify the PR** — `git branch --show-current`, `git remote -v`. Use `gh pr view --json number,title,headRefOid` for the open PR on the current branch; if none, ask for PR number and repo (or URL).
2. **Fetch the diff** — `gh pr diff <number>` for full change context.
3. **Read on-disk files** — for each file touched or heavily implied by the diff, read the current workspace version. Do not rely on the diff alone for final line numbers or surrounding behavior.
4. **Tests and config** — if the PR changes behavior or public APIs, read or skim related tests and any config/env docs the diff references.

If review comments already exist on the PR, optionally fetch them (`gh api repos/{owner}/{repo}/pulls/<number>/comments`) to avoid duplicating points unless adding new evidence or severity.

## What to evaluate

| Area                   | Focus                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Correctness**        | Logic, edge cases, error paths, data contracts, race or consistency issues      |
| **Tests**              | Gaps for new behavior, brittle tests, missing negative cases                    |
| **Security & privacy** | Authz, secrets, injection, logging of sensitive data                            |
| **Simplicity**         | YAGNI, dead code, over-engineering, unnecessary dependencies                    |
| **Readability**        | Naming, structure, comments (only where they earn their keep)                   |
| **Maintainability**    | Coupling, duplication that should stay DRY, observability, upgrade paths        |
| **Performance**        | Only when the change introduces hot paths, N+1 queries, or obvious inefficiency |

**Deprioritize** pure formatting or style that tooling already enforces, unless the PR violates repo conventions.

## Inline comments vs summary body

Post **both**:

1. **Summary review** — the full markdown below becomes the **top-level review body** (verdict, narrative, grouped issues, questions, follow-ups). Keep this complete and readable on its own.
2. **Inline comments** — short notes anchored to **exact lines** in the PR diff for feedback that benefits from local context.

**Put on the line (inline)** when the note is tied to a **specific line or tiny hunk**: bug at a statement, unclear name, risky call, wrong default, typo, or a **direct question** about that code. Keep each inline body **brief** (1–3 sentences); the summary bullet can expand with full rationale.

**Summary only** (no inline): themes spanning many files, architecture, test strategy, strengths, verdict rationale, or items where **line anchoring would be wrong or noisy** (e.g. uncertain line, file-wide concern, policy discussion).

**Accuracy rule:** only add an inline comment when **`path` and line number** map unambiguously to the **PR head** version of the file (the side of the diff you are reviewing). If mapping is shaky, keep the point in the summary only.

**Noise rule:** do not inline every nit; batch minor style points in the summary unless one line is uniquely wrong.

## Output format

Deliver a single review in this structure (adjust headings if the user asked for a shorter summary). While drafting, track which bullets also get an **inline** copy (see Phase 2).

```markdown
# PR review: <title or PR #>

## Verdict

**Approve** | **Approve with nits** | **Request changes** — one sentence why.

## Summary

2–4 sentences on what the PR does and overall quality.

## Strengths

- Bullet list of concrete good decisions (with references).

## Issues

### Blocking (must fix before merge)

- **<file>:** <issue> — <why it matters> — <suggestion>.

### Major (should fix)

- ...

### Minor / nits (optional)

- ...

## Questions for author

- Clarifications that affect correctness or design (not idle curiosity).

## Suggested follow-ups (non-blocking)

- Test ideas, refactors, or docs that can be separate PRs.
```

Use severity honestly: **blocking** only for bugs, security, broken contracts, or merge risk that tests/CI would not catch.

## Phase 2: Post summary + inline comments to the PR (align with resolver)

After the review markdown is complete (and shown to the user in chat), submit **one** pull request review that includes:

- **`body`** — the **entire** markdown review above (unchanged; this is the summary the author sees first).
- **`comments`** — zero or more **inline** review comments, each with `path`, `line` (in the PR head file), and a short `body`.

Same flow as [[pr-responder]] Phase 4, but inline bodies are **new review feedback**, not replies to existing threads.

### Map verdict → GitHub event

| Verdict in review     | GitHub review `event`                          |
| --------------------- | ---------------------------------------------- |
| **Request changes**   | `REQUEST_CHANGES`                              |
| **Approve**           | `APPROVE`                                      |
| **Approve with nits** | `APPROVE` (nits in summary body and/or inline) |

Use **`COMMENT`** instead when the user asked for non-binding feedback, when org policy treats all bot/agent output as comment-only, or when unsure whether approval should count — the full structured body still attaches to the review.

### Post via `gh api`

`gh pr review` alone cannot attach multiple line comments in one review, so ship the summary **and** the inline comments together with a single **`gh api`** POST to [`/repos/{owner}/{repo}/pulls/{pull_number}/reviews`](https://docs.github.com/en/rest/pulls/reviews#create-a-review-for-a-pull-request):

- `commit_id` — PR head OID, e.g. `gh pr view <number> --json headRefOid -q .headRefOid`
- `body` — full summary markdown (same as chat)
- `event` — `APPROVE`, `REQUEST_CHANGES`, or `COMMENT` (uppercase)
- `comments` — array of `{ "path": "...", "line": <number>, "body": "..." }` for each inline note

Example (build `review-payload.json` then post):

```bash
COMMIT=$(gh pr view <number> --json headRefOid -q .headRefOid)
# build review-payload.json: { "commit_id": "<COMMIT>", "body": "...", "event": "...", "comments": [ ... ] }
gh api --method POST repos/{owner}/{repo}/pulls/<number>/reviews --input review-payload.json
```

**Commit SHA:** inline comments apply to the **latest head commit** of the PR; refresh `headRefOid` if the branch may have moved. If the inline JSON is too awkward, post the **summary** only with `gh pr review <number> --body-file <file>` and tell the user inline comments need the scripted `gh api` call.

### After posting

Confirm in chat with the PR link, **`event`**, and **count of inline comments** posted. If posting fails, paste the error and leave the full review (and proposed inline list) in chat so the user can post manually.

### Optional line in the summary body

If many inline comments were added, one short line near the top of the summary is fine, e.g. _“Inline notes added on the diff for line-specific questions and fixes.”_ Do not replace detailed bullets with that line alone.

## After the review

If the user wants to **implement** feedback or **reply to existing review threads**, switch to the workflow in [[pr-responder]].

## Read-only context (no posting)

```bash
gh pr view <number> --web   # or --json title,body,files
gh pr diff <number>
gh api repos/{owner}/{repo}/pulls/<number>/comments   # existing review comments if needed
```
