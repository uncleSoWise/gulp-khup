# Branch Strategy & Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the repository to a single `main` branch, delete all stale merged branches locally and remotely, and update every agent/workflow/template file that references the old branch names.

**Architecture:** `develop` is the current source of truth (v1.3.1, 85 commits ahead of the old `master`). We create `main` from `develop`, redirect the CI and agent tooling, then delete all stale branches. The npm publish workflow (`publish.yml`) is tag-triggered and needs no branch changes.

**Tech Stack:** Git, GitHub Actions, GitHub repository settings (human steps), GitHub branch protection (human steps).

---

## Pre-Flight: Branch Inventory

Before any deletions, this is the verified state as of 2026-07-18:

| Branch | Status | Action |
|---|---|---|
| `develop` | HEAD, v1.3.1, truth | Rename to `main` (via new branch + delete) |
| `master` | Pre-rewrite, 1 unique merge commit (`4d313a8`) | Review then delete |
| `next` | v1.0.0 milestone, fully merged into develop | Delete |
| `chore/v1.1.5` | Merged release chore | Delete |
| `chore/v1.1.6` | Merged release chore | Delete |
| `feat/email-compatibility-77` | Merged via PR #83 | Delete |
| `feat/wordpress-php-port` | Merged via PR #82 | Delete |
| `feature/email-template` | Merged via PR #52 | Delete |
| `feature/housekeeping-remove-legacy-files` | Merged via PR #53 | Delete |
| `feature/phase1-ai-ready` | Merged | Delete |
| `feature/phase1-changelog` | Merged | Delete |
| `feature/phase1-release-v0.1.1` | Merged | Delete |
| `feature/phase1-security-audit` | Merged | Delete |
| `feature/phase2-task1-scaffold-setup` | Merged | Delete |
| `feature/phase2-task10-final-release` | Merged | Delete |
| `feature/phase2-task2-scaffold-tdd` | Merged | Delete |
| `feature/phase2-task3-cli-tdd` | Merged | Delete |
| `feature/phase2-task4-bin-create` | Merged | Delete |
| `feature/phase2-task5-templates` | Merged | Delete |
| `feature/phase2-task6-coverage` | Merged | Delete |
| `feature/phase2-tasks7-9-release-prep` | Merged | Delete |
| `feature/v1.1.0-release` | Merged | Delete |
| `feature/wordpress-template` | Merged via PR #51 | Delete |
| `fix/package-json-and-publish-auth` | Merged | Delete |
| `fix/publish-debug-npmrc` | Merged | Delete |
| `fix/publish-node22` | Merged | Delete |
| `fix/publish-oidc-fetch-jwt` | Merged | Delete |
| `fix/publish-oidc-no-registry-url` | Merged | Delete |
| `fix/publish-strip-empty-auth-token` | Merged | Delete |
| `fix/publish-upgrade-npm-oidc` | Merged | Delete |
| `fix/publish-workflow-provenance` | Merged | Delete |
| `fix/security-htmlmin` | Merged via PR #80 | Delete |
| `fix/security-imagemin` | Merged via PR #74 | Delete |
| `fix/v1.1.1-publish-hotfix` | Merged | Delete |
| `fix/v1.1.2-publish-trigger` | Merged | Delete |
| `fix/v1.1.3-debug-trigger` | Merged | Delete |
| `fix/v1.1.4-oidc-trigger` | Merged | Delete |
| `phase3/template-quality` | Merged via PR #73 | Delete |

**Remote-only branches to delete:**
- `origin/master` (no local counterpart for the unique hotfix commit)
- `origin/release/0.1.0` (archived release, pre-rewrite)

---

## Files Modified

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | `branches: [develop, next]` → `branches: [main]` (2 occurrences + comment) |
| `.github/agents/implementer.agent.md` | `rebase onto develop` → `rebase onto main` |

No other files contain hardcoded `develop`, `master`, or `next` branch references.

---

## New Branching Strategy

```
main  ←── PRs from feat/<slug>, fix/<slug>, chore/<slug>
          ↑
          Tags (v1.x.x) trigger publish.yml → npm
```

