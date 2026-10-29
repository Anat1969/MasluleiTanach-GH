// תמונות נטענות בזמן אמת מוויקיפדיה. כל תחנה מחזיקה רשימת כותרות לפי סדר עדיפות.
const cache = new Map();

async function lookup(entry) {
  const [lang, title] = entry.split(':');
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=960&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data?.query?.pages || {})[0];
  if (!page || page.missing !== undefined || !page.thumbnail) return null;
  return { src: page.thumbnail.source, page: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}` };
}

export function wikiImage(entries) {
  const key = entries.join('|');
  if (!cache.has(key)) {
    cache.set(key, (async () => {
      for (const e of entries) {
        try { const hit = await lookup(e); if (hit) return hit; } catch { /* רשת */ }
      }
      return null;
    })());
  }
  return cache.get(key);
}

export const commonsSearch = (q) => `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(q)}&title=Special:MediaSearch&type=image`;
