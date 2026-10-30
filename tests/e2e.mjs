// בדיקת קצה לקצה מול vite preview. כל קריאה חיצונית מוחלפת במוק.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = 'http://localhost:4173';
const SHOTS = process.env.SHOTS || 'test-results';
mkdirSync(SHOTS, { recursive: true });
const { ROUTES, THREADS } = await import('../src/data/routes.js');
const { ERAS } = await import('../src/data/eras.js');
const { ART } = await import('../src/data/art.js');
const { STORIES } = await import('../src/data/stories.js');
const { PEOPLE, LINKS, RELATIONS } = await import('../src/data/people.js');
const { THREAD_STORY } = await import('../src/data/threads.js');
const { TERRITORIES } = await import('../src/data/territories.js');
const { TELLS } = await import('../src/data/tells.js');
const { JOURNEYS } = await import('../src/data/journeys.js');
const TRAILS = JSON.parse(readFileSync('src/data/trails.json', 'utf8'));
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
// מחכים לכותרת המצופה (עד שתי שניות): אחרי רצף לחיצות המפה עדיין באנימציה, והעדכון מגיע מאוחר מ־200 מ"ש
const focusIs = (t) => page.waitForFunction((x) => document.querySelector('.focus h2')?.textContent === x, t, { timeout: 2000 }).then(() => true, () => false);
await page.locator('.atlas .tl-range').fill('90');
ok(await focusIs('אליהו, אחאב וכרם נבות'), 'timeline scrub focuses the matching route');
await page.locator('.atlas .tl-range').fill('3');
ok(await focusIs('סדום ועמורה'), 'timeline scrub to the start focuses Sodom');
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
  // Leaflet חותך קטעים שמחוץ למסך, ולכן בודקים את הנתונים ואת מספר הקווים שצוירו
  const segs = await page.locator('.r-map path.trail').count();
  const verts = TRAILS[r.id].legs.map((l) => l.coords.length);
  ok(segs === r.stations.length - 1 && verts.every((n) => n >= 3), `${r.id}: trail follows real paths (${verts.join(',')} points per leg)`);
  ok(await page.locator('.profile-desk .profile svg').count() === 1, `${r.id}: elevation profile`);
  ok((await page.locator('.story-head h2').textContent()) === STORIES[r.id].title, `${r.id}: background story`);
  ok(await page.locator('.era-box h3').count() === 1, `${r.id}: era context box`);
  ok((await page.locator('.work').count()) === ART[r.id].length, `${r.id}: ${ART[r.id].length} works of art`);
  if (r.id === 'elah') await page.screenshot({ path: `${SHOTS}/route-desktop.png` });
}

// אמנות: סינון לפי סוג
await page.goto(`${ROOT}/route/samson`);
await page.locator('.filters .chip', { hasText: 'ציור' }).click();
ok((await page.locator('.work').count()) === ART.samson.filter((w) => w.kind === 'paint').length, 'art filter by kind');
// פרופיל: ריחוף מסמן נקודה על המפה
const svg = page.locator('.profile-desk svg');
await svg.scrollIntoViewIfNeeded();
const bb = await svg.boundingBox();
await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.6);
await page.waitForTimeout(200);
ok(await page.locator('.pf-tip').count() === 1, 'profile hover shows elevation');
ok(await page.locator('.r-map path.leaflet-interactive[fill="#e8c26a"]').count() === 1, 'profile hover marks the point on the map');
// מעבר בין תחנות מפעיל את ההולך על השביל
await page.locator('.step').nth(1).click();
await page.waitForTimeout(400);
ok(await page.locator('.r-map .walker').count() === 1, 'walker moves along the trail');

// גלגלת: זום לפי מיקום העכבר, גם עם Ctrl, בלי להגדיל את הדף
await page.goto(`${ROOT}/route/saul`);
await page.waitForTimeout(1500);
const spread = () => page.locator('.r-map .leaflet-marker-icon').evaluateAll((els) => {
  const r = els.map((e) => e.getBoundingClientRect());
  return Math.hypot(r[0].x - r[r.length - 1].x, r[0].y - r[r.length - 1].y);
});
await page.locator('.station').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
const mapBox = await page.locator('.r-map .map').boundingBox();
// מאזין אחרון על המפה עצמה: Leaflet עוצר את ההפצה, ולכן document לא שומע את האירוע.
await page.evaluate(() => { window.__prevented = null; document.querySelector('.r-map .map').addEventListener('wheel', (e) => { window.__prevented = e.defaultPrevented; }); });
const d0 = await spread();
await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
await page.keyboard.down('Control');
await page.mouse.wheel(0, -300);
await page.keyboard.up('Control');
await page.waitForTimeout(900);
const d1 = await spread();
ok(d1 > d0 * 1.2, `ctrl+wheel zooms the map in (${Math.round(d0)} to ${Math.round(d1)} px)`);
ok(await page.evaluate(() => window.__prevented) === true, 'ctrl+wheel does not zoom the whole page');
await page.mouse.wheel(0, 400);
await page.waitForTimeout(900);
ok((await spread()) < d1 * 0.9, 'plain wheel zooms the map out');

