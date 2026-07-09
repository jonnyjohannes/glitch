# BigQuery Table Catalog — Storefront & Customer Tech

## Table Selection Guide

| Use Case                                         | Recommended Table                        | Dataset                                   |
| ------------------------------------------------ | ---------------------------------------- | ----------------------------------------- |
| Session-level metrics (visits, bounce, duration) | `tbl_dash_visits`                        | `curated_clickstream`                     |
| Page-level metrics (pageviews, clicks, ATC)      | `tbl_dash_clicks`                        | `curated_clickstream`                     |
| Component engagement (element loaded, clicked)   | `tbl_fact_component`                     | `curated_data_hub`                        |
| Raw tracking events (Scribe 1.0)                 | `tbl_scribe_*`                           | `scribe` (scribe-prod)                    |
| Raw tracking events (Scribe 2.0)                 | `tbl_storefront_*`                       | `scribe_storefront` (scribe-v2-prod)      |
| Search & Recs tracking                           | `tbl_*`                                  | `scribe_search_and_recs` (scribe-v2-prod) |
| A/B test assignments                             | `tbl_dash_gambit_assignment`             | `foundation_gambit`                       |
| A/B test metrics                                 | `tbl_gambit_*`                           | `curated_gambit`                          |
| Order / basket data                              | `tbl_*`                                  | `csn_basket` (sql-data-prod)              |
| Product catalog (CDF 2.0)                        | `tbl_*`                                  | `cdf_fdl` (product-catalog-prod)          |
| Curated scribe foundation                        | `tbl_*`                                  | `curated_scribe_foundation`               |
| Recipe analytics                                 | `tbl_*`                                  | `csn_recipe_analytics`                    |
| Replatforming scope                              | `tbl_*`                                  | `ttr`                                     |
| Keyword search                                   | `tbl_dash_keyword_search`                | `curated_clickstream`                     |
| Browse / category page                           | `tbl_dash_clicks` (filtered by pagetype) | `curated_clickstream`                     |

---

## Detailed Table Catalog

### Raw Scribe 1.0

**Project:** `wf-gcp-us-ae-scribe-prod`
**Dataset:** `scribe`

| Table                          | Description                         | Partition   | Key Columns                                                  |
| ------------------------------ | ----------------------------------- | ----------- | ------------------------------------------------------------ |
| `tbl_scribe_pagerequest`       | Raw page request events (web only)  | `eventdate` | `deviceguid`, `pageviewid`, `pagetype`, `eventdate`          |
| `tbl_scribe_pageview`          | Raw pageview events                 | `eventdate` | `deviceguid`, `pageviewid`, `pagetype`, `eventdate`          |
| `tbl_scribe_click`             | Raw click events                    | `eventdate` | `deviceguid`, `pageviewid`, `clickid`, `eventdate`           |
| `tbl_scribe_elementloaded`     | Raw element/component loaded events | `eventdate` | `deviceguid`, `pageviewid`, `elementinstanceid`, `eventdate` |
| `tbl_scribe_addtocart`         | Raw add-to-cart events              | `eventdate` | `deviceguid`, `pageviewid`, `eventdate`                      |
| `tbl_scribe_custominteraction` | Raw custom interaction events       | `eventdate` | `deviceguid`, `pageviewid`, `interactionname`, `eventdate`   |
| `tbl_scribe_impression`        | Raw impression events               | `eventdate` | `deviceguid`, `pageviewid`, `eventdate`                      |

**Notes:**

-   Scribe 1.0 = legacy tracking, still active on monolith pages
-   `event_cstmvars` contains semi-structured key=value pairs (pipe-delimited)
-   `pagerequest` only fires on web (not app)

### Raw Scribe 2.0

**Project:** `wf-gcp-us-ae-scribe-v2-prod`
**Dataset:** `scribe_storefront`

