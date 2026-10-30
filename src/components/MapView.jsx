import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { colorOf, STATION_TYPES } from '../data/routes.js';
import TRAILS from '../data/trails.json';

// שכבות בלי מפתח API. לכל שכבה מקור גיבוי שנכנס אוטומטית אם האריחים נכשלים.
// (CARTO הפסיק לעבוד בלי מפתח ב-2026-10 והחזיר "API KEY REQUIRED" במקום מפה.)
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const TILES = {
  grey: {
    name: 'מפה',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    fallback: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    attribution: '&copy; OpenStreetMap',
    className: 'tiles-grey',
    maxZoom: 19,
  },
  relief: {
    name: 'תבליט',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    fallback: `${ESRI}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`,
    attribution: '&copy; OpenStreetMap &copy; OpenTopoMap &copy; Esri',
    maxZoom: 17,
  },
  sat: {
    name: 'לוויין',
    url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    fallback: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

/** שכבת אריחים שעוברת למקור הגיבוי אחרי כמה כשלונות לפני שנטען אריח אחד. */
export function Tiles({ mode }) {
  const t = TILES[mode];
  const [useFallback, setUseFallback] = useState(false);
  const stats = useRef({ ok: 0, fail: 0 });
  useEffect(() => { setUseFallback(false); stats.current = { ok: 0, fail: 0 }; }, [mode]);
  return (
    <TileLayer
      key={`${mode}-${useFallback}`}
      url={useFallback ? t.fallback : t.url}
      attribution={t.attribution}
      className={t.className}
      maxZoom={t.maxZoom}
      eventHandlers={{
        tileload: () => { stats.current.ok += 1; },
        tileerror: () => {
          stats.current.fail += 1;
          if (!useFallback && stats.current.ok === 0 && stats.current.fail >= 3) setUseFallback(true);
        },
      }}
    />
  );
}

const icon = (n, type, color, state) =>
  L.divIcon({
    className: '',
    html: `<span class="pin pin-${type} pin-${state}" style="--c:${color}"><b>${n}</b></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

function Controller({ bounds, center, k }) {
  const map = useMap();
  const key = JSON.stringify(center) + k;
  useEffect(() => {
    if (center) map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 1.1 });
    else if (bounds.length) map.flyToBounds(bounds, { padding: [36, 36], duration: 1.1, maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

// pathLength=1 מאפשר להנפיש ציור של קו מלא בלי לדעת את אורכו. קו מקווקו רק נכנס בהדרגה.
const markPath = (drive, delay) => (e) => {
  const el = e.target.getElement();
  if (!el) return;
  if (!drive) el.setAttribute('pathLength', '1');
  el.style.setProperty('--d', `${delay}s`);
};

const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos((a[0] * Math.PI) / 180));

/** נקודה שהולכת לאורך השביל האמיתי עד התחנה החדשה. */
function Walker({ coords, color }) {
  const map = useMap();
  const dot = useRef(null);
  useEffect(() => {
    if (!coords || coords.length < 2) return undefined;
    const cum = [0];
    for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + dist(coords[i - 1], coords[i]));
    const total = cum[cum.length - 1];
    if (!dot.current) {
      dot.current = L.circleMarker(coords[0], { radius: 7, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1, className: 'walker' }).addTo(map);
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = reduce ? 1 : Math.min(2600, 900 + coords.length * 6);
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const target = total * (1 - (1 - k) ** 2);
      let i = cum.findIndex((c) => c >= target);
      if (i <= 0) i = 1;
      const f = (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      const p = [coords[i - 1][0] + f * (coords[i][0] - coords[i - 1][0]), coords[i - 1][1] + f * (coords[i][1] - coords[i - 1][1])];
      dot.current.setLatLng(p);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [coords, color, map]);
  useEffect(() => () => { dot.current?.remove(); dot.current = null; }, []);
  return null;
}

/**
 * מפה של מסלול אחד או של כולם, על השבילים האמיתיים (src/data/trails.json).
 * progress: עד איזו תחנה השביל "נהלך" (בדף מסלול). בלי progress כל השביל צבוע.
 * hover: נקודה מפרופיל הגובה, מוצגת על המפה.
 */
export default function MapView({ routes, focusId, progress, activeStation, tiles = 'grey', onRoute, onStation, visited, hover, interactive = true }) {
  const all = useMemo(() => routes.flatMap((r) => TRAILS[r.id].legs.flatMap((l) => l.coords)), [routes]);
  const focus = routes.find((r) => r.id === focusId);
  const bounds = focus ? TRAILS[focus.id].legs.flatMap((l) => l.coords) : all;
  const activeIdx = focus ? focus.stations.findIndex((s) => s.id === activeStation) : -1;
  const active = activeIdx >= 0 ? focus.stations[activeIdx] : null;
  const walkerLeg = focus && activeIdx > 0 && progress != null ? TRAILS[focus.id].legs[activeIdx - 1] : null;

  return (
    <MapContainer className="map" bounds={all} boundsOptions={{ padding: [30, 30] }} scrollWheelZoom={false} zoomControl={interactive} attributionControl>
      <Tiles mode={tiles} />
      <Controller bounds={bounds} center={active ? active.at : null} k={focusId || 'all'} />
      {routes.map((r) => {
        const color = colorOf(r);
        const dim = focusId && focusId !== r.id;
        return TRAILS[r.id].legs.map((leg, i) => {
          const reached = progress == null || i + 1 <= progress;
          const drive = leg.mode === 'drive';
          const opts = {
            color: reached ? color : '#8a9097',
            weight: reached ? (dim ? 2 : drive ? 4 : 5) : 3,
            opacity: dim ? 0.3 : 0.95,
            dashArray: drive ? '1 8' : null,
            lineCap: 'round',
            lineJoin: 'round',
            // className נקבע רק ביצירת השכבה, ולכן מועבר גם כמאפיין ישיר.
            className: `trail ${drive ? 'trail-drive' : 'trail-walk'} ${reached ? 'trail-on' : 'trail-off'}`,
          };
          const casing = { color: '#ffffff', weight: opts.weight + 4, opacity: dim ? 0.2 : 0.85, lineCap: 'round', lineJoin: 'round', className: 'trail-casing', interactive: false };
          return [
            !drive && <Polyline key={`${r.id}-${i}-c-${dim}`} positions={leg.coords} {...casing} pathOptions={casing} />,
            <Polyline
              key={`${r.id}-${i}-${reached}-${dim}`}
              positions={leg.coords}
              eventHandlers={{ add: markPath(drive, i * 0.3), click: () => onRoute?.(r.id) }}
              {...opts}
              pathOptions={opts}
            >
              <Tooltip sticky>
                <strong>{drive ? 'נסיעה' : 'הליכה'} · {leg.km} ק״מ</strong>
                <br />
                <span className="tt-sub">{r.stations[i].name} אל {r.stations[i + 1].name}</span>
              </Tooltip>
            </Polyline>,
          ];
        });
      })}
      {walkerLeg && <Walker key={walkerLeg.to} coords={walkerLeg.coords} color={colorOf(focus)} />}
      {hover && <CircleMarker center={hover} radius={6} pathOptions={{ color: '#1f2328', weight: 2, fillColor: '#e8c26a', fillOpacity: 1 }} />}
      {routes.map((r) =>
        r.stations.map((s, i) => {
          const state = s.id === activeStation ? 'active' : visited?.has(s.id) ? 'done' : focusId && focusId !== r.id ? 'dim' : 'idle';
          return (
            <Marker
              key={`${r.id}-${s.id}-${state}`}
              position={s.at}
              icon={icon(i + 1, s.type, colorOf(r), state)}
              eventHandlers={{ click: () => (onStation ? onStation(r.id, s.id) : onRoute?.(r.id)) }}
            >
              <Tooltip direction="top" offset={[0, -14]}>
                <strong>{s.name}</strong>
                <br />
                <span className="tt-sub">{r.title} · {STATION_TYPES[s.type]}</span>
              </Tooltip>
            </Marker>
          );
        }),
      )}
    </MapContainer>
  );
}
