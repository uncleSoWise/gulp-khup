# gulp-khup Phase 1: House Cleaning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `gulp-khup` to a clean, secure, AI-navigable baseline by resolving security alerts, publishing the first formal GitHub Release (`v0.1.1`), and adding all AI scaffolding — zero functional changes to gulp tasks.

**Architecture:** All work lands on `main`. No new features, no task changes, no test harness yet. This phase makes the repo safe, documented, and navigable so Phase 2 starts from solid ground.

**Tech Stack:** npm audit, git tags, GitHub Releases, GitHub Actions, GitHub MCP tools

---

## File Map

| Action | File |
|--------|------|
| Modify | `package.json` — safe dependency bumps only |
| Modify | `CHANGELOG.md` — close [Unreleased] as 0.1.1 |
| Create | `AGENTS.md` |
| Create | `.github/copilot-instructions.md` |
| Create | `.github/workflows/ci.yml` |
| Create | `.github/ISSUE_TEMPLATE/bug_report.md` |
| Create | `.github/ISSUE_TEMPLATE/feature_request.md` |
| Create | `.github/PULL_REQUEST_TEMPLATE.md` |
| Create | `.github/dependabot.yml` |
| Create | `TODO.md` |

---

### Task 1: Install Dependencies and Audit Security

**Files:**
- Modify: `package.json` (dependency version bumps from audit fix)

- [ ] **Step 1: Install dependencies**

The `node_modules` directory is absent. Run:

```bash
cd /path/to/gulp-khup
npm install
```

Expected: packages install, you will see npm warnings about deprecated packages — that is expected and fine.

- [ ] **Step 2: Run the full audit**

```bash
npm audit
```

Note the following confirmed vulnerabilities present at plan-writing time:

| Package | Severity | Advisory |
|---------|----------|----------|
| `@babel/traverse <7.23.2` | **Critical** | GHSA-67hx-6x53-jw92 — arbitrary code execution |
| `@babel/core <=7.29.0` | High | GHSA-4x5r-pxfx-6jf8 — arbitrary file read via sourceMappingURL |
| `@babel/helpers <7.26.10` | Moderate | GHSA-968p-4wvh-cqc8 — ReDoS in named capturing groups |
| `acorn 5.5–6.4` | High | GHSA-6chw-6frg-f759 — ReDoS |
| `ajv <=6.12.6` | Moderate | GHSA-v88g-cgmw-v5xw — Prototype Pollution |

- [ ] **Step 3: Apply non-breaking security fixes**

```bash
npm audit fix
```

Expected output ends with: `N vulnerabilities fixed`. Verify no tasks are broken by checking the fix was only to `@babel/*` and transitive deps.

- [ ] **Step 4: Verify no critical or high vulnerabilities remain**

```bash
npm audit --audit-level=high
```

Expected: exit code 0 (no high/critical vulns). If any remain that `audit fix` couldn't resolve, document them as Phase 2 items — do NOT use `--force`.

- [ ] **Step 5: Commit the lockfile and any package.json changes**

```bash
git add package.json package-lock.json
git commit -m "fix: resolve npm audit security vulnerabilities"
```

---

### Task 2: Update CHANGELOG.md

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Close the [Unreleased] section as 0.1.1**

Replace the top of `CHANGELOG.md` so the `[Unreleased]` block becomes `[0.1.1]`. The new top of the file should read:

