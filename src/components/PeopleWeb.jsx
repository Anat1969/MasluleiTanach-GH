import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PEOPLE, LINKS, RELATIONS, personById, linksOf } from '../data/people.js';
import { ERAS, ROLES } from '../data/eras.js';
import { ROUTES, colorOf } from '../data/routes.js';
import { refLabel, refUrl } from '../lib/bible.js';
import { JOURNEYS } from '../data/journeys.js';
import { Rich, Lines } from '../lib/rich.jsx';

const ROW = 50;
const TOP = 54;
const MIN_W = 860;
const WARM = new Set(['family', 'ally', 'mentor', 'love']);

/** כרטיס דמות: אישיות, פסוק, ומי עם מי ומי נגד מי. */
export function PersonCard({ id, onPick }) {
  const p = personById(id);
  if (!p) return null;
  const era = ERAS.find((e) => e.id === p.era);
  const rel = linksOf(id).map((l) => ({ ...l, other: personById(l.a === id ? l.b : l.a) }));
  const warm = rel.filter((l) => WARM.has(l.type));
  const cold = rel.filter((l) => !WARM.has(l.type));
  const list = (items) => (
    <ul className="rel-list">
      {items.map((l) => (
        <li key={l.a + l.b + l.type} style={{ '--t': RELATIONS[l.type].color }}>
          <button className="press rel-name" onClick={() => onPick(l.other.id)}>{l.other.name}</button>
          <span className="mono rel-type">{RELATIONS[l.type].name}</span>
          <span className="rel-note">{l.note}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <motion.article key={id} className="person" style={{ '--s': ROLES[p.side].color }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <header>
        <span className="mono">{p.role} · {era.name} · {ROLES[p.side].name}</span>
        <h3>{p.name} <small className="mono">{p.en}</small></h3>
        <p className="person-trait"><Rich text={`==${p.trait}==`} /></p>
      </header>
      <Lines lines={p.lines} />
      <blockquote className="verse" style={{ '--c': ROLES[p.side].color }}>
        <p>{p.verse.text}</p>
        <a className="mono ref" href={refUrl(p.verse.ref)} target="_blank" rel="noreferrer">{refLabel(p.verse.ref)}</a>
      </blockquote>
      <div className="rel-cols">
        <section><h4 className="mono">עם מי</h4>{warm.length ? list(warm) : <p className="muted">אין קשרים קרובים בסיפורים שכאן.</p>}</section>
        <section><h4 className="mono">נגד מי</h4>{cold.length ? list(cold) : <p className="muted">אין יריבים בסיפורים שכאן.</p>}</section>
      </div>
      <div className="chips">
        {JOURNEYS[id] && <Link to={`/people?p=${id}&j=${id}#journey`} className="chip press chip-strong">המסע של {p.name} על המפה</Link>}
        {p.routes.map((rid) => {
          const r = ROUTES.find((x) => x.id === rid);
          return <Link key={rid} to={`/route/${rid}`} className="chip press" style={{ '--k': colorOf(r) }}><i className="kind-sw" />{r.title}</Link>;
        })}
      </div>
    </motion.article>
  );
}

/**
 * רשת הדמויות: טור לכל תקופה, מימין לשמאל לפי הזמן. קו לכל קשר, בצבע לפי סוגו.
 * routeId מצמצם לדמויות של מסלול אחד.
 */
export default function PeopleWeb({ routeId, selected, onSelect, compact }) {
  const box = useRef(null);
  const [W, setW] = useState(MIN_W);
  const [hover, setHover] = useState(null);
  const [types, setTypes] = useState(() => new Set(Object.keys(RELATIONS)));
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(compact ? 320 : MIN_W, e.contentRect.width)));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [compact]);

  const people = useMemo(() => PEOPLE.filter((p) => !routeId || p.routes.includes(routeId)), [routeId]);
  const eras = ERAS.filter((e) => people.some((p) => p.era === e.id));
  const colW = W / eras.length;
  const nodeW = compact ? Math.min(150, W / 3.2) : Math.min(170, colW - 28);
  const pos = {};
  eras.forEach((e, ci) => {
    people.filter((p) => p.era === e.id).forEach((p, k) => {
      pos[p.id] = { x: W - (ci + 0.5) * colW, y: TOP + k * ROW + ROW / 2 };
    });
  });
  let H = TOP + Math.max(...eras.map((e) => people.filter((p) => p.era === e.id).length)) * ROW + 20;
  // במסלול אחד: טבעת. כל דמות על המעגל, והקשרים חוצים דרך המרכז.
  const ring = compact;
  if (ring) {
    const R = Math.max(90, Math.min(W / 2 - nodeW / 2 - 8, 40 + people.length * 26));
    H = 2 * R + 90;
    people.forEach((p, k) => {
      const t = -Math.PI / 2 + (2 * Math.PI * k) / people.length;
      pos[p.id] = { x: W / 2 - R * Math.cos(t), y: H / 2 + 14 + R * Math.sin(t) };
    });
  }
  const links = LINKS.filter((l) => pos[l.a] && pos[l.b] && types.has(l.type));
  // דמות נבחרת שאינה ברשימה המסוננת לא מעמעמת את כל הרשת
  const focus = hover || (pos[selected] ? selected : null);
  const near = focus ? new Set([focus, ...links.filter((l) => l.a === focus || l.b === focus).flatMap((l) => [l.a, l.b])]) : null;

  const path = (l, i) => {
    const a = pos[l.a];
    const b = pos[l.b];
    const hw = nodeW / 2;
    if (ring) {
      const cx = W / 2;
      const cy = H / 2 + 14;
      const k = 0.45 + (i % 3) * 0.08;
      return `M${a.x},${a.y} Q${cx + ((a.x + b.x) / 2 - cx) * k},${cy + ((a.y + b.y) / 2 - cy) * k} ${b.x},${b.y}`;
    }
    if (Math.abs(a.x - b.x) < 1) {
      // באותה תקופה: קשת שיוצאת שמאלה ומעגלת חזרה
      const bulge = 26 + Math.abs(a.y - b.y) * 0.18 + (i % 3) * 6;
      return `M${a.x - hw},${a.y} C${a.x - hw - bulge},${a.y} ${b.x - hw - bulge},${b.y} ${b.x - hw},${b.y}`;
    }
    const [r, lft] = a.x > b.x ? [a, b] : [b, a];
    const mx = (r.x - hw + lft.x + hw) / 2;
    return `M${r.x - hw},${r.y} C${mx},${r.y} ${mx},${lft.y} ${lft.x + hw},${lft.y}`;
  };

  const toggle = (t) => setTypes((s) => {
    const n = new Set(s);
    if (n.has(t) && n.size > 1) n.delete(t); else n.add(t);
    return n;
  });

  return (
    <div className={`web ${compact ? 'web-compact' : ''}`}>
      <div className="web-legend" role="group" aria-label="סוגי קשר">
        {Object.entries(RELATIONS).map(([k, r]) => (
          <button key={k} className={`chip press ${types.has(k) ? 'on-soft' : 'off'}`} aria-pressed={types.has(k)} onClick={() => toggle(k)} style={{ '--t': r.color }} title="לחיצה מסתירה או מציגה את הקשרים מסוג זה">
            <svg width="22" height="8" aria-hidden="true"><line x1="0" y1="4" x2="22" y2="4" stroke={r.color} strokeWidth="3" strokeDasharray={r.dash} /></svg>
            {r.name}
          </button>
        ))}
      </div>
      <div className="web-scroll">
        <div ref={box} className="web-box">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="web-svg" role="img" aria-label="רשת הקשרים בין הדמויות">
            {ring && (
              <text x={W / 2} y={22} textAnchor="middle" className="web-era-years">{eras.map((e) => e.name).join(' · ')}</text>
            )}
            {!ring && eras.map((e, ci) => (
              <g key={e.id}>
                <rect x={W - (ci + 1) * colW + 4} y={0} width={colW - 8} height={H} className="web-col" style={{ fill: `color-mix(in srgb, ${e.color} 7%, transparent)` }} />
                <text x={W - (ci + 0.5) * colW} y={20} textAnchor="middle" className="web-era" style={{ fill: e.color }}>{e.name}</text>
                <text x={W - (ci + 0.5) * colW} y={36} textAnchor="middle" className="web-era-years">{-e.from} עד {-e.to}</text>
              </g>
            ))}
            {links.map((l, i) => {
              const on = !near || (near.has(l.a) && near.has(l.b) && (l.a === focus || l.b === focus));
              const r = RELATIONS[l.type];
              return (
                <motion.path
                  key={l.a + l.b + l.type}
                  d={path(l, i)}
                  fill="none"
                  stroke={r.color}
                  strokeDasharray={r.dash}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: on ? 0.9 : 0.08, strokeWidth: on && focus ? 3 : 1.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <title>{`${personById(l.a).name} · ${personById(l.b).name}: ${r.name}. ${l.note}`}</title>
                </motion.path>
              );
            })}
            {people.map((p) => {
              const { x, y } = pos[p.id];
              const dim = near && !near.has(p.id);
              return (
                <g
                  key={p.id}
                  className={`web-node ${selected === p.id ? 'on' : ''} ${dim ? 'dim' : ''}`}
                  transform={`translate(${x - nodeW / 2},${y - 16})`}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelect(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(p.id)}
                  aria-label={`${p.name}, ${p.role}`}
                >
                  <rect width={nodeW} height={32} className="web-rect" />
                  <rect x={nodeW - 5} width={5} height={32} style={{ fill: ROLES[p.side].color }} />
                  <text x={nodeW - 12} y={21} textAnchor="start" className="web-name">{p.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="web-sides">
        {Object.entries(ROLES).filter(([k]) => people.some((p) => p.side === k)).map(([k, r]) => (
          <span key={k}><i style={{ background: r.color }} />{r.name}</span>
        ))}
        <span className="muted">ריחוף על דמות מדגיש את הקשרים שלה. לחיצה פותחת את הכרטיס.</span>
      </div>
      <AnimatePresence mode="wait">{selected && people.some((p) => p.id === selected) && <PersonCard key={selected} id={selected} onPick={onSelect} />}</AnimatePresence>
    </div>
  );
}
