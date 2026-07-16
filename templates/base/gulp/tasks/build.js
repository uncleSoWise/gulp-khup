/* eslint-disable import/extensions */
// -------------------------------------
//   Task: build
// -------------------------------------
//
// - builds a complete project
// - clean /dist/ first
// - inline CSS and JS after full build
//
// -------------------------------------

import gulp from 'gulp';
import cleanTask from './clean.js';
import cssTask from './css.js';
import htmlTask from './html.js';
import imgTask from './img.js';
import inlineTask from './inline.js';
import jsTask from './js.js';
import nunjucksTask from './nunjucks.js';
import staticTask from './static.js';

const buildTask = (cb) => {
  return gulp.series(
    cleanTask,
    gulp.parallel(
      cssTask,
      imgTask,
      htmlTask,
      nunjucksTask,
      jsTask,
      staticTask
    ),
    inlineTask
  )(cb);
};
buildTask.description = 'clean and build a new project';

export default buildTask;
