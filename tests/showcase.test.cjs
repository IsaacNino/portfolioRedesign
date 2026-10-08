const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const projects = require('../data/projects.json');
const assetCache = new Map();
let browser, server, baseURL;

before(async () => {
  server = createServer(async (req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) return res.writeHead(403).end();
    const target = file === root ? path.join(root, 'index.html') : file;
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.pdf': 'application/pdf' };
    try { const body = await readFile(target); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' }).end(body); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); await new Promise(resolve => server?.close(resolve)); });

async function pageAt(width = 390, options = {}, content) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Proxy environments can expose a CA trusted by curl but not Chromium.
  // Keep TLS verification enabled and supply the same verified CDN responses.
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    await page.route('https://**/*', async route => {
      const url = route.request().url();
      if (!assetCache.has(url)) assetCache.set(url, execFile('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', url], { encoding: 'buffer', maxBuffer: 10000000 }));
      const { stdout } = await assetCache.get(url);
      await route.fulfill({ status: 200, body: stdout, contentType: url.includes('fonts.googleapis') ? 'text/css' : url.includes('fonts.gstatic') ? 'font/woff2' : 'application/javascript' });
    });
  }
  if (content) await page.route('**/data/projects.json', route => route.fulfill({ json: content }));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  return { page, errors, close: () => context.close() };
}
async function statusIs(page, text) { await page.waitForFunction(value => document.getElementById('projectStatus').textContent === value, text); }
async function noClipping(page) {
  const problems = await page.evaluate(() => {
    const failures = [];
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) failures.push('page overflow');
    for (const card of document.querySelectorAll('.showcase-card')) {
      const frame = card.getBoundingClientRect();
      for (const node of card.querySelectorAll('h3, .showcase-summary, .project-action, .studio-eyebrow')) {
        const rect = node.getBoundingClientRect();
        if (rect.top < frame.top || rect.bottom > frame.bottom + 1 || node.scrollWidth > node.clientWidth + 1) failures.push(node.textContent);
      }
    }
    return failures;
  });
  assert.deepEqual(problems, []);
}

test('phone, tablet, desktop, and landscape layouts keep content readable with a next-card preview', async () => {
  const { page, errors, close } = await pageAt();
  try {
    for (const [width, height] of [[320, 760], [360, 800], [390, 844], [430, 932], [768, 1024], [820, 1180], [844, 390], [1024, 768], [1440, 1000], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(80);
      await noClipping(page);
      assert.equal(await page.locator('.showcase-card').count(), 4);
      assert.ok(await page.evaluate(() => {
        const track = document.getElementById('projectTrack').getBoundingClientRect();
        const next = document.querySelectorAll('.showcase-item')[1].getBoundingClientRect();
        return next.left < track.right && next.right > track.right;
      }), `next project should peek at ${width}px`);
    }
    assert.deepEqual(errors, []);
  } finally { await close(); }
});

test('previous/next, arrow keys, Home/End and Tab expose projects without autoplay', async () => {
  const { page, close } = await pageAt(1440, { reducedMotion: 'no-preference' });
  try {
    assert.equal(await page.locator('#projectPrevious').isDisabled(), true);
    await page.locator('#projectNext').click(); await statusIs(page, 'Project 2 of 4');
    await page.locator('#projectPrevious').click(); await statusIs(page, 'Project 1 of 4');
    await page.locator('#projectTrack').focus(); await page.keyboard.press('End'); await statusIs(page, 'Project 4 of 4');
    assert.equal(await page.locator('#projectNext').isDisabled(), true);
    await page.keyboard.press('Home'); await statusIs(page, 'Project 1 of 4');
    await page.keyboard.press('ArrowRight'); await statusIs(page, 'Project 2 of 4');
    await page.keyboard.press('Home'); await statusIs(page, 'Project 1 of 4');
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    await statusIs(page, 'Project 2 of 4');
    const position = await page.locator('#projectTrack').evaluate(track => track.scrollLeft);
    await page.waitForTimeout(700);
    assert.equal(await page.locator('#projectTrack').evaluate(track => track.scrollLeft), position);
  } finally { await close(); }
});

test('project dialog contains focus, closes on Escape and restores the trigger', async () => {
  const { page, close } = await pageAt();
  try {
    const trigger = page.getByRole('button', { name: 'Explore project: CES AI Postcard Generator' });
    await trigger.click();
    assert.equal(await page.getByRole('dialog', { name: 'CES AI Postcard Generator' }).isVisible(), true);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.getElementById('projectDialog').contains(document.activeElement)), true);
    }
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('projectDialog').open && !document.documentElement.classList.contains('dialog-open'));
    assert.equal(await page.locator('#projectDialog').isVisible(), false);
    assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dialog-open')), false);
  } finally { await close(); }
});

