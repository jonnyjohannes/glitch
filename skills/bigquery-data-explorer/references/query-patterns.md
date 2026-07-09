# Reusable SQL Query Patterns

All queries use standard SQL (`--use_legacy_sql=false`) and include mandatory
`eventdate` partition filters.

## Date Range Helpers

```sql
-- Today
WHERE eventdate = CURRENT_DATE()

-- Yesterday
WHERE eventdate = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)

-- Last 7 days
WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()

-- Last 30 days
WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()

-- Specific date
WHERE eventdate = DATE '2025-01-15'

-- Specific range
WHERE eventdate BETWEEN DATE '2025-01-01' AND DATE '2025-01-31'

-- Week-over-week comparison
WHERE eventdate IN (CURRENT_DATE(), DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
```

---

## Session Metrics from `tbl_dash_visits`

### Total Sessions by Platform

```sql
SELECT
  eventdate,
  platform,
  COUNT(*) AS sessions,
  SUM(bounces) AS bounced_sessions,
  ROUND(SUM(bounces) / COUNT(*) * 100, 2) AS bounce_rate_pct,
  ROUND(AVG(visit_duration_seconds), 1) AS avg_duration_sec
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`
WHERE eventdate = <eventdate>
GROUP BY eventdate, platform
ORDER BY sessions DESC
```

### Sessions with Conversions

```sql
SELECT
  eventdate,
  platform,
  COUNT(*) AS sessions,
  SUM(CASE WHEN orders > 0 THEN 1 ELSE 0 END) AS converting_sessions,
  ROUND(SUM(CASE WHEN orders > 0 THEN 1 ELSE 0 END) / COUNT(*) * 100, 4) AS conversion_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`
WHERE eventdate = <eventdate>
GROUP BY eventdate, platform
```

---

## Page-Level Funnel from `tbl_dash_clicks`

### Pageviews by Pagetype

```sql
SELECT
  eventdate,
  pagetype,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT LOWER(deviceguid)) AS unique_visitors
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks`
WHERE eventdate = <eventdate>
GROUP BY eventdate, pagetype
ORDER BY pageviews DESC
```

### Funnel: Pageview -> Click -> ATC

```sql
SELECT
  pagetype,
  COUNT(*) AS pageviews,
  SUM(clicks) AS total_clicks,
  SUM(addtocarts) AS total_atc,
  ROUND(SUM(clicks) / COUNT(*) * 100, 2) AS click_rate_pct,
  ROUND(SUM(addtocarts) / COUNT(*) * 100, 4) AS atc_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks`
WHERE eventdate = <eventdate>
  AND pagetype IN (<pagetypes>)
GROUP BY pagetype
ORDER BY pageviews DESC
```

### PDP Funnel (Product Detail Page)

```sql
SELECT
  eventdate,
  COUNT(*) AS pdp_pageviews,
  SUM(clicks) AS pdp_clicks,
  SUM(addtocarts) AS pdp_atc,
  ROUND(SUM(addtocarts) / COUNT(*) * 100, 4) AS pdp_atc_rate_pct,
  COUNT(DISTINCT LOWER(deviceguid)) AS unique_visitors
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks`
WHERE eventdate = <eventdate>
  AND pagetype = 'productpage'
