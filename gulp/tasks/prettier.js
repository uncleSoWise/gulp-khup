// -------------------------------------
//   Task: prettier
// -------------------------------------
//
// - format files with prettier
//
// -------------------------------------

import run from 'gulp-run';

const prettierTask = (cb) => {
    return run('npm run prettier').exec(cb);
};
prettierTask.description = 'format files with prettier';

export default prettierTask;
