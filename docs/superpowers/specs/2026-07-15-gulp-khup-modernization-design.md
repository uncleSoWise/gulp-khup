# gulp-khup Modernization Design

> **Status:** Approved — ready for implementation planning

## Overview

Transform `gulp-khup` from a 2017-era clone-and-modify gulpsheet into a modern, published `create-gulp-khup` npm scaffolder. The evolution happens in two phases: a house-cleaning pass on `main` followed by the scaffolder build on a `next` branch.

---

## Goals

- **AI-ready:** AGENTS.md, copilot-instructions, CI, issue templates, Dependabot
- **Secure:** Resolve all Dependabot alerts; establish ongoing security hygiene
- **Modern Gulp:** Upgrade to Gulp 5, esbuild, Dart Sass, Biome, ssh2-sftp-client
- **Proper npm package:** `npm create gulp-khup@latest` scaffolds a new static-site project
- **Tested:** Vitest test suite with maximum line coverage gates all major changes

---

## Constraints

- No functional changes to existing gulp tasks in Phase 1
- Tests must pass before Phase 2 merges to `main`
- WordPress and Email project types are stubbed but not implemented in v1.0.0
- Node.js minimum: 18

---

## Approach: `main` + `next` branch strategy

- **`main`** stays stable and releasable throughout; Phase 1 work lands here
- **`next`** is the scaffolder build branch; merges to `main` only when tests pass and v1.0.0 is ready

---

## Phase 1 — House Cleaning (target: `main`, release `v0.1.1`)

### 1.1 Security: Resolve Dependabot Alerts

Audit all dependencies for known vulnerabilities. Apply patch/minor bumps that do not change task behavior. Flag any requiring breaking changes as Phase 2 work items.

Known problem areas:
- `marked ^0.7.0` → already bumped to 4.0.10 by Dependabot; current is 15.x — Phase 2
- `gulp-sftp` → deprecated/unmaintained — Phase 2 replacement with ssh2-sftp-client
- `vinyl-ftp` → unmaintained — Phase 2
- `psi ^3.1.0` → Google PSI API changed — Phase 2 evaluation
- `gulp-sass ^4.0.2` → uses LibSass (deprecated) — Phase 2 Dart Sass upgrade
- `babel-eslint` → deprecated, replaced by `@babel/eslint-parser` — Phase 2
- `gulp-eslint ^6.0.0` → deprecated, replaced by `gulp-eslint-new` — Phase 2
- `gulp-imagemin ^6.0.0` → v7+ is ESM-only, major break — Phase 2

### 1.2 Tag v0.1.1 as First Formal GitHub Release

- Close the `[Unreleased]` section in `CHANGELOG.md` as `[0.1.1] - 2026-07-15`
- Create GitHub Release object (not just a bare git tag)
- Write release notes summarizing all changes since `0.1.0`

### 1.3 AI Scaffolding

Generate the following via the `ai-ready` skill:

| File | Purpose |
|------|---------|
| `AGENTS.md` | How AI agents contribute to this repo: task structure, conventions, commit style |
| `.github/copilot-instructions.md` | Coding patterns, gulpfile conventions, ES module style, template token format |
| `.github/workflows/ci.yml` | Lint + test on push/PR |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug report template |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist |
| `.github/dependabot.yml` | Weekly npm dependency updates |

### 1.4 TODO.md

Documents Phase 2 work items with links to GitHub Issues. Serves as the human-readable roadmap for contributors and AI agents.

### 1.5 GitHub Issues

One issue per major Phase 2 work item:
- Scaffolder CLI (`bin/create.js` + `src/cli.js`)
- Template suite (Gulp 5 task files from Archive)
- Test harness (Vitest scaffold + CLI tests)
- Dependency modernization (Gulp 5, esbuild, Biome, Dart Sass, ssh2-sftp-client)
- npm publish workflow (GitHub Actions)
- `package.json` conversion (`private: false`, `bin` field, `exports`)

### 1.6 Success Criteria for Phase 1

- Zero open Dependabot security alerts resolvable without breaking changes
- GitHub Release `v0.1.1` exists with proper release notes
- All AI scaffolding files present and accurate to codebase
- `TODO.md` present with GitHub Issue links
- `main` is pushable, CI passes

---

## Phase 2 — Scaffolder Build (target: `next` branch, release `v1.0.0`)

### 2.1 Repository Structure

```
gulp-khup/
  bin/
    create.js                  # CLI entry point — #!/usr/bin/env node
  src/
    cli.js                     # @clack/prompts interactive flow
    scaffold.js                # template copying + token substitution
  templates/
    base/                      # shared by all project types
      gulpfile.js
      package.json.tpl
      .gitignore
      .env.example
      CHANGELOG.md
      README.md.tpl
      gulp/
        commandLineArguments.js
        errorHandler.js
        globs.js
        tasks/
          build.js
          clean.js
          css.js
          default.js
          deploy.js
          html.js
          img.js
          inline.js
          js.js
          nunjucks.js
          psi.js
          size.js
          static.js
          watch.js
    web/                       # Static HTML — primary v1.0.0 target
      src/
        css/
        img/
        js/
        templates/
    wordpress/                 # stubbed — future
    email/                     # stubbed — future
  test/
    scaffold.test.js
    cli.test.js
  package.json                 # private: false, bin, exports, engines
  README.md                    # rewritten for create usage
  vitest.config.js
```

### 2.2 CLI Entry Point (`bin/create.js`)

- `#!/usr/bin/env node`
- Parses optional positional `project-name` argument
- Validates argument (non-empty, URL-safe characters, no path traversal)
- Calls `src/cli.js` with parsed args

### 2.3 Prompt Flow (`src/cli.js`)

