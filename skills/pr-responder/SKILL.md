---
name: pr-responder
description: >-
  Pulls GitHub PR review comments via the gh CLI, evaluates each
  against actual codebase behavior, test coverage, and architectural context before
  touching any code, then implements valid fixes in priority order and posts specific
  inline reply comments for each resolved or pushed-back item. Use when the user asks
  to address, fix, or resolve PR review comments, or when given a PR URL/number and
  asked to handle reviewer feedback. Never changes business logic.
tools: [Read, Edit, Bash]
tags: [skill, github, code-review]
---

# PR Review Resolver

## Interface

**Inputs**: PR with unresolved review comments (from [[pr-reviewer]] or human reviewers)
**Outputs**: code fixes + inline reply comments on each resolved thread
**Side effects**: commits and pushes to branch, posts GitHub review replies via `gh` CLI

## Phase 1: Context Gathering

1. **Identify the PR** — run `git branch --show-current` and `git remote -v`.
   Use `gh pr view --json number,headRefName,headRefOid` to confirm the open PR on the
   current branch. If none found, ask the user for the PR number and repo.

2. **Fetch all review threads** — `gh pr view <number> --json reviewThreads` (or
   `gh api repos/{owner}/{repo}/pulls/<number>/comments` for the raw list, paginated).
   Skip any thread already resolved.

3. **Fetch diff** — `gh pr diff <number>` for full context.

4. **Read affected files** — read the current on-disk state of every file referenced
   in unresolved threads. Never rely on the diff alone; the file may have changed.

## Phase 2: Triage (present to user before implementing anything)

Classify every unresolved thread:

| Class         | Criteria                                                                 | Action                                         |
| ------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| **Implement** | Correct, well-scoped, consistent with existing patterns                  | Fix it                                         |
| **Clarify**   | Ambiguous intent or multiple valid interpretations                       | Block; ask user                                |
| **Push back** | Breaks functionality, YAGNI, contradicts established pattern, no context | Explain technically; skip unless user confirms |

**Push back triggers — use code evidence, not opinion:**

- The change alters observable behavior (verify with tests before deciding).
- The suggested pattern is not used elsewhere in this codebase.
- It introduces a new dependency not already present in this module.
- It solves a problem that doesn't exist at this codebase's scale or data volume.
- It contradicts a decision documented in existing code comments, ADRs, or prior PRs.

Present the full triage as a table. **Do not implement anything until the user confirms
there are no Clarify or Push back items requiring discussion.**

## Phase 3: Implementation (in priority order)

Priority: **blocking** (bug / security / crash) → **correctness** → **code quality** →
**style**.

For each Implement item:

1. Re-read the current file state (never assume from diff).
2. Make the **minimal change** that satisfies the comment. Do not refactor adjacent code.
3. Run `ReadLints` on the edited file. Fix any **new** lint errors introduced.
4. Run the narrowest available test scope (e.g. `pytest tests/unit/test_<module>.py -x`).
5. If a fix causes a test failure, surface the failure to the user and pause.

**Hard constraints:**

- No changes to business logic, algorithmic behavior, or data contracts.
- No signature changes that affect callers outside the PR's scope.
- Never modify test assertions to make a failing test pass.
- Never push to `main` or `master`.

## Phase 4: Push and Reply

1. Commit with a descriptive message referencing the review (e.g.
   `address PR review: <short summary>`). Push to the current branch with
   `git commit && git push`.

2. For each resolved thread, post an inline reply anchored to the original comment:
   - Per thread: `gh api --method POST repos/{owner}/{repo}/pulls/<number>/comments/<comment_id>/replies -f body="..."`
   - Or batch all replies into one review: `gh api --method POST repos/{owner}/{repo}/pulls/<number>/reviews --input payload.json`
     (`event: COMMENT`, with `comments[]` at the same `path` + `line` as each original comment).

3. **Reply format — describe what changed, not feelings:**

   Implemented fix:

   ```
   Fixed: <one sentence — what was changed, in which file/function, and why it
   satisfies the comment>. E.g. "Moved X validation into _validate() so it's
   reused by both callers (lines 42-48 of foo.py)."
   ```

   Pushed back:

   ```
   Not implemented: <technical reason with evidence>. E.g. "This would change the
   return type consumed by bar.py:L91 which expects a dict; test_bar.py:L34
   verifies that contract. Open to revisiting if the caller is also in scope."
   ```

   Clarified and resolved per user guidance:

   ```
   Implemented per clarification: <what was done>.
   ```

## Quick reference (gh)

```bash
gh pr view <number> --json reviewThreads,headRefName,headRefOid
gh api repos/{owner}/{repo}/pulls/<number>/comments            # raw review comments
gh pr comment <number> --body "..."                            # general (non-inline) comment
```

Commit and push normally with git.

## Notes

- Derive `owner` and `repo` from `git remote get-url origin` (strip `.git` suffix).
- Ensure `gh auth status` is authenticated before fetching threads or posting replies.
- When multiple fixes touch the same file, batch all edits before running lint/tests
  once per file, not per comment.
- Conflicts between two reviewer suggestions targeting the same code: surface both to
  the user and ask which takes precedence before implementing either.
