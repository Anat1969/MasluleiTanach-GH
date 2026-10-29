import { refLabel, refUrl } from '../lib/bible.js';

export default function Verse({ v, big }) {
  return (
    <blockquote className={`verse ${big ? 'verse-big' : ''}`}>
      <p>{v.text}</p>
      <a className="mono ref" href={refUrl(v)} target="_blank" rel="noreferrer" title="הפרק המלא בספריא">{refLabel(v)}</a>
    </blockquote>
  );
}
