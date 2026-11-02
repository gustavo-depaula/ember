"""Fetch rendered Wikisource pages: fmc_ws_fetch.py OUTDIR TITLE [TITLE...] -> OUTDIR/<slug>.html (parse API)"""
import sys, os, re, json, time, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for t in sys.argv[2:]:
    u = 'https://en.wikisource.org/w/api.php?' + urllib.parse.urlencode({'action': 'parse', 'page': t, 'prop': 'text', 'format': 'json', 'disableeditsection': 1})
    r = urllib.request.Request(u, headers={'User-Agent': 'EmberCorpusResearch/1.0'})
    h = json.load(urllib.request.urlopen(r, timeout=60))['parse']['text']['*']
    open(os.path.join(out, re.sub(r'[^A-Za-z0-9]+', '_', t) + '.html'), 'w').write(h); time.sleep(0.7)
