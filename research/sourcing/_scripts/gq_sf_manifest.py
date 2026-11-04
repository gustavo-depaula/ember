import json, urllib.request, re, html, time, os
UA = {'User-Agent': 'EmberCorpusResearch/1.0'}
OUT = '/Users/gustavo/Documents/prayer/research/sourcing/gueranger/sf/'
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
kids = get('https://sensusfidelium.com/wp-json/wp/v2/pages?parent=7915&per_page=100&_fields=id,slug')
man = {}
for k in kids:
    if k['slug'] == 'april-2': continue
    p = get(f"https://sensusfidelium.com/wp-json/wp/v2/pages/{k['id']}?_fields=id,content,link,slug")
    seen = []; 
    for h, x in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', p['content']['rendered'], re.S):
        t = html.unescape(re.sub(r'<[^>]+>', '', x)).strip()
        if 'the-liturgical-year-dom-prosper-gueranger/' not in h or t in ('Mass', 'Vespers'): continue
        if h not in [s[0] for s in seen]: seen.append((h, t))
    man[k['slug']] = seen
    time.sleep(.5)
json.dump(man, open(OUT + 'manifest.json', 'w'), ensure_ascii=False, indent=0)
for s, l in man.items(): print(s, len(l), l[0][1][:30], '|', l[-1][1][:40])
print(sum(len(l) for l in man.values()))
