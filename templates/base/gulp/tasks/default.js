// -------------------------------------
//   Task: default
// -------------------------------------
//
// - default task for gulp
//
// -------------------------------------

import gulp from 'gulp';
import buildTask from './build.js';
import watchTask from './watch.js';

const defaultTask = (cb) => {
  return gulp.series(buildTask, watchTask)(cb);
};
defaultTask.description = 'build a new project and watch for changes';

export default defaultTask;
