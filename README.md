# create-gulp-khup

Scaffold a complete Gulp 5 project in seconds — static marketing sites, WordPress themes, or HTML email campaigns.

```bash
npm create gulp-khup@latest my-project
```

Or with npx:

```bash
npx create-gulp-khup my-project
```

The CLI prompts for project name, description, author, and **project type** (web / wordpress / email), then generates a ready-to-run project.

---

## Project Types

### `web` — Static HTML / Marketing Site

Nunjucks templates, Dart Sass, esbuild, BrowserSync, SFTP deploy.

```
my-project/
  gulpfile.js
  package.json
  biome.json
  .env.example          # SFTP credentials
  .nvmrc
  gulp/
    globs.js
    commandLineArguments.js
    errorHandler.js
    tasks/
      build.js          # Full pipeline: clean → css + js + img + nunjucks + html + static → inline
      clean.js
      css.js            # Dart Sass → PostCSS → cssnano (+ critical inline CSS)
      deploy.js         # SFTP deployment via ssh2-sftp-client
      html.js           # html-minifier-terser
      img.js            # sharp (JPEG/PNG/WebP/AVIF) + svgo (SVG)
      js.js             # esbuild bundling
      nunjucks.js       # Nunjucks → HTML
      watch.js          # BrowserSync + file watching + live SFTP on change
      ...
  src/
    scss/               # Dart Sass source
    js/                 # JavaScript source
    img/
    fonts/
    *.njk               # Nunjucks page templates
```

| Concern | Tool |
|---------|------|
| Task runner | Gulp 5 |
| JS bundling | esbuild |
| CSS | Dart Sass + PostCSS + cssnano |
| HTML templating | Nunjucks |
| Image optimisation | sharp + svgo |
| HTML minification | html-minifier-terser |
| Linting / formatting | Biome |
| Dev server | BrowserSync |
| Deploy | SFTP via ssh2-sftp-client |

```bash
cd my-project && npm install
gulp              # Build + watch
gulp build        # Build only
gulp --nomin      # Build with sourcemaps, no minification
gulp deploy --sftp  # Deploy to server (configure .env first)
```

---

### `wordpress` — WordPress Theme

Complete PHP theme boilerplate + Gulp 5 asset pipeline + WP 6.0+ modernizations.

```
my-theme/
  gulpfile.js
  package.json
  .env.example          # SFTP credentials (deploys to wp-content/themes/<name>/)
  src/
    style.css           # WordPress theme header (Theme Name, Text Domain, Version)
    theme.json          # WP 6.0+ Global Styles — colour palette, typography, spacing
    functions.php       # Requires all sub-modules
    functions/
      config.php        # wp_enqueue_scripts, image sizes, login page, menu registration
      gutenberg.php     # Block editor CSS/JS, allowed block types
      plugins.php       # ACF + Gravity Forms hooks (guarded — works without plugins)
      search.php        # ACF field search (guarded)
      utils.php         # Pagination, goThroughBlocks(), phone formatters
      walkers/
        Walker_Nav_Menu_Custom.php  # BEM class nav walker
    header.php
    footer.php
    index.php           # Blog loop (ACF block JSON with YOUR_FIELD_KEY placeholders)
    page.php
    single.php
    404.php
    inc/
      loop.php
      loop-search.php
    patterns/
      hero.php          # Native WP 6.0+ block pattern (auto-discovered, no registration)
    scss/               # Dart Sass source → dist/css/
    js/                 # JavaScript source → dist/js/
    img/
```

**Key points:**
- PHP template files live in `src/` and are copied to `dist/` by the static task, then SFTP-deployed to the theme root
- All ACF calls are guarded with `function_exists('get_field')` — theme works without ACF Pro
- `theme.json` disables WP's default palette and font sizes; uses design tokens matching `_variables.scss`
- `index.php` preserves the ACF block JSON pattern from the Archive — replace `YOUR_FIELD_KEY` with your project's ACF field keys
- The function prefix uses the `appSlug` token (`my-theme` → `my_theme_`)

```bash
cd my-theme && npm install
gulp build          # Compile CSS/JS/images/PHP → dist/
gulp deploy --sftp  # Deploy dist/ to WordPress theme directory
```

---

### `email` — HTML Email (Campaign Monitor)

Table-based HTML email template suite for Campaign Monitor, with Nunjucks partials and CSS inlining.

```
my-email/
  gulpfile.js
  package.json
  src/
    _layout.njk           # Master layout (tables, wrapper, head)
    index.njk             # Starter email
    inc/
      _css.njk            # All email CSS (inlined by gulp-inline-css at build time)
      _header.njk         # Header with logo
      _preheader.njk      # Preheader text row
      _footer.njk         # Footer with copyright and links
      layout/             # Reusable content blocks
        _headline.njk
        _one-col.njk
        _two-col-image.njk
        _three-col-image.njk
        _copy-left-image.njk
        _copy-right-image.njk
        _one-col-image.njk
        _divider.njk
        _subhead.njk
    img/
```

**Campaign Monitor merge tags** used throughout (replaced by CM at send time):
- `<currentyear>` — current year in footer copyright
- `<webversion>` — link to web version in preheader
- `<unsubscribe>` — unsubscribe link in footer
- `<singleline label="...">` — editable single-line regions

**Gmail note:** Gmail strips `@media` queries — this is expected. `gulp-inline-css` inlines all base styles at build time, ensuring Gmail compatibility. Responsive breakpoints apply to all other clients (Apple Mail, Outlook, iOS Mail, Samsung Mail).

```bash
cd my-email && npm install
gulp build    # Nunjucks → HTML → inline CSS → dist/
gulp watch    # Watch + BrowserSync
```

---

## Requirements

Node.js 18 or higher is required to run `create-gulp-khup`. Generated projects also target Node 18+.

---

## Scaffold Tokens

These values are substituted into `.tpl` files during scaffolding:

| Token | Value |
|-------|-------|
| `appName` | Project name as entered |
| `appSlug` | Project name with dashes → underscores (PHP-safe identifier) |
| `appDescription` | Short description |
| `authorName` | Author name (pre-filled from `git config user.name`) |
| `authorEmail` | Author email (pre-filled from `git config user.email`) |
| `appVersion` | `0.1.0` |
| `year` | Current year |
| `inSubFolder` | Empty string (Nunjucks path prefix, web type) |

---

## Contributing

See [AGENTS.md](AGENTS.md) for codebase architecture, conventions, and AI agent guidance.

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) prefixes + [cbea.ms rules](https://cbea.ms/git-commit/) (imperative, ≤72 chars, body explains why)
- **Changelog:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) — update `## [Unreleased]` with every user-facing change
- **Roadmap:** See [TODO.md](TODO.md)
