// -------------------------------------
//   Task: html
// -------------------------------------
//
// - cache files for `watch`
// - correct special characters in HTML
// - minify html
// - move to /dist/
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import cache from 'gulp-cached';
import htmlmin from 'gulp-htmlmin';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import special from 'gulp-special-html';
import errorHandler from '../errorHandler';
import globs from '../globs';

const htmlTask = () => {
    return gulp
        .src(globs.to.html, { base: globs.to.src })
        .pipe(plumber(errorHandler))
        .pipe(cache('html'))
        .pipe(special())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            minifyJS: true
        }))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'html task complete', onLast: true }));
};
htmlTask.description = 'optimize html and move to /dist/';

export default htmlTask;
