import { motion } from 'framer-motion';
import { STORIES } from '../data/stories.js';
import { refLabel, refUrl } from '../lib/bible.js';
import { Rich, Lines } from '../lib/rich.jsx';

/** סיפור הרקע כמו כתבת מגזין: אות פתיחה, כותרות ביניים, ציטוט מוגדל, תובנה, הייקו ודוגמה מהעיר. */
export default function Story({ id }) {
  const s = STORIES[id];
  if (!s) return null;
  return (
    <motion.article className="story" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}>
      <header className="story-head">
        <p className="mono eyebrow">סיפור רקע · {s.kicker}</p>
        <h2>{s.title}</h2>
        <p className="story-dek">{s.dek}</p>
      </header>
      <p className="story-lead">{s.lead}</p>
      <div className="story-cols">
        {s.sections.map((sec, i) => (
          <section key={sec.h} className="story-sec">
            <h3><span className="mono">{String(i + 1).padStart(2, '0')}</span>{sec.h}</h3>
            <Lines lines={sec.lines} />
            {i === 0 && (
              <blockquote className="pull">
                <p>{s.pull.text}</p>
                <a className="mono" href={refUrl(s.pull.ref)} target="_blank" rel="noreferrer">{refLabel(s.pull.ref)}</a>
              </blockquote>
            )}
          </section>
        ))}
      </div>
      <div className="story-foot">
        <div className="tone tone-insight">
          <span className="mono">תובנה</span>
          <p><Rich text={`==${s.insight}==`} /></p>
        </div>
        <div className="haiku">
          <span className="mono">הייקו</span>
          {s.haiku.map((l) => <p key={l}>{l}</p>)}
          <small>{s.haikuNote}</small>
        </div>
        <div className="tone tone-neutral">
          <span className="mono">מהעיר של היום</span>
          <p><Rich text={s.city} /></p>
        </div>
      </div>
    </motion.article>
  );
}
