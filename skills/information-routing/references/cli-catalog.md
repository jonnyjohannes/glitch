# CLI Catalog

Read only the section for the route already selected. These commands are discovery
and evidence-gathering paths; follow the relevant specialist skill for deeper
workflows and safety rules.

## `glean`

Use for Wayfair business context, internal terminology, ownership, architecture,
processes, historical decisions, and internal documentation. Query Glean before
public web research whenever a question could depend on a Wayfairism.

Known-good search form:

```bash
glean search "<focused query>" --return-llm-content --page-size 10 --max-snippet-size 10000
```

Known-good synthesis form:

```bash
glean chat --save=false "<specific synthesis question>"
```

Search narrowly first. Follow useful internal results rather than broadening to
public search immediately. If Glean fails for authentication, stop and ask
jonny to re-authenticate.

## `git`

Use for current repository behavior, local history, and change provenance.
Prefer reading the working tree before history:

```bash
git status --short --branch
git log --oneline -5
git show --stat <commit>
git log --oneline -- <path>
```

Use `git diff` and the actual source files to establish current behavior. Treat
history and linked upstream sources as corroboration, not substitutes for the
working tree.

## `gh`

Use for GitHub pull requests, issues, reviews, releases, repository metadata,
and commit state that is not available locally.

Start with the narrowest read-only command:

```bash
gh auth status
gh pr view <number>
gh issue view <number>
gh api repos/<owner>/<repo>/<endpoint>
```

Use `gh api` only when the porcelain command does not expose the required
field. If GitHub authentication fails, stop and ask jonny to re-authenticate.

## `bk`

Use for Buildkite build, job, annotation, log, and artifact state. Prefer the
Buildkite-specific [[buildkite-satisfier]] workflow for failure diagnosis.

```bash
bk auth status
bk build view <build_number> -p <pipeline> --json
bk api /pipelines/<pipeline>/builds/<build_number>/annotations
bk api /pipelines/<pipeline>/builds/<build_number>/jobs/<job_id>/log
```

Do not rerun builds or unblock jobs as part of routing. Those actions require
explicit user approval and belong to the specialist workflow.

## `jira`

Use for Jira ticket, issue, and workflow state. Start with the installed CLI's
help when the needed read operation is not already documented:

```bash
jira --help
```

Do not guess Jira flags or silently substitute public web search. If the command
requires authentication and fails, stop and ask jonny to re-authenticate.
