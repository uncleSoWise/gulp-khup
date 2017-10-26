// -------------------------------------
//   Task: clean
// -------------------------------------
//
// - nukes globs
// - scorched earth
//
// -------------------------------------

import del from 'del';
import globs from '../globs';

const cleanTask = (cb) => {
    del(globs.to.clean).then(() => {
        cb();
    });
};
cleanTask.description = 'nukes globs. scorched earth';

export default cleanTask;
