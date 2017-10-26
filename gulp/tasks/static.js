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
import notify from 'gulp-notify';
import globs from '../globs';

const staticTask = () => {
    return gulp.src(globs.to.static)
        .pipe(cache('static'))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(notify({ message: 'static task complete', onLast: true }));
};
staticTask.description = 'copy static files without changes';

export default staticTask;