**Rules:**
- `main` is the only permanent branch
- Feature work: `feat/<issue-number>-short-description` (e.g. `feat/84-add-js-task`)
- Bug fixes: `fix/<issue-number>-short-description`
- Chores/releases: `chore/<description>` (e.g. `chore/v1.4.0`)
- All PRs target `main`
- Releases: create a tag on `main` → `publish.yml` runs automatically
- No release branches, no long-lived develop/next branches

---

## Task 1: Verify the Unique `master` Commit

**Goal:** Confirm the single commit `master` has that `develop` lacks is safe to discard — it is pre-rewrite legacy content, not work-in-progress.

**Files:** Read-only inspection only.

- [ ] **Step 1: Inspect the unique master commit**

```bash
cd /path/to/gulp-khup
git show 4d313a8 --stat
```

Expected: A merge commit from the `hotfix/1.0.1.2` era showing old legacy files (pre-ESM, likely old gulpsheet-style files). If you see files like `src/scaffold.js`, `src/cli.js`, or anything from the current codebase — STOP and flag for human review before proceeding.

- [ ] **Step 2: Confirm it predates the ESM rewrite**

```bash
git log --oneline origin/master | head -10
```

Expected output similar to:
```
4d313a8 Merge branch 'hotfix/1.0.1.2'
f62b6a1 Update readme task overview
b549fe3 Merge branch 'hotfix/readme'
dcd2505 Fix formatting on README
10126c8 Merge branch 'release/0.1.0'
```

If you see modern commits (feat:, fix:, chore: conventional commits referencing PRs), STOP — master may contain unmerged work.

- [ ] **Step 3: Confirm develop contains all current work**

```bash
git log --oneline origin/develop | head -5
```

Expected: Most recent commit is `545d6cd fix: repair WordPress CI integration — js.js, deploy.js, scss variable scope`. If not, `git fetch --all` and retry.

- [ ] **Step 4: Record finding and commit nothing**

No commit. This is read-only verification. Document the result in a comment in this plan:
> **Result:** master unique commit is pre-rewrite legacy, safe to delete.

---

## Task 2: Create `main` from `develop`

**Goal:** Create the new permanent branch `main` pointing at the same commit as `develop`.

**Files:** None — Git operations only.

- [ ] **Step 1: Ensure local develop is current**

```bash
git checkout develop
git pull origin develop
```

Expected: `Already up to date.` (or fast-forward to latest). HEAD should be at `545d6cd`.

- [ ] **Step 2: Create `main` from develop**

```bash
git checkout -b main
```

Expected:
```
Switched to a new branch 'main'
```

- [ ] **Step 3: Verify `main` matches `develop`**

```bash
git log --oneline -3
```

Expected: Same top 3 commits as `develop`:
```
545d6cd (HEAD -> main, origin/develop, develop) fix: repair WordPress CI integration — js.js, deploy.js, scss variable scope
7b18735 ci: overhaul pipeline — parallel jobs, Node matrix, typecheck, all 3 project types
40c1f77 docs: add JSDoc type annotations and jsconfig.json for IDE type checking
```

- [ ] **Step 4: Push `main` to remote**

```bash
git push origin main
```

Expected: Branch created on remote. Note: CI will NOT run on this push yet — ci.yml still targets `[develop, next]`. That is correct; we fix CI in Task 3.

- [ ] **Step 5: Do NOT set `main` as default branch yet**

The default branch change is a human-only step (GitHub UI, requires repository admin). It must happen AFTER Task 3 is complete and CI is verified on `main`. See the Human Tasks section.

---

## Task 3: Update CI Workflow to Target `main`

**Goal:** `ci.yml` must run on push/PR to `main`. The `next` branch reference is removed entirely.

**Files:**
- Modify: `.github/workflows/ci.yml:1-9`

- [ ] **Step 1: Open ci.yml and locate the trigger block**

Read `.github/workflows/ci.yml` lines 1–9. Confirm it reads:

```yaml
name: CI

on:
  push:
    branches: [develop, next]
  pull_request:
    branches: [develop, next]
    # Dependabot PRs targeting develop also trigger this via pull_request.
```

- [ ] **Step 2: Replace the trigger block**

