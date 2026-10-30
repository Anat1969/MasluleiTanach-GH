import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, colorOf, periodOf } from '../data/routes.js';
import { ERAS, SERIES, eraOf } from '../data/eras.js';
import { refLabel, refUrl, yearLabel } from '../lib/bible.js';
import Timeline from '../components/Timeline.jsx';
import EraNews from '../components/EraNews.jsx';

const sorted = [...ROUTES].sort((a, b) => a.year - b.year);

export default function TimelinePage() {
  const [sp, setSp] = useSearchParams();
  const eraId = sp.get('era') || ERAS[2].id;
  const era = ERAS.find((e) => e.id === eraId) || ERAS[2];
  const [focusId, setFocusId] = useState(sorted.find((r) => eraOf(r.year).id === era.id)?.id || sorted[0].id);
  const nav = useNavigate();
  const pickEra = (id) => setSp({ era: id }, { replace: true });
  const focus = (id) => {
    setFocusId(id);
    const r = ROUTES.find((x) => x.id === id);
    if (r && eraOf(r.year).id !== eraId) pickEra(eraOf(r.year).id);
  };

  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">מאברהם ועד אליהו, 2000 עד 720 לפנה״ס</p>
        <h1>מה קרה אז בארץ</h1>
        <p className="lead">כל סיפור קרה בתוך עולם: אימפריות, ערים, עמים ושכנים. בחרו תקופה וקראו את "החדשות" שלה, עם המפה של מי ישב איפה והממצאים שמעידים על כך.</p>
      </header>
      <Timeline focusId={focusId} onFocus={focus} onOpen={(id) => nav(`/route/${id}`)} eraId={era.id} onEra={pickEra} />
      <nav className="era-tabs" aria-label="תקופות">
        {ERAS.map((e) => (
          <button key={e.id} className={`era-tab press ${e.id === era.id ? 'on' : ''}`} aria-pressed={e.id === era.id} style={{ '--c': e.color }} onClick={() => pickEra(e.id)}>
            <strong>{e.name}</strong>
            <span className="mono">{-e.from} עד {-e.to}</span>
          </button>
        ))}
      </nav>
      <EraNews era={era} />
      <aside className="series tone tone-neutral">
        <span className="mono">להעמקה</span>
        <p>
          הסדרה <strong>"{SERIES.name}"</strong> ב{SERIES.channel} עוסקת בארץ בתקופת המקרא.
          <br />
          <a href={SERIES.url} target="_blank" rel="noreferrer">לצפייה באתר כאן</a>
        </p>
      </aside>

      <header className="section-head section-gap">
        <p className="mono eyebrow">פרק אחרי פרק</p>
        <h2>רצף האירועים בכל סיפור</h2>
      </header>
      <div className="story-rows">
        {sorted.map((r, i) => (
          <motion.section
            key={r.id}
            className={`story-row ${focusId === r.id ? 'on' : ''}`}
            style={{ '--c': colorOf(r) }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            onMouseEnter={() => setFocusId(r.id)}
          >
            <div className="sr-head">
              <span className="mono">{yearLabel(r.year)} · {periodOf(r.period).name}</span>
              <Link to={`/route/${r.id}`}><h2>{r.title}</h2></Link>
              <button className="btn-quiet press" onClick={() => { pickEra(eraOf(r.year).id); document.querySelector('.news')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>החדשות של התקופה</button>
            </div>
            <ol className="sr-events">
              {r.events.map((e, k) => (
                <li key={k}>
                  <i />
                  <span>{e.t}</span>
                  <a className="mono" href={refUrl(e.ref)} target="_blank" rel="noreferrer">{refLabel(e.ref)}</a>
                </li>
              ))}
            </ol>
          </motion.section>
        ))}
      </div>
    </main>
  );
}
