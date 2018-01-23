// *************************************
//
//   gulp-khup
//
// *************************************
//
// Available tasks:
//
//   `gulp build`
//   `gulp clean`
//   `gulp css`
//   `gulp default`
//   `gulp deploy`
//   `gulp html`
//   `gulp img`
//   `gulp js`
//   `gulp mustache`
//   `gulp psi`
//   `gulp size`
//   `gulp static`
//   `gulp watch`
//
//   `gulp`
//   `gulp b`
//   `gulp c`
//   `gulp d`
//   `gulp w`
//
// *************************************

import dotEnv from 'dotenv';
import gulp from 'gulp';
import buildTask from './gulp/tasks/build';
import cleanTask from './gulp/tasks/clean';
import cssTask from './gulp/tasks/css';
import defaultTask from './gulp/tasks/default';
import deployTask from './gulp/tasks/deploy';
import eslintTask from './gulp/tasks/eslint';
import htmlTask from './gulp/tasks/html';
import imgTask from './gulp/tasks/img';
import jsTask from './gulp/tasks/js';
import mustacheTask from './gulp/tasks/mustache';
import psiTask from './gulp/tasks/psi';
import sizeTask from './gulp/tasks/size';
import staticTask from './gulp/tasks/static';
import watchTask from './gulp/tasks/watch';

// Load environment-specific variables
dotEnv.config();

// Define gulp tasks
gulp.task('build', buildTask);
gulp.task('clean', cleanTask);
gulp.task('css', cssTask);
gulp.task('default', defaultTask);
gulp.task('deploy', deployTask);
gulp.task('eslint', eslintTask);
gulp.task('html', htmlTask);
gulp.task('img', imgTask);
gulp.task('js', jsTask);
gulp.task('mustache', mustacheTask);
gulp.task('psi', psiTask);
gulp.task('size', sizeTask);
gulp.task('static', staticTask);
gulp.task('watch', watchTask);

// Define gulp task alias
gulp.task('b', buildTask);
gulp.task('c', cleanTask);
gulp.task('d', deployTask);
gulp.task('w', watchTask);
