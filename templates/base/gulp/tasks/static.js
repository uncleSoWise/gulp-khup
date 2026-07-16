/* eslint-disable quotes */
/* eslint-disable import/extensions */
// -------------------------------------
//   Task: static
// -------------------------------------
//
// - cache files for `watch`
// - copy static files from /src/ to /dist/
// - carbon copy without changes
//
// -------------------------------------

import gulp from 'gulp';
import cache from 'gulp-cached';
import globs from '../globs.js';

const staticTask = () => {
  return gulp
    .src(globs.to.static, { encoding: false })
    .pipe(cache('static'))
    .pipe(gulp.dest(globs.to.dist));
};
staticTask.description = 'copy static files without changes';

export default staticTask;
