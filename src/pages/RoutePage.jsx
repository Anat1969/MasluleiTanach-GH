import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, THREADS, LAYER_NAMES, STATION_TYPES, colorOf, periodOf, routeById } from '../data/routes.js';
import { refLabel, refUrl, yearLabel } from '../lib/bible.js';
import { Rich } from '../lib/rich.jsx';
import { useVisited } from '../lib/visited.js';
import MapView from '../components/MapView.jsx';
import Legend from '../components/Legend.jsx';
import Photo from '../components/Photo.jsx';
import Verse from '../components/Verse.jsx';
import Story from '../components/Story.jsx';
import ArtGallery from '../components/ArtGallery.jsx';
import Profile from '../components/Profile.jsx';
import TRAILS from '../data/trails.json';
import { eraOf } from '../data/eras.js';
import { Lines } from '../lib/rich.jsx';

const sorted = [...ROUTES].sort((a, b) => a.year - b.year);
const navUrl = (at) => `https://www.google.com/maps/dir/?api=1&destination=${at[0]},${at[1]}`;

function Station({ s, i, r, visited, toggle }) {
  const done = visited.has(s.id);
  return (
    <motion.section
      id={`s-${s.id}`}
      data-sid={s.id}
      className="station"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55 }}
    >
      <header className="st-head">
        <span className={`pin pin-${s.type} pin-head`} style={{ '--c': colorOf(r) }}><b>{i + 1}</b></span>
        <div>
          <h2>{s.name}</h2>
          <p className="mono st-sub">{s.en} · {STATION_TYPES[s.type]} · {i === 0 ? 'נקודת פתיחה' : `מגיעים ב${s.leg === 'רכב' ? 'נסיעה' : 'הליכה'}`}</p>
        </div>
      </header>
      <Photo wiki={s.wiki} name={s.name} en={s.en} color={colorOf(r)} />
      {s.verses.map((v) => <Verse key={`${v.ch}-${v.verse}`} v={v} />)}
      <div className="st-block">
        <h3 className="mono">מה קרה כאן</h3>
        <p>{s.story}</p>
      </div>
      <div className="st-block st-see">
        <h3 className="mono">מה רואים מכאן</h3>
        <p><Rich text={s.see} /></p>
      </div>
      <div className="st-block st-field">
        <h3 className="mono">בשטח</h3>
        <p>{s.field}</p>
      </div>
      <div className="layers">
        {Object.entries(LAYER_NAMES).map(([k, name]) => (
          <div key={k} className={`layer layer-${k}`}>
            <span className="mono">{name}</span>
            <p>{s.layers[k]}</p>
          </div>
        ))}
      </div>
      <div className="st-actions">
        <button className={`check ${done ? 'on' : ''}`} onClick={() => toggle(s.id)} aria-pressed={done}>
          {done ? 'הייתי כאן' : 'סימון: הייתי כאן'}
        </button>
        <a className="btn-quiet" href={navUrl(s.at)} target="_blank" rel="noreferrer">ניווט לתחנה</a>
      </div>
    </motion.section>
  );
}

