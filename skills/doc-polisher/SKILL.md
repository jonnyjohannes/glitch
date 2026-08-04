---
name: doc-polisher
description: >-
  Improves the clarity, structure, and voice of documents and notes. Use when the
  user asks to polish writing, improve docs, tighten prose, rewrite notes, or make
  technical documentation easier to understand.
tools: [Read, Edit, Glob]
tags: [skill, docs, writing]
---

# Doc Polisher

## Interface

**Inputs**: draft text, a document path, or a set of documents to review
**Outputs**: clearer, more consistent writing that preserves the author's meaning
**Side effects**: edits files only when requested; otherwise returns suggested revisions and rationale

Polish writing, not just grammar. Preserve the author's intent, facts, and useful personality while making the document easier to scan and act on. Follow the broader conventions in [[AGENTS]] and defer specialized document structure to skills such as [[tech-specer]] when they apply.

## Writing principles

### Start with purpose

- Identify the audience and the action or understanding the document should enable.
- Lead with the conclusion, decision, recommendation, or most useful context.
- Remove setup that does not help the reader interpret or use the material.
- State assumptions, scope, and unresolved questions explicitly.

### Make prose direct

- Prefer concrete nouns and strong verbs over abstractions and nominalizations.
- Use active voice when the actor matters; use passive voice when the action or result matters more than the actor.
- Keep sentences focused on one idea. Split long sentences when the relationship between ideas is unclear.
- Cut filler, repetition, hedging, throat-clearing, and jargon that the audience does not need.
- Use precise qualifiers instead of vague words such as “some,” “often,” or “soon.” Do not strengthen a claim beyond the evidence.
- Use consistent terminology. Define an acronym or domain term at first use when the audience may not know it.

### Structure for scanning

- Use headings that describe the content or question they answer, not generic labels.
- Put related ideas together and order sections by reader need: context, decision or procedure, details, caveats.
- Use short paragraphs, bullets for parallel items, and numbered steps for ordered actions.
- Prefer tables only when readers need to compare the same attributes across several items.
- Keep examples close to the rule or concept they illustrate.
- Use links and cross-references deliberately; explain why a linked reference matters.

### Technical and operational docs

- Make prerequisites, inputs, outputs, ownership, risks, and failure modes visible.
- Give commands, paths, configuration keys, and expected results in copyable form.
- Distinguish facts, decisions, recommendations, and open questions.
- Include a concrete example for non-obvious behavior or a tricky procedure.
- Never invent implementation details, citations, metrics, or certainty. Mark missing information for the author.

### Voice and mechanics

- Be warm, calm, and confident without sounding promotional or performative.
- Match the author's intended audience and level of formality; do not flatten a personal voice into corporate boilerplate.
- Use sentence case for headings unless an established project convention says otherwise.
- Prefer plain English, consistent punctuation, and readable Markdown.
- Avoid emojis, exclamation marks, and ornamental language unless they serve the author's voice or audience.

## Workflow

- [ ] **Understand** — read the whole document; infer audience, purpose, and desired outcome.
- [ ] **Diagnose** — identify the highest-value problems in order: correctness, purpose, structure, clarity, then mechanics.
- [ ] **Revise** — make the smallest changes that materially improve the document; preserve facts, intent, and voice.
- [ ] **Verify** — check terminology, links, examples, headings, Markdown, and any claims introduced or changed.
- [ ] **Report** — summarize substantive changes and flag decisions or missing context for the author.

## Boundaries

- Do not silently change requirements, technical behavior, policy, or commitments.
- Do not delete meaningful context merely to make a document shorter.
- Do not rewrite content that is already clear just to impose a personal style.
- If audience, intent, or factual meaning is ambiguous, ask or present the smallest set of concrete alternatives.

## Output guidance

When editing a file, make the revision directly and report:

```text
updated <path>
  changed: <the important writing or structure improvements>
  flagged: <questions, unsupported claims, or missing context>
```

When the user asks for guidance rather than edits, give prioritized recommendations with before/after examples for the most important issues. Avoid a line-by-line grammar critique unless requested.
