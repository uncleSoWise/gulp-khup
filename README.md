# gulp-khup [0.1.0]

A mostly reasonable gulpsheet written in ES6 modules for modest projects.

## Getting Started

* be sure node, npm, yarn and gulp-cli are installed
* run `npm install` or `yarn` to install all required packages for development
* run `gulp` to build a new project and load the watch tasks
* code stuff and let gulp do the grunt work for you

## Directory Structure / Scaffolding

### root

Project and text-editor configuration files reside in the project repo root. The main `gulpfile` lives here along side the CHANGELOG, README and other essential config files.

### /dist/

Compiled code and optimized assets are built here from `/src/`. BrowserSync uses this directory for local development. The `watch` task looks at this directory and performs tasks when files change.

### /gulp/

All gulp tasks, config files and support files reside here.

### /src/

Here’s where the work is done. The files open in your text editor of choice should all be working in `/src/`.

## Working with gulp-khup

### gulpfile.babel.js

The `gulpfile` is the entry point to all gulp configuration. Configuration and task development have been made as modular as possible.

Environment-specific variables are loaded securely through `.env` which is NOT under version control. The `gulpfile` then loads in all the gulp tasks in a very specific order.

### /gulp/config.js

Settings for `gulpflow` and `npm` packages should be called from the `config` object that is loaded from `config.js`.

Default `npm` configurations include:

* Autoprefixor browser settings
* Base64 inline image file size limits
* PageSpeedInsights URL for testing with `psi` CLI

Default `gulpflow` booleans determine if:

* `deploy` should use FTP for file uploads
* `deploy` should use SFTP for file uploads
* `watch` should use BrowserSync

The config file for the `gulpfile` configures settings for `npm` packages such as Autoprefixer and BrowserSync.

Boolean settings for `gulpflow` allow for enabling or disabling deploying by FTP/SFTP during watch. BrowserSync and `critical` CSS generation can similarly be turned on or off.

### /gulp/errorHandler.js

The common error handling function should be called from the `errorHandler` object that is loaded from `error.js`

Error messages will display without breaking the `watch` workflow zen.

### /gulp/globs.js

Globs and file path references should be called from the `globs` object that is loaded from `globs.js`.

If a project requires `gulp` to be somewhere other than `root`, basic file paths can be updated in the variables at the top of the file which will then cascade down into the exported module.

### .env

Environment-specific variables are stored here. This file is under the `.gitignore` file list to prevent sensitive and secure information from being committed to the Git repo.

Use this file to store deploy connection host settings, database information, usernames and passwords. By default the `deploy` task will reference this file.

## Task Workflow

In practice, running `gulp` should be the only command required for workflow zen. Gulp will build the complete project, spin up BrowserSync for local development and watch files.

Gulp will actively watch files and run tasks accordingly on file change. If everything is working, the developer should only need to head back to the terminal to cancel the `watch` task with Ctrl+C at the end of work. Workflow zen is achieved with a “set it and forget it” mentality in the land of gulp.

However, there are a great deal of sub-tasks that can still be called directly outside of this workflow. Calling tasks by name can be useful when debugging, while developing new features or simply for calling a specific task on demand for better/faster performance.

**Example:** If the project is already built and waiting, jump right into the action with `gulp watch` and get to coding.

## Task Index and Overview

Every defined task listed by terminal command and a brief description.

**NOTE:**Some tasks may contain sub-routines that are not explicitly expressed here.

### `gulp`

The default task can also be called with `gulp default`, but why waste the effort on extra characters. Calls `build` and then `watch`.

### `gulp build` or `gulp b`

First `/dist/` is nuked with `clean` and then the build order for tasks is called. Next `img`, `html`, `mustache`, `css`, `js`, `static` and `inline` tasks are all called to build a complete project to `/dist/`.

### `gulp clean` or `gulp c`

Deletes `/dist/` completely. Scorched earth. Only the directory itself remains.

### `gulp css`

Builds the main stylesheet from the SCSS project files. Runs the CSS through Autoprefixer to manage browser vendor prefixes. CSS is formatted and organized with CSS Comb. Images less than 8kb are base64 inlined. PX units are converted to REM units. A minified version is created along side the working version. A third version for use with inline style blocks is also created. All three files are moved into place in `/dist/`.

A CSS browser reset is created from `normalize.css` and built into the `reset.scss` partial in `/src/`.

### `gulp deploy` or `gulp d`

Deploy complete project to server as defined by `.env` environment-specific variables. Uses FTP or SFTP depending on `gulpflow` booleans in `config.js`.

