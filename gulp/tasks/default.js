// -------------------------------------
//   Task: default
// -------------------------------------
//
// - default task for gulp
//
// -------------------------------------

import gulp from 'gulp';
import buildTask from './build';
import watchTask from './watch';

const defaultTask = (cb) => {
    return gulp.series(buildTask, watchTask)(cb);
};
defaultTask.description = 'build a new project and watch for changes';

export default defaultTask;
