import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JOURNEYS } from '../data/journeys.js';
import { personById } from '../data/people.js';
import { ROLES } from '../data/eras.js';
import { refLabel, refUrl } from '../lib/bible.js';
import { Rich } from '../lib/rich.jsx';
import { Tiles } from './MapView.jsx';
import { ZOOM_PROPS, WheelGuard } from './mapZoom.jsx';

const pin = (n, color, on) => L.divIcon({ className: '', html: `<span class="pin pin-tel pin-${on ? 'active' : 'idle'}" style="--c:${color}"><b>${n}</b></span>`, iconSize: [30, 30], iconAnchor: [15, 15] });
const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos((a[0] * Math.PI) / 180));

/** נקודה שהולכת לאורך כל המסע, ומדווחת לאיזו תחנה הגיעה. */
function Walker({ path, marks, playing, onStop, onEnd, color }) {
  const map = useMap();
  const dot = useRef(null);
  useEffect(() => {
    if (!playing || path.length < 2) return undefined;
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + dist(path[i - 1], path[i]));
    const total = cum[cum.length - 1];
    if (!dot.current) dot.current = L.circleMarker(path[0], { radius: 8, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1, className: 'walker' }).addTo(map);
    const ms = 14000;
    const t0 = performance.now();
    let raf;
    let last = -1;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const target = total * k;
      let i = cum.findIndex((c) => c >= target);
      if (i <= 0) i = 1;
      const f = (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      const p = [path[i - 1][0] + f * (path[i][0] - path[i - 1][0]), path[i - 1][1] + f * (path[i][1] - path[i - 1][1])];
      dot.current.setLatLng(p);
      if (k > 0.02) map.panTo(p, { animate: false });
      const reached = marks.filter((m) => m <= k + 1e-6).length - 1;
      if (reached !== last) { last = reached; onStop(reached); }
      if (k < 1) raf = requestAnimationFrame(step); else onEnd();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, path, marks, color, map, onStop, onEnd]);
  useEffect(() => () => { dot.current?.remove(); dot.current = null; }, []);
  return null;
}

function Fly({ to }) {
  const map = useMap();
  useEffect(() => { if (to) map.flyTo(to, Math.max(map.getZoom(), 10), { duration: 0.8 }); }, [to, map]);
  return null;
}

/** מסע של דמות: כל המקומות שבהם עברה, על דרכים אמיתיות ברגל, עם פסוק לכל תחנה. */
export default function Journey({ id }) {
  const j = JOURNEYS[id];
  const p = personById(id);
  const color = ROLES[p.side].color;
  const [data, setData] = useState(null);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fly, setFly] = useState(null);

  // הנתונים כבדים יחסית, ולכן נטענים רק כשפותחים מסע
  useEffect(() => { import('../data/journeys.json').then((m) => setData(m.default)); }, []);
  useEffect(() => { setCur(0); setPlaying(false); setFly(null); }, [id]);

  const jd = data?.[id];
  const path = useMemo(() => (jd ? jd.legs.flatMap((l) => l.coords) : []), [jd]);
  const marks = useMemo(() => (jd ? jd.marks.map((m) => m / jd.marks[jd.marks.length - 1]) : []), [jd]);
  const bounds = j.stops.map((s) => s.at);
  const stop = j.stops[cur];

  return (
    <section className="journey" style={{ '--c': color }}>
      <header className="journey-head">
        <span className="mono">מסע של דמות · {p.name}</span>
        <h3>{j.title}</h3>
        <p><Rich text={j.lead} /></p>
        {jd && (
          <dl className="stats stats-inline">
            <div><dt className="mono">תחנות</dt><dd>{j.stops.length}</dd></div>
            <div><dt className="mono">ברגל, בדרכים של היום</dt><dd>{jd.totals.km} <small>ק״מ</small></dd></div>
            <div><dt className="mono">זמן הליכה</dt><dd>{jd.totals.hours} <small>שעות</small></dd></div>
            <div><dt className="mono">עלייה מצטברת</dt><dd>{jd.totals.ascent.toLocaleString('he-IL')} <small>מ׳</small></dd></div>
          </dl>
        )}
      </header>
      <div className="journey-grid">
        <ol className="journey-stops">
          {j.stops.map((s, i) => (
            <li key={s.id} className={i === cur ? 'on' : i < cur ? 'past' : ''}>
              <button className="press" onClick={() => { setPlaying(false); setCur(i); setFly(s.at); }}>
                <b className="num">{i + 1}</b>
                <span>{s.name}</span>
                {jd && i > 0 && <span className="mono">{jd.legs[i - 1].km} ק״מ</span>}
              </button>
            </li>
          ))}
        </ol>
        <div className="journey-map">
          <MapContainer key={id} className="map" bounds={bounds} boundsOptions={{ padding: [40, 40] }} {...ZOOM_PROPS} attributionControl>
            <WheelGuard />
            <Tiles mode="relief" />
            {jd && jd.legs.map((l, i) => (
              <Polyline key={i} positions={l.coords} pathOptions={{ color: i < cur ? color : '#1f2328', weight: i < cur ? 6 : 4, opacity: i < cur ? 1 : 0.7, dashArray: i < cur ? null : '8 6', lineCap: 'round', lineJoin: 'round' }} />
            ))}
            {j.stops.map((s, i) => (
              <Marker key={s.id} position={s.at} icon={pin(i + 1, color, i === cur)} eventHandlers={{ click: () => { setPlaying(false); setCur(i); } }}>
                <Tooltip direction="top" offset={[0, -14]}>{s.name}</Tooltip>
              </Marker>
            ))}
            {jd && <Walker path={path} marks={marks} playing={playing} color={color} onStop={setCur} onEnd={() => setPlaying(false)} />}
            <Fly to={fly} />
          </MapContainer>
          <button className="btn journey-play press" onClick={() => { setFly(null); setCur(0); setPlaying(true); }} disabled={!jd || playing}>
            {playing ? 'בדרך…' : 'הפעלת המסע'}
          </button>
        </div>
        <motion.article key={`${id}-${cur}`} className="journey-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <span className="mono">תחנה {cur + 1} מתוך {j.stops.length} · {stop.en}</span>
          <h4>{stop.name}</h4>
          <p>{stop.what}</p>
          <blockquote className="verse">
            <p>{stop.verse.text}</p>
            <a className="mono ref" href={refUrl(stop.verse)} target="_blank" rel="noreferrer">{refLabel(stop.verse)}</a>
          </blockquote>
          {stop.route && <Link className="btn-quiet press" to={`/route/${stop.route}?s=${stop.station}`}>לתחנה במסלול</Link>}
        </motion.article>
      </div>
      <p className="tone tone-insight journey-insight"><span className="mono">תובנה</span><Rich text={`==${j.insight}==`} /></p>
    </section>
  );
}
