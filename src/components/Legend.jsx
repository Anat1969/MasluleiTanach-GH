import { PERIODS, STATION_TYPES } from '../data/routes.js';
import { TILES } from './MapView.jsx';

/** מקרא המפה: מה הצבע, מה הקו, מה הצורה. */
export default function Legend({ tiles, setTiles, showPeriods = true, color, progress }) {
  return (
    <details className="legend" aria-label="מקרא המפה" open={typeof window === 'undefined' || window.innerWidth > 900}>
      <summary className="legend-title mono">מקרא</summary>
      {showPeriods ? (
        <ul className="legend-list">
          {PERIODS.map((p) => (
            <li key={p.id}><i className="sw-line" style={{ background: p.color }} />{p.name}</li>
          ))}
        </ul>
      ) : (
        <ul className="legend-list">
          <li><i className="sw-line" style={{ background: color }} />קטע הליכה</li>
          <li><i className="sw-line sw-dash" style={{ '--c': color }} />קטע נסיעה</li>
          {progress && <li><i className="sw-line" style={{ background: '#9aa0a6' }} />עוד לפניכם</li>}
        </ul>
      )}
      <ul className="legend-list legend-shapes">
        {Object.entries(STATION_TYPES).map(([k, name]) => (
          <li key={k}><span className={`pin pin-${k} pin-legend`} style={{ '--c': color || '#3c4043' }} />{name}</li>
        ))}
      </ul>
      {showPeriods && <p className="legend-note">קו מלא: הליכה. קו מנוקד: נסיעה בין אתרים. הקווים מחברים תחנות ואינם שביל מסומן.</p>}
      <div className="seg" role="group" aria-label="סוג מפה">
        {Object.entries(TILES).map(([k, t]) => (
          <button key={k} className={tiles === k ? 'on' : ''} onClick={() => setTiles(k)} aria-pressed={tiles === k}>{t.name}</button>
        ))}
      </div>
    </details>
  );
}