| Table                              | Description                      | Partition   | Key Columns                                                    |
| ---------------------------------- | -------------------------------- | ----------- | -------------------------------------------------------------- |
| `tbl_storefront_pageview`          | Scribe 2.0 pageview events       | `eventdate` | `deviceguid`, `pageviewid`, `page_type`, `eventdate`           |
| `tbl_storefront_click`             | Scribe 2.0 click events          | `eventdate` | `deviceguid`, `pageviewid`, `click_id`, `eventdate`            |
| `tbl_storefront_elementloaded`     | Scribe 2.0 element loaded events | `eventdate` | `deviceguid`, `pageviewid`, `element_instance_id`, `eventdate` |
| `tbl_storefront_addtocart`         | Scribe 2.0 add-to-cart events    | `eventdate` | `deviceguid`, `pageviewid`, `eventdate`                        |
| `tbl_storefront_custominteraction` | Scribe 2.0 custom interactions   | `eventdate` | `deviceguid`, `pageviewid`, `interaction_name`, `eventdate`    |
| `tbl_storefront_impression`        | Scribe 2.0 impression events     | `eventdate` | `deviceguid`, `pageviewid`, `eventdate`                        |

**Notes:**

-   Scribe 2.0 = new tracking on replatformed pages
-   Uses snake_case field names (vs camelCase in 1.0)
-   Structured JSON payloads instead of pipe-delimited `event_cstmvars`
-   `page_type` (not `pagetype`)

### Search & Recs / Vulcan

**Project:** `wf-gcp-us-ae-scribe-v2-prod`
**Dataset:** `scribe_search_and_recs`

| Table                        | Description                     | Partition   | Key Columns                        |
| ---------------------------- | ------------------------------- | ----------- | ---------------------------------- |
| `tbl_vulcan_search_request`  | Search/browse backend requests  | `eventdate` | `request_id`, `query`, `eventdate` |
| `tbl_vulcan_search_response` | Search/browse backend responses | `eventdate` | `request_id`, `eventdate`          |

**Notes:**

-   Vulcan replaced Solr for search backend
-   Links to clickstream via `request_id` in click event custom vars

### Clickstream (Curated)

**Project:** `wf-gcp-us-ae-sf-prod`
**Dataset:** `curated_clickstream`

| Table                        | Description                               | Partition   | Key Columns                                                                                         |
| ---------------------------- | ----------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `tbl_dash_visits`            | Session-level metrics — one row per visit | `eventdate` | `deviceguid`, `visitid`, `platform`, `eventdate`, `sessions`, `bounces`, `visit_duration_seconds`   |
| `tbl_dash_clicks`            | Page-level metrics — one row per pageview | `eventdate` | `deviceguid`, `pageviewid`, `visitid`, `pagetype`, `eventdate`, `pageviews`, `clicks`, `addtocarts` |
| `tbl_dash_visits_exclusions` | Bot/invalid traffic exclusions            | `eventdate` | `deviceguid`, `visitid`, `eventdate`, `exclusion_reason`                                            |
| `tbl_dash_keyword_search`    | Keyword search activity                   | `eventdate` | `deviceguid`, `pageviewid`, `keyword`, `eventdate`                                                  |

**Notes:**

-   **This is the primary curated layer** — use these tables for most analysis
-   `tbl_dash_visits` is session grain; `tbl_dash_clicks` is pageview grain
-   Both combine Scribe 1.0 + 2.0 data into a unified schema
-   `platform` column: `web`, `ios`, `android`
-   Includes replat and monolith traffic
-   `tbl_dash_visits_exclusions` contains bot traffic filtered by PerimeterX

### Component / Data Hub (Curated)

**Project:** `wf-gcp-us-ae-sf-prod`
**Dataset:** `curated_data_hub`

