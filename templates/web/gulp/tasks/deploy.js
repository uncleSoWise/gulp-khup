// -------------------------------------
//   Task: deploy
// -------------------------------------
//
// - check CLI arguments for deployment settings
// - deploy /dist/ files to server via SFTP
// - environmental variables located in .env
//
// -------------------------------------

import SftpClient from "ssh2-sftp-client";
import commandLineArguments from "../commandLineArguments.js";
import errorHandler from "../errorHandler.js";
import globs from "../globs.js";
import gulp from "gulp";
import path from "node:path";
import plumber from "gulp-plumber";
import { readFileSync } from "node:fs";
import { Transform } from "node:stream";

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
      console.error("Failed to read SFTP private key file", process.env.SFTP_KEYPATH, err);
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
    new Transform({ objectMode: true, transform(file, _, cb) {
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
    }});

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
  if (commandLineArguments.sftp) {
    return gulp.series(sftpTask)(cb);
  }
  cb();
};
deployTask.description = "deploy /dist/ files to server via SFTP (use --sftp flag)";

export default deployTask;


