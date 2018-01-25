// -------------------------------------
//   Task: lint
// -------------------------------------
//
// - Run ESLint and Sass Lint
//
// -------------------------------------

import gulp from 'gulp';
import eslintTask from './eslint';
import sasslintTask from './sasslint';

const lintTask = (cb) => {
    return gulp.parallel(eslintTask, sasslintTask)(cb);
};
lintTask.description = 'lint JS and SCSS';

export default lintTask;
