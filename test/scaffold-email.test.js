import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join } from 'path';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

// ---------------------------------------------------------------------------
// scaffold() — email project type
// (structure, package.json, token substitution, compatibility — one shared run)
// ---------------------------------------------------------------------------

describe('scaffold — email project type', () => {
  let tmpDir, outDir, cleanup;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-email-'));
    outDir = join(tmpDir, 'output');
    await scaffold({
      projectName: 'test-email',
      description: 'A test email project',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      projectType: 'email',
      outDir,
    });
  });

  afterAll(() => cleanup());

  // --- structure ---

  it('generates email-specific gulpfile.js (overrides base)', async () => {
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toContain('gulpflow — Email');
    expect(content).toContain('inlineTask');
  });

  it('generates email-specific gulp tasks (build, inline, watch)', async () => {
    for (const task of ['inline.js', 'build.js', 'watch.js']) {
      await expect(access(join(outDir, 'gulp', 'tasks', task))).resolves.toBeUndefined();
    }
  });

  it('generates email src/ nunjucks templates and layout partials', async () => {
    await expect(access(join(outDir, 'src', '_layout.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'index.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'inc', 'layout', '_headline.njk'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'inc', 'layout', '_one-col.njk'))).resolves.toBeUndefined();
  });

  // --- package.json ---

  it('package.json has gulp-inline-css and no esbuild', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).toHaveProperty('gulp-inline-css');
    expect(pkg.devDependencies).not.toHaveProperty('esbuild');
  });

  it('package.json is synced with base (html-minifier-terser, sharp, autoprefixer)', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('gulp-htmlmin');
    expect(pkg.devDependencies).not.toHaveProperty('gulp-imagemin');
    expect(pkg.devDependencies).not.toHaveProperty('fancy-log');
    expect(pkg.devDependencies).toHaveProperty('html-minifier-terser');
    expect(pkg.devDependencies).toHaveProperty('sharp');
    expect(pkg.devDependencies).toHaveProperty('autoprefixer');
  });

  it('package.json has npm overrides for security', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides).toHaveProperty('nth-check');
  });

  it('package.json has correct token substitution', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('test-email');
    expect(pkg.author.name).toBe('Test Author');
    expect(pkg.author.email).toBe('test@example.com');
  });

  // --- token substitution ---

  it('email layout partials have no unresolved EJS tokens', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', 'layout', '_one-col.njk'), 'utf-8');
    expect(content).not.toContain('<%= contentWidth %>');
  });

  it('_preheader.njk has no unresolved EJS tokens', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', '_preheader.njk'), 'utf-8');
    expect(content).not.toContain('<%=');
  });

  // --- compatibility (#77) ---

  it('_css.njk @media breakpoint uses max-width: 560px (with px unit)', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', '_css.njk'), 'utf-8');
    expect(content).toContain('max-width: 560px');
    expect(content).not.toContain('max-width: 560)');
  });

  it('_css.njk documents Campaign Monitor merge tags and Gmail behaviour', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', '_css.njk'), 'utf-8');
    expect(content).toContain('Campaign Monitor');
    expect(content).toContain('Gmail');
  });

  it('_footer.njk documents <currentyear> as a Campaign Monitor merge tag', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', '_footer.njk'), 'utf-8');
    expect(content).toContain('Campaign Monitor');
    expect(content).toContain('<currentyear>');
  });
});
