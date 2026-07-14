---
name: buildkite-satisfier
description: Investigates Buildkite failures using bk, gh, and git; use when diagnosing failed Buildkite builds, jobs, annotations, logs, or CI regressions.
tools: [Bash, Read, Edit]
tags: [skill, ci, buildkite]
---

# Buildkite Failure Investigator

Uses the `bk` CLI (`bk build`, `bk artifacts`, `bk api`) for Buildkite and the `gh`
CLI / `git` for commit correlation. `bk api` is a raw REST/GraphQL passthrough scoped
to the authenticated org — use it for anything the porcelain commands don't cover
(annotations, job logs). Check `bk auth status` if calls fail.

## Interface

**Inputs**: Buildkite URL, pipeline/build number, failing branch, or CI regression context
**Outputs**: evidence-backed failure diagnosis with likely trigger and suggested fix
**Side effects**: reads Buildkite/GitHub state; may edit a local trivial fix, but never reruns or unblocks jobs without approval

## Phase 1: Identify the Build

1. **Determine pipeline and build number.**
   - If the user provides a URL like `https://buildkite.com/org/pipeline/builds/123`,
     extract `org`, `pipeline`, and `build_number`.
   - Otherwise, use `git branch --show-current` to get the branch, then
     `bk build list --branch "<branch>"` (add `-p <pipeline>` / `--state failed` to
     narrow) to find the latest failing build.

2. **Fetch build details** — `bk build view <build_number> -p <pipeline> --json`.
   Note: `state` (failed/passed), `branch`, `commit`, `created_at`, and each job's
   `id`, `name`, and `exit_status`.

3. **Fetch annotations** — `bk api /pipelines/<pipeline>/builds/<build_number>/annotations`.
   Annotations often contain structured test-failure summaries that are faster to read
   than raw logs.

## Phase 2: Pinpoint the Failing Step

4. **Identify failed jobs** — from the `bk build view` output, filter jobs where
   `state = "failed"`. Note each job's `id`, `name`, and `exit_status`.

5. **For each failed job**, read the log via the API:
   - `bk api /pipelines/<pipeline>/builds/<build_number>/jobs/<job_id>/log`
   - To search a large log:

     ```bash
     bk api .../jobs/<job_id>/log | grep -nE "ERROR|FAILED|AssertionError|ModuleNotFoundError|exit code"
     ```

6. **Categorize the failure type:**

   | Type               | Signals in logs                             | Next action                                 |
   | ------------------ | ------------------------------------------- | ------------------------------------------- |
   | Test failure       | `FAILED`, `AssertionError`, test file paths | Read the failing test file                  |
   | Import/dep error   | `ModuleNotFoundError`, `ImportError`        | Check `requirements.txt` / `pyproject.toml` |
   | Lint error         | `flake8`, `ruff`, `pylint`, line/col refs   | Read the flagged file                       |
   | Build/Docker error | `docker build`, `Dockerfile`, `RUN` step    | Read Dockerfile                             |
   | Timeout/OOM        | `Killed`, `signal 9`, `memory`              | Note resource limits                        |
   | Deploy error       | `gcloud`, `kubectl`, `cloudrun.yaml`        | Read deploy config                          |

## Phase 3: Correlate with Recent Changes

7. **Identify the commit** — from `bk build view`, take the `commit` SHA. Inspect it
   with `git show --stat <sha>` (if local) or `gh api repos/{owner}/{repo}/commits/<sha>`
   for the diff summary and changed files.

8. **Check recent history** — `git log --oneline -5 <branch>` to spot whether this is a
   regression introduced in a recent merge.

9. **Cross-reference** — if the failing test or file appears in the commit diff, that is
   the likely cause. State this explicitly.

## Phase 4: Diagnosis and Fix

10. **Read relevant source files** — read the actual file(s) implicated by the failure.
    Never rely on log excerpts alone.

11. **Present diagnosis** as a structured summary:

    ```
    ## Build Failure Summary

    **Pipeline:** <name>  **Build:** #<n>  **Branch:** <branch>
    **Failed step:** <job name>  **Exit code:** <n>
    **Failure type:** <Test / Lint / Import / Deploy / Other>

    ### Root cause
    <One paragraph: what failed, which file/line, why>

    ### Likely trigger
    <Commit SHA and which file change caused the regression, if identifiable>

    ### Suggested fix
    <Specific code change or command to resolve>
    ```

12. **Offer to implement the fix** — if it is a code change, ask the user before editing.
    If it is a lint error or trivial import fix, apply it directly and note what changed.

## Rules

- Never rerun the build (`bk build rebuild`) without user confirmation.
- Never unblock a job unless explicitly asked; only then run `bk api --method PUT /pipelines/<pipeline>/builds/<n>/jobs/<job_id>/unblock`.
- If multiple jobs failed, diagnose the first chronological failure first — later
  failures are often cascades.
- If logs or the API are inaccessible, check `bk auth status`; for artifacts use
  `bk artifacts list <build_number>` / `bk artifacts download <build_number>`.
