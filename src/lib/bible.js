import { BOOKS } from '../data/routes.js';

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

/** 1..99 בגימטריה, עם ט"ו ו־ט"ז. */
export function heNum(n) {
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  return TENS[Math.floor(n / 10)] + ONES[n % 10];
}

export const refLabel = (r) => `${BOOKS[r.book].he} ${heNum(r.ch)}, ${heNum(r.verse)}`;
export const refUrl = (r) => `https://www.sefaria.org.il/${BOOKS[r.book].en}.${r.ch}.${r.verse}?lang=he`;

export const yearLabel = (y) => (y < 0 ? `${-y} לפנה״ס` : `${y} לספירה`);
