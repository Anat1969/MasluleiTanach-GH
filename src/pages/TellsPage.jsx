import { Link, useSearchParams } from 'react-router-dom';
import TellModel from '../components/TellModel.jsx';
import { TELLS, PERIOD_COLORS } from '../data/tells.js';
import { ROUTES } from '../data/routes.js';

const IDS = Object.keys(TELLS);

export default function TellsPage() {
  const [sp, setSp] = useSearchParams();
  const id = TELLS[sp.get('t')] ? sp.get('t') : IDS[0];
  const t = TELLS[id];
  const routes = ROUTES.filter((r) => r.stations.some((s) => t.stations.includes(s.id)));
  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">{IDS.length} תלים · {Object.values(TELLS).reduce((n, x) => n + x.layers.length, 0)} שכבות</p>
        <h1>תל הוא ספר שנכתב מלמטה</h1>
        <p className="lead">כל עיר נבנתה על חורבות קודמתה. כאן אפשר לפרוס את השכבות, לחפור מלמעלה, ולראות איך התל גדל לאורך אלפי שנים.</p>
      </header>
      <div className="chips tell-pick" role="group" aria-label="בחירת תל">
        {IDS.map((k) => (
          <button key={k} className={`chip press ${k === id ? 'on' : ''}`} aria-pressed={k === id} onClick={() => setSp({ t: k }, { replace: true })}>{TELLS[k].name}</button>
        ))}
      </div>
      <TellModel id={id} />
      <div className="chips tell-routes">
        <span className="mono">התל במסלולים:</span>
        {routes.map((r) => {
          const st = r.stations.find((s) => t.stations.includes(s.id));
          return <Link key={r.id} className="chip press" to={`/route/${r.id}?s=${st.id}`}>{r.title}</Link>;
        })}
      </div>
      <section className="period-key">
        <h3 className="mono">מקרא התקופות</h3>
        <ul>
          {Object.entries(PERIOD_COLORS).map(([k, p]) => <li key={k}><i style={{ background: p.color }} />{p.name}</li>)}
        </ul>
      </section>
    </main>
  );
}
