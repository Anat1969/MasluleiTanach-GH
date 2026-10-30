// האמנות שהסיפור הוליד: ציור, פיסול, שירה, מוזיקה ופסיפס.
// כל יצירה: אמן, שנה, מקום, ולמה היא מאירה את המקום. ציטוטים רק מיצירות בנחלת הכלל.

export const ART_KINDS = {
  paint: { name: 'ציור', color: '#8c4a2f' },
  sculpt: { name: 'פיסול', color: '#5b6470' },
  poem: { name: 'שירה', color: '#6b4f8a' },
  music: { name: 'מוזיקה', color: '#2f6a7a' },
  ancient: { name: 'אמנות עתיקה', color: '#8a7a3c' },
};

export const ART = {
  elah: [
    {
      kind: 'sculpt', title: 'דוד', titleEn: 'David', artist: 'מיכלאנג\'לו (Michelangelo)', year: '1501 עד 1504',
      where: 'גלריה דל אקדמיה, פירנצה (Galleria dell\'Accademia, Florence)',
      note: 'דוד לפני הקרב, לא אחריו. **המבט מרוכז והקלע על הכתף.** ==הפסל לוכד את הרגע שבו דוד עוד עומד באפיק ובוחר אבן.==',
      wiki: ['en:David (Michelangelo)'],
    },
    {
      kind: 'paint', title: 'דוד עם ראש גלית', titleEn: 'David with the Head of Goliath', artist: 'קרווג\'ו (Caravaggio)', year: 'בערך 1610',
      where: 'גלריה בורגזה, רומא (Galleria Borghese, Rome)',
      note: 'הצייר נתן לראש של גלית את פניו שלו. **הנער לא חוגג, הוא מביט בעצב.**',
      wiki: ['en:David with the Head of Goliath (Rome)', 'en:David with the Head of Goliath (Caravaggio, Rome)'],
    },
    {
      kind: 'sculpt', title: 'דוד', titleEn: 'David', artist: 'דונטלו (Donatello)', year: 'שנות ה־⁠40 של המאה ה־⁠15',
      where: 'מוזיאון הברג\'לו, פירנצה (Museo del Bargello, Florence)',
      note: 'פסל ברונזה עומד ועירום ראשון מאז העת העתיקה. **דוד כנער דק,** והחרב גדולה עליו.',
      wiki: ['en:David (Donatello)'],
    },
    {
      kind: 'poem', title: 'מזמור קנא', titleEn: 'Psalm 151', artist: 'מגילות מדבר יהודה ותרגום השבעים', year: 'ימי בית שני',
      where: 'מגילת התהלים ממערה 11 בקומראן (11QPsa), מוזיאון ישראל, ירושלים',
      note: 'מזמור שלא נכנס לספר תהלים שלנו, ובו דוד מספר על הרועה הצעיר שנבחר. **בתרגום היווני כותרתו מזכירה את גלית.**',
      wiki: ['en:Psalm 151'],
    },
  ],
  ark: [
    {
      kind: 'ancient', title: 'הארון במקדש הפלשתים', titleEn: 'Dura-Europos synagogue frescoes', artist: 'ציירים לא ידועים', year: 'בערך 244 לספירה',
      where: 'בית הכנסת של דורה אירופוס, היום במוזיאון הלאומי של דמשק (National Museum of Damascus)',
      note: 'ציור קיר בבית כנסת עתיק מראה את פסלי האלילים מנותצים מול הארון. **אחד הציורים היהודיים העתיקים ביותר שנמצאו.**',
      wiki: ['en:Dura-Europos synagogue'],
    },
    {
      kind: 'paint', title: 'המגפה באשדוד', titleEn: 'The Plague of Ashdod', artist: 'ניקולא פוסן (Nicolas Poussin)', year: '1630 עד 1631',
      where: 'מוזיאון הלובר, פריז (Louvre, Paris)',
      note: 'פוסן צייר את אשדוד כעיר רומית עם עמודים, ומאחור מקדש דגון ובו הפסל השבור. **הוא צייר אותו בזמן מגפה באיטליה.**',
      wiki: ['en:The Plague of Ashdod'],
    },
    {
      kind: 'sculpt', title: 'מרים על גבי הארון', titleEn: 'Notre-Dame de l\'Arche d\'Alliance', artist: 'כנסיית קריית יערים', year: '1924',
      where: 'כנסיית נוטרדאם דה ל\'ארש ד\'אליאנס, אבו גוש (Abu Ghosh)',
      note: 'פסל ענק על גג הכנסייה מציב את מרים ובנה על ארון הברית. **במסורת הנוצרית מרים היא "הארון החדש".**',
      wiki: ['en:Kiryat Yearim'],
    },
  ],
  ayalon: [
    {
      kind: 'paint', title: 'יהושע מצווה על השמש לעמוד בגבעון', titleEn: 'Joshua Commanding the Sun to Stand Still upon Gibeon', artist: 'ג\'ון מרטין (John Martin)', year: '1816',
      where: 'הלשכה הגדולה המאוחדת של אנגליה, לונדון (United Grand Lodge of England)',
      note: 'מרטין, צייר האסונות הגדולים, נתן לאדם מקום זעיר בתוך נוף של סערה. **הנוף הוא הגיבור, לא יהושע.**',
      wiki: ['en:Joshua Commanding the Sun to Stand Still upon Gibeon'],
    },
    {
      kind: 'paint', title: 'יהושע עוצר את השמש', titleEn: 'Joshua Commands the Sun to Stand Still', artist: 'גוסטב דורה (Gustave Doré)', year: '1866',
      where: 'התנ״ך המאויר של טור (La Grande Bible de Tours)',
      note: 'חיתוך העץ של דורה הפך לתמונה שרוב העולם מכיר לסיפור. **הוא הופץ במיליוני עותקים.**',
      wiki: ['en:La Grande Bible de Tours'],
    },
    {
      kind: 'poem', title: 'ספר הישר', titleEn: 'Book of Jasher', artist: 'שירה עברית קדומה', year: 'לפני ספר יהושע',
      where: 'מוזכר ביהושע י ובשמואל ב א',
      note: 'הפסוק "שמש בגבעון דום" מצוטט מספר שירים שאבד. **גם קינת דוד על שאול לקוחה ממנו.** ==שני המסלולים, איילון והגלבוע, מחוברים בספר אחד שלא שרד.==',
      wiki: ['en:Book of Jasher (biblical references)'],
    },
  ],
  deborah: [
    {
      kind: 'poem', title: 'שירת דבורה', titleEn: 'Song of Deborah', artist: 'שופטים ה', year: 'מהשירים העתיקים בתנ״ך',
      where: 'ספר שופטים, פרק ה',
      note: 'חוקרים רבים רואים בה את אחד הטקסטים העבריים הקדומים ביותר. **השיר מתאר את אותו קרב שהפרק הקודם מספר בפרוזה,** ומוסיף כוכבים, נחל ואם שמחכה בחלון.',
      quote: { text: 'בעד החלון נשקפה ותיבב אם סיסרא…', ref: { book: 'judges', ch: 5, verse: 28 } },
      wiki: ['en:Song of Deborah'],
    },
    {
      kind: 'paint', title: 'יעל וסיסרא', titleEn: 'Jael and Sisera', artist: 'ארטמיזיה ג\'נטילסקי (Artemisia Gentileschi)', year: '1620',
      where: 'מוזיאון לאמנויות יפות, בודפשט (Museum of Fine Arts, Budapest)',
      note: 'אחת הציירות הראשונות שהתפרנסו מאמנות ציירה את יעל בשקט, לפני המכה. **היא בחרה שוב ושוב גיבורות תנ״כיות.**',
      wiki: ['en:Jael and Sisera (Gentileschi)', 'en:Artemisia Gentileschi'],
    },
    {
      kind: 'paint', title: 'דבורה', titleEn: 'Deborah', artist: 'גוסטב דורה (Gustave Doré)', year: '1866',
      where: 'התנ״ך המאויר של טור (La Grande Bible de Tours)',
      note: 'דורה צייר אותה עומדת על סלע, מעל העם, כשהיא שרה. **השופטת כמשוררת.**',
      wiki: ['en:Deborah'],
    },
  ],
  saul: [
    {
      kind: 'paint', title: 'התאבדות שאול', titleEn: 'The Suicide of Saul', artist: 'פיטר ברויגל האב (Pieter Bruegel the Elder)', year: '1562',
      where: 'מוזיאון לתולדות האמנות, וינה (Kunsthistorisches Museum, Vienna)',
      note: 'שאול ונושא כליו זעירים בפינה, וצבאות אדירים זורמים בעמק. **ברויגל צייר את הגלבוע כהרי האלפים.**',
      wiki: ['en:The Suicide of Saul'],
    },
    {
      kind: 'paint', title: 'בעלת האוב בעין דור', titleEn: 'The Witch of Endor', artist: 'סלבטור רוזה (Salvator Rosa)', year: '1668',
      where: 'מוזיאון הלובר, פריז (Louvre, Paris)',
      note: 'לילה, עשן ושלד. **רוזה הפך את הסצנה לסיפור אימה,** והתנ״ך עצמו כמעט לא מתאר אותה.',
      wiki: ['en:Witch of Endor'],
    },
    {
      kind: 'poem', title: 'קינת דוד', titleEn: 'David\'s Lament', artist: 'שמואל ב א', year: 'מספר הישר',
      where: 'שמואל ב, פרק א',
      note: 'דוד מקונן על שאול שרדף אותו ועל יונתן חברו, בלי מילה של נקמה. **"איך נפלו גבורים" חוזר שלוש פעמים, כמו פזמון.**',
      quote: { text: 'שאול ויהונתן הנאהבים והנעימם בחייהם ובמותם לא נפרדו', ref: { book: 'sam2', ch: 1, verse: 23 } },
      wiki: ['en:David\'s Lament'],
    },
    {
      kind: 'poem', title: 'שאול', titleEn: 'Saul (Hebrew Melodies)', artist: 'לורד ביירון (Lord Byron)', year: '1815',
      where: 'בתוך "מנגינות עבריות" (Hebrew Melodies), לונדון',
      note: 'ביירון כתב שני שירים על שאול, ואחד מהם הוא שירו של המלך לפני הקרב האחרון. **המשורר הרומנטי זיהה בשאול גיבור טרגי.**',
      wiki: ['en:Hebrew Melodies'],
    },
  ],
  elijah: [
    {
      kind: 'music', title: 'אליהו', titleEn: 'Elijah (Elias)', artist: 'פליקס מנדלסון (Felix Mendelssohn)', year: '1846',
      where: 'בכורה בפסטיבל ברמינגהם (Birmingham Festival), אנגליה',
      note: 'אורטוריה שלמה על אליהו, עם מקהלת נביאי הבעל הקוראת "בעל ענה אותנו". **הגשם בסוף נשמע כמו פיצוץ של מקהלה ותזמורת.**',
      wiki: ['en:Elijah (oratorio)'],
    },
    {
      kind: 'sculpt', title: 'אליהו על הכרמל', titleEn: 'Statue of Elijah, Muhraka', artist: 'פסל בחצר המנזר', year: '',
      where: 'מנזר המוחרקה, הכרמל (Muhraqa)',
      note: 'פסל של אליהו עם חרב מונפת עומד בחצר, מעל העמק. **המבקרים רואים את הפסל ואת הנוף שבו התרחש הסיפור בבת אחת.**',
      wiki: ['en:Muhraqa'],
    },
    {
      kind: 'paint', title: 'אליהו שוחט את נביאי הבעל', titleEn: 'Elijah Slays the Prophets of Baal', artist: 'גוסטב דורה (Gustave Doré)', year: '1866',
      where: 'התנ״ך המאויר של טור (La Grande Bible de Tours)',
      note: 'דורה בחר בסצנה האלימה שהציירים הקודמים דילגו עליה. **הוא לא ייפה את הנביא.**',
      wiki: ['en:Elijah'],
    },
  ],
  sodom: [
    {
      kind: 'paint', title: 'חורבן סדום ועמורה', titleEn: 'The Destruction of Sodom and Gomorrah', artist: 'ג\'ון מרטין (John Martin)', year: '1852',
      where: 'גלריית לינג, ניוקאסל (Laing Art Gallery, Newcastle)',
      note: 'שמיים אדומים ועיר שקורסת לתוך האש. **לוט ובנותיו נמלטים בפינה, ואשתו כבר הופכת לעמוד לבן.**',
      wiki: ['en:The Destruction of Sodom and Gomorrah (painting)', 'en:Sodom and Gomorrah'],
    },
    {
      kind: 'paint', title: 'לוט ובנותיו', titleEn: 'Lot and His Daughters', artist: 'אלברכט דירר (Albrecht Dürer)', year: 'בערך 1496 עד 1499',
      where: 'הגלריה הלאומית לאמנות, וושינגטון (National Gallery of Art, Washington)',
      note: 'צויר על גב של תמונת מדונה. **ברקע, העיר הבוערת והאישה שהפכה לעמוד.**',
      wiki: ['en:Lot and His Daughters (Dürer)', 'en:Lot (biblical person)'],
    },
    {
      kind: 'poem', title: 'אשת לוט', titleEn: 'Lot\'s Wife', artist: 'אנה אחמטובה (Anna Akhmatova)', year: '1924',
      where: 'שירה רוסית, תרגומים לעברית',
      note: 'אחמטובה כתבה על האישה שאין לה שם בתנ״ך, ובחרה בה. **המבט אחורה הוא אהבה, לא חטא.** ==המשוררת נתנה לה את מה שהסיפור לקח: קול.==',
      wiki: ['en:Anna Akhmatova'],
    },
  ],
  samson: [
    {
      kind: 'paint', title: 'שמשון ודלילה', titleEn: 'Samson and Delilah', artist: 'פיטר פאול רובנס (Peter Paul Rubens)', year: 'בערך 1609 עד 1610',
      where: 'הגלריה הלאומית, לונדון (National Gallery, London)',
      note: 'שמשון ישן על ברכי דלילה, והספר מתחיל לגזור. **החיילים כבר מחכים בפתח.**',
      wiki: ['en:Samson and Delilah (Rubens)'],
    },
    {
      kind: 'paint', title: 'עיוורון שמשון', titleEn: 'The Blinding of Samson', artist: 'רמברנדט (Rembrandt)', year: '1636',
      where: 'מוזיאון שטדל, פרנקפורט (Städel Museum, Frankfurt)',
      note: 'הרגע הקשה ביותר בסיפור, באור חזק מהפתח. **דלילה בורחת עם השיער ביד.**',
      wiki: ['en:The Blinding of Samson'],
    },
    {
      kind: 'music', title: 'שמשון ודלילה', titleEn: 'Samson et Dalila', artist: 'קמיל סן־סנס (Camille Saint-Saëns)', year: '1877',
      where: 'בכורה בווימאר (Weimar), גרמניה',
      note: 'אופרה שבמרכזה האריה של דלילה, "ליבי נפתח לקולך". **הסיפור עבר מהעמק לבמה.**',
      wiki: ['en:Samson and Delilah (opera)'],
    },
    {
      kind: 'poem', title: 'שמשון הלוחם', titleEn: 'Samson Agonistes', artist: 'ג\'ון מילטון (John Milton)', year: '1671',
      where: 'דרמה בחרוזים, לונדון',
      note: 'מילטון, עיוור בעצמו, כתב את שמשון העיוור בעזה. **השורה המפורסמת:** "Eyeless in Gaza, at the mill with slaves".',
      wiki: ['en:Samson Agonistes'],
    },
  ],
};
