# bq (BigQuery CLI) Setup

`bq` is part of the Google Cloud SDK and uses `gcloud` auth — this skill defers
to the native flow.

## Where the credentials come from

-   Wayfair GCP IAM (your `@wayfair.com` Google identity).
-   Required role on the data projects (read-only suffices for the skill's default
    actions): typically `roles/bigquery.dataViewer` + `roles/bigquery.jobUser` on
    the **billing project** you'll use.
-   VPN required for some on-prem-routed endpoints, but not for BQ itself in most
    setups.

## Default billing project (Storefront / Customer Tech)

The skill defaults to `--project_id=wf-gcp-us-ae-sf-prod`. **This works for
engineers in Storefront/Customer Tech orgs.** Engineers in other orgs (e.g.,
Supply Chain, GST, Platforms) will hit "Access Denied" because their identity
isn't billed against `wf-gcp-us-ae-sf-prod`.

### Override the billing project

Two ways:

1. **Per-call** — pass `--project_id=<your-billing-project>` to every `bq`
   command. The skill respects user overrides in `$ARGUMENTS`.
2. **Globally** — change your gcloud default and skill default by exporting:

    ```bash
    export BQ_DEFAULT_BILLING_PROJECT=<your-billing-project>
    ```

    Then in your `~/.zshrc` / `~/.bashrc`:

    ```bash
    bq() { command bq "$@" --project_id="${BQ_DEFAULT_BILLING_PROJECT:-wf-gcp-us-ae-sf-prod}"; }
    ```

    (Optional — most users override per-call.)

Ask in your team's onboarding channel for your team's billing project name if it
isn't documented.

## First-time setup

```bash
# Install the Google Cloud SDK (one-time)
brew install --cask google-cloud-sdk

# Authenticate
gcloud auth login                          # opens browser for SSO
gcloud auth application-default login      # required for some BQ tooling
gcloud config set project wf-gcp-us-ae-sf-prod   # or your team's billing project
```

## Verify

```bash
bq show --project_id=wf-gcp-us-ae-sf-prod --format=json wf-gcp-us-ae-sf-prod:curated_clickstream | jq -r '.id // "UNAUTHORIZED"'
# Expect: a string like "wf-gcp-us-ae-sf-prod:curated_clickstream"
# UNAUTHORIZED means your IAM doesn't have access; reach out to your data team.
```

## Rotate / refresh

GCP tokens auto-rotate via `gcloud`. If `bq` returns auth errors:

```bash
gcloud auth login
gcloud auth application-default login
```

If you also use `gcloud container clusters get-credentials`, both `bq` and
`kubectl` share the same identity — re-auth fixes both.

## Notes

-   This skill does NOT use `~/.credentials/bq/` — `gcloud` + ADC is the native,
    audited path.
-   The data project paths (`wf-gcp-us-ae-sql-data-prod`,
    `wf-gcp-us-ae-scribe-v2-prod`, etc.) do not change based on the billing
    project — only `--project_id` (the _billing_ project) varies.
-   See `references/mssql-replicas.md` for the BQ-vs-MSSQL naming and
    project-routing rules; `references/tables.md` for the curated clickstream /
    analytics table catalog.
