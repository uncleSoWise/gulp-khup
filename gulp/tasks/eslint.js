// -------------------------------------
//   Task: eslint
// -------------------------------------
//
// - ESLint JS files
//
// -------------------------------------

import gulp from 'gulp';
import eslint from 'gulp-eslint';
import globs from '../globs';

const eslintTask = () => {
    return gulp
        .src([globs.to.js])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
};
eslintTask.description = 'ESLint JS files';

export default eslintTask;