test('mobile navigation announces state, closes on Escape, follows anchors and closes on desktop resize', async () => {
  const { page, close } = await pageAt();
  try {
    const toggle = page.locator('#menuToggle');
    await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('menuToggle').getAttribute('aria-expanded') === 'false');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await toggle.evaluate(node => node === document.activeElement), true);
    await toggle.click(); await page.locator('#mobileMenu a[href="#work"]').click();
    assert.ok(page.url().endsWith('#work')); assert.equal(await page.locator('#mobileMenu').isVisible(), false);
    await toggle.click(); await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForFunction(() => !document.getElementById('mobileMenu').open);
  } finally { await close(); }
});

test('zero, one, two and eight projects, long titles, missing optional fields and data ordering', async () => {
  for (const count of [0, 1, 2, 8]) {
    const content = Array.from({ length: count }, (_, i) => ({ ...projects[i % projects.length], id: `fixture-${i}`, title: `${i + 1}. A very long project title that wraps naturally across several lines on a small mobile device`, summary: 'A useful explanation of what the project does and why the work matters. '.repeat(3), tags: undefined, liveUrl: undefined, details: undefined }));
    const { page, close } = await pageAt(320, {}, content);
    try {
      if (!count) { assert.equal(await page.locator('#work').isVisible(), false); continue; }
      assert.equal(await page.locator('.showcase-card').count(), count);
      assert.deepEqual(await page.locator('.showcase-body h3').allTextContents(), content.map(p => p.title));
      assert.equal(await page.locator('.project-action').count(), 0);
      await noClipping(page);
      assert.equal(await page.locator('#projectControls').isVisible(), count > 1);
      if (count === 1) assert.equal(await page.locator('#projectTrack').evaluate(track => track.scrollWidth <= track.clientWidth + 1), true);
    } finally { await close(); }
  }
});

test('optional links, broken images and recoverable data-load failures', async () => {
  const content = [{ ...projects[0], image: './missing-image.webp', caseStudyUrl: './case-study.html' }];
  const { page, close } = await pageAt(390, {}, content);
  try {
    await page.waitForFunction(() => document.querySelector('.showcase-image').src.endsWith('preview-pending.svg'));
    assert.equal(await page.locator('.project-action').count(), 2);
    assert.equal(await page.getByRole('link', { name: 'Explore project: CES AI Postcard Generator' }).getAttribute('href'), baseURL + '/case-study.html');
    await page.unroute('**/data/projects.json');
    let requests = 0;
    await page.route('**/data/projects.json', route => ++requests === 1 ? route.fulfill({ status: 500 }) : route.fulfill({ json: projects }));
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#projectRetry').isVisible(), true);
    await page.locator('#projectRetry').click(); await page.waitForSelector('.showcase-card');
    assert.equal(await page.locator('.showcase-card').count(), 4);
  } finally { await close(); }
});

test('reduced motion uses immediate carousel movement and enlarged text still reflows', async () => {
  const { page, close } = await pageAt(390);
  try {
    await page.evaluate(() => { window.scrollBehaviors = []; const track = document.getElementById('projectTrack'); const scroll = track.scrollTo.bind(track); track.scrollTo = args => { window.scrollBehaviors.push(args.behavior); scroll(args); }; });
    await page.locator('#projectNext').click(); await statusIs(page, 'Project 2 of 4');
    assert.equal(await page.evaluate(() => window.scrollBehaviors.includes('smooth')), false);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    await page.waitForTimeout(100); await noClipping(page);
  } finally { await close(); }
});

test('native touch swipes browse horizontally and still allow vertical page scrolling', async () => {
  const { page, close } = await pageAt(390, { isMobile: true, hasTouch: true });
  try {
    const cdp = await page.context().newCDPSession(page);
    async function gesture(x, y, dx, dy) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 8, y: y + dy * i / 8 }] }); await page.waitForTimeout(25); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('.showcase-media').getBoundingClientRect().top + scrollY - 160, behavior: 'instant' }));
    await gesture(290, 230, -220, 0);
    assert.ok(await page.locator('#projectTrack').evaluate(track => track.scrollLeft > 50));
    const beforeY = await page.evaluate(() => scrollY);
    await gesture(200, 280, 0, -150);
    assert.ok(await page.evaluate(() => scrollY) > beforeY + 50);
  } finally { await close(); }
});
