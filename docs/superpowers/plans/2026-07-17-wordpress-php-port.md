# WordPress PHP Port Implementation Plan (#76)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Archive's WordPress theme boilerplate into `templates/wordpress/src/`, add `theme.json` + a native block pattern, and expose an `appSlug` scaffold token — so `npm create gulp-khup@latest` scaffolds a complete, working WordPress theme.

**Architecture:** All new PHP/JSON/CSS files live in `templates/wordpress/src/`. The existing static task (`staticGlobs`) already copies `**/*.php`, `**/*.json`, and `**/*.css` to `dist/` — no Gulp changes needed. One new token (`appSlug`) added to `src/scaffold.js`. TDD: write failing tests first for each task, then add files.

**Tech Stack:** PHP 8.0+, WordPress 6.0+, ACF (guarded — optional), Vitest (scaffold test harness)

**Branch:** `feat/wordpress-php-port` off `develop`

**Spec:** `docs/superpowers/specs/2026-07-17-wordpress-php-port-design.md`

---

## File Map

| Action | File | Task |
|--------|------|------|
| Modify | `src/scaffold.js` | 1 |
| Create | `templates/wordpress/src/style.css.tpl` | 2 |
| Create | `templates/wordpress/src/theme.json` | 3 |
| Create | `templates/wordpress/src/functions.php` | 4 |
| Create | `templates/wordpress/src/functions/config.php` | 4 |
| Create | `templates/wordpress/src/functions/gutenberg.php` | 4 |
| Create | `templates/wordpress/src/functions/plugins.php` | 4 |
| Create | `templates/wordpress/src/functions/search.php` | 4 |
| Create | `templates/wordpress/src/functions/utils.php` | 4 |
| Create | `templates/wordpress/src/functions/walkers/Walker_Nav_Menu_Custom.php` | 4 |
| Create | `templates/wordpress/src/header.php` | 5 |
| Create | `templates/wordpress/src/footer.php` | 5 |
| Create | `templates/wordpress/src/index.php` | 5 |
| Create | `templates/wordpress/src/page.php` | 5 |
| Create | `templates/wordpress/src/single.php` | 5 |
| Create | `templates/wordpress/src/404.php` | 5 |
| Create | `templates/wordpress/src/inc/loop.php` | 5 |
| Create | `templates/wordpress/src/inc/loop-search.php` | 5 |
| Create | `templates/wordpress/src/patterns/hero.php` | 6 |
| Modify | `test/scaffold.test.js` | 1–6 |

---

## Task 1: `appSlug` Token + Failing Tests

**Files:**
- Modify: `src/scaffold.js`
- Modify: `test/scaffold.test.js`

- [ ] **Step 1: Add `appSlug` token to scaffold.js**

  In `src/scaffold.js`, add to the tokens map:
  ```js
  appSlug: projectName.replace(/-/g, '_'),
  ```

