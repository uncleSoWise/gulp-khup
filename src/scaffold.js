import { copyFile, mkdir, readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Replace all `<%= tokenName %>` occurrences in content with their values.
 * Unknown tokens are left as-is.
 */
export function applyTokens(content, tokens) {
  return Object.entries(tokens).reduce(
    (str, [key, value]) => str.replaceAll(`<%= ${key} %>`, value),
    content
  );
}

/**
 * Returns the ordered list of template directories to merge for a given
 * project type: [base/, <projectType>/].
 */
export function resolveTemplateDirs(projectType, templatesDir) {
  return [
    join(templatesDir, 'base'),
    join(templatesDir, projectType),
  ];
}

/**
 * Scaffold a new project into outDir (or cwd/projectName).
 * Merges base/ and type-specific template directories, applying token
 * substitution on .tpl files and copying everything else verbatim.
 *
 * Throws if the output directory already exists.
 */
export async function scaffold({
  projectName,
  description,
  authorName,
  authorEmail,
  projectType = 'web',
  outDir,
  cwd = process.cwd(),
  _templatesDir, // optional test seam — defaults to the bundled templates/
}) {
  const targetDir = outDir ?? join(cwd, projectName);
  const templatesDir = _templatesDir ?? join(__dirname, '../templates');
  const tokens = {
    appName: projectName,
    appDescription: description,
    authorName,
    authorEmail,
    appVersion: '0.1.0',
    year: new Date().getFullYear().toString(),
    inSubFolder: '',
  };

  try {
    await mkdir(targetDir, { recursive: false });
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`Output directory already exists: ${targetDir}`);
    }
    throw err;
  }

  for (const templateDir of resolveTemplateDirs(projectType, templatesDir)) {
    await copyDir(templateDir, targetDir, tokens);
  }
}

async function copyDir(srcDir, targetDir, tokens) {
  let entries;
  try {
    entries = await readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return; // missing template dir is a deliberate no-op
    throw err;
  }

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const isTpl = extname(entry.name) === '.tpl';
    const destName = isTpl ? basename(entry.name, '.tpl') : entry.name;
    const destPath = join(targetDir, destName);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath, tokens);
    } else if (isTpl) {
      const raw = await readFile(srcPath, 'utf-8');
      await writeFile(destPath, applyTokens(raw, tokens), 'utf-8');
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}
