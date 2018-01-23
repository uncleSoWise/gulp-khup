// -------------------------------------
//   Task: css
// -------------------------------------
//
// - build CSS from SCSS
// - autoprefix browser vendor styles
// - comb CSS according to .csscomb.json
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
import csscomb from 'gulp-csscomb';
import cssnano from 'gulp-cssnano';
import flatmap from 'gulp-flatmap';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import pxtorem from 'gulp-pxtorem';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sass from 'gulp-sass';
import path from 'path';
import config from '../config';
import errorHandler from '../errorHandler';
import globs from '../globs';

const cssTask = () => {
    return gulp
        .src(globs.to.scss, { base: globs.to.src })
        .pipe(plumber(errorHandler))
        .pipe(sass())
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(csscomb())
        .pipe(pxtorem())
        .pipe(base64(config.base64))
        .pipe(rename((file) => {
            file.dirname = path.join(file.dirname, '../css');
        }))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(flatmap((stream, file) => {
            let rootPath = file.path;
            rootPath = rootPath.replace(file.base, '');
            rootPath = rootPath.replace(file.basename, '');
            rootPath = path.resolve(rootPath, '../');
            rootPath = `${rootPath}/`;
            return stream.pipe(replace('../img/', `${rootPath}img/`));
        }))
        .pipe(rename({ basename: 'inline', suffix: '.min' }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'css task complete', onLast: true }));
};
cssTask.description = 'build and optimize CSS from SCSS';

export default cssTask;
