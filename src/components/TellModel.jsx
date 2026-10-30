import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { TELLS, PERIOD_COLORS } from '../data/tells.js';
import { Rich } from '../lib/rich.jsx';

const CX = 300;
const BASE = 330;
const R0 = 250;
const RTOP = 120;
const E = 0.3;
const HT = 210;
const yr = (y) => (y < 0 ? `${-y} לפנה״ס` : `${y} לספירה`);

// רצועת צד של פרוסת תל (חרוט קטום) בהטלה איזומטרית: הצד הקדמי בלבד.
const band = (rb, rt, yb, yt) =>
  `M${CX - rb},${yb} L${CX - rt},${yt} A${rt},${rt * E} 0 0 0 ${CX + rt},${yt} L${CX + rb},${yb} A${rb},${rb * E} 0 0 1 ${CX - rb},${yb} Z`;

/**
 * חתך תלת־ממדי של תל: כל שכבה פרוסה בצבע התקופה שלה.
 * פריסה מרחיקה את השכבות זו מזו, החפירה מקלפת מלמעלה, והנגינה בונה את התל לאורך הזמן.
 */
export default function TellModel({ id, compact }) {
  const t = TELLS[id];
  const uid = useId().replace(/:/g, '');
  const n = t.layers.length;
  const [active, setActive] = useState(n - 1);
  const [exploded, setExploded] = useState(false);
  const [visible, setVisible] = useState(n);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setActive(n - 1); setVisible(n); setExploded(false); setPlaying(false); }, [id, n]);
  useEffect(() => {
    if (!playing) return undefined;
    if (visible >= n) { setPlaying(false); return undefined; }
    const k = setTimeout(() => { setVisible((v) => v + 1); setActive(visible); }, 900);
    return () => clearTimeout(k);
  }, [playing, visible, n]);

  const total = t.layers.reduce((s, l) => s + l.w, 0);
  let acc = 0;
  const geo = t.layers.map((l) => {
    const h0 = (acc / total) * HT;
    acc += l.w;
    const h1 = (acc / total) * HT;
    const r = (h) => R0 - (R0 - RTOP) * (h / HT);
    return { yb: BASE - h0, yt: BASE - h1, rb: r(h0), rt: r(h1) };
  });
  const gap = exploded ? 16 : 0;
  const play = () => { setVisible(0); setActive(0); setPlaying(true); };
  const L = t.layers[active];
  const pc = PERIOD_COLORS[L.p];

  return (
    <figure className={`tell ${compact ? 'tell-compact' : ''}`}>
      <figcaption className="tell-head">
        <span className="mono">חתך התל · {t.height}</span>
        <strong>{t.name}</strong>
        <p><Rich text={t.lead} /></p>
      </figcaption>
      <div className="tell-grid">
        <div className="tell-stage">
          <svg viewBox="0 0 600 400" role="img" aria-label={`חתך שכבות של ${t.name}`}>
            <defs>
              <linearGradient id={`sh-${uid}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#000" stopOpacity="0.32" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="0.12" />
                <stop offset="1" stopColor="#000" stopOpacity="0.38" />
              </linearGradient>
            </defs>
            <ellipse cx={CX} cy={BASE + 8} rx={R0 + 30} ry={(R0 + 30) * E} className="tell-ground" />
            {t.layers.map((l, i) => {
              const g = geo[i];
              const shown = i < visible;
              const lift = -i * gap + (shown ? 0 : -70);
              const on = i === active;
              const c = PERIOD_COLORS[l.p].color;
              const isTop = i === Math.min(visible, n) - 1;
              return (
                <motion.g
                  key={i}
                  className={`tell-layer ${on ? 'on' : ''}`}
                  initial={false}
                  animate={{ y: lift, opacity: shown ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  <path d={band(g.rb, g.rt, g.yb, g.yt)} fill={c} fillOpacity={on ? 1 : 0.86} stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
                  <path d={band(g.rb, g.rt, g.yb, g.yt)} fill={`url(#sh-${uid})`} />
                  {(exploded || isTop || on) && (
                    <ellipse cx={CX} cy={g.yt} rx={g.rt} ry={g.rt * E} fill={c} fillOpacity={on ? 0.8 : 0.6} stroke="#fff" strokeOpacity="0.8" />
                  )}
                  <text x={CX} y={(g.yb + g.yt) / 2 + g.rt * E * 0.9 + 4} className="tell-num" textAnchor="middle">{i + 1}</text>
                </motion.g>
              );
            })}
          </svg>
          <div className="tell-controls">
            <button className={`chip press ${exploded ? 'on' : ''}`} aria-pressed={exploded} onClick={() => setExploded(!exploded)} title="מרחיק את השכבות זו מזו כדי לראות כל אחת">פריסת השכבות</button>
            <button className="chip press" onClick={play} disabled={playing} title="בונה את התל שכבה אחר שכבה, מהקדומה לאחרונה">הצטברות לאורך הזמן</button>
            <label className="dig">
              <span className="mono">חפירה</span>
              <input type="range" min="1" max={n} value={visible} onChange={(e) => { setPlaying(false); setVisible(Number(e.target.value)); setActive(Number(e.target.value) - 1); }} aria-label="כמה שכבות נשארות. גרירה ימינה חופרת מלמעלה" />
            </label>
          </div>
        </div>
        <div className="tell-info">
          <motion.div key={`${id}-${active}`} className="tell-card" style={{ '--c': pc.color }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <span className="mono">שכבה {active + 1} מתוך {n} · {pc.name}</span>
            <h4>{L.title}</h4>
            <p className="mono tell-years">{yr(L.from)} עד {yr(L.to)}</p>
            <p>{L.note}</p>
          </motion.div>
          <ol className="tell-list" reversed>
            {[...t.layers].map((l, i) => ({ l, i })).reverse().map(({ l, i }) => (
              <li key={i} className={`${i === active ? 'on' : ''} ${i < visible ? '' : 'gone'}`}>
                <button className="press" onClick={() => setActive(i)} onMouseEnter={() => setActive(i)} style={{ '--c': PERIOD_COLORS[l.p].color }}>
                  <i />
                  <span>{l.title}</span>
                  <span className="mono">{l.from < 0 ? -l.from : l.from}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="tell-foot">
        <p className="tone tone-insight"><span className="mono">תובנה</span><Rich text={`==${t.insight}==`} /></p>
        {!compact && <p className="muted small">{t.near}</p>}
      </div>
    </figure>
  );
}
