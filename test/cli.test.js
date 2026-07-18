import { describe, expect, it } from 'vitest';

import { getGitConfig, sanitizeProjectName, validateProjectName } from '../src/cli.js';

// ---------------------------------------------------------------------------
// validateProjectName — pure validation, returns error string or undefined
// ---------------------------------------------------------------------------

describe('validateProjectName', () => {
  it('returns an error message for null input', () => {
    expect(validateProjectName(null)).toMatch(/required/i);
  });

  it('returns an error message for undefined input', () => {
    expect(validateProjectName(undefined)).toMatch(/required/i);
  });

  it('returns an error message for empty string', () => {
    expect(validateProjectName('')).toMatch(/required/i);
  });

  it('returns an error message for whitespace-only string', () => {
    expect(validateProjectName('   ')).toMatch(/required/i);
  });

  it('returns an error message for path traversal with ../', () => {
    expect(validateProjectName('../evil')).toMatch(/path traversal/i);
  });

  it('returns an error message for absolute path', () => {
    expect(validateProjectName('/etc/passwd')).toMatch(/path traversal/i);
  });

  it('returns an error message for names containing spaces', () => {
    expect(validateProjectName('my project')).toMatch(/invalid/i);
  });

  it('returns an error message for names containing special characters', () => {
    expect(validateProjectName('my-project!')).toMatch(/invalid/i);
  });

  it('returns an error message for names containing @', () => {
    expect(validateProjectName('@scope/pkg')).toMatch(/invalid/i);
  });

  it('returns undefined for a valid lowercase name', () => {
    expect(validateProjectName('my-project')).toBeUndefined();
  });

  it('returns undefined for a name with numbers', () => {
    expect(validateProjectName('project-2024')).toBeUndefined();
  });

  it('returns undefined for a name with underscores', () => {
    expect(validateProjectName('my_project')).toBeUndefined();
  });

  it('returns undefined for a single character name', () => {
    expect(validateProjectName('a')).toBeUndefined();
  });

  it('rejects an uppercase name', () => {
    expect(validateProjectName('MyProject')).toMatch(/lowercase/i);
  });

  it('rejects a name starting with a hyphen', () => {
    expect(validateProjectName('-myproject')).toMatch(/invalid/i);
  });

  it('rejects a name starting with an underscore', () => {
    expect(validateProjectName('_myproject')).toMatch(/invalid/i);
  });

  it('rejects a name longer than 214 characters', () => {
    expect(validateProjectName('a'.repeat(215))).toMatch(/214/);
  });

  it('accepts a name starting with a digit', () => {
    expect(validateProjectName('1project')).toBeUndefined();
  });

  it('accepts a name exactly 214 characters long', () => {
    expect(validateProjectName('a'.repeat(214))).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// sanitizeProjectName — pure transform
// ---------------------------------------------------------------------------

describe('sanitizeProjectName', () => {
  it('trims leading whitespace', () => {
    expect(sanitizeProjectName('  my-project')).toBe('my-project');
  });

  it('trims trailing whitespace', () => {
    expect(sanitizeProjectName('my-project  ')).toBe('my-project');
  });

  it('converts to lowercase', () => {
    expect(sanitizeProjectName('MyProject')).toBe('myproject');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizeProjectName('my project')).toBe('my-project');
  });

  it('preserves existing hyphens', () => {
    expect(sanitizeProjectName('my-project')).toBe('my-project');
  });

  it('preserves underscores', () => {
    expect(sanitizeProjectName('my_project')).toBe('my_project');
  });

  it('handles an already-valid name unchanged', () => {
    expect(sanitizeProjectName('valid-name')).toBe('valid-name');
  });

  it('trims then lowercases then replaces spaces', () => {
    expect(sanitizeProjectName('  My Project  ')).toBe('my-project');
  });
});

// ---------------------------------------------------------------------------
// getGitConfig — shell-out to git config, returns string (may be empty)
// ---------------------------------------------------------------------------

describe('getGitConfig', () => {
  it('returns a string for user.name', async () => {
    const result = await getGitConfig('user.name');
    expect(typeof result).toBe('string');
  });

  it('returns a string for user.email', async () => {
    const result = await getGitConfig('user.email');
    expect(typeof result).toBe('string');
  });

  it('returns empty string for a key that does not exist', async () => {
    const result = await getGitConfig('this.key.does.not.exist.at.all');
    expect(result).toBe('');
  });

  it('never throws — always resolves', async () => {
    await expect(getGitConfig('nonexistent.key')).resolves.toBeDefined();
  });
});
