import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { wikiImage, commonsSearch } from '../lib/wiki.js';

/** תמונה אמיתית מוויקיפדיה. כשאין, איור קווי גובה עם שם המקום, ולא מסגרת ריקה. */
export default function Photo({ wiki, name, en, color, tall, contain }) {
  const [img, setImg] = useState(undefined);
  useEffect(() => {
    let live = true;
    setImg(undefined);
    wikiImage(wiki).then((r) => live && setImg(r));
    return () => { live = false; };
  }, [wiki.join('|')]);

  return (
    <figure className={`photo ${tall ? 'photo-tall' : ''} ${contain ? 'photo-contain' : ''}`} style={{ '--c': color }}>
      {img ? (
        <motion.img src={img.src} alt={name} loading="lazy" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} />
      ) : (
        <svg className="photo-fallback" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M0 ${150 + i * 18} C 90 ${110 + i * 20}, 170 ${170 + i * 10}, 260 ${130 + i * 18} S 380 ${150 + i * 16}, 400 ${140 + i * 18} L400 240 L0 240Z`} opacity={0.12 + i * 0.12} />
          ))}
        </svg>
      )}
      <figcaption>
        <span className="mono">{en}</span>
        <span className="photo-links">
          {img && <a href={img.page} target="_blank" rel="noreferrer">מקור</a>}
          <a href={commonsSearch(en)} target="_blank" rel="noreferrer">עוד תמונות</a>
        </span>
      </figcaption>
      {img === undefined && <span className="photo-loading" aria-hidden="true" />}
    </figure>
  );
}
