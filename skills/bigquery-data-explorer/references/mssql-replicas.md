# MSSQL Replica Tables in BigQuery

## Two Projects, Two Freshness Levels

| Project                      | Freshness                           | Dataset Pattern                           | Use Case                                    |
| ---------------------------- | ----------------------------------- | ----------------------------------------- | ------------------------------------------- |
| `wf-gcp-us-ae-sql-data-prod` | **Near-real-time** (CDC streaming)  | `csn_<database>`                          | Live queries, monitoring, recent data       |
| `wf-gcp-us-ae-bulk-prod`     | **Batch/delayed** (daily snapshots) | `csn_<database>` or `bulk_csn_<database>` | Historical analysis, large scans, backfills |

Always prefer `sql-data-prod` for recent data (last 7 days). Use `bulk-prod` for
historical deep dives.

---

## Naming Convention: MSSQL to BigQuery

### Table Names

MSSQL CamelCase tables become **lowercase*snake_case with `tbl*` prefix** in
BigQuery:

| MSSQL Table             | BigQuery Table             | Dataset      |
| ----------------------- | -------------------------- | ------------ |
| `tblOrderProduct`       | `tbl_order_product`        | `csn_basket` |
| `tblOrderAdjustment`    | `tbl_order_adjustment`     | `csn_basket` |
| `tblOrder`              | `tbl_order`                | `csn_basket` |
| `tblFavoriteItem`       | `tbl_favorite_item`        | `csn_basket` |
| `tblOrderProductOption` | `tbl_order_product_option` | `csn_basket` |

**Edge cases exist** — when the simple pattern doesn't match, use
INFORMATION_SCHEMA to discover:

```sql
SELECT table_name
FROM `wf-gcp-us-ae-sql-data-prod`.<dataset>.INFORMATION_SCHEMA.TABLES
WHERE LOWER(table_name) LIKE '%<keyword>%'
ORDER BY table_name
```

### Column Names

**Column names are preserved as CamelCase** in BigQuery — they are NOT
lowercased:

| MSSQL Column         | BigQuery Column      | Notes    |
| -------------------- | -------------------- | -------- |
| `OpHasProPricing`    | `OpHasProPricing`    | BOOLEAN  |
| `OpTwoDayGuarantee`  | `OpTwoDayGuarantee`  | BOOLEAN  |
| `OpHasBulkPricing`   | `OpHasBulkPricing`   | BOOLEAN  |
| `OpSellNewAsUsed`    | `OpSellNewAsUsed`    | BOOLEAN  |
| `OaUsID`             | `OaUsID`             | INTEGER  |
| `OaRcoID`            | `OaRcoID`            | INTEGER  |
| `OaDescriptionExtra` | `OaDescriptionExtra` | STRING   |
| `OpDateNew`          | `OpDateNew`          | DATETIME |

### Database to Dataset Mapping

MSSQL database names map to BQ datasets as `csn_<lowercase_database>`:

| MSSQL Database          | BQ Dataset              |
| ----------------------- | ----------------------- |
| `csn_basket`            | `csn_basket`            |
| `csn_order`             | `csn_order`             |
| `csn_adcampaign`        | `csn_adcampaign`        |
| `csn_catalog_selection` | `csn_catalog_selection` |
| `csn_b2b`               | `csn_b2b`               |
| `csn_api`               | `csn_api`               |

---

## Table Resolution Algorithm

When the user mentions an MSSQL table name:

1. **Convert the name**: `tblOrderProduct` -> `tbl_order_product`
2. **Identify the database**: Usually clear from context (basket tables ->
   `csn_basket`)
3. **Try NRT first**: `wf-gcp-us-ae-sql-data-prod.csn_<db>.tbl_<name>`
4. **Fall back to bulk**: `wf-gcp-us-ae-bulk-prod.csn_<db>.tbl_<name>`
5. **If neither works**, use INFORMATION_SCHEMA discovery:

```sql
-- Search across all csn_ datasets in sql-data-prod
SELECT table_schema, table_name
FROM `wf-gcp-us-ae-sql-data-prod`.`region-us`.INFORMATION_SCHEMA.TABLES
WHERE table_schema LIKE 'csn_%'
  AND LOWER(table_name) LIKE '%<keyword>%'
ORDER BY table_schema, table_name
```

---

## Known csn_basket Tables (sql-data-prod)

| BigQuery Table             | MSSQL Origin            | Key Columns                                                 |
| -------------------------- | ----------------------- | ----------------------------------------------------------- |
| `tbl_order`                | `tblOrder`              | `OrID` (order ID), `OrCuID` (customer ID), `OrDate`         |
| `tbl_order_product`        | `tblOrderProduct`       | `OpOrID` (order ID), `OpID` (item ID), `OpSKU`, `OpDateNew` |
| `tbl_order_adjustment`     | `tblOrderAdjustment`    | `OaOrID`, `OaOpID`, `OaDescription`, `OaAmount`             |
| `tbl_order_product_option` | `tblOrderProductOption` | `OpoOpID`, `OpoName`, `OpoValue`                            |
| `tbl_favorite_item`        | `tblFavoriteItem`       | Wishlist/favorites                                          |
| `tbl_favorite_item_option` | `tblFavoriteItemOption` | Wishlist item options                                       |
| `tbl_favorite_list`        | `tblFavoriteList`       | Wishlist/list metadata                                      |
| `tbl_favorite_room`        | `tblFavoriteRoom`       | Room boards                                                 |
| `tbl_record_batc`          | `tblRecordBatch`        | Batch processing records                                    |

