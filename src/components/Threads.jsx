import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ROUTES, THREADS, colorOf, routeById } from '../data/routes.js';
import { THREAD_STORY } from '../data/threads.js';
import { Rich } from '../lib/rich.jsx';
import TRAILS from '../data/trails.json';
import { Tiles } from './MapView.jsx';
import { ZOOM_PROPS, WheelGuard } from './mapZoom.jsx';

const IDS = Object.keys(THREADS);
const stopsOf = (t) => THREAD_STORY[t].stops.map((s) => {
  const r = routeById(s.route);
  return { ...s, r, st: r.stations.find((x) => x.id === s.station) };
});
const routesOf = (t) => [...new Set(THREAD_STORY[t].stops.map((s) => s.route))].map(routeById);

const pin = (n, color) => L.divIcon({ className: '', html: `<span class="pin pin-tel" style="--c:${color}"><b>${n}</b></span>`, iconSize: [30, 30], iconAnchor: [15, 15] });

/** מפת החוט: המסלולים שהוא קושר, ועליהם התחנות שבהן הוא נראה, ממוספרות לפי הרשימה. */
function ThreadMap({ t }) {
  const stops = stopsOf(t);
  const bounds = stops.map((s) => s.st.at);
  return (
    <div className="thread-map">
      <MapContainer key={t} className="map" bounds={bounds} boundsOptions={{ padding: [50, 50], maxZoom: 12 }} {...ZOOM_PROPS} attributionControl>
        <WheelGuard />
        <Tiles mode="grey" />
        {routesOf(t).map((r) => TRAILS[r.id].legs.map((leg, i) => (
          <Polyline key={`${r.id}-${i}`} positions={leg.coords} pathOptions={{ color: colorOf(r), weight: 3, opacity: 0.55, dashArray: leg.mode === 'drive' ? '1 7' : null, lineCap: 'round' }} />
        )))}
        {stops.map((s, i) => (
          <Marker key={`${s.route}-${s.station}`} position={s.st.at} icon={pin(i + 1, colorOf(s.r))}>
            <Tooltip direction="top" offset={[0, -14]}>
              <strong>{s.st.name}</strong>
              <br />
              <span className="tt-sub">{s.r.title}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function Detail({ t }) {
  const d = THREAD_STORY[t];
  const stops = stopsOf(t);
  return (
    <motion.section key={t} className="thread-detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <header>
        <span className="mono">חוט · {routesOf(t).length} מסלולים · {stops.length} תחנות</span>
        <h2>{THREADS[t].name}</h2>
      </header>
      <div className="thread-why">
        <div className="tone tone-neutral"><span className="mono">הכלל: למה זה מחובר</span><p><Rich text={d.rule} /></p></div>
        <div className="tone tone-insight"><span className="mono">התובנה</span><p><Rich text={`==${d.insight}==`} /></p></div>
        <div className="tone tone-solution"><span className="mono">מה עושים עם זה</span><p><Rich text={d.action} /></p></div>
      </div>
      <div className="thread-body">
        <ol className="thread-stops">
          {stops.map((s, i) => (
            <li key={`${s.route}-${s.station}`} style={{ '--c': colorOf(s.r) }}>
              <b className="num">{i + 1}</b>
              <div>
                <Link to={`/route/${s.route}?s=${s.station}`} className="press stop-link">{s.st.name}</Link>
                <span className="mono">{s.r.title}</span>
                <p>{s.why}</p>
              </div>
            </li>
          ))}
        </ol>
        <ThreadMap t={t} />
      </div>
    </motion.section>
  );
}

/** מארג הקשרים: כרטיס לכל חוט, ופירוט עם הכלל, התובנה, היישום ומפה. compact: רק הכרטיסים, עם קישור לדף. */
export default function Threads({ initial, compact, onPick }) {
  const [sel, setSel] = useState(initial || (compact ? null : IDS[0]));
  const pick = (t) => { setSel(t); onPick?.(t); };
  return (
    <div className="threads2">
      <div className="thread-tiles" role="tablist" aria-label="חוטים">
        {IDS.map((t) => {
          const rs = routesOf(t);
          const Tag = compact ? Link : 'button';
          const props = compact ? { to: `/threads?t=${t}` } : { onClick: () => pick(t), role: 'tab', 'aria-selected': sel === t };
          return (
            <Tag key={t} className={`thread-tile press ${sel === t ? 'on' : ''}`} {...props}>
              <strong>{THREADS[t].name}</strong>
              <span className="tile-insight">{THREAD_STORY[t].insight}</span>
              <span className="tile-routes">
                {rs.map((r) => <i key={r.id} style={{ background: colorOf(r) }} title={r.title} />)}
                <span className="mono">{rs.length} מסלולים</span>
              </span>
            </Tag>
          );
        })}
      </div>
      {!compact && <AnimatePresence mode="wait">{sel && <Detail key={sel} t={sel} />}</AnimatePresence>}
    </div>
  );
}

