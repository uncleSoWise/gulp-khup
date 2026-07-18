import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, mkdir, access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

import { scaffold, applyTokens, resolveTemplateDirs } from '../src/scaffold.js';

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
    expect(resolveTemplateDirs('wordpress', TEMPLATES_DIR)[1]).toBe(join(TEMPLATES_DIR, 'wordpress'));
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
    await expect(scaffold({ ...defaults, outDir, projectType: 'wordpress' })).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// scaffold() — web project: file content + snapshots
// ---------------------------------------------------------------------------

describe('scaffold — web project: file content', () => {
  let tmpDir, outDir;
  const defaults = {
    projectName: 'test-project',
    description: 'A test project',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'web',
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-web-'));
    outDir = join(tmpDir, 'output');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

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
  let tmpDir, outDir;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-web-reg-'));
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

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

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

// ---------------------------------------------------------------------------
// scaffold() — email project type
// (structure, package.json, token substitution, compatibility — one shared run)
// ---------------------------------------------------------------------------

describe('scaffold — email project type', () => {
  let tmpDir, outDir;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-email-'));
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

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

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

// ---------------------------------------------------------------------------
// scaffold() — WordPress project type
// (SCSS/JS structure, PHP boilerplate, WP 6.0+ features — one shared run)
// ---------------------------------------------------------------------------

describe('scaffold — WordPress project type', () => {
  let tmpDir, outDir;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-wp-'));
    outDir = join(tmpDir, 'output');
    await scaffold({
      projectName: 'my-wp-theme',
      description: 'A WordPress theme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      projectType: 'wordpress',
      outDir,
    });
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // --- gulpfile ---

  it('gulpfile.js is WordPress-specific (deployTask + jsTask; no nunjucks/inline/html)', async () => {
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).toContain('WordPress Theme');
    expect(content).toContain('deployTask');
    expect(content).toContain('jsTask');
    expect(content).not.toContain('nunjucksTask');
    expect(content).not.toContain('inlineTask');
    expect(content).not.toContain('htmlTask');
  });

  it('generates WordPress-specific gulp tasks (build, deploy, watch)', async () => {
    for (const task of ['build.js', 'deploy.js', 'watch.js']) {
      await expect(access(join(outDir, 'gulp', 'tasks', task))).resolves.toBeUndefined();
    }
  });

  it('generates gulp/tasks/js.js (needed by WordPress build pipeline)', async () => {
    await expect(access(join(outDir, 'gulp', 'tasks', 'js.js'))).resolves.toBeUndefined();
  });

  // --- SCSS + JS src ---

  it('generates WordPress scss src/ structure', async () => {
    for (const path of [
      join('src', 'scss', 'theme.scss'),
      join('src', 'scss', 'critical.scss'),
      join('src', 'scss', 'base'),
      join('src', 'scss', 'components'),
    ]) {
      await expect(access(join(outDir, path))).resolves.toBeUndefined();
    }
  });

  it('generates WordPress JS src/ files', async () => {
    await expect(access(join(outDir, 'src', 'js', 'theme.js'))).resolves.toBeUndefined();
    await expect(access(join(outDir, 'src', 'js', 'editor.js'))).resolves.toBeUndefined();
  });

  // --- .env + theme.scss tokens ---

  it('.env.example contains WP_URL, localhost:8888, and theme slug in remote path', async () => {
    const content = await readFile(join(outDir, '.env.example'), 'utf-8');
    expect(content).toContain('WP_URL');
    expect(content).toContain('localhost:8888');
    expect(content).toContain('my-wp-theme');
  });

  it('theme.scss has WP theme header with tokens substituted', async () => {
    const content = await readFile(join(outDir, 'src', 'scss', 'theme.scss'), 'utf-8');
    expect(content).toContain('Theme Name: my-wp-theme');
    expect(content).toContain('Author: Test Author');
    expect(content).toContain('Description: A WordPress theme');
  });

  // --- PHP boilerplate (#76) ---

  it('style.css has WP theme header with tokens substituted and no raw EJS', async () => {
    const content = await readFile(join(outDir, 'src', 'style.css'), 'utf-8');
    expect(content).toContain('Theme Name: my-wp-theme');
    expect(content).toContain('Test Author');
    expect(content).not.toContain('pnmg');
    expect(content).not.toContain('<%= ');
  });

  it('theme.json is present and valid', async () => {
    await expect(access(join(outDir, 'src', 'theme.json'))).resolves.toBeUndefined();
    const content = await readFile(join(outDir, 'src', 'theme.json'), 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('generates functions.php and all sub-modules', async () => {
    for (const file of [
      'functions.php',
      'functions/config.php',
      'functions/gutenberg.php',
      'functions/plugins.php',
      'functions/search.php',
      'functions/utils.php',
      'functions/walkers/Walker_Nav_Menu_Custom.php',
    ]) {
      await expect(access(join(outDir, 'src', file)), file).resolves.toBeUndefined();
    }
  });

  it('generated PHP files use appSlug prefix (my_wp_theme_) and have no pnmg_', async () => {
    for (const file of [
      'functions.php', 'functions/config.php', 'functions/gutenberg.php',
      'functions/plugins.php', 'functions/utils.php', 'header.php', 'footer.php', 'index.php',
    ]) {
      const content = await readFile(join(outDir, 'src', file), 'utf-8');
      expect(content, `${file}: no pnmg_`).not.toContain('pnmg_');
    }
    const config = await readFile(join(outDir, 'src', 'functions', 'config.php'), 'utf-8');
    expect(config).toContain('my_wp_theme_');
  });

  it('functions/config.php uses wp_enqueue_scripts hook (not wp_footer)', async () => {
    const content = await readFile(join(outDir, 'src', 'functions', 'config.php'), 'utf-8');
    expect(content).toContain("add_action( 'wp_enqueue_scripts'");
    expect(content).not.toContain("add_action( 'wp_footer'");
  });

  it('functions/plugins.php guards ACF calls with function_exists()', async () => {
    const content = await readFile(join(outDir, 'src', 'functions', 'plugins.php'), 'utf-8');
    expect(content).toContain('function_exists');
  });

  it('generates all PHP template files', async () => {
    for (const file of [
      'header.php', 'footer.php', 'index.php', 'page.php', 'single.php', '404.php',
      'inc/loop.php', 'inc/loop-search.php',
    ]) {
      await expect(access(join(outDir, 'src', file)), file).resolves.toBeUndefined();
    }
  });

  it('patterns/hero.php is generated with appSlug in pattern slug', async () => {
    const file = join(outDir, 'src', 'patterns', 'hero.php');
    await expect(access(file)).resolves.toBeUndefined();
    const content = await readFile(file, 'utf-8');
    expect(content).toContain('my_wp_theme/hero');
  });

  it('index.php has YOUR_FIELD_KEY placeholders for ACF block field keys', async () => {
    const content = await readFile(join(outDir, 'src', 'index.php'), 'utf-8');
    expect(content).toContain('YOUR_FIELD_KEY');
  });
});