- [ ] **Step 2: Write failing tests for all WordPress PHP additions**

  Add a new describe block to `test/scaffold.test.js`:
  ```js
  describe('scaffold — WordPress PHP theme port (#76)', () => {
    let tmpDir, outDir;
    const wpDefaults = {
      projectName: 'my-wp-theme',
      description: 'A WordPress theme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      projectType: 'wordpress',
    };

    beforeEach(async () => {
      tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-wp76-'));
      outDir = join(tmpDir, 'output');
      await scaffold({ ...wpDefaults, outDir });
    });

    afterEach(async () => {
      await rm(tmpDir, { recursive: true, force: true });
    });

    it('generates style.css with theme header tokens substituted', async () => {
      const { readFile } = await import('fs/promises');
      const content = await readFile(join(outDir, 'style.css'), 'utf-8');
      expect(content).toContain('Theme Name: my-wp-theme');
      expect(content).toContain('Test Author');
      expect(content).not.toContain('pnmg');
      expect(content).not.toContain('<%= ');
    });

    it('generates theme.json', async () => {
      await expect(access(join(outDir, 'theme.json'))).resolves.toBeUndefined();
    });

    it('theme.json is valid JSON', async () => {
      const { readFile } = await import('fs/promises');
      const content = await readFile(join(outDir, 'theme.json'), 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('generates functions.php', async () => {
      await expect(access(join(outDir, 'functions.php'))).resolves.toBeUndefined();
    });

    it('generates all functions/ sub-modules', async () => {
      for (const file of [
        'functions/config.php',
        'functions/gutenberg.php',
        'functions/plugins.php',
        'functions/search.php',
        'functions/utils.php',
        'functions/walkers/Walker_Nav_Menu_Custom.php',
      ]) {
        await expect(access(join(outDir, file)), file).resolves.toBeUndefined();
      }
    });

    it('generated PHP files contain no pnmg_ prefix', async () => {
      const { readFile } = await import('fs/promises');
      const phpFiles = [
        'functions.php',
        'functions/config.php',
        'functions/gutenberg.php',
        'functions/plugins.php',
        'functions/utils.php',
        'header.php',
        'footer.php',
        'index.php',
      ];
      for (const file of phpFiles) {
        const content = await readFile(join(outDir, file), 'utf-8');
        expect(content, `${file} should not contain pnmg_`).not.toContain('pnmg_');
      }
    });

    it('functions/config.php uses wp_enqueue_scripts hook', async () => {
      const { readFile } = await import('fs/promises');
      const content = await readFile(join(outDir, 'functions/config.php'), 'utf-8');
      expect(content).toContain("add_action( 'wp_enqueue_scripts'");
      expect(content).not.toContain("add_action( 'wp_footer'");
      expect(content).not.toContain("add_action('init', 'pnmg");
    });

    it('functions/plugins.php wraps ACF calls in function_exists()', async () => {
      const { readFile } = await import('fs/promises');
      const content = await readFile(join(outDir, 'functions/plugins.php'), 'utf-8');
      expect(content).toContain('function_exists');
    });

    it('generates all PHP template files', async () => {
      for (const file of [
        'header.php', 'footer.php', 'index.php',
        'page.php', 'single.php', '404.php',
        'inc/loop.php', 'inc/loop-search.php',
      ]) {
        await expect(access(join(outDir, file)), file).resolves.toBeUndefined();
      }
    });

    it('generates patterns/hero.php', async () => {
      await expect(access(join(outDir, 'patterns/hero.php'))).resolves.toBeUndefined();
    });

    it('index.php contains YOUR_FIELD_KEY placeholder for ACF block keys', async () => {
      const { readFile } = await import('fs/promises');
      const content = await readFile(join(outDir, 'index.php'), 'utf-8');
      expect(content).toContain('YOUR_FIELD_KEY');
    });
  });
  ```

- [ ] **Step 3: Run tests — confirm they all fail**
  ```bash
  npm test
  ```

- [ ] **Step 4: Commit the tests and the `appSlug` token change**
  ```bash
  git add src/scaffold.js test/scaffold.test.js
  git commit -m "test: add failing tests for WordPress PHP port (#76)"
  ```

---

## Task 2: `style.css.tpl`

**Files:**
- Create: `templates/wordpress/src/style.css.tpl`

- [ ] **Step 1: Create `style.css.tpl`**

  Matches the Archive's `style.css`, updated tokens:
  ```css
  /*
  Theme Name: <%= appName %>
  Theme URI:
  Description: <%= appDescription %>
  Author: <%= authorName %>
  Author URI:
  Text Domain: <%= appSlug %>
  License: GPL-2.0-or-later
  License URI: https://www.gnu.org/licenses/gpl-2.0.html
  Version: <%= appVersion %>
  */
  ```

- [ ] **Step 2: Run tests — confirm style.css tests pass, rest still fail**
  ```bash
  npm test
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add templates/wordpress/src/style.css.tpl
  git commit -m "feat: add style.css.tpl WordPress theme header (#76)"
  ```

---

## Task 3: `theme.json`

**Files:**
- Create: `templates/wordpress/src/theme.json`

Note: `theme.json` is NOT a `.tpl` file — no token substitution needed (tokens in the pattern slug come later in `patterns/hero.php`). The static task copies `**/*.json` verbatim.

- [ ] **Step 1: Create `templates/wordpress/src/theme.json`**

  ```json
  {
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 2,
    "settings": {
      "color": {
        "defaultPalette": false,
        "palette": [
          { "slug": "primary",   "color": "#0073aa", "name": "Primary" },
          { "slug": "secondary", "color": "#005177", "name": "Secondary" },
          { "slug": "text",      "color": "#1d2327", "name": "Text" },
          { "slug": "bg",        "color": "#ffffff", "name": "Background" }
        ]
      },
      "typography": {
        "defaultFontSizes": false,
        "fontSizes": [
          { "slug": "sm",  "size": "0.875rem", "name": "Small" },
          { "slug": "md",  "size": "1rem",     "name": "Medium" },
          { "slug": "lg",  "size": "1.25rem",  "name": "Large" },
          { "slug": "xl",  "size": "1.5rem",   "name": "X-Large" },
          { "slug": "2xl", "size": "2rem",     "name": "2X-Large" }
        ]
      },
      "spacing": {
        "spacingScale": {
          "operator": "*", "increment": 1.5, "steps": 5, "mediumStep": 1, "unit": "rem"
        }
      }
    }
  }
  ```

