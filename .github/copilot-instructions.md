# Copilot Instructions for gulp-khup

## What This Repo Is

gulp-khup is a Gulp 4 gulpsheet being modernized into a `create-gulp-khup` npm scaffolder.
See `AGENTS.md` for architecture overview, `TODO.md` for roadmap, and
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
- **Always use `--ignore-scripts`** — `node-sass` does not compile on Node v18+

## Phase 2 Conventions (for `next` branch work)

When working on Phase 2 (the scaffolder), the module system changes to native ESM
(`"type": "module"` in package.json). Conventions shift:

- `@clack/prompts` for all interactive CLI prompts — no `readline` or `inquirer`
- `fs/promises` (built-in) for all file operations — no `fs-extra`
- Template files use `.tpl` extension with `<%= tokenName %>` substitution syntax
- Vitest for all tests — write failing test first, then implement
- 100% line coverage is required before merging to `main`/`develop`

## Dependency Constraints

Phase 1 (current `develop`): Do NOT bump Gulp past 4.x, do NOT add ESM-only packages.
Phase 2 (`next` branch): Full modernisation — Gulp 5, esbuild, Biome, Dart Sass.

## PR Requirements

- `npm install --ignore-scripts` completes without error
- `npm audit --audit-level=high` — document any that can't be resolved without Phase 2
- CHANGELOG.md updated for any user-facing change
- Phase 2 PRs additionally require: all Vitest tests pass, coverage must not drop
