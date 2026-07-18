import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = join(__dirname, '../bin/create.js');
const source = readFileSync(binPath, 'utf-8');

// bin/create.js is the interactive CLI entry point. It uses top-level await
// and @clack/prompts, making full unit-testing impractical. The end-to-end
// behaviour is verified by the smoke test in Task 10.
//
// These tests verify structural invariants: the file is correctly wired to
// the modules it orchestrates and carries the required shebang.

describe('bin/create.js', () => {
  it('has a Node.js shebang as the first line', () => {
    expect(source.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('imports promptUser and sanitizeProjectName from src/cli.js', () => {
    expect(source).toContain("from '../src/cli.js'");
    expect(source).toContain('promptUser');
    expect(source).toContain('sanitizeProjectName');
  });

  it('imports scaffold from src/scaffold.js', () => {
    expect(source).toContain("from '../src/scaffold.js'");
    expect(source).toContain('scaffold');
  });

  it('imports @clack/prompts for user feedback', () => {
    expect(source).toContain("from '@clack/prompts'");
  });

  it('reads CLI arguments from process.argv', () => {
    expect(source).toContain('process.argv.slice(2)');
  });

  it('handles scaffold errors with p.log.error and process.exit(1)', () => {
    expect(source).toContain('process.exit(1)');
    expect(source).toContain('p.log.error');
  });

  it('imports parseArgs from node:util', () => {
    expect(source).toContain("from 'node:util'");
    expect(source).toContain('parseArgs');
  });

  it('handles the --version flag', () => {
    expect(source).toContain('flags.version');
    expect(source).toContain('pkg.version');
  });

  it('handles the --help flag', () => {
    expect(source).toContain('flags.help');
    expect(source).toContain('--type');
    expect(source).toContain('--yes');
    expect(source).toContain('--version');
  });

  it('handles the --yes flag for non-interactive mode', () => {
    expect(source).toContain('flags.yes');
    expect(source).toContain('getGitConfig');
  });

  it('validates --type against VALID_TYPES', () => {
    expect(source).toContain('VALID_TYPES');
  });

  it('imports getGitConfig from src/cli.js', () => {
    expect(source).toContain('getGitConfig');
  });
});
