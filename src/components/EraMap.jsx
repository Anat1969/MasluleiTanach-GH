import { useState } from 'react';
import { MapContainer, Marker, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ROLES } from '../data/eras.js';
import { TERRITORIES, smooth, centroid } from '../data/territories.js';
import { Tiles } from './MapView.jsx';
import { ZOOM_PROPS, WheelGuard } from './mapZoom.jsx';

const BOUNDS = [[30.75, 34.1], [33.45, 36.5]];
// עיר צפופה מוצגת כנקודה בלבד, ושמה בתיאור שמופיע בריחוף.
const label = (p) =>
  L.divIcon({
    className: '',
    html: p.dot
      ? `<span class="people-dot" style="--r:${ROLES[p.role].color}" title="${p.name}"></span>`
      : `<span class="people people-${p.role}" style="--r:${ROLES[p.role].color}"><i></i>${p.name}</span>`,
    iconSize: null,
    iconAnchor: [0, 8],
  });
const areaLabel = (a) => L.divIcon({ className: '', html: `<span class="area-label" style="--r:${ROLES[a.role].color}">${a.name}</span>`, iconSize: null, iconAnchor: [0, 0] });

/** מי ישב איפה באותה תקופה: שטחים עם גבולות, וערים כנקודות. צבע לפי תפקיד. */
export default function EraMap({ era }) {
  const [show, setShow] = useState({ areas: true, places: true });
  const areas = TERRITORIES[era.id] || [];
  const roles = new Set([...era.peoples.map((p) => p.role), ...areas.map((a) => a.role)]);
  return (
    <div className="era-map">
      <MapContainer className="map" bounds={BOUNDS} {...ZOOM_PROPS} attributionControl>
        <WheelGuard />
        <Tiles mode="grey" />
        {show.areas && areas.map((a) => {
          const c = ROLES[a.role].color;
          const poly = smooth(a.poly);
          return (
            <Polygon key={`${era.id}-${a.name}`} positions={poly} className="territory" pathOptions={{ color: c, weight: 2, dashArray: '6 5', fillColor: c, fillOpacity: a.role === 'empire' ? 0.1 : 0.22 }}>
              <Tooltip sticky>{a.name}</Tooltip>
            </Polygon>
          );
        })}
        {show.areas && areas.map((a) => <Marker key={`${era.id}-${a.name}-l`} position={centroid(a.poly)} icon={areaLabel(a)} interactive={false} />)}
        {show.places && era.peoples.filter((p) => !(show.areas && areas.some((a) => a.name === p.name.split(' (')[0] || a.name === p.name))).map((p) => <Marker key={`${era.id}-${p.name}`} position={p.at} icon={label(p)} interactive={false} title={p.name} />)}
      </MapContainer>
      <div className="legend legend-static" aria-label="מקרא">
        <div className="legend-title mono">מי בארץ</div>
        <ul className="legend-list">
          {Object.entries(ROLES).map(([k, r]) => (
            <li key={k} className={roles.has(k) ? '' : 'off'}><i className="sw-dot" style={{ background: r.color }} />{r.name}</li>
          ))}
        </ul>
        <div className="seg" role="group" aria-label="שכבות">
          <button className={show.areas ? 'on' : ''} aria-pressed={show.areas} onClick={() => setShow((s) => ({ ...s, areas: !s.areas }))}>גבולות</button>
          <button className={show.places ? 'on' : ''} aria-pressed={show.places} onClick={() => setShow((s) => ({ ...s, places: !s.places }))}>ערים</button>
        </div>
        <p className="legend-note">התיחום סכמטי, לפי האטלסים ההיסטוריים.</p>
      </div>
    </div>
  );
}
