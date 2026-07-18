// -------------------------------------
//   Task: js
// -------------------------------------
//
// - bundle theme JS with esbuild
// - add sourcemaps back to original JS files for error debugging
// - create minifed and compressed version of file (no more sourcemaps)
// - move files to /dist/
//
// -------------------------------------

import esbuild from 'esbuild';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import through from 'through2';
import touch from 'gulp-touch-cmd';
import { Buffer } from 'node:buffer';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const bundleWithEsbuild = () => {
  return through.obj(function transform(file, _enc, cb) {
    const stream = this;
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new Error('Streaming not supported for JS bundling.'));
      return;
    }

    console.log(`bundling ${file.relative}`);

    esbuild.build({
      entryPoints: [file.path],
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2018',
      sourcemap: commandLineArguments.nomin ? 'external' : false,
      minify: !commandLineArguments.nomin,
      write: false,
      outfile: file.path,
      logLevel: 'silent'
    })
      .then((result) => {
        const jsOutput = result.outputFiles.find((output) => output.path === file.path);

        if (!jsOutput) {
          throw new Error(`esbuild did not emit output for ${file.relative}`);
        }

        file.contents = Buffer.from(jsOutput.contents);

        if (commandLineArguments.nomin) {
          const mapOutput = result.outputFiles.find((output) => output.path === `${file.path}.map`);

          if (mapOutput) {
            const mapFile = file.clone({ contents: false });
            mapFile.contents = Buffer.from(mapOutput.contents);
            mapFile.path = `${file.path}.map`;
            stream.push(mapFile);
          }
        }

        cb(null, file);
      })
      .catch((error) => {
        cb(error);
      });
  });
};

const jsTask = () => {
  return gulp
    .src(globs.to.js, { base: globs.to.src })
    .pipe(plumber(errorHandler))
    .pipe(bundleWithEsbuild())
    .pipe(plumber.stop())
    .pipe(gulp.dest(globs.to.dist))
    .pipe(browserSync.stream({ once: true }))
    .pipe(touch());
};
jsTask.description = 'transform ES6, bundle js, minify OR add source maps';

export default jsTask;
