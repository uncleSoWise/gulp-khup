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

// ---------------------------------------------------------------------------
// WordPress PHP theme port (#76)
// ---------------------------------------------------------------------------

describe('scaffold — WordPress PHP theme port (#76)', () => {
  let tmpDir, outDir;
  const wpDefaults = {
    projectName: 'my-wp-theme',
    description: 'A WordPress theme',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    projectType: 'wordpress',
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-wp76-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...wpDefaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generates style.css with theme header tokens substituted', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'style.css'), 'utf-8');
    expect(content).toContain('Theme Name: my-wp-theme');
    expect(content).toContain('Test Author');
    expect(content).not.toContain('pnmg');
    expect(content).not.toContain('<%= ');
  });

  it('generates theme.json', async () => {
    await expect(access(join(outDir, 'theme.json'))).resolves.toBeUndefined();
  });

  it('theme.json is valid JSON', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'theme.json'), 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('generates functions.php', async () => {
    await expect(access(join(outDir, 'functions.php'))).resolves.toBeUndefined();
  });

  it('generates all functions/ sub-modules', async () => {
    for (const file of [
      'functions/config.php',
      'functions/gutenberg.php',
      'functions/plugins.php',
      'functions/search.php',
      'functions/utils.php',
      'functions/walkers/Walker_Nav_Menu_Custom.php',
    ]) {
      await expect(access(join(outDir, file)), file).resolves.toBeUndefined();
    }
  });

  it('generated PHP files contain no pnmg_ prefix', async () => {
    const { readFile } = await import('fs/promises');
    for (const file of [
      'functions.php',
      'functions/config.php',
      'functions/gutenberg.php',
      'functions/plugins.php',
      'functions/utils.php',
      'header.php',
      'footer.php',
      'index.php',
    ]) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should not contain pnmg_`).not.toContain('pnmg_');
    }
  });

  it('functions/config.php uses wp_enqueue_scripts hook', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'functions/config.php'), 'utf-8');
    expect(content).toContain("add_action( 'wp_enqueue_scripts'");
    expect(content).not.toContain("add_action( 'wp_footer'");
  });

  it('functions/plugins.php wraps ACF calls in function_exists()', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'functions/plugins.php'), 'utf-8');
    expect(content).toContain('function_exists');
  });

  it('generates all PHP template files', async () => {
    for (const file of [
      'header.php', 'footer.php', 'index.php',
      'page.php', 'single.php', '404.php',
      'inc/loop.php', 'inc/loop-search.php',
    ]) {
      await expect(access(join(outDir, file)), file).resolves.toBeUndefined();
    }
  });

  it('generates patterns/hero.php', async () => {
    await expect(access(join(outDir, 'patterns/hero.php'))).resolves.toBeUndefined();
  });

  it('index.php contains YOUR_FIELD_KEY placeholder for ACF block keys', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'index.php'), 'utf-8');
    expect(content).toContain('YOUR_FIELD_KEY');
  });
});

// ---------------------------------------------------------------------------
// Bug fixes — template token substitution and path correctness
// ---------------------------------------------------------------------------

describe('scaffold — web template token substitution (bug fixes)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-bugfix-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...defaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('_layout.njk has no unresolved <%= inSubFolder %> token', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', '_layout.njk'), 'utf-8');
    expect(content).not.toContain('<%= inSubFolder %>');
  });

  it('index.njk has no unresolved <%= inSubFolder %> token', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', 'index.njk'), 'utf-8');
    expect(content).not.toContain('<%= inSubFolder %>');
  });

  it('inc/_meta.njk has no unresolved <%= appName %> token', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', 'inc', '_meta.njk'), 'utf-8');
    expect(content).not.toContain('<%= appName %>');
    expect(content).toContain('test-project');
  });

  it('_reset.scss uses the correct relative path to normalize.css', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', 'scss', 'base', '_reset.scss'), 'utf-8');
    expect(content).toContain('../../../node_modules/normalize.css/normalize');
    expect(content).not.toContain('../../../../../node_modules');
  });

  it('gulp/globs.js has no unresolved <%= prototypePath %> token', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulp', 'globs.js'), 'utf-8');
    expect(content).not.toContain('<%= prototypePath %>');
  });

  it('generated gulp task files contain no eslint-disable comments', async () => {
    const { readFile } = await import('fs/promises');
    const taskFiles = [
      'gulp/tasks/build.js',
      'gulp/tasks/css.js',
      'gulp/tasks/html.js',
      'gulp/tasks/img.js',
      'gulp/tasks/js.js',
      'gulp/tasks/nunjucks.js',
      'gulp/tasks/watch.js',
      'gulpfile.js',
    ];
    for (const file of taskFiles) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should have no eslint-disable`).not.toContain('eslint-disable');
    }
  });
});