```markdown
# gulp-khup | Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [Unreleased]

## [0.1.1] - 2026-07-15

### Added

-   `.browserlistrc`
-   `.prettierrc` and `.prettierignore`
-   `/gulp/commandLineArguments.js` to fetch CLI arguments
-   eslint task
-   lint task
-   prettier task
-   sasslint task
-   nunjucks task
-   gulp-nunjucks package
-   marked package
-   nunjucks package
-   nunjucks-markdown package
-   through2 package
-   babelify package

### Changed

-   moved configuration settings from `/gulp/config.js` to their singular file
    homes
-   `gulp`, `gulp deploy`, `gulp psi` and `gulp watch` all rely on CLI arguments
    rather than `gulpflow` config file settings
-   minification is managed via command line arguments and there are no longer
    `.min` files output
-   disable file minification with `--nomin` command line argument
-   enable sourcemaps for `gulp js` and `gulp css` with `--nomin` command line
    argument
-   update `gulp js` to use `babelify` to allow for ES6 style authoring `import`
-   remove `gulp-cache` from html and js tasks

### Fixed

-   sasslint task now uses `gulp-sass-lint` and pipeline configuration correctly
-   files made for inline during `gulp css` are now correctly prefixed `.inline`
    rather than renaming all files to `inline.css` which is very confusing with
    multiple theme files
-   resolved critical and high npm security vulnerabilities (GHSA-67hx-6x53-jw92,
    GHSA-4x5r-pxfx-6jf8, GHSA-6chw-6frg-f759)

### Removed

-   `/gulp/config.js` in favor of CLI arguments
-   mustache task
-   csscomb package
-   gulp-util package
-   gulp-mustache package

## [0.1.0] - 2017-10-25
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: close [Unreleased] as v0.1.1 in CHANGELOG"
```

---

### Task 3: Create AGENTS.md

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Create the file with this exact content**

```markdown
# AGENTS.md

Instructions for AI agents contributing to this repository.

## Repository Overview

**gulp-khup** is a Gulp 4 gulpsheet (starter template) for static marketing/agency site
projects. It is being modernized into a `create-gulp-khup` npm scaffolder — see `TODO.md`
and `docs/superpowers/specs/` for the full roadmap.

## Current Architecture (v0.1.1)

```
gulpfile.babel.js         # Entry point — registers all gulp tasks via @babel/register
gulp/
  commandLineArguments.js # CLI flag parsing: --nomin, --nobs, --ftp, --sftp, --url
  errorHandler.js         # Common plumber error handler — prevents watch crashes
  globs.js                # All file path globs (single source of truth for paths)
  tasks/
    build.js              # Series: clean → nunjucks → css → js → img → static → html
    clean.js              # Deletes /dist/
    css.js                # SCSS → CSS → autoprefixer → pxtorem → base64 → cssnano
    default.js            # Series: build → watch
    deploy.js             # FTP/SFTP deployment via vinyl-ftp / gulp-sftp
    eslint.js             # ESLint on JS source files
    html.js               # Copy + minify HTML from /src/
    img.js                # Compress images with gulp-imagemin
    inline.js             # Inline critical CSS/JS into HTML
    js.js                 # Browserify + Babel ES6 → ES5 → uglify
    lint.js               # Series: eslint + sasslint
    nunjucks.js           # Render Nunjucks templates from /src/templates/
    prettier.js           # Run Prettier on source files
    psi.js                # PageSpeed Insights test (requires --url flag)
    sasslint.js           # Sass linting via gulp-sass-lint
    size.js               # Report /dist/ output sizes
    static.js             # Copy static files (fonts, etc.) to /dist/
    watch.js              # BrowserSync dev server + file watching
```

## Key Commands

```bash
npm install              # Install all dependencies
gulp                     # Default: build + watch (full workflow zen)
gulp build               # Full build only
gulp watch               # Watch only (project must already be built)
gulp css                 # CSS pipeline only
gulp js                  # JS pipeline only
gulp img                 # Image optimisation only
gulp lint                # Run eslint + sasslint
gulp deploy --ftp        # Deploy via FTP (requires .env)
gulp deploy --sftp       # Deploy via SFTP (requires .env)
gulp psi --url "https://example.com"  # PageSpeed Insights
gulp --nomin             # Build with sourcemaps, no minification
gulp --nobs              # Build without starting BrowserSync
```

## Conventions

- **ES modules via Babel** — all `gulp/` files use `import`/`export` compiled by `@babel/register`
- **Globs** — ALL file paths live in `gulp/globs.js`; never hardcode paths in task files
- **Error handling** — all `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- **CLI arguments** — task behavior is controlled exclusively via `commandLineArguments.js` flags
- **Commit style** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## Active Roadmap

See `TODO.md` for Phase 2 work items with GitHub Issue links.
See `docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md` for the full design.