---

## Partitioning & Query Safety

**Most MSSQL replica tables are NOT partitioned by eventdate.**

-   The `WHERE eventdate` safety rule does NOT apply to MSSQL replicas
-   Use domain-specific date columns instead: `OpDateNew`, `OaDate`, `OrDate`
-   **Always dry-run first** for MSSQL replica queries — full table scans are
    common
-   Use `COUNTIF()` with single-scan conditional aggregation to avoid redundant
    UNION ALL scans
-   For column distribution checks, prefer `COUNTIF(col IS NULL)` over separate
    GROUP BY queries

### Optimized Distribution Pattern

```sql
-- Single-scan distribution check (efficient for unpartitioned tables)
SELECT
  COUNT(*) AS total_rows,
  COUNTIF(OpHasBulkPricing IS NULL) AS bulk_null,
  COUNTIF(OpHasBulkPricing = false) AS bulk_false,
  COUNTIF(OpHasBulkPricing = true) AS bulk_true
FROM `wf-gcp-us-ae-sql-data-prod.csn_basket.tbl_order_product`
WHERE OpDateNew >= DATETIME_SUB(CURRENT_DATETIME(), INTERVAL 7 DAY)
```

---

## Waysqooper Inventory (Advanced)

The **BeamScooper/Waysqooper** pipeline logs every replicated MSSQL table into a
tracking table (historically `tbl_waysqoop_row_count_store` in
`wf-gcp-us-ae-bulk-prod`). Query this for:

-   "Does MSSQL table X have a BQ replica?"
-   "What's the exact project.dataset.table path?"

Ask in `#plats-ops-support` Slack channel for the current location if the
standard naming pattern doesn't resolve.

---

## CloudSQL & GCP-Native Sources

For non-MSSQL sources (CloudSQL PostgreSQL, etc.):

-   Teams run **Datastream** (CDC) or **Dataflow** (batch) into their own GCP
    projects
-   Dataset naming: often `ds_psql_gbq_<prefix>` for Datastream
-   Check the team's Terraform repo for `ds_psql_gbq_*.tf` files to find mappings
-   Use `INFORMATION_SCHEMA.TABLES` in the team's project to discover available
    tables

---

## Writing Raw T-SQL Against MSSQL — Source of Truth

**When the user explicitly says "SQL" / "T-SQL" / "MSSQL query"** (vs. BigQuery
/ BQ / GCP), generate raw T-SQL against MSSQL table names (`tblOrder*`,
`tblFavorite*`, etc.), not BQ-style queries. Reach for `bq query` only when the
user mentions BigQuery, BQ, GCP, or the dataset name explicitly.

When you do need to write raw T-SQL against an MSSQL table, **do not transcribe
column names from BQ memory or this skill's tables by analogy**. The BQ mirror's
column casing follows MSSQL closely but the BQ column casing isn't 100%
identical to the MSSQL column casing for every field, and the Java entity field
names are different again.

### Ground every column name in the entity source

For Java services with JPA `@Column` annotations (most Wayfair Java services),
the MSSQL column name lives on the entity:

```bash
# Quickest grep — every @Column on an entity
grep -B 1 "private" path/to/Mssql<X>Entity.java | grep "@Column"
```

The entity's `@Column(name = "...")` value is the authoritative MSSQL column
name. The Java field name (e.g. `kitOpId`) is what the BasketItem domain layer
uses, not what MSSQL sees.

### Beware "fields" that aren't columns

Many domain-layer "fields" are _derived_ in mappers (often in `@AfterMapping`
methods on a `*ToDomainMapper` class) — they don't exist as MSSQL columns at
all. Common pattern: a property like `itemProfile` is computed from other
columns (`KitParent`, `KitOpID`, `SriParentOpId`, `ProductTypeId`) by an
`@AfterMapping` method, and the property has no `@Column` annotation.

When writing T-SQL that needs a derived property, reproduce the mapper's logic
in a SQL `CASE` / CTE rather than searching for a column that won't exist:

```sql
-- Example: derive itemProfile in T-SQL (Java service mapper pattern)
CASE
  WHEN op.OpKitParent = 1                     THEN 'PARENT'
  WHEN op.OpKitOpID IS NOT NULL               THEN 'CHILD'
  WHEN op.OpSriSkuParentOpId IS NOT NULL      THEN 'SUPER_RELATED_ITEM_CHILD'
  ELSE 'STANDARD'
END AS derivedItemProfile
```

### Triage flow

When you get a SQL error like `Invalid column name 'X'`:

1. **Don't guess again.** Stop and read the entity source.
2. Open `path/to/Mssql<X>Entity.java`, grep `@Column` annotations.
3. If the property isn't a `@Column`, look for it in `Sql<X>ToDomainMapper.java`
   (or equivalent) — it's likely derived in `@AfterMapping`. Reproduce that
   derivation in SQL.
4. If it's not in the entity OR a mapper, the property may live in a related
   entity (joined via `OpID` or similar). Walk the entity's `@OneToMany` /
   `@ManyToOne` annotations.