| Table                       | Description                                              | Partition   | Key Columns                                                                   |
| --------------------------- | -------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `tbl_fact_component`        | Component-level engagement (loaded, clicked, interacted) | `eventdate` | `deviceguid`, `pageviewid`, `elementinstanceid`, `componentname`, `eventdate` |
| `tbl_fact_component_detail` | Detailed component attributes                            | `eventdate` | `elementinstanceid`, `eventdate`                                              |

**Notes:**

-   Built from `ElementLoaded` base events + LEFT JOINs to click/interaction
    events
-   `elementinstanceid` is the unique component instance per pageview
-   Use `componentname` for filtering by component type
-   Engagement = clicks or interactions on a loaded component

### BlockBuilder (Storefront CMS)

BlockBuilder is Wayfair's internal content CMS (admin at
`admin.wayfair.com/d/block-builder/`). Blocks are defined in the admin UI,
delivered via federated GraphQL (`BlockBuilderBlock` interface with `blockId: Int!`), and rendered by sf-ui-web  
clients. Every block has a stable numeric
`blockId` and a typename like `BlockBuilderCheckoutDonations`.

**For provisioning state / parity questions — use the federated Postgres
replica, not Scribe:**

```text
Connection: wf-gcp-us-block-builder-prod.us.federated-queries-connection
Underlying: CloudSQL Postgres replica of the BlockBuilder prod DB (read-only)
```

Query via BQ `EXTERNAL_QUERY(...)`. This is the authoritative live DB Block
Builder itself uses. Scribe/ETL mirrors are lossy projections — they drop
`supported_applications`, `applicationgroup`, targeting rules, and version
history.

Key tables in the Postgres replica (`public` schema):

| Table                                      | Purpose                                                                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_block`                            | Active block rows — `id`, `typename`, `title`, `supported_applications int[]`, `applicationgroup int`, `is_archived`, `instances jsonb`, `template`, `taxonomy_path`                                        |
| `content_block_internal`                   | **Resolver for application / application-group IDs** — rows with typename `BlockBuilderAdminApplication` / `BlockBuilderAdminApplicationGroup` map integer IDs to human names like "wayfair.ca Application" |
| `content_block_versions`                   | Versioned content — `data jsonb`, `start_time`, `is_archived`, `supported_applications` per version                                                                                                         |
| `content_block_metadata`                   | Creation/update metadata — `block_id`, `template_id`, `created_at`, etc.                                                                                                                                    |
| `experience_targeting_rules`               | Targeting — `default_block_id`, `variant_block_id`, `rules_array jsonb`, `priority`. Narrows who sees what; orthogonal to `supported_applications` site eligibility.                                        |
| `block_relationship`                       | Parent/child block hierarchy with `parent_locale` and `context`                                                                                                                                             |
| `block_group` / `block_group_relationship` | Block groupings                                                                                                                                                                                             |
| `content_block_subscription`               | Block-to-block event subscriptions                                                                                                                                                                          |

**BB Application model is web-site-only.** iOS/Android are **not** modeled as
BlockBuilder applications — the same block instance is served to both Web and
App runtimes. If you're asked about "app parity," it inherits from web-site
parity unless there's a separate non-BB config.

**Known Application IDs (from content_block_internal, typename =
BlockBuilderAdminApplication):**

| ID   | Application     | Group ID           |
| ---- | --------------- | ------------------ |
| 4887 | wayfair.com     | 4888 (Wayfair)     |
| 6565 | wayfair.ca      | 4888               |
| 6568 | wayfair.uk      | 4888               |
| 6571 | wayfair.de      | 4888               |
| 6574 | wayfair.ie      | 4888               |
| 6577 | allmodern.com   | 6578 (AllModern)   |
| 6581 | birchlane.com   | 6582 (BirchLane)   |
| 6585 | jossandmain.com | 6586 (JossAndMain) |
| 6589 | perigold.com    | 6590 (Perigold)    |

Always re-resolve via `content_block_internal` at query time — IDs above are a
snapshot (2026-04).

**Parity query template:**

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

`array_to_string()` is required — BQ `EXTERNAL_QUERY` cannot return Postgres
ARRAY columns directly in CSV output.

**Scribe-derived table (still useful for some cases, NOT for state / parity):**

| Table                                                      | Description                                                                                | Partition    | Cluster                | Key Columns                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------ | ---------------------- | ---------------------------------------------------------------------------- |
| `wf-gcp-us-ae-sf-prod.etl_scribe_2.tbl_blockbuilder_block` | Scribe-derived block snapshot (blockid, typename, adminName, tags, start/end dates, state) | `start_date` | `elementid`, `blockid` | `blockid`, `elementid`, `state`, `adminName`, `tagGrouping`, `customDetails` |

-   Does NOT include `supported_applications` or `applicationgroup` — do not use
    for parity/state questions.
-   Useful for: analytics joins (mapping blockId back to a human adminName
    alongside event data).
-   `elementid` format: `TypeName::blockId` (e.g.,
    `BlockBuilderCheckoutDonations::248250`).

**For block runtime events (expensive; use only when metadata isn't enough):**

| Table                                                                         | Status         | Notes                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_element_loaded`            | **Live**       | Partitioned on `eventDate` only, **no clustering** → ~1.5 TB / day scan. `elementType` = typename; extract blockId via `REGEXP_EXTRACT(elementID, r"::(\d+)")`. Glean notes this table is **scheduled for summer-cycle deprecation**. |
| `wf-gcp-us-ae-scribe-v2-prod.scribe_storefront.tbl_blockbuilder_block_loaded` | **Deprecated** | Stopped receiving writes ~2024-11-22. Do not use.                                                                                                                                                                                     |
| `wf-gcp-us-ae-sf-prod.etl_scribe_2.tbl_blockbuilder_block_loaded`             | **Deprecated** | Curated variant of the above; also stopped ~2024-11-19. Do not use.                                                                                                                                                                   |

