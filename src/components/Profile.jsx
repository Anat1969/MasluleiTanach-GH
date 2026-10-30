import { useEffect, useId, useMemo, useRef, useState } from 'react';
import TRAILS from '../data/trails.json';
import { colorOf } from '../data/routes.js';

const H = 190;
const PAD = { top: 34, bottom: 26, side: 10 };

/** פרופיל גובה של המסלול האמיתי. ההתחלה מימין, כמו הקריאה. ריחוף מראה את הנקודה על המפה. */
export default function Profile({ route, activeIdx, onHover, onStation }) {
  const t = TRAILS[route.id];
  // מזהה ייחודי לכל מופע: גרדיאנט בתוך עותק מוסתר (display:none) לא מצויר בכרום.
  const gid = `pg-${useId().replace(/:/g, '')}`;
  const box = useRef(null);
  const [W, setW] = useState(600);
  const [cur, setCur] = useState(null);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const color = colorOf(route);
  const total = t.marks[t.marks.length - 1] || 1;
  const lo = Math.min(t.totals.min, 0 < t.totals.min && t.totals.min < 60 ? 0 : t.totals.min);
  const hi = t.totals.max;
  const span = Math.max(40, hi - lo);
  const x = (d) => W - PAD.side - (d / total) * (W - 2 * PAD.side);
  const y = (e) => PAD.top + (1 - (e - lo) / span) * (H - PAD.top - PAD.bottom);

  // רצפים של הליכה ושל נסיעה, כל אחד כשטח נפרד
  const runs = useMemo(() => {
    const out = [];
    t.profile.forEach((p, i) => {
      const last = out[out.length - 1];
      if (!last || last.walk !== p[2]) out.push({ walk: p[2], pts: i ? [t.profile[i - 1], p] : [p] });
      else last.pts.push(p);
    });
    return out;
  }, [t]);

  const legs = t.legs.map((leg, i) => {
    const d = t.stationElev[i + 1] - t.stationElev[i];
    return { ...leg, d, mid: (t.marks[i] + t.marks[i + 1]) / 2 };
  });
  const steepest = legs.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a), legs[0]);
  const ticks = [lo, lo + span / 2, hi].map((v) => Math.round(v / 10) * 10);

  const move = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const d = ((W - PAD.side - (ev.clientX - r.left)) / (W - 2 * PAD.side)) * total;
    const p = t.profile.reduce((a, b) => (Math.abs(b[0] - d) < Math.abs(a[0] - d) ? b : a));
    setCur(p);
    onHover?.([p[3], p[4]]);
  };
  const leave = () => { setCur(null); onHover?.(null); };

  return (
    <figure className="profile" style={{ '--c': color }}>
      <figcaption>
        <span className="mono">פרופיל גובה</span>
        <strong>
          {steepest.d < 0 ? 'ירידה' : 'עלייה'} של <span className="num">{Math.abs(steepest.d)}</span> מ׳ מ{route.stations[legs.indexOf(steepest)].name} ל{route.stations[legs.indexOf(steepest) + 1].name}
        </strong>
      </figcaption>
      <div ref={box} className="profile-box">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} onMouseMove={move} onMouseLeave={leave} role="img" aria-label="פרופיל גובה לאורך המסלול">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.55" />
              <stop offset="1" stopColor={color} stopOpacity="0.06" />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.side} x2={W - PAD.side} y1={y(v)} y2={y(v)} className="pf-grid" />
              <text x={PAD.side + 2} y={y(v) - 3} className="pf-tick" direction="ltr">{v} m</text>
            </g>
          ))}
          {lo <= 0 && (
            <g>
              <line x1={PAD.side} x2={W - PAD.side} y1={y(0)} y2={y(0)} className="pf-sea" />
              <text x={W - PAD.side - 2} y={y(0) - 4} className="pf-sea-label" textAnchor="end">פני הים</text>
            </g>
          )}
          {runs.map((run, i) => {
            const line = run.pts.map((p) => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' L');
            const area = `M${x(run.pts[0][0])},${H - PAD.bottom} L${line} L${x(run.pts[run.pts.length - 1][0])},${H - PAD.bottom}Z`;
            return (
              <g key={i} className={run.walk ? 'pf-walk' : 'pf-drive'}>
                <path d={area} fill={run.walk ? `url(#${gid})` : undefined} />
                <path d={`M${line}`} className="pf-line" stroke={run.walk ? color : undefined} />
              </g>
            );
          })}
          {legs.map((l, i) => (
            <text key={l.from} x={x(l.mid)} y={H - 8} className="pf-leg" textAnchor="middle">
              {l.mode === 'walk' ? 'הליכה' : 'נסיעה'} {l.km.toFixed(1)}
            </text>
          ))}
          {t.marks.map((d, i) => {
            const s = route.stations[i];
            return (
              <g key={s.id} className={`pf-st ${i === activeIdx ? 'on' : ''}`} onClick={() => onStation?.(s.id)}>
                <line x1={x(d)} x2={x(d)} y1={PAD.top - 12} y2={H - PAD.bottom} />
                <circle cx={x(d)} cy={PAD.top - 18} r="10" />
                <text x={x(d)} y={PAD.top - 14} textAnchor="middle">{i + 1}</text>
                <circle cx={x(d)} cy={y(t.stationElev[i])} r="4" className="pf-dot" />
              </g>
            );
          })}
          {cur && (
            <g className="pf-cur" pointerEvents="none">
              <line x1={x(cur[0])} x2={x(cur[0])} y1={PAD.top - 4} y2={H - PAD.bottom} />
              <circle cx={x(cur[0])} cy={y(cur[1])} r="5" />
            </g>
          )}
        </svg>
        {cur && (
          <div className="pf-tip mono" style={{ right: Math.min(W - 120, Math.max(0, W - x(cur[0]) - 50)) }}>
            <b>{cur[1]}</b> מ׳ · {cur[0].toFixed(1)} ק״מ · {cur[2] ? 'הליכה' : 'נסיעה'}
          </div>
        )}
      </div>
      <div className="pf-legend">
        <span><i className="sw-area" />קטע הליכה</span>
        <span><i className="sw-area sw-area-drive" />קטע נסיעה</span>
        {lo <= 0 && <span><i className="sw-sea" />פני הים</span>}
        <span className="mono">מקור: OpenStreetMap, גבהים Terrarium</span>
      </div>
    </figure>
  );
}
