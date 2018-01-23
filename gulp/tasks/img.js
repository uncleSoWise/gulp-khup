// -------------------------------------
//   Task: img
// -------------------------------------
//
// - losslessly compress image assets
// - /img/ files move to correct place in theme
//
// -------------------------------------

import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import pngquant from 'imagemin-pngquant';
import errorHandler from '../errorHandler';
import globs from '../globs';

const imageTask = () => {
    return gulp
        .src(globs.to.img)
        .pipe(plumber(errorHandler))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(globs.to.dist))
        .pipe(notify({ message: 'img task complete', onLast: true }));
};
imageTask.description = 'losslessly compress image assets';

export default imageTask;
