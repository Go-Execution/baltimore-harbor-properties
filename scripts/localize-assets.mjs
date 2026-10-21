import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const sourceRoots = ['src', 'legacy-static'];
const textExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.md', '.ts', '.tsx']);
const assetHosts = new Set(['www.chasestreetproperties.net', 'images.unsplash.com']);
const googleFontsHost = 'fonts.googleapis.com';
const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36';

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

function cleanUrl(value) {
  let cleaned = value.replace(/[;,]+$/, '');
  if (cleaned.endsWith(')') && !cleaned.includes('(')) cleaned = cleaned.slice(0, -1);
  return cleaned;
}

function isRemoteAsset(url) {
  if (url.hostname === 'images.unsplash.com') return true;
  if (url.hostname === googleFontsHost) return url.pathname.startsWith('/css');
  if (url.hostname !== 'www.chasestreetproperties.net') return false;
  return /\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf)$/i.test(url.pathname);
}

function shortHash(value) {
  return createHash('sha1').update(value).digest('hex').slice(0, 12);
}

function safeBaseName(url, fallback = 'asset') {
  const rawName = path.posix.basename(url.pathname) || fallback;
  const extension = path.posix.extname(rawName);
  const stem = (extension ? rawName.slice(0, -extension.length) : rawName)
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return stem || fallback;
}

function extensionFor(url, contentType) {
  const pathnameExtension = path.posix.extname(url.pathname).toLowerCase();
  if (/^\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf)$/.test(pathnameExtension)) {
    return pathnameExtension === '.jpeg' ? '.jpg' : pathnameExtension;
  }

  const type = contentType.split(';')[0].trim().toLowerCase();
  return (
    {
      'image/avif': '.avif',
      'image/gif': '.gif',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/svg+xml': '.svg',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'font/woff': '.woff',
      'font/woff2': '.woff2',
      'application/font-woff': '.woff',
    }[type] || '.bin'
  );
}

async function fetchAsset(remoteUrl) {
  const response = await fetch(remoteUrl, {
    headers: { 'user-agent': userAgent, accept: '*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || '',
  };
}

async function localizeMedia(remoteUrl) {
  const url = new URL(remoteUrl);
  const { bytes, contentType } = await fetchAsset(remoteUrl);
  if (!/^(?:image|video|font)\//i.test(contentType) && !/^application\/(?:font-woff|octet-stream)/i.test(contentType)) {
    throw new Error(`Unexpected content type: ${contentType || 'unknown'}`);
  }
  const extension = extensionFor(url, contentType);
  const hostFolder = url.hostname === 'www.chasestreetproperties.net' ? 'chase' : 'unsplash';
  const filename = `${safeBaseName(url)}--${shortHash(remoteUrl)}${extension}`;
  const publicPath = `/assets/media/${hostFolder}/${filename}`;
  const diskPath = path.join(publicRoot, ...publicPath.split('/').filter(Boolean));
  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.writeFile(diskPath, bytes);
  return { publicPath, size: bytes.length };
}

async function localizeGoogleFonts(remoteUrl) {
  const response = await fetch(remoteUrl, {
    headers: { 'user-agent': userAgent },
    redirect: 'follow',
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  let css = await response.text();
  const fontUrls = [...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g)].map((match) => match[0]))];
  let totalSize = Buffer.byteLength(css);

  for (const fontUrl of fontUrls) {
    const { bytes, contentType } = await fetchAsset(fontUrl);
    const parsed = new URL(fontUrl);
    const extension = extensionFor(parsed, contentType);
    const filename = `${safeBaseName(parsed, 'font')}--${shortHash(fontUrl)}${extension}`;
    const publicPath = `/assets/fonts/${filename}`;
    const diskPath = path.join(publicRoot, ...publicPath.split('/').filter(Boolean));
    await fs.mkdir(path.dirname(diskPath), { recursive: true });
    await fs.writeFile(diskPath, bytes);
    css = css.split(fontUrl).join(publicPath);
    totalSize += bytes.length;
  }

  const cssPublicPath = '/assets/fonts/fonts.css';
  await fs.mkdir(path.join(publicRoot, 'assets', 'fonts'), { recursive: true });
  await fs.writeFile(path.join(publicRoot, 'assets', 'fonts', 'fonts.css'), css);
  return { publicPath: cssPublicPath, size: totalSize };
}

const files = (
  await Promise.all(
    sourceRoots.map(async (root) => {
      const absoluteRoot = path.join(projectRoot, root);
      try {
        return await walk(absoluteRoot);
      } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
      }
    }),
  )
).flat();

const contents = new Map(await Promise.all(files.map(async (file) => [file, await fs.readFile(file, 'utf8')])));
const remoteUrls = new Set();
const urlPattern = /https?:\/\/[^'"`\s<>]+/g;

for (const content of contents.values()) {
  for (const match of content.matchAll(urlPattern)) {
    const remoteUrl = cleanUrl(match[0]);
    try {
      const url = new URL(remoteUrl);
      if (isRemoteAsset(url)) remoteUrls.add(remoteUrl);
    } catch {
      // Ignore malformed non-asset strings.
    }
  }
}

const queue = [...remoteUrls].sort();
const replacements = new Map();
const failures = [];
let downloadedBytes = 0;
let nextIndex = 0;

async function worker() {
  while (nextIndex < queue.length) {
    const index = nextIndex++;
    const remoteUrl = queue[index];
    try {
      const url = new URL(remoteUrl);
      const result =
        url.hostname === googleFontsHost
          ? await localizeGoogleFonts(remoteUrl)
          : await localizeMedia(remoteUrl);
      replacements.set(remoteUrl, result.publicPath);
      downloadedBytes += result.size;
      process.stdout.write(`\rLocalized ${replacements.size + failures.length}/${queue.length}`);
    } catch (error) {
      failures.push({ remoteUrl, error: error.message });
      process.stdout.write(`\rLocalized ${replacements.size + failures.length}/${queue.length}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(8, queue.length || 1) }, () => worker()));
process.stdout.write('\n');

for (const [file, original] of contents) {
  let updated = original;
  for (const [remoteUrl, publicPath] of replacements) updated = updated.split(remoteUrl).join(publicPath);
  if (updated !== original) await fs.writeFile(file, updated);
}

console.log(
  JSON.stringify(
    {
      discovered: queue.length,
      localized: replacements.size,
      failed: failures.length,
      downloadedMiB: Number((downloadedBytes / 1024 / 1024).toFixed(2)),
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
