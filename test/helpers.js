import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Create a temp dir, return path + cleanup function.
 * @param {string} [prefix='gulp-khup-test-']
 * @returns {Promise<{ tmpDir: string, cleanup: () => Promise<void> }>}
 */
export async function makeTmpDir(prefix = 'gulp-khup-test-') {
  const tmpDir = await mkdtemp(join(tmpdir(), prefix));
  return {
    tmpDir,
    cleanup: () => rm(tmpDir, { recursive: true, force: true }),
  };
}
