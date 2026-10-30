import { useState } from 'react';
import { motion } from 'framer-motion';
import { ART, ART_KINDS } from '../data/art.js';
import { refLabel, refUrl } from '../lib/bible.js';
import { Rich } from '../lib/rich.jsx';
import Photo from './Photo.jsx';

/** היצירות שהסיפור הוליד. סינון לפי סוג, ולכל יצירה למה היא מאירה את המקום. */
export default function ArtGallery({ id }) {
  const works = ART[id] || [];
  const kinds = [...new Set(works.map((w) => w.kind))];
  const [kind, setKind] = useState('all');
  const shown = works.filter((w) => kind === 'all' || w.kind === kind);
  return (
    <section id="art" className="art-gallery" aria-label="הסיפור באמנות">
      <header className="ag-head">
        <p className="mono eyebrow">המשך הסיפור</p>
        <h2>מה הסיפור הוליד באמנות</h2>
        <p className="muted">ציור, פיסול, שירה ומוזיקה. לכל יצירה: מה היא רואה במקום שאנחנו עומדים בו.</p>
        <div className="filters" role="group" aria-label="סוג יצירה">
          <button className={`chip press ${kind === 'all' ? 'on' : ''}`} aria-pressed={kind === 'all'} onClick={() => setKind('all')}>הכול <b className="num">{works.length}</b></button>
          {kinds.map((k) => (
            <button key={k} className={`chip press ${kind === k ? 'on' : ''}`} aria-pressed={kind === k} style={{ '--k': ART_KINDS[k].color }} onClick={() => setKind(k)}>
              <i className="kind-sw" />{ART_KINDS[k].name}
            </button>
          ))}
        </div>
      </header>
      <div className="ag-grid">
        {shown.map((w, i) => (
          <motion.article
            key={w.titleEn}
            className={`work work-${i % 2 ? 'b' : 'a'}`}
            style={{ '--k': ART_KINDS[w.kind].color }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Photo wiki={w.wiki} name={w.title} en={w.titleEn} color={ART_KINDS[w.kind].color} contain />
            <div className="work-body">
              <span className="mono work-kind">{ART_KINDS[w.kind].name}{w.year ? ` · ${w.year}` : ''}</span>
              <h3>{w.title}</h3>
              <p className="work-artist">{w.artist}</p>
              <p className="work-note"><Rich text={w.note} /></p>
              {w.quote && (
                <blockquote className="verse">
                  <p>{w.quote.text}</p>
                  <a className="mono ref" href={refUrl(w.quote.ref)} target="_blank" rel="noreferrer">{refLabel(w.quote.ref)}</a>
                </blockquote>
              )}
              <p className="mono work-where">{w.where}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
