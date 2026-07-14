# information routing

prefer local CLIs over MCP or public web when they cover the knowledge domain.

if a problem could depend on a Wayfairism, query `glean` before searching the public web. for mixed internal/external problems, use this order:

```text
local code → Glean/internal sources → authoritative public sources → general web
```

| situation                                                                                                            | start here                  | fallback / corroboration                          |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------- |
| current implementation or repository behavior                                                                        | local code, docs, and `git` | tests, history, linked upstream sources           |
| Wayfair business context, infrastructure, ownership, practices, processes, acronyms, jargon, or historical decisions | `glean`                     | linked internal source docs, then ask jonny       |
| Wayfair infra/platform problem, even if it initially looks generic                                                   | local code + `glean`        | operational state, then authoritative public docs |
| Buildkite build, job, log, or artifact state                                                                         | `bk`                        | repository config and GitHub history              |
| GitHub PR, issue, review, release, or repository state                                                               | `gh`                        | `gh api` for gaps                                 |
| Jira ticket or workflow state                                                                                        | `jira`                      | linked code, docs, and discussions                |
| external library, API, or public technology behavior                                                                 | official docs and source    | public web research                               |

## known-good CLI fast paths

use these exact forms rather than reconstructing non-obvious flags:

```bash
glean search "<focused query>" --return-llm-content --page-size 10 --max-snippet-size 10000
glean chat --save=false "<specific synthesis question>"
```

## available local CLIs

- `glean` — Wayfair internal knowledge and document search
- `gh` — GitHub
- `bk` — Buildkite
- `jira` — Jira
- `git` — version control

if a call fails for authentication reasons, pause and let jonny re-authenticate before proceeding. do not silently fall back to a weaker source.
