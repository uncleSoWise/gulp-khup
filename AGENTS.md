# AGENTS.md

Instructions for AI agents contributing to this repository.

## Repository Overview

**create-gulp-khup** (package: `create-gulp-khup`, repo: `gulp-khup`) is a `create-*` npm scaffolder.  
Run `npm create gulp-khup@latest my-project` to scaffold one of three project types:

| Type | What it generates |
|------|------------------|
| `web` | Static HTML / marketing site — Nunjucks, Dart Sass, esbuild, BrowserSync, SFTP |
| `wordpress` | Complete PHP theme — functions.php, templates, theme.json, block patterns, Gulp asset pipeline |
| `email` | Campaign Monitor HTML email suite — Nunjucks partials, CSS inlining, table-based layout |

---

## Architecture

```
bin/
  create.js              # CLI entry — parses args, calls promptUser + scaffold
src/
  cli.js                 # @clack/prompts prompt flow + input validation
  scaffold.js            # Template merging + <%= token %> substitution
templates/
  base/                  # Shared assets — all project types inherit this
    gulpfile.js
    package.json.tpl
    README.md.tpl
    CHANGELOG.md.tpl
    gulp/
      globs.js
      commandLineArguments.js
      errorHandler.js
      tasks/             # build, clean, css, deploy (SFTP-only), html, img, inline,
                         # nunjucks, size, static, watch
  web/                   # Overrides + additions for static HTML projects
    gulp/tasks/          # deploy.js (web-specific SFTP globs), js.js
    src/                 # scss/, js/lib/, img/, fonts/, *.njk.tpl templates
  wordpress/             # Complete WordPress theme boilerplate
    gulp/tasks/          # build.js, deploy.js, watch.js
    src/                 # style.css.tpl, theme.json, functions.php, functions/,
                         # *.php.tpl templates, inc/, patterns/hero.php.tpl
  email/                 # Campaign Monitor HTML email template suite
    gulp/tasks/          # build.js, inline.js, watch.js
    src/                 # _layout.njk, index.njk, inc/_css.njk, inc/layout/*.njk
test/
  scaffold.test.js       # File existence, content, token substitution, snapshots (130 tests)
  scaffold-errors.test.js
  cli.test.js
  cli-prompt.test.js
  bin.test.js
  package.test.js
.github/
  workflows/
    ci.yml               # audit → test (100% coverage) → integration (scaffold + gulp build)
    publish.yml          # Publishes to npm on release tag (OIDC trusted publishing)
```

---

## Scaffold Tokens

All tokens are substituted into `.tpl` files via `src/scaffold.js`. Non-`.tpl` files are copied verbatim.

| Token | Value | Used in |
|-------|-------|---------|
| `appName` | Project name as entered | All types |
| `appSlug` | `appName` with `-` → `_` (PHP-safe) | WordPress PHP function prefix |
| `appDescription` | Short description | All types |
| `authorName` | From `git config user.name` | All types |
| `authorEmail` | From `git config user.email` | All types |
| `appVersion` | `0.1.0` | All types |
| `year` | Current year | CHANGELOG |
| `inSubFolder` | `''` (empty) | Web Nunjucks template paths |

`.tpl` file → output file: `config.php.tpl` → `config.php`, `package.json.tpl` → `package.json`.

---

## Key Commands

```bash
npm install                    # Install scaffolder dependencies
npm test                       # Run Vitest (130 tests, 0 skipped)
npm run test:coverage          # Run with v8 coverage — src/ must be 100%
npm run test:watch             # Watch mode for TDD
node bin/create.js my-project  # Run the scaffolder locally
```

---

## CI Pipeline

Four job groups run in parallel — `audit`, `typecheck`, and `test` are independent; `integration` runs after `test`.

- **audit** — `npm audit --audit-level=critical` (fails the pipeline on critical CVEs)
- **typecheck** — `tsc --project jsconfig.json --noEmit` (enforces JSDoc type annotations)
- **test** — Vitest + 100% line/branch/function/statement coverage on `src/` (matrix: Node 18 + Node 22)
- **integration** — Scaffolds `web`, `email`, and `wordpress` projects, runs `npm install`, then `npx gulp build` (matrix across all 3 types, runs on Node 22)

---

## Conventions

- **ESM throughout** — `"type": "module"`, all files use `import`/`export`
- **No build step** — source is published as-is
- **One runtime dep** — only `@clack/prompts`; use Node.js built-ins elsewhere
- **Commit style** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- **TDD discipline** — write failing test first, then minimal implementation to pass

---

## Testing Rules

- Framework: Vitest
- Coverage: 100% lines/branches/functions/statements on `src/**/*.js` (enforced in CI)
- Write failing test FIRST (TDD) — then implement minimally to pass
- Scaffold tests: use `mkdtemp` + `afterEach` cleanup; never leave temp dirs behind
- Use `_templatesDir` parameter in `scaffold()` to test with custom template directories
- Mock `@clack/prompts` in `cli-prompt.test.js` for `promptUser` tests
- `bin/create.js` is tested structurally only — interactive behaviour via CI smoke test
- Snapshot tests exist for `gulpfile.js` and `package.json` — run `vitest run -u` to update

---

## Template Conventions

### All project types

- Gulp 5 tasks: `export default taskFn` — no `gulp.task('name', fn)` string form
- All file paths via `globs.js` — never hardcode `/src/` or `/dist/` in task files
- All `gulp.src()` pipelines must use `.pipe(plumber(errorHandler))`
- Linting: **Biome** (not ESLint/Prettier) — no `eslint-disable` comments in templates
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Images: `sharp` (JPEG/PNG/WebP/AVIF) + `svgo` (SVG) — not `gulp-imagemin`
- HTML minification: `html-minifier-terser` — not `gulp-htmlmin`
- Deploy: SFTP only via `ssh2-sftp-client` — FTP (`vinyl-ftp`) was removed

### WordPress type

- PHP files with `<%= %>` tokens must have `.php.tpl` extension so scaffold.js processes them
- PHP function prefix uses `appSlug` token (`my-theme` → `my_theme_`)
- All ACF calls must be guarded: `if (function_exists('get_field')) { ... }`
- PHP files live in `src/` — the static task (`staticGlobs` handles `**/*.php`) copies them to `dist/` for SFTP deployment
- `theme.json` and `patterns/*.php` also live in `src/` — same mechanism (`**/*.json`, `**/*.php`)
- `functions/walkers/Walker_Nav_Menu_Custom.php` has no tokens — `.php` not `.php.tpl`

### Email type

- Templates are Campaign Monitor HTML emails — **not** generic email templates
- Campaign Monitor merge tags used throughout — do **not** replace with static text:
  - `<currentyear>` — current year
  - `<webversion>` — web version link
  - `<unsubscribe>` — unsubscribe link
  - `<singleline label="...">` — editable text regions
- `@media` queries in `_css.njk` are stripped by Gmail — this is expected and documented
- `gulp-inline-css` runs after Nunjucks render to inline all `<style>` block CSS
- Content width hardcoded at `560px`, gutter at `20px` (Archive defaults)

---

## Roadmap

See `TODO.md`. All Phase 3 and Phase 4 issues are closed. No open GitHub issues.

