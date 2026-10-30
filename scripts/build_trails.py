"""בונה את השבילים האמיתיים של כל מסלול: ניתוב רגלי או ברכב על רשת OpenStreetMap,
ופרופיל גובה מאריחי Terrarium. פלט: src/data/trails.json.
הרצה: python3 scripts/build_trails.py  (מטמון ב-scripts/.cache, לא בגיט)"""
import io, json, math, os, subprocess, sys, time, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'scripts', '.cache')
os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'MasluleiTanach/1.0 (github.com/Anat1969/MasluleiTanach-GH)'}
ROUTER = {
    'foot': 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/',
    'car': 'https://routing.openstreetmap.de/routed-car/route/v1/driving/',
}


def get(url, binary=False):
    key = os.path.join(CACHE, str(abs(hash(url)) % 10**12) + ('.bin' if binary else '.json'))
    if os.path.exists(key):
        with open(key, 'rb') as f:
            data = f.read()
    else:
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                    data = r.read()
                break
            except Exception as e:  # רשת
                if attempt == 3:
                    raise
                time.sleep(2 ** attempt)
        with open(key, 'wb') as f:
            f.write(data)
        time.sleep(0.4)
    return data if binary else json.loads(data)


def hav(a, b):
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def route(a, b, profile):
    url = f"{ROUTER[profile]}{a[1]},{a[0]};{b[1]},{b[0]}?overview=full&geometries=geojson"
    r = get(url)['routes'][0]
    coords = [[c[1], c[0]] for c in r['geometry']['coordinates']]
    # מחברים את הנקודה המדויקת של התחנה לקצה הרשת
    return [a] + coords + [b], r['distance'] / 1000, r['duration'] / 60


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    def d(p, a, b):
        if a == b:
            return math.dist(p, a)
        t = max(0, min(1, ((p[0]-a[0])*(b[0]-a[0]) + (p[1]-a[1])*(b[1]-a[1])) / ((b[0]-a[0])**2 + (b[1]-a[1])**2)))
        return math.dist(p, (a[0] + t*(b[0]-a[0]), a[1] + t*(b[1]-a[1])))
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        best, idx = 0, None
        for k in range(i + 1, j):
            dd = d(pts[k], pts[i], pts[j])
            if dd > best:
                best, idx = dd, k
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [p for p, k in zip(pts, keep) if k]


Z = 12
tiles = {}
def elev(p):
    n = 2 ** Z
    x = (p[1] + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(p[0])) + 1 / math.cos(math.radians(p[0]))) / math.pi) / 2 * n
    tx, ty = int(x), int(y)
    if (tx, ty) not in tiles:
        png = get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png', binary=True)
        tiles[(tx, ty)] = Image.open(io.BytesIO(png)).convert('RGB')
    r, g, b = tiles[(tx, ty)].getpixel((min(255, int((x - tx) * 256)), min(255, int((y - ty) * 256))))
    return r * 256 + g + b / 256 - 32768


def sample(pts, step_km):
    """נקודות כל step_km לאורך הקו, עם המרחק המצטבר."""
    out, acc, nxt = [(0.0, pts[0])], 0.0, step_km
    for a, b in zip(pts, pts[1:]):
        seg = hav(a, b)
        while seg > 0 and acc + seg >= nxt:
            t = (nxt - acc) / seg
            out.append((nxt, (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))))
            nxt += step_km
        acc += seg
    out.append((acc, pts[-1]))
    return out, acc


def main():
    routes = json.loads(subprocess.check_output(['node', '-e',
        "import('./src/data/routes.js').then(m=>console.log(JSON.stringify(m.ROUTES.map(r=>({id:r.id,stations:r.stations.map(s=>({id:s.id,at:s.at,leg:s.leg}))})))))"],
        cwd=ROOT))
    out = {}
    for r in routes:
        st = r['stations']
        legs, profile, marks = [], [], [0.0]
        dist0 = 0.0
        for a, b in zip(st, st[1:]):
            mode = 'walk' if b['leg'] == 'רגלי' else 'drive'
            pts, km, minutes = route(a['at'], b['at'], 'foot' if mode == 'walk' else 'car')
            crow = hav(a['at'], b['at'])
            # הליכה שהרשת מאריכה פי 3 לא מייצגת שביל אמיתי: מסמנים לבדיקה
            if mode == 'walk' and km > max(3 * crow, crow + 2):
                print(f"  check {r['id']} {a['id']}->{b['id']}: foot {km:.1f} km vs crow {crow:.1f} km", file=sys.stderr)
            samples, length = sample(pts, 0.05 if mode == 'walk' else 0.25)
            for d, p in samples:
                profile.append([round(dist0 + d, 3), round(elev(p)), 1 if mode == 'walk' else 0, round(p[0], 5), round(p[1], 5)])
            dist0 += length
            marks.append(round(dist0, 3))
            tol = 0.00003 if mode == 'walk' else 0.00015
            legs.append({
                'from': a['id'], 'to': b['id'], 'mode': mode,
                'km': round(km, 2), 'min': round(minutes),
                'coords': [[round(p[0], 5), round(p[1], 5)] for p in simplify(pts, tol)],
            })
        up = down = 0.0
        for (d1, e1, w1, *_), (d2, e2, w2, *_) in zip(profile, profile[1:]):
            if w2:
                diff = e2 - e1
                up += max(0, diff); down += max(0, -diff)
        elevs = [p[1] for p in profile]
        out[r['id']] = {
            'legs': legs,
            'profile': profile,
            'marks': marks,
            'stationElev': [round(elev(s['at'])) for s in st],
            'totals': {
                'walkKm': round(sum(l['km'] for l in legs if l['mode'] == 'walk'), 1),
                'driveKm': round(sum(l['km'] for l in legs if l['mode'] == 'drive'), 1),
                'walkMin': sum(l['min'] for l in legs if l['mode'] == 'walk'),
                'driveMin': sum(l['min'] for l in legs if l['mode'] == 'drive'),
                'ascent': round(up), 'descent': round(down),
                'min': min(elevs), 'max': max(elevs),
            },
        }
        t = out[r['id']]['totals']
        print(f"{r['id']}: walk {t['walkKm']} km, drive {t['driveKm']} km, +{t['ascent']} -{t['descent']} m, {t['min']}..{t['max']} m, points {sum(len(l['coords']) for l in legs)}")
    with open(os.path.join(ROOT, 'src', 'data', 'trails.json'), 'w', encoding='utf8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()
