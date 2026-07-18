// Edge-case tests for error re-throw paths in scaffold.js.
// These tests cover the branches that require specific error conditions
// and use filesystem tricks or the _templatesDir test seam — no vi.mock needed.

import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { scaffold } from '../src/scaffold.js';

const defaults = {
  projectName: 'test-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: 'web',
};

describe('scaffold — mkdir error re-throw (lines 62-63)', () => {
  // When mkdir fails with a code OTHER than EEXIST, the error is re-thrown.
  // Trigger: pass an outDir whose parent directory does not exist.
  // mkdir({ recursive: false }) throws ENOENT — not EEXIST — so we re-throw.

  it('re-throws when mkdir fails with a non-EEXIST error', async () => {
    await expect(
      scaffold({
        ...defaults,
        outDir: '/this-parent-definitely-does-not-exist-gulp-khup/child',
      }),
    ).rejects.toThrow(); // ENOENT from mkdir — re-thrown by scaffold
  });

  it('the re-thrown error is not the EEXIST wrapper message', async () => {
    const err = await scaffold({
      ...defaults,
      outDir: '/this-parent-definitely-does-not-exist-gulp-khup/child',
    }).catch((e) => e);

    expect(err.message).not.toMatch(/already exists/i);
  });
});

describe('scaffold — copyDir error paths (lines 75-77)', () => {
  let tmpDir;
  let outDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-errors-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('ignores ENOENT when a type-specific template dir is missing (line 75)', async () => {
    // _templatesDir has a base/ with one file, but no web/ subdir.
    const tplDir = join(tmpDir, 'tpls');
    await mkdir(join(tplDir, 'base'), { recursive: true });
    await writeFile(join(tplDir, 'base', 'test.txt'), 'hello');
    // web/ intentionally absent → readdir throws ENOENT → no-op (line 75 return)

    await expect(scaffold({ ...defaults, outDir, _templatesDir: tplDir })).resolves.toBeUndefined();

    // base/test.txt was still copied
    await expect(access(join(outDir, 'test.txt'))).resolves.toBeUndefined();
  });

  it('re-throws non-ENOENT errors from readdir (line 76)', async () => {
    // Create a _templatesDir where 'base' is a FILE, not a directory.
    // readdir on a file throws ENOTDIR (not ENOENT) → re-thrown by copyDir.
    const tplDir = join(tmpDir, 'tpls');
    await mkdir(tplDir, { recursive: true });
    await writeFile(join(tplDir, 'base'), 'i am a file, not a directory');

    await expect(scaffold({ ...defaults, outDir, _templatesDir: tplDir })).rejects.toThrow(); // ENOTDIR — not ENOENT — so it propagates
  });
});
