import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, colorOf } from '../data/routes.js';

const R = 6371;
export function km(a, b) {
  const r = Math.PI / 180;
  const x = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const fmt = (d) => (d < 1 ? `${Math.round(d * 1000)} מ׳` : `${d.toFixed(d < 10 ? 1 : 0)} ק״מ`);

/** "אני בשטח": המיקום מה-GPS, התחנות הקרובות, ופתיחה אוטומטית של תחנה כשעומדים בה. */
export default function FieldMode({ routeId, onArrive }) {
  const [state, setState] = useState('idle');
  const [pos, setPos] = useState(null);
  const watch = useRef(null);
  const arrived = useRef(null);

  const stop = () => { if (watch.current != null) navigator.geolocation.clearWatch(watch.current); watch.current = null; setState('idle'); };
  useEffect(() => () => { if (watch.current != null) navigator.geolocation?.clearWatch(watch.current); }, []);

  const start = () => {
    if (!('geolocation' in navigator)) { setState('nogeo'); return; }
    setState('locating');
    watch.current = navigator.geolocation.watchPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setState('on'); },
      (e) => setState(e.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
  };

  const all = ROUTES.flatMap((r) => r.stations.map((s) => ({ r, s })));
  const near = pos ? all.map((x) => ({ ...x, d: km(pos, x.s.at) })).sort((a, b) => a.d - b.d) : [];
  const here = near.find((x) => (!routeId || x.r.id === routeId) && x.d < 1);

  useEffect(() => {
    if (here && onArrive && arrived.current !== here.s.id) { arrived.current = here.s.id; onArrive(here.s.id); }
  }, [here, onArrive]);

  return (
    <div className={`field field-${state}`}>
      {state === 'idle' || state === 'denied' || state === 'error' || state === 'nogeo' ? (
        <button className="btn press field-btn" onClick={start} title="משתמש במיקום של הטלפון כדי למצוא את התחנה הקרובה. המיקום לא נשמר ולא נשלח לשום מקום">אני בשטח: מה קרוב אליי</button>
      ) : (
        <button className="btn-quiet press field-btn" onClick={stop}>יציאה ממצב שטח</button>
      )}
      {state === 'locating' && <p className="field-msg mono">מאתר מיקום…</p>}
      {state === 'denied' && <p className="field-msg tone tone-problem">הדפדפן לא קיבל אישור למיקום. כדי להפעיל: לאשר מיקום לאתר בהגדרות הדפדפן, ולנסות שוב.</p>}
      {state === 'error' && <p className="field-msg tone tone-problem">לא הצלחנו לקבל מיקום. כדאי לצאת לשטח פתוח ולנסות שוב.</p>}
      {state === 'nogeo' && <p className="field-msg tone tone-problem">הדפדפן הזה לא תומך במיקום.</p>}
      {state === 'on' && near.length > 0 && (
        <div className="field-result">
          {here ? (
            <p className="tone tone-solution"><span className="mono">את בתחנה</span><strong>{here.s.name}</strong>, {fmt(here.d)} ממך. {routeId ? 'התחנה נפתחה למטה.' : ''}</p>
          ) : (
            <p className="tone tone-neutral"><span className="mono">הקרובה ביותר</span><strong>{near[0].s.name}</strong>, {fmt(near[0].d)} ממך.</p>
          )}
          <ol className="field-near">
            {near.slice(0, 4).map((x) => (
              <li key={x.r.id + x.s.id} style={{ '--c': colorOf(x.r) }}>
                <Link className="press" to={`/route/${x.r.id}?s=${x.s.id}`}>
                  <span>{x.s.name}</span>
                  <span className="mono">{x.r.title} · {fmt(x.d)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
