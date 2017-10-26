import notify from 'gulp-notify';
import gutil from 'gulp-util';

const errorHandler = (error) => {
    const line = (error.line) ? `LINE ${error.line} -- ` : '';

    // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    notify({
        title: `Task Failed [${error.plugin}]`,
        message: `${line}See console.`,
        sound: 'Sosumi'
    }).write(error);

    // Beep 'sosumi' again
    gutil.beep();

    // Pretty error reporting
    const chalk = gutil.colors.red;
    let report = '';

    // Build report body
    report += `${chalk('\nTASK:')} [${error.plugin}]\n`;

    if (error.line) {
        report += `${chalk('LINE:')} ${error.line}\n`;
    }

    report += `${chalk('\nPROB:')} ${error.message}`;

    if (error.file) {
        report += `${chalk('\nFILE:')} ${error.file}\n`;
    }

    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
};

export default errorHandler;
