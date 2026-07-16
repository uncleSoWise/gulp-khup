// -------------------------------------
//   Task: deploy
// -------------------------------------
//
// - check CLI arguments for deployment settings
// - deploy /dist/ files to server via FTP or SFTP
// - environmental variables located in .env
//
// -------------------------------------

import SftpClient from "ssh2-sftp-client";
import commandLineArguments from "../commandLineArguments.js";
import errorHandler from "../errorHandler.js";
import fancyLog from "fancy-log";
import ftp from "vinyl-ftp";
import globs from "../globs.js";
import gulp from "gulp";
import path from "node:path";
import plumber from "gulp-plumber";
import { readFileSync } from "node:fs";
import through2 from "through2";

const ftpTask = () => {
  const conn = ftp.create({
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    user: process.env.FTP_USER,
    pass: process.env.FTP_PASS,
    maxConnections: 1000,
    parallel: 5,
    log: fancyLog
  });

  return gulp
    .src(globs.to.deploy, { base: globs.to.deployBase })
    .pipe(plumber(errorHandler))
    .pipe(conn.dest(process.env.FTP_REMOTEPATH))
    .pipe(plumber.stop());
};
ftpTask.description = "deploy /dist/ files to server via FTP";

const sftpTask = () => {
  const sftpConfig = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT ? Number(process.env.SFTP_PORT) : 22,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
  };

  if (process.env.SFTP_PASSPHRASE) sftpConfig.passphrase = process.env.SFTP_PASSPHRASE;
  if (process.env.SFTP_KEYPATH) {
    try {
      sftpConfig.privateKey = readFileSync(process.env.SFTP_KEYPATH);
    } catch (err) {
      fancyLog("Failed to read SFTP private key file", process.env.SFTP_KEYPATH, err);
    }
  }

  const sftpClient = new SftpClient("deploy-sftp");
  let sftpConnection;

  const ensureSftpConnection = async () => {
    if (!sftpConnection) {
      sftpConnection = sftpClient.connect(sftpConfig).catch((err) => {
        sftpConnection = null;
        throw err;
      });
    }
    return sftpConnection;
  };

  const remoteRoot = (process.env.SFTP_REMOTEPATH || ".").replace(/\\/g, "/");
  const toPosixPath = (filePath) => filePath.split(path.sep).join(path.posix.sep);

  const sftpUploadStream = () =>
    through2.obj((file, _, cb) => {
      (async () => {
        if (file.isNull()) {
          cb(null, file);
          return;
        }
        if (file.isStream()) {
          cb(new Error("SFTP upload does not support stream mode"));
          return;
        }

        await ensureSftpConnection();

        const relativePath = toPosixPath(file.relative || path.basename(file.path));
        const remotePath = remoteRoot ? path.posix.join(remoteRoot, relativePath) : relativePath;
        const remoteDir = path.posix.dirname(remotePath);

        if (remoteDir && remoteDir !== "." && remoteDir !== "/") {
          await sftpClient.mkdir(remoteDir, true);
        }

        await sftpClient.put(file.contents, remotePath);
        cb(null, file);
      })().catch((err) => {
        sftpConnection = null;
        sftpClient.end().catch(() => {});
        cb(err);
      });
    });

  const stream = gulp
    .src(globs.to.deploy.globs, { base: globs.to.deployBase })
    .pipe(plumber(errorHandler))
    .pipe(sftpUploadStream())
    .pipe(plumber.stop());

  stream.on("end", () => {
    if (sftpClient) sftpClient.end().catch(() => {});
    sftpConnection = null;
  });

  return stream;
};

sftpTask.description = "deploy /dist/ files to server via SFTP";

const deployTask = (cb) => {
  let taskStream;
  if (commandLineArguments.ftp) {
    taskStream = gulp.series(ftpTask)(cb);
  }
  if (commandLineArguments.sftp) {
    taskStream = gulp.series(sftpTask)(cb);
  }
  return taskStream;
};
deployTask.description =
  "deploy /dist/ files to remote server via FTP or SFTP";

export default deployTask;
