# create-gulp-khup | Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [Unreleased]

## [1.3.1] - 2026-07-17

### Fixed

- Email project type: synced `package.json.tpl` with base — `gulp build` was broken due to missing deps (#77)
- Email `_css.njk`: fixed `@media only screen and (max-width: 560)` → `560px` (missing unit; query never fired)
- Documented Campaign Monitor merge tags (`<currentyear>`, `<webversion>`, `<unsubscribe>`, `<singleline>`) in email templates (#77)

## [1.3.0] - 2026-07-17

### Added

- WordPress project type: full PHP theme boilerplate ported from Archive (#76)
  - `functions.php` + 6 sub-modules (`config`, `gutenberg`, `plugins`, `search`, `utils`, custom nav walker)
  - PHP templates: `header`, `footer`, `index`, `page`, `single`, `404`, `inc/loop`, `inc/loop-search`
  - `style.css` — WordPress theme header (`Theme Name`, `Text Domain`, `Version`)
  - `theme.json` — WP 6.0+ Global Styles (colour palette, typography scale, spacing)
  - `patterns/hero.php` — native WP 6.0+ block pattern, auto-discovered (no registration needed)
  - New `appSlug` scaffold token (dashes → underscores) used as PHP function prefix
  - All ACF calls guarded with `function_exists()` — theme works without ACF Pro
  - `wp_enqueue_scripts` hook (Archive bug fixed: was incorrectly using `wp_footer`/`init`)

## [1.2.1] - 2026-07-17

### Fixed

- Replaced `gulp-htmlmin` with `html-minifier-terser` in `html.js` and `nunjucks.js` (#80)
  - Generated web project now has 0 critical, 0 high vulnerabilities (5 moderate only)
  - `html-minifier-terser` is the actively maintained fork of the unmaintained `html-minifier`

## [1.2.0] - 2026-07-17

### Fixed

- Resolved unsubstituted EJS tokens in web/email templates blocking `gulp build` (#27)
  - Renamed `_layout.njk`, `index.njk`, `inc/_meta.njk` to `.njk.tpl` so scaffold token substitution runs
  - Added `inSubFolder: ''` to scaffold.js tokens map
  - Fixed normalize.css path in `_reset.scss`: `../../../../../` → `../../../`
  - Hardcoded email template EJS expressions to Archive defaults (contentWidth=560, gutterWidth=20, etc.)
  - Removed `<%= prototypePath %>` from `globs.js`; replaced with `dist`/`src` variable references
- Removed vestigial `/* eslint-disable */` comments from all template task files — generated projects use Biome (#71)
- Removed deprecated `psi` task (Google PSI v2 API is retired) from gulpfile and `package.json` (#72)
- Replaced `vinyl-ftp` with SFTP-only deploy; removed FTP path from `deploy.js` and `watch.js` (#73)
- Replaced `gulp-imagemin` binary-downloader chain with `sharp` + `svgo` (#74)
  - Generated project vulnerabilities: 57 (10 critical) → 7 (0 critical)
  - Added `overrides` for `lodash.template`, `nth-check`, `terser`, `uuid`; bumped `postcss` to `^8.5.10`
- Added CI integration smoke test job: scaffold → `npm install` → `gulp build` (#75)

## [1.1.6] - 2026-07-16

### Fixed

- Publish workflow: bump runner to Node 22. `npm@latest` is now v12 which
  requires Node >=22; the Node 20 runner failed with `EBADENGINE`. Node 22
  (current LTS) ships a modern npm with native OIDC trusted-publishing support.

## [1.1.5] - 2026-07-16

### Fixed

- Publish workflow: upgrade npm to 11.5.1+ (`npm install -g npm@latest`) so the
  runner has native OIDC trusted-publishing support. Node 20 ships npm 10.x,
  which cannot perform the OIDC token exchange — the true root cause of the
  earlier publish failures. Removed `registry-url`, `NODE_AUTH_TOKEN`, and the
  manual JWT fetch; modern npm authenticates automatically via the linked
  publisher on npmjs.com.

## [1.1.4] - 2026-07-16

### Fixed

- Publish workflow: attempted manual OIDC JWT fetch (superseded by 1.1.5)

## [1.1.3] - 2026-07-16

### Fixed

- Publish workflow: debug run to diagnose OIDC trusted publishing failure

## [1.1.2] - 2026-07-16

### Fixed

- Publish workflow: restore `registry-url` in `setup-node` but strip the empty
  `_authToken` line before publishing — enables npm OIDC trusted publishing by
  ensuring npm has registry config but no token, allowing OIDC fallback

## [1.1.1] - 2026-07-16

### Fixed

- Publish workflow: removed `registry-url` from `setup-node` to enable OIDC
  trusted publishing — `registry-url` was injecting an empty `_authToken` into
  `.npmrc` that blocked npm from detecting the OIDC environment
- `package.json`: normalized `bin` path and `repository.url` format via `npm pkg fix`

## [1.1.0] - 2026-07-16

### Added

- **Email project type** — `templates/email/` — full nunjucks email template scaffold
  with CSS inlining (`gulp-inline-css`), email-specific build/watch pipeline, 9 nunjucks
  content block partials (headline, one-col, two-col, three-col-image, etc.)
- **WordPress project type** — `templates/wordpress/` — WordPress theme development scaffold
  with BrowserSync proxy mode (`WP_URL`), deploy to `wp-content/themes/<name>/`,
  WP theme header in `theme.scss` (Theme Name, Author, Description, Version),
  full SCSS base (variables, mixins, typography), components, and Gutenberg editor support

### Changed

- Email and WordPress options in CLI no longer show "coming soon" hint — both are fully functional

### Removed

- Legacy gulpsheet root files (`gulpfile.babel.js`, `gulp/`, `.babelrc`, `.browserslistrc`,
  `.editorconfig`, `.eslintrc`, `.prettierignore`, `.prettierrc`) — removed as they were
  orphaned v0.x artifacts with no relevance to the scaffolder

### Fixed

- `.nvmrc` updated from `16` → `18` to reflect the scaffolder's actual Node requirement

## [1.0.0] - 2026-07-16

### Added

- `bin/create.js` — CLI entry point: `npm create gulp-khup@latest my-project`
- `src/cli.js` — interactive prompt flow via `@clack/prompts` with input validation
- `src/scaffold.js` — template file copying with `<%= token %>` substitution
- `templates/base/` — Gulp 5 task suite: esbuild, Dart Sass, Biome, BrowserSync, ssh2-sftp-client
- `templates/web/` — Static HTML project scaffold with full `src/` directory structure
- Vitest test suite: 78 tests, 100% `src/` line/branch/function/statement coverage
- GitHub Actions CI workflow with coverage enforcement
- GitHub Actions npm publish workflow (triggered on GitHub Release)
- `AGENTS.md` — AI agent guidance for the Phase 2 architecture
- `.github/copilot-instructions.md` — coding conventions for the scaffolder

### Changed

- Package name: `gulp-khup` → `create-gulp-khup`
- Package is now public (`private` removed)
- Module system: Babel/CJS → native ESM (`"type": "module"`)
- JS bundling in generated projects: Browserify + Babel → esbuild
- CSS in generated projects: LibSass → Dart Sass
- Linting/formatting in generated projects: ESLint + Prettier → Biome
- Deploy in generated projects: `vinyl-ftp` + `gulp-sftp` → `ssh2-sftp-client`
- Node.js minimum: 18 (generated projects also target Node 18+)
- README rewritten for `npm create` usage

### Removed

- All legacy gulp-task dependencies from `package.json` (moved to `templates/base/package.json.tpl`)
- `gulpfile.babel.js` top-level entry point (replaced by `bin/create.js`)
- `.babelrc`, `.eslintrc`, `.browserslistrc`, `.prettierrc`, `.prettierignore` (legacy config)

## [0.1.1] - 2026-07-16

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
-   resolved critical `@babel/traverse` vulnerability GHSA-67hx-6x53-jw92
    (arbitrary code execution) via lockfile update
-   resolved high `@babel/core` vulnerability GHSA-4x5r-pxfx-6jf8
    (arbitrary file read via sourceMappingURL) via lockfile update
-   resolved high `acorn` vulnerability GHSA-6chw-6frg-f759 (ReDoS)
    via lockfile update
-   resolved 51 additional moderate/high transitive vulnerabilities via
    `npm audit fix`

### Known Issues

-   163 vulnerabilities remain; all require Phase 2 major-version dependency
    upgrades (gulp v5, browser-sync v3, gulp-sass v6, psi v4, gulp-imagemin v9)
-   `node-sass` does not compile on Node v18+; the stack requires
    `--ignore-scripts` on modern Node. Full remediation is Phase 2.

### Removed

-   `/gulp/config.js` in favor of CLI arguments
-   mustache task
-   csscomb package
-   gulp-util package
-   gulp-mustache package

## [0.1.0] - 2017-10-25

### Added

-   Repo config files
-   Gulp tasks, config, utils
-   Docs

## [0.0.0] - 2017-10-22

### Added

-   Repo initial commit
