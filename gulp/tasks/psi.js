// -------------------------------------
//   Task: psi
// -------------------------------------
//
// - test against Google PageSpeed Insights
// - output report to terminal
// - pass or fail
//
// -------------------------------------
//
// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v2/getting-started
//
// -------------------------------------

import gulp from 'gulp';
import psi from 'psi';
import config from '../config';

const pageSpeedInsightsMobile = () => {
    return psi.output(config.psi_url, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
        threshold: 50
    });
};

const pageSpeedInsightsDesktop = () => {
    return psi.output(config.psi_url, {
        // key: key
        nokey: 'true',
        strategy: 'desktop',
        threshold: 50
    });
};

const psiTask = (cb) => {
    return gulp.parallel(
        pageSpeedInsightsMobile,
        pageSpeedInsightsDesktop
    )(cb);
};
psiTask.description = 'test against Google PageSpeed Insights';

export default psiTask;
