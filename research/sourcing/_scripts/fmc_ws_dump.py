"""fmc_ws_dump.py OUTDIR PREFIX : fetch every Wikisource page under PREFIX (parse API, slow and polite)."""
import re, os, sys, json, time, urllib.request, urllib.parse
out, prefix = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
def api(**kw):
    for k in range(7):
        try:
            r = urllib.request.Request('https://en.wikisource.org/w/api.php?' + urllib.parse.urlencode(dict(format='json', **kw)), headers={'User-Agent': 'EmberCorpusResearch/1.0'})
            return json.load(urllib.request.urlopen(r, timeout=60))
        except Exception: time.sleep(8 * (k + 1))
titles = [p['title'] for p in api(action='query', list='allpages', apprefix=prefix, aplimit=200)['query']['allpages']]
json.dump(titles, open(out + '/_titles.json', 'w'))
for t in titles:
    fn = out + '/' + re.sub(r'[^A-Za-z0-9]+', '_', t) + '.html'
    if os.path.exists(fn) and os.path.getsize(fn) > 300: continue
    d = api(action='parse', page=t, prop='text', disableeditsection=1)
    if d: open(fn, 'w').write(d['parse']['text']['*'])
    time.sleep(2.5)
print(len(titles), 'pages')
