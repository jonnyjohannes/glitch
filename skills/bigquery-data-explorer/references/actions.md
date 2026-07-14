# BigQuery Action Workflows

## Query

Execute SQL against BigQuery. Enforce all safety rules.

1. Parse user's SQL or natural language query
2. Ensure `WHERE eventdate` filter is present (inject `CURRENT_DATE()` if
   missing)
3. If date range >1 day, dry-run first:

   ```bash
   bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --dry_run 'SQL'
   ```

4. Show bytes to be scanned. Warn if >10GB. Proceed if user confirms or <10GB.
5. Execute:

   ```bash
   bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=100 'SQL'
   ```

## Schema

Show table schema. Resolve short table names by reading `references/tables.md`
and `references/mssql-replicas.md`.

```bash
bq show --schema --format=prettyjson wf-gcp-us-ae-sf-prod:curated_clickstream.tbl_dash_visits
```

If user provides a short name (e.g., `tbl_dash_visits`), look up the full
`project:dataset.table` path from the table catalog.

If user provides an MSSQL table name (e.g., `tblOrderProduct`), convert to BQ
naming (`tbl_order_product`) and resolve the project/dataset per
`references/mssql-replicas.md`.

## Tables

List tables in a dataset.

```bash
bq ls --format=pretty wf-gcp-us-ae-sf-prod:curated_clickstream
```

If user provides just a dataset name, prefix with the default project.

## Datasets

List datasets in a project.

```bash
bq ls --format=pretty --project_id=wf-gcp-us-ae-sf-prod
```

## Investigate

Guided investigation using the Three I's framework (Isolate, Identify, Impact).
**Read `references/investigation-framework.md` first.**

1. Ask the user to describe the problem (or parse from arguments)
2. Help them formulate a problem statement
3. Walk through the Three I's:
   - **Isolate**: Narrow scope — platform, pagetype, replat status, time window,
     element type
   - **Identify**: Find root cause — tracking change? ETL issue? Data model
     change? Real behavior shift?
   - **Impact**: Quantify — how many sessions/pageviews/revenue affected?
4. At each step, suggest and run diagnostic queries
5. Summarize findings with evidence

## Find Table

Recommend the right table for a use case. **Read `references/tables.md` and
`references/mssql-replicas.md` first.**

If the user mentions an MSSQL table (e.g., `tblOrderProduct`,
`OrderAdjustment`):

1. Convert CamelCase to snake*case with a `tbl*` prefix
2. Identify the likely database/dataset from context
3. Try NRT project first: `wf-gcp-us-ae-sql-data-prod.csn_<db>.tbl_<name>`
4. Fall back to bulk: `wf-gcp-us-ae-bulk-prod.csn_<db>.tbl_<name>`
5. If neither resolves, use `INFORMATION_SCHEMA` discovery query

For clickstream/analytics tables, present the table selection guide from the
reference.

## Join Help

Show how to join tables. **Read `references/tables.md` (Join Keys section)
first.**

Show the exact join condition, including `LOWER()` for deviceguids and any
gotchas specific to the join.

## Explain

Explain a table, field, or concept. **Read relevant reference files first.**

Cover:

- What the table/field represents
- Where the data comes from (lineage)
- How it's populated (ETL cadence, source system)
- Common gotchas

## Sample

Preview sample data from a table.

```bash
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=10 \
  'SELECT * FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits` WHERE eventdate = CURRENT_DATE() LIMIT 10'
```

This is the ONE exception where `SELECT *` is allowed.

## Time Trend

Show daily aggregation over N days (default 7).

```bash
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=100 \
  'SELECT eventdate, COUNT(*) as cnt
   FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`
   WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
   GROUP BY eventdate
   ORDER BY eventdate'
```

Dry-run first since this always spans multiple days.

## FAQ

Answer from knowledge base. **Read `references/faq.md` first.**

Match the user's question to an FAQ entry and provide the answer, including any
relevant query templates.

## Diagnose

Structured debugging for data discrepancies. **Read
`references/investigation-framework.md` and `references/tracking-nuances.md`
first.**

Walk through:

1. What numbers don't match? (Define expected vs actual)
2. What's the source of truth? (Dashboard, manual query, another team's report)
3. Check common causes: partition filter, platform filter, bot exclusions,
   replat scope, metric definition
4. Run diagnostic queries to isolate the discrepancy
5. Provide root cause and resolution

---
