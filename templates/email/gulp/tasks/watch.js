// -------------------------------------
//   Task: watch
// -------------------------------------
//
// - check CLI arguments for BrowserSync and deploy settings
// - BrowserSync will manage refresh and device sync
// - BrowserSync uses /dist/ as base for the server
// - listen for changes in /src/ and run tasks
//
// -------------------------------------

import browserSync from 'browser-sync';
import chalk from 'chalk';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import cssTask from './css.js';
import htmlTask from './html.js';
import imgTask from './img.js';
import inlineTask from './inline.js';
import nunjucksTask from './nunjucks.js';
import staticTask from './static.js';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const serverInitTask = (cb) => {
  browserSync.init(
    {
      files: [globs.to.html],
      ghostMode: false,
      notify: false,
      open: false,
      port: 9000,
      server: {
        baseDir: [globs.to.serve]
      }
    },
    cb
  );
};

const watchFilesTask = (cb) => {
  // Watch .html files
  gulp.watch(globs.to.watch.html, gulp.series(htmlTask, cssTask, inlineTask));

  // Watch .njk files
  gulp.watch(
    globs.to.watch.nunjucks,
    gulp.series(nunjucksTask, cssTask, inlineTask)
  );

  // Watch .scss files
  gulp.watch(
    globs.to.watch.scss,
    gulp.series(cssTask, htmlTask, nunjucksTask, inlineTask)
  );

  // Watch image files
  gulp.watch(globs.to.watch.img, gulp.parallel(imgTask));

  // Watch misc files
  gulp.watch(globs.to.watch.static, gulp.parallel(staticTask));

  // Watch files for upload
  const options = {
    interval: 5000,
    debounceDelay: 5000
  };
  const watcher = gulp.watch(globs.to.watch.deploy, options, () => {
    cb(null);
  });

  return cb(null);
};

const watchTask = (cb) => {
  let taskStream;
  taskStream = gulp.series(watchFilesTask)(cb);

  // enable BrowserSync unless disabled by CLI parameters
  if (!commandLineArguments.nobs && !commandLineArguments.nobrowsersync) {
    taskStream = gulp.series(serverInitTask, watchFilesTask)(cb);
  }

  return taskStream;
};
watchTask.description = 'watch for changes in /src/ and run tasks';

export default watchTask;
