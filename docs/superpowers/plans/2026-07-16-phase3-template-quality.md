# Phase 3 — Template Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close issues #75, #71, #72, and #73 — add a CI integration smoke test, remove dead ESLint comments from templates, remove the deprecated `psi` task, and strip `vinyl-ftp` in favour of SFTP-only deployment.

**Architecture:** All four tasks land on `phase3/template-quality` off `develop`. Each task commits independently. Tasks 2–4 follow TDD: write a failing test that checks generated-project output, then make the change so it passes. Task 1 (CI) is validated by pushing and watching the workflow run. No scaffold.js or CLI changes needed for any task — all changes are in templates, CI workflow, and tests.

**Tech Stack:** Node.js 20 (CI), Vitest (test harness), GitHub Actions, Gulp 5 (generated project), SFTP only via `ssh2-sftp-client`.

**Branch:** `phase3/template-quality` (already created, 102 tests passing)

---

## File Map

| Action | File | Task |
|--------|------|------|
| Modify | `.github/workflows/ci.yml` | #75 |
| Modify | `templates/base/gulpfile.js` | #71 #72 |
| Modify | `templates/base/gulp/tasks/*.js` (11 files) | #71 |
| Modify | `templates/web/gulp/tasks/deploy.js` | #71 #73 |
| Modify | `templates/web/gulp/tasks/js.js` | #71 |
| Modify | `templates/web/src/js/lib/_sliders.js` | #71 |
| Delete | `templates/web/gulp/tasks/psi.js` | #72 |
| Modify | `templates/base/package.json.tpl` | #72 #73 |
| Modify | `templates/base/.env.example` | #73 |
| Modify | `templates/web/.env.example` | #73 |
| Modify | `test/scaffold.test.js` | #71 #72 #73 |

---

## Task 1: CI Integration Smoke Test (#75)

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the `integration` job to `ci.yml`**

  Append after the existing `test` job. The job scaffolds a fresh web project, installs its deps, and runs `gulp build`. Use `needs: test` so it only runs if unit tests pass.

  ```yaml
  integration:
    name: Integration Smoke Test
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install scaffolder dependencies
        run: npm install --ignore-scripts --legacy-peer-deps

      - name: Scaffold web project
        run: |
          node --input-type=module <<'EOF'
          import { scaffold } from './src/scaffold.js';
          await scaffold({
            projectName: 'smoke-test',
            description: 'CI integration smoke test',
            authorName: 'CI',
            authorEmail: 'ci@example.com',
            projectType: 'web',
            cwd: '/tmp',
          });
          EOF

      - name: Install generated project dependencies
        run: npm install --legacy-peer-deps
        working-directory: /tmp/smoke-test

      - name: Build generated project
        run: npx gulp build
        working-directory: /tmp/smoke-test
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add .github/workflows/ci.yml
  git commit -m "ci: add integration smoke test — scaffold → npm install → gulp build (#75)"
  ```

---

## Task 2: Remove `eslint-disable` Comments (#71)

All template task files carry `/* eslint-disable ... */` comments from the Yeoman Archive era. Generated projects use Biome, not ESLint.

**Files:**
- Modify: `templates/base/gulp/tasks/build.js`, `clean.js`, `css.js`, `default.js`, `html.js`, `img.js`, `inline.js`, `nunjucks.js`, `size.js`, `static.js`, `watch.js`
- Modify: `templates/base/gulpfile.js`
- Modify: `templates/web/gulp/tasks/deploy.js`, `js.js`, `psi.js` *(psi.js deleted in Task 3)*
- Modify: `templates/web/src/js/lib/_sliders.js`
- Test: `test/scaffold.test.js`

