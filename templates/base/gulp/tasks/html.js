// -------------------------------------
//   Task: html
// -------------------------------------
//
// - cache files for `watch`
// - correct special characters in HTML
// - minify html
// - move to /dist/
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import { minify } from 'html-minifier-terser';
import plumber from 'gulp-plumber';
import { Transform, PassThrough } from 'node:stream';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const HTMLMIN_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  minifyJS: true,
};

const minifyHtml = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      if (file.isNull()) { cb(null, file); return; }
      (async () => {
        try {
          const result = await minify(file.contents.toString('utf-8'), HTMLMIN_OPTIONS);
          file.contents = Buffer.from(result, 'utf-8');
        } catch (_err) { /* pass through on minify error */ }
        cb(null, file);
      })();
    },
  });

const fixSpecialChars = () =>
  new Transform({
    objectMode: true,
    transform(file, _, cb) {
      if (file.isNull()) { cb(null, file); return; }
      const str = file.contents.toString('utf-8');
      let out = '';
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        out += code > 127 ? `&#${code};` : str[i];
      }
      file.contents = Buffer.from(out, 'utf-8');
      cb(null, file);
    },
  });

const htmlTask = () =>
  gulp
    .src(globs.to.html, { base: globs.to.src })
    .pipe(plumber(errorHandler))
    .pipe(fixSpecialChars())
    .pipe(commandLineArguments.nomin ? new PassThrough({ objectMode: true }) : minifyHtml())
    .pipe(plumber.stop())
    .pipe(gulp.dest(globs.to.dist))
    .pipe(browserSync.stream({ once: true }));

htmlTask.description = 'optimize html and move to /dist/';

export default htmlTask;

