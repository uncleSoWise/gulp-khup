# gulp-khup Phase 2: create-gulp-khup Scaffolder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `gulp-khup` into a published `create-gulp-khup` npm package — run `npm create gulp-khup@latest my-project` to scaffold a complete Gulp 5 static-site project.

**Architecture:** All Phase 2 work happens on a `next` branch. A TDD approach gates every feature: write failing tests first, implement minimally to pass, then expand to full coverage. The Gulp 5 template suite is ported from the local Archive (`/Archive/generators/app/templates/`). The scaffolder package itself has one runtime dependency: `@clack/prompts`.

**Tech Stack:** Node.js >=18, ESM (`"type": "module"`), Vitest (tests + coverage), @clack/prompts (CLI), Gulp 5 + esbuild + Dart Sass + Biome (generated project templates)

---

## Prerequisites

- Phase 1 complete: `main` is clean, CI is green, `v0.1.1` is tagged
- Node.js 18+ installed (`node --version`)
- npm 7+ installed (`npm --version`)
- Archive available at `/path/to/_code/Archive/generators/app/templates/`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `bin/create.js` | CLI entry point — parses args, calls cli.js |
| Create | `src/cli.js` | `@clack/prompts` prompt flow + input validation |
| Create | `src/scaffold.js` | Template copying + `<%= token %>` substitution |
| Create | `test/scaffold.test.js` | Vitest — scaffold output tests (Layer 1) |
| Create | `test/cli.test.js` | Vitest — CLI unit tests (Layer 2) |
| Create | `vitest.config.js` | Vitest + v8 coverage config |
| Create | `templates/base/gulpfile.js` | Shared Gulp 5 entry point |
| Create | `templates/base/package.json.tpl` | Generated project package.json with tokens |
| Create | `templates/base/.gitignore` | Standard gitignore for generated projects |
| Create | `templates/base/CHANGELOG.md` | Starter changelog |
| Create | `templates/base/README.md.tpl` | README with project name/description tokens |
| Create | `templates/base/gulp/commandLineArguments.js` | CLI args (from Archive) |
| Create | `templates/base/gulp/errorHandler.js` | Plumber error handler (from Archive) |
| Create | `templates/base/gulp/globs.js` | File path globs (from Archive) |
| Create | `templates/base/gulp/tasks/*.js` | All Gulp 5 task files (from Archive) |
| Create | `templates/web/src/` | Static HTML scaffold directories |
| Create | `templates/wordpress/` | Stub directory with README |
| Create | `templates/email/` | Stub directory with README |
| Create | `.github/workflows/publish.yml` | npm publish on release tag |
| Modify | `package.json` | private→false, bin, type:module, version, etc. |
| Modify | `README.md` | Rewritten for `npm create` usage |
| Modify | `AGENTS.md` | Updated for Phase 2 architecture |
| Modify | `.github/copilot-instructions.md` | Updated for Phase 2 conventions |

---

### Task 1: Create `next` Branch and Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create the `next` branch from main**

```bash
git checkout main
git pull origin main
git checkout -b next
```

- [ ] **Step 2: Replace package.json entirely**

The package changes name, removes `private`, adds `bin`, adds `type: module`, and strips all the old gulp task dependencies (those now live in `templates/base/package.json.tpl`). The scaffolder itself only needs `@clack/prompts`.

Replace `package.json` with:

```json
{
  "name": "create-gulp-khup",
  "description": "Scaffold a Gulp 5 static-site project — npm create gulp-khup@latest my-project",
  "version": "1.0.0-beta.1",
  "type": "module",
  "bin": {
    "create-gulp-khup": "./bin/create.js"
  },
  "exports": "./src/scaffold.js",
  "engines": {
    "node": ">=18"
  },
  "files": [
    "bin",
    "src",
    "templates"
  ],
  "author": {
    "name": "Richard Deslauriers",
    "email": "richard.s.deslauriers@gmail.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/uncleSoWise/gulp-khup.git"
  },
  "license": "MIT",
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@clack/prompts": "^0.10.0"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^3.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js', 'bin/**/*.js'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `node_modules/@clack` and `node_modules/vitest` installed cleanly.

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.js package-lock.json
git commit -m "chore: update package.json for create-gulp-khup scaffolder"
```

---

### Task 2: TDD — Scaffold Core (Layer 1 Tests + scaffold.js)

**Files:**
- Create: `test/scaffold.test.js`
- Create: `src/scaffold.js`

- [ ] **Step 1: Create the test directory and write all failing scaffold tests**

