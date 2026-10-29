// בדיקת קצה לקצה מול vite preview. כל קריאה חיצונית מוחלפת במוק.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = 'http://localhost:4173';
const SHOTS = process.env.SHOTS || 'test-results';
mkdirSync(SHOTS, { recursive: true });
const { ROUTES, THREADS } = await import('../src/data/routes.js');
const png = readFileSync('public/icon-512.png');
const menu = readFileSync('tests/ai-menu.fixture.js');

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) fails++; };

const server = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--strictPort'], { stdio: 'pipe' });
await new Promise((res) => server.stdout.on('data', (d) => String(d).includes('4173') && res()));

const browser = await chromium.launch();
async function mockAll(ctx) {
  await ctx.route(/wikipedia\.org/, (r) => {
    const t = decodeURIComponent(new URL(r.request().url()).searchParams.get('titles') || '');
    r.fulfill({ contentType: 'application/json', body: JSON.stringify({ query: { pages: { 1: { title: t, thumbnail: { source: 'https://img.test/a.png' } } } } }) });
  });
  await ctx.route(/img\.test|openstreetmap|arcgisonline|opentopomap/, (r) => r.fulfill({ contentType: 'image/png', body: png }));
  await ctx.route(/appofapp-gh\.vercel\.app\/ai-menu\.js/, (r) => r.fulfill({ contentType: 'text/javascript', body: menu }));
  await ctx.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
}

const errors = [];
const watch = (page) => {
  page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_FAILED/.test(m.text())) errors.push(`${page.url()} ${m.text()}`); });
};

