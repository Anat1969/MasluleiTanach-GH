import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PeopleWeb from '../components/PeopleWeb.jsx';
import { PEOPLE, LINKS } from '../data/people.js';
import { ROUTES } from '../data/routes.js';
import { JOURNEYS } from '../data/journeys.js';
import { personById } from '../data/people.js';
import Journey from '../components/Journey.jsx';

export default function PeoplePage() {
  const [sp, setSp] = useSearchParams();
  const loc = useLocation();
  useEffect(() => { if (loc.hash === '#journey') setTimeout(() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); }, [loc.hash, sp]);
  const selected = sp.get('p');
  const routeId = sp.get('route');
  const jid = JOURNEYS[sp.get('j')] ? sp.get('j') : 'david';
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
      <section id="journey" className="journey-section">
        <header className="section-head section-gap">
          <p className="mono eyebrow">המפה של חיים שלמים</p>
          <h2>מסע של דמות</h2>
          <p className="lead">כל המקומות שבהם עברה הדמות, לפי סדר הסיפור, על דרכים אמיתיות ברגל.</p>
        </header>
        <div className="chips" role="group" aria-label="בחירת דמות למסע">
          {Object.keys(JOURNEYS).map((k) => (
            <button key={k} className={`chip press ${k === jid ? 'on' : ''}`} aria-pressed={k === jid} onClick={() => set('j', k)}>{personById(k).name}</button>
          ))}
        </div>
        <Journey id={jid} />
      </section>
    </main>
  );
}
