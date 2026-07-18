# Scaffolder Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add flag-based CLI mode (`--yes`, `--type`, `--description`, `--version`, `--help`), enforce npm-valid project names, and update `promptUser` to accept per-field pre-fills.

**Architecture:** All flag parsing lives in `bin/create.js` using `util.parseArgs` (Node 18+ built-in). `src/cli.js` is updated in isolation — `validateProjectName` gets stricter rules, `promptUser` gets an `initialValues` object parameter. The two files stay independently unit-testable. `--yes` mode bypasses `promptUser` entirely and builds `ScaffoldValues` directly from flags + git config.

**Tech Stack:** Node.js built-in `node:util` (`parseArgs`), `node:fs/promises` (`readFile` for version), `@clack/prompts` (existing).

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `src/cli.js` | `validateProjectName` stricter rules; `promptUser` signature → `initialValues` object |
| Modify | `bin/create.js` | `parseArgs` flags, `--version`, `--help`, `--yes`, `--type`, `--description` |
| Modify | `test/cli.test.js` | Update uppercase test; add npm-valid name tests |
| Modify | `test/cli-prompt.test.js` | Update all `promptUser('')` calls; add `initialValues` pre-fill tests |
| Modify | `test/bin.test.js` | Add structural checks for new imports and flags |

---

## Task 1: Enforce npm-valid project names

**Files:**
- Modify: `test/cli.test.js`
- Modify: `src/cli.js`

- [ ] **Step 1: Add failing tests**

In `test/cli.test.js`, inside `describe('validateProjectName', ...)`, replace the existing uppercase test and add new cases:

```js
// Replace this test (line ~65):
//   it('returns undefined for an uppercase name (no case restriction in validation)', ...)
// With:
it('rejects an uppercase name', () => {
  expect(validateProjectName('MyProject')).toMatch(/lowercase/i);
});

// Add after the existing tests:
it('rejects a name starting with a hyphen', () => {
  expect(validateProjectName('-myproject')).toMatch(/invalid/i);
});

it('rejects a name starting with an underscore', () => {
  expect(validateProjectName('_myproject')).toMatch(/invalid/i);
});

it('rejects a name longer than 214 characters', () => {
  expect(validateProjectName('a'.repeat(215))).toMatch(/214/);
});

it('accepts a name exactly 214 characters long', () => {
  expect(validateProjectName('a'.repeat(214))).toBeUndefined();
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|rejects|accepts.*214'
```

Expected: the new tests fail (`MyProject` currently returns `undefined`; `-myproject` and `_myproject` also currently return `undefined`).

- [ ] **Step 3: Update `validateProjectName` in `src/cli.js`**

Replace the current character-class check:

```js
// Before (in validateProjectName):
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return 'Invalid project name: use only letters, numbers, hyphens, and underscores';
  }
  return undefined;

// After:
  if (trimmed.length > 214) {
    return 'Invalid project name: must be 214 characters or fewer';
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(trimmed)) {
    return 'Invalid project name: use only lowercase letters, numbers, hyphens, and underscores; must start with a letter or number';
  }
  return undefined;
```

