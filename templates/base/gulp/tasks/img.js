/* eslint-disable quotes */
/* eslint-disable import/extensions */
// -------------------------------------
//   Task: img
// -------------------------------------
//
// - losslessly compress image assets
// - /img/ files move to correct place in theme
//
// -------------------------------------

import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

let imageminModulePromise;
const loadImagemin = async () => {
  if (!imageminModulePromise) {
    // Defer loading so gulp-cli's initial require does not trip over gulp-imagemin's top-level await
    imageminModulePromise = import('gulp-imagemin');
  }
  return imageminModulePromise;
};

const imageTask = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        default: imagemin,
        gifsicle,
        mozjpeg,
        optipng,
        svgo
      } = await loadImagemin();

      const stream = gulp
        .src(globs.to.img, { encoding: false })
        .pipe(plumber(errorHandler))
        .pipe(changed(globs.to.dist))
        .pipe(imagemin([
          gifsicle({ interlaced: true }),
          mozjpeg({ progressive: true }),
          optipng({ optimizationLevel: 2 }),
          svgo({
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides:
                  {
                    removeViewBox: false,
                    removeTitle: false,
                    collapseGroups: false,
                    cleanupIDs: {
                      prefix: {
                        toString() {
                          this.counter = this.counter || 0;
                          this.counter += this.counter;
                          return `svg-id-${this.counter}`;
                        }
                      }
                    }
                  }
                }
              }
            ]
          })
        ]))
        .pipe(plumber.stop())
        .pipe(gulp.dest(globs.to.dist));

      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.on('end', resolve);
    } catch (error) {
      reject(error);
    }
  });
};
imageTask.description = 'losslessly compress image assets';

export default imageTask;
