import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const scanRoots = ['src', 'legacy-static'];
const textExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.ts', '.tsx']);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(location)));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(location);
  }
  return files;
}

const files = (
  await Promise.all(
    scanRoots.map(async (root) => {
      try {
        return await walk(path.join(projectRoot, root));
      } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
      }
    }),
  )
).flat();

const fontCss = path.join(projectRoot, 'public', 'assets', 'fonts', 'fonts.css');
try {
  await fs.access(fontCss);
  files.push(fontCss);
} catch {
  // Reported as missing through the stylesheet reference below.
}

const references = new Set();
const externalAssets = new Set();

for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  for (const match of content.matchAll(/\/assets\/[^'"`\s)]+/g)) references.add(match[0].replace(/[;,]+$/, ''));
  for (const match of content.matchAll(/https?:\/\/[^'"`\s)<>]+/g)) {
    const value = match[0].replace(/[;,]+$/, '');
    if (/\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf)(?:\?[^#]*)?$/i.test(value)) {
      externalAssets.add(value);
    }
  }
}

const missing = [];
for (const reference of references) {
  const diskPath = path.join(projectRoot, 'public', ...reference.split('/').filter(Boolean));
  try {
    await fs.access(diskPath);
  } catch {
    missing.push(reference);
  }
}

console.log(
  JSON.stringify(
    {
      localAssetReferences: references.size,
      missingLocalAssets: missing,
      externalAssetReferences: [...externalAssets],
    },
    null,
    2,
  ),
);

if (missing.length || externalAssets.size) process.exitCode = 1;
