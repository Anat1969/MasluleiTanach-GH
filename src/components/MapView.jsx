import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { colorOf, STATION_TYPES } from '../data/routes.js';

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
function Tiles({ mode }) {
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

function Controller({ bounds, center }) {
  const map = useMap();
  const key = JSON.stringify(center || bounds);
  useEffect(() => {
    if (center) map.flyTo(center, Math.max(map.getZoom(), 12), { duration: 1.1 });
    else if (bounds) map.flyToBounds(bounds, { padding: [36, 36], duration: 1.1, maxZoom: 13 });
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

/**
 * מפה של מסלול אחד או של כולם.
 * progress: עד איזו תחנה השביל "נהלך" (בדף מסלול). בלי progress כל השביל צבוע.
 */
export default function MapView({ routes, focusId, progress, activeStation, tiles = 'grey', onRoute, onStation, visited, interactive = true }) {
  const all = useMemo(() => routes.flatMap((r) => r.stations.map((s) => s.at)), [routes]);
  const focus = routes.find((r) => r.id === focusId);
  const bounds = focus ? focus.stations.map((s) => s.at) : all;
  const active = focus?.stations.find((s) => s.id === activeStation);

  return (
    <MapContainer
      className="map"
      bounds={all}
      boundsOptions={{ padding: [30, 30] }}
      scrollWheelZoom={false}
      zoomControl={interactive}
      attributionControl
    >
      <Tiles mode={tiles} />
      <Controller bounds={bounds} center={active ? active.at : null} />
      {routes.map((r) => {
        const color = colorOf(r);
        const dim = focusId && focusId !== r.id;
        return r.stations.slice(1).map((s, i) => {
          const from = r.stations[i];
          const reached = progress == null || i + 1 <= progress;
          const drive = s.leg === 'רכב';
          const opts = {
            color: reached ? color : '#9aa0a6',
            weight: reached ? (dim ? 2 : 5) : 3,
            opacity: dim ? 0.25 : 0.95,
            dashArray: drive ? '2 9' : null,
            lineCap: 'round',
            // className נקבע רק ביצירת השכבה, ולכן מועבר גם כמאפיין ישיר.
            className: `trail ${drive ? 'trail-drive' : 'trail-walk'} ${reached ? 'trail-on' : 'trail-off'}`,
          };
          return (
            <Polyline
              key={`${r.id}-${s.id}-${reached}-${dim}`}
              positions={[from.at, s.at]}
              eventHandlers={{ add: markPath(drive, i * 0.25), click: () => onRoute?.(r.id) }}
              {...opts}
              pathOptions={opts}
            />
          );
        });
      })}
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
