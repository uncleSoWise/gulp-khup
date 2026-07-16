// *************************************
//
//   gulpflow v8.1.0
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
//   `gulp nunjucks`
//   `gulp prettier`
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
import htmlTask from './gulp/tasks/html.js';
import imgTask from './gulp/tasks/img.js';
import jsTask from './gulp/tasks/js.js';
import nunjucksTask from './gulp/tasks/nunjucks.js';
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

gulp.task('html', htmlTask);
gulp.task('img', imgTask);
gulp.task('js', jsTask);

gulp.task('nunjucks', nunjucksTask);
gulp.task('size', sizeTask);
gulp.task('static', staticTask);
gulp.task('watch', watchTask);

// Define gulp task alias
gulp.task('b', buildTask);
gulp.task('c', cleanTask);
gulp.task('d', deployTask);
gulp.task('w', watchTask);
