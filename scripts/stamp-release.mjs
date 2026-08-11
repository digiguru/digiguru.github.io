import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [presentationDir, releaseFile] = process.argv.slice(2);

if (!presentationDir || !releaseFile) {
  throw new Error('Usage: node scripts/stamp-release.mjs <presentation-dir> <release.json>');
}

const release = JSON.parse(await readFile(releaseFile, 'utf8'));
const websiteSha = release.website?.sha;
const presentationSha = release.presentations?.sha;
const builtAt = release.built_at;

const shaPattern = /^[0-9a-f]{40}$/;
if (!shaPattern.test(websiteSha) || !shaPattern.test(presentationSha)) {
  throw new Error('release.json must contain full 40-character website and presentation commit SHAs');
}

const shortWebsiteSha = websiteSha.slice(0, 7);
const shortPresentationSha = presentationSha.slice(0, 7);
const releaseFlag = `w:${shortWebsiteSha} p:${shortPresentationSha}`;

const releaseHead = `
    <meta name="release-website-commit" content="${websiteSha}">
    <meta name="release-presentation-commit" content="${presentationSha}">
    <meta name="release-built-at" content="${builtAt}">
    <meta name="release-flag" content="${releaseFlag}">
    <style id="digiguru-release-style">
      #digiguru-release { position: fixed; left: 8px; bottom: 8px; z-index: 2147483647; padding: 4px 6px; border-radius: 4px; background: rgba(0, 0, 0, .72); color: #fff; font: 10px/1.2 monospace; text-decoration: none; opacity: .28; transition: opacity .15s ease; }
      #digiguru-release:hover, #digiguru-release:focus { opacity: 1; }
    </style>`;

const releaseBadge = `
    <a id="digiguru-release" href="../release.json" title="Release details — website ${websiteSha}, presentations ${presentationSha}">release ${releaseFlag}</a>`;

const entries = await readdir(presentationDir, { withFileTypes: true });
const deckFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

if (deckFiles.length === 0) {
  throw new Error(`No exported presentation HTML files found in ${presentationDir}`);
}

for (const filename of deckFiles) {
  const filePath = path.join(presentationDir, filename);
  let html = await readFile(filePath, 'utf8');

  if (!/<\/head>/i.test(html) || !/<\/body>/i.test(html)) {
    throw new Error(`${filename} is missing a closing head or body tag`);
  }

  html = html.replace(/<\/head>/i, `${releaseHead}\n  </head>`);
  html = html.replace(/<\/body>/i, `${releaseBadge}\n  </body>`);

  if (!html.includes(websiteSha) || !html.includes(presentationSha) || !html.includes('id="digiguru-release"')) {
    throw new Error(`Failed to stamp release metadata into ${filename}`);
  }

  await writeFile(filePath, html);
}

console.log(`Stamped ${deckFiles.length} presentation decks with release ${releaseFlag}`);
