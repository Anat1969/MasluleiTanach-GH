import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, colorOf } from '../data/routes.js';
import { yearLabel } from '../lib/bible.js';
import { Lines } from '../lib/rich.jsx';
import EraMap from './EraMap.jsx';
import Photo from './Photo.jsx';

/** מהדורת חדשות של התקופה: כותרת ראשית, ארבעה טורים, ממצאים כמקורות, ומפה של מי ישב איפה. */
export default function EraNews({ era }) {
  const routes = ROUTES.filter((r) => r.year >= era.from && r.year < era.to);
  return (
    <motion.article key={era.id} className="news" style={{ '--c': era.color }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <header className="news-mast">
        <span className="mono">חדשות הארץ</span>
        <span className="news-date mono">{yearLabel(era.from)} עד {yearLabel(era.to)}</span>
        <span className="mono">{era.arch}</span>
      </header>
      <h2 className="news-headline">{era.headline}</h2>
      <p className="news-dek">{era.dek}</p>
      <div className="news-body">
        <div className="news-cols">
          {era.columns.map((c) => (
            <section key={c.h} className="news-col">
              <h3 className="mono">{c.h}</h3>
              <Lines lines={c.lines} />
            </section>
          ))}
        </div>
        <EraMap era={era} />
      </div>
      <section className="news-finds">
        <h3 className="mono">המקורות: מה נמצא באדמה ובארכיונים</h3>
        <div className="finds">
          {era.finds.map((f) => (
            <figure key={f.name} className="find">
              <Photo wiki={f.wiki} name={f.name} en={f.wiki[f.wiki.length - 1].split(':')[1]} color={era.color} contain />
              <figcaption>
                <strong>{f.name}</strong>
                <span className="mono">{f.year} לפנה״ס</span>
                <span>{f.what}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      {routes.length > 0 && (
        <section className="news-routes">
          <h3 className="mono">מסלולים מהתקופה</h3>
          <div className="chips">
            {routes.map((r) => <Link key={r.id} to={`/route/${r.id}`} className="chip press" style={{ '--k': colorOf(r) }}><i className="kind-sw" />{r.title}</Link>)}
          </div>
        </section>
      )}
    </motion.article>
  );
}
