# AGENTS.md

Instructions for AI agents contributing to this repository.

## Repository Overview

**gulp-khup** is a Gulp 4 gulpsheet (starter template) for static marketing/agency site
projects. It is being modernized into a `create-gulp-khup` npm scaffolder — see `TODO.md`
and `docs/superpowers/specs/` for the full roadmap.

## Current Architecture (v0.1.1)

```
gulpfile.babel.js         # Entry point — registers all gulp tasks via @babel/register
gulp/
  commandLineArguments.js # CLI flag parsing: --nomin, --nobs, --ftp, --sftp, --url
  errorHandler.js         # Common plumber error handler — prevents watch crashes
  globs.js                # All file path globs (single source of truth for paths)
  tasks/
    build.js              # Series: clean → nunjucks → css → js → img → static → html
    clean.js              # Deletes /dist/
    css.js                # SCSS → CSS → autoprefixer → pxtorem → base64 → cssnano
    default.js            # Series: build → watch
    deploy.js             # FTP/SFTP deployment via vinyl-ftp / gulp-sftp
    eslint.js             # ESLint on JS source files
    html.js               # Copy + minify HTML from /src/
    img.js                # Compress images with gulp-imagemin
    inline.js             # Inline critical CSS/JS into HTML
    js.js                 # Browserify + Babel ES6 → ES5 → uglify
    lint.js               # Series: eslint + sasslint
    nunjucks.js           # Render Nunjucks templates from /src/templates/
    prettier.js           # Run Prettier on source files
    psi.js                # PageSpeed Insights test (requires --url flag)
    sasslint.js           # Sass linting via gulp-sass-lint
    size.js               # Report /dist/ output sizes
    static.js             # Copy static files (fonts, etc.) to /dist/
    watch.js              # BrowserSync dev server + file watching
```

## Key Commands

```bash
npm install --ignore-scripts   # Install (--ignore-scripts required on Node v18+)
gulp                           # Default: build + watch (full workflow)
gulp build                     # Full build only
gulp watch                     # Watch only (project must already be built)
gulp css                       # CSS pipeline only
gulp js                        # JS pipeline only
gulp img                       # Image optimisation only
gulp lint                      # Run eslint + sasslint
gulp deploy --ftp              # Deploy via FTP (requires .env)
gulp deploy --sftp             # Deploy via SFTP (requires .env)
gulp psi --url "https://…"     # PageSpeed Insights
gulp --nomin                   # Build with sourcemaps, no minification
gulp --nobs                    # Build without starting BrowserSync
```

## Conventions

- **ES modules via Babel** — all `gulp/` files use `import`/`export` compiled by `@babel/register`
- **Globs** — ALL file paths live in `gulp/globs.js`; never hardcode paths in task files
- **Error handling** — all `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- **CLI arguments** — task behavior is controlled exclusively via `commandLineArguments.js` flags
- **Commit style** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## Known Environment Constraint

`node-sass` does not compile on Node v18+. Always use `npm install --ignore-scripts`
when working with this repo on modern Node. This is fully resolved in Phase 2.

## Active Roadmap

See `TODO.md` for Phase 2 work items with GitHub Issue links.
See `docs/superpowers/specs/2026-07-15-gulp-khup-modernization-design.md` for the full design.
See `docs/superpowers/plans/` for step-by-step implementation plans.

Phase 2 transforms this gulpsheet into a `create-gulp-khup` npm scaffolder with:
- Gulp 5, esbuild, Dart Sass, Biome
- `npm create gulp-khup@latest my-project` CLI
- Full Vitest test suite with 100% line coverage