Uses `@clack/prompts` for the interactive session:

```
◆ What is your project name? › my-project
◆ Short description? › A static marketing site  
◆ Author name? › [from git config user.name]
◆ Author email? › [from git config user.email]
◆ Project type? › ● Static HTML  ○ WordPress (coming soon)  ○ Email (coming soon)
◇ Scaffolding my-project...
✓ Done! Run: cd my-project && npm install && gulp
```

Cancellation (Ctrl+C) exits cleanly with a goodbye message (no stack trace).

### 2.4 Scaffold Logic (`src/scaffold.js`)

- Resolves template paths for the selected project type (`base/` merged with type-specific directory)
- Applies `<%= token %>` substitution on `.tpl` files (strips `.tpl` extension on output)
- Copies non-template files verbatim
- Handles existing output directory: prompts user to confirm overwrite or abort
- Optionally runs `npm install` after scaffolding (prompted)

### 2.5 Template Task Suite

Ported from the Archive (`generator-pnmg`) — already at Gulp 5:

| Concern | Old (gulp-khup) | New (templates) |
|---------|----------------|-----------------|
| Gulp version | 4.0.2 | 5.x |
| JS bundling | Browserify + Babel | esbuild |
| CSS | gulp-sass v4 (LibSass) | gulp-sass v6 + Dart Sass |
| Linting/formatting | ESLint + Prettier | Biome |
| Sass linting | gulp-sass-lint | Stylelint |
| Deploy | vinyl-ftp + gulp-sftp | ssh2-sftp-client |
| Module format | CJS via Babel | ESM (`"type": "module"`) |

### 2.6 `package.json` Changes

```json
{
  "name": "create-gulp-khup",
  "version": "1.0.0-beta.1",
  "private": false,
  "bin": {
    "create-gulp-khup": "./bin/create.js"
  },
  "exports": "./src/scaffold.js",
  "engines": {
    "node": ">=18"
  },
  "type": "module"
}
```

### 2.7 npm Publish Workflow

`.github/workflows/publish.yml` — triggers on GitHub Release tag (`v*`):
1. Run tests
2. On pass: `npm publish`

### 2.8 Success Criteria for Phase 2

- `npx create-gulp-khup@latest my-project` generates a complete, working project
- Generated project: `cd my-project && npm install && gulp` runs without errors
- All Vitest tests pass with maximum line coverage
- `next` merges cleanly to `main`
- GitHub Release `v1.0.0` created, package published to npm

---

## Phase 3 — Future (out of scope for this design)

- WordPress project type
- Email project type
- `cosmiconfig` support for customizing globs (open Issue #18)
- Plugin/hook system for task customization without forking

---

## Testing Strategy

### Tool: Vitest

Consistent with `ae-bootcamp-capstone`. ESM-native, fast, minimal config.

### Layer 1 — Scaffold Output Tests (`test/scaffold.test.js`)

Run the scaffolder against a temp directory. Assert on generated file existence, content, and token substitution. These are the highest-value tests.

**Coverage targets:**

```
scaffold.js — all code paths:
  ✓ scaffolds a Static HTML project — all base files present
  ✓ scaffolds a Static HTML project — all web/ files present
  ✓ does not scaffold wordpress-specific files for Static HTML type
  ✓ package.json: replaces <%= appName %>
  ✓ package.json: replaces <%= appDescription %>
  ✓ package.json: replaces <%= appVersion %>
  ✓ package.json: replaces <%= authorName %>
  ✓ package.json: replaces <%= authorEmail %>
  ✓ README.md: replaces <%= appName %>
  ✓ README.md: replaces <%= appDescription %>
  ✓ .tpl extension is stripped from output filename
  ✓ non-template files are copied verbatim
  ✓ handles existing output directory — user confirms overwrite
  ✓ handles existing output directory — user aborts
  ✓ handles missing template directory gracefully
  ✓ snapshot: generated package.json matches expected structure
  ✓ snapshot: generated gulpfile.js matches expected structure
  ✓ snapshot: generated gulp/tasks/css.js matches expected structure
```

### Layer 2 — CLI Unit Tests (`test/cli.test.js`)

Test prompt parsing and argument handling in isolation. No file I/O.

```
  ✓ uses positional arg as project name
  ✓ falls back to interactive prompt when no arg given
  ✓ sanitizes project name: converts spaces to hyphens
  ✓ sanitizes project name: lowercases
  ✓ rejects empty project name
  ✓ rejects path traversal in project name (../)
  ✓ rejects project name with special characters
  ✓ populates author name from git config
  ✓ populates author email from git config
  ✓ falls back gracefully when git config unavailable
  ✓ handles Ctrl+C cancellation cleanly — no stack trace
  ✓ defaults project type to Static HTML
```

### Coverage Target

Maximum line coverage. 100% is the goal; any exclusions must be explicitly documented with rationale.

### What is intentionally NOT tested

- Whether the generated project's gulp tasks build correctly — that is an integration concern for the generated project, not the scaffolder
- `npm install` execution — mocked

### CI Integration

Tests run on every push and PR via `.github/workflows/ci.yml`. Phase 2 → `main` merge is gated on all tests green and coverage meeting target.

---

## Key Dependencies (Phase 2 scaffolder package)

| Package | Purpose |
|---------|---------|
| `@clack/prompts` | Interactive CLI prompts |
| No others | Everything else is in the generated project's `package.json` |

---

## Reference: Archive (`generator-pnmg`)

Located at `/Archive/` in the workspace. Version `8.1.0`. Already implements Gulp 5 + esbuild + Biome + Dart Sass task suite. The `templates/all/` and `templates/web/` directories are the primary source for Phase 2 template files.
