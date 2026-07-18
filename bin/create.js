#!/usr/bin/env node
import * as p from '@clack/prompts';
import { promptUser, sanitizeProjectName } from '../src/cli.js';
import { scaffold } from '../src/scaffold.js';

const rawArg = process.argv[2];
const initialName = rawArg ? sanitizeProjectName(rawArg) : '';

const values = await promptUser({ projectName: initialName });
const projectName = sanitizeProjectName(values.projectName);

p.log.step(`Scaffolding ${projectName}...`);

try {
  await scaffold({ ...values, projectName });
  p.outro(`Done! Run:\n\n  cd ${projectName}\n  npm install\n  gulp`);
} catch (err) {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
