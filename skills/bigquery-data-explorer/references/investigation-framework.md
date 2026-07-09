# Investigation Framework — The Three I's

## Overview

When investigating data issues, anomalies, or discrepancies, follow the **Three
I's** framework:

1. **Isolate** — Narrow the scope to the smallest reproducible unit
2. **Identify** — Find the root cause
3. **Impact** — Quantify the effect

This framework prevents rabbit holes and ensures investigations converge to
actionable findings.

---

## Problem Statement Template

Before starting any investigation, formulate a clear problem statement:

```text
WHAT: [metric/number] is [higher/lower/missing/different] than expected
WHEN: [started/noticed on date, or time range]
WHERE: [platform, pagetype, experiment, component, region]
EXPECTED: [what the number should be, and source of truth]
ACTUAL: [what the number actually is]
DELTA: [difference, both absolute and percentage]
```

---

## Step 1: Isolate

Narrow the scope along these dimensions (check each):

### Isolation Dimensions

| Dimension         | How to Filter                                                   | Example                              |
| ----------------- | --------------------------------------------------------------- | ------------------------------------ |
| **Platform**      | `platform IN ('web', 'ios', 'android')`                         | Issue only on app?                   |
| **Page Type**     | `pagetype = 'browsepage'`                                       | Issue only on browse?                |
| **Replat Status** | `event_cstmvars LIKE '%isNextPage=true%'` or replat scope table | Issue only on replat pages?          |
| **Element Type**  | `componentname = 'ProductCard'`                                 | Issue only on specific component?    |
| **Time**          | `eventdate BETWEEN ...`                                         | When did it start?                   |
| **Device**        | `devicetype IN ('desktop', 'mobile', 'tablet')`                 | Device-specific?                     |
| **Brand**         | Site brand filter                                               | Wayfair vs Joss & Main vs AllModern? |

### Isolation Query Template

```sql
-- Daily trend split by isolation dimension
SELECT
  eventdate,
  <isolation_dimension>,
  COUNT(*) AS metric_value
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.<table>`
WHERE eventdate BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND CURRENT_DATE()
GROUP BY eventdate, <isolation_dimension>
ORDER BY eventdate, <isolation_dimension>
```

### Binary Search for Time

```sql
-- Hourly granularity to pinpoint when the change happened
SELECT
  TIMESTAMP_TRUNC(event_timestamp, HOUR) AS hour,
  COUNT(*) AS events
FROM `<raw_scribe_table>`
WHERE eventdate = DATE '<suspect_date>'
GROUP BY hour
ORDER BY hour
```

---

## Step 2: Identify

Once isolated, determine root cause. Common categories (80/20 rule):

### Root Cause Categories

| Category                  | Frequency | How to Check                                                         |
| ------------------------- | --------- | -------------------------------------------------------------------- |
| **Tracking change**       | ~40%      | Compare raw event schemas before/after. Check Scribe deploy history. |
| **ETL issue**             | ~25%      | Check pipeline health. Compare raw counts vs curated counts.         |
| **Replatforming rollout** | ~15%      | Check replat scope changes. New pages migrated?                      |
| **Real behavior shift**   | ~10%      | Verify with external signals (marketing, seasonal, site changes).    |
| **Data model change**     | ~5%       | Check if table schema changed. New columns? Renamed fields?          |
| **Bot traffic change**    | ~5%       | Check `tbl_dash_visits_exclusions` volumes. PerimeterX changes?      |

### Tracking vs ETL Diagnostic

```sql
-- Compare raw event count vs curated table count for same date
-- If raw is normal but curated is off -> ETL issue
-- If raw is off -> tracking issue

-- Raw count (Scribe 1.0)
SELECT COUNT(*) AS raw_events
FROM `wf-gcp-us-ae-scribe-prod.scribe.tbl_scribe_pageview`
WHERE eventdate = <eventdate>;

-- Raw count (Scribe 2.0)
SELECT COUNT(*) AS raw_events_v2
FROM `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_storefront_pageview`
WHERE eventdate = <eventdate>;

-- Curated count
SELECT COUNT(*) AS curated_events
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks`
WHERE eventdate = <eventdate>;
```

