# Renovate PR Consolidator

## Phase 1: Discover Open Renovate PRs

1. **Identify the repo** — run `git remote get-url origin`. Extract `owner`
   and `repo`.

2. **List open Renovate PRs** — `gh pr list --author "app/applife-renovate-app"
   --state open --json number,title,headRefName,url`.
   Collect every PR's `number`, `title`, `headRefName`, and `url`.

3. **Fetch changed files for each PR** — `gh pr view <number> --json files` (or
   `gh pr diff <number>`) on each PR. Record which dependency files are
   touched and what version changes are proposed. Typical patterns:

    | Ecosystem | Dependency files | Lock files |
    |-----------|-----------------|------------|
    | Python | `requirements.txt`, `requirements-test.txt`, `setup.cfg`, `pyproject.toml` | `requirements.lock` |
    | Java/Kotlin | `pom.xml`, `build.gradle`, `build.gradle.kts` | `gradle.lockfile` |
    | Node | `package.json` | `package-lock.json`, `yarn.lock` |

4. **Present the list to the user** as a table:

    ```text
    ## Open Renovate PRs

    | # | Dependency | From → To | File | Security? |
    |---|-----------|-----------|------|-----------|
    | 5 | requests  | 2.31.0 → 2.33.0 | requirements.txt | SECURITY |
    | 6 | cryptography | <46 → <47 | requirements.txt | SECURITY |
    ...
    ```

    Ask: **"Which PRs should I include? All, or specific numbers?"**
    Default to all if the user confirms.

## Phase 2: Analyze Compatibility

5. **Check for version conflicts** — scan the proposed version bumps
   against each other and against pinned versions in the dependency
   files. Flag any obvious incompatibilities:
   - Two PRs bump the same package to different versions.
   - A bumped package has a known upper-bound constraint elsewhere
     (e.g. `pydantic<2` blocks a Pydantic 2.x upgrade).
   - A PR is marked "potentially breaking change" in its title.

6. **Flag breaking changes** — if any PR title contains "breaking change"
   or "SECURITY", highlight those separately and ask the user to confirm
   they want to include them.

7. **Present the analysis:**

    ```text
    ## Compatibility Check

    ✅ No conflicts between selected upgrades.

    ⚠️  Breaking changes:
    - #14 ruff 0.14 → 0.15 (potentially breaking on 0.x)
    - #13 httpx 0.23 → 0.28 (potentially breaking on 0.x)

    🔒 Security fixes:
    - #5 requests (CVE-XXXX)
    - #6 cryptography (CVE-XXXX)

    Proceed with all? [Y/n]
    ```

## Phase 3: Apply Upgrades

8. **Create a consolidation branch** — from the repo's default branch:

    ```bash
    git fetch origin main
    git checkout -b chore/consolidate-renovate-upgrades origin/main
    ```

9. **Apply each version bump** to the source dependency files
   (`requirements.txt`, `requirements-test.txt`, `pom.xml`, etc.).
   Edit only the version specifier lines — do not touch comments, ordering,
   or unrelated lines.

    For each PR, read the patch from Phase 1 and apply the same change to
    the on-disk file. Use the StrReplace tool (or equivalent) for surgical
    edits.

10. **Regenerate the lock file.** The method depends on the ecosystem:

    | Ecosystem | Command |
    |-----------|---------|
    | Python (Wayfair) | `docker compose run --rm lock-requirements` |
    | Python (pip-tools) | `pip-compile requirements.txt -o requirements.lock` |
    | Java (Gradle) | `./gradlew dependencies --write-locks` |
    | Node (npm) | `npm install --package-lock-only` |
    | Node (yarn) | `yarn install --mode update-lockfile` |

    Check the repo for a `docker-compose.yaml` service named
    `lock-requirements` first — if present, use it (Wayfair convention).
    Otherwise, detect the ecosystem and use the appropriate command.

11. **Verify the lock file regenerated cleanly.** If the lock command
    fails, it means there is a dependency conflict. Surface the full
    error output to the user and stop.

## Phase 4: Validate

12. **Run the test suite:**

    ```bash
    docker compose run --rm test
    ```

    Or the repo's standard test command (check `Makefile`, `pyproject.toml
    [tool.pytest]`, `docker-compose.yaml` services, or `package.json`
    scripts).

13. **Run linters** — if the repo has lint steps (ruff, mypy, eslint),
    run them too. Dependency upgrades can introduce new lint rules
    (e.g. a ruff upgrade may flag new violations).

14. **If tests or lint fail:**
    - Identify which upgrade likely caused the failure (compare the error
      against the list of bumped packages).
    - Offer to exclude that upgrade and retry.
    - Do **not** modify test assertions or suppress lint errors.

## Phase 5: Create the Consolidated PR

15. **Commit all changes:**

    ```bash
    git add requirements.txt requirements-test.txt requirements.lock
    git commit -m "chore: consolidate dependency upgrades

    Combines the following Renovate PRs into a single upgrade:
    - #5 requests 2.31.0 → 2.33.0 [SECURITY]
    - #6 cryptography <46 → <47 [SECURITY]
    - #11 click 8.1.7 → 8.3.1
    ..."
    ```

16. **Push and create the PR:**

    ```bash
    git push -u origin chore/consolidate-renovate-upgrades
    gh pr create --title "chore: consolidate Renovate dependency upgrades" \
      --body-file <path-to-body>
    ```

    Build the body from the repo's PR template; list every included upgrade
    with PR number and version change; note test results and any breaking
    changes. Create it ready for review (omit `--draft`).

17. **Offer to close the individual Renovate PRs:**

    Ask: **"Want me to close the original Renovate PRs with a comment
    linking to the consolidated PR?"**

    If confirmed, for each included PR:
    `gh pr close <number> --comment "Consolidated into #<new_pr>"`

## Rules

- Never force-push or push to `main`/`master`.
- Never modify test assertions or suppress lint errors to make upgrades pass.
- Never include a Renovate PR the user explicitly excluded.
- If the lock file command is unavailable or fails, do **not** hand-edit the
  lock file — surface the error and ask the user for the correct command.
- Security upgrades (`[SECURITY]` in title) should be called out prominently
  in the consolidated PR description.
- If a breaking-change upgrade causes test failures, exclude it by default
  and note it as needing a separate, dedicated PR.
- Create the PR as ready for review (not draft).
- Preserve the Renovate PR numbers in the commit message and PR body so
  the audit trail is clear.
