# Repo Improvements Design

**Date:** 2026-07-18
**Scope:** Three focused PRs — scaffolder core (A), template quality (B), repo DX (D)
**Approach:** Approach 1 — three independent PRs, one per area; merged sequentially

---

## Area A — Scaffolder Core

### A1 — Non-interactive / flag mode

`bin/create.js` gains CLI flag parsing via `util.parseArgs` (Node 18+ built-in, zero new deps).

**New flags:**

| Flag | Short | Behaviour |
|------|-------|-----------|
| `--version` | `-v` | Read version from `package.json` via `readFile` + `JSON.parse`, print, exit 0 |
| `--help` | `-h` | Print usage summary, exit 0 |
| `--type` | | Accept `web\|wordpress\|email`; print error + exit 1 if invalid value supplied |
| `--description` | | Pre-fill or set the description field |
| `--yes` | `-y` | Skip all prompts; requires a positional project name arg |

**`--yes` mode behaviour:** build `ScaffoldValues` directly without calling `promptUser`:
- `projectName` — from positional arg (required; error + exit 1 if absent)
- `projectType` — from `--type` (default: `web`)
- `description` — from `--description` (default: `''`)
- `authorName` / `authorEmail` — from `getGitConfig` (already exported from `cli.js`)

**Without `--yes`:** any flags supplied pre-fill their corresponding prompts. `promptUser` gains an `initialValues` parameter (object) replacing the current `initialName` string.

### A2 — CLI hygiene

`--version`/`-v` and `--help`/`-h` are handled at the top of `bin/create.js` before `promptUser` is called. Version is read dynamically from `package.json` using `readFile` + `JSON.parse` with `import.meta.url` resolution — no `require`, no JSON import assertion.

### A3 — Validation fixes

`validateProjectName` in `src/cli.js` updated:

- **Character class:** `[a-zA-Z0-9_-]` → `[a-z0-9_-]` — reject uppercase (package names must be lowercase; `sanitizeProjectName` already lowercases but the validator should be consistent)
- **Leading character:** reject names starting with `-` or `_` (npm disallows both)
- **Length:** reject names over 214 characters (npm limit)

The space→hyphen replacement in `sanitizeProjectName` becomes unreachable (spaces are already rejected by the validator) and is removed.

### A — Testing

New / updated test cases:
- `bin.test.js`: structural check includes new flags in `--help` output
- `cli.test.js`: updated `validateProjectName` rules (uppercase rejected, leading `-`/`_` rejected, length limit)
- `cli-prompt.test.js`: `promptUser` accepts `initialValues` object; each field pre-fills correctly
- `cli.test.js`: `sanitizeProjectName` no longer replaces spaces (dead code removed)

---

## Area B — Template Quality

### B1 — Dependency hygiene

Four targeted replacements; each removes a pinned or unmaintained package from all `package.json.tpl` files.

**`through2` → `node:stream` `Transform`**
Used in `css.js`, `js.js`, `img.js`, `html.js`. Replaced with `new Transform({ objectMode: true, transform(file, _, cb) { … } })` — same pattern, zero deps. `through2` removed from all `package.json.tpl` files.

**`gulp-touch-cmd 0.0.1` → inline `fs.utimes`**
Used only in `js.js` to update file mtime after bundling. Replace with a 3-line Transform that calls `fs.utimes(file.path, now, now)`. `gulp-touch-cmd` removed from all `package.json.tpl` files.

**`gulp-special-html 0.0.4` → inline entity-correction Transform**
Used only in `html.js` (base). Replace with an inline Transform that applies the same entity substitutions. `gulp-special-html` removed from all `package.json.tpl` files.

**`fastclick` removed**
Present in base `package.json.tpl` `dependencies`. Deprecated since iOS 8 / Chrome 32 (click delay no longer exists in modern browsers). Removed with no replacement.

**Moderate vulnerabilities**
After the above removals, scaffold a web project, run `npm audit`, and apply additional `overrides` or dep bumps as needed to address the 5 remaining moderate vulns.

### B2 — Per-type dep splitting

The scaffold merge (`base/` → `<type>/`) means a type-specific `package.json.tpl` **replaces** the base file entirely. Creating `web/package.json.tpl` and `wordpress/package.json.tpl` allows each type to carry exactly the deps it needs.

**New files:**

The scaffold merge replaces the base `package.json.tpl` entirely with the type-specific file (same behaviour as `email/package.json.tpl` today). Each new file must therefore be a complete, self-contained `package.json.tpl` — not just a delta.

- `templates/web/package.json.tpl` — complete file; base shared deps + `stylelint` stack, `ssh2-sftp-client`, `nunjucks`/`nunjucks-markdown`/`marked`/`gulp-nunjucks`, `gulp-inline-source`; `dependencies`: `basiclightbox`, `hamburgers`, `normalize.css`, `swiper`
- `templates/wordpress/package.json.tpl` — complete file; base shared deps + `stylelint` stack, `ssh2-sftp-client`; excludes: `nunjucks` stack, `gulp-inline-source`, `gulp-inline-css`, and all frontend runtime `dependencies`