describe('scaffold — html-minifier-terser replaces gulp-htmlmin (#80)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-html-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...defaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generated package.json has html-minifier-terser, not gulp-htmlmin', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('gulp-htmlmin');
    expect(pkg.devDependencies).toHaveProperty('html-minifier-terser');
  });

  it('generated html.js imports html-minifier-terser, not gulp-htmlmin', async () => {
    const { readFile } = await import('fs/promises');
    for (const file of ['gulp/tasks/html.js', 'gulp/tasks/nunjucks.js']) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should not import gulp-htmlmin`).not.toContain('gulp-htmlmin');
      expect(content, `${file} should import html-minifier-terser`).toContain('html-minifier-terser');
    }
  });
});

describe('scaffold — sharp replaces gulp-imagemin (#74)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-img-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...defaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generated package.json has sharp and svgo instead of gulp-imagemin', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('gulp-imagemin');
    expect(pkg.devDependencies).toHaveProperty('sharp');
    expect(pkg.devDependencies).toHaveProperty('svgo');
  });

  it('generated img.js imports sharp and not gulp-imagemin', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulp', 'tasks', 'img.js'), 'utf-8');
    expect(content).not.toContain('gulp-imagemin');
    expect(content).toContain('sharp');
  });
});

describe('scaffold — psi task removal (#72)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-psi-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...defaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generated package.json does not include psi dependency', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('psi');
  });

  it('generated gulpfile.js does not import psiTask', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulpfile.js'), 'utf-8');
    expect(content).not.toContain('psiTask');
    expect(content).not.toContain('psi.js');
  });

  it('psi.js is not copied to generated project', async () => {
    await expect(access(join(outDir, 'gulp', 'tasks', 'psi.js'))).rejects.toThrow();
  });
});

describe('scaffold — vinyl-ftp removal, SFTP-only deploy (#73)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-deploy-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...defaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generated package.json does not include vinyl-ftp or fancy-log', async () => {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(join(outDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('vinyl-ftp');
    expect(pkg.devDependencies).not.toHaveProperty('fancy-log');
  });

  it('generated deploy.js does not reference vinyl-ftp or ftpTask', async () => {
    const { readFile } = await import('fs/promises');
    for (const file of ['gulp/tasks/deploy.js', 'gulp/tasks/watch.js']) {
      const content = await readFile(join(outDir, file), 'utf-8');
      expect(content, `${file} should not import vinyl-ftp`).not.toContain('vinyl-ftp');
      expect(content, `${file} should not define ftpTask`).not.toContain('const ftpTask');
      expect(content, `${file} should not use fancyLog`).not.toContain('fancyLog');
    }
  });

  it('generated deploy.js still contains sftpTask', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'gulp', 'tasks', 'deploy.js'), 'utf-8');
    expect(content).toContain('sftpTask');
    expect(content).toContain('ssh2-sftp-client');
  });

  it('generated .env.example has no FTP variables', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, '.env.example'), 'utf-8');
    // Match lines that begin with FTP_ (not SFTP_ — SFTP vars are expected)
    expect(content).not.toMatch(/^FTP_/m);
  });
});

describe('scaffold — email template token substitution (bug fixes)', () => {
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
    tmpDir = await mkdtemp(join(tmpdir(), 'gulp-khup-email-bugfix-'));
    outDir = join(tmpDir, 'output');
    await scaffold({ ...emailDefaults, outDir });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('email layout partials have no unresolved <%= contentWidth %> token', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', 'inc', 'layout', '_one-col.njk'), 'utf-8');
    expect(content).not.toContain('<%= contentWidth %>');
  });

  it('email _preheader.njk has no unresolved EJS tokens', async () => {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(outDir, 'src', 'inc', '_preheader.njk'), 'utf-8');
    expect(content).not.toContain('<%=');
  });
});
