// -------------------------------------
//   Task: clean
// -------------------------------------
//
// - nukes globs
// - scorched earth
//
// -------------------------------------

import { deleteAsync } from 'del';
import globs from '../globs.js';

const cleanTask = (cb) => {
  deleteAsync(globs.to.clean).then(() => {
    cb();
  });
};
cleanTask.description = 'nukes globs. scorched earth';

export default cleanTask;
