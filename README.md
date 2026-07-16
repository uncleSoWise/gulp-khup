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

A complete Gulp 5 project for static marketing and agency sites:

```
my-project/
  gulpfile.js
  package.json
  .gitignore
  .nvmrc
  .env.example
  biome.json
  CHANGELOG.md
  README.md
  gulp/
    commandLineArguments.js   # CLI flags: --nomin, --nobs, --ftp, --sftp
    errorHandler.js           # Plumber error handler
    globs.js                  # All file path globs
    tasks/
      build.js                # Full build pipeline
      clean.js                # Delete /dist/
      css.js                  # Dart Sass → PostCSS → cssnano
      deploy.js               # FTP/SFTP deployment
      html.js                 # Minify HTML
      img.js                  # Image optimisation
      js.js                   # esbuild JS bundling
      nunjucks.js             # Nunjucks template rendering
      watch.js                # BrowserSync + file watching
      ...
  src/
    scss/                     # Sass source files
    js/                       # JavaScript source
    img/                      # Images
    fonts/                    # Web fonts
    *.njk                     # Nunjucks templates
```

## Generated Project Tech Stack

| Concern | Tool |
|---------|------|
| Task runner | Gulp 5 |
| JS bundling | esbuild |
| CSS | Dart Sass + PostCSS + cssnano |
| HTML templating | Nunjucks |
| Linting / formatting | Biome |
| Dev server | BrowserSync |
| Deploy | ssh2-sftp-client (FTP/SFTP) |

## Running the Generated Project

```bash
cd my-project
npm install
gulp                    # Build + watch (full workflow)
gulp build              # Build only
gulp --nomin            # Build with sourcemaps, no minification
gulp deploy --ftp       # Deploy via FTP  (configure .env first)
gulp deploy --sftp      # Deploy via SFTP (configure .env first)
```

## Requirements

Node.js 18 or higher is required to run `create-gulp-khup`.
The generated project also targets Node 18+.

## Contributing

See [AGENTS.md](AGENTS.md) for AI agent guidance and [TODO.md](TODO.md) for the roadmap.
