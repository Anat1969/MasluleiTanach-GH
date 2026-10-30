import { MapContainer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { ROLES } from '../data/eras.js';
import { Tiles } from './MapView.jsx';

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

/** מי ישב איפה באותה תקופה. צבע לפי תפקיד: אימפריה, ערי כנען, ישראל, פלשתים, שכנים. */
export default function EraMap({ era }) {
  return (
    <div className="era-map">
      <MapContainer className="map" bounds={BOUNDS} scrollWheelZoom={false} attributionControl zoomSnap={0.25}>
        <Tiles mode="grey" />
        {era.peoples.map((p) => <Marker key={`${era.id}-${p.name}`} position={p.at} icon={label(p)} interactive={false} title={p.name} />)}
      </MapContainer>
      <div className="legend legend-static" aria-label="מקרא">
        <div className="legend-title mono">מי בארץ</div>
        <ul className="legend-list">
          {Object.entries(ROLES).map(([k, r]) => (
            <li key={k} className={era.peoples.some((p) => p.role === k) ? '' : 'off'}><i className="sw-dot" style={{ background: r.color }} />{r.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
