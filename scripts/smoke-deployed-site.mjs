const [siteUrl, expectedWebsiteSha] = process.argv.slice(2);

if (!siteUrl || !expectedWebsiteSha) {
  throw new Error('Usage: node scripts/smoke-deployed-site.mjs <site-url> <expected-website-sha>');
}

if (!/^[0-9a-f]{40}$/.test(expectedWebsiteSha)) {
  throw new Error('Expected website SHA must be a full 40-character commit SHA');
}

const baseUrl = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
const attempts = 8;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchOk(pathname) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const url = new URL(pathname, baseUrl);
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'cache-control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(attempt * 2_000);
      }
    }
  }

  throw lastError;
}

async function fetchExpectedRelease() {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchOk('/release.json');
      const release = await response.json();
      const presentationSha = release.presentations?.sha;

      if (release.website?.sha !== expectedWebsiteSha) {
        throw new Error(
          `Deployed website SHA is ${release.website?.sha || 'missing'}, expected ${expectedWebsiteSha}`,
        );
      }

      if (!/^[0-9a-f]{40}$/.test(presentationSha)) {
        throw new Error('Deployed release does not contain a valid presentation SHA');
      }

      return release;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(attempt * 2_000);
      }
    }
  }

  throw lastError;
}

const homeResponse = await fetchOk('/');
const home = await homeResponse.text();
await fetchOk('/decks.html');

const release = await fetchExpectedRelease();
const releaseFlag = `w:${expectedWebsiteSha.slice(0, 7)} p:${release.presentations.sha.slice(0, 7)}`;

if (!home.includes(releaseFlag)) {
  throw new Error(`Homepage does not expose expected release flag ${releaseFlag}`);
}

const decksResponse = await fetchOk('/decks.html');
const decks = await decksResponse.text();
const presentationMatch = decks.match(/href=["']([^"']*\/presentation\/[^"']+\.html)["']/i);

if (!presentationMatch) {
  throw new Error('Could not find a generated presentation link on /decks.html');
}

const presentationUrl = new URL(presentationMatch[1], baseUrl);
const presentationResponse = await fetchOk(presentationUrl.href);
const presentationHtml = await presentationResponse.text();

if (!presentationHtml.includes(expectedWebsiteSha) || !presentationHtml.includes(release.presentations.sha)) {
  throw new Error('Generated presentation does not contain the expected release metadata');
}

console.log(`Smoke tested ${baseUrl.origin} at ${releaseFlag}`);
console.log(`Verified presentation ${presentationUrl.pathname}`);
