#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { access, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const supportedPreviewExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function optimizedPreviewPath(source) {
  const extension = path.posix.extname(source);
  return `${source.slice(0, -extension.length)}.homepage.webp`;
}

function replaceOrAddAttribute(tag, name, value) {
  const attribute = new RegExp(`\\s${name}=(['"]).*?\\1`, 'i');
  if (attribute.test(tag)) {
    return tag.replace(attribute, ` ${name}="${value}"`);
  }

  return tag.replace(/\s*\/?>(\s*)$/, ` ${name}="${value}">$1`);
}

export function rewriteImageTag(tag, source, width, height) {
  let rewritten = tag.replace(/\ssrc=(['"]).*?\1/i, ` src="${source}"`);
  rewritten = replaceOrAddAttribute(rewritten, 'width', width);
  rewritten = replaceOrAddAttribute(rewritten, 'height', height);
  return rewritten;
}

async function findImageMagick() {
  for (const command of ['magick', 'convert']) {
    try {
      await execFileAsync('bash', ['-lc', `command -v ${command}`]);
      return command;
    } catch {
      // Try the next ImageMagick command name.
    }
  }

  throw new Error('ImageMagick is required (expected `magick` or `convert` on PATH)');
}

async function identifyDimensions(command, file) {
  const identifyCommand = command === 'magick' ? 'magick' : 'identify';
  const args = command === 'magick'
    ? ['identify', '-format', '%w %h', file]
    : ['-format', '%w %h', file];
  const { stdout } = await execFileAsync(identifyCommand, args);
  const [width, height] = stdout.trim().split(/\s+/).map(Number);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not identify image dimensions for ${file}`);
  }

  return { width, height };
}

async function optimizeImage(command, input, output, maxWidth, quality) {
  const args = [
    input,
    '-auto-orient',
    '-resize', `${maxWidth}x>`,
    '-strip',
    '-quality', String(quality),
    output,
  ];

  if (command === 'magick') {
    await execFileAsync('magick', args);
  } else {
    await execFileAsync('convert', args);
  }
}

function localPath(siteRoot, source) {
  return path.join(siteRoot, source.replace(/^\//, ''));
}

export async function optimizeHomepage(siteRoot) {
  const indexPath = path.join(siteRoot, 'index.html');
  let html = await readFile(indexPath, 'utf8');
  const command = await findImageMagick();
  const imagePattern = /<img\b[^>]*\bsrc=(['"])(\/(?:assets|images)\/[^'"?#]+)\1[^>]*>/gi;
  const matches = [...html.matchAll(imagePattern)];
  const optimized = new Map();

  for (const match of matches) {
    const originalTag = match[0];
    const source = match[2];
    const extension = path.posix.extname(source).toLowerCase();
    const isLogo = source === '/images/logo.webp';

    if (!isLogo && !supportedPreviewExtensions.has(extension)) {
      continue;
    }

    if (!optimized.has(source)) {
      const input = localPath(siteRoot, source);
      await access(input);
      const before = await stat(input);
      let outputSource = source;
      let output = input;
      const maxWidth = isLogo ? 700 : 720;
      const quality = isLogo ? 76 : 80;

      if (isLogo) {
        output = `${input}.optimized.webp`;
      } else {
        outputSource = optimizedPreviewPath(source);
        output = localPath(siteRoot, outputSource);
      }

      await optimizeImage(command, input, output, maxWidth, quality);
      const dimensions = await identifyDimensions(command, output);
      const after = await stat(output);

      if (isLogo) {
        await rename(output, input);
      }

      optimized.set(source, {
        source: outputSource,
        width: dimensions.width,
        height: dimensions.height,
        before: before.size,
        after: after.size,
      });
    }

    const result = optimized.get(source);
    const rewrittenTag = rewriteImageTag(
      originalTag,
      result.source,
      result.width,
      result.height,
    );
    html = html.replace(originalTag, rewrittenTag);
  }

  await writeFile(indexPath, html);

  let beforeTotal = 0;
  let afterTotal = 0;
  for (const result of optimized.values()) {
    beforeTotal += result.before;
    afterTotal += result.after;
  }

  const saved = beforeTotal - afterTotal;
  const percentage = beforeTotal > 0 ? Math.round((saved / beforeTotal) * 100) : 0;
  console.log(
    `Optimized ${optimized.size} homepage images: ` +
    `${Math.round(beforeTotal / 1024)} KiB -> ${Math.round(afterTotal / 1024)} KiB ` +
    `(${percentage}% smaller)`,
  );

  return { count: optimized.size, beforeTotal, afterTotal };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const siteRoot = path.resolve(process.argv[2] || '_site');
  optimizeHomepage(siteRoot).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