**Standard join (block event → metadata):**

```sql
LEFT JOIN `wf-gcp-us-ae-sf-prod.etl_scribe_2.tbl_blockbuilder_block` bb
  ON SAFE_CAST(REGEXP_EXTRACT(el.elementID, r"::(\d+)") AS INT64) = bb.blockid
 AND el.versionID = bb.versionid
```

**Brand attribution heuristic (adminName regex):**

-   `WF CA` / `WFCA` → storeID 446
-   `WF UK` / `[UK]` → 321 ; `WF IE` / `Ireland` → 471 ; `WF DE` → 368
-   `AM` / `[ALLMODERN]` → 81 ; `PG` / `[PERIGOLD]` → 457
-   `JM` / `[JOSS&MAIN]` → 450 ; `BL` / `[BIRCHLN]` / `[BIRCHLANE]` → 422
-   Bare `WF` or no brand marker → treat as WF US default (49)

**Caveat:** adminName is a weak signal for production parity — many blocks serve
multiple brands through server-side targeting rules invisible to BQ. For hard
guarantees, verify via `tbl_element_loaded` events or the BlockBuilder admin
API.

### Curated Scribe Foundation

**Project:** `wf-gcp-us-ae-sf-prod`
**Dataset:** `curated_scribe_foundation`

| Table                | Description                 | Partition   | Key Columns                                         |
| -------------------- | --------------------------- | ----------- | --------------------------------------------------- |
| `tbl_fact_pageview`  | Unified pageview fact table | `eventdate` | `deviceguid`, `pageviewid`, `pagetype`, `eventdate` |
| `tbl_fact_click`     | Unified click fact table    | `eventdate` | `deviceguid`, `pageviewid`, `clickid`, `eventdate`  |
| `tbl_fact_addtocart` | Unified ATC fact table      | `eventdate` | `deviceguid`, `pageviewid`, `eventdate`             |

**Notes:**

-   Foundation layer merges Scribe 1.0 + 2.0 into unified schema
-   Used as building blocks for curated_clickstream and curated_data_hub

