---
name: readme-updater
description: >-
  Scan a repo's structure, code, and agentic assets, then generate or update its
  README with setup, install, usage, examples, and references. Use when the user
  says "update the readme", "generate readme", "refresh readme", or wants repo
  documentation brought in sync with current state.
tools: [Read, Edit, Write, Bash, Glob, Grep, Agent]
tags: [skill, docs, readme]
---

# readme-updater

Scans a repository and produces (or updates) a README that accurately reflects current state — setup, install, usage, examples, agentic assets, and references.

## Interface

**Inputs**: repo root path (defaults to cwd), optional focus areas or sections to emphasize
**Outputs**: updated `README.md` at repo root
**Side effects**: overwrites or creates `README.md`; may use [[git-committer]] to commit the result

## Core Principle

The README is a **living map** — it should be derivable from current repo state, not maintained by hand. This skill reads the repo and writes the map.

## Workflow

- [ ] Step 1: Scan the Repo
- [ ] Step 2: Detect Existing README
- [ ] Step 3: Assemble Sections
- [ ] Step 4: Write or Update README
- [ ] Step 5: Review + Commit

## Step 1: Scan the Repo

Gather signals from the repo to inform each section:

| Signal | Source |
|---|---|
| Language / framework | file extensions, `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Makefile`, etc. |
| Install / setup | dependency files, `Dockerfile`, `docker-compose.yml`, `.env.example`, setup scripts |
| Entry points / usage | `main.*`, `cli.*`, `bin/`, scripts in `package.json`, `Makefile` targets |
| Examples | `examples/`, `demo/`, inline doc comments, test files with clear usage patterns |
| Agentic assets | `AGENTS.md`, `CLAUDE.md`, `skills/`, `.claude/`, MCP configs, hooks |
| CI / tooling | `.github/`, `.buildkite/`, linting configs, formatter configs |
| Existing docs | `docs/`, `wiki/`, `CONTRIBUTING.md`, `LICENSE`, `CHANGELOG.md` |

Use `Glob` and `Read` to sweep — don't overthink it, just gather what's there.

## Step 2: Detect Existing README

**README exists?** →
- Read it fully
- Preserve user-written prose, badges, and custom sections
- Update factual/structural sections in place
- Add missing sections

**No README?** →
- Generate from scratch using template below

## Step 3: Assemble Sections

Include sections **only when the repo has relevant content**. Skip empty sections — don't scaffold placeholders.

### Section order (when applicable)

1. **Title + description** — repo name, one-liner from package manifest or `AGENTS.md`
2. **Badges** — preserve existing; don't invent new ones
3. **Overview** — 2-3 sentences on what this is and why it exists
4. **Prerequisites** — runtime, toolchain, system deps
5. **Installation** — clone + install steps derived from dependency files
6. **Configuration** — env vars, config files, `.env.example` contents
7. **Usage** — how to run, CLI flags, main entry points, Makefile targets
8. **Examples** — code snippets or links to `examples/` dir
9. **Agentic assets** — table or list of `AGENTS.md`, skills, MCP configs, hooks (link to each)
10. **Project structure** — brief tree of key directories (not exhaustive)
11. **Development** — linting, testing, formatting commands
12. **References** — links to docs, related repos, external resources
13. **License** — if `LICENSE` file exists, mention it

### Agentic assets section

This is the smrtrobot-specific bit. When the repo contains agentic assets:

```markdown

## Agentic Assets

| Asset | Description |
|---|---|
| [[AGENTS.md]] | ... |
| [[skills/README]] | ... |
| `.claude/` | ... |

```

Link with wikilinks where obsidian-sympatico. Include skills table if `skills/README.md` exists.

## Step 4: Write or Update README

**Updating?** → Use `Edit` to surgically update sections. Preserve voice/tone of existing prose.

**Creating?** → Use `Write` with the assembled content.

Guidelines:
- Match repo's existing tone (formal project = formal readme, casual = casual)
- For smrtrobot repos, use the casual tone from [[AGENTS]]
- Keep it scannable — headers, bullets, short paragraphs
- Code blocks for all commands and examples
- No placeholder text ("TODO", "coming soon") — if you don't know it, skip it

## Step 5: Review + Commit

- Re-read the final README to verify accuracy
- Flag anything you inferred but aren't confident about
- Offer to commit via [[git-committer]] if changes look good

## Failure Modes

- Inventing features or commands that don't exist in the repo
- Including sections with no actual content ("Examples: TBD")
- Overwriting user-written narrative prose with generated text
- Missing agentic assets when they're clearly present
- Generating a wall of text for a tiny repo

## Heuristic

> The best README is the one you wouldn't need to update after reading the repo.
> If it says something the code doesn't back up, delete it.
