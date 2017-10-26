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
import cleanTask from './clean';
import cssTask from './css';
import htmlTask from './html';
import imgTask from './img';
import inlineTask from './inline';
import jsTask from './js';
import mustacheTask from './mustache';
import staticTask from './static';

const buildTask = (cb) => {
    return gulp.series(
        cleanTask,
        gulp.parallel(cssTask, imgTask, htmlTask, mustacheTask, jsTask, staticTask),
        inlineTask
    )(cb);
};
buildTask.description = 'clean and build a new project';

export default buildTask;
