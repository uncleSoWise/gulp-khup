# Template Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove four unmaintained/deprecated dependencies from generated project templates, fix two code quality bugs, split `scaffold.test.js` into per-type files, and create type-specific `package.json.tpl` files so each project type gets only the deps it needs.

**Architecture:** Three layers of changes. (1) Task file changes: replace `through2`, `gulp-touch-cmd`, `gulp-special-html` with native Node.js or inline equivalents — no behaviour change, just removing pinned/unmaintained packages. (2) Manifest changes: `web/package.json.tpl` and `wordpress/package.json.tpl` are created as complete, self-contained files that override `base/package.json.tpl` during the scaffold merge. (3) Test changes: `scaffold.test.js` is split into three focused files sharing a common lifecycle helper. All snapshot tests are updated at the end via `vitest run -u`.

**Tech Stack:** Node.js built-in `node:stream` (`Transform`), `node:fs/promises` (`utimes`), Vitest snapshots.

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Create | `test/helpers.js` | Shared `mkdtemp`/`rm` lifecycle |
| Create | `test/scaffold-web.test.js` | Web-type scaffold tests (from scaffold.test.js) |
| Create | `test/scaffold-wordpress.test.js` | WordPress-type scaffold tests (from scaffold.test.js) |
| Create | `test/scaffold-email.test.js` | Email-type scaffold tests (from scaffold.test.js) |
| Modify | `test/scaffold.test.js` | Keep only: `applyTokens`, `resolveTemplateDirs`, directory-handling tests |
| Modify | `templates/base/gulp/tasks/css.js` | Replace `through2`, fix `// bytes` comment |
| Modify | `templates/base/gulp/tasks/js.js` | Replace `through2`, replace `gulp-touch-cmd` |
| Modify | `templates/base/gulp/tasks/img.js` | Replace `through2` |
| Modify | `templates/base/gulp/tasks/html.js` | Replace `through2`, replace `gulp-special-html` |
| Modify | `templates/base/package.json.tpl` | Remove type-specific + deprecated deps; remove `repository` field |
| Create | `templates/web/package.json.tpl` | Complete web manifest (base deps + web-only deps) |
| Create | `templates/wordpress/package.json.tpl` | Complete WordPress manifest (base deps + wp-only deps) |
| Modify | `templates/email/package.json.tpl` | Remove `repository` field; remove `gulp-inline-source` if unused |
| Update | `test/__snapshots__/*.snap` | Regenerate after all manifest changes |

---

## Task 1: Split `scaffold.test.js` — extract shared helper and per-type files

**Files:**
- Create: `test/helpers.js`
- Create: `test/scaffold-web.test.js`
- Create: `test/scaffold-wordpress.test.js`
- Create: `test/scaffold-email.test.js`
- Modify: `test/scaffold.test.js`

This task is a pure refactor — no behaviour change, same test count.

- [ ] **Step 1: Create `test/helpers.js`**

```js
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Create a temp dir, return path + cleanup function.
 * @param {string} [prefix='gulp-khup-test-']
 * @returns {Promise<{ tmpDir: string, cleanup: () => Promise<void> }>}
 */
export async function makeTmpDir(prefix = 'gulp-khup-test-') {
  const tmpDir = await mkdtemp(join(tmpdir(), prefix));
  return {
    tmpDir,
    cleanup: () => rm(tmpDir, { recursive: true, force: true }),
  };
}
```

- [ ] **Step 2: Move web-type tests to `test/scaffold-web.test.js`**

Extract the `describe('scaffold — web project: file content', ...)` block and any web-specific snapshot tests from `scaffold.test.js` into a new file. Use `makeTmpDir` for the lifecycle:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULTS = {
  projectName: 'test-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: /** @type {'web'} */ ('web'),
};

