# Copilot Instructions for create-gulp-khup

## What This Repo Is

`create-gulp-khup` (repo: `gulp-khup`) is a `create-*` npm scaffolder that generates
Gulp 5 static-site projects via `npm create gulp-khup@latest my-project`.

## Scaffolder Conventions

### Module System
- Native ESM (`"type": "module"`) — `import`/`export` everywhere, no `require()`
- No build step — `src/`, `bin/`, and `templates/` are published as-is

### Template Files
- Template files have `.tpl` extension in `templates/`
- Token syntax: `<%= tokenName %>` (camelCase names)
- Current tokens: `appName`, `appDescription`, `authorName`, `authorEmail`, `appVersion`, `year`
- Non-`.tpl` files are copied verbatim

### File Operations
- Use Node.js built-in `fs/promises` — do NOT add `fs-extra` or similar
- Use `mkdtemp` in tests for temp directories; always clean up in `afterEach`
- Use `_templatesDir` parameter in scaffold() to test with custom template directories

### Prompts
- Use `@clack/prompts` — do NOT use `inquirer`, `readline`, or `prompts`
- Ctrl+C must exit cleanly with a message, never a stack trace

## Testing Rules
- Vitest only — do NOT use Jest
- Write failing test FIRST (TDD)
- `src/**/*.js` requires 100% coverage (enforced in CI via `npm run test:coverage`)
- Any exclusion from thresholds requires a comment in vitest.config.js with rationale
- Scaffold tests: use `mkdtemp` + `afterEach(() => rm(tmpDir, { recursive: true }))`
- Never leave temp directories behind
- Mock `@clack/prompts` in cli-prompt tests — do NOT mock `fs/promises`

## Template Task Conventions (Generated Projects)

When editing files inside `templates/`:
- Gulp 5 tasks: `export default taskFn` — no `gulp.task('name', fn)` string form
- All file paths from `globs.js` — never hardcode paths in task files
- All `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- JS: esbuild (not Browserify)
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Linting: Biome (not ESLint/Prettier)

## PR Requirements
- `npm test` passes (78 tests, 0 skipped)
- `npm run test:coverage` exits 0 (100% src/ coverage)
- `npm audit --audit-level=high` exits 0 (0 vulnerabilities)
- CHANGELOG.md updated for user-facing changes