### `gulp eslint`

Run ESLint on JS files in `/src/`.

### `gulp html`

Correct special text characters erroneously copy pasted into the HTML and minify.

### `gulp img`

Losslessly compresses image assets and moves them into place. Handles JPG, PNG, GIF and SVG file types.

### `gulp inline`

Inline scripts directly into HTML for performance gains. Use boolean HTML attribute `inline` to target scripts and links for inline.

### `gulp js`

Creates the master theme JS file from all JS assets and moves vendor files as needed. Handles concatenation, minification, sourcemaps and moving vendor files into place.

### `gulp lint`

Run all the various linters on files in `/src/`.

### `gulp mustache`

Contains all the power of `html` but with the distinction of building `.mustache` template files into HTML first.

### `gulp psi`

Run tests with Google PageSpeed Insights. One test runs for mobile and one for desktop. Supply the URL to be tested in `config.js`. The CLI has a limit of 5s per result set, which is better than the web interfaces 60s turn around time on cached results.

### `gulp sasslint`

Run Sass Lint on SCSS files in `/src/`.

### `gulp size`

Quick and dirty local performance audit. Output file size reports on `/dist/`.

### `gulp static`

Moves miscellaneous files from `/src/` into place in `/dist/`. This task carbon copies files without affecting changes. This manages root level assets such as configuration and icon files. Handles `/fonts/` and other theme assets by default.

### `gulp watch` or `gulp w`

Listens for changes in `/src/` and builds to `/dist/`. Listens for changes in `/dist/` and deploys to remote server. File transfer work is time intensive, so `gulp` only uploads the files in need, as needed.

Set `gulpflow` booleans in `config.js` to enable or disable:

* deploy by FTP or SFTP on file change
* start BrowserSync on `watch`

If BrowserSync is enabled, `watch` creates a secure public URL to share your local sites with any Internet-connected device on the local network. Perfect for browser and device testing. Great for collaborative work without all the “ok hit refresh” chat spam back and forth.

BrowserSync will manage browser refresh and device sync on file change and uses `/dist/` as base for the server. The terminal provides all the URLs needed for making use of BrowserSync. Develop using these URLs and NOT with a simple local-file approach.

    [BS] Access URLs:
    --------------------------------
           Local: http://localhost:9000
        External: http://10.1.10.235:9000
    --------------------------------
              UI: http://localhost:3001
     UI External: http://10.1.10.235:3001
    --------------------------------
    [BS] Serving files from: dist/

## Task Workflow Shortcuts

The major workflow tasks come with shortcut commands for the lazy developer.

* `gulp` == `gulp default`
* `gulp b` == `gulp build`
* `gulp c` == `gulp clean`
* `gulp d` == `gulp deploy`
* `gulp w` == `gulp watch`

## Notes

**[gulp-khup]** is written in the syntax of [Gulp 4.0](https://github.com/gulpjs/gulp/tree/4.0). This allows for use of some features like `since`, `series` and `parallel`. See the [GitHub page](https://github.com/gulpjs/gulp) for code examples.

**[gulp-khup]** is designed to be a starting off point for projects. Some projects will require adding new tasks or updates to the existing tasks.

## Author

#### Richard Deslauriers

* [twitter.com/uncleSoWise](https://twitter.com/uncleSoWise)
* [github.com/uncleSoWise](https://github.com/uncleSoWise)
* [bitbucket.org/uncleSoWise](https://bitbucket.org/uncleSoWise)

## Helpful Resources

Knowing is half the battle.

* [http://gulpjs.com/](http://gulpjs.com/)
* [https://markgoodyear.com/2014/01/getting-started-with-gulp/](https://markgoodyear.com/2014/01/getting-started-with-gulp/)
* [http://makina-corpus.com/blog/metier/2015/make-your-gulp-modular](http://makina-corpus.com/blog/metier/2015/make-your-gulp-modular)
* [http://moonshotproject.github.io/moondash/building/packaging/2014/11/26/modular-gulp.html](http://moonshotproject.github.io/moondash/building/packaging/2014/11/26/modular-gulp.html)
* [https://bugsnag.com/blog/replacing-the-rails-asset-pipeline-with-gulp](https://bugsnag.com/blog/replacing-the-rails-asset-pipeline-with-gulp)
* [http://drewbarontini.com/articles/building-a-better-gulpfile/](http://drewbarontini.com/articles/building-a-better-gulpfile/)
* [http://macr.ae/article/splitting-gulpfile-multiple-files.html](http://macr.ae/article/splitting-gulpfile-multiple-files.html)

## License

MIT