**`templates/base/package.json.tpl` after split:** retains only truly shared deps — gulp core, css/js/img/html tooling (`sass`, `gulp-sass`, `esbuild`, `autoprefixer`, `cssnano`, `postcss`, `sharp`, `svgo`, `html-minifier-terser`, `gulp-postcss`, `gulp-pxtorem`, `gulp-flatmap`, `gulp-sourcemaps`, `gulp-rename`, `gulp-replace`, `gulp-cached`, `gulp-changed`, `gulp-notify`, `gulp-size`, `gulp-plumber`), `biome`, `browser-sync`, `beeper`, `chalk`, `del`, `dotenv`. No `dependencies` section (web-only). The type-specific `package.json.tpl` files duplicate the base dep list — this is intentional and matches how `email/package.json.tpl` already works.

**`templates/email/package.json.tpl`:** already exists and already excludes `stylelint` and `ssh2-sftp-client`. Trim `gulp-inline-source` and `gulp-flatmap` if email tasks don't use them; verify during implementation.

**Dep matrix:**

| Dep group | base | web | wordpress | email |
|---|---|---|---|---|
| `stylelint` stack | removed | ✓ | ✓ | — |
| `ssh2-sftp-client` | removed | ✓ | ✓ | — |
| `nunjucks`/`marked`/`gulp-nunjucks` | removed | ✓ | — | ✓ (existing) |
| `gulp-inline-source` | removed | ✓ | — | — |
| `gulp-flatmap` | stays | ✓ | ✓ | ✓ |
| `basiclightbox`, `hamburgers`, etc. | removed | ✓ | — | — |
| `fastclick` | removed | — | — | — |

### B3 — Generated code quality

Two targeted fixes:

1. **`css.js` comment bug:** `const INLINE_ASSET_MAX_SIZE = 8 * 1024; // bytes` → `// 8 KB` (8 × 1024 = 8192, not 8)
2. **`repository` field in all `package.json.tpl` files:** `"url": "https://github.com/<%= appName %>"` has no username — the URL is always incomplete. Remove the `repository` field entirely from all `package.json.tpl` files. It is optional in `package.json`; users can add it after scaffolding.

### B — Testing

- Snapshot tests for `gulpfile.js` and `package.json` will need updating — run `vitest run -u`
- New file-existence assertions for `web/package.json.tpl`-sourced deps in web output
- Assertions that wordpress output does NOT contain `nunjucks` in its `package.json`
- Assertions that email output does NOT contain `stylelint` in its `package.json` (already passing; keep as regression guard)

---

## Area D — Repo DX

### D1 — CI efficiency

**Redundant test step:** the `test` job currently runs `npm test` then `npm run test:coverage` as two separate steps. Both run the full test suite. Drop the `npm test` step; keep only `npm run test:coverage`. Tests still run, coverage is captured in one pass. Applies to both Node 18 and Node 22 matrix legs — halves test time.

**`--legacy-peer-deps` flags:** after B1/B2 cleans up the generated project dep tree, the integration job's `npm install --legacy-peer-deps` is re-evaluated and removed if no longer needed. The scaffolder's own `npm ci --legacy-peer-deps` is investigated — likely caused by `typescript ^7.0.2` vs. a vitest peer dep — and removed if resolvable.

### D2 — Test organisation

During B work, `scaffold.test.js` (599 lines) is split into three focused files:

- `scaffold-web.test.js` — web-type file-existence, token substitution, and snapshot tests
- `scaffold-wordpress.test.js` — wordpress-type tests
- `scaffold-email.test.js` — email-type tests

A shared `createTmpDir` / `cleanupTmpDir` helper is extracted (or placed in a small `test/helpers.js`) to avoid repeating the `mkdtemp`/`rm` lifecycle in each file. The existing `scaffold-errors.test.js`, `cli.test.js`, `cli-prompt.test.js`, `bin.test.js`, and `package.test.js` are unchanged.

Target: each new file ~150–200 lines. Total test count remains the same.

### D3 — Dev tooling

The scaffolder source (`src/`, `bin/`, `test/`) has no linter today. Fix:

1. Add `@biomejs/biome` to scaffolder `devDependencies`
2. Add `biome.json` to repo root (conservative config, matches the template `biome.json` where possible)
3. Add `"lint": "biome check ."` and `"format": "biome format --write ."` to scaffolder `package.json` scripts
4. Add a lint step to the `typecheck` CI job — that job already installs deps and costs near-zero extra time

No husky or lint-staged — single-maintainer repo, YAGNI.

---

## Delivery

Three PRs, one per area, targeting `main`:

| PR | Branch | Semver bump |
|---|---|---|
| Scaffolder core | `feat/<n>-scaffolder-core` | minor (new `--yes`, `--type`, `--help`, `--version` flags) |
| Template quality | `feat/<n>-template-quality` | minor (generated projects change meaningfully) |
| Repo DX | `chore/repo-dx` | none (no user-facing changes) |

Merge order: A → B → D. B depends on A being stable (test helpers may be shared). D is independent but benefits from B's test reorganisation landing first.
