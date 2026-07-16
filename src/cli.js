import { execSync } from 'child_process';

/**
 * Validate a project name. Returns an error string if invalid, undefined if valid.
 * Used as the `validate` callback for @clack/prompts text inputs.
 */
export function validateProjectName(name) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Project name is required';
  if (trimmed.includes('..') || trimmed.startsWith('/')) {
    return 'Invalid project name: path traversal is not allowed';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return 'Invalid project name: use only letters, numbers, hyphens, and underscores';
  }
  return undefined;
}

/**
 * Normalise a project name: trim whitespace, lowercase, replace spaces with hyphens.
 */
export function sanitizeProjectName(name) {
  return name.trim().toLowerCase().replace(/ /g, '-');
}

/**
 * Read a value from git config. Returns empty string if the key is unset or
 * git is unavailable — never throws.
 */
export async function getGitConfig(key) {
  try {
    return execSync(`git config --get ${key}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

/**
 * Run the interactive @clack/prompts flow and return the collected values.
 * Ctrl+C exits cleanly with a message — no stack trace.
 */
export async function promptUser(initialName = '') {
  const p = await import('@clack/prompts');

  p.intro('create-gulp-khup');

  const [authorName, authorEmail] = await Promise.all([
    getGitConfig('user.name'),
    getGitConfig('user.email'),
  ]);

  const values = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is your project name?',
          initialValue: initialName,
          validate: validateProjectName,
        }),
      description: () =>
        p.text({
          message: 'Short description?',
          placeholder: 'A static marketing site',
        }),
      authorName: () =>
        p.text({
          message: 'Author name?',
          initialValue: authorName,
        }),
      authorEmail: () =>
        p.text({
          message: 'Author email?',
          initialValue: authorEmail,
        }),
      projectType: () =>
        p.select({
          message: 'Project type?',
          options: [
            { value: 'web', label: 'Static HTML', hint: 'recommended' },
            { value: 'wordpress', label: 'WordPress', hint: 'coming soon' },
            { value: 'email', label: 'Email' },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel('Cancelled — no files were created.');
        process.exit(0);
      },
    }
  );

  return values;
}
