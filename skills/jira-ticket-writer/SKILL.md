---
name: jira-ticket-writer
description: Drafts concise Jira bug, story, or task descriptions from issue context and relevant code; use when creating or updating Jira tickets.
tools: [Bash, Read]
tags: [skill, jira, tickets]
---

# Jira Ticket Writer

## Interface

**Inputs**: issue context and optional Jira key, project, or desired issue type
**Outputs**: concise user-approved Jira bug, story, or task description
**Side effects**: reads Jira and code context; creates or edits a Jira issue only after explicit approval

## Phase 1: Understand the Problem

1. **Fetch the ticket if a key was given** — run `jira issue view <KEY> --raw` before asking
   anything. Use what's already there to avoid redundant questions.
1. **Ask only what is still unclear** — if issue type is unknown, present it as an explicit choice:
   `Bug / Story / Task`. For a bug: what is the wrong behavior, what is the expected behavior, and
   roughly where it happens (service, feature area). For a story/task: what need does this address,
   and what does done look like. Ask all open questions in a single message. Skip anything already
   answered by the ticket or conversation.

## Phase 2: Skim the Relevant Code

1. **Read just enough to confirm** — identify the relevant files, classes, functions, or components
   involved (depending on the language or system) and verify the problem area matches what the user
   described. Do not do a deep analysis. Only reference files you actually read.

## Phase 3: Draft the Ticket

A ticket describes the problem — not the solution. Use this template:

```markdown
**What's the problem**

[2–4 sentences. What is broken, where it happens, and what the impact is.]

**Context**

- [File / class / function / component where the issue lives]
- [Any relevant config, flag, or dependency — only if necessary to understand the problem]

**Acceptance Criteria**

- [ ] [One specific, checkable outcome]
- [ ] [Another if needed — keep to 3–5 max]
- [ ] Tests updated or added
```

1. **Keep it short** — skip sections that add no value. Omit Context bullets if you have nothing
   real to say. If AC needs more than 5 bullets, the ticket is too big — suggest splitting.

## Phase 4: Get Permission

1. **Show the draft and ask** — present the draft and confirm before writing:

> "Does this look right? Should I create/update the ticket now?"

Do NOT run `jira issue edit` or `jira issue create` until the user explicitly confirms.

## Phase 5: Write to Jira

**Updating an existing ticket:**

```bash
printf '%s' "$APPROVED_DESCRIPTION" | jira issue edit <KEY> --no-input
```

Only add `--summary` if the user explicitly asks. Do not change assignee, priority,
labels, sprint, or status unless asked.

**Creating a new ticket:**

```bash
printf '%s' "$APPROVED_DESCRIPTION" | jira issue create \
  --project <PROJECT> --type <Bug|Story|Task> --summary "$SUMMARY" \
  --template - --no-input
```

Match the requested issue type; default to `Task` only when the user has no preference.
After writing, show the created/updated key and its URL from the CLI output. If Jira access
fails, pause for re-authentication rather than falling back to another integration.

## Rules

- Describe the problem and reference relevant code locations — do NOT suggest the implementation
- No nice-to-haves in the ticket body — capture them as follow-up tickets
- Only reference files you actually read — never fabricate code references
- If code access is unavailable, rely on user-provided context only
- Keep Acceptance Criteria specific, observable, and limited to 3–5 items
- Do not run `jira issue create` or `jira issue edit` without explicit user confirmation
