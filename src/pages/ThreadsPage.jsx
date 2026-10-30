import Threads from '../components/Threads.jsx';
import { useSearchParams } from 'react-router-dom';

export default function ThreadsPage() {
  const [sp, setSp] = useSearchParams();
  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">דמויות, מקומות ונושאים שחוזרים</p>
        <h1>מארג הקשרים</h1>
        <p className="lead">כל חוט קושר כמה סיפורים. לכל אחד: הכלל שמחבר ביניהם, התובנה שעולה מהחיבור, ומה עושים עם זה בשטח.</p>
      </header>
      <Threads initial={sp.get('t')} onPick={(t) => setSp({ t }, { replace: true })} />
    </main>
  );
}
