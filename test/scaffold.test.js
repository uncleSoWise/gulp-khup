import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

import { scaffold, applyTokens, resolveTemplateDirs } from '../src/scaffold.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

// ---------------------------------------------------------------------------
// applyTokens — pure function, no I/O, all tests run immediately
// ---------------------------------------------------------------------------

describe('applyTokens', () => {
  it('replaces a single token', () => {
    expect(applyTokens('Hello <%= name %>', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple distinct tokens', () => {
    const result = applyTokens('<%= a %> and <%= b %>', { a: 'foo', b: 'bar' });
    expect(result).toBe('foo and bar');
  });

  it('replaces the same token appearing multiple times', () => {
    const result = applyTokens('<%= x %> then <%= x %>', { x: 'hi' });
    expect(result).toBe('hi then hi');
  });

  it('leaves unrecognised tokens unreplaced', () => {
    const result = applyTokens('<%= unknown %>', { other: 'value' });
    expect(result).toBe('<%= unknown %>');
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
  it('returns base dir first for web type', () => {
    const dirs = resolveTemplateDirs('web', TEMPLATES_DIR);
    expect(dirs[0]).toBe(join(TEMPLATES_DIR, 'base'));
  });

  it('returns type-specific dir second for web type', () => {
    const dirs = resolveTemplateDirs('web', TEMPLATES_DIR);
    expect(dirs[1]).toBe(join(TEMPLATES_DIR, 'web'));
  });

  it('returns base dir first for wordpress type', () => {
    const dirs = resolveTemplateDirs('wordpress', TEMPLATES_DIR);
    expect(dirs[0]).toBe(join(TEMPLATES_DIR, 'base'));
  });

  it('returns type-specific dir second for wordpress type', () => {
    const dirs = resolveTemplateDirs('wordpress', TEMPLATES_DIR);
    expect(dirs[1]).toBe(join(TEMPLATES_DIR, 'wordpress'));
  });

  it('returns exactly two directories', () => {
    expect(resolveTemplateDirs('web', TEMPLATES_DIR)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// scaffold() — structural / error-handling tests (no templates needed)
// ---------------------------------------------------------------------------

describe('scaffold — directory handling', () => {
  let tmpDir;
  let outDir;

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
    // templates/ doesn't exist yet — copyDir with ENOENT is a no-op by design
    await expect(scaffold({ ...defaults, outDir, projectType: 'wordpress' })).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// scaffold() — file-content tests (require templates/ from Task 5)
// ---------------------------------------------------------------------------

describe('scaffold — generated file content', () => {
  let tmpDir;
  let outDir;

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

  it('creates gulpfile.js', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'gulpfile.js'))).resolves.toBeUndefined();
  });

  it('creates package.json from .tpl with token substitution', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'package.json'), 'utf-8');
    expect(content).toContain('"test-project"');
    expect(content).toContain('"A test project"');
    expect(content).toContain('"Test Author"');
    expect(content).toContain('"test@example.com"');
  });

  it('strips .tpl extension from output filename', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'package.json.tpl'))).rejects.toThrow();
    await expect(access(join(outDir, 'package.json'))).resolves.toBeUndefined();
  });

  it('copies non-template files verbatim', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, '.gitignore'))).resolves.toBeUndefined();
  });

  it('creates gulp/tasks/ directory', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'gulp', 'tasks'))).resolves.toBeUndefined();
  });

  it('creates web project src/ directory structure', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'src'))).resolves.toBeUndefined();
  });

  it('creates CHANGELOG.md with year token substituted', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'CHANGELOG.md'), 'utf-8');
    expect(content).toContain(new Date().getFullYear().toString());
  });

  it('matches package.json snapshot', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'package.json'), 'utf-8');
    expect(JSON.parse(content)).toMatchSnapshot();
  });

  it('matches gulpfile.js snapshot', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// scaffold() — email project type
// ---------------------------------------------------------------------------

describe('scaffold — email project type', () => {
  let tmpDir;
  let outDir;

  const emailDefaults = {
    projectName: 'test-email',
    description: 'A test email project',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'email',
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-email-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates the output directory for email type', async () => {
    await scaffold({ ...emailDefaults, outDir });
    await expect(access(outDir)).resolves.toBeUndefined();
  });

  it('generates email-specific gulpfile.js (overrides base)', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...emailDefaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toContain('gulpflow — Email');
    expect(content).toContain('inlineTask');
  });

  it('generates email package.json with gulp-inline-css', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...emailDefaults, outDir });
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).toHaveProperty('gulp-inline-css');
  });

  it('generates email package.json without esbuild', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...emailDefaults, outDir });
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('esbuild');
  });

  it('generates email-specific gulp tasks (build, inline, watch)', async () => {
    await scaffold({ ...emailDefaults, outDir });
    await expect(access(join(outDir, 'gulp', 'tasks', 'inline.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'gulp', 'tasks', 'build.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'gulp', 'tasks', 'watch.js'))).resolves.toBeUndefined();
  });

  it('generates email src/ nunjucks templates', async () => {
    await scaffold({ ...emailDefaults, outDir });
    await expect(access(join(outDir, 'src', '_layout.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'index.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'inc'))).resolves.toBeUndefined();
  });

  it('generates email src/ content block partials', async () => {
    await scaffold({ ...emailDefaults, outDir });
    await expect(access(join(outDir, 'src', 'inc', 'layout', '_headline.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'inc', 'layout', '_one-col.njk'))).resolves.toBeUndefined();
  });

  it('email package.json has correct token substitution', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...emailDefaults, outDir });
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('test-email');
    expect(pkg.author.name).toBe('Test Author');
    expect(pkg.author.email).toBe('test@example.com');
  });
});

