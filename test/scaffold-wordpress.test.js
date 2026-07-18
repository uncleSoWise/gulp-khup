import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { access, readFile } from 'fs/promises';
import { join } from 'path';
import { scaffold } from '../src/scaffold.js';
import { makeTmpDir } from './helpers.js';

// ---------------------------------------------------------------------------
// scaffold() — WordPress project type
// (SCSS/JS structure, PHP boilerplate, WP 6.0+ features — one shared run)
// ---------------------------------------------------------------------------

describe('scaffold — WordPress project type', () => {
  let tmpDir, outDir, cleanup;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = await makeTmpDir('gulp-khup-wp-'));
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

  afterAll(() => cleanup());

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

  it('package.json does not contain a repository field', async () => {
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.repository).toBeUndefined();
  });
});
