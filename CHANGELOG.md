# gulp-khup | Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Added

* `/gulp/commandLineArguments.js` to fetch CLI arguments
* eslint task
* lint task
* prettier task
* sasslint task
* nunjucks task
* gulp-nunjucks package
* marked package
* nunjucks package
* nunjucks-markdown package
* through2 package
* babelify package

### Changed

* moved configuration settings from `/gulp/config.js` to their singular file
  homes
* `gulp`, `gulp deploy`, `gulp psi` and `gulp watch` all rely on CLI arguments
  rather than `gulpflow` config file settings
* minification is managed via command line arguments and there are no longer
  `.min` files output
* disable file minification with `--nomin` command line argument
* enable sourcemaps for `gulp js` and `gulp css` with `--nomin` command line
  argument
* update `gulp js` to use `babelify` to allow for ES6 style authoring `import`
* remove `gulp-cache` from html and js tasks

### Fixed

* sasslint task now uses `gulp-sass-lint` and pipeline configuration correctly
* files made for inline during `gulp css` are now correctly prefixed `.inline`
  rather than renaming all files to `inline.css` which is very confusing with
  multiple theme files

### Removed

* `/gulp/config.js` in favor of CLI arguments
* mustache task
* csscomb package
* gulp-util package
* gulp-mustache package

## [0.1.0] - 2017-10-25

### Added

* Repo config files
* Gulp tasks, config, utils
* Docs

## [0.0.0] - 2017-10-22

### Added

* Repo initial commit
