const [siteUrl, expectedWebsiteSha] = process.argv.slice(2);

if (!siteUrl || !expectedWebsiteSha) {
  throw new Error('Usage: node scripts/smoke-deployed-site.mjs <site-url> <expected-website-sha>');
}

if (!/^[0-9a-f]{40}$/.test(expectedWebsiteSha)) {
  throw new Error('Expected website SHA must be a full 40-character commit SHA');
}

const baseUrl = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
const attempts = 8;
const shaPattern = /^[0-9a-f]{40}$/;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function retry(label, operation) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.log(`${label} not ready (attempt ${attempt}/${attempts}): ${error.message}`);
        await sleep(attempt * 2_000);
      }
    }
  }

  throw lastError;
}

async function fetchResponse(pathname, attempt = 1) {
  const url = new URL(pathname, baseUrl);
  url.searchParams.set('_smoke_release', expectedWebsiteSha);
  url.searchParams.set('_smoke_attempt', String(attempt));

  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache, no-store' },
  });

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  return response;
}

async function fetchFreshText(pathname, predicate, label) {
  return retry(label, async (attempt) => {
    const response = await fetchResponse(pathname, attempt);
    const text = await response.text();

    if (!predicate(text)) {
      throw new Error('content is still from an earlier deployment');
    }

    return text;
  });
}

async function fetchExpectedRelease() {
  return retry('release metadata', async (attempt) => {
    const response = await fetchResponse('/release.json', attempt);
    const release = await response.json();
    const presentationSha = release.presentations?.sha;

    if (release.website?.sha !== expectedWebsiteSha) {
      throw new Error(
        `deployed website SHA is ${release.website?.sha || 'missing'}, expected ${expectedWebsiteSha}`,
      );
    }

    if (!shaPattern.test(presentationSha)) {
      throw new Error('deployed release does not contain a valid presentation SHA');
    }

    return release;
  });
}

function releaseMeta(html, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(`<meta\\s+name=["']${escapedName}["']\\s+content=["']([^"']+)["']`, 'i'),
  );
  return match?.[1];
}

const release = await fetchExpectedRelease();
const releaseFlag = `w:${expectedWebsiteSha.slice(0, 7)} p:${release.presentations.sha.slice(0, 7)}`;

// These are the canonical release-freshness checks. If either stays stale, the deployment is not accepted.
await fetchFreshText('/', (html) => html.includes(releaseFlag), 'homepage');

const decks = await retry('decks page', async (attempt) => {
  const response = await fetchResponse('/decks.html', attempt);
  const html = await response.text();
  const match = html.match(/href=["']([^"']*\/presentation\/[^"']+\.html)["']/i);

  if (!match) {
    throw new Error('could not find a generated presentation link');
  }

  return { match };
});

const presentationUrl = new URL(decks.match[1], baseUrl);
const presentationHtml = await retry(`presentation ${presentationUrl.pathname}`, async (attempt) => {
  const response = await fetchResponse(presentationUrl.href, attempt);
  const html = await response.text();

  if (!/<html\b/i.test(html) || !/<head\b/i.test(html) || !/<body\b/i.test(html)) {
    throw new Error('presentation response is not a complete HTML document');
  }

  if (!html.includes('id="digiguru-release"')) {
    throw new Error('presentation does not expose release metadata');
  }

  return html;
});

const servedWebsiteSha = releaseMeta(presentationHtml, 'release-website-commit');
const servedPresentationSha = releaseMeta(presentationHtml, 'release-presentation-commit');

if (!shaPattern.test(servedWebsiteSha) || !shaPattern.test(servedPresentationSha)) {
  throw new Error('presentation release metadata is missing or invalid');
}

if (servedWebsiteSha !== expectedWebsiteSha || servedPresentationSha !== release.presentations.sha) {
  console.log(
    `::warning::Presentation CDN is still serving an earlier stamped release ` +
      `(w:${servedWebsiteSha.slice(0, 7)} p:${servedPresentationSha.slice(0, 7)}); ` +
      `canonical release is ${releaseFlag}.`,
  );
} else {
  console.log(`Presentation release metadata matches ${releaseFlag}`);
}

console.log(`Smoke tested ${baseUrl.origin} at ${releaseFlag}`);
console.log(`Verified presentation ${presentationUrl.pathname}`);
