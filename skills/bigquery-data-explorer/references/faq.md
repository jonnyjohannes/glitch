# FAQ — Katie Gold's Knowledge Base

## Q: Which table should I use for session-level data?

**A:** `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits`

This is the primary session-grain table. One row per visit (session). Contains
session-level metrics: bounce rate, visit duration, orders, revenue. Combines
Scribe 1.0 + 2.0 into a unified view. Bot traffic is already filtered out.

For raw session data: go to Scribe tables, but you'll need to do your own
session stitching.

---

## Q: Which table should I use for page-level data?

**A:** `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks`

One row per pageview within a session. Contains page-level metrics: clicks,
add-to-carts, pagetype. Join to `tbl_dash_visits` via `deviceguid` + `visitid` +
`eventdate` for session context.

---

## Q: Which table for component/element data?

**A:** `wf-gcp-us-ae-sf-prod.curated_data_hub.tbl_fact_component`

One row per component instance per pageview. Tracks loaded, clicked, interacted.
Built from `ElementLoaded` events with LEFT JOINs to click and interaction
events. Use `componentname` to filter by component type.

---

## Q: How do I join Scribe (raw) to clickstream (curated)?

**A:** Join on `LOWER(deviceguid)`, `pageviewid`, and `eventdate`.

```sql
SELECT c.*, r.event_cstmvars
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_clicks` c
JOIN `wf-gcp-us-ae-scribe-prod.scribe.tbl_scribe_pageview` r
  ON LOWER(c.deviceguid) = LOWER(r.deviceguid)
  AND c.pageviewid = r.pageviewid
  AND c.eventdate = r.eventdate