The new regex `^[a-z0-9][a-z0-9_-]*$` enforces: starts with lowercase letter or digit, followed by any combination of lowercase letters, digits, underscores, and hyphens. Leading `-` and `_` both fail. Uppercase fails.

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: all tests pass. `sanitizeProjectName` tests are unaffected (the space→hyphen behaviour stays — it's still used on CLI positional args before validation runs).

- [ ] **Step 5: Commit**

```bash
git add src/cli.js test/cli.test.js
git commit -m "feat: enforce npm-valid project names in validateProjectName"
```

---

## Task 2: Update `promptUser` to accept `initialValues` object

**Files:**
- Modify: `src/cli.js`
- Modify: `bin/create.js`
- Modify: `test/cli-prompt.test.js`

- [ ] **Step 1: Add failing tests for `initialValues` pre-fill**

In `test/cli-prompt.test.js`, add inside `describe('promptUser', ...)`:

```js
it('accepts an initialValues object (no error thrown with object arg)', async () => {
  p.group.mockResolvedValueOnce(mockValues);
  await expect(promptUser({ projectName: 'init-name' })).resolves.toBeDefined();
});

it('passes initialValues.projectName as initialValue to the projectName prompt', async () => {
  p.group.mockImplementationOnce(async (fieldsObj) => {
    await fieldsObj.projectName();
    return mockValues;
  });
  await promptUser({ projectName: 'pre-filled' });
  expect(p.text).toHaveBeenCalledWith(
    expect.objectContaining({ initialValue: 'pre-filled' })
  );
});

it('passes initialValues.description as initialValue to the description prompt', async () => {
  p.group.mockImplementationOnce(async (fieldsObj) => {
    await fieldsObj.description();
    return mockValues;
  });
  await promptUser({ description: 'pre-filled desc' });
  expect(p.text).toHaveBeenCalledWith(
    expect.objectContaining({ initialValue: 'pre-filled desc' })
  );
});
```

- [ ] **Step 2: Update all existing `promptUser('')` calls in the test file**

Replace every `promptUser('')` and `promptUser('pre-filled-name')` call:

```js
// Before:
await promptUser('');
// After:
await promptUser({});

// Before:
await promptUser('pre-filled-name');
// After:
await promptUser({ projectName: 'pre-filled-name' });
```

- [ ] **Step 3: Run tests — verify new tests fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|initialValues|pre-filled'
```

Expected: the new `initialValues` tests fail (signature mismatch).

- [ ] **Step 4: Update `promptUser` signature in `src/cli.js`**

Replace the function signature and destructure `initialValues`:

```js
// Before:
export async function promptUser(initialName = '') {
  const p = await import('@clack/prompts');

  p.intro('create-gulp-khup');

  const [authorName, authorEmail] = await Promise.all([
    getGitConfig('user.name'),
    getGitConfig('user.email'),
  ]);

  const values = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is your project name?',
          initialValue: initialName,
          validate: validateProjectName,
        }),
      description: () =>
        p.text({
          message: 'Short description?',
          placeholder: 'A static marketing site',
        }),
      authorName: () =>
        p.text({
          message: 'Author name?',
          initialValue: authorName,
        }),
      authorEmail: () =>
        p.text({
          message: 'Author email?',
          initialValue: authorEmail,
        }),

// After:
/**
 * @param {{ projectName?: string, description?: string, projectType?: ProjectType, authorName?: string, authorEmail?: string }} [initialValues={}]
 */
export async function promptUser(initialValues = {}) {
  const {
    projectName: initialName = '',
    description: initialDescription = '',
    projectType: initialProjectType,
    authorName: prefilledAuthorName,
    authorEmail: prefilledAuthorEmail,
  } = initialValues;

  const p = await import('@clack/prompts');

  p.intro('create-gulp-khup');

  const [gitAuthorName, gitAuthorEmail] = await Promise.all([
    getGitConfig('user.name'),
    getGitConfig('user.email'),
  ]);

  const values = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is your project name?',
          initialValue: initialName,
          validate: validateProjectName,
        }),
      description: () =>
        p.text({
          message: 'Short description?',
          placeholder: 'A static marketing site',
          initialValue: initialDescription,
        }),
      authorName: () =>
        p.text({
          message: 'Author name?',
          initialValue: prefilledAuthorName ?? gitAuthorName,
        }),
      authorEmail: () =>
        p.text({
          message: 'Author email?',
          initialValue: prefilledAuthorEmail ?? gitAuthorEmail,
        }),
```

Also update the `projectType` select to use `initialProjectType`:

```js
      projectType: () =>
        p.select({
          message: 'Project type?',
          initialValue: initialProjectType,
          options: [
            { value: 'web', label: 'Static HTML', hint: 'recommended' },
            { value: 'wordpress', label: 'WordPress' },
            { value: 'email', label: 'Email' },
          ],
        }),
```

- [ ] **Step 5: Update `bin/create.js` call site**

```js
// Before:
const values = await promptUser(initialName);

// After:
const values = await promptUser({ projectName: initialName });
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/cli.js bin/create.js test/cli-prompt.test.js
git commit -m "feat: update promptUser to accept initialValues object for per-field pre-fill"
```

---

## Task 3: Add flag parsing, `--version`, and `--help`

**Files:**
- Modify: `test/bin.test.js`
- Modify: `bin/create.js`

- [ ] **Step 1: Add failing structural tests**

In `test/bin.test.js`, add:

```js
it('imports parseArgs from node:util', () => {
  expect(source).toContain("from 'node:util'");
  expect(source).toContain('parseArgs');
});

it('handles the --version flag', () => {
  expect(source).toContain('flags.version');
  expect(source).toContain('pkg.version');
});

