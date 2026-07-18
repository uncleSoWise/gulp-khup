# Copilot Instructions for create-gulp-khup

## What This Repo Is

`create-gulp-khup` (repo: `gulp-khup`) is a `create-*` npm scaffolder that generates
Gulp 5 projects via `npm create gulp-khup@latest my-project`.

Three project types: **web** (static HTML/marketing), **wordpress** (complete PHP theme), **email** (Campaign Monitor HTML email).

## Scaffolder Conventions

### Module System
- Native ESM (`"type": "module"`) — `import`/`export` everywhere, no `require()`
- No build step — `src/`, `bin/`, and `templates/` are published as-is

### Template Files
- Files with `.tpl` extension get token substitution; non-`.tpl` files copy verbatim
- Token syntax: `<%= tokenName %>` (camelCase names)
- Current tokens: `appName`, `appSlug` (dashes→underscores, PHP-safe), `appDescription`, `authorName`, `authorEmail`, `appVersion`, `year`, `inSubFolder`
- **PHP files with tokens must be named `.php.tpl`** (e.g. `config.php.tpl`) — if they're `.php` they copy verbatim and tokens never substitute

### File Operations
- Use Node.js built-in `fs/promises` — do NOT add `fs-extra` or similar
- Use `mkdtemp` in tests for temp directories; always clean up in `afterEach`
- Use `_templatesDir` parameter in scaffold() to test with custom template directories

### Prompts
- Use `@clack/prompts` — do NOT use `inquirer`, `readline`, or `prompts`
- Ctrl+C must exit cleanly with a message, never a stack trace

## Testing Rules
- Vitest only — do NOT use Jest
- Write failing test FIRST (TDD) — then implement minimally to pass
- `src/**/*.js` requires 100% coverage (enforced in CI via `npm run test:coverage`)
- Scaffold tests: use `mkdtemp` + `afterEach(() => rm(tmpDir, { recursive: true }))`
- Never leave temp directories behind
- Mock `@clack/prompts` in cli-prompt tests — do NOT mock `fs/promises`

## Template Task Conventions (Generated Projects)

When editing files inside `templates/`:
- Gulp 5 tasks: `export default taskFn` — no `gulp.task('name', fn)` string form
- All file paths from `globs.js` — never hardcode `/src/` or `/dist/` in task files
- All `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Images: `sharp` (raster) + `svgo` (SVG) — NOT `gulp-imagemin`
- HTML minification: `html-minifier-terser` — NOT `gulp-htmlmin`
- Linting: Biome (not ESLint/Prettier) — no `eslint-disable` comments in templates
- Deploy: SFTP only via `ssh2-sftp-client` — `vinyl-ftp` was removed

### WordPress type
- All ACF calls guarded: `if (function_exists('get_field')) { ... }`
- PHP files with tokens use `.php.tpl` extension
- Function prefix uses `appSlug` token

### Email type
- Campaign Monitor merge tags (`<currentyear>`, `<webversion>`, `<unsubscribe>`, `<singleline>`) are intentional — do NOT replace with static values
- `@media` queries stripped by Gmail is expected behaviour — `gulp-inline-css` handles inlining

## PR Requirements
- `npm test` passes (120 tests, 0 skipped)
- `npm run test:coverage` exits 0 (100% src/ coverage)
- `npx tsc --project jsconfig.json --noEmit` exits 0 (0 type errors)
- CI integration smoke test passes for all 3 project types (`gulp build` on web, email, wordpress)
- CHANGELOG.md updated for user-facing changes

