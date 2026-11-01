"""Check English Wikisource pages: word count of the page and its subpages. usage: ws_check.py 'Title' ..."""
import sys, json, re, html, time, urllib.request, urllib.parse
def parse(p):
    u = 'https://en.wikisource.org/w/api.php?' + urllib.parse.urlencode({'action': 'parse', 'page': p, 'prop': 'links|text', 'format': 'json', 'redirects': 1})
    req = urllib.request.Request(u, headers={'User-Agent': 'EmberSourcingResearch/0.1 (ai@example.org)'})
    for _ in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            time.sleep(5)
    return {'error': 1}
for p in sys.argv[1:]:
    d = parse(p)
    if 'error' in d: print(p, 'ERR'); continue
    d = d['parse']; title = d['title']
    words = lambda d: len(html.unescape(re.sub(r'<[^>]+>', ' ', d['text']['*'])).split())
    subs = sorted({l['*'] for l in d['links'] if l['ns'] == 0 and l['*'].startswith(title + '/')})
    total = words(d)
    for s in subs:
        time.sleep(0.5); e = parse(s)
        if 'error' not in e: total += words(e['parse'])
    print(f'{p}\tsubpages={len(subs)}\twords={total}', flush=True)