Phase 2 transforms this gulpsheet into a `create-gulp-khup` npm scaffolder with:
- Gulp 5, esbuild, Dart Sass, Biome
- `npm create gulp-khup@latest my-project` CLI
- Full Vitest test suite
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md for AI agent guidance"
```

---

### Task 4: Create .github/copilot-instructions.md

**Files:**
- Create: `.github/copilot-instructions.md`

- [ ] **Step 1: Create the .github directory and file**

```bash
mkdir -p .github
```

Create `.github/copilot-instructions.md` with this content:

```markdown
# Copilot Instructions for gulp-khup

## What This Repo Is
gulp-khup is a Gulp 4 gulpsheet being modernized into a `create-gulp-khup` npm scaffolder.
See `AGENTS.md` for architecture, `TODO.md` for roadmap, and
`docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md` for the full design.

## Gulp Task File Pattern

Every file in `gulp/tasks/` follows this exact structure:

```js
// -------------------------------------
//   Task: taskName
// -------------------------------------
//
// - describe what this task does
//
// -------------------------------------

import dependency from 'package';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import commandLineArguments from '../commandLineArguments';
import errorHandler from '../errorHandler';
import globs from '../globs';

const taskName = () => {
  return gulp
    .src(globs.to.someGlob)
    .pipe(plumber(errorHandler))
    // ... pipeline steps
    .pipe(gulp.dest(globs.to.dist));
};

export default taskName;
```

## Hard Rules

- **All paths via `globs.js`** — never hardcode `/src/`, `/dist/`, or any file path in a task file
- **All pipelines use `plumber(errorHandler)`** — without this, a compile error kills the watch
- **CLI flags from `commandLineArguments.js`** — never read `process.argv` directly in tasks
- **No `require()`** — this codebase is ESM-via-Babel; use `import` throughout
- **No breaking dep bumps in Phase 1** — security fixes only via `npm audit fix`

## Phase 2 Conventions (for `next` branch work)

When working on Phase 2 (the scaffolder), the module system changes to native ESM
(`"type": "module"` in package.json). Conventions shift:

- `@clack/prompts` for all interactive CLI prompts — no `readline` or `inquirer`
- `fs/promises` (built-in) for all file operations — no `fs-extra`
- Template files use `.tpl` extension with `<%= tokenName %>` substitution syntax
- Vitest for all tests — write failing test first, then implement

## Dependency Constraints

Phase 1 (current `main`): Do NOT bump Gulp past 4.x, do NOT add ESM-only packages.
Phase 2 (`next` branch): Full modernisation — Gulp 5, esbuild, Biome, Dart Sass.

## PR Requirements

- `npm install && gulp build` must complete without errors
- `npm audit --audit-level=high` must exit 0
- CHANGELOG.md updated for any user-facing change
- Phase 2 PRs additionally require: all Vitest tests pass, coverage must not drop
```

- [ ] **Step 2: Commit**

```bash
git add .github/copilot-instructions.md
git commit -m "docs: add .github/copilot-instructions.md"
```

---

### Task 5: Create CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the file**

Create `.github/workflows/ci.yml` with this content:

```yaml
name: CI

on:
  push:
    branches: [main, next]
  pull_request:
    branches: [main, next]

jobs:
  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level=high

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: audit
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        # Note: `npm test` is a no-op in Phase 1 (no test suite yet).
        # This job will be meaningful after Phase 2 adds Vitest.
```

- [ ] **Step 2: Add a placeholder test script to package.json**

The CI `npm test` step needs something to run. Add a `test` script to `package.json` that exits 0 (no-op for Phase 1):

In `package.json`, add to the `"scripts"` object:

```json
"scripts": {
  "prettier": "prettier --write **/*",
  "test": "echo \"No tests yet — see TODO.md for Phase 2\" && exit 0"
}
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci: add GitHub Actions CI workflow with security audit"
```

---

### Task 6: Create Issue Templates and PR Template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Create bug report template**

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Something is broken in a generated project or in the scaffolder itself
title: 'bug: '
labels: bug
assignees: ''
---

## Describe the Bug

A clear description of what is broken.

## Steps to Reproduce

1. Run `npm create gulp-khup@latest my-project` (or clone and run `gulp <task>`)
2. ...
3. See error

## Expected Behavior

What should have happened.

## Actual Behavior

What actually happened. Include the full error output:

```
paste error here
```

## Environment

- Node version: (run `node --version`)
- npm version: (run `npm version`)
- OS: (macOS / Linux / Windows)
- gulp-khup version: (run `npm list create-gulp-khup` or check package.json)
- Project type: (Static HTML / WordPress / Email)
```

