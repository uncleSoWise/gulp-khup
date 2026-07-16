import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Validates the scaffolder's own package.json is correctly structured for
// npm publishing as create-gulp-khup. These assertions catch accidental
// regressions to the old gulpsheet configuration.

describe('package.json', () => {
  it('has the correct published package name', () => {
    expect(pkg.name).toBe('create-gulp-khup');
  });

  it('is not marked private', () => {
    expect(pkg.private).toBeUndefined();
  });

  it('uses native ESM', () => {
    expect(pkg.type).toBe('module');
  });

  it('declares the CLI bin entry point', () => {
    expect(pkg.bin?.['create-gulp-khup']).toBe('./bin/create.js');
  });

  it('exports the scaffold module', () => {
    expect(pkg.exports).toBe('./src/scaffold.js');
  });

  it('requires Node.js 18 or higher', () => {
    expect(pkg.engines?.node).toBe('>=18');
  });

  it('only ships bin/, src/, and templates/ in the published package', () => {
    expect(pkg.files).toEqual(['bin', 'src', 'templates']);
  });

  it('has @clack/prompts as the sole runtime dependency', () => {
    const deps = Object.keys(pkg.dependencies ?? {});
    expect(deps).toEqual(['@clack/prompts']);
  });

  it('has vitest and coverage-v8 as dev dependencies', () => {
    expect(pkg.devDependencies).toHaveProperty('vitest');
    expect(pkg.devDependencies).toHaveProperty('@vitest/coverage-v8');
  });

  it('has test scripts wired to vitest', () => {
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts['test:coverage']).toBe('vitest run --coverage');
    expect(pkg.scripts['test:watch']).toBe('vitest');
  });
});
