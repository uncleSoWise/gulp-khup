import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { applyTokens, resolveTemplateDirs, scaffold } from '../src/scaffold.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

// ---------------------------------------------------------------------------
// applyTokens — pure function, no I/O
// ---------------------------------------------------------------------------

describe('applyTokens', () => {
  it('replaces a single token', () => {
    expect(applyTokens('Hello <%= name %>', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple distinct tokens', () => {
    expect(applyTokens('<%= a %> and <%= b %>', { a: 'foo', b: 'bar' })).toBe('foo and bar');
  });

  it('replaces the same token appearing multiple times', () => {
    expect(applyTokens('<%= x %> then <%= x %>', { x: 'hi' })).toBe('hi then hi');
  });

  it('leaves unrecognised tokens unreplaced', () => {
    expect(applyTokens('<%= unknown %>', { other: 'value' })).toBe('<%= unknown %>');
  });

  it('handles empty string content', () => {
    expect(applyTokens('', { name: 'World' })).toBe('');
  });

  it('handles content with no tokens', () => {
    expect(applyTokens('no tokens here', { name: 'World' })).toBe('no tokens here');
  });

  it('handles empty tokens object', () => {
    expect(applyTokens('<%= name %>', {})).toBe('<%= name %>');
  });
});

// ---------------------------------------------------------------------------
// resolveTemplateDirs — pure function, no I/O
// ---------------------------------------------------------------------------

describe('resolveTemplateDirs', () => {
  it('returns [base, type] in order for web type', () => {
    const dirs = resolveTemplateDirs('web', TEMPLATES_DIR);
    expect(dirs).toHaveLength(2);
    expect(dirs[0]).toBe(join(TEMPLATES_DIR, 'base'));
    expect(dirs[1]).toBe(join(TEMPLATES_DIR, 'web'));
  });

  it('returns type-specific dir for wordpress type', () => {
    expect(resolveTemplateDirs('wordpress', TEMPLATES_DIR)[1]).toBe(
      join(TEMPLATES_DIR, 'wordpress'),
    );
  });

  it('returns type-specific dir for email type', () => {
    expect(resolveTemplateDirs('email', TEMPLATES_DIR)[1]).toBe(join(TEMPLATES_DIR, 'email'));
  });
});

// ---------------------------------------------------------------------------
// scaffold() — directory handling and error paths
// ---------------------------------------------------------------------------

describe('scaffold — directory handling', () => {
  let tmpDir, outDir;
  const defaults = {
    projectName: 'test-project',
    description: 'A test project',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'web',
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-test-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates the output directory', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(outDir)).resolves.toBeUndefined();
  });

  it('uses projectName as output dir name when outDir is not specified', async () => {
    await scaffold({ ...defaults, outDir: undefined, cwd: tmpDir });
    await expect(access(join(tmpDir, defaults.projectName))).resolves.toBeUndefined();
  });

  it('throws with a descriptive message when output dir already exists', async () => {
    await mkdir(outDir);
    await expect(scaffold({ ...defaults, outDir })).rejects.toThrow(/already exists/i);
  });

  it('includes the output path in the error message', async () => {
    await mkdir(outDir);
    await expect(scaffold({ ...defaults, outDir })).rejects.toThrow(outDir);
  });

  it('succeeds silently when type-specific template dir does not exist', async () => {
    await expect(
      scaffold({ ...defaults, outDir, projectType: 'wordpress' }),
    ).resolves.toBeUndefined();
  });
});
