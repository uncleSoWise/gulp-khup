# TODO

Phase 2 work items for the `create-gulp-khup` modernization. See
[`docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md`](docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md)
for the full design, and
[`docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md`](docs/superpowers/plans/2026-07-15-phase2-create-gulp-khup-scaffolder.md)
for the step-by-step implementation plan.

All Phase 2 work happens on the `next` branch.

---

## Phase 2: create-gulp-khup Scaffolder

### Scaffolder CLI
<!-- issue-link: phase2-cli -->
Build `bin/create.js` + `src/cli.js` — the `npm create gulp-khup@latest` entry point
using `@clack/prompts` for interactive project setup.

### Template Suite (Gulp 5)
<!-- issue-link: phase2-templates -->
Port Gulp 5 task suite from the Archive (`generator-pnmg` v8.1.0): esbuild for JS,
Dart Sass, Biome for linting, PostCSS/cssnano, ssh2-sftp-client for deploy.

### Test Harness
<!-- issue-link: phase2-tests -->
Vitest test suite with 100% line coverage: scaffold output tests + CLI unit tests.
Tests gate the Phase 2 → `develop` merge.

### Dependency Modernization
<!-- issue-link: phase2-deps -->
Resolve all 163 remaining vulnerabilities via major-version upgrades:
`gulp@5`, `browser-sync@3`, `gulp-sass@6` + Dart Sass, `psi@4`, `gulp-imagemin@9`,
esbuild replacing Browserify+Babel, Biome replacing ESLint+Prettier.

Also resolves: `node-sass` Node v18+ incompatibility (replaced by Dart Sass).

### npm Publish Workflow
<!-- issue-link: phase2-publish -->
GitHub Actions workflow on release tag: run tests → `npm publish`.
Package changes: `private: false`, `bin` field, `name: create-gulp-khup`, `type: module`.

---

## Future (Phase 3+)

- WordPress project type
- Email project type
- `cosmiconfig` support for customizing globs (see #18)
