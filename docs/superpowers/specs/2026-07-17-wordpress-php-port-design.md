# WordPress PHP Port Design

> **Status:** Approved — ready for implementation planning

## Overview

Port the Archive's battle-tested WordPress theme boilerplate into `templates/wordpress/`, add WP 6.0+ modernizations (`theme.json`, native block pattern), and expose a new `appSlug` scaffold token. The result: `npm create gulp-khup@latest my-theme` scaffolds a complete, working WordPress theme — PHP templates, functions, and compiled assets — not just a Gulp pipeline.

---

## Goals

- Complete WordPress theme: PHP templates + functions + Gulp pipeline in one scaffold
- Future-proof: WP 6.0+ `theme.json` Global Styles, native `patterns/` auto-discovery
- ACF-optional: all ACF calls wrapped in `function_exists()` guards — theme works out of the box
- No lost Archive knowledge: Google Fonts example stays in `config.php`, nav walker ported intact

---

## Constraints

- Target WordPress 6.0+ (LTS, released May 2022)
- No `@wordpress/scripts` build tooling — blocks use standard `block.json` descriptor only, compiled by esbuild as-is
- PHP files go in `src/` — copied to `dist/` by the existing `staticGlobs` (`**/*.php`) — no Gulp changes needed
- `theme.json` and `patterns/*.php` go in `src/` — static task handles `**/*.json` and `**/*.php` already
- One new scaffold token: `appSlug` (dashes → underscores for PHP identifiers)

---

## New Scaffold Token

| Token | Value | Usage |
|-------|-------|-------|
| `appSlug` | `projectName.replace(/-/g, '_')` | PHP function prefix throughout (`<%= appSlug %>_enqueue_scripts`) |

Added to `src/scaffold.js` tokens map alongside existing tokens.

---

## File Map

All new files live in `templates/wordpress/src/` (static task copies them to `dist/`).

### New: Theme Root

| File | Source | Notes |
|------|--------|-------|
| `style.css.tpl` | Archive `style.css` | WP theme header — tokens: `appName`, `appSlug`, `appDescription`, `appVersion`, `authorName` |
| `functions.php` | Archive | Requires all sub-modules; adds `stop_404_guessing()` |
| `theme.json` | **New** | WP 6.0+ Global Styles v2 — palette + typography + spacing matching `_variables.scss` tokens |

### New: `functions/`

| File | Source | Notes |
|------|--------|-------|
| `config.php` | Archive | Prefix updated; Google Fonts example kept; **fix**: use `wp_enqueue_scripts` hook (Archive used `wp_footer`/`init`); add `add_theme_support('editor-styles')`, `'wp-block-styles'`, `'responsive-embeds'` |
| `gutenberg.php` | Archive | Prefix updated; block type allowlist, editor CSS/JS enqueue |
| `plugins.php` | Archive | All ACF hooks wrapped in `function_exists('get_field')`; Gravity Forms hooks wrapped in `function_exists('GFForms')` |
| `search.php` | Archive | Entire ACF search block wrapped in `if(function_exists('acf_get_field_groups'))` |
| `utils.php` | Archive | Prefix updated; pagination, `goThroughBlocks()` helper |
| `walkers/Walker_Nav_Menu_Custom.php` | Archive | No changes — pure PHP, no ACF |

### New: PHP Templates

| File | Source | Notes |
|------|--------|-------|
| `header.php` | Archive | ACF code-injection calls (`get_field('code_head', 'options')`) wrapped in `if(function_exists('get_field'))` |
| `footer.php` | Archive | `get_field('code_before_close_body', 'options')` guarded |
| `index.php` | Archive | **B**: ACF block JSON kept with hex keys replaced by `'YOUR_FIELD_KEY'` + `// TODO` comments; `get_field()` calls guarded |
| `page.php` | Archive | Minimal template |
| `single.php` | Archive | Minimal template |
| `404.php` | Archive | Port verbatim |
| `inc/loop.php` | Archive | **Simplified**: ACF image fields replaced with `get_the_post_thumbnail()` |
| `inc/loop-search.php` | Archive | Port verbatim |

### New: WP 6.0+ Additions

| File | Source | Notes |
|------|--------|-------|
| `patterns/hero.php` | **New** | Native WP block pattern — `register_block_pattern()` header comment + Group/Heading/Paragraph markup; no ACF |

---

## Modernizations vs Archive

| # | Change | Reason |
|---|--------|--------|
| 1 | `pnmg_` → `<%= appSlug %>_` prefix | Token-based — works for any project name |
| 2 | `wp_footer`/`init` hooks → `wp_enqueue_scripts` | Archive had a bug — styles and scripts should use `wp_enqueue_scripts` |
| 3 | Google Fonts kept in `config.php` | Example stays for reference — team removes/replaces per project |
| 4 | Author URI: `http://pnmg.com/` → `<%= authorName %>` | Generic |
| 5 | `wpThemeSlug` token → `appName`/`appSlug` | Consolidates to existing scaffold token names |
| 6 | ACF calls guarded | `function_exists()` wrappers — theme works without ACF Pro |
| 7 | Add `add_theme_support('wp-block-styles')` | Required for WP 6.0+ block styles to load in theme context |
| 8 | `theme.json` added | Global Styles — palette/typography/spacing match `_variables.scss` design tokens |
| 9 | `patterns/hero.php` added | Native WP 6.0+ auto-discovery pattern — no PHP registration needed |
| 10 | `index.php` ACF block keys → `'YOUR_FIELD_KEY'` + `// TODO` | Hardcoded hex keys are project-specific and would silently fail in a new project; placeholder pattern preserved |

---

## `theme.json` Design

Minimal v2 schema. Colors mirror `_variables.scss` tokens. Disables WP's default palette so theme palette is the only option in the editor.

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
      "spacingScale": { "operator": "*", "increment": 1.5, "steps": 5, "mediumStep": 1, "unit": "rem" }
    }
  }
}
```

---

## `patterns/hero.php` Design

Auto-discovered by WP 6.0+ (no PHP registration needed). Uses native core blocks.

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
  <h1>Welcome to Your Theme</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>Edit this hero pattern to get started.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

---

## Acceptance Criteria

1. `npm create gulp-khup@latest my-theme` → choose WordPress → scaffolded project contains all 18+ new files
2. `gulp build` succeeds on the WordPress scaffold (no build errors)
3. No `pnmg_` prefix remains in any scaffolded file
4. All scaffold tests pass
5. WordPress 6.0+ recognises the theme: `style.css` header is valid, `theme.json` loads without errors, `patterns/hero.php` appears in the block editor pattern library
