---
name: rosetta-stoner
description: >-
  Transliterate and translate classical, historical, and sacred texts into
  English-readable romanized form with line-by-line meanings. Supports any
  source language. Use when the user provides a name, passage, or reference
  to an ancient or classical text and wants a transliteration with translation,
  or asks to transliterate, romanize, or explain a text in another language.
tags: [skill, authoring, translation]
---

# Rosetta Stoner

Given a name, passage, or reference to an ancient or classical text, produce an English-readable romanized transliteration with line-by-line meanings. Optimized for readers whose first language is English.

## Workflow

1. **Identify the text and source language.** If the user gives a name or reference rather than raw text, locate the canonical version. If multiple recensions exist, default to the most widely known. State which version and source language you are using.
2. **Transliterate.** Render the original into a romanized form appropriate for the source language (see language-specific guidance below). Prioritize readability for English-first speakers over strict academic precision.
3. **Translate.** Provide a clear, accessible English meaning for each line or phrase. Favor plain English over academic jargon, but keep key terms untranslated (with a parenthetical gloss on first use) when they carry cultural weight that translation would lose.
4. **Format** using the output template below.

## Language-Specific Guidance

Add new language sections here as needed. For any language not listed, choose the most widely accepted romanization system and name it.

### Chinese

- Provide the original characters, then pinyin with tone marks on the line below.
- Structure: characters line, pinyin line, English meaning line.
- For classical Chinese, gloss grammatical particles that have no direct English equivalent.

### Latin

- Preserve original Latin orthography (no transliteration needed since Latin uses the Roman alphabet).
- Provide macrons on vowels where they affect meaning or meter (ā, ē, ī, ō, ū).
- Note meter or rhetorical structure when relevant to meaning.

### Sanskrit / Pali

- Use simplified IAST romanization. Include diacritics only for characters that distinguish meaning (ś, ṣ, ṇ, ā, ī, ū).
- Capitalize first word of each phrase and proper nouns.
- Keep seed syllables (Om, Hum, Hrih, etc.) untranslated; note symbolic significance.

### Other Languages

- If the text passed through multiple languages historically (e.g., Sanskrit → Chinese → Japanese), note the transmission path and transliterate from the most relevant layer.

## Output Format

```markdown
# [Title of the Text]

_[Romanized / original-script line or phrase]_
[English meaning of that line.]

_[Next line]_
[English meaning.]

...
```

For Chinese texts, use this extended format:

```markdown
# [Title of the Text]

[Original characters]
_[Pinyin with tone marks]_
[English meaning.]

...
```

### Formatting rules

- Each transliterated line is _italicized_ on its own line.
- The English meaning follows immediately below, unitalicized.
- Separate each pair/group with a blank line.
- Group lines into logical stanzas or sections when the text has natural divisions. Use `## Section Name` headers for major divisions (e.g., invocation, main body, closing).
- For mantras, incantations, or refrains, keep ritual syllables untranslated and note their function.

## Handling Ambiguity

- If a word has multiple valid translations, pick the one most fitting in context and note the alternative in parentheses.
- If a passage is famously untranslatable or has esoteric meaning, say so plainly rather than forcing a literal rendering.
- When a term is borrowed across traditions (e.g., Sanskrit "dhyāna" → Chinese "chán" → Japanese "zen"), note the lineage on first occurrence.

## Scope

This skill covers any classical, historical, philosophical, or sacred text in any language — including but not limited to religious scriptures, philosophical treatises, poetry, classical literature, and historical documents.

See `examples.md` for a complete worked example.