Replace lines 1–9 with:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    # Dependabot PRs targeting main also trigger this via pull_request.
```

- [ ] **Step 3: Verify no other branch references remain in ci.yml**

```bash
grep -n "develop\|next\|master" .github/workflows/ci.yml
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: retarget CI workflow from develop/next to main"
```

- [ ] **Step 5: Push to `main` and verify CI triggers**

```bash
git push origin main
```

Navigate to `https://github.com/<owner>/gulp-khup/actions` and confirm the CI workflow run appears for branch `main`. Wait for it to pass (all 4 jobs: audit, typecheck, test, integration).

---

## Task 4: Update Agent Files

**Goal:** `implementer.agent.md` hard-codes "rebase onto develop" — update to `main`.

**Files:**
- Modify: `.github/agents/implementer.agent.md:13`

- [ ] **Step 1: Read the current implementer agent**

Read `.github/agents/implementer.agent.md`. Locate line 13:
```
- **Pre-push hygiene:** rebase onto develop, reinstall deps (`npm install`), run the full test suite (`npm test`), run coverage (`npm run test:coverage`). All must pass.
```

- [ ] **Step 2: Replace `develop` with `main`**

Change line 13 to:
```
- **Pre-push hygiene:** rebase onto main, reinstall deps (`npm install`), run the full test suite (`npm test`), run coverage (`npm run test:coverage`). All must pass.
```

- [ ] **Step 3: Verify no other stale branch references in `.github/agents/`**

```bash
grep -rn "develop\|origin/next\|origin/master" .github/agents/
```

Expected: no output.

- [ ] **Step 4: Scan remaining agent/prompt files**

```bash
grep -rn "\bdevelop\b\|origin/next\|origin/master" .github/prompts/ AGENTS.md .github/copilot-instructions.md
```

Expected: no output (or only contextual prose references that explain history, not operational instructions).

If hits are found, update them to `main` in the same commit.

- [ ] **Step 5: Commit**

```bash
git add .github/agents/implementer.agent.md
git commit -m "chore: update implementer agent — rebase target develop → main"
```

---

## Task 5: Update PR Template

**Goal:** Ensure the PR template references `main`, not `develop`.

**Files:**
- Modify: `.github/PULL_REQUEST_TEMPLATE.md` (if branch references exist)

- [ ] **Step 1: Scan PR template for branch references**

```bash
grep -n "develop\|master\|next\b" .github/PULL_REQUEST_TEMPLATE.md
```

Expected: no output (current template has no hardcoded branch names). If output is found, replace each instance with `main`.

- [ ] **Step 2: Add branch strategy note to PR template**

The current template is valid but lacks a note about target branch. Add a reminder at the top of the checklist section so contributors know to target `main`:

```markdown
## Target Branch

This PR targets: `main`
```

Add this block immediately above `## Type of Change`.

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "chore: update PR template — note main as target branch"
```

---

## Task 6: Update AGENTS.md and copilot-instructions.md

**Goal:** Ensure AI agent documentation accurately reflects the `main`-only strategy.

**Files:**
- Modify: `AGENTS.md` (add branching strategy section)
- Modify: `.github/copilot-instructions.md` (add branching convention)

- [ ] **Step 1: Check current AGENTS.md for branch references**

```bash
grep -n "develop\|master\|next\b" AGENTS.md
```

Expected: no output. Current AGENTS.md has no branch strategy section.

- [ ] **Step 2: Add a Branching Strategy section to AGENTS.md**

Insert the following section immediately after the `## Key Commands` block:

```markdown
## Branching Strategy

One permanent branch: **`main`** (the default and only long-lived branch).

| Branch prefix | Pattern | Target |
|---|---|---|
| Feature work | `feat/<issue-number>-short-description` | `main` |
| Bug fixes | `fix/<issue-number>-short-description` | `main` |
| Chores / releases | `chore/<description>` | `main` |

**All PRs target `main`.** Release tags on `main` trigger the npm publish pipeline.
No `develop`, `next`, or `master` branches exist.
```

- [ ] **Step 3: Add branching convention to copilot-instructions.md**

In `.github/copilot-instructions.md`, add a `## Branching` section (append to the file, before any trailing newline):