- [ ] **Step 2: Create feature request template**

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest a new gulp task, project type, CLI option, or improvement
title: 'feat: '
labels: enhancement
assignees: ''
---

## Summary

One sentence describing what you want.

## Motivation

Why is this needed? What problem does it solve?

## Proposed Solution

How should it work? Include example usage if helpful:

```bash
npm create gulp-khup@latest my-project --type wordpress
```

## Alternatives Considered

What other approaches did you consider?

## Additional Context

Any links, screenshots, or related issues.
```

- [ ] **Step 3: Create PR template**

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What This PR Does

<!-- One sentence summary -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to break)
- [ ] Dependency update
- [ ] Documentation / chore

## Checklist

- [ ] `npm install && gulp build` completes without errors (Phase 1)
- [ ] `npm audit --audit-level=high` exits 0
- [ ] CHANGELOG.md updated (if user-facing change)
- [ ] All Vitest tests pass: `npm test` (Phase 2+)
- [ ] Coverage did not decrease: `npm run test:coverage` (Phase 2+)
- [ ] Self-reviewed for hardcoded paths (use `globs.js` instead)
- [ ] Self-reviewed for missing `plumber(errorHandler)` in any new gulp pipeline

## Related Issues

Closes #
```

- [ ] **Step 4: Commit**

```bash
git add .github/ISSUE_TEMPLATE/ .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: add GitHub issue templates and PR template"
```

---

### Task 7: Create Dependabot Configuration

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Create the file**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"
```

- [ ] **Step 2: Commit**

```bash
git add .github/dependabot.yml
git commit -m "chore: add Dependabot configuration for weekly updates"
```

---

### Task 8: Create TODO.md

**Files:**
- Create: `TODO.md`

- [ ] **Step 1: Create the file**

Create `TODO.md` at the repo root:

```markdown
# TODO

Phase 2 work items for the `create-gulp-khup` modernization. See
[`docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md`](docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md)
for the full design.

All Phase 2 work happens on the `next` branch. See
[`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md`](docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md)
for the step-by-step implementation plan.

---

## Phase 2: create-gulp-khup Scaffolder

### Scaffolder CLI
<!-- Issue link will be added after GitHub Issues are created -->
Build `bin/create.js` + `src/cli.js` — the `npm create gulp-khup@latest` entry point
using `@clack/prompts` for interactive project setup.

### Template Suite (Gulp 5)
<!-- Issue link will be added after GitHub Issues are created -->
Port Gulp 5 task suite from the Archive (`generator-pnmg` v8.1.0): esbuild for JS,
Dart Sass, Biome for linting, PostCSS/cssnano, ssh2-sftp-client for deploy.

### Test Harness
<!-- Issue link will be added after GitHub Issues are created -->
Vitest test suite with maximum line coverage: scaffold output tests + CLI unit tests.
Tests gate the Phase 2 → `main` merge.

### Dependency Modernization
<!-- Issue link will be added after GitHub Issues are created -->
Resolve all remaining deprecated/deprecated packages that require breaking changes:
`gulp-sass` → Dart Sass, Browserify+Babel → esbuild, `vinyl-ftp`/`gulp-sftp` →
`ssh2-sftp-client`, `babel-eslint` → `@babel/eslint-parser`, ESLint → Biome.

### npm Publish Workflow
<!-- Issue link will be added after GitHub Issues are created -->
GitHub Actions workflow triggered on release tag: runs tests, then `npm publish`.
Includes `package.json` changes: `private: false`, `bin` field, package name →
`create-gulp-khup`.

---

## Future (Phase 3+)

