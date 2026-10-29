/** טקסט עם **הדגשה**: הדגשה מוצגת כמרקר, כי היא התובנה של התחנה. */
export function Rich({ text }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}