Create `test/scaffold.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, readFile, access, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

// We import scaffold functions — these don't exist yet, tests will fail
import { scaffold, applyTokens, resolveTemplateDirs } from '../src/scaffold.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

const defaults = {
  projectName: 'test-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: 'web',
};

describe('applyTokens', () => {
  it('replaces a single token', () => {
    expect(applyTokens('Hello <%= name %>', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple tokens', () => {
    const result = applyTokens('<%= a %> and <%= b %>', { a: 'foo', b: 'bar' });
    expect(result).toBe('foo and bar');
  });

  it('replaces the same token multiple times', () => {
    const result = applyTokens('<%= x %> then <%= x %>', { x: 'hi' });
    expect(result).toBe('hi then hi');
  });

  it('leaves unknown tokens unreplaced', () => {
    const result = applyTokens('<%= unknown %>', { other: 'value' });
    expect(result).toBe('<%= unknown %>');
  });

  it('handles empty string content', () => {
    expect(applyTokens('', { name: 'World' })).toBe('');
  });

  it('handles content with no tokens', () => {
    expect(applyTokens('no tokens here', { name: 'World' })).toBe('no tokens here');
  });

  it('handles empty tokens object', () => {
    expect(applyTokens('<%= name %>', {})).toBe('<%= name %>');
  });
});

describe('resolveTemplateDirs', () => {
  it('returns base dir for web type', () => {
    const dirs = resolveTemplateDirs('web', TEMPLATES_DIR);
    expect(dirs).toContain(join(TEMPLATES_DIR, 'base'));
    expect(dirs).toContain(join(TEMPLATES_DIR, 'web'));
  });

  it('returns base dir for wordpress type', () => {
    const dirs = resolveTemplateDirs('wordpress', TEMPLATES_DIR);
    expect(dirs).toContain(join(TEMPLATES_DIR, 'base'));
    expect(dirs).toContain(join(TEMPLATES_DIR, 'wordpress'));
  });

  it('returns base dir for email type', () => {
    const dirs = resolveTemplateDirs('email', TEMPLATES_DIR);
    expect(dirs).toContain(join(TEMPLATES_DIR, 'base'));
    expect(dirs).toContain(join(TEMPLATES_DIR, 'email'));
  });

  it('always returns base first', () => {
    const dirs = resolveTemplateDirs('web', TEMPLATES_DIR);
    expect(dirs[0]).toBe(join(TEMPLATES_DIR, 'base'));
  });
});

describe('scaffold', () => {
  let tmpDir;
  let outDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-test-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates the output directory', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(outDir)).resolves.toBeUndefined();
  });

  it('creates gulpfile.js in the output directory', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'gulpfile.js'))).resolves.toBeUndefined();
  });

  it('creates package.json from package.json.tpl with token substitution', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'package.json'), 'utf-8');
    expect(content).toContain('"test-project"');
    expect(content).toContain('"A test project"');
    expect(content).toContain('"Test Author"');
    expect(content).toContain('"test@example.com"');
  });

  it('strips the .tpl extension from output files', async () => {
    await scaffold({ ...defaults, outDir });
    // package.json.tpl → package.json (no .tpl in output)
    await expect(access(join(outDir, 'package.json.tpl'))).rejects.toThrow();
    await expect(access(join(outDir, 'package.json'))).resolves.toBeUndefined();
  });

  it('copies non-template files verbatim', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, '.gitignore'))).resolves.toBeUndefined();
  });

  it('creates gulp/tasks directory', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'gulp', 'tasks'))).resolves.toBeUndefined();
  });

  it('creates all base gulp task files', async () => {
    await scaffold({ ...defaults, outDir });
    const tasks = ['build.js', 'clean.js', 'css.js', 'default.js', 'deploy.js',
      'html.js', 'img.js', 'js.js', 'watch.js'];
    for (const task of tasks) {
      await expect(access(join(outDir, 'gulp', 'tasks', task))).resolves.toBeUndefined();
    }
  });

  it('creates README.md from README.md.tpl with project name', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'README.md'), 'utf-8');
    expect(content).toContain('test-project');
  });

  it('creates web project src directory structure', async () => {
    await scaffold({ ...defaults, outDir, projectType: 'web' });
    await expect(access(join(outDir, 'src'))).resolves.toBeUndefined();
  });

  it('creates CHANGELOG.md', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'CHANGELOG.md'))).resolves.toBeUndefined();
  });

  it('does not create wordpress-specific files for web project', async () => {
    await scaffold({ ...defaults, outDir, projectType: 'web' });
    // wordpress stub only has a README — verify it is not merged in for web type
    const content = await readFile(join(outDir, 'README.md'), 'utf-8');
    expect(content).not.toContain('WordPress');
  });

  it('throws if the output directory already exists', async () => {
    await mkdir(outDir);
    await expect(scaffold({ ...defaults, outDir })).rejects.toThrow(/already exists/i);
  });

  it('uses projectName as output directory name when outDir is not specified', async () => {
    const cwd = tmpDir;
    await scaffold({ ...defaults, outDir: undefined, cwd });
    await expect(access(join(cwd, defaults.projectName))).resolves.toBeUndefined();
  });

  it('matches package.json snapshot', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'package.json'), 'utf-8');
    expect(JSON.parse(content)).toMatchSnapshot();
  });

  it('matches gulpfile.js snapshot', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
npm test
```

