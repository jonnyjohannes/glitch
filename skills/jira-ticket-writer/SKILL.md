# Jira Ticket Writer

## Phase 1: Understand the Problem

1. **Fetch the ticket if a key was given** — call `jira_get_issue` with `fields: *all` before asking
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

Do NOT call `jira_update_issue` or `jira_create_issue` until the user explicitly confirms.

## Phase 5: Write to Jira

**Updating an existing ticket:**

```text
Tool: jira_update_issue
  issue_key: <ticket key>
  fields: { "description": "<approved description>" }
```

Only update `summary` if the user explicitly asks. Do not change assignee, priority, labels,
sprint, or status unless asked.

**Creating a new ticket:**

```text
Tool: jira_create_issue
  project_key: <from existing ticket or ask the user>
  issue_type: Bug | Story | Task   (match what user said, default to Task)
  summary: <user-supplied or derived from conversation>
  description: <approved description>
```

1. **Share the Jira ticket URL** after writing.

## Rules

- Describe the problem and reference relevant code locations — do NOT suggest the implementation
- No nice-to-haves in the ticket body — capture them as follow-up tickets
- Only reference files you actually read — never fabricate code references
- If code access is unavailable, rely on user-provided context only
- Keep Acceptance Criteria specific, observable, and limited to 3–5 items
- Do not call `jira_create_issue` or `jira_update_issue` without explicit user confirmation
