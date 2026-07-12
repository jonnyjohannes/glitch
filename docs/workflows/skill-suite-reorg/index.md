# Skill Suite Reorg

## Artifact Header

| Field | Value |
| --- | --- |
| Workflow | `skill-suite-reorg` |
| Artifact | `index` (`index.md`) |
| Status | `draft` |
| Owner skill | [[workflow-indexer]] |
| Inputs | [`10-spec.md`](./10-spec.md) |
| Next | [[workflow-indexer]], [[task-sharder]], [[verification-planner]] |
| Updated | 2026-07-12 |

## Status

- Phase: design
- Focus: progressive-disclosure workflow index + markdown artifact bus
- Blockers: none for the index pattern; remaining design questions live in [`10-spec.md#open-questions`](./10-spec.md#open-questions)
- Current source of truth: [`10-spec.md`](./10-spec.md)

## Recommended Next

1. Finalize task-card and verification artifact templates — see [`10-spec.md#open-questions`](./10-spec.md#open-questions).
2. Create [[workflow-indexer]] — see [`10-spec.md#new-skill-workflow-indexer`](./10-spec.md#new-skill-workflow-indexer).
3. Shard implementation work — see [`10-spec.md#implementation-plan`](./10-spec.md#implementation-plan).

## Artifact Map

<!-- workflow-indexer:begin artifact-map -->
| Artifact | Status | Owner | Purpose | Next |
| --- | --- | --- | --- | --- |
| [`10-spec.md`](./10-spec.md) | draft | [[tech-specer]] | design, decisions, implementation plan, ledger | [[workflow-indexer]], [[task-sharder]], [[verification-planner]] |
| `20-tasks.md` | missing | [[task-sharder]] | implementation task overview | create after spec scope is final enough |
| `30-verification.md` | missing | [[verification-planner]] | reusable test/verification plan | create after task shape is known |
<!-- workflow-indexer:end -->

## Progress Pointers

- Plan ledger: [`10-spec.md#plan-ledger`](./10-spec.md#plan-ledger)
- Resolved decisions: [`10-spec.md#resolved-decisions`](./10-spec.md#resolved-decisions)
- Open questions: [`10-spec.md#open-questions`](./10-spec.md#open-questions)
- Implementability check: [`10-spec.md#implementability-check`](./10-spec.md#implementability-check)

## Human Notes

- Keep this file thin. It is the start-here progress entrypoint, not the full duplicated spec.
- Follow links for detail; update owned artifacts first, then refresh this index.