```markdown
## Branching

One permanent branch: `main`. All feature, fix, and chore branches target `main` via PR.
Branch names: `feat/<issue>-description`, `fix/<issue>-description`, `chore/<description>`.
Releases: tag `main` with `vX.Y.Z` — the publish workflow runs automatically.
```

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md .github/copilot-instructions.md
git commit -m "docs: add branching strategy — main-only workflow"
```

---

## Task 7: Delete All Stale Local Branches

**Goal:** Remove all 34 merged/stale local branches. Keep only `main` (and temporarily `develop` until GitHub default branch is switched).

**Files:** None — Git operations only.

- [ ] **Step 1: Confirm you are on `main`**

```bash
git branch --show-current
```

Expected: `main`

- [ ] **Step 2: Delete all stale local branches in one pass**

```bash
git branch -d \
  next \
  chore/v1.1.5 \
  chore/v1.1.6 \
  feat/email-compatibility-77 \
  feat/wordpress-php-port \
  feature/email-template \
  feature/housekeeping-remove-legacy-files \
  feature/phase1-ai-ready \
  feature/phase1-changelog \
  feature/phase1-release-v0.1.1 \
  feature/phase1-security-audit \
  feature/phase2-task1-scaffold-setup \
  feature/phase2-task10-final-release \
  feature/phase2-task2-scaffold-tdd \
  feature/phase2-task3-cli-tdd \
  feature/phase2-task4-bin-create \
  feature/phase2-task5-templates \
  feature/phase2-task6-coverage \
  feature/phase2-tasks7-9-release-prep \
  feature/v1.1.0-release \
  feature/wordpress-template \
  fix/package-json-and-publish-auth \
  fix/publish-debug-npmrc \
  fix/publish-node22 \
  fix/publish-oidc-fetch-jwt \
  fix/publish-oidc-no-registry-url \
  fix/publish-strip-empty-auth-token \
  fix/publish-upgrade-npm-oidc \
  fix/publish-workflow-provenance \
  fix/security-htmlmin \
  fix/security-imagemin \
  fix/v1.1.1-publish-hotfix \
  fix/v1.1.2-publish-trigger \
  fix/v1.1.3-debug-trigger \
  fix/v1.1.4-oidc-trigger \
  phase3/template-quality
```

All of these are fully merged. Use `-d` (safe delete — refuses if not merged). If any branch rejects with "not fully merged", investigate before using `-D`.

- [ ] **Step 3: Keep `develop` locally for now**

Do NOT delete `develop` locally yet. It remains until the human completes the GitHub default branch switch (see Human Tasks). After GitHub is updated, run:

```bash
git branch -d develop
```

- [ ] **Step 4: Verify local branch list**

```bash
git branch
```

Expected:
```
  develop
* main
```

---

## Task 8: Push All Changes and Verify

**Goal:** Ensure `main` is fully up to date with all Task 3–6 commits and CI is green.

- [ ] **Step 1: Confirm all commits are on `main`**

```bash
git log --oneline -8
```

Expected (in order, newest first):
```
<hash> docs: add branching strategy — main-only workflow
<hash> chore: update PR template — note main as target branch
<hash> chore: update implementer agent — rebase target develop → main
<hash> ci: retarget CI workflow from develop/next to main
545d6cd fix: repair WordPress CI integration — js.js, deploy.js, scss variable scope
...
```

- [ ] **Step 2: Push `main` to remote**

```bash
git push origin main
```

- [ ] **Step 3: Confirm CI passes on `main`**

Navigate to `https://github.com/<owner>/gulp-khup/actions` and wait for all 4 CI jobs (audit, typecheck, test ×2 nodes, integration ×3 types) to pass on the `main` branch push.

Do NOT proceed to Human Tasks until CI is green.

---

## Human-Only Tasks

> These steps require a human with repository admin access. They cannot be automated safely from a local Git clone or without GitHub UI/API credentials.

### H1 — Set `main` as Default Branch (GitHub UI)
1. Go to **Settings → Branches** on GitHub
2. Under "Default branch", click the pencil icon
3. Select `main` from the dropdown
4. Click **Update** and confirm
5. Verify: `origin/HEAD` now points to `main`

