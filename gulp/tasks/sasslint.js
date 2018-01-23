// -------------------------------------
//   Task: sasslint
// -------------------------------------
//
// - Sass Lint SCSS files
//
// -------------------------------------

import gulp from 'gulp';
import sasslint from 'gulp-eslint';
import globs from '../globs';

const sasslintTask = () => {
    return gulp
        .src([globs.to.scss])
        .pipe(sasslint())
        .pipe(sasslint.format())
        .pipe(sasslint.failAfterError());
};
sasslintTask.description = 'Sass Lint SCSS files';

export default sasslintTask;
