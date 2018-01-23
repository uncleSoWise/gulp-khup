import beeper from 'beeper';
import chalk from 'chalk';
import notify from 'gulp-notify';

const errorHandler = (error) => {
    const line = error.line ? `LINE ${error.line} -- ` : '';

    // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    notify.onError({
        title: `Task Failed [${error.plugin}]`,
        message: `${line}See console.`,
        sound: 'Sosumi'
    })(error);

    // Beep noise alert
    beeper();

    // Build report body
    let report = '';
    report += `${chalk.red('\nTASK:')} [${error.plugin}]\n`;

    if (error.line) {
        report += `${chalk.red('LINE:')} ${error.line}\n`;
    }

    report += `${chalk.red('\nPROB:')} ${error.message}`;

    if (error.file) {
        report += `${chalk.red('\nFILE:')} ${error.file}\n`;
    }

    return console.error(report);
};

export default errorHandler;
