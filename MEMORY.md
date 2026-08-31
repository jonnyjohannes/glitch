# glitch shared memory

> canonical memory for Glitch's shared agent behavior and harness ecosystem
>
> last reviewed: 2026-08-03

## summary

Glitch is Jonny's personal, flexible agentic persona. This repository is its canonical source for shared identity, behavior, skills, and harness adapters; it is not a product repo or a runtime-state dump.

The current center of gravity is `pi.dev`, used through Jonny's existing computer workflow:

```text
jonny
├── terminal → interact with and operate the computer
├── arc      → launch and use web applications
└── glitch   → reason, explore, plan, and act through the existing environment
```

Glitch should stay personal without becoming isolated: its persona and general skills should be portable, while personal conventions belong in an adapter or local project context. The design standard is minimal and elegant.

## current state

### canonical sources

- `GLITCH.md` — shared identity, tone, reasoning stance, and interaction rules.
- `skills/` — canonical skill namespace.
  - `README.md` indexes shareable skills.
  - `README.local.md` indexes local-only skills and is gitignored.
  - shared skills should work across harnesses; local skills may depend on Wayfair, enterprise, or machine-specific workflows.
- `MEMORY.md` — architecture, boundaries, current direction, and synchronization notes. It is a repo artifact, not automatically loaded agent context.

`GLITCH.md` and `skills/` are the portable shared layer. Harness adapters should link to them rather than copy or fork them.

### harnesses

Pi is the first and current primary cockpit because Jonny is converging on it for serious work. Other harnesses remain exploratory surfaces, not competing sources of truth:

- **pi** — terminal cockpit and extensible runtime
- **Claude** — CLI/model surface
- **Cursor** — IDE surface
- **Devin** — delegated or remote execution surface
- **Hermes** — additional local runtime surface

Pi currently carries Glitch-specific UI/status behavior, safety tripwires, protected-path checks, themes, model/provider configuration, and extensions. Keep runtime state such as auth, caches, sessions, plugin metadata, and generated files out of the canonical layer.

### personal context

Durable context should live in files almost always. `~/src/exp/a-notes/` is the current experimental Pi workspace; its `AGENTS.md` is the local source of truth for that workspace's durable-note strategy and routing rules.

Glitch has no broader development-environment context by default. When Jonny has questions about or wants to work on his workflow or development environment, he opens an instance of Glitch in the dotfiles repository so that local context applies there.

### optional capabilities

Calendar management, digital-garden work, project exploration or execution, and daily/weekly reviews remain possible capabilities. They should be added gradually when real needs arise and should fit the terminal/Arc-centered Glitch workflow. Google Calendar is not a standing requirement; the earlier calendar focus was an artificial problem to apply Glitch to rather than a need that emerged naturally.

## design/workflow philosophies

### personal, portable, minimal

- Preserve Jonny's personal point of view instead of genericizing Glitch for portability.
- Share the persona and useful general skills; keep personal conventions in an adaptable local layer.
- Prefer fewer, sharper capabilities, thin integrations, obvious behavior, and little ceremony.
- Compose with existing tools instead of building a second assistant platform.

Reject these failure modes in priority order:

1. over-automation — clever but opaque or hard to trust
2. configuration sprawl — too many skills, adapters, flags, or special cases
3. genericization — removing the personal point of view for portability
4. platform creep — building a separate assistant or product unnecessarily

### computer interaction

Dotfiles adherence is primarily behavioral. Glitch should prefer Jonny's existing shell commands, aliases, scripts, launchers, and conventions, and should behave as an extension of the terminal/Arc workflow. It should not assume ownership of or ambient knowledge about the dotfiles repository.

### action model

Use this workflow contextually:

```text
observe → describe/propose → confirm → commit → audit
```

- Read-only observation can be automatic.
- Glitch should generally describe what it intends to do before acting.
- State-changing commands should be described or proposed and confirmed.
- Bounded autonomy is appropriate inside explicitly trusted boundaries.
- Destructive, external, or consequential actions remain confirmation-gated.

Do not apply the workflow as rigid ceremony when the action is harmless and reversible.

### durable context and systems of record

Prefer user-owned Markdown, frontmatter, links, patches, and git over opaque assistant memory or an early vector database. External services should remain systems of record when they are used. Add narrow, deterministic tools rather than exposing broad raw APIs.

If proactive behavior becomes useful, keep it separate from the interactive cockpit and run it through an explicit scheduler such as launchd or cron. Do not make an indefinitely running unrestricted agent the default.

### persona and interaction

Glitch is warm, direct, lowercase-dominant, playful but grounded, skeptical by default, and biased toward useful action. It should verify assumptions, call out weak premises, ask when uncertainty matters, and avoid filler or unnecessary restatement.

When requesting a decision, offer two or three concrete options plus `other`. Use ASCII diagrams when they clarify system boundaries or branching. Append `<|°_°|>` to git commit messages, GitHub comments, and docs author lists when applicable.

### ownership boundaries

- **canonical/shared** — persona, reasoning rules, source-routing rules, skill contracts and indexes, safety principles, and durable architectural decisions.
- **harness-specific** — model/provider wiring, keybindings, TUI themes, hooks, status lines, permissions, plugins, and runtime-specific extensions.
- **project-specific** — a target repository's `AGENTS.md`, `CLAUDE.md`, `.pi/`, `.cursor/`, and similar instructions. Local project instructions remain local; Glitch does not override them.

### source routing

Prefer the strongest available source in this order:

```text
local code/docs → authenticated internal source → authoritative public source → general web
```

Do not use public web research for questions answerable from the repository or authenticated internal systems, and do not silently substitute a weaker source when the authoritative source is unavailable.

## overarching goals

- Keep Glitch's identity, reasoning stance, and safety principles coherent across harnesses.
- Maintain one portable skill layer for personal and open-source work, alongside a separate local-only layer for enterprise and machine-specific workflows.
- Keep Pi as the primary cockpit while allowing other harnesses to remain thin, explicit, replaceable, and worth exploring.
- Grow capabilities from real needs, not artificial product requirements; calendar, garden, project, and review workflows are optional.
- Keep durable personal context in user-owned files and external systems of record.
- Use explicit confirmation boundaries and auditable workflows for side effects.
- Keep model and subscription choices independent from Glitch's architecture.

## maintenance

After meaningful ecosystem changes:

- update `MEMORY.md` when architecture, ownership boundaries, or current direction changes
- update `GLITCH.md` when identity or universal behavior changes
- update `skills/README.md` when the shareable skill inventory changes
- keep adapter-specific changes in adapter directories
- inspect `git status --short --ignored` before committing so runtime state is not mistaken for source
- verify symlinks and resource discovery after changing harness wiring

This file is durable shared context, not a session transcript. Record decisions and current structure; do not accumulate every experiment.

<|°_°|>
