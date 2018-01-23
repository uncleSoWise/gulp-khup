// -------------------------------------
//   Task: inline
// -------------------------------------
//
// - source /dist/ HMTL
// - inline files with `inline` attribute
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import flatmap from 'gulp-flatmap';
import inlinesource from 'gulp-inline-source';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import path from 'path';
import errorHandler from '../errorHandler';
import globs from '../globs';

const inlineTask = () => {
    return gulp
        .src(globs.to.inline)
        .pipe(plumber(errorHandler))
        .pipe(flatmap((stream, file) => {
            let rootPath = file.path;
            rootPath = rootPath.replace(file.base, '');
            rootPath = rootPath.replace(file.basename, '');
            rootPath = path.join(globs.to.dist, rootPath);
            return stream.pipe(inlinesource({
                rootpath: rootPath
            }));
        }))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'inline task complete', onLast: true }));
};
inlineTask.description = 'inline files with `inline` attribute';

export default inlineTask;
