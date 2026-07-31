import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(root, 'dist');
const originalBaseUrl = 'https://attarivitation.com/demo-heritage-series-aruna/';

const sourceCandidates = [
  path.join(root, 'demo-heritage-series-aruna'),
  path.join(root, 'Index.html.txt')
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findSource() {
  for (const candidate of sourceCandidates) {
    if (await exists(candidate)) return candidate;
  }

  throw new Error(
    'Source not found. Keep “demo-heritage-series-aruna” or “Index.html.txt” in the repository root.'
  );
}

function removeWpSizeSuffix(filename) {
  return filename
    .replace(/-\d+x\d+(?=\.[^.]+$)/i, '')
    .replace(/-e\d+(?=\.[^.]+$)/i, '');
}

function createNameVariants(filename) {
  const variants = new Set();
  const noSize = removeWpSizeSuffix(filename);

  variants.add(filename.toLowerCase());
  variants.add(noSize.toLowerCase());
  variants.add(noSize.replace(/-1(?=\.[^.]+$)/i, '').toLowerCase());

  return [...variants];
}

async function createLocalAssetLookup() {
  const assetDir = path.join(root, 'Assets');
  if (!(await exists(assetDir))) return new Map();

  const files = await readdir(assetDir);
  const lookup = new Map();

  for (const file of files) {
    for (const variant of createNameVariants(file)) {
      if (!lookup.has(variant)) lookup.set(variant, file);
    }
  }

  return lookup;
}

function localizeAssetUrl(url, lookup) {
  if (!/^https?:\/\//i.test(url)) return url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!parsed.hostname.endsWith('attarivitation.com')) return url;
  if (!parsed.pathname.includes('/wp-content/uploads/')) return url;

  const filename = decodeURIComponent(parsed.pathname.split('/').pop() || '');
  const match = createNameVariants(filename)
    .map((key) => lookup.get(key))
    .find(Boolean);

  return match ? `./Assets/${encodeURIComponent(match)}` : url;
}

function rewriteUrls(html, assetLookup) {
  let output = html;

  output = output.replace(
    /https?:\/\/attarivitation\.com\/wp-content\/uploads\/[^\s"')>,]+/gi,
    (url) => localizeAssetUrl(url.replace(/&amp;/g, '&'), assetLookup)
  );

  output = output.replace(
    /(<link\b[^>]*rel=["']canonical["'][^>]*href=)["'][^"']*["']/i,
    `$1"./"`
  );

  output = output.replace(
    /(<meta\b[^>]*property=["']og:url["'][^>]*content=)["'][^"']*["']/i,
    `$1"./"`
  );

  return output;
}

function removeTracking(html) {
  return html
    .replace(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/gi, '')
    .replace(/<meta\s+name=["']facebook-domain-verification["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*src=["'][^"']*(?:connect\.facebook\.net|googletagmanager\.com|google-analytics\.com)[^"']*["'][^>]*><\/script>/gi, '')
    .replace(/<noscript>[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>/gi, '');
}

function injectLocalRuntime(html) {
  const runtimeTag = '<script src="./aruna-runtime.js" defer></script>';

  let output = html;

  // The captured page mostly uses absolute URLs. Convert any remaining
  // WordPress root-relative resources back to the original host while
  // keeping local Assets and runtime paths relative to this deployment.
  output = output.replace(
    /(["'(=])\/(wp-(?:content|includes|admin)\/)/gi,
    `$1https://attarivitation.com/$2`
  );

  if (!output.includes('aruna-runtime.js')) {
    output = output.replace(/<\/body>/i, `${runtimeTag}\n</body>`);
  }

  return output;
}

async function copyRuntime() {
  const runtime = await readFile(path.join(root, 'aruna-runtime.js'), 'utf8');
  await writeFile(path.join(outputDir, 'aruna-runtime.js'), runtime, 'utf8');
}

async function build() {
  const sourcePath = await findSource();
  const sourceHtml = await readFile(sourcePath, 'utf8');
  const assetLookup = await createLocalAssetLookup();

  let html = removeTracking(sourceHtml);
  html = rewriteUrls(html, assetLookup);
  html = injectLocalRuntime(html);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
  await writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8');
  await copyRuntime();

  console.log(`Built ${path.relative(root, sourcePath)} -> dist/index.html`);
  console.log(`Localized asset aliases available: ${assetLookup.size}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
