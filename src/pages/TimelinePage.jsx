import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, colorOf, periodOf } from '../data/routes.js';
import { refLabel, refUrl, yearLabel } from '../lib/bible.js';
import Timeline from '../components/Timeline.jsx';

const sorted = [...ROUTES].sort((a, b) => a.year - b.year);

export default function TimelinePage() {
  const [focusId, setFocusId] = useState(sorted[0].id);
  const nav = useNavigate();
  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">מאברהם ועד אליהו</p>
        <h1>ציר זמן</h1>
        <p className="lead">למעלה: איפה כל סיפור עומד בתולדות התקופה. למטה: רצף האירועים בתוך כל סיפור, פרק אחרי פרק.</p>
      </header>
      <Timeline focusId={focusId} onFocus={setFocusId} onOpen={(id) => nav(`/route/${id}`)} />
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