- [ ] **Step 1: Write failing test**

  In `test/scaffold.test.js`, add to the **"web template token substitution (bug fixes)"** describe block:

  ```js
  it('generated gulp task files contain no eslint-disable comments', async () => {
    const { readFile } = await import('fs/promises');
    const taskFiles = [
      'gulp/tasks/build.js',
      'gulp/tasks/css.js',
      'gulp/tasks/html.js',
      'gulp/tasks/img.js',
      'gulp/tasks/js.js',
      'gulp/tasks/nunjucks.js',
      'gulp/tasks/watch.js',
      'gulpfile.js',
    ];
    for (const file of taskFiles) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should have no eslint-disable`).not.toContain('eslint-disable');
    }
  });
  ```

- [ ] **Step 2: Run tests — confirm new test fails**

  ```bash
  npm test
  ```

- [ ] **Step 3: Strip eslint-disable comments**

  Remove every `/* eslint-disable ... */` line (full-line comments only, first line of each file). The easiest approach: use `sed` across all template JS files.

  ```bash
  find templates -name '*.js' -not -path '*/node_modules/*' | xargs sed -i '' '/\/\* eslint-disable/d'
  ```

  > **Note:** `_sliders.js` is a user-facing lib file in `templates/web/src/js/lib/`. Removing the ESLint disable comment there is correct — the generated project lints with Biome, not ESLint.

- [ ] **Step 4: Run tests — confirm all pass**

  ```bash
  npm test
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add templates/
  git commit -m "fix: remove vestigial eslint-disable comments from template files (#71)"
  ```

---

## Task 3: Remove Deprecated `psi` Task (#72)

**Files:**
- Delete: `templates/web/gulp/tasks/psi.js`
- Modify: `templates/base/gulpfile.js`
- Modify: `templates/base/package.json.tpl`
- Test: `test/scaffold.test.js`

- [ ] **Step 1: Write failing test**

  In `test/scaffold.test.js`, add to the **"web template token substitution (bug fixes)"** describe block:

  ```js
  it('generated package.json does not include psi dependency', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('psi');
  });

  it('generated gulpfile.js does not import psiTask', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).not.toContain('psiTask');
    expect(content).not.toContain('psi.js');
  });

  it('psi.js is not copied to generated project', async () => {
    await expect(access(join(outDir, 'gulp', 'tasks', 'psi.js'))).rejects.toThrow();
  });
  ```

- [ ] **Step 2: Run tests — confirm new tests fail**

  ```bash
  npm test
  ```

- [ ] **Step 3: Delete `templates/web/gulp/tasks/psi.js`**

  ```bash
  rm templates/web/gulp/tasks/psi.js
  ```

- [ ] **Step 4: Remove psiTask from `templates/base/gulpfile.js`**

  Remove:
  - The `gulp psi` line from the task list comment block
  - `import psiTask from './gulp/tasks/psi.js';`
  - `gulp.task('psi', psiTask);`

- [ ] **Step 5: Remove `psi` from `templates/base/package.json.tpl`**

  Remove the line:
  ```json
  "psi": "^4.1.0",
  ```

- [ ] **Step 6: Update the gulpfile snapshot**

  The existing `matches gulpfile.js snapshot` test will fail because gulpfile.js changed. Update the snapshot:

  ```bash
  npm test -- --update-snapshots
  ```

- [ ] **Step 7: Run all tests — confirm pass**

  ```bash
  npm test
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add templates/ test/
  git commit -m "fix: remove deprecated psi task — PSI v2 API is retired (#72)"
  ```

---

## Task 4: Remove `vinyl-ftp`, SFTP Only (#73)

**Files:**
- Modify: `templates/web/gulp/tasks/deploy.js`
- Modify: `templates/base/package.json.tpl`
- Modify: `templates/base/.env.example`
- Modify: `templates/web/.env.example`
- Test: `test/scaffold.test.js`

- [ ] **Step 1: Write failing test**

  In `test/scaffold.test.js`, add to the **"web template token substitution (bug fixes)"** describe block:

  ```js
  it('generated package.json does not include vinyl-ftp or fancy-log', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('vinyl-ftp');
    expect(pkg.devDependencies).not.toHaveProperty('fancy-log');
  });

  it('generated deploy.js does not reference FTP', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulp', 'tasks', 'deploy.js'), 'utf-8');
    expect(content).not.toContain('vinyl-ftp');
    expect(content).not.toContain('ftpTask');
    expect(content).not.toContain('fancyLog');
  });
  ```

- [ ] **Step 2: Run tests — confirm new tests fail**

  ```bash
  npm test
  ```

- [ ] **Step 3: Rewrite `templates/web/gulp/tasks/deploy.js`**

  Remove the entire FTP block. Keep only SFTP. New minimal structure:

  - Remove: `import fancyLog from "fancy-log";` and `import ftp from "vinyl-ftp";`
  - Delete: `ftpTask` function and its `.description`
  - In `deployTask`: remove the `if (commandLineArguments.ftp)` branch
  - Update `deployTask.description` to `"deploy /dist/ files to server via SFTP"`
  - Update the top-of-file comment block to remove FTP references

- [ ] **Step 4: Remove `vinyl-ftp` and `fancy-log` from `templates/base/package.json.tpl`**

  ```json
  // Remove:
  "fancy-log": "^2.0.0",
  "vinyl-ftp": "^0.6.1"
  ```

- [ ] **Step 5: Update `.env.example` files — remove FTP vars**

  **`templates/base/.env.example`:** Remove the FTP block:
  ```
  # FTP Deploy Settings
  FTP_HOST=
  FTP_USER=
  FTP_PASSWORD=
  FTP_REMOTE_PATH=/public_html/
  ```
  Keep only the SFTP block.

  **`templates/web/.env.example`:** Remove the FTP block (the two `# Dev` / `# Prod` FTP sections).

- [ ] **Step 6: Run all tests — confirm pass**

  ```bash
  npm test
  ```

- [ ] **Step 7: Verify smoke test still passes**

  Scaffold a fresh web project and run `gulp build` to confirm deploy.js still loads without errors (deploy task is lazy — just loading the module should not fail).

  ```bash
  node --input-type=module <<'EOF'
  import { scaffold } from './src/scaffold.js';
  await scaffold({ projectName: 'deploy-test', description: 'test', authorName: 'CI',
    authorEmail: 'ci@example.com', projectType: 'web', cwd: '/tmp' });
  EOF
  cd /tmp/deploy-test && npm install --legacy-peer-deps && npx gulp build
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add templates/ test/
  git commit -m "fix: remove vinyl-ftp — deploy task is now SFTP-only (#73)"
  ```

---

## Finish

- [ ] Push branch and open PR against `develop`

  ```bash
  git push -u origin phase3/template-quality
  ```

- [ ] Confirm CI passes: `audit` → `test` → `integration` all green
- [ ] Merge PR, delete branch
