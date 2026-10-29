import { useCallback, useEffect, useState } from 'react';

const KEY = 'maslulei-visited';
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

/** סימוני "הייתי כאן", נשמרים בדפדפן בלבד. */
export function useVisited() {
  const [ids, setIds] = useState(read);
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener('visited-change', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('visited-change', sync); window.removeEventListener('storage', sync); };
  }, []);
  const toggle = useCallback((id) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* מצב פרטי */ }
    window.dispatchEvent(new Event('visited-change'));
  }, []);
  return { visited: new Set(ids), toggle };
}

export function clearVisited() {
  try { localStorage.removeItem(KEY); } catch { /* מצב פרטי */ }
  window.dispatchEvent(new Event('visited-change'));
}
