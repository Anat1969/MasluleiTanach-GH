// תיחום טריטוריאלי סכמטי לכל תקופה, בהשראת האטלסים ההיסטוריים (כרטא, Carta Bible Atlas).
// כל שטח: שם, תפקיד (צבע לפי ROLES), ומצולע [lat, lng]. הקווים מוחלקים בתצוגה.

const COAST_S = [[31.28, 34.24], [31.50, 34.43], [31.66, 34.54], [31.80, 34.63], [31.92, 34.70]];
const COAST_N = [[32.05, 34.75], [32.33, 34.85], [32.50, 34.89], [32.83, 34.97], [32.92, 35.07], [33.09, 35.10], [33.27, 35.20]];

const A = {
  philistiaWide: [...COAST_S, [31.88, 34.87], [31.72, 34.92], [31.55, 34.80], [31.36, 34.56]],
  philistiaSmall: [...COAST_S.slice(0, 4), [31.82, 34.79], [31.66, 34.86], [31.45, 34.68]],
  ephraim: [[31.86, 35.05], [32.10, 35.00], [32.40, 35.05], [32.46, 35.30], [32.30, 35.47], [31.95, 35.42], [31.82, 35.25]],
  judahHills: [[31.82, 35.25], [31.84, 35.04], [31.62, 34.97], [31.40, 34.92], [31.24, 35.04], [31.28, 35.34], [31.70, 35.36]],
  galilee: [[32.73, 35.18], [33.05, 35.22], [33.22, 35.55], [32.95, 35.58], [32.73, 35.47]],
  valleys: [[32.52, 35.08], [32.68, 35.11], [32.73, 35.30], [32.63, 35.50], [32.46, 35.55], [32.48, 35.30]],
  phoenicia: [[32.83, 34.97], [32.92, 35.07], [33.09, 35.10], [33.27, 35.20], [33.56, 35.37], [33.55, 35.55], [33.20, 35.42], [32.96, 35.21]],
  aram: [[32.80, 35.75], [33.20, 35.85], [33.60, 36.10], [33.55, 36.70], [33.00, 36.65], [32.70, 36.10]],
  ammon: [[31.75, 35.78], [32.15, 35.80], [32.20, 36.10], [31.80, 36.20]],
  moab: [[31.10, 35.58], [31.75, 35.62], [31.75, 35.98], [31.15, 36.00]],
  edom: [[30.35, 35.20], [31.05, 35.45], [31.05, 35.80], [30.35, 35.65]],
  gilead: [[32.15, 35.62], [32.65, 35.63], [32.70, 35.90], [32.15, 35.86]],
  israelKingdom: [[31.92, 35.02], [32.40, 34.97], [32.80, 35.06], [32.95, 35.24], [33.26, 35.55], [32.95, 35.62], [32.40, 35.56], [31.98, 35.46], [31.88, 35.24]],
  judahKingdom: [[31.88, 35.24], [31.88, 35.00], [31.60, 34.90], [31.28, 34.84], [31.08, 35.08], [31.20, 35.36], [31.75, 35.38]],
  united: [[31.10, 35.08], [31.28, 34.84], [31.62, 34.92], [31.92, 34.98], [32.40, 34.97], [32.80, 35.06], [32.95, 35.24], [33.26, 35.55], [32.95, 35.62], [32.40, 35.56], [31.75, 35.38], [31.20, 35.36]],
  canaan: [...COAST_S, ...COAST_N, [33.30, 35.30], [33.28, 35.65], [32.70, 35.60], [32.00, 35.54], [31.20, 35.38], [31.00, 34.70]],
};

export const TERRITORIES = {
  mb: [
    { name: 'ארץ כנען: ערי מדינה', role: 'canaan', poly: A.canaan },
  ],
  lb: [
    { name: 'כנען תחת שלטון מצרים', role: 'empire', poly: A.canaan },
    { name: 'מואב', role: 'neighbor', poly: A.moab },
    { name: 'אדום', role: 'neighbor', poly: A.edom },
  ],
  iron1: [
    { name: 'פלשת', role: 'philistine', poly: A.philistiaWide },
    { name: 'שבטי ישראל בהר', role: 'israel', poly: A.ephraim },
    { name: 'יהודה', role: 'israel', poly: A.judahHills },
    { name: 'שבטי הגליל', role: 'israel', poly: A.galilee },
    { name: 'ערי כנען בעמקים', role: 'canaan', poly: A.valleys },
    { name: 'פיניקיה', role: 'neighbor', poly: A.phoenicia },
    { name: 'עמון', role: 'neighbor', poly: A.ammon },
    { name: 'מואב', role: 'neighbor', poly: A.moab },
    { name: 'אדום', role: 'neighbor', poly: A.edom },
  ],
  iron2a: [
    { name: 'ממלכת ישראל המאוחדת', role: 'israel', poly: A.united },
    { name: 'פלשת', role: 'philistine', poly: A.philistiaWide },
    { name: 'פיניקיה', role: 'neighbor', poly: A.phoenicia },
    { name: 'ארם', role: 'neighbor', poly: A.aram },
    { name: 'עמון', role: 'neighbor', poly: A.ammon },
    { name: 'מואב', role: 'neighbor', poly: A.moab },
    { name: 'אדום', role: 'neighbor', poly: A.edom },
  ],
  iron2b: [
    { name: 'ממלכת ישראל', role: 'israel', poly: A.israelKingdom },
    { name: 'גלעד', role: 'israel', poly: A.gilead },
    { name: 'ממלכת יהודה', role: 'judah', poly: A.judahKingdom },
    { name: 'פלשת', role: 'philistine', poly: A.philistiaSmall },
    { name: 'פיניקיה', role: 'neighbor', poly: A.phoenicia },
    { name: 'ארם דמשק', role: 'neighbor', poly: A.aram },
    { name: 'עמון', role: 'neighbor', poly: A.ammon },
    { name: 'מואב', role: 'neighbor', poly: A.moab },
    { name: 'אדום', role: 'neighbor', poly: A.edom },
  ],
};

/** החלקת צ'ייקין: קו מתאר אורגני במקום מצולע חד. */
export function smooth(poly, rounds = 3) {
  let p = poly;
  for (let r = 0; r < rounds; r++) {
    const out = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = out;
  }
  return p;
}

export const centroid = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
