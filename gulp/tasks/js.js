// -------------------------------------
//   Task: js
// -------------------------------------
//
// - cache files for `watch`
// - Browserify theme JS bundles
// - add sourcemaps back to original JS files for error debugging
// - create minifed and compressed version of file (no more sourcemaps)
// - move files to /dist/
//
// -------------------------------------

import browserify from 'browserify';
import browserSync from 'browser-sync';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import cache from 'gulp-cached';
import buffer from 'gulp-buffer';
import flatmap from 'gulp-flatmap';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import errorHandler from '../errorHandler';
import globs from '../globs';

const jsTask = () => {
    return (
        gulp
            .src(globs.to.js)
            .pipe(plumber(errorHandler))
            .pipe(cache('js'))
            .pipe(flatmap((stream, file) => {
                fancyLog(`bundling ${file.path}`);
                // replace file contents with browserify's bundle stream
                const bundler = browserify(file.path, {
                    debug: true
                }).bundle();
                file.contents = bundler;
                return stream;
            }))
            // transform streaming contents into buffer contents
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write({
                includeContent: false,
                sourceRoot: globs.to.src
            }))
            .pipe(gulp.dest(globs.to.dist))
            .pipe(rename({ suffix: '.min' }))
            .pipe(uglify())
            .pipe(gulp.dest(globs.to.dist))
            .pipe(browserSync.stream({ once: true }))
            .pipe(notify({ message: 'js task complete', onLast: true }))
    );
};
jsTask.description = 'bundle js, add source maps, create .min file';

export default jsTask;
