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

### Changed

* moved configuration settings from `/gulp/config.js` to their singular file
  homes
* `gulp`, `gulp deploy`, `gulp psi` and `gulp watch` all rely on CLI arguments
  rather than `gulpflow` config file settings

### Removed

* `/gulp/config.js` in favor of CLI arguments
* csscomb package
* gulp-util package

## [0.1.0] - 2017-10-25

### Added

* Repo config files
* Gulp tasks, config, utils
* Docs

## [0.0.0] - 2017-10-22

### Added

* Repo initial commit
