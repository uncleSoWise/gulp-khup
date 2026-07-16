# AGENTS.md

Instructions for AI agents contributing to this repository.

## Repository Overview

**create-gulp-khup** (repo: `gulp-khup`) is a `create-*` npm scaffolder that generates
Gulp 5 static-site projects. Run `npm create gulp-khup@latest my-project` to scaffold.

## Architecture

```
bin/
  create.js              # CLI entry point — parses args, calls cli.js + scaffold.js
src/
  cli.js                 # @clack/prompts prompt flow + input validation
  scaffold.js            # Template file copying + <%= token %> substitution
templates/
  base/                  # Shared Gulp 5 task suite (all project types)
    gulpfile.js
    package.json.tpl     # Tokens: appName, appDescription, appVersion, authorName, authorEmail
    README.md.tpl        # Tokens: appName, appDescription, authorName
    CHANGELOG.md.tpl     # Tokens: appName, year
    gulp/tasks/          # build, clean, css, deploy, html, img, inline, nunjucks, size, static, watch
  web/                   # Static HTML project additions
    gulp/tasks/          # deploy.js, js.js, psi.js
    src/                 # scss/, js/, img/, fonts/, .njk templates
  wordpress/             # Stub — coming soon
  email/                 # Stub — coming soon
test/
  package.test.js        # Validates create-gulp-khup package.json structure
  scaffold.test.js       # Generated file existence, content, token substitution, snapshots
  scaffold-errors.test.js # Error re-throw paths: non-EEXIST mkdir, non-ENOENT readdir
  cli.test.js            # validateProjectName, sanitizeProjectName, getGitConfig
  cli-prompt.test.js     # promptUser mocked with @clack/prompts
  bin.test.js            # Structural assertions on bin/create.js
```

## Key Commands

```bash
npm install                    # Install scaffolder dependencies
npm test                       # Run Vitest (78 tests, 0 skipped)
npm run test:coverage          # Run with v8 coverage — src/ must be 100%
npm run test:watch             # Watch mode for TDD
node bin/create.js my-project  # Run the scaffolder locally
```

## Conventions

- **ESM throughout** — `"type": "module"`, all files use `import`/`export`
- **No build step** — source is published as-is
- **Template tokens** — `.tpl` files use `<%= tokenName %>` syntax (camelCase)
- **One runtime dep** — only `@clack/prompts`; use Node.js built-ins for everything else
- **Commit style** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

## Testing Rules

- Framework: Vitest
- Coverage: 100% lines/branches/functions/statements on `src/**/*.js` (enforced in CI)
- Write failing test FIRST (TDD) — then implement minimally to pass
- Scaffold tests: use `mkdtemp` + `afterEach` cleanup; never leave temp dirs behind
- Use `_templatesDir` parameter in scaffold() to test with custom template directories
- Mock `@clack/prompts` in `cli-prompt.test.js` for promptUser tests
- `bin/create.js` is tested structurally only — interactive behaviour via smoke test

## Template Conventions (Generated Projects)

When editing files inside `templates/`:
- Gulp 5 tasks: `export default taskFn` — no `gulp.task('name', fn)` string form
- All file paths from `globs.js` — never hardcode `/src/` or `/dist/` in task files
- All `gulp.src()` pipelines must use `.pipe(plumber(errorHandler))`
- JS: esbuild (not Browserify)
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Linting: Biome (not ESLint/Prettier)

## Roadmap

See `TODO.md` and `docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md`.
