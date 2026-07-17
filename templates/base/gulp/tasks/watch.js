// -------------------------------------
//   Task: watch
// -------------------------------------
//
// - check CLI arguments for BrowserSync and deploy settings
// - BrowserSync will manage refresh and device sync
// - BrowserSync uses /dist/ as base for the server
// - listen for changes in /src/ and run tasks
// - SFTP upload on file change via --sftp flag
//
// -------------------------------------

import SftpClient from "ssh2-sftp-client";
import browserSync from "browser-sync";
import chalk from "chalk";
import commandLineArguments from "../commandLineArguments.js";
import cssTask from "./css.js";
import errorHandler from "../errorHandler.js";
import globs from "../globs.js";
import gulp from "gulp";
import htmlTask from "./html.js";
import imgTask from "./img.js";
import inlineTask from "./inline.js";
import jsTask from "./js.js";
import nunjucksTask from "./nunjucks.js";
import path from "node:path";
import plumber from "gulp-plumber";
import { readFileSync } from "node:fs";
import staticTask from "./static.js";
import through2 from "through2";

const serverInitTask = (cb) => {
  browserSync.init(
    {
      files: [globs.to.html],
      ghostMode: false,
      notify: false,
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

  // Watch .njk files
  gulp.watch(globs.to.watch.nunjucks, gulp.series(nunjucksTask, cssTask, inlineTask));

  // Watch .scss files
  gulp.watch(globs.to.watch.scss, gulp.series(cssTask, htmlTask, nunjucksTask, inlineTask));

  // Watch .js files
  gulp.watch(globs.to.watch.js, gulp.parallel(jsTask));

  // Watch image files
  gulp.watch(globs.to.watch.img, gulp.parallel(imgTask));

  // Watch misc files
  gulp.watch(globs.to.watch.static, gulp.parallel(staticTask));

  // Watch files for upload
  const options = {
    usePolling: true,
    interval: 5000,
    delay: 5000
  };
  const watcher = gulp.watch(globs.to.watch.deploy, options, () => {
    cb(null);
  });

  // enable SFTP deploys on watch via CLI parameters
  if (commandLineArguments.sftp) {
    const sftpConfig = {
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT ? Number(process.env.SFTP_PORT) : 22,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASS
    };

    if (process.env.SFTP_PASSPHRASE) {
      sftpConfig.passphrase = process.env.SFTP_PASSPHRASE;
    }

    if (process.env.SFTP_KEYPATH) {
      try {
        sftpConfig.privateKey = readFileSync(process.env.SFTP_KEYPATH);
      } catch (error) {
        console.error(
          "Failed to read SFTP private key file",
          process.env.SFTP_KEYPATH,
          error
        );
      }
    }

    const sftpClient = new SftpClient("watch-sftp");
    let sftpConnection;

    const ensureSftpConnection = async () => {
      if (!sftpConnection) {
        sftpConnection = sftpClient.connect(sftpConfig).catch((error) => {
          sftpConnection = null;
          throw error;
        });
      }

      return sftpConnection;
    };

    const toPosixPath = (filePath) => { return filePath.split(path.sep).join(path.posix.sep); };

    const remoteRoot = (process.env.SFTP_REMOTEPATH || ".").replace(/\\/g, "/");
    const sftpUploadStream = () => {
      return through2.obj((file, _, cb) => {
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
        })().catch((error) => {
          sftpConnection = null;
          sftpClient.end().catch(() => {});
          cb(error);
        });
      });
    };

    watcher.on("change", (event) => {
      console.log("changed: uploading...", JSON.stringify(event));
      return gulp
        .src(event, { base: globs.to.deployBase })
        .pipe(plumber(errorHandler))
        .pipe(sftpUploadStream())
        .pipe(plumber.stop())
    });

    watcher.on("close", () => {
      if (sftpClient) {
        sftpClient.end().catch(() => {});
      }
      sftpConnection = null;
    });
  }
  return cb(null);
};

const watchTask = (cb) => {
  let taskStream;
  taskStream = gulp.series(watchFilesTask)(cb);

  // enable BrowserSync unless disabled by CLI parameters
  if (!commandLineArguments.nobs && !commandLineArguments.nobrowsersync) {
    taskStream = gulp.series(serverInitTask, watchFilesTask)(cb);
  }

  return taskStream;
};
watchTask.description = "watch for changes in /src/ and run tasks";

export default watchTask;
