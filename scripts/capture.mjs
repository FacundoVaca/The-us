import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const url = process.env.CAPTURE_URL;
const output = process.env.CAPTURE_DIR;
if (!url || !output) {
  console.error('Set CAPTURE_URL and CAPTURE_DIR.');
  process.exit(1);
}
try {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol');
} catch {
  console.error(`CAPTURE_URL is not a valid HTTP(S) URL: ${url}`);
  process.exit(1);
}

const runtimeRoots = [
  process.env.OMGITHUB_PLAYWRIGHT_ROOT,
  process.env.PLAYWRIGHT_ROOT,
  join(process.env.HOME || '', '.local/share/omgithub-playwright'),
].filter(Boolean);

let chromium = null;
let config = null;
let runtimeRoot = null;
for (const root of runtimeRoots) {
  try {
    const require = createRequire(join(root, 'package.json'));
    chromium = require('playwright').chromium;
    runtimeRoot = root;
    break;
  } catch { /* try the next location */ }
}
if (!chromium) {
  try {
    const require = createRequire(import.meta.url);
    chromium = require('playwright').chromium;
  } catch { /* handled below */ }
}
if (!chromium) {
  console.error('Playwright is not available in this worker.');
  process.exit(75);
}

if (runtimeRoot) {
  try {
    config = JSON.parse(readFileSync(join(runtimeRoot, 'linux.json'), 'utf8'));
    const displayFile = join(runtimeRoot, 'display');
    if (process.platform === 'linux' && !process.env.DISPLAY && existsSync(displayFile)) {
      process.env.DISPLAY = ':' + readFileSync(displayFile, 'utf8').trim();
    }
  } catch { config = null; }
}

const jobs = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];

const started = performance.now();
async function step(name, fn) {
  const t = performance.now();
  try {
    return await fn();
  } finally {
    console.log(`${name}: ${((performance.now() - t) / 1000).toFixed(3)}s`);
  }
}

function transient(error) {
  error.transient = true;
  return error;
}

function isInfrastructure(error) {
  if (!error) return false;
  if (error.transient) return true;
  const message = String(error.message || error);
  return /net::ERR_|ERR_(CONNECTION|NETWORK|TIMED_OUT|TUNNEL|CERT)|ECONN(REFUSED|RESET)|ENOTFOUND|EAI_AGAIN|Target (page, context or browser )?has been closed|browser has been closed|Browser closed|Protocol error/i.test(message);
}

mkdirSync(resolve(output), { recursive: true });

let browser = null;
let failure = null;

try {
  const launchOptions = config?.browser?.launchOptions || {
    channel: 'chromium',
    headless: true,
    args: ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu'],
  };

  browser = await step('launch', async () => {
    try {
      return await chromium.launch({ ...launchOptions, timeout: 30000 });
    } catch (error) {
      console.error(`headed launch failed (${error.message}); retrying headless`);
      try {
        return await chromium.launch({ channel: 'chromium', headless: true, timeout: 30000 });
      } catch (fallbackError) {
        throw transient(fallbackError);
      }
    }
  });

  for (const job of jobs) {
    const page = await step(`open-${job.name}`, async () => {
      try {
        return await browser.newPage({
          viewport: { width: job.width, height: job.height },
          screen: { width: job.width, height: job.height },
          isMobile: job.mobile,
          hasTouch: job.mobile,
          deviceScaleFactor: 1,
        });
      } catch (error) { throw transient(error); }
    });
    page.setDefaultTimeout(30000);
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.error(`[${job.name}] pageerror: ${error.message}`);
    });

    try {
      const response = await step(`goto-${job.name}`, () => page.goto(url, { waitUntil: 'load', timeout: 45000 })
        .catch(error => { throw transient(error); }));
      if (!response || !response.ok()) {
        const status = response?.status();
        const error = new Error(`HTTP ${status ?? 'no response'} loading ${url}`);
        if (!response || [408, 429, 500, 502, 503, 504].includes(status)) transient(error);
        throw error;
      }

      await step(`ready-${job.name}`, async () => {
        await page.locator('body').waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.fonts?.status === 'loaded', null, { timeout: 15000 }).catch(() => {});
        await page.locator('#game[data-ready="true"]').waitFor({ state: 'visible', timeout: 30000 });
      });

      const startedGame = await step(`start-${job.name}`, async () => {
        const button = page.locator('#start-btn');
        if (await button.count() === 0) return false;
        if (!(await button.first().isVisible().catch(() => false))) return false;
        await button.first().click({ timeout: 8000 });
        await page.waitForFunction(
          () => document.body.dataset.playing === 'true' || window.__gameState === 'playing',
          null,
          { timeout: 15000 },
        );
        return true;
      });
      console.log(`${job.name}: game ${startedGame ? 'started' : 'was already running'}`);

      await page.waitForTimeout(1300);

      const pixels = await page.evaluate(() => {
        const canvas = document.getElementById('game');
        if (!canvas) return { ok: false, reason: 'missing canvas' };
        const data = canvas.toDataURL('image/png');
        return { ok: data.length > 12000, length: data.length, width: canvas.width, height: canvas.height };
      });
      console.log(`${job.name}: canvas ${pixels.width}x${pixels.height}, encoded ${pixels.length} bytes`);
      if (!pixels.ok) throw new Error(`Canvas did not render enough content (${pixels.reason || pixels.length})`);

      if (pageErrors.length) {
        throw new Error(`Page raised ${pageErrors.length} error(s): ${pageErrors[0]}`);
      }

      const file = join(resolve(output), `final-${job.name}.png`);
      await step(`screenshot-${job.name}`, () => page.screenshot({ path: file, timeout: 30000 })
        .catch(error => {
          if (/Timeout|closed|Target/i.test(String(error.message))) transient(error);
          throw error;
        }));
      console.log(`captured ${file}`);
    } finally {
      await page.close().catch(() => {});
    }
  }
} catch (error) {
  failure = error;
  console.error(error);
} finally {
  if (browser) {
    await step('close-browser', () => browser.close().catch(error => {
      console.error(error);
      if (!failure) failure = transient(error);
    }));
  }
}

if (failure) {
  process.exitCode = isInfrastructure(failure) ? 75 : 1;
} else {
  console.log(`capture complete: ${((performance.now() - started) / 1000).toFixed(3)}s`);
}