WHERE c.eventdate = CURRENT_DATE()
```

**Critical:** Always `LOWER()` the deviceguids. Scribe 1.0 and curated tables
have inconsistent casing.

---

## Q: How do I tell if a page is replat or monolith?

**A:** Three methods:

1. **Scribe 1.0 raw data**: Check `event_cstmvars LIKE '%isNextPage=true%'` —
   true = replat
2. **Scribe 2.0 data**: If the event is in `scribe_storefront` tables, it's
   replat by definition
3. **Replat scope table**: `wf-gcp-us-ae-sf-prod.ttr.tbl_replat_scope` has the
   official scope per pagetype per date

Method 3 is most reliable for aggregate analysis. Method 1 is useful for
row-level classification.

---

## Q: Why are app pageviews higher than expected?

**A:** Several app-specific behaviors inflate pageview counts:

1. **Deeplinks**: External links into the app (email, push notifications, ads)
   fire pageviews without normal navigation flow
2. **Infinite scroll**: On browse/category pages, each content block load can
   fire a pageview
3. **Background resume**: App resuming from background state may re-fire
   pageview events
4. **Pre-rendering**: Some screens pre-render before the user navigates, firing
   early pageviews

To quantify: compare app pageviews per session vs web. App typically has
1.3-1.5x more pageviews per session due to these factors.

---

## Q: Why does browse show more pageviews than pagerequests?

**A:** On web, PageRequest is a server-side event (HTTP request received), while
PageView is a client-side event (page rendered). Browse pages can have more
PageViews than PageRequests because:

1. **Client-side filtering/sorting**: Applying a filter may fire a new PageView
   (client-side render) without a new PageRequest (no server round-trip)
2. **Pre-rendering**: Browser speculative pre-rendering fires PageView before
   user navigates
3. **SPA navigation**: Replatformed browse pages using client-side routing

On app: there are ZERO PageRequests (app doesn't make server page requests). Use
PageView exclusively.

---

## Q: How do I analyze A/B tests (Gambit)?

**A:** Three-step process:

1. **Get assignment data** from `foundation_gambit.tbl_dash_gambit_assignment` —
   shows which users got which variant
2. **Join to behavioral data** (clickstream, component data) to measure the
   metric of interest
3. **Compare variants** — calculate the metric for each variant and compute the
   lift

Key tables:

-   `tbl_dash_gambit_assignment`: Who was assigned to what
-   `tbl_dash_gambit_exposure`: Who actually saw the experiment
-   `tbl_gambit_experiment_metrics`: Pre-computed metrics (use this first, it's
    easier)

Always check for **Sample Ratio Mismatch (SRM)**: if variant group sizes deviate

> 1% from the configured split, the experiment may be compromised.

---

## Q: What are the differences between Scribe 1.0 and 2.0?

**A:** Key differences:

| Aspect             | Scribe 1.0                               | Scribe 2.0                           |
| ------------------ | ---------------------------------------- | ------------------------------------ |
| Pages              | Monolith pages                           | Replatformed pages                   |
| Field naming       | camelCase (`pagetype`, `clickid`)        | snake_case (`page_type`, `click_id`) |
| Custom vars        | `event_cstmvars` (pipe-delimited string) | Structured JSON columns              |
| Project            | `wf-gcp-us-ae-scribe-prod`               | `wf-gcp-us-ae-scribe-v2-prod`        |
| Dataset            | `scribe`                                 | `scribe_storefront`                  |
| PageRequest        | Available                                | Not available                        |
| Component tracking | Flat structure                           | Nested (drawers, modals)             |

**Important:** During the replatforming transition period, a page type may fire
events in BOTH Scribe 1.0 and 2.0. The curated clickstream tables
(`tbl_dash_visits`, `tbl_dash_clicks`) handle this deduplication for you.

---

## Q: How do I analyze component engagement?

**A:** Use `tbl_fact_component` in `curated_data_hub`:

```sql
SELECT
  componentname,
  COUNT(*) AS loaded,
  SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) AS clicked,
  ROUND(SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS click_rate_pct
FROM `wf-gcp-us-ae-sf-prod.curated_data_hub.tbl_fact_component`
WHERE eventdate = CURRENT_DATE()
  AND componentname = 'YourComponentName'
GROUP BY componentname
```

Key concepts:

-   **Loaded**: Component was rendered in the viewport (base event)
-   **Clicked**: User clicked on the component
-   **Interacted**: User had a non-click interaction (hover, expand, etc.)
-   **Engagement rate**: clicked / loaded (not clicked / total page population)

The table is built from `ElementLoaded` LEFT JOIN clicks/interactions. Every
loaded component has a row.

---

## Q: Why don't my numbers match the dashboard?

**A:** Most common reasons:

1. **Bot filtering**: Dashboards use `tbl_dash_visits` (bot-filtered). If you're
   querying raw Scribe tables, you're including bot traffic. Join to
   `tbl_dash_visits_exclusions` to filter.

2. **Date range**: Check if the dashboard uses UTC dates or local dates. BQ uses
   UTC.

3. **Platform filter**: Dashboard may filter to web-only. Your query might
   include app.

4. **Replat scope**: Dashboard may include/exclude replatformed traffic
   differently.

5. **Metric definition**: "Conversion rate" can mean different things:

    - Session conversion = orders / sessions
    - Visitor conversion = orders / unique visitors
    - Page conversion = ATC / pageviews

6. **ETL timing**: If querying today's data, curated tables may not be fully
   loaded yet (T+1).

7. **Deduplication**: Dashboards may deduplicate on specific keys that your
   query doesn't.

**Debugging approach**: Start with the exact same table and filters the
dashboard uses. Then add/remove one filter at a time until the numbers diverge.

---

## Q: How do I estimate query cost before running?

**A:** Use the `--dry_run` flag:

```bash
bq query --project_id=wf-gcp-us-ae-sf-prod --use_legacy_sql=false --dry_run \
  'YOUR SQL HERE'
```

This returns the estimated bytes scanned without executing. Convert to GB:
`bytes / 1,000,000,000`.

**Cost rules of thumb:**

-   BigQuery charges $5 per TB scanned (on-demand pricing)
-   Always include `WHERE eventdate` filter — without it, the query scans ALL
    partitions
-   `SELECT *` scans all columns — enumerate only needed columns to reduce cost
-   1 day of `tbl_dash_visits` ≈ 1-5 GB (varies by traffic)
-   1 day of `tbl_dash_clicks` ≈ 5-20 GB
-   1 day of raw Scribe tables ≈ 10-50 GB per event type

---

## Q: What are "downstream" KPIs?

**A:** In Storefront analytics, "downstream" means the conversion funnel steps
that follow a given interaction:

-   **Pageview** -> downstream: clicks, add-to-cart, orders, revenue
-   **Component loaded** -> downstream: component clicked, add-to-cart, orders,
    revenue
-   **Browse page** -> downstream: PDP views, add-to-cart, orders, revenue

**Important:** Downstream is NOT SKU-specific. It's the total downstream
behavior of users who interacted with something. For example, "downstream
revenue from users who saw the ProductGrid component" includes ALL their orders,
not just orders for products shown in that grid.

---

## Q: How do I find FeatureNames for a component?

**A:** FeatureNames identify component types in tracking. Finding the right one:

1. **Check curated data hub**:

```sql
SELECT DISTINCT componentname, COUNT(*) AS cnt
FROM `wf-gcp-us-ae-sf-prod.curated_data_hub.tbl_fact_component`
WHERE eventdate = CURRENT_DATE()
  AND componentname LIKE '%<partial_name>%'
GROUP BY componentname
ORDER BY cnt DESC
```

1. **Check raw Scribe 1.0** (for monolith pages):

```sql
SELECT DISTINCT REGEXP_EXTRACT(event_cstmvars, r'FeatureName=([^|]+)') AS feature_name, COUNT(*) AS cnt
FROM `wf-gcp-us-ae-scribe-prod.scribe.tbl_scribe_elementloaded`
WHERE eventdate = CURRENT_DATE()
  AND event_cstmvars LIKE '%FeatureName=%<partial_name>%'
GROUP BY feature_name
ORDER BY cnt DESC
```

1. **Check raw Scribe 2.0** (for replat pages):

```sql
SELECT DISTINCT feature_name, COUNT(*) AS cnt
FROM `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_storefront_elementloaded`
WHERE eventdate = CURRENT_DATE()
  AND feature_name LIKE '%<partial_name>%'
GROUP BY feature_name
ORDER BY cnt DESC
```

**Note:** FeatureNames often change between monolith and replat. Check both if
the page type has been replatformed.

---

## Q: Why is data missing after replatforming?

**A:** When a page is replatformed, tracking shifts from Scribe 1.0 to Scribe
2.0. Potential data gaps:

1. **Tracking not yet implemented in replat**: Some custom tracking events may
   not be ported to the new page yet
2. **FeatureName changed**: The component exists but has a new FeatureName —
   your query is filtering on the old name
3. **Schema change**: Scribe 2.0 uses different field names (snake_case). Your
   query may use the old camelCase names
4. **Transition period**: During rollout, some traffic goes to both 1.0 and 2.0,
   some only to 2.0. There may be a brief gap.

**Resolution**: Check both Scribe 1.0 and 2.0 tables for the same date. If data
exists in 2.0 but not 1.0, the replat migration is the cause.

---

## Q: Why is revenue lower than expected in my analysis?

**A:** Common causes:

1. **Attribution window**: Are you matching orders to the same day's sessions?
   Users may browse today and buy tomorrow.
2. **Cross-device**: User browses on mobile, buys on desktop. The deviceguid is
   different.
3. **Join key issue**: Not using `LOWER()` on deviceguids, causing missed joins.
4. **Order table lag**: `csn_basket` tables are T+1. Today's orders may not be
   there yet.
5. **Return/cancellation**: Revenue in order tables may include later-cancelled
   orders, or may not.
6. **Platform filter**: If you're looking at web-only sessions, you miss app
   conversions from the same users.
7. **Bot exclusion**: Some "sessions" that led to orders may be filtered as
   bots.

---

## Q: Firedrill — interaction rates suddenly look broken. What do I do?

**A:** Follow this sequence:

1. **Don't panic.** Most data "breakages" are tracking or ETL issues, not real
   behavior changes.

2. **Isolate the timing**: When exactly did it change? Use hourly granularity:

```sql
SELECT TIMESTAMP_TRUNC(event_timestamp, HOUR) AS hour, COUNT(*) AS events
FROM <raw_table>
WHERE eventdate = DATE '<suspect_date>'
GROUP BY hour ORDER BY hour
```

1. **Check raw vs curated**: If raw is normal but curated is off, it's an ETL
   issue. If raw is also broken, it's a tracking issue.

2. **Check replat scope**: Was a new page type replatformed on this date?

3. **Check Scribe deploy history**: Was there a tracking code deploy?

4. **Check bot filtering**: Did PerimeterX rules change? Check
   `tbl_dash_visits_exclusions` volume.

5. **Quantify impact**: How many sessions/pageviews/revenue are affected?

6. **Communicate**: If it's a real issue, flag it with the data team and
   affected stakeholders. Include: what's broken, when it started, impact, and
   whether it's tracking vs ETL vs real.
