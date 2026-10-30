import { useSearchParams } from 'react-router-dom';
import PeopleWeb from '../components/PeopleWeb.jsx';
import { PEOPLE, LINKS } from '../data/people.js';
import { ROUTES } from '../data/routes.js';

export default function PeoplePage() {
  const [sp, setSp] = useSearchParams();
  const selected = sp.get('p');
  const routeId = sp.get('route');
  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };
  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">{PEOPLE.length} דמויות · {LINKS.length} קשרים</p>
        <h1>מי עם מי, ומי נגד מי</h1>
        <p className="lead">האנשים שמאחורי הסיפורים: מה מניע אותם, את מי הם אוהבים, ממי הם מפחדים, ומי בוגד במי. כל קשר נשען על פסוק.</p>
      </header>
      <div className="chips route-filter" role="group" aria-label="סינון לפי מסלול">
        <button className={`chip press ${!routeId ? 'on' : ''}`} aria-pressed={!routeId} onClick={() => set('route', null)}>כל הסיפורים</button>
        {[...ROUTES].sort((a, b) => a.year - b.year).map((r) => (
          <button key={r.id} className={`chip press ${routeId === r.id ? 'on' : ''}`} aria-pressed={routeId === r.id} onClick={() => set('route', r.id)}>{r.title}</button>
        ))}
      </div>
      <PeopleWeb routeId={routeId} selected={selected} onSelect={(id) => set('p', id === selected ? null : id)} />
    </main>
  );
}
