import { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, colorOf, periodOf } from '../data/routes.js';
import { yearLabel } from '../lib/bible.js';
import { useVisited } from '../lib/visited.js';
import MapView from '../components/MapView.jsx';
import Legend from '../components/Legend.jsx';
import Timeline from '../components/Timeline.jsx';
import RouteCard from '../components/RouteCard.jsx';
import Verse from '../components/Verse.jsx';
import Threads from '../components/Threads.jsx';
import FieldMode from '../components/FieldMode.jsx';
import { ART } from '../data/art.js';
import { ERAS } from '../data/eras.js';
import TRAILS from '../data/trails.json';

const WORKS = Object.values(ART).reduce((n, a) => n + a.length, 0);
const WALK = Object.values(TRAILS).reduce((n, t) => n + t.totals.walkKm, 0);

const sorted = [...ROUTES].sort((a, b) => a.year - b.year);
const STATIONS = ROUTES.reduce((n, r) => n + r.stations.length, 0);

export default function Home() {
  const nav = useNavigate();
  const { visited } = useVisited();
  const [focusId, setFocusId] = useState(null);
  const [tiles, setTiles] = useState('grey');
  const focus = ROUTES.find((r) => r.id === focusId);
  const open = useCallback((id) => nav(`/route/${id}`), [nav]);

  return (
    <main className="home">
      <section className="hero">
        <svg className="hero-lines" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M0 ${120 + i * 28} C 300 ${60 + i * 34}, 600 ${200 + i * 20}, 900 ${110 + i * 30} S 1200 ${150 + i * 26}, 1200 ${150 + i * 26}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.2, delay: i * 0.12, ease: 'easeOut' }}
            />
          ))}
        </svg>
        <motion.div className="hero-text" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mono eyebrow">{ROUTES.length} מסלולים · {STATIONS} תחנות · {Math.round(WALK)} ק״מ בשבילים · {WORKS} יצירות · {ERAS.length} תקופות</p>
          <h1>לעמוד במקום, לקרוא את הפסוק,<br />לראות את הנוף.</h1>
          <p className="hero-sub">מסלולי טיול בעקבות סיפורי התנ״ך. בכל תחנה: מה קרה כאן, מה רואים מכאן, ומה עושים בשטח.</p>
          <div className="hero-actions">
            <a href="#map" className="btn">למפת המסלולים</a>
            <Link to="/route/elah" className="btn btn-ghost">להתחיל בעמק האלה</Link>
          </div>
          <FieldMode />
        </motion.div>
      </section>

      <nav className="content-map" aria-label="מה יש כאן">
        <a href="#map" className="cm-card press"><span className="mono">מקום</span><strong>מסלולים על השביל האמיתי</strong><small>תוואי מחושב, פרופיל גובה ותחנות</small></a>
        <Link to="/route/elah" className="cm-card press"><span className="mono">סיפור</span><strong>סיפור רקע לכל מסלול</strong><small>מה קרה לפני, ולמה דווקא כאן</small></Link>
        <Link to="/timeline" className="cm-card press"><span className="mono">זמן</span><strong>מה קרה אז בארץ</strong><small>מהדורת חדשות לכל תקופה, ומי ישב איפה</small></Link>
        <Link to="/route/saul#art" className="cm-card press"><span className="mono">אמנות</span><strong>{WORKS} יצירות שהסיפורים הולידו</strong><small>ציור, פיסול, שירה ומוזיקה</small></Link>
      </nav>

      <section id="map" className="atlas">
        <div className="atlas-map">
          <MapView routes={ROUTES} focusId={focusId} tiles={tiles} onRoute={(id) => (id === focusId ? open(id) : setFocusId(id))} visited={visited} />
          <Legend tiles={tiles} setTiles={setTiles} />
        </div>
        <aside className="atlas-side">
          {focus ? (
            <motion.div key={focus.id} className="focus" style={{ '--c': colorOf(focus) }} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mono card-meta">{periodOf(focus.period).name} · {yearLabel(focus.year)}</div>
              <h2>{focus.title}</h2>
              <p className="card-place">{focus.place}</p>
              <Verse v={focus.key} />
              <ol className="mini-stations">
                {focus.stations.map((s) => <li key={s.id} className={visited.has(s.id) ? 'done' : ''}>{s.name}</li>)}
              </ol>
              <div className="row">
                <Link className="btn" to={`/route/${focus.id}`}>לפתיחת המסלול</Link>
                <button className="btn-quiet" onClick={() => setFocusId(null)}>כל המסלולים</button>
              </div>
            </motion.div>
          ) : (
            <div className="focus focus-empty">
              <h2>מפת המסלולים</h2>
              <p>כל קו הוא מסלול, וצבעו לפי התקופה. לחצו על קו או על תחנה כדי להתמקד, או גררו את ציר הזמן שמתחת.</p>
              <ul className="route-index">
                {sorted.map((r) => (
                  <li key={r.id}><button onClick={() => setFocusId(r.id)} style={{ '--c': colorOf(r) }}><i />{r.title}<span className="mono">{yearLabel(r.year)}</span></button></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <div className="atlas-time">
          <Timeline focusId={focusId} onFocus={setFocusId} onOpen={open} onEra={(id) => nav(`/timeline?era=${id}`)} />
        </div>
      </section>

      <section className="section">
        <header className="section-head">
          <p className="mono eyebrow">לפי סדר הזמנים</p>
          <h2>המסלולים</h2>
        </header>
        <div className="cards">
          {sorted.map((r, i) => <RouteCard key={r.id} r={r} i={i} visited={visited} onHover={setFocusId} focused={focusId === r.id} />)}
        </div>
      </section>

      <section className="section">
        <header className="section-head">
          <p className="mono eyebrow">אותה דמות, אותו נחל, סיפור אחר</p>
          <h2>מארג הקשרים</h2>
        </header>
        <Threads compact />
      </section>

      <footer className="footer">
        <p>בהשראת הספר <strong>"לטייל עם התנ״ך"</strong> מאת גליה דורון, צילום זאב רדובן (הוצאת כנרת, 2001). הטקסטים כאן נכתבו מחדש ואינם מתוך הספר.</p>
        <p>פסוקים: <a href="https://www.sefaria.org.il" target="_blank" rel="noreferrer">ספריא</a>. תמונות: ויקיפדיה וויקישיתוף. מפות: OpenStreetMap, CARTO, OpenTopoMap. מיקומי התחנות מקורבים, ויש לבדוק דרכי גישה לפני יציאה.</p>
      </footer>
    </main>
  );
}