- WordPress project type
- Email project type
- `cosmiconfig` support for customizing globs (see Issue #18)
```

- [ ] **Step 2: Commit**

```bash
git add TODO.md
git commit -m "docs: add TODO.md with Phase 2 roadmap"
```

---

### Task 9: Create GitHub Issues for Phase 2 Work

**Files:**
- None (GitHub API operations)

Use the GitHub MCP tools or `gh` CLI. For each issue below, run the create command, then update `TODO.md` with the resulting issue number/link.

- [ ] **Step 1: Create issue — Scaffolder CLI**

```bash
gh issue create \
  --title "feat: build create-gulp-khup CLI entry point" \
  --body "Build \`bin/create.js\` and \`src/cli.js\` — the \`npm create gulp-khup@latest\` interactive CLI.

## Scope
- \`bin/create.js\` — entry point, parses optional positional project-name arg
- \`src/cli.js\` — \`@clack/prompts\` prompt flow: name, description, author, project type
- Input validation: empty name, path traversal, special characters
- Clean Ctrl+C handling (no stack trace)
- Git config defaults for author name/email

## Acceptance Criteria
- \`node bin/create.js my-project\` runs the prompt flow
- All CLI unit tests pass (see test plan)
- See: \`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md\`" \
  --label "enhancement"
```

- [ ] **Step 2: Create issue — Template Suite**

```bash
gh issue create \
  --title "feat: port Gulp 5 template suite from Archive" \
  --body "Port the Gulp 5 task suite from the local Archive (\`generator-pnmg\` v8.1.0) into \`templates/\`.

## Scope
- \`templates/base/\` — shared tasks: build, clean, css, deploy, html, img, inline, js, nunjucks, psi, size, static, watch
- \`templates/web/\` — Static HTML project scaffold (\`src/\` structure)
- \`templates/wordpress/\` and \`templates/email/\` — stubs only (coming soon)
- Modernized stack: Gulp 5, esbuild, Dart Sass (\`gulp-sass\` v6 + \`sass\`), Biome, PostCSS+cssnano, \`ssh2-sftp-client\`

## Acceptance Criteria
- Generated project: \`cd output && npm install && gulp build\` runs without errors
- See: \`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md\`" \
  --label "enhancement"
```

- [ ] **Step 3: Create issue — Test Harness**

```bash
gh issue create \
  --title "feat: add Vitest test suite with maximum line coverage" \
  --body "Add a Vitest test suite covering all scaffold and CLI logic. Tests gate the Phase 2 → \`main\` merge.

## Scope
- \`test/scaffold.test.js\` — generated file existence, content, token substitution, snapshots, edge cases
- \`test/cli.test.js\` — argument parsing, validation, sanitization, git config defaults, cancellation
- \`vitest.config.js\` — v8 coverage, 100% line coverage target
- \`package.json\` scripts: \`test\`, \`test:coverage\`, \`test:watch\`

## Acceptance Criteria
- \`npm test\` passes with 100% line coverage
- All edge cases covered (empty name, path traversal, existing dir, missing templates)
- See: \`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md\`" \
  --label "enhancement"
```

- [ ] **Step 4: Create issue — Dependency Modernization**

```bash
gh issue create \
  --title "chore: modernize all deprecated dependencies to Gulp 5 stack" \
  --body "Replace all deprecated/abandoned packages with modern equivalents.

## Packages to Replace

| Old | New | Reason |
|-----|-----|--------|
| \`gulp ^4.0.2\` | \`gulp ^5.0.1\` | Latest stable |
| \`gulp-sass ^4\` (LibSass) | \`gulp-sass ^6\` + \`sass\` | LibSass deprecated |
| Browserify + Babel | esbuild | Speed, modern ESM support |
| ESLint + Prettier | Biome | Unified, faster |
| \`gulp-sass-lint\` | Stylelint | Maintained |
| \`vinyl-ftp\` + \`gulp-sftp\` | \`ssh2-sftp-client\` | Both deprecated/unmaintained |
| \`babel-eslint\` | \`@babel/eslint-parser\` | Deprecated |
| \`gulp-eslint ^6\` | \`gulp-eslint-new\` | \`gulp-eslint\` deprecated |
| \`psi\` | Evaluate/remove | Google PSI API changed |
| \`gulp-uglify\` | \`gulp-terser\` | Maintained, supports ESNext |

All replacements happen in the generated \`templates/\` — the scaffolder package itself has minimal deps.

## Acceptance Criteria
- \`npm audit --audit-level=high\` exits 0
- Generated project builds without warnings about deprecated packages
- See: \`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md\`" \
  --label "enhancement"
```

- [ ] **Step 5: Create issue — npm Publish Workflow**

```bash
gh issue create \
  --title "feat: add npm publish GitHub Actions workflow for v1.0.0" \
  --body "Configure the repository for npm publishing and add a GitHub Actions publish workflow.

## package.json Changes
- \`name\`: \`gulp-khup\` → \`create-gulp-khup\`
- \`private\`: remove (or set to \`false\`)
- \`bin\`: \`{ \"create-gulp-khup\": \"./bin/create.js\" }\`
- \`exports\`: \`\"./src/scaffold.js\"\`
- \`engines\`: \`{ \"node\": \">=18\" }\`
- \`type\`: \`\"module\"\`
- \`version\`: \`1.0.0\`

## Workflow
- \`.github/workflows/publish.yml\` — triggers on GitHub Release with tag \`v*\`
- Steps: checkout → setup-node with NPM_TOKEN → npm ci → npm test → npm publish

## Acceptance Criteria
- \`npm create gulp-khup@latest my-project\` works after publish
- See: \`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md\`" \
  --label "enhancement"
```

- [ ] **Step 6: Update TODO.md with issue numbers**

After creating each issue, note the issue numbers returned and replace the `<!-- Issue link will be added after GitHub Issues are created -->` comments in `TODO.md` with the actual links:

```markdown
### Scaffolder CLI
[Issue #N](https://github.com/uncleSoWise/gulp-khup/issues/N) — Build `bin/create.js` + `src/cli.js`...
```

- [ ] **Step 7: Commit TODO.md with issue links**

```bash
git add TODO.md
git commit -m "docs: add GitHub issue links to TODO.md"
```

---

### Task 10: Tag v0.1.1 and Create GitHub Release

**Files:**
- None (git and GitHub API operations)

- [ ] **Step 1: Verify the working tree is clean**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: Create and push the git tag**

```bash
git tag -a v0.1.1 -m "Release v0.1.1 — house cleaning, security fixes, AI scaffolding"
git push origin main
git push origin v0.1.1
```

- [ ] **Step 3: Create the GitHub Release**

Use the GitHub MCP `create_release` tool or `gh` CLI:

```bash
gh release create v0.1.1 \
  --title "v0.1.1 — House Cleaning & AI Scaffolding" \
  --notes "## What's Changed

### Security
- Resolved critical vulnerability: \`@babel/traverse\` arbitrary code execution (GHSA-67hx-6x53-jw92)
- Resolved high vulnerability: \`@babel/core\` arbitrary file read via sourceMappingURL (GHSA-4x5r-pxfx-6jf8)
- Resolved high vulnerability: ReDoS in \`acorn\` (GHSA-6chw-6frg-f759)
- Resolved moderate vulnerabilities in \`@babel/helpers\` and \`ajv\`

### Added
- \`AGENTS.md\` — AI agent guidance for contributors
- \`.github/copilot-instructions.md\` — coding conventions for AI-assisted development
- \`.github/workflows/ci.yml\` — GitHub Actions CI with security audit
- \`.github/ISSUE_TEMPLATE/\` — bug report and feature request templates
- \`.github/PULL_REQUEST_TEMPLATE.md\` — PR checklist
- \`.github/dependabot.yml\` — weekly dependency updates
- \`TODO.md\` — Phase 2 roadmap with GitHub Issue links
- \`docs/superpowers/specs/\` — modernization design document

### Changed
- \`CHANGELOG.md\` properly closed [Unreleased] as 0.1.1

**Full Changelog**: https://github.com/uncleSoWise/gulp-khup/compare/0.1.0...v0.1.1"
```

- [ ] **Step 4: Verify CI passes**

Visit `https://github.com/uncleSoWise/gulp-khup/actions` and confirm the CI workflow run triggered by the push to `main` shows green.

---

## Done

Phase 1 is complete when:
- [ ] `npm audit --audit-level=high` exits 0
- [ ] GitHub Release `v0.1.1` exists at `https://github.com/uncleSoWise/gulp-khup/releases`
- [ ] `AGENTS.md`, `.github/copilot-instructions.md`, `.github/workflows/ci.yml`, issue templates, PR template, and `dependabot.yml` all exist and are accurate
- [ ] `TODO.md` exists with 5 GitHub Issue links
- [ ] CI is green on `main`

Next: execute `docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md`