### H2 — Enable Branch Protection on `main` (GitHub UI)
1. Go to **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - [x] **Require a pull request before merging** (minimum 1 approval, or 0 if solo)
   - [x] **Require status checks to pass** — select: `Security Audit`, `Type Check`, `Test (Node 18)`, `Test (Node 22)`, `Integration (web)`, `Integration (email)`, `Integration (wordpress)`
   - [x] **Require branches to be up to date before merging**
   - [x] **Do not allow bypassing the above settings**
4. Click **Create**

### H3 — Delete Remote Stale Branches (GitHub UI or CLI)
After H1 is done and CI is green on `main`, delete remote branches via **GitHub UI → Code → Branches**, or run locally (human approval required for each destructive remote operation):

```bash
# These are HUMAN commands — review the list before running
git push origin --delete \
  develop \
  next \
  master \
  chore/v1.1.5 \
  chore/v1.1.6 \
  feat/email-compatibility-77 \
  feat/wordpress-php-port \
  feature/email-template \
  feature/housekeeping-remove-legacy-files \
  feature/phase1-ai-ready \
  feature/phase1-changelog \
  feature/phase1-release-v0.1.1 \
  feature/phase1-security-audit \
  feature/phase2-task1-scaffold-setup \
  feature/phase2-task10-final-release \
  feature/phase2-task2-scaffold-tdd \
  feature/phase2-task3-cli-tdd \
  feature/phase2-task4-bin-create \
  feature/phase2-task5-templates \
  feature/phase2-task6-coverage \
  feature/phase2-tasks7-9-release-prep \
  feature/v1.1.0-release \
  feature/wordpress-template \
  fix/package-json-and-publish-auth \
  fix/publish-debug-npmrc \
  fix/publish-node22 \
  fix/publish-oidc-fetch-jwt \
  fix/publish-oidc-no-registry-url \
  fix/publish-strip-empty-auth-token \
  fix/publish-upgrade-npm-oidc \
  fix/publish-workflow-provenance \
  fix/security-htmlmin \
  fix/security-imagemin \
  fix/v1.1.1-publish-hotfix \
  fix/v1.1.2-publish-trigger \
  fix/v1.1.3-debug-trigger \
  fix/v1.1.4-oidc-trigger \
  phase3/template-quality \
  release/0.1.0
```

> ⚠️ **Before deleting `master`:** Confirm Task 1 (the unique master commit inspection) showed only pre-rewrite legacy content.

### H4 — Delete Local `develop` Branch
After H1 and H3 are complete:
```bash
git branch -d develop
git remote prune origin
```

### H5 — Verify npm Trusted Publisher on npmjs.com
1. Log into **npmjs.com** → the `create-gulp-khup` package → **Settings → Trusted publishing**
2. Confirm the linked repository is `<owner>/gulp-khup`
3. Confirm there is no branch restriction set (or update it if it says `develop`)
4. The `publish.yml` workflow is tag-triggered (`on: release: published`) — no branch filter. This is correct.

### H6 — Update Dependabot Target Branch
`dependabot.yml` has no explicit `target-branch` — Dependabot automatically targets the repository default branch. Once H1 sets `main` as default, Dependabot PRs will automatically target `main`. No file change needed.

### H7 — Tag Hygiene Review
Review the `readme` and `0.1.0` lightweight tags:
```bash
git tag --sort=version:refname
```
`readme` and `0.1.0` are non-semver legacy tags. They are harmless but could be deleted for cleanliness:
```bash
# Human decision — delete only if comfortable
git tag -d readme 0.1.0
git push origin --delete refs/tags/readme refs/tags/0.1.0
```

---

## Self-Review

**Spec coverage check:**
- [x] Branch audit inventory — Pre-Flight table
- [x] Unique master commit review — Task 1
- [x] `main` created from `develop` — Task 2
- [x] CI updated to `main` — Task 3
- [x] Agent files updated — Task 4
- [x] PR template updated — Task 5
- [x] AGENTS.md + copilot-instructions.md updated — Task 6
- [x] Local stale branches deleted — Task 7
- [x] All changes pushed, CI verified — Task 8
- [x] Human-only tasks documented — H1–H7
- [x] Nothing lost (`develop` kept locally until GitHub default is changed)

**Nothing is destructive on remote** until the human completes H1–H4. Local branch deletes in Task 7 are safe (`-d` flag respects merge status).
