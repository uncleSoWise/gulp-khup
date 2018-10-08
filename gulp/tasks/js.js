// -------------------------------------
//   Task: js
// -------------------------------------
//
// - Babelify ES6 into ES5
// - Browserify theme JS bundles
// - add sourcemaps back to original JS files for error debugging
// - create minifed and compressed version of file (no more sourcemaps)
// - move files to /dist/
//
// -------------------------------------

import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import buffer from 'gulp-buffer';
import flatmap from 'gulp-flatmap';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import through from 'through2';
import commandLineArguments from '../commandLineArguments';
import errorHandler from '../errorHandler';
import globs from '../globs';

const jsTask = () => {
    return (
        gulp
            .src(globs.to.js)
            .pipe(plumber(errorHandler))
            .pipe(
                flatmap((stream, file) => {
                    fancyLog(`bundling ${file.path}`);
                    // replace file contents with browserify's bundle stream
                    file.contents = browserify(file.path, {
                        paths: globs.to.src,
                        debug: true
                    })
                        .transform(babelify)
                        .bundle();
                    return stream;
                })
            )
            // transform streaming contents into buffer contents
            .pipe(buffer())
            .pipe(
                commandLineArguments.nomin
                    ? sourcemaps.init({ loadMaps: true })
                    : through.obj()
            )
            .pipe(
                commandLineArguments.nomin
                    ? sourcemaps.write({
                          includeContent: false,
                          sourceRoot: globs.to.src
                      })
                    : through.obj()
            )
            .pipe(commandLineArguments.nomin ? through.obj() : uglify())
            .pipe(plumber.stop())
            .pipe(gulp.dest(globs.to.dist))
            .pipe(browserSync.stream({ once: true }))
            .pipe(notify({ message: 'js task complete', onLast: true }))
    );
};
jsTask.description = 'transform ES6, bundle js, minify OR add source maps';

export default jsTask;