### Gambit / Experimentation

**Project:** `wf-gcp-us-ae-sf-prod`

**Dataset: `foundation_gambit`**

| Table                        | Description                                          | Partition   | Key Columns                                            |
| ---------------------------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `tbl_dash_gambit_assignment` | Experiment assignment — which user got which variant | `eventdate` | `deviceguid`, `experimentid`, `variantid`, `eventdate` |
| `tbl_dash_gambit_exposure`   | Experiment exposure — when user was actually exposed | `eventdate` | `deviceguid`, `experimentid`, `variantid`, `eventdate` |

**Dataset: `curated_gambit`**

| Table                           | Description                         | Partition   | Key Columns                                            |
| ------------------------------- | ----------------------------------- | ----------- | ------------------------------------------------------ |
| `tbl_gambit_experiment_metrics` | Pre-computed experiment metrics     | `eventdate` | `experimentid`, `variantid`, `metricname`, `eventdate` |
| `tbl_gambit_experiment_summary` | Experiment-level summary statistics | `eventdate` | `experimentid`, `eventdate`                            |

**Notes:**

-   `assignment` = user was bucketed; `exposure` = user saw the experiment
-   Always join on `experimentid` AND `variantid`
-   Gambit is Wayfair's in-house experimentation platform
-   Metrics table has pre-computed stats (conversion rate, revenue, etc.)

### SQL Replicas / Orders & Basket

**See `references/mssql-replicas.md` for complete MSSQL replica documentation.**

**Near-real-time (CDC):** `wf-gcp-us-ae-sql-data-prod`
**Batch/delayed:** `wf-gcp-us-ae-bulk-prod`

**Dataset:** `csn_basket`

| Table                      | MSSQL Origin            | Partition | Key Columns                                     |
| -------------------------- | ----------------------- | --------- | ----------------------------------------------- |
| `tbl_order`                | `tblOrder`              | **None**  | `OrID`, `OrCuID`, `OrDate`                      |
| `tbl_order_product`        | `tblOrderProduct`       | **None**  | `OpOrID`, `OpID`, `OpSKU`, `OpDateNew`          |
| `tbl_order_adjustment`     | `tblOrderAdjustment`    | **None**  | `OaOrID`, `OaOpID`, `OaDescription`, `OaAmount` |
| `tbl_order_product_option` | `tblOrderProductOption` | **None**  | `OpoOpID`, `OpoName`, `OpoValue`                |
| `tbl_favorite_item`        | `tblFavoriteItem`       | **None**  | Wishlist/favorites                              |

**Notes:**

-   `sql-data-prod` is **near-real-time** (CDC streaming), NOT T+1
-   `bulk-prod` is daily batch (T+1)
-   **Tables are NOT partitioned** — always dry-run first; use domain date columns
    (`OpDateNew`, `OaDate`, `OrDate`) for filtering
-   **Column names stay CamelCase** (e.g., `OpHasProPricing`, `OaUsID`) — not
    lowercased
-   **Table names are snake_case** (e.g., `tblOrderProduct` ->
    `tbl_order_product`)
-   Join to clickstream via `LOWER(deviceguid)` — available on order-level data
    after session attribution

### Product Catalog CDF 2.0

**Project:** `wf-gcp-us-product-catalog-prod`
**Dataset:** `cdf_fdl`

| Table          | Description                | Partition | Key Columns                                      |
| -------------- | -------------------------- | --------- | ------------------------------------------------ |
| `tbl_product`  | Product attributes         | N/A       | `sku`, `product_name`, `class_id`, `category_id` |
| `tbl_class`    | Product class hierarchy    | N/A       | `class_id`, `class_name`, `department_id`        |
| `tbl_category` | Product category hierarchy | N/A       | `category_id`, `category_name`                   |

**Notes:**

-   CDF 2.0 = Canonical Data Format, product catalog source of truth
-   Not date-partitioned — point-in-time snapshot
-   Join to clickstream via `sku` in click events