describe('scaffold — web project', () => {
  let tmpDir, outDir, cleanup;

  beforeEach(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-web-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(() => cleanup());

  // Paste all `it(...)` cases from the web describe block here, unchanged.
  // Replace manual `mkdtemp`/`rm` usages with the lifecycle above.
});
```

Copy every `it(...)` from the existing web describe block verbatim.

- [ ] **Step 3: Move wordpress-type tests to `test/scaffold-wordpress.test.js`**

Same pattern as Step 2 — extract the `describe('scaffold — wordpress project', ...)` block:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULTS = {
  projectName: 'test-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: /** @type {'wordpress'} */ ('wordpress'),
};

describe('scaffold — wordpress project', () => {
  let tmpDir, outDir, cleanup;

  beforeEach(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-wp-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(() => cleanup());

  // Paste all it(...) cases from the wordpress describe block here.
});
```

- [ ] **Step 4: Move email-type tests to `test/scaffold-email.test.js`**

Same pattern — extract the `describe('scaffold — email project', ...)` block:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULTS = {
  projectName: 'test-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: /** @type {'email'} */ ('email'),
};

describe('scaffold — email project', () => {
  let tmpDir, outDir, cleanup;

  beforeEach(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-email-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(() => cleanup());

  // Paste all it(...) cases from the email describe block here.
});
```

- [ ] **Step 5: Trim `test/scaffold.test.js`**

Keep only the pure-function blocks and directory-handling tests:
- `describe('applyTokens', ...)` — keep as-is
- `describe('resolveTemplateDirs', ...)` — keep as-is
- `describe('scaffold — directory handling', ...)` — keep as-is

Delete all web/wordpress/email type-specific describe blocks from this file.

- [ ] **Step 6: Run tests — verify same count, all pass**

```bash
npm test
```

Expected: same number of tests as before (no tests lost or added), all pass.

- [ ] **Step 7: Commit**

```bash
git add test/helpers.js test/scaffold-web.test.js test/scaffold-wordpress.test.js test/scaffold-email.test.js test/scaffold.test.js
git commit -m "test: split scaffold.test.js into per-type files with shared mkdtemp helper"
```

---

## Task 2: Fix B3 code quality bugs

**Files:**
- Modify: `templates/base/gulp/tasks/css.js`
- Modify: `templates/base/package.json.tpl`
- Modify: `templates/email/package.json.tpl`

- [ ] **Step 1: Add a failing snapshot assertion for the `repository` field**

In `test/scaffold-web.test.js`, add:

```js
it('generated package.json does not contain a repository URL field', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
  expect(pkg.repository).toBeUndefined();
});
```

Add the same test to `test/scaffold-wordpress.test.js` and `test/scaffold-email.test.js`.

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'repository'
```

Expected: 3 new tests fail (repository field exists today).

- [ ] **Step 3: Fix the `// bytes` comment in `css.js`**

In `templates/base/gulp/tasks/css.js`:

```js
// Before:
const INLINE_ASSET_MAX_SIZE = 8 * 1024; // bytes

// After:
const INLINE_ASSET_MAX_SIZE = 8 * 1024; // 8 KB
```

- [ ] **Step 4: Remove `repository` field from `templates/base/package.json.tpl`**

Delete these 4 lines:

```json
  "repository": {
    "type": "git",
    "url": "https://github.com/<%= appName %>"
  },
```

- [ ] **Step 5: Remove `repository` field from `templates/email/package.json.tpl`**

Same deletion in the email template.

- [ ] **Step 6: Run tests — verify the repository tests now pass**

```bash
npm test
```

Expected: the 3 new `repository` tests pass. Snapshots may fail — do NOT update them yet (they will be regenerated in Task 7 after all manifest changes).

- [ ] **Step 7: Commit**

```bash
git add templates/base/gulp/tasks/css.js templates/base/package.json.tpl templates/email/package.json.tpl test/scaffold-web.test.js test/scaffold-wordpress.test.js test/scaffold-email.test.js
git commit -m "fix: remove repository field from package.json.tpl; fix css.js 8 KB comment"
```

---

## Task 3: Replace `through2` with native `Transform`

**Files:**
- Modify: `templates/base/gulp/tasks/css.js`
- Modify: `templates/base/gulp/tasks/js.js`
- Modify: `templates/base/gulp/tasks/img.js`
- Modify: `templates/base/gulp/tasks/html.js`

The pattern is mechanical: replace `import through from 'through2'` (or `import through2 from 'through2'`) with `import { Transform } from 'node:stream'`, then replace every `through.obj(function(file, _, cb) {...})` or `through2.obj((file, _, cb) => {...})` with `new Transform({ objectMode: true, transform(file, _, cb) {...} })`.

These changes are verified by the integration smoke test (`gulp build`), not by unit tests.

- [ ] **Step 1: Update `templates/base/gulp/tasks/img.js`**

```js
// Remove:
import through2 from 'through2';

// Add:
import { Transform } from 'node:stream';

// Replace every through2.obj call:
// Before:
const optimizeImage = () =>
  through2.obj((file, _, cb) => {
    // ...body unchanged...
  });

// After:
const optimizeImage = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      // ...body unchanged...
    },
  });
```

- [ ] **Step 2: Update `templates/base/gulp/tasks/html.js`**

```js
// Remove:
import through2 from 'through2';

// Add:
import { Transform } from 'node:stream';

// Replace through2.obj calls with new Transform({ objectMode: true, transform(file, _, cb) {...} })
// Body of each transform function is unchanged.
```

- [ ] **Step 3: Update `templates/base/gulp/tasks/js.js`**

```js
// Remove:
import through from 'through2';

// Add:
import { Transform } from 'node:stream';

// Replace:
// Before:
const bundleWithEsbuild = () => {
  return through.obj(function transform(file, _enc, cb) {
    const stream = this;
    // ...body unchanged...
  });
};

// After:
const bundleWithEsbuild = () => {
  return new Transform({
    objectMode: true,
    transform(file, _enc, cb) {
      const stream = this;
      // ...body unchanged...
    },
  });
};
```

- [ ] **Step 4: Update `templates/base/gulp/tasks/css.js`**

Same pattern — remove `through` import, add `Transform` from `node:stream`, replace all `through.obj(...)` / `through2.obj(...)` calls.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all pass. The task files themselves are not unit-tested (only their existence is checked), so the test suite output is unchanged. Full integration verification happens in CI.

- [ ] **Step 6: Commit**

```bash
git add templates/base/gulp/tasks/css.js templates/base/gulp/tasks/js.js templates/base/gulp/tasks/img.js templates/base/gulp/tasks/html.js
git commit -m "fix: replace through2 with native node:stream Transform in all base task files"
```

---

## Task 4: Replace `gulp-touch-cmd` with inline `utimes`

**Files:**
- Modify: `templates/base/gulp/tasks/js.js`

- [ ] **Step 1: Update `js.js`**

```js
// Remove:
import touch from 'gulp-touch-cmd';

// Add at top with other node: imports:
import { utimes } from 'node:fs/promises';
import { Transform } from 'node:stream'; // (already added in Task 3)

// Add this helper function after the imports:
const touchFile = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      const now = new Date();
      utimes(file.path, now, now)
        .then(() => cb(null, file))
        .catch(() => cb(null, file)); // silently skip if file doesn't exist yet
    },
  });

// In jsTask, replace:
    .pipe(touch())
// With:
    .pipe(touchFile())
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add templates/base/gulp/tasks/js.js
git commit -m "fix: replace gulp-touch-cmd 0.0.1 with inline fs.utimes Transform in js.js"
```

---

## Task 5: Replace `gulp-special-html` with inline entity Transform

**Files:**
- Modify: `templates/base/gulp/tasks/html.js`

`gulp-special-html` converts a small set of special characters to named HTML entities. Examine its source at `node_modules/gulp-special-html/index.js` to capture the exact entity map, then inline it.

- [ ] **Step 1: Inspect the package source**

```bash
cat node_modules/gulp-special-html/index.js
```

Note the entity substitutions it performs (typically: `©` → `&copy;`, `®` → `&reg;`, `™` → `&trade;`, `–` → `&ndash;`, `—` → `&mdash;`). Record the full map.

- [ ] **Step 2: Update `html.js`**

```js
// Remove:
import special from 'gulp-special-html';

// Add (use the exact entity map from the package source):
import { Transform } from 'node:stream'; // already present from Task 3

const ENTITY_MAP = new Map([
  ['©', '&copy;'],
  ['®', '&reg;'],
  ['™', '&trade;'],
  // Add any additional entries observed in the package source
]);

const fixSpecialChars = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      if (file.isNull()) { cb(null, file); return; }
      let content = file.contents.toString('utf-8');
      for (const [char, entity] of ENTITY_MAP) {
        content = content.replaceAll(char, entity);
      }
      file.contents = Buffer.from(content, 'utf-8');
      cb(null, file);
    },
  });

// In htmlTask pipeline, replace:
    .pipe(special())
// With:
    .pipe(fixSpecialChars())
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add templates/base/gulp/tasks/html.js
git commit -m "fix: replace gulp-special-html 0.0.4 with inline entity-correction Transform in html.js"
```

---

## Task 6: Remove deprecated `fastclick` and audit moderate vulns

**Files:**
- Modify: `templates/base/package.json.tpl`

- [ ] **Step 1: Add a failing test**

In `test/scaffold-web.test.js`, add:

```js
it('generated package.json does not include fastclick', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).not.toContain('fastclick');
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --reporter=verbose 2>&1 | grep fastclick
```

- [ ] **Step 3: Remove `fastclick` from `templates/base/package.json.tpl`**

Delete this line from `"dependencies"`:

```json
    "fastclick": "^1.0.6",
```

- [ ] **Step 4: Run tests — verify the fastclick test passes**

```bash
npm test
```

- [ ] **Step 5: Audit moderate vulns in a scaffolded web project**

```bash
mkdir /tmp/audit-test && cd /tmp/audit-test
node --input-type=module <<'EOF'
import { scaffold } from '/Users/richard.deslauriers/_code/gulp-khup/src/scaffold.js';
await scaffold({
  projectName: 'audit-test',
  description: 'audit',
  authorName: 'CI',
  authorEmail: 'ci@example.com',
  projectType: 'web',
  cwd: '/tmp/audit-test',
});
EOF
cd /tmp/audit-test/audit-test && npm install --legacy-peer-deps 2>/dev/null
npm audit 2>&1 | tail -20
cd / && rm -rf /tmp/audit-test
```

Review the output. For each moderate vulnerability, add an entry to the `"overrides"` section of `templates/base/package.json.tpl` (and `templates/web/package.json.tpl` in Task 7 which will supersede base). Example pattern:

```json
  "overrides": {
    "existing-key": "^existing-version",
    "new-vuln-package": "^fixed-version"
  }
```

- [ ] **Step 6: Commit**

```bash
git add templates/base/package.json.tpl test/scaffold-web.test.js
git commit -m "fix: remove deprecated fastclick dep; address moderate audit vulns"
```

---

## Task 7: Create `templates/web/package.json.tpl`

**Files:**
- Create: `templates/web/package.json.tpl`
- Modify: `templates/base/package.json.tpl`

The web `package.json.tpl` completely replaces the base one during scaffold (same mechanism as email today). It must be a self-contained complete file.

- [ ] **Step 1: Add failing assertions for web-only deps**

In `test/scaffold-web.test.js`, add:

```js
it('generated web package.json includes stylelint', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).toContain('stylelint');
});

it('generated web package.json includes ssh2-sftp-client', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).toContain('ssh2-sftp-client');
});

it('generated web package.json includes normalize.css as a runtime dep', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
  expect(pkg.dependencies?.['normalize.css']).toBeDefined();
});
```

- [ ] **Step 2: Add assertions that verify these deps are NOT in base (used by other types)**

In `test/scaffold-wordpress.test.js`, add:

```js
it('generated wordpress package.json does not include normalize.css', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
  expect(pkg.dependencies?.['normalize.css']).toBeUndefined();
});
```

In `test/scaffold-email.test.js`, add:

```js
it('generated email package.json does not include stylelint', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).not.toContain('stylelint');
});
```

- [ ] **Step 3: Run tests — verify new assertions fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|stylelint|normalize|sftp'
```

- [ ] **Step 4: Create `templates/web/package.json.tpl`**

Copy `templates/base/package.json.tpl` as a starting point, then add web-only deps and sections. The file must contain the complete set of deps (base + web):

Deps to add vs. base:
- `devDependencies`: `"stylelint"`, `"stylelint-config-standard"`, `"stylelint-order"`, `"stylelint-scss"`, `"ssh2-sftp-client"`, `"nunjucks"`, `"nunjucks-markdown"`, `"marked"`, `"gulp-nunjucks"`, `"gulp-inline-source"`
- `dependencies` section (new): `"basiclightbox"`, `"hamburgers"`, `"normalize.css"`, `"swiper"` (copy current values from base `"dependencies"`, without `"fastclick"`)

Example structure:

```json
{
  "name": "<%= appName %>",
  "description": "<%= appDescription %>",
  "version": "<%= appVersion %>",
  "main": "./gulpfile.js",
  "private": true,
  "author": {
    "name": "<%= authorName %>",
    "email": "<%= authorEmail %>"
  },
  "type": "module",
  "license": "MIT",
  "scripts": {
    "check": "biome check .",
    "format": "biome format --write .",
    "lint": "biome lint ."
  },
  "devDependencies": {
    "@biomejs/biome": "^2.2.4",
    "autoprefixer": "^10.4.21",
    "beeper": "^3.0.0",
    "browser-sync": "^3.0.4",
    "chalk": "^5.6.2",
    "cssnano": "^7.1.1",
    "del": "^8.0.1",
    "dotenv": "^17.2.2",
    "esbuild": "^0.25.10",
    "gulp": "^5.0.1",
    "gulp-cached": "^1.1.1",
    "gulp-changed": "^5.0.3",
    "gulp-flatmap": "^1.0.2",
    "html-minifier-terser": "^7.2.0",
    "gulp-inline-source": "^4.0.0",
    "gulp-notify": "^5.0.0",
    "gulp-nunjucks": "^6.1.0",
    "gulp-plumber": "^1.2.1",
    "gulp-postcss": "^10.0.0",
    "gulp-pxtorem": "^3.0.0",
    "gulp-rename": "^2.1.0",
    "gulp-replace": "^1.1.4",
    "gulp-sass": "^6.0.1",
    "gulp-size": "^5.0.0",
    "gulp-sourcemaps": "^3.0.0",
    "marked": "^16.3.0",
    "nunjucks": "^3.2.4",
    "nunjucks-markdown": "^2.0.1",
    "postcss": "^8.5.10",
    "sass": "^1.93.2",
    "sharp": "^0.34.0",
    "ssh2-sftp-client": "^12.0.1",
    "stylelint": "^16.24.0",
    "stylelint-config-standard": "^39.0.0",
    "stylelint-order": "^7.0.0",
    "stylelint-scss": "^6.12.1",
    "svgo": "^3.3.2"
  },
  "dependencies": {
    "basiclightbox": "^5.0.4",
    "hamburgers": "^1.2.1",
    "normalize.css": "^8.0.1",
    "swiper": "^12.0.2"
  },
  "overrides": {
    "lodash.template": "^4.5.0",
    "nth-check": "^2.1.1",
    "terser": "^5.0.0",
    "uuid": "^11.1.1"
  }
}
```

Use the exact version strings from the current `base/package.json.tpl` — do not invent new version numbers.

- [ ] **Step 5: Strip web-only deps from `templates/base/package.json.tpl`**

Remove from base:
- `devDependencies`: `stylelint`, `stylelint-config-standard`, `stylelint-order`, `stylelint-scss`, `ssh2-sftp-client`, `nunjucks`, `nunjucks-markdown`, `marked`, `gulp-nunjucks`, `gulp-inline-source`
- Entire `"dependencies"` section (frontend runtime libs)

- [ ] **Step 6: Run tests — verify assertions pass**

```bash
npm test
```

Expected: the new dep-split assertions pass. Some snapshot tests will fail — skip `--update` for now.

- [ ] **Step 7: Commit**

```bash
git add templates/web/package.json.tpl templates/base/package.json.tpl test/scaffold-web.test.js test/scaffold-wordpress.test.js test/scaffold-email.test.js
git commit -m "feat: add web/package.json.tpl — web-only deps split from base"
```

---

## Task 8: Create `templates/wordpress/package.json.tpl`

**Files:**
- Create: `templates/wordpress/package.json.tpl`

- [ ] **Step 1: Add failing assertions for wordpress-specific deps**

In `test/scaffold-wordpress.test.js`, add:

```js
it('generated wordpress package.json includes stylelint', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).toContain('stylelint');
});

