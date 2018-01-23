// -------------------------------------
//   Task: size
// -------------------------------------
//
// - output file size reports on /dist/
// - quick and dirty performance audit
//
// -------------------------------------

import gulp from 'gulp';
import notify from 'gulp-notify';
import size from 'gulp-size';
import globs from '../globs';

const sizeAllTask = () => {
    const s = size();
    return gulp
        .src(globs.to.size.all)
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message: () => {
                return `TOTAL size ${s.prettySize}`;
            }
        }));
};

const sizeCssTask = () => {
    const s = size();
    return gulp
        .src(globs.to.size.css)
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message: () => {
                return `CSS size ${s.prettySize}`;
            }
        }));
};

const sizeHtmlTask = () => {
    const s = size();
    return gulp
        .src(globs.to.size.html)
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message: () => {
                return `HTML size ${s.prettySize}`;
            }
        }));
};

const sizeImgTask = () => {
    const s = size();
    return gulp
        .src(globs.to.size.img)
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message: () => {
                return `IMG size ${s.prettySize}`;
            }
        }));
};

const sizeJsTask = () => {
    const s = size();
    return gulp
        .src(globs.to.size.js)
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message: () => {
                return `JS size ${s.prettySize}`;
            }
        }));
};

const sizeTask = (cb) => {
    return gulp.parallel(
        sizeCssTask,
        sizeHtmlTask,
        sizeImgTask,
        sizeJsTask,
        sizeAllTask
    )(cb);
};
sizeTask.description = 'quick and dirty file size reports on /dist/';

export default sizeTask;
