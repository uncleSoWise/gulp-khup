import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const BIOME_BIN = join(__dirname, '../node_modules/.bin/biome');
const TEMPLATE_CONFIG = join(__dirname, '../templates/base/biome.json');

describe('templates/base/biome.json', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-biome-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true });
  });

  it('is a valid config for the installed Biome and honours its ignore list', async () => {
    await copyFile(TEMPLATE_CONFIG, join(tmpDir, 'biome.json'));
    await writeFile(join(tmpDir, 'ok.js'), 'export const ok = 1;\n');
    await mkdir(join(tmpDir, 'dist'));
    await writeFile(join(tmpDir, 'dist', 'ignored.js'), 'var   x =   1\n');

    const { stdout, stderr } = await run(BIOME_BIN, ['check', '.'], { cwd: tmpDir });

    expect(`${stdout}${stderr}`).toContain('Checked 2 files');
  });
});