GROUP BY eventdate
```

---

## Component Engagement from `tbl_fact_component`

### Component Load & Engagement Rates

```sql
SELECT
  componentname,
  COUNT(*) AS loaded,
  SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) AS clicked,
  SUM(CASE WHEN interacted = 1 THEN 1 ELSE 0 END) AS interacted,
  ROUND(SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS click_rate_pct,
  ROUND(SUM(CASE WHEN interacted = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS interaction_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_data_hub.tbl_fact_component`
WHERE eventdate = <eventdate>
  AND componentname = '<componentname>'
GROUP BY componentname
```

### Component Engagement by Page Type

```sql
SELECT
  c.componentname,
  p.pagetype,
  COUNT(*) AS loaded,
  SUM(CASE WHEN c.clicked = 1 THEN 1 ELSE 0 END) AS clicked,
  ROUND(SUM(CASE WHEN c.clicked = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS click_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_data_hub.tbl_fact_component` c
JOIN `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` p
  ON LOWER(c.deviceguid) = LOWER(p.deviceguid)
  AND c.pageviewid = p.pageviewid
  AND c.eventdate = p.eventdate
WHERE c.eventdate = <eventdate>
  AND c.componentname = '<componentname>'
GROUP BY c.componentname, p.pagetype
ORDER BY loaded DESC
```

---

## A/B Test Analysis from Gambit Tables

### Experiment Assignment Counts

```sql
SELECT
  experimentid,
  variantid,
  COUNT(DISTINCT LOWER(deviceguid)) AS assigned_users
FROM `wf-gcp-us-ae-sf-prod.foundation_gambit.tbl_dash_gambit_assignment`
WHERE eventdate = <eventdate>
  AND experimentid = '<experimentid>'
GROUP BY experimentid, variantid
ORDER BY variantid
```

### Experiment Metrics Comparison

```sql
SELECT
  a.variantid,
  COUNT(DISTINCT LOWER(a.deviceguid)) AS users,
  SUM(v.sessions) AS sessions,
  SUM(c.addtocarts) AS atc,
  SUM(v.orders) AS orders,
  ROUND(SUM(v.orders) / COUNT(DISTINCT LOWER(a.deviceguid)) * 100, 4) AS conversion_rate_pct
FROM `wf-gcp-us-ae-sf-prod.foundation_gambit.tbl_dash_gambit_assignment` a
JOIN `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits` v
  ON LOWER(a.deviceguid) = LOWER(v.deviceguid)
  AND a.eventdate = v.eventdate
LEFT JOIN `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` c
  ON LOWER(v.deviceguid) = LOWER(c.deviceguid)
  AND v.visitid = c.visitid
  AND v.eventdate = c.eventdate
WHERE a.eventdate BETWEEN <start_date> AND <end_date>
  AND a.experimentid = '<experimentid>'
GROUP BY a.variantid
ORDER BY a.variantid
```

---

## Keyword Search Analysis

### Top Keywords by Volume

```sql
SELECT
  keyword,
  COUNT(*) AS searches,
  COUNT(DISTINCT LOWER(deviceguid)) AS unique_searchers
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_keyword_search`
WHERE eventdate = <eventdate>
GROUP BY keyword
ORDER BY searches DESC
LIMIT 50
```

### Keyword Search -> Click-Through

```sql
SELECT
  k.keyword,
  COUNT(DISTINCT k.pageviewid) AS searches,
  COUNT(DISTINCT c.pageviewid) AS result_pageviews,
  ROUND(COUNT(DISTINCT c.pageviewid) / COUNT(DISTINCT k.pageviewid) * 100, 2) AS ctr_pct
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_keyword_search` k
LEFT JOIN `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` c
  ON LOWER(k.deviceguid) = LOWER(c.deviceguid)
  AND k.eventdate = c.eventdate
  AND c.pagetype = 'browsepage'
WHERE k.eventdate = <eventdate>
  AND k.keyword = '<keyword>'
GROUP BY k.keyword
```

---

## Replat vs Monolith Detection

### Using event_cstmvars (Scribe 1.0 raw)

```sql
-- isNextPage=true indicates replatformed page
SELECT
  CASE
    WHEN event_cstmvars LIKE '%isNextPage=true%' THEN 'replat'
    ELSE 'monolith'
  END AS page_stack,
  COUNT(*) AS pageviews
FROM `wf-gcp-us-ae-scribe-prod.scribe.tbl_scribe_pageview`
WHERE eventdate = <eventdate>
GROUP BY page_stack
```

### Using Scribe 2.0 (all replat by definition)

```sql
-- All Scribe 2.0 traffic IS replatformed
SELECT
  'replat' AS page_stack,
  COUNT(*) AS pageviews
FROM `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_storefront_pageview`
WHERE eventdate = <eventdate>
```

### Using Replat Scope Table

```sql
SELECT
  pagetype,
  is_replat,
  COUNT(*) AS pageviews
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` c
JOIN `wf-gcp-us-ae-sf-prod.ttr.tbl_replat_scope` r
  ON c.pagetype = r.pagetype
  AND c.eventdate = r.eventdate
WHERE c.eventdate = <eventdate>
GROUP BY pagetype, is_replat
ORDER BY pageviews DESC
```

---

## Platform Split

### Web vs App

```sql
SELECT
  platform,
  COUNT(*) AS sessions,
  SUM(orders) AS orders,
  ROUND(SUM(orders) / COUNT(*) * 100, 4) AS conversion_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`
WHERE eventdate = <eventdate>
GROUP BY platform
ORDER BY sessions DESC
```

### Desktop vs Mobile (web only)

```sql
SELECT
  devicetype,
  COUNT(*) AS sessions,
  SUM(orders) AS orders,
  ROUND(SUM(orders) / COUNT(*) * 100, 4) AS conversion_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`
WHERE eventdate = <eventdate>
  AND platform = 'web'
GROUP BY devicetype
ORDER BY sessions DESC
```

---

## Order Attribution

### Clickstream -> Orders

```sql
SELECT
  c.pagetype,
  COUNT(DISTINCT c.pageviewid) AS pageviews,
  COUNT(DISTINCT o.orderid) AS orders,
  SUM(o.revenue) AS revenue
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` c
JOIN `wf-gcp-us-ae-sql-data-prod.csn_basket.tbl_orders` o
  ON LOWER(c.deviceguid) = LOWER(o.deviceguid)
WHERE c.eventdate = <eventdate>
  AND o.orderdate = <eventdate>
GROUP BY c.pagetype
ORDER BY revenue DESC
```

---

## Dry Run Pattern

Always dry-run before multi-day queries:

```bash
# Step 1: Dry run
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --dry_run \
  'SELECT eventdate, COUNT(*) FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits` WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() GROUP BY eventdate'

# Output shows: "Query successfully validated. Estimated 12345678 bytes processed."
# Convert: bytes / 1e9 = GB

# Step 2: If < 10GB, execute
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --max_rows=100 \
  'SELECT eventdate, COUNT(*) FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits` WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() GROUP BY eventdate'
```

**Reading dry-run output:**

-   `"upper bound of 0 bytes"` — clustering is doing its job; your filter matches
    known-empty cluster ranges. Safe to run.
-   Fixed-size estimate (e.g., 1.5 TB) on a partition-only table — filters on
    non-partition columns do NOT reduce cost. Decide: tighten the date range,
    sample, or find a curated table.
-   0 bytes on a partition filter alone — partition may be empty. Check a wider
    date range or `__TABLES__` for last-modified time before assuming the table is
    healthy.

---

## Staleness check before scanning

Before running an expensive scan on an unfamiliar table, verify it still
receives writes. A deprecated/frozen table is the most common cause of empty
result sets.

```sql
SELECT table_id, row_count, TIMESTAMP_MILLIS(last_modified_time) AS last_mod
FROM `<project>.<dataset>.__TABLES__`
WHERE table_id LIKE "%<keyword>%"
ORDER BY last_modified_time DESC;
```

If `last_mod` is months old and `row_count` is frozen, the table is deprecated —
find the successor via `/glean` or ask data-eng before scanning. Known
deprecated in the wild: both `tbl_blockbuilder_block_loaded` variants (stopped
~2024-11).

---

## Check clustering before scanning unfamiliar tables

Partition + cluster = filters on cluster columns cheaply prune blocks. Partition
only = filters don't help; you pay the full partition every time.

```bash
bq show --format=prettyjson <project>:<dataset>.<table> | grep -A 5 -E '"clustering|timePartitioning'
```

If there's no `clustering` block, treat the table as partition-only and size
queries accordingly. Example: `tbl_element_loaded` is partition-only (~1.5 TB /
day); `tbl_blockbuilder_block_loaded` (sf-prod variant) is partition + clustered
on storeID (cheap per-brand queries — but that table is deprecated; see
tables.md).

---

## BlockBuilder per-brand parity

**Rule: parity / state questions go to the federated Postgres replica, not
Scribe.** The Scribe `tbl_blockbuilder_block` lacks `supported_applications` and
`applicationgroup` — inferring brand from `adminName` produces systematically
wrong answers (e.g., a block serving US+CA+UK+IE through a single row with
`supported_applications=[4887,6565,6568,6574]` will look US-only to adminName
regex).

### Authoritative parity query

```sql
SELECT * FROM EXTERNAL_QUERY(
  "wf-gcp-us-block-builder-prod.us.federated-queries-connection",
  """SELECT id, typename, title, applicationgroup,
            array_to_string(supported_applications,'|') AS supported_apps
     FROM content_block
     WHERE typename LIKE 'BlockBuilder<Surface>%' AND is_archived = false
     ORDER BY typename, applicationgroup"""
);
```

Then resolve app IDs → brand names via `content_block_internal` (see `tables.md`
§ BlockBuilder for the current ID map). A typename "covers" a brand if ANY
active block of that typename lists the brand's application ID in its
`supported_applications`.

### Federated query gotchas

-   **BQ string literal nesting:** Postgres SQL uses single quotes; BQ wraps it in
    double quotes. Use triple-double-quote `"""..."""` around the Postgres SQL, or
    pass the whole statement via `--flagfile=`. Escaping `''` inside a BQ `'...'`
    string often fails the parser.
-   **ARRAY columns:** BQ `EXTERNAL_QUERY` **cannot emit Postgres `ARRAY`**
    columns in `csv` output and returns repeated fields in JSON.
    `array_to_string(col,'|')` flattens to a scalar — the cleanest fix.
-   **Dry-run reports "upper bound of 0 bytes"** for federated queries regardless
    of actual cost — the planner doesn't see into the remote DB. Query is cheap
    anyway (small tables).

### When to use the Scribe-derived table instead

`tbl_blockbuilder_block` is still useful when you need to **join block metadata
to event data** — the `elementid` → blockId regex pattern works on both Scribe
event tables and the metadata snapshot. Do NOT use it for state/parity.

### Runtime event ground truth (rare)

If you need "which blocks actually rendered for users of brand X," that requires
`tbl_element_loaded` — a ~1.5 TB/day scan (see the cost warning in
`tracking-nuances.md`). Budget explicitly with the user before running. Usually
the federated DB answer is sufficient; events only add value when suspecting a
serve-time divergence from configured state.
