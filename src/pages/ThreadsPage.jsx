import Threads from '../components/Threads.jsx';
import { useSearchParams } from 'react-router-dom';

export default function ThreadsPage() {
  const [sp] = useSearchParams();
  return (
    <main className="page">
      <header className="section-head">
        <p className="mono eyebrow">דמויות, מקומות ונושאים שחוזרים</p>
        <h1>מארג הקשרים</h1>
        <p className="lead">סיפורי התנ״ך לא עומדים לבד. הגת של גלית היא גם תחנה של הארון, והקישון של דבורה הוא גם הקישון של אליהו. בחרו חוט ועקבו אחריו.</p>
      </header>
      <Threads initial={sp.get('t')} />
    </main>
  );
}
