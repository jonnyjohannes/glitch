# Tracking Nuances — Storefront & Customer Tech

## Scribe 1.0 vs 2.0 Mapping

### Event Name Mapping

| Scribe 1.0 Event    | Scribe 2.0 Event    | Notes                                      |
| ------------------- | ------------------- | ------------------------------------------ |
| `PageRequest`       | (no equivalent)     | 2.0 doesn't have PageRequest; use PageView |
| `PageView`          | `PageView`          | Same concept, different field names        |
| `Click`             | `Click`             | Same concept, different field names        |
| `ElementLoaded`     | `ElementLoaded`     | Same concept, different field names        |
| `AddToCart`         | `AddToCart`         | Same concept                               |
| `CustomInteraction` | `CustomInteraction` | Same concept, different payload structure  |
| `Impression`        | `Impression`        | Same concept                               |

### Field Name Mapping

| Scribe 1.0 Field    | Scribe 2.0 Field         | Notes                                                              |
| ------------------- | ------------------------ | ------------------------------------------------------------------ |
| `deviceguid`        | `deviceguid`             | Same, but case may differ — always `LOWER()`                       |
| `pageviewid`        | `pageviewid`             | Same                                                               |
| `pagetype`          | `page_type`              | camelCase -> snake_case                                            |
| `clickid`           | `click_id`               | camelCase -> snake_case                                            |
| `elementinstanceid` | `element_instance_id`    | camelCase -> snake_case                                            |
| `interactionname`   | `interaction_name`       | camelCase -> snake_case                                            |
| `event_cstmvars`    | (structured JSON fields) | Key change: 1.0 uses pipe-delimited string, 2.0 uses typed columns |
| `FeatureName`       | `feature_name`           | camelCase -> snake_case                                            |

### Custom Variables (Critical Difference)

**Scribe 1.0:** Custom variables stored in `event_cstmvars` as pipe-delimited
key=value pairs:

```text
|isNextPage=true|FeatureName=ProductCard|position=3|
```

To extract: `REGEXP_EXTRACT(event_cstmvars, r'FeatureName=([^|]+)')`

**Scribe 2.0:** Custom variables stored as structured JSON columns. No need to
parse strings.

---

## Web vs App Tracking Differences

### Key Differences

| Aspect                 | Web                       | App (iOS/Android)                                                            |
| ---------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| **PageRequest**        | Fires on every page load  | Does NOT exist on app                                                        |
| **PageView**           | Fires after page renders  | Fires on screen view                                                         |
| **Session definition** | 30-min inactivity timeout | App lifecycle-based                                                          |
| **Deeplinks**          | N/A                       | Deeplinks create pageviews without full page load context                    |
| **Infinite scroll**    | N/A                       | Browse pages use infinite scroll — each scroll may fire additional pageviews |
| **Login state**        | Cookie-based              | Soft login (cached credentials)                                              |
| **Caching**            | Browser cache             | App-level caching can suppress tracking events                               |
| **Device GUID**        | Cookie-based, can rotate  | Device-persistent (more stable)                                              |
| **Bot filtering**      | PerimeterX                | Less bot traffic on app                                                      |

### Why App Pageviews Can Be Higher Than Expected

1. **Deeplinks**: External links into the app create pageviews that don't follow
   normal navigation flow
2. **Infinite scroll**: Each content block load on browse pages can fire a new
   pageview
3. **Background/foreground**: App resuming from background may fire new pageview
   events
4. **Pre-rendering**: Some app screens pre-render content, firing pageview
   before user sees it

### Why App Has No PageRequests

The `PageRequest` event is a server-side event fired when the web server
receives an HTTP request for a page. The app doesn't make page requests to the
web server — it renders screens natively. Therefore:

-   **Web**: PageRequests ≈ PageViews (1:1 for most pages)
-   **App**: PageRequests = 0 (use PageView events instead)

---

## Replatforming Impact

### How to Detect Replat vs Monolith

1. **Scribe 1.0 `event_cstmvars`**: `isNextPage=true` indicates replatformed
   page
