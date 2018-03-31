// -------------------------------------
//   Task: css
// -------------------------------------
//
// - build CSS from SCSS
// - autoprefix browser vendor styles
// - convert PX to REM
// - inline base64 any asset < 8 bytes
// - move into relative /css/ directory
// - create a minified version
// - create an inline friendly version
// - save all files in /dist/
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import base64 from 'gulp-base64';
import cssnano from 'gulp-cssnano';
import flatmap from 'gulp-flatmap';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import pxtorem from 'gulp-pxtorem';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import path from 'path';
import through from 'through2';
import commandLineArguments from '../commandLineArguments';
import errorHandler from '../errorHandler';
import globs from '../globs';

const cssTask = () => {
    return gulp
        .src(globs.to.scss, { base: globs.to.src })
        .pipe(plumber(errorHandler))
        .pipe(commandLineArguments.nomin ? sourcemaps.init() : through.obj())
        .pipe(sass())
        .pipe(commandLineArguments.nomin
            ? sourcemaps.write({
                includeContent: false,
                sourceRoot: globs.to.src
            })
            : through.obj())
        .pipe(autoprefixer(['last 2 versions']))
        .pipe(pxtorem())
        .pipe(base64({
            maxImageSize: 8 * 1024 // bytes
        }))
        .pipe(rename((file) => {
            file.dirname = path.join(file.dirname, '../css');
        }))
        .pipe(commandLineArguments.nomin ? through.obj() : cssnano())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(flatmap((stream, file) => {
            let rootPath = file.path;
            rootPath = rootPath.replace(file.base, '');
            rootPath = rootPath.replace(file.basename, '');
            rootPath = path.resolve(rootPath, '../');
            rootPath = `${rootPath}/`;
            return stream.pipe(replace('../img/', `${rootPath}img/`));
        }))
        .pipe(rename({ suffix: '.inline' }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'css task complete', onLast: true }));
};
cssTask.description = 'build and optimize CSS from SCSS';

export default cssTask;