// דמויות במסלול
ok((await page.locator('#people .web-node').count()) === PEOPLE.filter((p) => p.routes.includes('saul')).length, 'route page shows its characters');
await page.locator('#people .web-node', { hasText: 'יונתן' }).click();
await page.waitForTimeout(400);
ok((await page.locator('#people .person h3').textContent()).includes('יונתן'), 'character card opens on the route page');

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

// מארג: כלל, תובנה, יישום ומפה לכל חוט
await page.goto(`${ROOT}/threads`);
for (const [t, th] of Object.entries(THREADS)) {
  await page.locator('.thread-tile').filter({ has: page.getByText(th.name, { exact: true }) }).click();
  await page.waitForTimeout(450);
  ok((await page.locator('.thread-detail h2').textContent()) === th.name, `thread ${t}: detail`);
  ok((await page.locator('.thread-why .tone').count()) === 3, `thread ${t}: rule, insight and action`);
  const n = THREAD_STORY[t].stops.length;
  ok((await page.locator('.thread-stops li').count()) === n && (await page.locator('.thread-map .leaflet-marker-icon').count()) === n, `thread ${t}: ${n} stops on list and map`);
  ok(new URL(page.url()).searchParams.get('t') === t, `thread ${t}: state in URL`);
}
await page.locator('.thread-stops .stop-link').first().click();
await page.waitForURL(/\/route\/.*s=/);
ok(true, 'thread stop opens the station');
await page.goto(`${ROOT}/threads?t=yizrael`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOTS}/threads-desktop.png` });
// דף הדמויות
await page.goto(`${ROOT}/people`);
ok((await page.locator('.web-node').count()) === PEOPLE.length, `people web: ${PEOPLE.length} characters`);
ok((await page.locator('.web-svg path').count()) === LINKS.length, `people web: ${LINKS.length} relations`);
for (const p of PEOPLE) {
  await page.locator('.web-node').filter({ has: page.getByText(p.name, { exact: true }) }).click();
  await page.waitForTimeout(450);
  const h = await page.locator('.person h3').textContent();
  ok(h.includes(p.name) && new URL(page.url()).searchParams.get('p') === p.id, `person ${p.id}: card and URL`);
}
await page.locator('.web-legend .chip', { hasText: RELATIONS.enemy.name }).click();
ok((await page.locator('.web-svg path').count()) === LINKS.filter((l) => l.type !== 'enemy').length, 'relation filter hides a type');
await page.locator('.route-filter .chip', { hasText: 'מלחמת דבורה' }).click();
ok((await page.locator('.web-node').count()) === PEOPLE.filter((p) => p.routes.includes('deborah')).length, 'route filter on people page');
await page.screenshot({ path: `${SHOTS}/people-desktop.png` });

// מסע של דמות
for (const id of Object.keys(JOURNEYS)) {
  await page.goto(`${ROOT}/people?j=${id}`);
  await page.waitForTimeout(1200);
  const n = JOURNEYS[id].stops.length;
  ok((await page.locator('.journey-stops li').count()) === n, `journey ${id}: ${n} stops`);
  ok((await page.locator('.journey-map path.leaflet-interactive').count()) >= n - 1, `journey ${id}: real path legs`);
  await page.locator('.journey-stops button').nth(n - 1).click();
  await page.waitForTimeout(300);
  ok((await page.locator('.journey-card h4').textContent()) === JOURNEYS[id].stops[n - 1].name, `journey ${id}: stop card`);
}
await page.locator('.journey-play').click();
await page.waitForTimeout(1500);
ok(await page.locator('.journey-map .walker').count() === 1, 'journey walker plays');
await page.goto(`${ROOT}/people?p=david`);
await page.locator('.person .chip-strong').click();
await page.waitForTimeout(800);
ok(new URL(page.url()).searchParams.get('j') === 'david', 'character card opens the journey');

// תלים: שכבות, פריסה, חפירה
for (const [id, t] of Object.entries(TELLS)) {
  await page.goto(`${ROOT}/tells?t=${id}`);
  await page.waitForTimeout(500);
  ok((await page.locator('.tell-list li').count()) === t.layers.length && (await page.locator('.tell-layer').count()) === t.layers.length, `tell ${id}: ${t.layers.length} layers`);
  await page.locator('.tell-list button').last().click();
  ok((await page.locator('.tell-card h4').textContent()) === t.layers[0].title, `tell ${id}: bottom layer card`);
}
await page.locator('.tell-controls .chip', { hasText: 'פריסת' }).click();
ok(await page.locator('.tell-controls .chip.on').count() === 1, 'tell exploded view');
await page.locator('.dig input').fill('2');
await page.waitForTimeout(500);
ok(await page.locator('.tell-list li.gone').count() === TELLS.afek.layers.length - 2, 'dig slider peels layers from the top');
await page.screenshot({ path: `${SHOTS}/tell-desktop.png` });
await page.goto(`${ROOT}/route/deborah?s=megiddo`);
await page.waitForTimeout(1500);
ok(await page.locator('#s-megiddo .tell').count() === 1, 'tell section inside the Megiddo station');

// ציר זמן: מהדורת חדשות לכל תקופה
await page.goto(`${ROOT}/timeline`);
for (const e of ERAS) {
  await page.locator('.era-tab', { hasText: e.name }).click();
  await page.waitForTimeout(250);
  ok((await page.locator('.news-headline').textContent()) === e.headline, `era ${e.id}: news headline`);
  const areas = TERRITORIES[e.id] || [];
  const placed = e.peoples.filter((p) => !areas.some((a) => a.name === p.name.split(' (')[0] || a.name === p.name)).length;
  ok((await page.locator('.era-map .people, .era-map .people-dot').count()) === placed, `era ${e.id}: ${placed} places on the map (areas carry the rest)`);
  ok(new URL(page.url()).searchParams.get('era') === e.id, `era ${e.id}: state in URL`);
  ok((await page.locator('.era-map path.territory').count()) === (TERRITORIES[e.id] || []).length, `era ${e.id}: ${(TERRITORIES[e.id] || []).length} territories with borders`);
  ok((await page.locator('.news-routes .chip').count()) >= PEOPLE.filter((p) => p.era === e.id).length, `era ${e.id}: people of the era`);
}
await page.locator('.era-map .seg button', { hasText: 'גבולות' }).click();
ok((await page.locator('.era-map path.territory').count()) === 0, 'borders layer toggles off');
await page.locator('.era-map .seg button', { hasText: 'גבולות' }).click();
await page.locator('.tl-band').first().click();
ok(new URL(page.url()).searchParams.get('era') === ERAS[0].id, 'timeline band opens its era');
await page.screenshot({ path: `${SHOTS}/timeline-desktop.png` });
ok((await page.locator('.story-row').count()) === ROUTES.length, 'timeline page lists every story');
await page.locator('.tl-dot').first().click();
await page.locator('.tl-dot').first().click();
await page.waitForURL(/\/route\//);
ok(true, 'second click on a timeline dot opens the route');
// ניווט עליון
await page.goto(ROOT);
for (const [label, path] of [['ציר זמן', '/timeline'], ['דמויות', '/people'], ['מארג קשרים', '/threads'], ['תלים', '/tells'], ['מסלולים', '/']]) {
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

// מצב שטח: מיקום מדומה בתל מגידו
const g = await browser.newContext({ viewport: { width: 1366, height: 900 }, geolocation: { latitude: 32.5852, longitude: 35.1845 }, permissions: ['geolocation'] });
await mockAll(g);
const gp = await g.newPage();
watch(gp);
await gp.goto(ROOT);
await gp.locator('.field-btn').click();
await gp.waitForTimeout(800);
ok((await gp.locator('.field-result .tone').textContent()).includes('תל מגידו'), 'field mode finds the station you stand at');
ok((await gp.locator('.field-near li').count()) === 4, 'field mode lists the nearest stations');
await gp.goto(`${ROOT}/route/deborah`);
await gp.locator('.field-btn').click();
await gp.waitForTimeout(2000);
ok(new URL(gp.url()).searchParams.get('s') === 'megiddo', 'on the route page, field mode opens the station');
await g.close();

// נייד
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mockAll(m);
await m.route(/opentopomap/, (r) => r.abort());
const mp = await m.newPage();
watch(mp);
for (const path of ['/', '/timeline', '/threads', '/people', '/tells', ...ROUTES.map((r) => `/route/${r.id}`)]) {
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