Expected: all tests fail with `Cannot find module '../src/scaffold.js'` or similar import errors.

- [ ] **Step 3: Create src/scaffold.js with minimal implementation**

Create `src/scaffold.js`:

```js
import { copyFile, mkdir, readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function applyTokens(content, tokens) {
  return Object.entries(tokens).reduce(
    (str, [key, value]) => str.replaceAll(`<%= ${key} %>`, value),
    content
  );
}

export function resolveTemplateDirs(projectType, templatesDir) {
  return [
    join(templatesDir, 'base'),
    join(templatesDir, projectType),
  ];
}

export async function scaffold({ projectName, description, authorName, authorEmail, projectType = 'web', outDir, cwd = process.cwd() }) {
  const targetDir = outDir ?? join(cwd, projectName);
  const templatesDir = join(__dirname, '../templates');
  const tokens = { appName: projectName, appDescription: description, authorName, authorEmail, appVersion: '0.1.0' };

  // Throw if directory already exists
  try {
    await mkdir(targetDir, { recursive: false });
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`Output directory already exists: ${targetDir}`);
    }
    throw err;
  }

  const templateDirs = resolveTemplateDirs(projectType, templatesDir);
  for (const templateDir of templateDirs) {
    await copyDir(templateDir, targetDir, tokens);
  }
}

async function copyDir(srcDir, targetDir, tokens) {
  let entries;
  try {
    entries = await readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return; // missing template dir is a no-op (e.g. wordpress stub)
    throw err;
  }

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const isTpl = extname(entry.name) === '.tpl';
    const destName = isTpl ? basename(entry.name, '.tpl') : entry.name;
    const destPath = join(targetDir, destName);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath, tokens);
    } else if (isTpl) {
      const raw = await readFile(srcPath, 'utf-8');
      await writeFile(destPath, applyTokens(raw, tokens), 'utf-8');
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}
```

- [ ] **Step 4: Run tests — expect most to pass, some to fail on missing templates**

```bash
npm test
```

Expected: `applyTokens` and `resolveTemplateDirs` tests pass. `scaffold` tests will fail because `templates/` doesn't exist yet — that is correct at this stage.

- [ ] **Step 5: Commit the implementation**

```bash
mkdir -p src
git add src/scaffold.js test/scaffold.test.js
git commit -m "test(scaffold): add scaffold tests and implement scaffold.js"
```

---

### Task 3: TDD — CLI Layer (cli.test.js + cli.js)

**Files:**
- Create: `test/cli.test.js`
- Create: `src/cli.js`

- [ ] **Step 1: Write all failing CLI unit tests**

Create `test/cli.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateProjectName, sanitizeProjectName, getGitConfig } from '../src/cli.js';

describe('validateProjectName', () => {
  it('returns error message for empty string', () => {
    expect(validateProjectName('')).toMatch(/required/i);
  });

  it('returns error message for whitespace-only string', () => {
    expect(validateProjectName('   ')).toMatch(/required/i);
  });

  it('returns error message for path traversal with ../', () => {
    expect(validateProjectName('../evil')).toMatch(/path traversal/i);
  });

  it('returns error message for path traversal with absolute path', () => {
    expect(validateProjectName('/etc/passwd')).toMatch(/path traversal/i);
  });

  it('returns error message for names with special characters', () => {
    expect(validateProjectName('my project!')).toMatch(/invalid/i);
  });

  it('returns error message for names with spaces', () => {
    expect(validateProjectName('my project')).toMatch(/invalid/i);
  });

  it('returns undefined for valid lowercase name', () => {
    expect(validateProjectName('my-project')).toBeUndefined();
  });

  it('returns undefined for valid name with numbers', () => {
    expect(validateProjectName('project-2024')).toBeUndefined();
  });

  it('returns undefined for valid name with underscores', () => {
    expect(validateProjectName('my_project')).toBeUndefined();
  });

  it('returns undefined for single character name', () => {
    expect(validateProjectName('a')).toBeUndefined();
  });
});

describe('sanitizeProjectName', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeProjectName('  my-project  ')).toBe('my-project');
  });

  it('converts to lowercase', () => {
    expect(sanitizeProjectName('MyProject')).toBe('myproject');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizeProjectName('my project')).toBe('my-project');
  });

  it('replaces multiple consecutive spaces with a single hyphen', () => {
    expect(sanitizeProjectName('my  project')).toBe('my--project');
  });

  it('preserves hyphens', () => {
    expect(sanitizeProjectName('my-project')).toBe('my-project');
  });

  it('preserves underscores', () => {
    expect(sanitizeProjectName('my_project')).toBe('my_project');
  });

  it('handles already-valid name unchanged', () => {
    expect(sanitizeProjectName('valid-name')).toBe('valid-name');
  });
});

describe('getGitConfig', () => {
  it('returns a string value for user.name when git is configured', async () => {
    const result = await getGitConfig('user.name');
    // In CI or any machine with git configured, this returns a string.
    // We just verify it resolves to a string (may be empty).
    expect(typeof result).toBe('string');
  });

  it('returns empty string when git config key does not exist', async () => {
    const result = await getGitConfig('nonexistent.key.that.does.not.exist');
    expect(result).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: all `cli.test.js` tests fail with `Cannot find module '../src/cli.js'`.

- [ ] **Step 3: Implement src/cli.js**

Create `src/cli.js`:

```js
import { execSync } from 'child_process';

