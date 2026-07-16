// -------------------------------------
//   Task: build (WordPress)
// -------------------------------------
//
// - clean /dist/ first
// - build CSS, JS, images and static files in parallel
// - no nunjucks/html/inline steps (WordPress uses PHP templates)
//
// -------------------------------------

import gulp from 'gulp';
import cleanTask from './clean.js';
import cssTask from './css.js';
import imgTask from './img.js';
import jsTask from './js.js';
import staticTask from './static.js';

const buildTask = (cb) => {
  return gulp.series(
    cleanTask,
    gulp.parallel(cssTask, jsTask, imgTask, staticTask)
  )(cb);
};
buildTask.description = 'clean and build WordPress theme assets';

export default buildTask;
