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

const originals = '.showcase-item:not([data-copy])';
async function positions(page) { return page.locator('.project-track').evaluateAll(tracks => tracks.map(track => track.scrollLeft)); }

test('two rows keep uniform placeholders and readable content at phone through desktop widths', async () => {
  const { page, errors, close } = await pageAt();
  try {
    for (const [width, height] of [[320,760],[390,844],[768,1024],[844,390],[1280,900],[1920,1080]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(80);
      await noClipping(page);
      assert.equal(await page.locator('.project-row').count(), 2);
      assert.equal(await page.locator(originals).count(), 4);
      assert.equal(await page.locator('.showcase-card').evaluateAll(cards => new Set(cards.map(card => getComputedStyle(card).backgroundColor)).size), 1);
    }
    assert.deepEqual(errors, []);
  } finally { await close(); }
});

test('opposing drift pauses for interaction, restarts after five seconds idle, and respects explicit pause', async () => {
  const { page, errors, close } = await pageAt(1280, { reducedMotion: 'no-preference' });
  try {
    await page.clock.install();
    await page.locator('#navbar a[href="#work"]').click();
    await page.clock.runFor(1000);
    const before = await positions(page);
    await page.clock.runFor(1000);
    const drifting = await positions(page);
    assert.ok(drifting[0] > before[0], 'top moves left');
    assert.ok(drifting[1] < before[1], 'bottom moves right');
    await page.getByRole('button', { name: 'Next project in top row' }).click();
    await page.clock.runFor(1000);
    const manual = await positions(page);
    await page.clock.runFor(3000);
    assert.deepEqual(await positions(page), manual, 'both rows remain still within the idle window');
    await page.clock.runFor(2500);
    const resumed = await positions(page);
    assert.notDeepEqual(resumed, manual, 'movement restarts without a resume click');
    await page.locator('#motionToggle').click();
    const stopped = await positions(page);
    await page.clock.runFor(7000);
    assert.deepEqual(await positions(page), stopped, 'explicit pause survives timeout');
    assert.equal(await page.locator('#motionToggle').textContent(), 'Motion off');
    assert.deepEqual(errors, []);
  } finally { await close(); }
});

test('keyboard navigation stays paused and loop copies add no focus stops', async () => {
  const { page, close } = await pageAt(390, { reducedMotion: 'no-preference' });
  try {
    await page.clock.install();
    await page.locator('#projectTrack').focus();
    await page.keyboard.press('End');
    await page.clock.runFor(1000);
    const position = await positions(page);
    await page.clock.runFor(7000);
    assert.deepEqual(await positions(page), position);
    assert.equal(await page.locator('[data-copy] a, [data-copy] button').evaluateAll(actions => actions.every(action => action.tabIndex === -1)), true);
    await page.keyboard.press('Home');
    await page.clock.runFor(1000);
    assert.notEqual((await positions(page))[0], position[0]);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.closest('.showcase-item').hasAttribute('data-copy')), false);
  } finally { await close(); }
});

test('project details and mobile navigation preserve keyboard focus and Escape behavior', async () => {
  const { page, close } = await pageAt();
  try {
    const trigger = page.getByRole('button', { name: 'Explore project: CES AI Postcard Generator' });
    await trigger.click();
    assert.equal(await page.getByRole('dialog', { name: 'CES AI Postcard Generator' }).isVisible(), true);
    assert.equal(await page.locator('.project-story-summary').textContent(), projects[0].summary);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.getElementById('projectDialog').contains(document.activeElement)), true);
    }
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
    await page.locator('#menuToggle').click();
    assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
  } finally { await close(); }
});

test('zero, one, two, odd and eight projects preserve data ordering and long titles', async () => {
  for (const count of [0,1,2,3,8]) {
    const content = Array.from({length: count}, (_, i) => ({ ...projects[i % projects.length], id: `fixture-${i}`, title: `${i + 1}. A long project title that wraps naturally across several lines on a small mobile device`, tags: undefined, liveUrl: undefined, details: undefined }));
    const { page, close } = await pageAt(320, {}, content);
    try {
      if (!count) { assert.equal(await page.locator('#work').isVisible(), false); continue; }
      assert.equal(await page.locator(originals).count(), count);
      assert.deepEqual(await page.locator(`${originals} h3`).allTextContents(), content.map(project => project.title));
      await noClipping(page);
      assert.equal(await page.locator('.project-action').count(), 0);
      if (count === 1) assert.equal(await page.locator('#projectTrack').evaluate(track => track.scrollWidth <= track.clientWidth + 1), true);
    } finally { await close(); }
  }
});

test('broken images and failed content requests retain neutral fallback and retry', async () => {
  const { page, close } = await pageAt(390, {}, [{...projects[0], image:'./missing.webp'}]);
  try {
    await page.waitForFunction(() => document.querySelector('.showcase-image').src.endsWith('preview-pending.svg'));
    await page.unroute('**/data/projects.json');
    let requests = 0;
    await page.route('**/data/projects.json', route => ++requests === 1 ? route.fulfill({status:500}) : route.fulfill({json:projects}));
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('#projectRetry').isVisible(), true);
    await page.locator('#projectRetry').click();
    await page.waitForSelector(originals);
    assert.equal(await page.locator(originals).count(), 4);
  } finally { await close(); }
});

test('reduced motion disables autoplay, hides visual copies and supports enlarged text', async () => {
  const { page, close } = await pageAt(390);
  try {
    assert.equal(await page.locator('#motionToggle').isDisabled(), true);
    assert.equal(await page.locator('[data-copy]').first().isVisible(), false);
    await page.locator('#navbar a[href="#work"]').click();
    const before = await positions(page);
    await page.waitForTimeout(700);
    assert.deepEqual(await positions(page), before);
    await page.getByRole('button', {name:'Next project in top row'}).click();
    assert.ok((await positions(page))[0] > before[0]);
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    await page.waitForTimeout(100);
    await noClipping(page);
  } finally { await close(); }
});

test('native touch browsing still allows vertical page scrolling', async () => {
  const { page, close } = await pageAt(390, {isMobile:true, hasTouch:true});
  try {
    const cdp = await page.context().newCDPSession(page);
    async function gesture(x,y,dx,dy) {
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=8;i++) { await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]}); await page.waitForTimeout(25); }
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.scrollTo({top:document.querySelector('#projectTrack').getBoundingClientRect().top+scrollY-160,behavior:'instant'}));
    await gesture(290,230,-180,0);
    assert.ok((await positions(page))[0]>40);
    const y=await page.evaluate(()=>scrollY);
    await gesture(200,280,0,-150);
    assert.ok(await page.evaluate(()=>scrollY)>y+40);
  } finally { await close(); }
});