it('generated wordpress package.json includes ssh2-sftp-client', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).toContain('ssh2-sftp-client');
});

it('generated wordpress package.json does not include nunjucks', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).not.toContain('"nunjucks"');
});

it('generated wordpress package.json does not include gulp-inline-source', async () => {
  await scaffold({ ...DEFAULTS, outDir });
  const content = await readFile(join(outDir, 'package.json'), 'utf-8');
  expect(content).not.toContain('gulp-inline-source');
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|wordpress.*stylelint|wordpress.*nunjucks'
```

- [ ] **Step 3: Create `templates/wordpress/package.json.tpl`**

Copy `templates/base/package.json.tpl` (the already-trimmed base) as a starting point and add wordpress-specific deps:

Deps to add vs. trimmed base:
- `devDependencies`: `"stylelint"`, `"stylelint-config-standard"`, `"stylelint-order"`, `"stylelint-scss"`, `"ssh2-sftp-client"`

No `"dependencies"` section (WordPress themes do not install frontend libs via npm in this setup).

Use the same version strings as in `templates/web/package.json.tpl`.

- [ ] **Step 4: Run tests — verify assertions pass**

```bash
npm test
```

Expected: all new assertions pass.

- [ ] **Step 5: Commit**

```bash
git add templates/wordpress/package.json.tpl test/scaffold-wordpress.test.js
git commit -m "feat: add wordpress/package.json.tpl — wordpress-only deps split from base"
```

---

## Task 9: Regenerate snapshots and run full verification

**Files:**
- Update: `test/__snapshots__/*.snap`

- [ ] **Step 1: Update all snapshots**

```bash
npx vitest run -u
```

Expected: snapshot files updated to reflect: removed `repository` field, removed web-only deps from base, `through2`/`gulp-touch-cmd`/`gulp-special-html`/`fastclick` absent from `package.json` outputs.

- [ ] **Step 2: Review the snapshot diff**

```bash
git diff test/__snapshots__/
```

Verify the diff shows only expected removals (the deps and fields listed above) and no unexpected changes.

- [ ] **Step 3: Run full test suite with coverage**

```bash
npm run test:coverage
```

Expected: exits 0, all tests pass, 100% coverage on `src/`.

- [ ] **Step 4: Run type check**

```bash
npx tsc --project jsconfig.json --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Commit snapshots**

```bash
git add test/__snapshots__/
git commit -m "test: update snapshots after template dep split and dependency cleanup"
```

- [ ] **Step 6: Update CHANGELOG and bump version**

Bump to `1.5.0` in `package.json` and update `CHANGELOG.md` `[Unreleased]`:

```markdown
## [Unreleased]

### Added
- `templates/web/package.json.tpl` — web project type now gets only its required deps
- `templates/wordpress/package.json.tpl` — WordPress project type now gets only its required deps

### Changed
- `through2` replaced with native `node:stream` `Transform` in all base task files
- `gulp-touch-cmd 0.0.1` replaced with inline `fs.utimes` Transform in `js.js`
- `gulp-special-html 0.0.4` replaced with inline entity-correction Transform in `html.js`
- Generated `package.json` no longer includes a `repository` field (was always incomplete)
- `css.js` comment corrected: `// bytes` → `// 8 KB`

### Removed
- `fastclick` removed from generated web project (deprecated since iOS 8)
```

- [ ] **Step 7: Open PR**

```bash
git push -u origin feat/<issue>-template-quality
```

Open PR targeting `main`. Title: `feat: template dep split, replace unmaintained packages, code quality fixes`.
