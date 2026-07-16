// -------------------------------------
//   Task: watch (WordPress)
// -------------------------------------
//
// - BrowserSync proxies a local WordPress installation
// - set WP_URL in .env (default: http://localhost:8888)
// - listen for changes in /src/ and run tasks
//
// -------------------------------------

import browserSync from 'browser-sync';
import chalk from 'chalk';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import cssTask from './css.js';
import imgTask from './img.js';
import jsTask from './js.js';
import staticTask from './static.js';
import commandLineArguments from '../commandLineArguments.js';
import globs from '../globs.js';

const serverInitTask = (cb) => {
  const wpUrl = process.env.WP_URL || 'http://localhost:8888';

  fancyLog(chalk.cyan(`BrowserSync proxying: ${wpUrl}`));

  browserSync.init(
    {
      proxy: wpUrl,
      open: false,
      port: 9000,
      notify: false,
    },
    cb
  );
};

const watchFilesTask = (cb) => {
  // Watch .scss files
  gulp.watch(globs.to.watch.scss, gulp.series(cssTask));

  // Watch .js files
  gulp.watch(globs.to.watch.js, gulp.series(jsTask));

  // Watch image files
  gulp.watch(globs.to.watch.img, gulp.parallel(imgTask));

  // Watch misc static files
  gulp.watch(globs.to.watch.static, gulp.parallel(staticTask));

  return cb(null);
};

const watchTask = (cb) => {
  if (!commandLineArguments.nobs && !commandLineArguments.nobrowsersync) {
    return gulp.series(serverInitTask, watchFilesTask)(cb);
  }
  return gulp.series(watchFilesTask)(cb);
};
watchTask.description = 'proxy local WordPress and watch for file changes';

export default watchTask;
