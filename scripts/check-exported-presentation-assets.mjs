import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const siteRoot = path.resolve(process.argv[2] || '_site');
const presentationRoot = path.resolve(process.argv[3] || path.join(siteRoot, 'presentation'));

function isExternalOrDynamic(value = '') {
  return !value
    || value.startsWith('#')
    || value.startsWith('?')
    || value.startsWith('//')
    || value.includes('{{')
    || value.includes('${')
    || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function looksLikeAsset(value, attribute) {
  if (!attribute.startsWith('data-background')) return true;
  return value.startsWith('/') || value.includes('/') || /\.[a-z0-9]{2,8}(?:[?#]|$)/i.test(value);
}

function normaliseReference(value = '') {
  const withoutFragment = value.split('#', 1)[0].split('?', 1)[0].trim();
  if (!withoutFragment) return undefined;

  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}

function cssReferences(css) {
  const references = [];
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const value = match[1].trim();
    if (!isExternalOrDynamic(value)) references.push(value);
  }
  return references;
}

function htmlReferences(html) {
  const references = [];
  const attributePattern = /\b(src|href|poster|data-src|data-background|data-background-image|data-background-video)\s*=\s*["']([^"']+)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const attribute = match[1].toLowerCase();
    const value = match[2].trim();
    if (!isExternalOrDynamic(value) && looksLikeAsset(value, attribute)) references.push(value);
  }

  for (const match of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      const value = candidate.trim().split(/\s+/, 1)[0];
      if (!isExternalOrDynamic(value)) references.push(value);
    }
  }

  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    references.push(...cssReferences(match[1]));
  }

  for (const match of html.matchAll(/\bstyle\s*=\s*["']([^"']+)["']/gi)) {
    references.push(...cssReferences(match[1]));
  }

  return references;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveReference(sourceFile, reference) {
  const normalised = normaliseReference(reference);
  if (!normalised) return undefined;

  return normalised.startsWith('/')
    ? path.resolve(siteRoot, `.${normalised}`)
    : path.resolve(path.dirname(sourceFile), normalised);
}

function assertInsideSite(filePath, sourceFile, reference) {
  if (filePath === siteRoot || filePath.startsWith(`${siteRoot}${path.sep}`)) return;
  throw new Error(`${path.relative(siteRoot, sourceFile)}: reference escapes deployed site: ${reference}`);
}

async function findHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(filePath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath);
  }
  return files;
}

const errors = [];
const checkedCss = new Set();
let referenceCount = 0;
let imageCount = 0;

async function validateReference(sourceFile, reference) {
  const target = resolveReference(sourceFile, reference);
  if (!target) return;

  try {
    assertInsideSite(target, sourceFile, reference);
  } catch (error) {
    errors.push(error.message);
    return;
  }

  referenceCount += 1;
  if (/\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i.test(reference)) imageCount += 1;

  if (!await exists(target)) {
    errors.push(`${path.relative(siteRoot, sourceFile)}: missing exported asset: ${reference}`);
    return;
  }

  if (path.extname(target).toLowerCase() === '.css' && !checkedCss.has(target)) {
    checkedCss.add(target);
    const css = await readFile(target, 'utf8');
    for (const cssReference of cssReferences(css)) {
      await validateReference(target, cssReference);
    }
  }
}

if (!await exists(presentationRoot)) {
  throw new Error(`Exported presentation directory does not exist: ${presentationRoot}`);
}

const htmlFiles = await findHtmlFiles(presentationRoot);
if (htmlFiles.length === 0) throw new Error('No exported presentation HTML files found.');

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  for (const reference of htmlReferences(html)) {
    await validateReference(htmlFile, reference);
  }
}

if (errors.length) {
  throw new Error(`Exported presentation asset validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(`Validated ${referenceCount} exported local references (${imageCount} images) across ${htmlFiles.length} presentation HTML files.`);
