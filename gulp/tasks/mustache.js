// -------------------------------------
//   Task: mustache
// -------------------------------------
//
// - cache files for `watch`
// - render .mustache templates into HTML
// - correct special characters in HTML
// - minify html
// - move to /dist/
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import cache from 'gulp-cached';
import htmlmin from 'gulp-htmlmin';
import mustache from 'gulp-mustache';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import special from 'gulp-special-html';
import errorHandler from '../errorHandler';
import globs from '../globs';

const mustacheTask = () => {
    return gulp
        .src(globs.to.mustache, { base: globs.to.src })
        .pipe(plumber(errorHandler))
        .pipe(cache('mustache'))
        .pipe(mustache())
        .pipe(rename((file) => {
            file.extname = '.html';
        }))
        .pipe(special())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            minifyJS: true
        }))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'mustache task complete', onLast: true }));
};
mustacheTask.description = 'render .mustache templates into optimized HTML';

export default mustacheTask;
