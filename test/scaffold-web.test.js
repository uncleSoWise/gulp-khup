import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// scaffold() — web project: file content + snapshots
// ---------------------------------------------------------------------------

describe('scaffold — web project: file content', () => {
  let tmpDir, outDir, cleanup;
  const defaults = {
    projectName: 'test-project',
    description: 'A test project',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'web',
  };

  beforeEach(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-web-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(() => cleanup());

  it('creates gulpfile.js', async () => {
    await scaffold({ ...defaults, outDir });
    await expect(access(join(outDir, 'gulpfile.js'))).resolves.toBeUndefined();
  });

  it('creates package.json from .tpl with token substitution', async () => {
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
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'CHANGELOG.md'), 'utf-8');
    expect(content).toContain(new Date().getFullYear().toString());
  });

  it('matches package.json snapshot', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'package.json'), 'utf-8');
    expect(JSON.parse(content)).toMatchSnapshot();
  });

  it('matches gulpfile.js snapshot', async () => {
    await scaffold({ ...defaults, outDir });
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// scaffold() — web project: regressions
// (token substitution, removed deps, removed tasks — one shared scaffold run)
// ---------------------------------------------------------------------------

describe('scaffold — web project: regressions', () => {
  let tmpDir, outDir, cleanup;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-web-reg-'));
    outDir = join(tmpDir, 'output');
    await scaffold({
      projectName: 'test-project',
      description: 'A test project',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      projectType: 'web',
      outDir,
    });
  });

  afterAll(() => cleanup());

  // --- token substitution ---

  it('_layout.njk has no unresolved <%= inSubFolder %> token', async () => {
    const content = await readFile(join(outDir, 'src', '_layout.njk'), 'utf-8');
    expect(content).not.toContain('<%= inSubFolder %>');
  });

  it('index.njk has no unresolved <%= inSubFolder %> token', async () => {
    const content = await readFile(join(outDir, 'src', 'index.njk'), 'utf-8');
    expect(content).not.toContain('<%= inSubFolder %>');
  });

  it('inc/_meta.njk substitutes appName and has no raw tokens', async () => {
    const content = await readFile(join(outDir, 'src', 'inc', '_meta.njk'), 'utf-8');
    expect(content).not.toContain('<%= appName %>');
    expect(content).toContain('test-project');
  });

  it('_reset.scss uses the correct 3-level relative path to normalize.css', async () => {
    const content = await readFile(join(outDir, 'src', 'scss', 'base', '_reset.scss'), 'utf-8');
    expect(content).toContain('../../../node_modules/normalize.css/normalize');
    expect(content).not.toContain('../../../../../node_modules');
  });

  it('globs.js has no unresolved <%= prototypePath %> token', async () => {
    const content = await readFile(join(outDir, 'gulp', 'globs.js'), 'utf-8');
    expect(content).not.toContain('<%= prototypePath %>');
  });

  it('generated gulp task files have no eslint-disable comments', async () => {
    for (const file of [
      'gulp/tasks/build.js', 'gulp/tasks/css.js', 'gulp/tasks/html.js',
      'gulp/tasks/img.js', 'gulp/tasks/js.js', 'gulp/tasks/nunjucks.js',
      'gulp/tasks/watch.js', 'gulpfile.js',
    ]) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should have no eslint-disable`).not.toContain('eslint-disable');
    }
  });

  // --- html-minifier-terser (#80) ---

  it('package.json has html-minifier-terser, not gulp-htmlmin', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('gulp-htmlmin');
    expect(pkg.devDependencies).toHaveProperty('html-minifier-terser');
  });

  it('html.js and nunjucks.js import html-minifier-terser, not gulp-htmlmin', async () => {
    for (const file of ['gulp/tasks/html.js', 'gulp/tasks/nunjucks.js']) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file}: no gulp-htmlmin`).not.toContain('gulp-htmlmin');
      expect(content, `${file}: has html-minifier-terser`).toContain('html-minifier-terser');
    }
  });

  // --- sharp + svgo (#74) ---

  it('package.json has sharp and svgo, not gulp-imagemin', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('gulp-imagemin');
    expect(pkg.devDependencies).toHaveProperty('sharp');
    expect(pkg.devDependencies).toHaveProperty('svgo');
  });

  it('img.js imports sharp, not gulp-imagemin', async () => {
    const content = await readFile(join(outDir, 'gulp', 'tasks', 'img.js'), 'utf-8');
    expect(content).not.toContain('gulp-imagemin');
    expect(content).toContain('sharp');
  });

  // --- psi task removed (#72) ---

  it('package.json has no psi dependency', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('psi');
  });

  it('gulpfile.js has no psiTask', async () => {
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).not.toContain('psiTask');
    expect(content).not.toContain('psi.js');
  });

  it('psi.js is not copied to generated project', async () => {
    await expect(access(join(outDir, 'gulp', 'tasks', 'psi.js'))).rejects.toThrow();
  });

  // --- vinyl-ftp removed, SFTP only (#73) ---

  it('package.json has no vinyl-ftp or fancy-log', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('vinyl-ftp');
    expect(pkg.devDependencies).not.toHaveProperty('fancy-log');
  });

  it('deploy.js and watch.js have no vinyl-ftp or ftpTask', async () => {
    for (const file of ['gulp/tasks/deploy.js', 'gulp/tasks/watch.js']) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file}: no vinyl-ftp`).not.toContain('vinyl-ftp');
      expect(content, `${file}: no ftpTask`).not.toContain('const ftpTask');
      expect(content, `${file}: no fancyLog`).not.toContain('fancyLog');
    }
  });

  it('deploy.js still contains sftpTask and ssh2-sftp-client', async () => {
    const content = await readFile(join(outDir, 'gulp', 'tasks', 'deploy.js'), 'utf-8');
    expect(content).toContain('sftpTask');
    expect(content).toContain('ssh2-sftp-client');
  });

  it('.env.example has no FTP_ variables (only SFTP_)', async () => {
    const content = await readFile(join(outDir, '.env.example'), 'utf-8');
    expect(content).not.toMatch(/^FTP_/m);
  });
});