2. **Scribe 2.0**: ALL traffic in Scribe 2.0 tables is replatformed by
   definition
3. **Replat scope table**: `wf-gcp-us-ae-sf-prod.ttr.tbl_replat_scope` has
   official scope

### What Changes When a Page Is Replatformed

| Aspect                  | Monolith (Before)                 | Replatformed (After)                             |
| ----------------------- | --------------------------------- | ------------------------------------------------ |
| **Tracking system**     | Scribe 1.0 only                   | Scribe 2.0 (may also have 1.0 during transition) |
| **Event structure**     | `event_cstmvars` (pipe-delimited) | Structured JSON fields                           |
| **FeatureNames**        | Legacy names                      | New names (may break dashboards)                 |
| **Component hierarchy** | Flat                              | Nested (drawer components, etc.)                 |
| **PageRequest**         | Standard                          | May be different timing due to SSR/CSR           |

### FeatureNames Migration

When pages are replatformed, `FeatureName` values often change:

-   Monolith: `FeatureName=sbprod_grid` (legacy naming)
-   Replat: `feature_name=ProductGrid` (new naming)

This can cause apparent drops in component metrics if dashboards filter on the
old name. **Always check both old and new FeatureNames when investigating
component metric changes around replat dates.**

### Replat Scope Changes

Pages are replatformed incrementally. The `tbl_replat_scope` table tracks which
page types are live on replat on each date. When a new page type is
replatformed:

1. Traffic shifts from Scribe 1.0 to Scribe 2.0
2. Field names change (camelCase -> snake_case)
3. FeatureNames may change
4. Some tracking events may be temporarily missing during the transition

---

## Browse-Specific Nuances

### Pagination

-   **Web**: Each page of results is a separate pageview. Page 2+ has different
    URL params.
-   **App**: Infinite scroll — no distinct "pages." Each scroll fires new content
    load events but typically stays in the same pageview.

### Filtering and Sorting

-   Filter/sort interactions fire `CustomInteraction` events, not new pageviews
-   The underlying search request fires a new `SolrRequest` (legacy) or
    `VulcanSearchRequest` (new)
-   To track filter usage: look at `CustomInteraction` events with
    `interactionname` containing filter-related values

### Browse Pageviews vs PageRequests (Web)

Browse pages may show more pageviews than pagerequests because:

1. **Client-side routing**: Some browse interactions (filter, sort) may fire a
   new PageView without a PageRequest
2. **Infinite scroll on web**: If implemented, additional content loads fire
   PageView but not PageRequest
3. **Pre-fetching**: Browser may pre-render next page

---

## PDP (Product Detail Page) Nuances

### Option Selection

-   Selecting product options (color, size) on PDP fires `CustomInteraction`
    events
-   Does NOT fire new PageView — stays on same pageview
-   To track option selection: look for `interaction_name` containing
    option-related values

### Drawer Nesting (Replat)

On replatformed PDPs, some content is in drawers/modals:

-   Opening a drawer fires `ElementLoaded` for the drawer component
-   Content inside the drawer has its own component tracking
-   This creates nested component hierarchies that didn't exist on monolith

---

## Component Tracking (ElementLoaded)

### Base Table Structure

`ElementLoaded` is the base event for all component tracking:

-   **Fires when**: A component renders and becomes visible in the viewport
-   **Key field**: `elementinstanceid` — unique per component instance per
    pageview
-   **Aggregation**: `tbl_fact_component` uses `ElementLoaded` as the base and
    LEFT JOINs to click/interaction events

### LEFT JOIN Structure (Important!)

`tbl_fact_component` is built as:

```sql
ElementLoaded (base)
  LEFT JOIN Click (on elementinstanceid)
  LEFT JOIN CustomInteraction (on elementinstanceid)
```

This means:

-   Every loaded component has a row (even if never clicked)
-   `clicked` and `interacted` columns are 0/1 flags
-   Engagement rate = clicked / loaded (not clicked / total population)

### elementinstanceid

-   Unique per component instance per pageview
-   If a component renders twice on the same page, each gets a different
    `elementinstanceid`
