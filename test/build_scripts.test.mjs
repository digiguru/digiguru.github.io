import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

async function makeTempDir(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'digiguru-site-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function runScript(script, args) {
  return execFileAsync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd: repoRoot,
  });
}

test('stamp-release adds release metadata, GPT API configuration and badge to presentation HTML', async (t) => {
  const root = await makeTempDir(t);
  const presentationDir = path.join(root, 'presentation');
  const releaseFile = path.join(root, 'release.json');
  await mkdir(presentationDir);

  const websiteSha = 'a'.repeat(40);
  const presentationSha = 'b'.repeat(40);
  await writeFile(
    releaseFile,
    JSON.stringify({
      website: { sha: websiteSha },
      presentations: { sha: presentationSha },
      built_at: '2026-08-11T12:00:00Z',
    }),
  );
  await writeFile(
    path.join(presentationDir, 'deck.html'),
    '<!doctype html><html><head><title>Deck</title></head><body><h1>Deck</h1></body></html>',
  );

  const { stdout } = await runScript('scripts/stamp-release.mjs', [presentationDir, releaseFile]);
  const html = await readFile(path.join(presentationDir, 'deck.html'), 'utf8');

  assert.match(stdout, /Stamped 1 presentation decks/);
  assert.match(html, new RegExp(websiteSha));
  assert.match(html, new RegExp(presentationSha));
  assert.match(html, /name="pure-gpt-api-base" content="https:\/\/ai-prompt-writer\.vercel\.app\/api"/);
  assert.match(html, /id="digiguru-release"/);
  assert.match(html, /release w:aaaaaaa p:bbbbbbb/);
});

test('stamp-release rejects malformed release SHAs', async (t) => {
  const root = await makeTempDir(t);
  const presentationDir = path.join(root, 'presentation');
  const releaseFile = path.join(root, 'release.json');
  await mkdir(presentationDir);
  await writeFile(
    releaseFile,
    JSON.stringify({
      website: { sha: 'short' },
      presentations: { sha: 'b'.repeat(40) },
      built_at: '2026-08-11T12:00:00Z',
    }),
  );
  await writeFile(path.join(presentationDir, 'deck.html'), '<html><head></head><body></body></html>');

  await assert.rejects(
    runScript('scripts/stamp-release.mjs', [presentationDir, releaseFile]),
    (error) => {
      assert.match(error.stderr, /full 40-character website and presentation commit SHAs/);
      return true;
    },
  );
});

test('presentation asset validator accepts local HTML, CSS and image references', async (t) => {
  const siteRoot = await makeTempDir(t);
  const presentationDir = path.join(siteRoot, 'presentation');
  const assetsDir = path.join(presentationDir, 'assets');
  await mkdir(assetsDir, { recursive: true });

  await writeFile(
    path.join(presentationDir, 'deck.html'),
    '<html><head><link rel="stylesheet" href="theme.css"></head><body><img src="assets/slide.png"></body></html>',
  );
  await writeFile(path.join(presentationDir, 'theme.css'), 'body { background-image: url("assets/background.png"); }');
  await writeFile(path.join(assetsDir, 'slide.png'), 'image');
  await writeFile(path.join(assetsDir, 'background.png'), 'image');

  const { stdout } = await runScript('scripts/check-exported-presentation-assets.mjs', [
    siteRoot,
    presentationDir,
  ]);

  assert.match(stdout, /Validated 3 exported local references \(2 images\) across 1 presentation HTML files/);
});

test('presentation asset validator reports missing local references', async (t) => {
  const siteRoot = await makeTempDir(t);
  const presentationDir = path.join(siteRoot, 'presentation');
  await mkdir(presentationDir, { recursive: true });
  await writeFile(
    path.join(presentationDir, 'deck.html'),
    '<html><head></head><body><img src="assets/missing.png"></body></html>',
  );

  await assert.rejects(
    runScript('scripts/check-exported-presentation-assets.mjs', [siteRoot, presentationDir]),
    (error) => {
      assert.match(error.stderr, /missing exported asset: assets\/missing\.png/);
      return true;
    },
  );
});
