# מסלולי תנ״ך

**[masluleitanach-gh.vercel.app](https://masluleitanach-gh.vercel.app)**
המיזוג האחרון בלי Vercel: [raw.githack](https://raw.githack.com/Anat1969/MasluleiTanach-GH/main/app/index.html) (אם מופיע "One more step", לוחצים "Open the page").

מסלולי טיול בעקבות סיפורי התנ״ך, על השבילים והדרכים האמיתיים:
מפה עם תוואי מחושב ופרופיל גובה, פסוק וסיפור לכל תחנה, סיפור רקע לכל מסלול, האמנות שהסיפור הוליד, ומהדורת "חדשות" לכל תקופה: מי שלט ומי ישב בארץ.
בהשראת "לטייל עם התנ״ך" מאת גליה דורון (כנרת, 2001). הטקסטים נכתבו מחדש.

```
npm install
npm run dev
npm run trails        # בונה מחדש את השבילים והגבהים (python3, PIL)
npm run build && npm test
```

מבנה: `src/data` (מסלולים, שבילים, סיפורים, אמנות, תקופות), `src/components`, `src/pages`, `scripts` (בניית נתונים), `tests` (Playwright).
