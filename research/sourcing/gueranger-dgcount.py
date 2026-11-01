import json,re,html,sys,glob
cats={c['id']:c['name'] for c in json.load(open(sys.argv[1]+'/cats.json'))}
rows=[]
for f in sorted(glob.glob(sys.argv[1]+'/posts-*.json')):
    try: d=json.load(open(f))
    except Exception: continue
    if not isinstance(d,list): continue
    for p in d:
        s=p['content']['rendered']; w=len(html.unescape(re.sub(r'<[^>]+>',' ',s)).split())
        rows.append((','.join(cats.get(c,'?') for c in p['categories'])[:30],p['slug'][:75],w,html.unescape(p['title']['rendered'])[:80]))
tot=0
for r in sorted(rows): tot+=r[2]; print(f"{r[2]:>7} | {r[0]:30} | {r[1]:75} | {r[3]}")
print('TOTAL',tot,len(rows))