it('handles the --help flag', () => {
  expect(source).toContain('flags.help');
  expect(source).toContain('--type');
  expect(source).toContain('--yes');
  expect(source).toContain('--version');
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|parseArgs|version|help'
```

- [ ] **Step 3: Rewrite `bin/create.js` with flag parsing**

```js
#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import * as p from '@clack/prompts';
import { promptUser, sanitizeProjectName, getGitConfig } from '../src/cli.js';
import { scaffold } from '../src/scaffold.js';

let flags, positionals;
try {
  const parsed = parseArgs({
    args: process.argv.slice(2),
    options: {
      version:     { type: 'boolean', short: 'v' },
      help:        { type: 'boolean', short: 'h' },
      type:        { type: 'string' },
      description: { type: 'string' },
      yes:         { type: 'boolean', short: 'y' },
    },
    allowPositionals: true,
  });
  flags = parsed.values;
  positionals = parsed.positionals;
} catch (err) {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (flags.version) {
  const pkg = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf-8')
  );
  console.log(pkg.version);
  process.exit(0);
}

if (flags.help) {
  console.log(`
Usage: npm create gulp-khup@latest <project-name> [options]

Options:
  --type <type>          Project type: web, wordpress, or email (default: web)
  --description <text>   Short project description
  --yes, -y              Skip prompts and use defaults
  --version, -v          Print version and exit
  --help, -h             Show this help and exit
`);
  process.exit(0);
}

const VALID_TYPES = new Set(['web', 'wordpress', 'email']);
if (flags.type && !VALID_TYPES.has(flags.type)) {
  p.log.error(`Invalid --type "${flags.type}". Must be: web, wordpress, or email.`);
  process.exit(1);
}

const rawArg = positionals[0];
const initialName = rawArg ? sanitizeProjectName(rawArg) : '';

let values;
if (flags.yes) {
  if (!rawArg) {
    p.log.error('Project name is required with --yes. Usage: npm create gulp-khup@latest <name> --yes');
    process.exit(1);
  }
  const [authorName, authorEmail] = await Promise.all([
    getGitConfig('user.name'),
    getGitConfig('user.email'),
  ]);
  values = {
    projectName: initialName,
    description: flags.description ?? '',
    authorName,
    authorEmail,
    projectType: /** @type {import('../src/cli.js').ProjectType} */ (flags.type ?? 'web'),
  };
} else {
  values = await promptUser({
    projectName: initialName,
    ...(flags.type       && { projectType:  /** @type {import('../src/cli.js').ProjectType} */ (flags.type) }),
    ...(flags.description !== undefined && { description: flags.description }),
  });
}

const projectName = sanitizeProjectName(values.projectName);

p.log.step(`Scaffolding ${projectName}...`);

try {
  await scaffold({ ...values, projectName });
  p.outro(`Done! Run:\n\n  cd ${projectName}\n  npm install\n  gulp`);
} catch (err) {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
```

- [ ] **Step 4: Add structural tests for `--yes` and `--type`**

In `test/bin.test.js`, add:

```js
it('handles the --yes flag for non-interactive mode', () => {
  expect(source).toContain('flags.yes');
  expect(source).toContain('getGitConfig');
});

it('validates --type against VALID_TYPES', () => {
  expect(source).toContain('VALID_TYPES');
});

it('imports getGitConfig from src/cli.js', () => {
  expect(source).toContain('getGitConfig');
});
```

- [ ] **Step 5: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests pass. Coverage must stay at 100% for `src/`.

```bash
npm run test:coverage
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add bin/create.js test/bin.test.js
git commit -m "feat: add --version, --help, --type, --description, --yes flags to CLI"
```

---

## Task 4: Verify type checking and open PR

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --project jsconfig.json --noEmit
```

Expected: exits 0 (no type errors). If errors appear, fix the JSDoc annotations in `bin/create.js` (e.g., `@type {ProjectType}` casts).

- [ ] **Step 2: Manual smoke test**

```bash
node bin/create.js --version
# Expected: 1.3.1

node bin/create.js --help
# Expected: prints usage with --type, --yes, --version, --help

node bin/create.js smoke-test --yes --type=web
# Expected: creates smoke-test/ directory without prompts

rm -rf smoke-test
```

- [ ] **Step 3: Run full test suite one final time**

```bash
npm run test:coverage
```

Expected: 100% coverage on `src/`, all tests pass.

- [ ] **Step 4: Open PR**

```bash
git push -u origin feat/<issue>-scaffolder-core
```

Open PR targeting `main`. Title: `feat: add CLI flags (--yes, --type, --description, --version, --help)`.

Bump version to `1.4.0` in `package.json` and update `CHANGELOG.md` `[Unreleased]` section:

```markdown
## [Unreleased]

### Added
- `--yes`/`-y` flag: skip all prompts; uses `--type` (default `web`), `--description`, and git config for author fields
- `--type` flag: pre-select project type (`web`, `wordpress`, `email`) without prompting
- `--description` flag: pre-fill description prompt
- `--version`/`-v` flag: print version and exit
- `--help`/`-h` flag: print usage summary and exit

### Changed
- `validateProjectName` now enforces npm package name rules: lowercase only, must start with a letter or number, max 214 characters
```
