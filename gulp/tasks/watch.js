// -------------------------------------
//   Task: watch
// -------------------------------------
//
// - Browsersync will manage refresh and device sync
// - Browsersync uses /dist/ as base for the server
// - listen for changes in /src/ and run tasks
//
// -------------------------------------

import browserSync from 'browser-sync';
import chalk from 'chalk';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import sftp from 'gulp-sftp';
import ftp from 'vinyl-ftp';
import cssTask from './css';
import htmlTask from './html';
import imgTask from './img';
import inlineTask from './inline';
import jsTask from './js';
import mustacheTask from './mustache';
import staticTask from './static';
import config from '../config';
import errorHandler from '../errorHandler';
import globs from '../globs';

const serverInitTask = (cb) => {
    browserSync.init(
        {
            files: [globs.to.html],
            open: false,
            port: 9000,
            server: {
                baseDir: [globs.to.serve]
            }
        },
        cb
    );
};

const watchFilesTask = (cb) => {
    // Watch .html files
    gulp.watch(globs.to.watch.html, gulp.series(htmlTask, cssTask, inlineTask));

    // Watch .mustache files
    gulp.watch(
        globs.to.watch.mustache,
        gulp.series(mustacheTask, cssTask, inlineTask)
    );

    // Watch .scss files
    gulp.watch(
        globs.to.watch.scss,
        gulp.series(cssTask, htmlTask, mustacheTask, inlineTask)
    );

    // Watch .js files
    gulp.watch(globs.to.watch.js, gulp.parallel(jsTask));

    // Watch image files
    gulp.watch(globs.to.watch.img, gulp.parallel(imgTask));

    // Watch misc files
    gulp.watch(globs.to.watch.static, gulp.parallel(staticTask));

    // Watch files for upload
    const options = {
        interval: 5000,
        debounceDelay: 5000
    };
    const watcher = gulp.watch(globs.to.watch.deploy, options, () => {
        cb(null);
    });

    if (config.gulpflow.isDeployFTP) {
        const conn = ftp.create({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            pass: process.env.FTP_PASS,
            maxConnections: 1000,
            parallel: 5,
            log: fancyLog
        });
        watcher.on('change', (event) => {
            fancyLog(chalk.red('change:'), chalk.yellow(JSON.stringify(event)));
            return gulp
                .src(event, { base: globs.to.deployBase })
                .pipe(plumber(errorHandler))
                .pipe(conn.dest(process.env.FTP_REMOTEPATH))
                .pipe(plumber.stop())
                .pipe(notify({ message: 'watch-ftp complete', onLast: true }));
        });
    }

    if (config.gulpflow.isDeploySFTP) {
        const conn = {
            host: process.env.SFTP_HOST,
            user: process.env.SFTP_USER,
            pass: process.env.SFTP_PASS,
            remotePath: process.env.SFTP_REMOTEPATH,
            key: {
                location: process.env.SFTP_KEYPATH
            }
        };
        watcher.on('change', (event) => {
            fancyLog(chalk.red('change:'), chalk.yellow(JSON.stringify(event)));
            return gulp
                .src(event, { base: globs.to.deployBase, buffer: false })
                .pipe(plumber(errorHandler))
                .pipe(sftp(conn))
                .pipe(plumber.stop())
                .pipe(notify({ message: 'watch-sftp complete', onLast: true }));
        });
    }

    return cb(null);
};

const watchTask = (cb) => {
    let taskStream;
    taskStream = gulp.series(watchFilesTask);

    // BrowserSync and watch files based on config.js settings
    if (config.gulpflow.isBrowserSync) {
        taskStream = gulp.series(serverInitTask, watchFilesTask)(cb);
    }

    return taskStream;
};
watchTask.description =
    'start Browsersync, listen for changes in /src/ and run tasks';

export default watchTask;
