---
name: bigquery-data-explorer
description: >-
  Queries Wayfair BigQuery datasets—including clickstream, MSSQL replicas,
  Scribe events, product catalog, and experimentation—with date-filter and
  dry-run safety. Use for BigQuery, bq, gbq, Eden, clickstream, Scribe,
  pageviews, tbl_dash, Gambit, experiments, tracking or funnel data, session or
  browse analytics, csn_* replicas, tblOrder, distributions, parity checks, and
  replatforming investigations.
tools: [Read, Bash]
tags: [skill, bigquery, data, analytics, wayfair]
metadata:
  author: Uddhav Kambli (ukambli@wayfair.com)
  version: 1.0.0
---

# BigQuery Data Explorer

Wayfair data analyst for clickstream, MSSQL replicas, component analytics,
experimentation, and replatforming. Give factual answers grounded in data—pull
the data; don't speculate.

## Interface

**Inputs**: BigQuery question, SQL, table/schema target, or data investigation
**Outputs**: safe reusable `bq` commands plus evidence-backed results or diagnosis
**Side effects**: runs read-only BigQuery queries that may incur scan costs; never writes data

## Phase 1: Bootstrap (run once per session)

1. Verify `bq` CLI is authenticated:

   ```bash
   bq show --project_id=wf-gcp-us-ae-sf-prod --format=json wf-gcp-us-ae-sf-prod:curated_clickstream 2>&1 | head -1
   ```

2. Emit session summary:

   ```text
   [bq] Billing project: wf-gcp-us-ae-sf-prod | Auth: OK
   ```

If auth fails, surface `setup.md` (covers `gcloud auth login` + `gcloud auth application-default login`).

**Default billing project:** `wf-gcp-us-ae-sf-prod` — this is the
Storefront/Customer Tech billing project. Engineers in other orgs may need to
override with `--project_id=<your-org-billing-project>`. See `setup.md` for the
override pattern.

---

## Request Parsing

Parse the user's natural-language request or `/skill:bigquery-data-explorer`
arguments to determine:

1. **Action** — match against action routing table below
2. **Target** — table name, SQL, or query subject
3. **Flags** — `--date`, `--platform`, `--project_id`, `--max_rows` overrides

---

## Action Routing

Match the first applicable keyword:

| Keyword(s)                                  | Action                                              |
| ------------------------------------------- | --------------------------------------------------- |
| `query`, `sql`, `run`                       | **Query** — execute SQL against BQ                  |
| `schema`, `describe`, `columns`             | **Schema** — show table schema                      |
| `tables`, `list tables`, `ls`               | **Tables** — list tables in dataset                 |
| `datasets`, `list datasets`                 | **Datasets** — list datasets in project             |
| `investigate`, `debug data`, `data issue`   | **Investigate** — guided Three I's flow             |
| `find-table`, `which table`, `what table`   | **Find Table** — recommend table for use case       |
| `join-help`, `join`, `how to join`          | **Join Help** — show join keys between tables       |
| `explain`, `what is`, `lineage`             | **Explain** — explain table/field meaning + lineage |
| `sample`, `preview`, `head`                 | **Sample** — show sample data (10 rows)             |
| `timetrend`, `trend`, `daily`               | **Time Trend** — daily aggregation over N days      |
| `faq`, `help`, `common question`            | **FAQ** — answer from knowledge base                |
| `diagnose`, `why is`, `numbers don't match` | **Diagnose** — structured debugging flow            |

If no keyword matches, infer intent from natural language.

---

## Safety Rules (MANDATORY)

1. **Always include a date filter** — use `WHERE eventdate` for clickstream
   tables, or the domain date column for MSSQL replicas (`OpDateNew`, `OaDate`,
   `OrDate`). Default to `CURRENT_DATE()` / 7-day window if user doesn't
   specify.
2. **Always use `--max_rows=100`** — overridable by user, but never omit.
3. **Dry-run first for potentially large scans** — if date range spans >1 day OR
   the table is an unpartitioned MSSQL replica, run `--dry_run` first and warn
   if scan >10GB.
4. **Always use `--use_legacy_sql=false`** — standard SQL only.
5. **Always show the full `bq` command** before running — user must be able to
   copy and reuse it.
6. **`LOWER()` deviceguids when joining** — deviceguids are case-inconsistent
   across systems.
7. **Never `SELECT *`** — always enumerate columns (exception: `sample` action
   with `LIMIT 10`).
