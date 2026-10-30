"""משווה את מיקום כל תחנה לתוצאת Nominatim (OSM) ומדפיס סטייה בק"מ."""
import json, math, subprocess, sys, time, urllib.parse, urllib.request, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = {  # שאילתות מדויקות כשהשם בתחנה מורכב
 'azeka':['תל עזקה'], 'qeiyafa':['חורבת קייאפה','Khirbet Qeiyafa'], 'nahal':['נחל האלה'], 'socho':['תל שוכה','חורבת שוכה','Socho'],
 'gat-elah':['תל צפית','Tel Tzafit'], 'afek':['תל אפק','מבצר אנטיפטריס','Antipatris'], 'ashdod':['תל אשדוד','Tel Ashdod'],
 'gat-ark':['תל צפית'], 'ekron':['תל מקנה','Tel Miqne'], 'beitshemesh':['תל בית שמש'], 'kiryatyearim':['Notre Dame de l\'Arche d\'Alliance','כנסיית נוטרדאם ארון הברית','דיר אל עזהר'],
 'nebisamuel':['נבי סמואל','Nabi Samwil'], 'bethoron':['בית חורון'], 'canada':['פארק קנדה'], 'latrun':['יד לשריון','לטרון'],
 'kedesh':['תל קדש'], 'tabor':['הר תבור'], 'megiddo':['תל מגידו'], 'kishon-d':['תל קשיש','Tel Qashish'],
 'shunem':['סולם'], 'harod':['מעיין חרוד','גן לאומי מעיין חרוד'], 'eindor':['עין דור'], 'gilboa':['הר שאול'], 'beitshean':['תל בית שאן'],
 'muhraka':['המוחרקה','Muhraqa'], 'kishon-e':['נחל הקישון יקנעם','נחל הקישון'], 'jezreel':['תל יזרעאל'], 'naboth':['עין יזרעאל','מעיין יזרעאל'],
 'sodom-top':['הר סדום'], 'malham':['מערת מלחם','Malham Cave'], 'lotswife':['אשת לוט'], 'zoar':['נאות הכיכר'],
 'tzora':['תל צרעה','צרעה'], 'timna':['תל בטש','Tel Batash'], 'sorek':['נחל שורק'], 'manoah':['קבר שמשון','Tomb of Samson'],
}
def hav(a,b):
    la1,lo1,la2,lo2=map(math.radians,(a[0],a[1],b[0],b[1]))
    h=math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 12742*math.asin(math.sqrt(h))
routes=json.loads(subprocess.check_output(['node','-e',"import('./src/data/routes.js').then(m=>console.log(JSON.stringify(m.ROUTES.flatMap(r=>r.stations.map(s=>({id:s.id,at:s.at}))))))"],cwd=ROOT))
ONLY=sys.argv[1:]
for s in routes:
    if ONLY and s['id'] not in ONLY: continue
    best=None
    for q in Q.get(s['id'],[]):
        u='https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=il,ps&q='+urllib.parse.quote(q)
        for k in range(4):
            try:
                res=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'MasluleiTanach/1.0'}),timeout=30)); break
            except Exception:
                time.sleep(20*(k+1)); res=[]
        time.sleep(2.5)
        for d in res:
            p=(float(d['lat']),float(d['lon'])); km=hav(p,s['at'])
            if best is None or km<best[0]: best=(km,p,d['type'],d['display_name'][:50],q)
        if best and best[0]<0.5: break
    if best: print(f"{s['id']:13} {best[0]:6.2f} km  {best[1][0]:.5f},{best[1][1]:.5f} {best[2]:10} {best[3]}")
    else: print(f"{s['id']:13}   none")
