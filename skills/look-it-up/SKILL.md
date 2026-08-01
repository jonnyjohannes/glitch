---
name: look-it-up
description: >-
  Performs Perplexity-style web research with inline citations, source-aware
  synthesis, and an explicit Sources list. Use when the user asks to search the
  web, research a topic, verify claims, compare options, or wants cited answers;
  scale breadth and depth to the specificity and complexity of the question.
tools: [Read, Bash, WebSearch, FetchContent, SourceCheck]
tags: [skill, research, web, citations]
---

# Look It Up

Produce a useful answer backed by a small set of strong, relevant sources. Do
not turn search snippets into facts: fetch important pages when exact wording,
context, or claim verification matters.

## Interface

**Inputs**: a research question, claim, comparison, or request for current web information
**Outputs**: a synthesized answer with inline citations and a deduplicated Sources list
**Side effects**: read-only web searches and page fetches; no external writes

## Research depth

Infer scope from the question rather than applying a fixed research template:

| Question shape | Default effort | Source target |
| --- | --- | --- |
| Simple fact, definition, or short lookup | one focused search; verify if disputed or current | 2–3 |
| Specific how/why, historical question, or claim check | 2–3 varied searches; fetch primary or authoritative pages | 3–4 |
| Comparison, recommendation, controversy, or multi-part question | separate searches per dimension; triangulate evidence | 4–5 |
| Broad topic or landscape | map the topic first, then cover major viewpoints and primary sources | 4–5 |
| High-stakes, rapidly changing, or technical claim | prioritize first-party sources; source-check each consequential claim | 4–5 |

More specificity means deeper verification, not a longer generic essay. Keep the
answer proportional to what the user asked.

## Workflow

- [ ] Parse the question into the exact claims, dimensions, date/currency needs, and desired output.
- [ ] Decide research depth using the table above.
- [ ] Search with 2–4 genuinely varied queries when the question is broad or multi-part; include the topic, an authority/primary-source angle, and a counterpoint or comparison angle as useful.
- [ ] Prefer primary and authoritative sources: official documentation, original research, government or institutional publications, standards, court filings, company disclosures, and direct interviews. Use reputable secondary reporting for context.
- [ ] Fetch the most important pages for exact passages. Use `source_check` for claims that need bounded verification and `fetch_content` for long pages, PDFs, or specific source extraction.
- [ ] Cross-check important facts across independent sources. Treat repeated syndicated copy as one source, not corroboration.
- [ ] Select 3–5 sources that materially support the answer. Fewer is acceptable for a genuinely simple lookup; more is acceptable only when complexity or stakes justify it.
- [ ] Separate sourced facts, synthesis/inference, uncertainty, and opinion. Do not present search-result summaries as direct quotations.
- [ ] Cite claims near the relevant sentence. Ensure every citation actually supports the wording and date/context of the claim.
- [ ] If evidence conflicts, say so, identify the disagreement, and explain which source is stronger and why.
- [ ] Report meaningful gaps, stale sources, paywalls, inaccessible pages, or unresolved uncertainty instead of fabricating confidence.

## Source policy

- Prefer source quality and relevance over prestige or search ranking.
- For current facts, check publication/update dates and favor current first-party material.
- For historical or scholarly questions, prefer primary texts and reputable academic or institutional sources; distinguish interpretation from consensus.
- For product, API, or policy questions, start with the official source and corroborate only where useful.
- Use social media sparingly. Reference it only when it is the primary venue for the relevant firsthand statement, eyewitness evidence, creator announcement, or public response that cannot be obtained elsewhere. Do not use social posts as general authority, and label them clearly.
- Do not pad the answer with sources that were not used.

## Output format

Use a direct answer first, then enough reasoning to make the result trustworthy:

```markdown
## answer

[direct synthesis with inline markdown links or numbered citations]

## what the sources show

- [key evidence, comparison, or caveat]
- [uncertainty or disagreement, if any]

## sources

1. [Title](URL) — why it matters / what it supports
2. [Title](URL) — why it matters / what it supports
3. [Title](URL) — why it matters / what it supports
```

For a simple question, omit `what the sources show` if it adds no value. Avoid
claim-dumping, long unannotated link lists, and citations attached only to a
whole paragraph containing multiple unsupported assertions.

## Quality checks

Before answering, confirm:

- the answer matches the user's actual scope and timeframe;
- the strongest claims have nearby citations;
- the source count is normally 3–5 and sources are not duplicates;
- primary sources are used where available;
- social media is absent unless genuinely necessary;
- uncertainty and conflicts are visible;
- no citation implies evidence stronger than the source provides.
