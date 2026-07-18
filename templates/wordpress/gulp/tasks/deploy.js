// -------------------------------------
//   Task: deploy (WordPress)
// -------------------------------------
//
// - deploy built assets to wp-content/themes/<theme-name>/
// - configure SFTP settings in .env
//
// -------------------------------------

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import SftpClient from 'ssh2-sftp-client';
import commandLineArguments from '../commandLineArguments.js';
import errorHandler from '../errorHandler.js';
import globs from '../globs.js';

const deployTask = (cb) => {
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

  console.log('Deploy: pass --sftp to enable deployment');
  cb();
};
deployTask.description = 'deploy to WordPress theme directory via SFTP (use --sftp flag)';

export default deployTask;