// מחשב
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: 'he-IL' });
await mockAll(ctx);
const page = await ctx.newPage();
watch(page);
await page.goto(ROOT);
await page.waitForSelector('.leaflet-marker-icon');
ok(await page.locator('ai-menu .logo').isVisible().catch(() => false), 'A&I logo button in the top bar');
ok(!(await page.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'no loose development buttons in the bar');
const total = ROUTES.reduce((n, r) => n + r.stations.length, 0);
ok((await page.locator('.atlas .leaflet-marker-icon').count()) === total, `home map shows all ${total} stations`);
const segs = await page.locator('.atlas path.trail').count();
ok(segs === total - ROUTES.length, `home map draws every trail segment (${segs}/${total - ROUTES.length})`);
ok(await page.locator('.atlas .legend').isVisible(), 'home map has a legend');
ok((await page.locator('.card').count()) === ROUTES.length, 'a card for every route');
await page.waitForTimeout(600);
ok((await page.locator('.card img').count()) > 0, 'cards show real photos');
await page.screenshot({ path: `${SHOTS}/home-desktop.png`, fullPage: false });

for (const r of ROUTES) {
  await page.locator('.route-index button', { hasText: r.title }).click();
  await page.waitForTimeout(150);
  ok((await page.locator('.focus h2').textContent()) === r.title, `focus panel: ${r.id}`);
  await page.locator('.focus .btn-quiet').click();
}
// ציר הזמן מזיז את המיקוד
await page.locator('.atlas .tl-range').fill('90');
await page.waitForTimeout(200);
ok((await page.locator('.focus h2').textContent()) === 'אליהו, אחאב וכרם נבות', 'timeline scrub focuses the matching route');
await page.locator('.atlas .tl-range').fill('3');
await page.waitForTimeout(200);
ok((await page.locator('.focus h2').textContent()) === 'סדום ועמורה', 'timeline scrub to the start focuses Sodom');
await page.locator('.seg button', { hasText: 'תבליט' }).first().click();
ok(await page.locator('.atlas img.leaflet-tile[src*="opentopomap"]').first().count() > 0, 'relief tiles switch');
await page.locator('.seg button', { hasText: 'לוויין' }).first().click();
ok(await page.locator('.atlas img.leaflet-tile[src*="World_Imagery"]').first().count() > 0, 'satellite tiles switch');
await page.locator('.seg button', { hasText: 'מפה' }).first().click();
ok(await page.locator('.atlas img.leaflet-tile[src*="openstreetmap"]').first().count() > 0, 'grey OSM tiles are the default map');
await page.locator('.focus .btn').click();
await page.waitForURL(/\/route\/sodom/);
ok(true, 'open route from focus panel');

for (const r of ROUTES) {
  await page.goto(`${ROOT}/route/${r.id}`);
  await page.waitForSelector('.station');
  ok((await page.locator('.station').count()) === r.stations.length, `${r.id}: ${r.stations.length} stations`);
  ok((await page.locator('.r-map .leaflet-marker-icon').count()) === r.stations.length, `${r.id}: markers on the map`);
  for (const s of r.stations) {
    await page.locator('.step', { hasText: s.name }).first().click();
    await page.waitForTimeout(900);
    ok(new URL(page.url()).searchParams.get('s') === s.id, `${r.id}: step ${s.id} scrolls and updates the URL`);
  }
  const refs = await page.locator('.station .ref').evaluateAll((as) => as.map((a) => a.href));
  ok(refs.length > 0 && refs.every((h) => /sefaria\.org\.il\/[A-Za-z_]+\.\d+\.\d+/.test(h)), `${r.id}: verse links to Sefaria`);
  ok((await page.locator('.layers').count()) === r.stations.length, `${r.id}: three layers per station`);
  if (r.id === 'elah') await page.screenshot({ path: `${SHOTS}/route-desktop.png` });
}

// "הייתי כאן" נשמר
await page.goto(`${ROOT}/route/elah`);
await page.locator('.check').first().click();
const stored = await page.evaluate(() => localStorage.getItem('maslulei-visited'));
ok(stored && stored.includes('azeka'), 'visited mark saved locally');
await page.reload();
ok(await page.locator('.check.on').count() === 1, 'visited mark survives reload');
// קישור עם תחנה פותח אותה
await page.goto(`${ROOT}/route/saul?s=gilboa`);
await page.waitForTimeout(1500);
ok(await page.locator('.step.on', { hasText: 'הר הגלבוע' }).count() === 1, 'deep link opens the station');

// מארג
await page.goto(`${ROOT}/threads`);
for (const [t, th] of Object.entries(THREADS)) {
  await page.locator('.th-thread', { hasText: th.name }).click();
  const n = ROUTES.filter((r) => r.threads.includes(t)).length;
  ok((await page.locator('.th-detail li').count()) === n, `thread ${t}: ${n} routes`);
  await page.locator('.th-thread', { hasText: th.name }).click();
}
await page.screenshot({ path: `${SHOTS}/threads-desktop.png` });
// ציר זמן
await page.goto(`${ROOT}/timeline`);
ok((await page.locator('.story-row').count()) === ROUTES.length, 'timeline page lists every story');
await page.locator('.tl-dot').first().click();
await page.locator('.tl-dot').first().click();
await page.waitForURL(/\/route\//);
ok(true, 'second click on a timeline dot opens the route');
// ניווט עליון
await page.goto(ROOT);
for (const [label, path] of [['ציר זמן', '/timeline'], ['מארג קשרים', '/threads'], ['מסלולים', '/']]) {
  await page.locator('.nav a', { hasText: label }).click();
  await page.waitForTimeout(300);
  ok(new URL(page.url()).pathname === path, `nav: ${label}`);
}
await page.goto(`${ROOT}/route/ark`);
await page.locator('.brand').click();
await page.waitForTimeout(300);
ok(new URL(page.url()).pathname === '/', 'app name links home');

// התקנה
const cdp = await ctx.newCDPSession(page);
await page.goto(ROOT);
await page.waitForTimeout(1500);
const inst = await cdp.send('Page.getInstallabilityErrors');
ok(inst.installabilityErrors.length === 0, `installable (${JSON.stringify(inst.installabilityErrors)})`);

// נייד
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mockAll(m);
await m.route(/opentopomap/, (r) => r.abort());
const mp = await m.newPage();
watch(mp);
for (const path of ['/', '/timeline', '/threads', ...ROUTES.map((r) => `/route/${r.id}`)]) {
  await mp.goto(ROOT + path);
  await mp.waitForTimeout(700);
  const w = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok(w[0] <= w[1], `mobile ${path}: no horizontal scroll (${w[0]}/${w[1]})`);
  ok(await mp.locator('ai-menu .logo').isVisible().catch(() => false), `mobile ${path}: logo visible`);
}
await mp.goto(ROOT);
await mp.waitForTimeout(800);
await mp.screenshot({ path: `${SHOTS}/home-mobile.png` });
await mp.goto(`${ROOT}/route/deborah`);
await mp.waitForTimeout(800);
await mp.evaluate(() => window.scrollTo(0, 1400));
await mp.waitForTimeout(1200);
await mp.screenshot({ path: `${SHOTS}/route-mobile.png` });

await mp.goto(`${ROOT}/route/saul`);
await mp.waitForTimeout(2500);
ok(await mp.locator('img.leaflet-tile[src*="World_Topo_Map"]').count() > 0, 'relief falls back to Esri when OpenTopoMap fails');
const realErrors = errors.filter((e) => !/opentopomap|ERR_FAILED|net::/.test(e));
ok(realErrors.length === 0, `no console errors${realErrors.length ? ': ' + realErrors.slice(0, 5).join(' | ') : ''}`);
await browser.close();
server.kill();
console.log(fails ? `\n${fails} FAILED` : '\nALL GREEN');
process.exit(fails ? 1 : 0);
