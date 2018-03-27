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
import gulpNunjucks from 'gulp-nunjucks';
import htmlmin from 'gulp-htmlmin';
import marked from 'marked';
import markdown from 'nunjucks-markdown';
import notify from 'gulp-notify';
import nunjucks from 'nunjucks';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import special from 'gulp-special-html';
import through from 'through2';
import commandLineArguments from '../commandLineArguments';
import errorHandler from '../errorHandler';
import globs from '../globs';

const nunjucksTask = () => {
    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('src'));
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
        .pipe(gulpNunjucks.compile('', { env }))
        .pipe(special())
        .pipe(rename((file) => {
            file.extname = '.html';
        }))
        .pipe(commandLineArguments.nomin
            ? through.obj()
            : htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                removeCommentsFromCDATA: true,
                minifyJS: true
            }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(globs.to.dist))
        .pipe(browserSync.stream({ once: true }))
        .pipe(notify({ message: 'nunjucks task complete', onLast: true }));
};
nunjucksTask.description = 'render .md and .njk templates into optimized HTML';

export default nunjucksTask;
