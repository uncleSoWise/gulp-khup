// -------------------------------------
//   Task: nunjucks
// -------------------------------------
//
// - render .md into HTML in .njk templates
// - render .njk templates into HTML
// - correct special characters in HTML
// - minify html
// - move to /dist/
//
// -------------------------------------

import browserSync from 'browser-sync';
import gulp from 'gulp';
import { nunjucksCompile } from 'gulp-nunjucks';
import { minify } from 'html-minifier-terser';
import { marked } from 'marked';
import markdown from 'nunjucks-markdown';
import nunjucks from 'nunjucks';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import special from 'gulp-special-html';
import through2 from 'through2';
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
  through2.obj((file, _, cb) => {
    if (file.isNull()) { cb(null, file); return; }
    (async () => {
      try {
        const result = await minify(file.contents.toString('utf-8'), HTMLMIN_OPTIONS);
        file.contents = Buffer.from(result, 'utf-8');
      } catch (_err) { /* pass through on minify error */ }
      cb(null, file);
    })();
  });

const nunjucksTask = () => {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader( globs.to.environment ));
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: false,
    tables: false,
    breaks: false,
    pendantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  });
  markdown.register(env, marked);

  return gulp
    .src(globs.to.nunjucks)
    .pipe(plumber(errorHandler))
    .pipe(nunjucksCompile('', { env }))
    .pipe(special())
    .pipe(rename((file) => {
      file.extname = '.html';
    }))
    .pipe(commandLineArguments.nomin ? through2.obj() : minifyHtml())
    .pipe(plumber.stop())
    .pipe(gulp.dest(globs.to.dist))
    .pipe(browserSync.stream({ once: true }));
};
nunjucksTask.description = 'render .md and .njk templates into optimized HTML';

export default nunjucksTask;
