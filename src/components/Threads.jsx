import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES, THREADS, colorOf } from '../data/routes.js';

/** מארג הקשרים: חוטים (דמויות, מקומות, נושאים) מצד אחד, מסלולים מהצד השני. */
export default function Threads({ initial }) {
  const [sel, setSel] = useState(initial || null);
  // מציירים ביחידות פיקסל אמיתיות: הנפשת pathLength נשברת כשה-SVG נמתח בצורה לא אחידה.
  const box = useRef(null);
  const [W, setW] = useState(200);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(40, e.contentRect.width)));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const ids = Object.keys(THREADS);
  const routes = useMemo(() => [...ROUTES].sort((a, b) => a.year - b.year), []);
  const H = Math.max(ids.length, routes.length) * 46 + 20;
  const yT = (i) => 30 + i * ((H - 60) / (ids.length - 1));
  const yR = (i) => 30 + i * ((H - 60) / (routes.length - 1));
  const linked = (t, r) => r.threads.includes(t);
  const selRoutes = sel ? routes.filter((r) => linked(sel, r)) : [];

  return (
    <div className="threads">
      <div className="threads-graph">
        <div className="th-col th-routes">
          {routes.map((r, i) => (
            <Link key={r.id} to={`/route/${r.id}`} className={`th-node ${sel && !linked(sel, r) ? 'dim' : ''}`} style={{ top: yR(i), '--c': colorOf(r) }}>
              {r.title}
            </Link>
          ))}
        </div>
        <div ref={box} className="th-mid">
        <svg className="th-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {ids.map((t, ti) =>
            routes.map((r, ri) =>
              linked(t, r) ? (
                <motion.path
                  key={t + r.id}
                  d={`M${W} ${yR(ri)} C ${W * 0.5} ${yR(ri)}, ${W * 0.5} ${yT(ti)}, 0 ${yT(ti)}`}
                  stroke={colorOf(r)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: !sel || sel === t ? 0.85 : 0.08, strokeWidth: sel === t ? 3 : 1.4 }}
                  transition={{ duration: 0.9, delay: ti * 0.05 }}
                  fill="none"
                />
              ) : null,
            ),
          )}
        </svg>
        </div>
        <div className="th-col th-threads">
          {ids.map((t, i) => (
            <button key={t} className={`th-node th-thread ${sel === t ? 'on' : ''}`} style={{ top: yT(i) }} onClick={() => setSel(sel === t ? null : t)} aria-pressed={sel === t}>
              {THREADS[t].name}
            </button>
          ))}
        </div>
      </div>
      <div className="th-detail" aria-live="polite">
        {sel ? (
          <>
            <h3>{THREADS[sel].name}</h3>
            <p>{THREADS[sel].note}</p>
            <p className="mono small">{selRoutes.length} מסלולים קשורים</p>
            <ul>
              {selRoutes.map((r) => (
                <li key={r.id}><Link to={`/route/${r.id}`} style={{ '--c': colorOf(r) }}>{r.title}</Link></li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">בחרו חוט כדי לראות אילו מסלולים הוא קושר. כל חוט הוא דמות, מקום או נושא שחוזרים ביותר מסיפור אחד.</p>
        )}
      </div>
    </div>
  );
}