export default function RoutePage() {
  const { id } = useParams();
  const r = routeById(id);
  const [sp, setSp] = useSearchParams();
  const loc = useLocation();
  const [active, setActive] = useState(sp.get('s') || r?.stations[0].id);
  const [tiles, setTiles] = useState('relief');
  const [hover, setHover] = useState(null);
  const { visited, toggle } = useVisited();
  const storyRef = useRef(null);

  // כניסה מקישור עם תחנה: גוללים אליה.
  useEffect(() => {
    const s = sp.get('s');
    setActive(s || r?.stations[0].id);
    if (s) setTimeout(() => document.getElementById(`s-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    else if (loc.hash === '#art') setTimeout(() => document.getElementById('art')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
    else window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // גלילה בסיפור מזיזה את המפה ומעדכנת את הכתובת, כך ש"העתקת קישור" שומרת את התחנה.
  useEffect(() => {
    if (!storyRef.current) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target.dataset.sid)[0];
        if (hit) {
          setActive(hit);
          setSp({ s: hit }, { replace: true });
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    storyRef.current.querySelectorAll('[data-sid]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [id, setSp]);

  if (!r) {
    return (
      <main className="page">
        <h1>המסלול לא נמצא</h1>
        <Link to="/" className="btn">לכל המסלולים</Link>
      </main>
    );
  }

  const color = colorOf(r);
  const idx = Math.max(0, r.stations.findIndex((s) => s.id === active));
  const done = r.stations.filter((s) => visited.has(s.id)).length;
  const related = ROUTES.filter((o) => o.id !== r.id && o.threads.some((t) => r.threads.includes(t)));
  const pos = sorted.findIndex((o) => o.id === r.id);
  const prev = sorted[pos - 1];
  const next = sorted[pos + 1];
  const go = (sid) => document.getElementById(`s-${sid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const tr = TRAILS[r.id].totals;
  const era = eraOf(r.year);
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}` : `0:${String(m).padStart(2, '0')}`);

  return (
    <main className="route" style={{ '--c': color }}>
      <section className="r-hero">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} key={r.id}>
          <p className="mono eyebrow">{periodOf(r.period).name} · {yearLabel(r.year)}</p>
          <h1>{r.title}</h1>
          <p className="r-place">{r.place} <span className="mono">{r.placeEn}</span></p>
          <Verse v={r.key} big />
          <p className="r-lead">{r.lead}</p>
          <dl className="stats">
            <div><dt className="mono">תחנות</dt><dd>{r.stations.length}</dd></div>
            {tr.walkKm > 0 && <div><dt className="mono">הליכה בשבילים</dt><dd>{tr.walkKm} <small>ק״מ · {hm(tr.walkMin)} ש׳</small></dd></div>}
            {tr.driveKm > 0 && <div><dt className="mono">נסיעה בין אתרים</dt><dd>{tr.driveKm} <small>ק״מ · {hm(tr.driveMin)} ש׳</small></dd></div>}
            {tr.ascent > 0 && <div><dt className="mono">עלייה מצטברת ברגל</dt><dd>{tr.ascent} <small>מ׳</small></dd></div>}
            <div><dt className="mono">גובה</dt><dd dir="ltr">{tr.min}…{tr.max} <small>מ׳</small></dd></div>
            <div><dt className="mono">רמת קושי</dt><dd>{r.level}</dd></div>
          </dl>
          <p className="stats-note mono">המרחקים והזמנים מחושבים על רשת השבילים והדרכים של OpenStreetMap. זמני ביקור באתרים לא כלולים.</p>
          <p className="r-season"><span className="mono">עונה מומלצת</span> {r.season}</p>
        </motion.div>
      </section>

      <div className="r-intro">
        <Story id={r.id} />
        <aside className="era-box" style={{ '--c': era.color }}>
          <span className="mono">בזמן הזה בארץ · {era.name} · {era.arch}</span>
          <h3>{era.headline}</h3>
          <Lines lines={era.columns[0].lines.slice(0, 2).concat(era.columns[1].lines.slice(0, 1))} />
          <Link className="btn-quiet press" to={`/timeline?era=${era.id}`}>כל החדשות של התקופה</Link>
        </aside>
      </div>

      <div className="profile-mobile">
        <Profile route={r} activeIdx={idx} onStation={go} />
      </div>

      <div className="r-grid">
        <div className="r-map">
          <div className="steps" role="tablist" aria-label="תחנות המסלול">
            {r.stations.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={s.id === active}
                className={`step ${s.id === active ? 'on' : ''} ${i < idx ? 'past' : ''} ${visited.has(s.id) ? 'done' : ''}`}
                onClick={() => go(s.id)}
              >
                <b>{i + 1}</b><span>{s.name}</span>
              </button>
            ))}
          </div>
          <div className="r-map-box">
            <MapView routes={[r]} focusId={r.id} progress={idx} activeStation={active} tiles={tiles} visited={visited} hover={hover} onStation={(_, sid) => go(sid)} />
            <Legend tiles={tiles} setTiles={setTiles} showPeriods={false} color={color} progress />
          </div>
          <div className="profile-desk">
            <Profile route={r} activeIdx={idx} onHover={setHover} onStation={go} />
          </div>
          <div className="r-progress mono">ביקרתם ב־{done} מתוך {r.stations.length} תחנות</div>
        </div>

        <div className="r-story" ref={storyRef}>
          {r.stations.map((s, i) => <Station key={s.id} s={s} i={i} r={r} visited={visited} toggle={toggle} />)}

          <section className="question">
            <h3 className="mono">שאלה לדרך</h3>
            <p>{r.question}</p>
          </section>

          <section className="sequence">
            <h3 className="mono">רצף הסיפור</h3>
            <ol>
              {r.events.map((e, k) => (
                <motion.li key={k} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.08 }}>
                  <i />
                  <span>{e.t}</span>
                  <a className="mono" href={refUrl(e.ref)} target="_blank" rel="noreferrer">{refLabel(e.ref)}</a>
                </motion.li>
              ))}
            </ol>
          </section>

          <section className="related">
            <h3 className="mono">ממשיכים בחוט</h3>
            <div className="chips">
              {r.threads.map((t) => <Link key={t} className="chip" to={`/threads?t=${t}`}>{THREADS[t].name}</Link>)}
            </div>
            <ul className="related-list">
              {related.map((o) => (
                <li key={o.id} style={{ '--c': colorOf(o) }}>
                  <Link to={`/route/${o.id}`}>
                    <i />
                    <span>{o.title}</span>
                    <span className="mono">{o.threads.filter((t) => r.threads.includes(t)).map((t) => THREADS[t].name).join(' · ')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <nav className="pager">
            {prev ? <Link to={`/route/${prev.id}`} className="pager-prev"><span className="mono">מוקדם יותר</span>{prev.title}</Link> : <span />}
            {next ? <Link to={`/route/${next.id}`} className="pager-next"><span className="mono">מאוחר יותר</span>{next.title}</Link> : <span />}
          </nav>
        </div>
      </div>
      <ArtGallery id={r.id} />
    </main>
  );
}
