import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { colorOf, STATION_TYPES } from '../data/routes.js';

export const TILES = {
  grey: {
    name: 'מפה אפורה',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  relief: {
    name: 'תבליט',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap &copy; OpenTopoMap',
  },
};

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
  const t = TILES[tiles];

  return (
    <MapContainer
      className="map"
      bounds={all}
      boundsOptions={{ padding: [30, 30] }}
      scrollWheelZoom={false}
      zoomControl={interactive}
      attributionControl
    >
      <TileLayer key={tiles} url={t.url} attribution={t.attribution} />
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
