# Buildkite Failure Investigator

## Phase 1: Identify the Build

1. **Determine pipeline and build number.**
   - If the user provides a URL like `https://buildkite.com/org/pipeline/builds/123`,
     extract `org`, `pipeline`, and `build_number`.
   - Otherwise, use `git branch --show-current` to get the branch name, then call
     `list_builds` (`user-buildkite`) filtered by `branch` to find the latest failing build.

2. **Fetch build details** — `get_build` with the resolved `org`, `pipeline`, `build_number`.
   Note: `state` (failed/passed), `branch`, `commit`, `created_at`, and each `jobs[]` entry.

3. **Fetch annotations** — `list_annotations` for the build. Annotations often contain
   structured test failure summaries that are faster to read than raw logs.

## Phase 2: Pinpoint the Failing Step

4. **Identify failed jobs** — from `get_build` response, filter `jobs[]` where `state = "failed"`.
   Note each job's `id`, `name`, and `exit_status`.

5. **For each failed job**, read logs in order:
   - `read_logs` (full log, up to token limit)
   - If the log is large, use `search_logs` with targeted patterns:
     - `"ERROR"`, `"FAILED"`, `"AssertionError"`, `"ModuleNotFoundError"`, `"exit code"`

6. **Categorize the failure type:**

   | Type | Signals in logs | Next action |
   |---|---|---|
   | Test failure | `FAILED`, `AssertionError`, test file paths | Read the failing test file |
   | Import/dep error | `ModuleNotFoundError`, `ImportError` | Check `requirements.txt` / `pyproject.toml` |
   | Lint error | `flake8`, `ruff`, `pylint`, line/col refs | Read the flagged file |
   | Build/Docker error | `docker build`, `Dockerfile`, `RUN` step | Read Dockerfile |
   | Timeout/OOM | `Killed`, `signal 9`, `memory` | Note resource limits |
   | Deploy error | `gcloud`, `kubectl`, `cloudrun.yaml` | Read deploy config |

## Phase 3: Correlate with Recent Changes

7. **Identify the commit** — from `get_build`, take the `commit` SHA.
   Call `get_commit` (`user-github`) for the diff summary and changed files.

8. **Check recent history** — `list_commits` for the branch (last 5) to spot if this is
   a regression introduced in a recent merge.

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

- Never rerun the build without user confirmation.
- Never unblock a job (`unblock_job`) unless explicitly asked.
- If multiple jobs failed, diagnose the first chronological failure first — later failures
  are often cascades.
- If logs are inaccessible (auth error), instruct the user to run
  `buildkite-agent artifact download` locally and share the output.

## Fallback (no MCP access)

```bash
# Get recent builds for a pipeline
buildkite-agent pipeline list
# Fetch logs from a job
buildkite-agent artifact download "*.log" . --build <build-uuid>
```
