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
import htmlmin from 'gulp-htmlmin';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import special from 'gulp-special-html';
import through from 'through2';
import commandLineArguments from '../commandLineArguments';
import errorHandler from '../errorHandler';
import globs from '../globs';

const htmlTask = () => {
    return gulp
        .src(globs.to.html, { base: globs.to.src })
        .pipe(plumber(errorHandler))
        .pipe(special())
        .pipe(
            commandLineArguments.nomin
                ? through.obj()
                : htmlmin({
                      collapseWhitespace: true,
                      removeComments: true,
                      minifyCSS: true,
                      minifyJS: true
                  })
        )
        .pipe(plumber.stop())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'html task complete', onLast: true }));
};
htmlTask.description = 'optimize html and move to /dist/';

export default htmlTask;
