import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PERIODS, ROUTES, colorOf } from '../data/routes.js';
import { yearLabel } from '../lib/bible.js';

// הזמן זורם מימין לשמאל, כמו הקריאה. ציר לא לינארי: התקופה הצפופה (שופטים ומלוכה) מקבלת יותר רוחב.
const STOPS = [[-1900, 0], [-1600, 10], [-1250, 17], [-1150, 28], [-1000, 76], [-930, 83], [-800, 100]];
export function pos(y) {
  for (let i = 1; i < STOPS.length; i++) {
    const [y0, p0] = STOPS[i - 1];
    const [y1, p1] = STOPS[i];
    if (y <= y1) return p0 + ((y - y0) / (y1 - y0)) * (p1 - p0);
  }
  return 100;
}
function yearAt(p) {
  for (let i = 1; i < STOPS.length; i++) {
    const [y0, p0] = STOPS[i - 1];
    const [y1, p1] = STOPS[i];
    if (p <= p1) return Math.round(y0 + ((p - p0) / (p1 - p0)) * (y1 - y0));
  }
  return -800;
}
const nearest = (p) => ROUTES.reduce((a, r) => (Math.abs(pos(r.year) - p) < Math.abs(pos(a.year) - p) ? r : a));
const sorted = [...ROUTES].sort((a, b) => a.year - b.year);

/** ציר הזמן עם פס שעובר בין השנים. מחובר למפה דרך onFocus. */
export default function Timeline({ focusId, onFocus, onOpen }) {
  const focus = ROUTES.find((r) => r.id === focusId);
  const [p, setP] = useState(focus ? pos(focus.year) : 50);
  const [playing, setPlaying] = useState(false);
  const raf = useRef();

  useEffect(() => { if (focus) setP(pos(focus.year)); }, [focusId]);

  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    const step = (t) => {
      const dt = t - last; last = t;
      setP((prev) => {
        const next = prev + dt * 0.012;
        if (next >= 100) { setPlaying(false); return 100; }
        const r = nearest(next);
        if (r.id !== focusId && Math.abs(pos(r.year) - next) < 2) onFocus(r.id);
        return next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, focusId, onFocus]);

  const scrub = (val) => {
    setPlaying(false);
    setP(val);
    onFocus(nearest(val).id);
  };

  return (
    <div className="timeline">
      <div className="tl-head">
        <button className="btn-quiet" onClick={() => { if (p >= 99) setP(0); setPlaying(!playing); }} aria-pressed={playing}>
          {playing ? 'עצירה' : 'הפעלת הציר'}
        </button>
        <span className="mono tl-year">{yearLabel(yearAt(p))}</span>
        {focus && <strong className="tl-focus" style={{ '--c': colorOf(focus) }}>{focus.title}</strong>}
        <span className="tl-hint">גררו את הפס, המפה תעבור למסלול של אותה תקופה</span>
      </div>
      <div className="tl-track">
        {PERIODS.map((pr) => (
          <div key={pr.id} className="tl-band" style={{ right: `${pos(pr.from)}%`, width: `${pos(pr.to) - pos(pr.from)}%`, '--c': pr.color }}>
            <span>{pr.name}</span>
          </div>
        ))}
        {sorted.map((r, i) => (
          <button
            key={r.id}
            className={`tl-dot ${focusId === r.id ? 'on' : ''}`}
            style={{ right: `${pos(r.year)}%`, '--c': colorOf(r), '--row': i % 3 }}
            onClick={() => (focusId === r.id && onOpen ? onOpen(r.id) : onFocus(r.id))}
            title={focusId === r.id ? 'לחיצה נוספת פותחת את המסלול' : r.title}
          >
            <i />
            <span>{r.title}</span>
          </button>
        ))}
        <motion.div className="tl-cursor" animate={{ right: `${p}%` }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} />
        <input
          className="tl-range"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={p}
          onChange={(e) => scrub(Number(e.target.value))}
          aria-label="שנה על ציר הזמן"
        />
        <div className="tl-ticks">
          {[-1800, -1200, -1100, -1050, -1000, -900, -800].map((y) => (
            <span key={y} style={{ right: `${pos(y)}%` }} className="mono">{-y}</span>
          ))}
        </div>
      </div>
      <p className="tl-note">השנים לפני הספירה, הערכה מקובלת. תקופת האבות מסורתית ושנויה במחלוקת. הציר אינו לינארי.</p>
    </div>
  );
}