// ---------------------------------------------------------------------------
// scaffold() — wordpress project type
// ---------------------------------------------------------------------------

describe('scaffold — wordpress project type', () => {
  let tmpDir;
  let outDir;

  const wpDefaults = {
    projectName: 'my-wp-theme',
    description: 'A WordPress theme',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'wordpress',
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-wp-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates the output directory for wordpress type', async () => {
    await scaffold({ ...wpDefaults, outDir });
    await expect(access(outDir)).resolves.toBeUndefined();
  });

  it('generates wordpress-specific gulpfile.js (overrides base)', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...wpDefaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toContain('WordPress Theme');
    expect(content).toContain('deployTask');
    expect(content).toContain('jsTask');
  });

  it('generates wordpress gulpfile without nunjucks or inline tasks', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...wpDefaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).not.toContain('nunjucksTask');
    expect(content).not.toContain('inlineTask');
    expect(content).not.toContain('htmlTask');
  });

  it('generates wordpress-specific gulp tasks (build, deploy, watch)', async () => {
    await scaffold({ ...wpDefaults, outDir });
    await expect(access(join(outDir, 'gulp', 'tasks', 'build.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'gulp', 'tasks', 'deploy.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'gulp', 'tasks', 'watch.js'))).resolves.toBeUndefined();
  });

  it('generates wordpress .env.example with WP_URL', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...wpDefaults, outDir });
    const content = await readFile(join(outDir, '.env.example'), 'utf-8');
    expect(content).toContain('WP_URL');
    expect(content).toContain('localhost:8888');
  });

  it('generates .env.example with theme name in remote path', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...wpDefaults, outDir });
    const content = await readFile(join(outDir, '.env.example'), 'utf-8');
    expect(content).toContain('my-wp-theme');
  });

  it('generates wordpress scss src/ structure', async () => {
    await scaffold({ ...wpDefaults, outDir });
    await expect(access(join(outDir, 'src', 'scss', 'theme.scss'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'scss', 'critical.scss'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'scss', 'base'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'scss', 'components'))).resolves.toBeUndefined();
  });

  it('generates wordpress theme.scss with WP theme header tokens substituted', async () => {
    const { readFile } = await import('fs/promises');
    await scaffold({ ...wpDefaults, outDir });
    const content = await readFile(join(outDir, 'src', 'scss', 'theme.scss'), 'utf-8');
    expect(content).toContain('Theme Name: my-wp-theme');
    expect(content).toContain('Author: Test Author');
    expect(content).toContain('Description: A WordPress theme');
  });

  it('generates wordpress js src/ files', async () => {
    await scaffold({ ...wpDefaults, outDir });
    await expect(access(join(outDir, 'src', 'js', 'theme.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'js', 'editor.js'))).resolves.toBeUndefined();
  });
});
