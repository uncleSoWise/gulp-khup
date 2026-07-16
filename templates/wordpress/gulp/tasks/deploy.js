// -------------------------------------
//   Task: deploy (WordPress)
// -------------------------------------
//
// - deploy built assets to wp-content/themes/<theme-name>/
// - configure FTP/SFTP settings in .env
//
// -------------------------------------

import fancyLog from 'fancy-log';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import SftpClient from 'ssh2-sftp-client';
import * as FTP from 'vinyl-ftp';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const deployTask = (cb) => {
  if (commandLineArguments.ftp) {
    const conn = FTP.create({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      parallel: 5,
      log: fancyLog,
    });

    return gulp
      .src(globs.to.deploy, { base: globs.to.dist, buffer: false })
      .pipe(plumber(errorHandler))
      .pipe(conn.dest(process.env.FTP_REMOTE_PATH));
  }

  if (commandLineArguments.sftp) {
    const sftp = new SftpClient();
    return sftp
      .connect({
        host: process.env.SFTP_HOST,
        username: process.env.SFTP_USER,
        privateKey: process.env.SFTP_KEY_PATH,
      })
      .then(() => sftp.uploadDir(globs.to.dist, process.env.SFTP_REMOTE_PATH))
      .finally(() => sftp.end());
  }

  fancyLog('Deploy: pass --ftp or --sftp to enable deployment');
  cb();
};
deployTask.description = 'deploy to WordPress theme directory via FTP or SFTP';

export default deployTask;
