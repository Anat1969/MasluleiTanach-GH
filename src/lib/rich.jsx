/**
 * טקסט עשיר: **מודגש**, ==תובנה== (מרקר), ומספרים מודגשים אוטומטית.
 * ההדגשות נכתבות פעם אחת בקובצי התוכן.
 */
const NUM = /(\d(?:[\d,.]*\d)?(?:\s?(?:ק״מ|מ׳|דונם|%))?)/g;

function nums(text, key) {
  return text.split(NUM).map((p, i) => (i % 2 ? <b key={`${key}-${i}`} className="num">{p}</b> : p));
}

export function Rich({ text }) {
  const parts = text.split(/(\*\*.+?\*\*|==.+?==)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**')) return <strong key={i}>{nums(p.slice(2, -2), i)}</strong>;
    if (p.startsWith('==')) return <mark key={i}>{nums(p.slice(2, -2), i)}</mark>;
    return <span key={i}>{nums(p, i)}</span>;
  });
}

/** שורות: כל משפט בשורה נפרדת. */
export function Lines({ lines, className }) {
  return (
    <div className={`lines ${className || ''}`}>
      {lines.map((l, i) => <p key={i}><Rich text={l} /></p>)}
    </div>
  );
}
