// -------------------------------------
//   Task: css
// -------------------------------------
//
// - build CSS from SCSS
// - autoprefix browser vendor styles
// - convert PX to REM
// - inline base64 any asset < 8 KB
// - move into relative /css/ directory
// - create a minified version
// - create an inline friendly version
// - save all files in /dist/
//
// -------------------------------------

import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import gulp from 'gulp';
import flatmap from 'gulp-flatmap';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import pxtorem from 'gulp-pxtorem';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import gulpSass from 'gulp-sass';
import * as sassCompiler from 'sass';
import sourcemaps from 'gulp-sourcemaps';
import path from 'path';
import { promises as fs } from 'fs';
import { Transform, PassThrough } from 'node:stream';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const sass = gulpSass(sassCompiler);

const pxtoremOptions = {
  unitPrecision: 4,
  propList: ['font', 'font-size', 'border', 'padding', 'margin']
};

const INLINE_ASSET_MAX_SIZE = 8 * 1024; // 8 KB
const INLINE_ASSET_EXTENSIONS = new Set(['.gif', '.jpg', '.jpeg', '.png']);
const URL_MATCHER = /url\(\s*(?:(['"])\s*(.*?)\s*\1|([^'")\s]+))\s*\)/gi;

const replaceFirst = (string, searchValue, replaceValue) => {
  const index = string.indexOf(searchValue);
  if (index === -1) return string;
  return `${string.slice(0, index)}${replaceValue}${string.slice(index + searchValue.length)}`;
};

const getMimeType = (extension) => {
  switch (extension) {
    case '.gif':
      return 'image/gif';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return null;
  }
};

const createInlineAssetsPlugin = () => {
  return {
    postcssPlugin: 'inline-css-assets',
    async Once(root) {
      if (!root.source || !root.source.input || !root.source.input.file) return;

      const cssFilePath = root.source.input.file;
      const cssDir = path.dirname(cssFilePath);
      const cache = new Map();
      const tasks = [];

      root.walkDecls((decl) => {
        if (!decl.value || decl.value.includes('base64:skip')) return;

        const matches = Array.from(decl.value.matchAll(URL_MATCHER));
        if (!matches.length) return;

        tasks.push((async () => {
          let updatedValue = decl.value;

          for (const match of matches) {
            const [fullExpression, quoteGroup, quotedUrl, bareUrl] = match;
            const originalUrl = (quotedUrl ?? bareUrl ?? '').trim();
            const quote = quoteGroup ? quoteGroup.trim() : '';

            if (!originalUrl || originalUrl.startsWith('data:') || originalUrl.startsWith('#')) {
              continue;
            }

            if (/^(?:https?:)?\/\//i.test(originalUrl)) {
              continue;
            }

            const cachedResult = cache.get(originalUrl);
            if (cachedResult) {
              const replacement = `url(${quote}${cachedResult}${quote})`;
              updatedValue = replaceFirst(updatedValue, fullExpression, replacement);
              continue;
            }

            const urlWithoutFragments = originalUrl.split('#')[0].split('?')[0];
            const extension = path.extname(urlWithoutFragments).toLowerCase();

            if (INLINE_ASSET_EXTENSIONS.size && !INLINE_ASSET_EXTENSIONS.has(extension)) {
              continue;
            }

            const absolutePath = path.resolve(cssDir, urlWithoutFragments);

            let fileBuffer;
            try {
              const stats = await fs.stat(absolutePath);
              if (!stats.isFile() || stats.size > INLINE_ASSET_MAX_SIZE) {
                continue;
              }
              fileBuffer = await fs.readFile(absolutePath);
            } catch (error) {
              continue;
            }

            const mimeType = getMimeType(extension);
            if (!mimeType) {
              continue;
            }

            const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            cache.set(originalUrl, dataUri);

            const replacement = `url(${quote}${dataUri}${quote})`;
            updatedValue = replaceFirst(updatedValue, fullExpression, replacement);
          }

          decl.value = updatedValue;
        })());
      });

      await Promise.all(tasks);
    }
  };
};

createInlineAssetsPlugin.postcss = true;

const inlineTargets = (Array.isArray(globs.to.scssInline) ? globs.to.scssInline : [globs.to.scssInline])
  .filter(Boolean)
  .map((scssPath) => {
    const absoluteScss = path.resolve(scssPath);
    const cssDir = path.resolve(path.dirname(absoluteScss), '../css');
    const baseName = path.basename(absoluteScss, path.extname(absoluteScss));
    return path.join(cssDir, `${baseName}.css`);
  });

const filterInlineTargets = () =>
  new Transform({
    objectMode: true,
    transform(file, _enc, cb) {
      if (inlineTargets.includes(path.resolve(file.path))) {
        this.push(file);
      }

      cb();
    },
  });

const cssTask = () => {
  return gulp
    .src(globs.to.scss, { base: globs.to.src })
    .pipe(plumber(errorHandler))
    .pipe(commandLineArguments.nomin ? sourcemaps.init() : new PassThrough({ objectMode: true }))
    .pipe(sass.sync({
      silenceDeprecations: ['legacy-js-api']
    }).on('error', sass.logError))
    .pipe(commandLineArguments.nomin
      ? sourcemaps.write({
        includeContent: false,
        sourceRoot: globs.to.src
      })
      : new PassThrough({ objectMode: true }))
    .pipe(postcss([autoprefixer({ cascade: false })]))
    .pipe(pxtorem(pxtoremOptions))
    .pipe(postcss([createInlineAssetsPlugin()]))
    .pipe(rename((file) => {
      file.dirname = path.join(file.dirname, '../css');
    }))
    .pipe(commandLineArguments.nomin ? new PassThrough({ objectMode: true }) : postcss([cssnano({
      autoprefixer: true, svgo: false, zindex: false
    })]))
    .pipe(gulp.dest(globs.to.dist))
    .pipe(filterInlineTargets())
    .pipe(postcss([cssnano({
      autoprefixer: true, svgo: false, zindex: false
    })]))
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
    .pipe(browserSync.stream({ once: true }));
};
cssTask.description = 'build and optimize CSS from SCSS';

export default cssTask;