### Hypothesis Testing Template

```sql
-- Test a specific hypothesis by comparing two populations
SELECT
  CASE WHEN <hypothesis_condition> THEN 'hypothesis_true' ELSE 'hypothesis_false' END AS segment,
  COUNT(*) AS events,
  <additional_metrics>
FROM `<table>`
WHERE eventdate = <eventdate>
GROUP BY segment
```

---

## Step 3: Impact

Quantify the effect of the identified issue.

### Impact Dimensions

| Dimension               | Query Pattern                              |
| ----------------------- | ------------------------------------------ |
| **Sessions affected**   | `COUNT(DISTINCT deviceguid \| \| visitid)` |
| **Pageviews affected**  | `COUNT(DISTINCT pageviewid)`               |
| **Revenue impact**      | Join to orders, sum revenue delta          |
| **Percentage of total** | `affected / total * 100`                   |
| **Duration**            | Days the issue persisted                   |

### Impact Quantification Template

```sql
-- Calculate percentage of affected traffic
WITH total AS (
  SELECT COUNT(*) AS total_events
  FROM `<table>`
  WHERE eventdate BETWEEN <start> AND <end>
),
affected AS (
  SELECT COUNT(*) AS affected_events
  FROM `<table>`
  WHERE eventdate BETWEEN <start> AND <end>
    AND <issue_condition>
)
SELECT
  t.total_events,
  a.affected_events,
  ROUND(a.affected_events / t.total_events * 100, 2) AS pct_affected
FROM total t, affected a
```

### Revenue Impact Template

```sql
-- Estimate revenue impact
SELECT
  SUM(CASE WHEN <issue_condition> THEN revenue ELSE 0 END) AS affected_revenue,
  SUM(revenue) AS total_revenue,
  ROUND(SUM(CASE WHEN <issue_condition> THEN revenue ELSE 0 END) / SUM(revenue) * 100, 2) AS pct_revenue_impact
FROM `wf-gcp-us-ae-sql-data-prod.csn_basket.tbl_orders`
WHERE orderdate BETWEEN <start> AND <end>
```

---

## Investigation Playbooks

### Playbook: Pageviews Dropped

1. **Isolate by platform**: Is the drop on web, app, or both?
2. **Isolate by pagetype**: Which page types dropped?
3. **Check replat scope**: Did a new page type get replatformed? (tracking may
   shift from Scribe 1.0 to 2.0)
4. **Check raw counts**: Are raw Scribe events also down, or just curated?
5. **Check bot filtering**: Did `tbl_dash_visits_exclusions` volume spike? (more
   traffic classified as bots)
6. **Check ETL**: Is the curated table fully loaded for the date?
7. **Impact**: Quantify by sessions, pageviews, and downstream metrics

### Playbook: CTR Changed

1. **Decompose**: CTR = clicks / impressions (or pageviews). Which changed —
   numerator or denominator?
2. **Isolate by component**: Which component's CTR changed?
3. **Check component tracking**: Did `ElementLoaded` counts change? (denominator
   shift)
4. **Check click tracking**: Did click event structure change?
5. **Check experiment**: Was there an A/B test affecting this component?
6. **Impact**: Quantify by engagement and downstream conversion

### Playbook: Experiment Results Don't Match

1. **Check assignment vs exposure**: Are assignment and exposure counts
   consistent?
2. **Check date alignment**: Is the experiment date range correct?
3. **Check metric definition**: Does your metric match Gambit's pre-computed
   metric?
4. **Check sample ratio mismatch (SRM)**: Are variants equally sized as
   configured?
5. **Check cross-contamination**: Are users assigned to multiple variants?
6. **Impact**: Re-run with corrected parameters

### Playbook: Data Missing

1. **Check partition**: Is the eventdate partition populated?
2. **Check ETL status**: Is the pipeline running? Check pipeline health
   dashboards.
3. **Check raw tables**: Is data present in raw Scribe tables?
4. **Check time zone**: BQ dates are in UTC. Today's data may be incomplete
   until midnight UTC.
5. **Check access**: Do you have read permissions on the dataset?
6. **Impact**: Determine data gap duration and affected downstream reports
