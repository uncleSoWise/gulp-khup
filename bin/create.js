#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import * as p from '@clack/prompts';
import { getGitConfig, promptUser, sanitizeProjectName, validateProjectName } from '../src/cli.js';
import { scaffold } from '../src/scaffold.js';

let flags, positionals;
try {
  const parsed = parseArgs({
    args: process.argv.slice(2),
    options: {
      version: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' },
      type: { type: 'string' },
      description: { type: 'string' },
      yes: { type: 'boolean', short: 'y' },
    },
    allowPositionals: true,
  });
  flags = parsed.values;
  positionals = parsed.positionals;
} catch (err) {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (flags.version) {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

if (flags.help) {
  console.log(`
Usage: npm create gulp-khup@latest [project-name] [options]

Options:
  --type <type>          Project type: web, wordpress, or email (default: web)
  --description <text>   Short project description
  --yes, -y              Skip prompts and use defaults
  --version, -v          Print version and exit
  --help, -h             Show this help and exit
`);
  process.exit(0);
}

const VALID_TYPES = new Set(['web', 'wordpress', 'email']);
if (flags.type && !VALID_TYPES.has(flags.type)) {
  p.log.error(`Invalid --type "${flags.type}". Must be: web, wordpress, or email.`);
  process.exit(1);
}

const rawArg = positionals[0];
const initialName = rawArg ? sanitizeProjectName(rawArg) : '';

let values;
if (flags.yes) {
  if (!rawArg) {
    p.log.error(
      'Project name is required with --yes. Usage: npm create gulp-khup@latest <name> --yes',
    );
    process.exit(1);
  }
  const nameError = validateProjectName(initialName);
  if (nameError) {
    p.log.error(nameError);
    process.exit(1);
  }
  const [authorName, authorEmail] = await Promise.all([
    getGitConfig('user.name'),
    getGitConfig('user.email'),
  ]);
  values = {
    projectName: initialName,
    description: flags.description ?? '',
    authorName,
    authorEmail,
    projectType: /** @type {import('../src/cli.js').ProjectType} */ (flags.type ?? 'web'),
  };
} else {
  values = await promptUser({
    projectName: initialName,
    ...(flags.type && {
      projectType: /** @type {import('../src/cli.js').ProjectType} */ (flags.type),
    }),
    ...(flags.description !== undefined && { description: flags.description }),
  });
}

const projectName = sanitizeProjectName(values.projectName);

p.log.step(`Scaffolding ${projectName}...`);

try {
  await scaffold({ ...values, projectName });
  p.outro(`Done! Run:\n\n  cd ${projectName}\n  npm install\n  gulp`);
} catch (err) {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
