// *************************************
//
//   gulpflow — WordPress Theme
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
//   `gulp img`
//   `gulp js`
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

import buildTask from './gulp/tasks/build.js';
import cleanTask from './gulp/tasks/clean.js';
import cssTask from './gulp/tasks/css.js';
import defaultTask from './gulp/tasks/default.js';
import deployTask from './gulp/tasks/deploy.js';
import dotEnv from 'dotenv';
import gulp from 'gulp';
import imgTask from './gulp/tasks/img.js';
import jsTask from './gulp/tasks/js.js';
import sizeTask from './gulp/tasks/size.js';
import staticTask from './gulp/tasks/static.js';
import watchTask from './gulp/tasks/watch.js';

// Load environment-specific variables
dotEnv.config();

// Define gulp tasks
gulp.task('build', buildTask);
gulp.task('clean', cleanTask);
gulp.task('css', cssTask);
gulp.task('default', defaultTask);
gulp.task('deploy', deployTask);
gulp.task('img', imgTask);
gulp.task('js', jsTask);
gulp.task('size', sizeTask);
gulp.task('static', staticTask);
gulp.task('watch', watchTask);

// Define gulp task aliases
gulp.task('b', buildTask);
gulp.task('c', cleanTask);
gulp.task('d', deployTask);
gulp.task('w', watchTask);
