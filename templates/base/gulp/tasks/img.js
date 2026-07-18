// -------------------------------------
//   Task: img
// -------------------------------------
//
// - compress JPEG/PNG/WebP/AVIF with sharp (no binary downloaders)
// - optimise SVG with svgo (pure JS, no binary)
// - /img/ files move to correct place in dist/
//
// -------------------------------------

import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import sharp from 'sharp';
import { optimize as svgOptimize } from 'svgo';
import { Transform } from 'node:stream';
import path from 'node:path';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const JPEG_EXTS = new Set(['.jpg', '.jpeg']);

const optimizeImage = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      if (file.isNull() || file.isStream()) { cb(null, file); return; }

      const ext = path.extname(file.path).toLowerCase();

      if (ext === '.svg') {
        try {
          const result = svgOptimize(file.contents.toString('utf-8'), {
            plugins: [{
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  removeTitle: false,
                  collapseGroups: false,
                },
              },
            }],
          });
          file.contents = Buffer.from(result.data, 'utf-8');
        } catch (_err) { /* pass through on error */ }
        cb(null, file);
        return;
      }

      const RASTER_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
      if (!RASTER_EXTS.has(ext)) { cb(null, file); return; }

      (async () => {
        try {
          const img = sharp(file.contents);
          if (JPEG_EXTS.has(ext)) {
            file.contents = await img.jpeg({ progressive: true, quality: 85 }).toBuffer();
          } else if (ext === '.png') {
            file.contents = await img.png({ compressionLevel: 8 }).toBuffer();
          } else if (ext === '.webp') {
            file.contents = await img.webp({ quality: 85 }).toBuffer();
          } else if (ext === '.avif') {
            file.contents = await img.avif({ quality: 50 }).toBuffer();
          }
        } catch (_err) { /* pass through on error */ }
        cb(null, file);
      })();
    },
  });

const imageTask = () =>
  gulp
    .src(globs.to.img, { encoding: false })
    .pipe(plumber(errorHandler))
    .pipe(changed(globs.to.dist))
    .pipe(optimizeImage())
    .pipe(plumber.stop())
    .pipe(gulp.dest(globs.to.dist));

imageTask.description = 'compress images with sharp (JPEG/PNG/WebP/AVIF) and svgo (SVG)';

export default imageTask;

