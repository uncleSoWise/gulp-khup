// -------------------------------------
//   Task: deploy
// -------------------------------------
//
// - deploy /dist/ files to server via FTP or SFTP
// - check gulpflow booleans in config.js for deployment settings
// - environmental variables located in .env
//
// -------------------------------------

import gulp from 'gulp';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import sftp from 'gulp-sftp';
import gutil from 'gulp-util';
import ftp from 'vinyl-ftp';
import config from '../config';
import errorHandler from '../errorHandler';
import globs from '../globs';

const ftpTask = () => {
    const conn = ftp.create({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        pass: process.env.FTP_PASS,
        maxConnections: 1000,
        parallel: 5,
        log: gutil.log
    });

    return gulp
        .src(globs.to.deploy, { base: globs.to.deployBase })
        .pipe(plumber(errorHandler))
        .pipe(conn.dest(process.env.FTP_REMOTEPATH))
        .pipe(notify({ message: 'ftp complete', onLast: true }));
};
ftpTask.description = 'deploy /dist/ files to server via FTP';

const sftpTask = () => {
    const conn = {
        host: process.env.SFTP_HOST,
        user: process.env.SFTP_USER,
        pass: process.env.SFTP_PASS,
        remotePath: process.env.SFTP_REMOTEPATH,
        key: {
            location: process.env.SFTP_KEYPATH
        }
    };

    return gulp
        .src(globs.to.deploy, { buffer: false })
        .pipe(plumber(errorHandler))
        .pipe(sftp(conn))
        .pipe(notify({ message: 'sftp complete', onLast: true }));
};
sftpTask.description = 'deploy /dist/ files to server via SFTP';

const deployTask = (cb) => {
    let taskStream;
    if (config.gulpflow.isDeployFTP) {
        taskStream = gulp.series(ftpTask)(cb);
    }
    if (config.gulpflow.isDeploySFTP) {
        taskStream = gulp.series(sftpTask)(cb);
    }
    return taskStream;
};
deployTask.description = 'deploy /dist/ files to remote server via FTP or SFTP';

export default deployTask;