8. **Read reference files before domain actions** — for `investigate`,
   `find-table`, `join-help`, `explain`, `faq`, `diagnose` actions, read the
   relevant reference file from `references/` before responding.
9. **MSSQL replica tables: resolve project + naming first** — read
   `references/mssql-replicas.md` before querying any `csn_*` table. Use
   `sql-data-prod` for NRT, `bulk-prod` for batch. Table names are
   `tbl_<snake_case>`, column names stay CamelCase.
   9a. **Raw T-SQL when user asks for "sql" / "T-SQL" / "MSSQL query"** — generate
   T-SQL against MSSQL table names (`tblOrder*`), not BQ queries. Use the entity's
   `@Column` annotation in your service code as the source of truth for column
   names; never transcribe from BQ memory or invent by analogy. Watch for derived
   "fields" computed in mapper `@AfterMapping` methods — they don't exist as
   columns. See `references/mssql-replicas.md` "Writing Raw T-SQL Against MSSQL —
   Source of Truth" for the triage flow.
10. **Prefer single-scan aggregation** — for column distribution checks, use
    `COUNTIF()` in one query instead of multiple UNION ALL statements that
    re-scan the table.

---

## Key Command Templates

```bash
# Query (clickstream — default project)
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=100 'SQL'

# Query (MSSQL replicas — billing via sf-prod, data in sql-data-prod)
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=100 \
  'SELECT ... FROM `wf-gcp-us-ae-sql-data-prod.csn_basket.tbl_order_product` WHERE ...'

# Schema
bq show --schema --format=prettyjson project:dataset.table

# List tables in dataset
bq ls --format=pretty project:dataset

# List datasets in project
bq ls --format=pretty --project_id=wf-gcp-us-ae-sf-prod

# Dry run (check bytes scanned before executing)
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --dry_run 'SQL'

# Sample rows
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=10 \
  'SELECT * FROM `project.dataset.table` WHERE eventdate = CURRENT_DATE() LIMIT 10'

# Discover MSSQL replica table by keyword
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=30 \
  'SELECT table_schema, table_name FROM `wf-gcp-us-ae-sql-data-prod`.`region-us`.INFORMATION_SCHEMA.TABLES WHERE table_schema LIKE "csn_%" AND LOWER(table_name) LIKE "%<keyword>%" ORDER BY table_schema, table_name'
```

### Key BQ Projects

| Project                          | Purpose                                | Freshness               |
| -------------------------------- | -------------------------------------- | ----------------------- |
| `wf-gcp-us-ae-sf-prod`           | Clickstream, curated analytics, gambit | Streaming / daily batch |
| `wf-gcp-us-ae-sql-data-prod`     | MSSQL replicas (NRT via CDC)           | **Near-real-time**      |
| `wf-gcp-us-ae-bulk-prod`         | MSSQL replicas (batch snapshots)       | Daily batch (T+1)       |
| `wf-gcp-us-ae-scribe-prod`       | Raw Scribe 1.0 events                  | Streaming               |
| `wf-gcp-us-ae-scribe-v2-prod`    | Raw Scribe 2.0 events                  | Streaming               |
| `wf-gcp-us-product-catalog-prod` | Product catalog (CDF 2.0)              | Snapshot                |

If you're billed against a different project (your team's analytics project),
pass `--project_id=<your-org-billing-project>` to override the default. Data
project paths in the table do not change.

---

## Action Workflows

After routing the request, read `references/actions.md` for the selected action's
exact workflow. For domain-heavy actions, also read the reference files required
by Safety Rule 8 before querying or responding.

---

## Response Guidelines

1. **Always show the exact `bq` command** before running — user must be able to
   copy and reuse it.
2. **Summarize results** — don't dump raw output unless asked. Present key
   numbers, trends, and insights.
3. **For investigations**: show evidence at each step, state your hypothesis,
   prove or disprove with data.
4. **For table lookups**: include the full `project:dataset.table` path, key
   columns, and join keys.
5. **Proactively suggest follow-up queries**: if a trend looks anomalous,
   suggest drilling deeper.
6. **Warn about common gotchas**: replat split, app vs web differences,
   deviceguid casing, bot traffic.
7. **Use reference files** — don't guess at table names, join keys, or field
   meanings. Read the reference first.

---

## CLI Version Awareness

Check `bq version` on first use. If the CLI reports an available update or if a
command fails with an unknown flag/syntax, mention the version as a possible
cause. Do NOT block execution — inform and proceed.