-   Used as the join key between loaded, clicked, and interacted events

### Cost warning: `tbl_element_loaded` is unclustered

`wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_element_loaded` is
partitioned on `eventDate` only — **no clustering**. Filtering by `storeID`,
`elementType`, `pageType`, etc. does **not** reduce scan cost; every query pays
the full partition (~1.5 TB / day).

-   `--dry_run` reports the partition-scan cost regardless of your WHERE clause —
    do not interpret it as "my filter is efficient."
-   For cheap block parity / provisioning checks, prefer `tbl_blockbuilder_block`
    (daily snapshot, ~339k rows, clustered on elementid/blockid).
-   Only go to `tbl_element_loaded` when you actually need per-pageview event
    grain.
-   When you must scan it, budget explicitly: 1 day ≈ $7.50 at $5/TB. For sanity
    checks use `TABLESAMPLE SYSTEM (1 PERCENT)` — bounds scan to ~15 GB at the
    cost of missing rare events.
-   Glean reports `tbl_element_loaded` is marked for deprecation in the summer
    cycle; `tbl_element_in_view` is being kept. Reconfirm before building new
    pipelines.

### Deprecated BlockBuilder event tables — do not use

| Table                                                                         | Last write | Status     |
| ----------------------------------------------------------------------------- | ---------- | ---------- |
| `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_blockbuilder_block_loaded` | 2024-11-22 | Deprecated |
| `wf-gcp-us-ae-sf-prod.etl_scribe_2.tbl_blockbuilder_block_loaded`             | 2024-11-19 | Deprecated |

Before querying any table you haven't used recently, check `__TABLES__` for
`last_modified_time` and `row_count` — this catches deprecation without running
expensive scans:

```sql
SELECT table_id, row_count, TIMESTAMP_MILLIS(last_modified_time) AS last_mod
FROM `<project>.<dataset>.__TABLES__`
WHERE table_id LIKE "%keyword%"
ORDER BY last_modified_time DESC;
```

### `elementID` encoding — extract blockId

On both `tbl_element_loaded` and the BlockBuilder metadata table, `elementID` is
a colon-separated string of the form `TypeName::<blockId>` (e.g.,
`BlockBuilderCheckoutDonations::248250`). Extract the numeric block ID with:

```sql
SAFE_CAST(REGEXP_EXTRACT(elementID, r"::(\d+)") AS INT64) AS blockId
```

---

## Common Gotchas Checklist

Use this checklist when debugging data issues:

-   [ ] **LOWER() deviceguids**: Case mismatch between Scribe 1.0 and 2.0. Always
        `LOWER()` both sides.
-   [ ] **Browse pagination**: Web pagination = separate pageviews. App infinite
        scroll = same pageview.
-   [ ] **Deeplinks**: App deeplinks create pageviews with incomplete navigation
        context.
-   [ ] **FeatureNames changed**: Check both old (monolith) and new (replat)
        FeatureName values.
-   [ ] **No PageRequest on app**: Use PageView for app analysis, not PageRequest.
-   [ ] **Bot filtering**: `tbl_dash_visits_exclusions` filters bots. Raw tables
        include bots.
-   [ ] **UTC dates**: BQ `eventdate` is UTC. Current day data is incomplete until
        midnight UTC.
-   [ ] **Replat transition**: During replat rollout, some events may be in both
        Scribe 1.0 and 2.0.
-   [ ] **event_cstmvars parsing**: Scribe 1.0 only. Use REGEXP_EXTRACT, not SPLIT
        (pipes in values).
-   [ ] **Curated vs raw counts**: Curated tables filter bots and apply business
        logic. Raw counts will be higher.
-   [ ] **ETL lag**: Curated tables are T+1. Today's data is only in raw tables.
-   [ ] **Downstream KPIs**: "Downstream" means ATC, orders, revenue — NOT
        SKU-specific metrics.
-   [ ] **Cross-project joins**: Use fully-qualified table names
        (`project.dataset.table`).
-   [ ] **Partition required**: Every query MUST have `WHERE eventdate` or the
        query will fail/scan entire table.