- [ ] **Step 2: Run tests — confirm theme.json tests pass**
  ```bash
  npm test
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add templates/wordpress/src/theme.json
  git commit -m "feat: add theme.json WP 6.0+ Global Styles (#76)"
  ```

---

## Task 4: `functions.php` and `functions/` Sub-modules

**Files:**
- Create: `templates/wordpress/src/functions.php`
- Create: `templates/wordpress/src/functions/config.php`
- Create: `templates/wordpress/src/functions/gutenberg.php`
- Create: `templates/wordpress/src/functions/plugins.php`
- Create: `templates/wordpress/src/functions/search.php`
- Create: `templates/wordpress/src/functions/utils.php`
- Create: `templates/wordpress/src/functions/walkers/Walker_Nav_Menu_Custom.php`

**Source:** Archive `functions/` directory — apply these transforms to every file:
- `pnmg_` → `<%= appSlug %>_`
- `<%= wpThemeSlug %>` → `<%= appSlug %>`
- Author URI `http://pnmg.com/` → remove or leave blank
- `<%= appName %>` already matches

**Additional changes per file:**

`functions.php` — port verbatim (require list + stop_404_guessing), update prefix

`functions/config.php` — port verbatim EXCEPT:
  - Move `pnmg_newtheme_styles` hook from `wp_footer` to `wp_enqueue_scripts`
  - Move `pnmg_newtheme_scripts` hook from `init` to `wp_enqueue_scripts`
  - Remove the `is_admin()` guards inside the functions (the `wp_enqueue_scripts` hook does not fire in admin)
  - Add `add_theme_support('editor-styles')`, `add_theme_support('wp-block-styles')`, `add_theme_support('responsive-embeds')` to `pnmg_newtheme_setup`
  - Keep Google Fonts `font_url()` example as-is (just update prefix)

`functions/plugins.php` — wrap all ACF code in `if (function_exists('get_field')) { ... }`, wrap all GFForms code in `if (class_exists('GFForms')) { ... }`

`functions/search.php` — wrap entire file content in `if (function_exists('acf_get_field_groups')) { ... }`

`functions/utils.php` — port verbatim, update prefix

`functions/walkers/Walker_Nav_Menu_Custom.php` — port verbatim (no ACF, no prefix changes)

- [ ] **Step 1: Create `functions.php`** (port from Archive, update prefix tokens)

- [ ] **Step 2: Create `functions/config.php`** (port + enqueue hook fix + theme support additions)

- [ ] **Step 3: Create `functions/gutenberg.php`** (port, update prefix)

- [ ] **Step 4: Create `functions/plugins.php`** (port, add `function_exists` guards)

- [ ] **Step 5: Create `functions/search.php`** (port, wrap in `function_exists('acf_get_field_groups')`)

- [ ] **Step 6: Create `functions/utils.php`** (port, update prefix)

- [ ] **Step 7: Create `functions/walkers/Walker_Nav_Menu_Custom.php`** (port verbatim)

- [ ] **Step 8: Run tests — confirm functions tests pass**
  ```bash
  npm test
  ```

- [ ] **Step 9: Commit**
  ```bash
  git add templates/wordpress/src/functions.php templates/wordpress/src/functions/
  git commit -m "feat: port functions.php and functions/ sub-modules from Archive (#76)"
  ```

---

## Task 5: PHP Template Files

**Files:**
- Create: `templates/wordpress/src/header.php`
- Create: `templates/wordpress/src/footer.php`
- Create: `templates/wordpress/src/index.php`
- Create: `templates/wordpress/src/page.php`
- Create: `templates/wordpress/src/single.php`
- Create: `templates/wordpress/src/404.php`
- Create: `templates/wordpress/src/inc/loop.php`
- Create: `templates/wordpress/src/inc/loop-search.php`

**Source:** Archive `templates/wordpress/` — apply these transforms:
- `<%= wpThemeSlug %>` → `<%= appSlug %>`
- `pnmg_` → `<%= appSlug %>_`

**Additional changes per file:**

