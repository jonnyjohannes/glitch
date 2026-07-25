---
name: information-routing
description: >-
  Routes open-ended, underspecified, or "where should I look?" questions to
  the strongest available source before using public web. Use early for
  research or debugging requests that may depend on local repository behavior,
  Wayfair internal context, Buildkite, GitHub, Jira, or external library
  behavior; progressively disclose the matching CLI (`git`, `glean`, `gh`,
  `bk`, or `jira`) from references/cli-catalog.md.
tools: [Read, Bash]
tags: [skill, routing, research, wayfair]
---

# Information Routing

Route the question first; then use a specialist skill such as [[buildkite-satisfier]], [[bigquery-data-explorer]], or
[[pr-reviewer]] when the route is clear.

## Interface

**Inputs**: an open-ended question, investigation, or request for authoritative information
**Outputs**: a source plan, evidence gathered from the best available source, and provenance
**Side effects**: read-only local or authenticated CLI calls; never silently falls back after an auth failure

## Source order

Prefer the strongest source that can answer the actual question:

```text
local code/docs → Glean/internal sources → authoritative public sources → general web
```

A Wayfair-specific question must go to `glean` before public web research. A
current-repository question starts locally. Do not use the web merely because
the question is open-ended.

## Routing table

| Situation | Start here | Fallback / corroboration |
| --- | --- | --- |
| Current implementation or repository behavior | local code, docs, and `git` | tests, history, linked upstream sources |
| Wayfair business context, infrastructure, ownership, practices, processes, acronyms, jargon, or historical decisions | `glean` | linked internal source docs, then ask jonny |
| Wayfair infrastructure/platform problem, even if it looks generic | local code + `glean` | operational state, then authoritative public docs |
| Buildkite build, job, log, or artifact state | `bk` | repository config and GitHub history |
| GitHub PR, issue, review, release, or repository state | `gh` | `gh api` for gaps |
| Jira ticket or workflow state | `jira` | linked code, docs, and discussions |
| External library, API, or public technology behavior | official docs and source | public web research |

## Workflow

- [ ] Parse the request into a subject, desired answer, and likely system boundary.
- [ ] Classify the request with the routing table before choosing a tool.
- [ ] If a CLI is needed, read only the matching heading in
      `references/cli-catalog.md`; do not preload the entire catalog.
- [ ] Use the selected source and capture the relevant evidence, not just a
      conclusion.
- [ ] If the route maps to a specialist skill, hand off to it after routing;
      do not duplicate its domain workflow here.
- [ ] Report the source used and any meaningful gaps or corroboration needed.
- [ ] Stop on authentication failures and ask jonny to re-authenticate. Never
      silently replace an unavailable internal source with weaker public research.

## Progressive disclosure

Use the smallest useful context layer:

1. **This file** — classify the question and select the source.
2. **`references/cli-catalog.md`** — read the selected CLI's commands and auth
   notes only when a CLI call is required.
3. **A specialist skill or its references** — load domain-specific procedure
   only after routing identifies that domain.
4. **Authoritative public sources or general web** — use only when the stronger
   local/internal route is unavailable or insufficient.

The catalog currently covers `glean`, `git`, `gh`, `bk`, and `jira`. Specialist
skills may own additional domain CLIs and their safety rules.

## Non-negotiable CLI rules

- Prefer local CLIs over MCP or public web when they cover the knowledge domain.
- Use the known-good forms in `references/cli-catalog.md`; do not reconstruct
  non-obvious flags from memory.
- Treat the catalog as a capability map, not an availability guarantee. If
  installation is uncertain, check `command -v <cli>` before using it.
- If a needed command is not cataloged, inspect `<cli> --help` before composing
  a command.
- Keep calls read-only unless the user explicitly requests a state change and
  the relevant specialist skill permits it.
- For mixed internal/external questions, finish the local/internal pass before
  corroborating publicly.