export function validateProjectName(name) {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return 'Project name is required';
  if (trimmed.includes('..') || trimmed.startsWith('/')) return 'Invalid project name: path traversal is not allowed';
  if (!/^[a-z0-9_-]+$/i.test(trimmed)) return 'Invalid project name: use only letters, numbers, hyphens, and underscores';
  return undefined;
}

export function sanitizeProjectName(name) {
  return name.trim().toLowerCase().replace(/ /g, '-');
}

export async function getGitConfig(key) {
  try {
    return execSync(`git config --get ${key}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

export async function promptUser(initialName = '') {
  // Dynamic import so tests can mock @clack/prompts without side effects at import time
  const p = await import('@clack/prompts');

  p.intro('create-gulp-khup');

  const authorName = await getGitConfig('user.name');
  const authorEmail = await getGitConfig('user.email');

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
      projectType: () =>
        p.select({
          message: 'Project type?',
          options: [
            { value: 'web', label: 'Static HTML', hint: 'recommended' },
            { value: 'wordpress', label: 'WordPress', hint: 'coming soon' },
            { value: 'email', label: 'Email', hint: 'coming soon' },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel('Cancelled — no files were created.');
        process.exit(0);
      },
    }
  );

  return values;
}
```

- [ ] **Step 4: Run tests — all should pass**

```bash
npm test
```

Expected: all `cli.test.js` tests pass. `scaffold.test.js` tests for `applyTokens` and `resolveTemplateDirs` still pass. Scaffold file-system tests still fail (templates don't exist yet).

- [ ] **Step 5: Commit**

```bash
git add src/cli.js test/cli.test.js
git commit -m "test(cli): add CLI tests and implement cli.js"
```

---

### Task 4: Implement bin/create.js

**Files:**
- Create: `bin/create.js`

- [ ] **Step 1: Create the bin directory and entry point**

```bash
mkdir bin
```

Create `bin/create.js`:

```js
#!/usr/bin/env node

import * as p from '@clack/prompts';
import { promptUser, sanitizeProjectName } from '../src/cli.js';
import { scaffold } from '../src/scaffold.js';

const rawArg = process.argv[2];
const initialName = rawArg ? sanitizeProjectName(rawArg) : '';

const values = await promptUser(initialName);
const projectName = sanitizeProjectName(values.projectName);

p.log.step(`Scaffolding ${projectName}...`);

try {
  await scaffold({ ...values, projectName });
  p.outro(`Done! Run:\n\n  cd ${projectName}\n  npm install\n  gulp`);
} catch (err) {
  p.log.error(err.message);
  process.exit(1);
}
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x bin/create.js
```

- [ ] **Step 3: Smoke test the binary locally (skip actual prompts)**

```bash
node bin/create.js --help 2>&1 || true
```

Expected: The script starts (you will see the `@clack/prompts` intro). Ctrl+C to exit cleanly.

- [ ] **Step 4: Commit**

```bash
git add bin/create.js
git commit -m "feat: add bin/create.js CLI entry point"
```

---

### Task 5: Build templates/base/ — Shared Gulp 5 Files

**Files:**
- Create: `templates/base/` (all files listed below)

The Archive at `/path/to/_code/Archive/generators/app/templates/all/` contains the source
material. Copy and adapt each file as described.

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p templates/base/gulp/tasks
mkdir -p templates/web/src/{css,img,js,templates}
mkdir -p templates/wordpress
mkdir -p templates/email
```

- [ ] **Step 2: Create templates/base/package.json.tpl**

This is the `package.json` for the GENERATED project (not the scaffolder). Copy from
`Archive/generators/app/templates/all/package.json` and add the `<%= %>` tokens:

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
    "fancy-log": "^2.0.0",
    "gulp": "^5.0.1",
    "gulp-cached": "^1.1.1",
    "gulp-changed": "^5.0.3",
    "gulp-flatmap": "^1.0.2",
    "gulp-htmlmin": "^5.0.1",
    "gulp-imagemin": "^9.1.0",
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
    "postcss": "^8.5.6",
    "sass": "^1.93.2",
    "ssh2-sftp-client": "^12.0.1",
    "through2": "^4.0.2"
  }
}
```

- [ ] **Step 3: Copy and adapt gulp/ support files from Archive**

Copy the following files from `Archive/generators/app/templates/all/gulp/` into
`templates/base/gulp/`:

- `commandLineArguments.js` → copy verbatim
- `errorHandler.js` → copy verbatim
- `globs.js` → copy verbatim

```bash
cp /path/to/_code/Archive/generators/app/templates/all/gulp/commandLineArguments.js templates/base/gulp/
cp /path/to/_code/Archive/generators/app/templates/all/gulp/errorHandler.js templates/base/gulp/
cp /path/to/_code/Archive/generators/app/templates/all/gulp/globs.js templates/base/gulp/
```

- [ ] **Step 4: Copy all Gulp 5 task files from Archive**

```bash
cp /path/to/_code/Archive/generators/app/templates/all/gulp/tasks/*.js templates/base/gulp/tasks/
cp /path/to/_code/Archive/generators/app/templates/web/gulp/tasks/*.js templates/base/gulp/tasks/
```

Verify the following tasks are present:
`build.js`, `clean.js`, `css.js`, `default.js`, `deploy.js`, `html.js`, `img.js`,
`inline.js`, `js.js`, `nunjucks.js`, `psi.js`, `size.js`, `static.js`, `watch.js`

```bash
ls templates/base/gulp/tasks/
```

- [ ] **Step 5: Copy gulpfile.js from Archive**

```bash
cp /path/to/_code/Archive/generators/app/templates/all/gulpfile.js templates/base/gulpfile.js
```

- [ ] **Step 6: Create templates/base/.gitignore**

```
node_modules/
dist/
.env
.DS_Store
*.log
```

- [ ] **Step 7: Create templates/base/CHANGELOG.md**

```markdown
# <%= appName %> | Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [Unreleased]

## [0.1.0] - <%= year %>

### Added

- Initial project scaffold via create-gulp-khup
```

Wait — CHANGELOG.md needs the year token. Add `year` to the tokens in `scaffold.js` (the current year at scaffold time):

In `src/scaffold.js`, update the `tokens` object:

```js
const tokens = {
  appName: projectName,
  appDescription: description,
  authorName,
  authorEmail,
  appVersion: '0.1.0',
  year: new Date().getFullYear().toString(),
};
```

- [ ] **Step 8: Create templates/base/README.md.tpl**

```markdown
# <%= appName %>

<%= appDescription %>

## Getting Started

```bash
npm install
gulp
```

## Task Index

| Task | Description |
|------|-------------|
| `gulp` | Build + watch (full workflow) |
| `gulp build` | Full build |
| `gulp watch` | Watch only (project must be pre-built) |
| `gulp css` | CSS pipeline |
| `gulp js` | JS pipeline |
| `gulp img` | Image optimisation |
| `gulp deploy --ftp` | Deploy via FTP |
| `gulp deploy --sftp` | Deploy via SFTP |
| `gulp --nomin` | Build with sourcemaps, no minification |

## Generated by

[create-gulp-khup](https://github.com/uncleSoWise/gulp-khup)
```

- [ ] **Step 9: Create templates/base/.env.example**

```
# FTP Deploy Settings
FTP_HOST=
FTP_USER=
FTP_PASSWORD=
FTP_REMOTE_PATH=/public_html/

# SFTP Deploy Settings  
SFTP_HOST=
SFTP_USER=
SFTP_KEY_PATH=~/.ssh/id_rsa
SFTP_REMOTE_PATH=/var/www/html/
```

- [ ] **Step 10: Create type stubs**

`templates/wordpress/README.md`:
```markdown
# WordPress Template

WordPress project type is coming in a future release of create-gulp-khup.
```

`templates/email/README.md`:
```markdown
# Email Template

Email project type is coming in a future release of create-gulp-khup.
```

- [ ] **Step 11: Create templates/web/src/ placeholder files**

Create `.gitkeep` files so empty directories are tracked:

```bash
touch templates/web/src/css/.gitkeep
touch templates/web/src/img/.gitkeep
touch templates/web/src/js/.gitkeep
touch templates/web/src/templates/.gitkeep
```

- [ ] **Step 12: Run scaffold tests to see how many now pass**

```bash
npm test
```

Expected: all scaffold file-system tests now pass (templates exist). Full suite should pass except edge-case tests that depend on implementation details. Fix any failures before continuing.

- [ ] **Step 13: Update tokens in scaffold.js for CHANGELOG year token** (if not done in Step 7)

Verify `src/scaffold.js` already has the `year` token from Step 7's edit. If not, add it now:

```js
const tokens = {
  appName: projectName,
  appDescription: description,
  authorName,
  authorEmail,
  appVersion: '0.1.0',
  year: new Date().getFullYear().toString(),
};
```

- [ ] **Step 14: Run full test suite — all tests must pass**

```bash
npm test
```

Expected: all tests green. If any fail, debug before committing.

- [ ] **Step 15: Commit**

```bash
git add templates/ src/scaffold.js
git commit -m "feat: add templates/ and complete scaffold implementation"
```

---

### Task 6: Reach 100% Coverage — Edge Case Tests

**Files:**
- Modify: `test/scaffold.test.js` (add edge case tests)

The coverage report from `npm run test:coverage` will show any uncovered lines. This task adds tests until all lines are covered.

- [ ] **Step 1: Run coverage report**

```bash
npm run test:coverage
```

Read the text output. Note any lines in `src/scaffold.js` or `src/cli.js` that show as uncovered.

- [ ] **Step 2: Add tests for uncovered lines in scaffold.js**

Common uncovered paths to add to `test/scaffold.test.js`:

```js
describe('scaffold — edge cases', () => {
  let tmpDir;
  let outDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-test-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('handles missing type-specific template directory gracefully (wordpress stub)', async () => {
    // wordpress only has a README stub — copyDir should not throw on empty/missing dirs
    await expect(scaffold({ ...defaults, outDir, projectType: 'wordpress' })).resolves.toBeUndefined();
  });

  it('creates nested subdirectories in templates', async () => {
    await scaffold({ ...defaults, outDir });
    // gulp/tasks/ is a nested directory — verify deep nesting is created
    await expect(access(join(outDir, 'gulp', 'tasks', 'css.js'))).resolves.toBeUndefined();
  });

  it('applies year token in CHANGELOG.md', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'CHANGELOG.md'), 'utf-8');
    expect(content).toContain(new Date().getFullYear().toString());
  });

  it('throws with descriptive message when output dir exists', async () => {
    await mkdir(outDir);
    await expect(scaffold({ ...defaults, outDir })).rejects.toThrow(outDir);
  });
});
```

- [ ] **Step 3: Run coverage again — must reach 100%**

```bash
npm run test:coverage
```

Expected: coverage report shows 100% lines, functions, branches, statements. If not, read the output, add more tests, and repeat.

- [ ] **Step 4: Commit**

```bash
git add test/scaffold.test.js test/cli.test.js
git commit -m "test: reach 100% line coverage"
```

---

### Task 7: Add npm Publish Workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create the publish workflow**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    name: npm publish
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run coverage check
        run: npm run test:coverage

      - name: Publish
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Before this workflow can run:** add an `NPM_TOKEN` secret to the GitHub repository
> (`Settings → Secrets and variables → Actions → New repository secret`).
> Generate the token at `https://www.npmjs.com/settings/<username>/tokens` (type: Automation).

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: add npm publish workflow on GitHub release"
```

---

### Task 8: Update README.md

**Files:**
- Modify: `README.md` (full rewrite)

- [ ] **Step 1: Rewrite README.md**

Replace the entire content of `README.md` with:

```markdown
# create-gulp-khup

Scaffold a Gulp 5 static-site project in seconds.

```bash
npm create gulp-khup@latest my-project
```

Or with npx:

```bash
npx create-gulp-khup my-project
```

## What Gets Generated

A complete Gulp 5 project for static marketing/agency sites:

```
my-project/
  gulpfile.js
  package.json
  .gitignore
  .env.example
  CHANGELOG.md
  README.md
  gulp/
    commandLineArguments.js   # CLI flags: --nomin, --nobs, --ftp, --sftp
    errorHandler.js           # Plumber error handler
    globs.js                  # All file path globs
    tasks/
      build.js                # Full build pipeline
      clean.js                # Delete /dist/
      css.js                  # SCSS → Dart Sass → PostCSS → cssnano
      deploy.js               # FTP/SFTP deployment
      html.js                 # Minify HTML
      img.js                  # Image optimisation
      js.js                   # esbuild JS bundling
      watch.js                # BrowserSync + file watching
      ...
  src/
    css/
    img/
    js/
    templates/                # Nunjucks templates
```

## Generated Project Tech Stack

| Concern | Tool |
|---------|------|
| Task runner | Gulp 5 |
| JS bundling | esbuild |
| CSS | Dart Sass + PostCSS + cssnano |
| HTML templating | Nunjucks |
| Linting/formatting | Biome |
| Dev server | BrowserSync |
| Deploy | ssh2-sftp-client (FTP/SFTP) |

## Running the Generated Project

```bash
cd my-project
npm install
gulp                  # Build + watch
gulp build            # Build only
gulp --nomin          # Build with sourcemaps, no minification
gulp deploy --ftp     # Deploy via FTP (configure .env first)
```

## Contributing

See [AGENTS.md](AGENTS.md) for AI agent guidance and [TODO.md](TODO.md) for the roadmap.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README.md for create-gulp-khup npm package"
```

---

### Task 9: Update AGENTS.md and copilot-instructions.md for Phase 2

**Files:**
- Modify: `AGENTS.md`
- Modify: `.github/copilot-instructions.md`

- [ ] **Step 1: Update AGENTS.md**

Replace the content of `AGENTS.md` with the Phase 2 version:

```markdown
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
  cli.js                 # @clack/prompts interactive prompt flow + input validation
  scaffold.js            # Template file copying + <%= token %> substitution
templates/
  base/                  # Shared Gulp 5 task suite (all project types)
    gulpfile.js
    package.json.tpl
    gulp/tasks/          # build, clean, css, deploy, html, img, js, watch, ...
  web/                   # Static HTML project src/ scaffold
  wordpress/             # Stub (coming soon)
  email/                 # Stub (coming soon)
test/
  scaffold.test.js       # Generated file existence, content, token substitution
  cli.test.js            # Argument parsing, validation, sanitization
```

## Key Commands

```bash
npm install                    # Install scaffolder dependencies
npm test                       # Run Vitest test suite
npm run test:coverage          # Run with v8 coverage report (100% target)
npm run test:watch             # Watch mode for TDD
node bin/create.js my-project  # Run the scaffolder locally
```

## Conventions

- **ESM throughout** — `"type": "module"`, all files use `import`/`export`
- **No build step** — source IS the published package
- **Template tokens** — `.tpl` files use `<%= tokenName %>` syntax; tokens are camelCase
- **One runtime dep** — only `@clack/prompts`; use Node.js built-ins for everything else
- **Commit style** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

## Testing

- Framework: Vitest
- Coverage: 100% lines/functions/branches target (enforced in `vitest.config.js`)
- Write failing test FIRST, then implement (TDD)
- Scaffold tests: use `mkdtemp` + `afterEach` cleanup; never leave temp dirs behind
- CLI tests: unit-test `validateProjectName`, `sanitizeProjectName`, `getGitConfig` in isolation

## Template Conventions (Generated Projects)

Generated projects use the Gulp 5 stack. When editing template files in `templates/`:

- Gulp 5 tasks use `export default` — no `gulp.task()` string registration
- All paths via `globs.js` — never hardcode `/src/` or `/dist/` in task files
- All pipelines use `plumber(errorHandler)`
- JS bundling: esbuild (not Browserify/Babel)
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Linting: Biome (not ESLint/Prettier)

## Roadmap

See `TODO.md` and `docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md`.
```

- [ ] **Step 2: Update .github/copilot-instructions.md**

Replace the Phase 1 content with:

```markdown
# Copilot Instructions for create-gulp-khup

## What This Repo Is
`create-gulp-khup` is a `create-*` npm scaffolder (repo: `gulp-khup`) that generates
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

### Prompts
- Use `@clack/prompts` — do NOT use `inquirer`, `readline`, or `prompts`
- Ctrl+C must exit cleanly with a message, never a stack trace

## Template Task Conventions (Generated Projects)

When editing files inside `templates/`:
- Gulp 5 tasks: `export default taskFn` — no `gulp.task('name', fn)` string form
- All file paths from `globs.js` — never hardcode paths in task files
- All `gulp.src()` pipelines must use `.pipe(plumber(errorHandler))`
- JS: esbuild (not Browserify)
- CSS: Dart Sass via `gulp-sass` v6 + `sass` package
- Linting: Biome (not ESLint/Prettier)

## Testing Rules
- Vitest only — do NOT use Jest
- Write failing test FIRST
- 100% line coverage is the target — any exclusion requires a comment with rationale
- Never hit the real filesystem outside of scaffold.test.js (use `vi.mock` for unit tests)
- Never leave temp directories behind — `afterEach(() => rm(tmpDir, { recursive: true }))`

## PR Requirements
- `npm test` passes
- `npm run test:coverage` shows 100% coverage
- `npm audit --audit-level=high` exits 0
- CHANGELOG.md updated for user-facing changes
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md .github/copilot-instructions.md
git commit -m "docs: update AGENTS.md and copilot-instructions.md for Phase 2"
```

---

### Task 10: Final Verification, Merge to main, Release v1.0.0

**Files:**
- Modify: `package.json` (version `1.0.0-beta.1` → `1.0.0`)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Run the full test suite with coverage — must be 100%**

```bash
npm run test:coverage
```

Expected: all tests green, 100% lines/functions/branches/statements.

- [ ] **Step 2: Run npm audit — must be clean**

```bash
npm audit --audit-level=high
```

Expected: exit code 0.

- [ ] **Step 3: End-to-end smoke test — scaffold a real project**

```bash
cd /tmp
node /path/to/gulp-khup/bin/create.js smoke-test-project
# Complete the prompts, then:
cd smoke-test-project
npm install
gulp build
```

Expected: `gulp build` completes without errors. Inspect `/tmp/smoke-test-project/dist/` to confirm output.

Clean up:

```bash
rm -rf /tmp/smoke-test-project
```

- [ ] **Step 4: Bump version to 1.0.0**

In `package.json`, change:

```json
"version": "1.0.0-beta.1",
```

to:

```json
"version": "1.0.0",
```

- [ ] **Step 5: Update CHANGELOG.md**

Add the Phase 2 release entry above the existing content:

```markdown
## [1.0.0] - 2026-07-15

### Added

- `bin/create.js` — CLI entry point: `npm create gulp-khup@latest my-project`
- `src/cli.js` — interactive prompt flow via `@clack/prompts`
- `src/scaffold.js` — template file copying with `<%= token %>` substitution
- `templates/base/` — Gulp 5 task suite (esbuild, Dart Sass, Biome, BrowserSync)
- `templates/web/` — Static HTML project scaffold
- Vitest test suite with 100% line coverage
- GitHub Actions npm publish workflow
- `AGENTS.md` and `.github/copilot-instructions.md` updated for new architecture

### Changed

- Package name: `gulp-khup` → `create-gulp-khup`
- Package is now public (`private: false`)
- Module system: Babel/CJS → native ESM (`"type": "module"`)
- JS bundling: Browserify + Babel → esbuild
- CSS: LibSass → Dart Sass
- Linting/formatting: ESLint + Prettier → Biome
- Deploy: `vinyl-ftp` + `gulp-sftp` → `ssh2-sftp-client`

### Removed

- All legacy gulp-task dependencies from package.json (now in `templates/base/package.json.tpl`)
- `gulpfile.babel.js` and `gulp/` top-level directory (moved into `templates/`)
- `.babelrc`, `.eslintrc`, `.browserslistrc`, `.prettierrc`, `.prettierignore` (legacy config)
```

- [ ] **Step 6: Commit final version bump**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.0 for release"
```

- [ ] **Step 7: Push the `next` branch and open a PR**

```bash
git push origin next
```

Open a PR from `next` → `main` on GitHub. The CI workflow will run. Verify it passes.

- [ ] **Step 8: Merge the PR to main**

After CI is green, merge the PR (squash or merge commit — your preference).

- [ ] **Step 9: Tag and create GitHub Release v1.0.0**

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0 — create-gulp-khup scaffolder"
git push origin v1.0.0
```

Create the GitHub Release:

```bash
gh release create v1.0.0 \
  --title "v1.0.0 — create-gulp-khup Scaffolder" \
  --notes "First stable release of create-gulp-khup.

## Usage

\`\`\`bash
npm create gulp-khup@latest my-project
\`\`\`

Scaffolds a complete Gulp 5 static-site project with esbuild, Dart Sass, Biome, and BrowserSync.

See CHANGELOG.md for the full list of changes."
```

The GitHub Release triggers the publish workflow. Monitor at
`https://github.com/uncleSoWise/gulp-khup/actions` — when green, the package is live on npm.

- [ ] **Step 10: Verify the published package**

```bash
npm info create-gulp-khup
```

Expected: package metadata showing version `1.0.0`.

Then do a final real-world test:

```bash
cd /tmp
npm create gulp-khup@latest final-verify
cd final-verify && npm install && gulp build
rm -rf /tmp/final-verify
```

---

## Done

Phase 2 is complete when:
- [ ] `npm create gulp-khup@latest my-project` works from npm registry
- [ ] Generated project: `npm install && gulp build` runs without errors
- [ ] `npm run test:coverage` shows 100% line coverage
- [ ] `npm audit --audit-level=high` exits 0
- [ ] GitHub Release `v1.0.0` exists and CI is green
- [ ] `next` branch is merged to `main`