`header.php` — wrap all `get_field()` calls in `if (function_exists('get_field')) { ... }`:
  - `get_field('code_head', 'options')`
  - `get_field('code_after_open_body', 'options')`

`footer.php` — wrap `get_field('code_before_close_body', 'options')` in `function_exists` guard

`index.php`:
  - Wrap `get_field()` calls in guard
  - Replace ACF block field keys with `'YOUR_FIELD_KEY'` and add `// TODO: replace with your ACF field keys` comment:
    ```php
    // TODO: replace these with your project's ACF field keys (found in ACF > Field Groups)
    "_headline": "YOUR_FIELD_KEY",
    "_copy": "YOUR_FIELD_KEY",
    "_use_images": "YOUR_FIELD_KEY"
    ```

`page.php`, `single.php`, `404.php` — port verbatim with token updates

`inc/loop.php` — replace `get_field()` image lookup with `get_the_post_thumbnail()` fallback, wrap remaining `get_field()` calls in guard

`inc/loop-search.php` — port verbatim with token updates

- [ ] **Step 1: Create `header.php`**

- [ ] **Step 2: Create `footer.php`**

- [ ] **Step 3: Create `index.php`** (with YOUR_FIELD_KEY placeholders)

- [ ] **Step 4: Create `page.php`, `single.php`, `404.php`**

- [ ] **Step 5: Create `inc/loop.php`** (simplified image fallback)

- [ ] **Step 6: Create `inc/loop-search.php`**

- [ ] **Step 7: Run tests — confirm PHP template tests pass**
  ```bash
  npm test
  ```

- [ ] **Step 8: Commit**
  ```bash
  git add templates/wordpress/src/
  git commit -m "feat: port PHP template files from Archive (#76)"
  ```

---

## Task 6: `patterns/hero.php`

**Files:**
- Create: `templates/wordpress/src/patterns/hero.php`

Note: `patterns/` is auto-discovered by WP 6.0+. The slug header comment is the registration mechanism. Pattern slug uses the theme text domain (`appSlug`).

- [ ] **Step 1: Create `templates/wordpress/src/patterns/hero.php`**

  ```php
  <?php
  /**
   * Title: Hero
   * Slug: <%= appSlug %>/hero
   * Categories: featured
   * Description: Full-width hero section with heading and intro text.
   */
  ?>
  <!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
  <div class="wp-block-group alignfull">

    <!-- wp:heading {"level":1} -->
    <h1 class="wp-block-heading">Welcome to Your Theme</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">Edit this hero pattern in <code>patterns/hero.php</code> to get started.</p>
    <!-- /wp:paragraph -->

  </div>
  <!-- /wp:group -->
  ```

  > **Note:** `patterns/hero.php` contains `<%= appSlug %>` so it must be renamed `patterns/hero.php.tpl` so scaffold.js applies token substitution. Rename the file accordingly.

- [ ] **Step 2: Run all tests — confirm everything green**
  ```bash
  npm test
  ```

- [ ] **Step 3: Update snapshot (package.json changed? No — but check)**
  ```bash
  node_modules/.bin/vitest run -u
  ```

- [ ] **Step 4: Integration smoke test — scaffold a WordPress project and verify files**
  ```bash
  node --input-type=module <<'EOF'
  import { scaffold } from './src/scaffold.js';
  await scaffold({
    projectName: 'wp-smoke-test',
    description: 'WP smoke test',
    authorName: 'CI',
    authorEmail: 'ci@example.com',
    projectType: 'wordpress',
    cwd: '/tmp',
  });
  EOF
  ls /tmp/wp-smoke-test/
  cat /tmp/wp-smoke-test/functions.php
  cat /tmp/wp-smoke-test/theme.json
  grep 'YOUR_FIELD_KEY' /tmp/wp-smoke-test/index.php
  grep 'wp_smoke_test' /tmp/wp-smoke-test/functions/config.php
  ```

- [ ] **Step 5: Commit**
  ```bash
  git add templates/wordpress/src/patterns/
  git commit -m "feat: add native WP 6.0+ block pattern patterns/hero.php (#76)"
  ```

---

## Finish

- [ ] Push branch and open PR against `develop`
  ```bash
  git push -u origin feat/wordpress-php-port
  ```
- [ ] PR description: closes #76, lists all new files, confirms smoke test output
- [ ] Merge, delete branch
- [ ] Update `CHANGELOG.md` and bump to `v1.3.0` (minor — new feature)