### Recipe Analytics

**Project:** `wf-gcp-us-ae-sf-prod`
**Dataset:** `csn_recipe_analytics`

Contains pre-computed analytics recipes. Tables vary — use `bq ls` to explore.

### Replatforming Scope

**Project:** `wf-gcp-us-ae-sf-prod`
**Dataset:** `ttr`

| Table              | Description                              | Partition   | Key Columns                          |
| ------------------ | ---------------------------------------- | ----------- | ------------------------------------ |
| `tbl_replat_scope` | Which pages are replatformed vs monolith | `eventdate` | `pagetype`, `is_replat`, `eventdate` |

**Notes:**

-   Use to understand what percentage of traffic is on replat vs monolith
-   Critical for any analysis comparing replat behavior

---

## Critical Join Keys

### deviceguid (Universal Join Key)

**IMPORTANT:** Always use `LOWER(a.deviceguid) = LOWER(b.deviceguid)` when
joining across tables. Deviceguids have inconsistent casing between Scribe 1.0
and 2.0.

### Common Join Patterns

| From                 | To                           | Join Key(s)                                           | Notes                          |
| -------------------- | ---------------------------- | ----------------------------------------------------- | ------------------------------ |
| `tbl_dash_visits`    | `tbl_dash_clicks`            | `deviceguid`, `visitid`, `eventdate`                  | Session -> pages               |
| `tbl_dash_clicks`    | `tbl_fact_component`         | `LOWER(deviceguid)`, `pageviewid`, `eventdate`        | Page -> components             |
| `tbl_dash_clicks`    | `tbl_scribe_click`           | `LOWER(deviceguid)`, `pageviewid`, `eventdate`        | Curated -> raw                 |
| `tbl_dash_visits`    | `tbl_dash_gambit_assignment` | `LOWER(deviceguid)`, `eventdate`                      | Session -> experiment          |
| `tbl_dash_clicks`    | `tbl_orders` (via basket)    | `LOWER(deviceguid)`                                   | Page -> orders (cross-project) |
| `tbl_fact_component` | `tbl_scribe_elementloaded`   | `LOWER(deviceguid)`, `elementinstanceid`, `eventdate` | Curated -> raw component       |
| Any clickstream      | `tbl_product`                | `sku`                                                 | Clickstream -> product catalog |

### Cross-Project Joins

When joining tables across projects, use fully-qualified table names:

```sql
SELECT a.*, b.*
FROM `wf-gcp-us-ae-sf-prod.curated_clickstream.tbl_dash_visits` a
JOIN `wf-gcp-us-ae-sql-data-prod.csn_basket.tbl_orders` b
  ON LOWER(a.deviceguid) = LOWER(b.deviceguid)
WHERE a.eventdate = CURRENT_DATE()
  AND b.orderdate = CURRENT_DATE()
```

---

## Data Pipeline Hierarchy

```text
Raw Tracking (Scribe 1.0 / 2.0)
    │
    ▼
Combined Views (curated_scribe_foundation)
    │
    ▼
ETL (clickstream ETL, data hub ETL)
    │
    ▼
Data Model (curated_clickstream, curated_data_hub, curated_gambit)
    │
    ▼
Visualization (Tableau, Looker, custom dashboards)
```

-   **Raw -> Foundation**: Merges Scribe 1.0 + 2.0 into unified schema
-   **Foundation -> Curated**: Applies business logic, bot filtering, session
    stitching
-   **Curated -> Viz**: Powers dashboards and reports

**ETL Cadence:**

-   Raw Scribe: near real-time (streaming)
-   Foundation tables: hourly batch
-   Curated clickstream: daily batch (T+1 for full day)
-   Gambit metrics: daily batch
-   SQL replicas (sql-data-prod): **near-real-time** (CDC streaming)
-   SQL replicas (bulk-prod): daily batch (T+1)
