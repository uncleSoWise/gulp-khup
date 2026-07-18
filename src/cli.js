// @ts-check
import { execSync } from 'node:child_process';

/**
 * @typedef {'web' | 'wordpress' | 'email'} ProjectType
 */

/**
 * @typedef {Object} ScaffoldValues
 * @property {string} projectName
 * @property {string} description
 * @property {string} authorName
 * @property {string} authorEmail
 * @property {ProjectType} projectType
 */

/**
 * Validate a project name. Returns an error string if invalid, undefined if valid.
 * Used as the `validate` callback for \@clack/prompts text inputs.
 * @param {string | null | undefined} name
 * @returns {string | undefined}
 */
export function validateProjectName(name) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Project name is required';
  if (trimmed.includes('..') || trimmed.startsWith('/')) {
    return 'Invalid project name: path traversal is not allowed';
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(trimmed)) {
    return 'Invalid project name: use only lowercase letters, numbers, hyphens, and underscores; must start with a letter or number';
  }
  if (trimmed.length > 214) {
    return 'Invalid project name: must be 214 characters or fewer';
  }
  return undefined;
}

/**
 * Normalise a project name: trim whitespace, lowercase, replace spaces with hyphens.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeProjectName(name) {
  return name.trim().toLowerCase().replace(/ /g, '-');
}

/**
 * Read a value from git config. Returns empty string if the key is unset or
 * git is unavailable — never throws.
 * @param {string} key - e.g. `'user.name'` or `'user.email'`
 * @returns {Promise<string>}
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
 * Run the interactive \@clack/prompts flow and return the collected values.
 * Ctrl+C exits cleanly with a message — no stack trace.
 * @param {{ projectName?: string, description?: string, projectType?: ProjectType, authorName?: string, authorEmail?: string }} [initialValues={}] - Pre-fill values for any prompt field
 * @returns {Promise<ScaffoldValues>}
 */
export async function promptUser(initialValues = {}) {
  const {
    projectName: initialName = '',
    description: initialDescription = '',
    projectType: initialProjectType,
    authorName: prefilledAuthorName,
    authorEmail: prefilledAuthorEmail,
  } = initialValues;

  const p = await import('@clack/prompts');

  p.intro('create-gulp-khup');

  const [gitAuthorName, gitAuthorEmail] = await Promise.all([
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
          initialValue: initialDescription,
        }),
      authorName: () =>
        p.text({
          message: 'Author name?',
          initialValue: prefilledAuthorName ?? gitAuthorName,
        }),
      authorEmail: () =>
        p.text({
          message: 'Author email?',
          initialValue: prefilledAuthorEmail ?? gitAuthorEmail,
        }),
      projectType: () =>
        p.select({
          message: 'Project type?',
          initialValue: initialProjectType,
          options: [
            { value: 'web', label: 'Static HTML', hint: 'recommended' },
            { value: 'wordpress', label: 'WordPress' },
            { value: 'email', label: 'Email' },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel('Cancelled — no files were created.');
        process.exit(0);
      },
    },
  );

  return /** @type {ScaffoldValues} */ (values);
}
