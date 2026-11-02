"""Fetch Corpus Corporum TEI for the given work ids of a PL author.
usage: cc_fetch_works.py <author-id> <outdir> <work-id>...   -> <outdir>/w<id>.xml, prints id, text id, title, words"""
import re, sys, time, urllib.request
from pathlib import Path
UA = {'User-Agent': 'EmberCorpusResearch/1.0'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read().decode('utf-8')
a, out = sys.argv[1], Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
for w in sys.argv[3:]:
    p = out / ('w%s.xml' % w)
    nav = get('https://mlat.uzh.ch/php_modules/navigate.php?load=/38/%s/%s' % (a, w))
    name = re.search(r'type="work"[^>]*>([^<]*)</path_step>', nav).group(1)
    tid = re.search(r'<text type="text">.*?<idno>(\d+)</idno>', nav, re.S).group(1)
    if not p.exists():
        p.write_text(get('https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=%s' % tid), encoding='utf-8')
        time.sleep(1)
    print(w, tid, name, len(re.sub(r'<[^>]+>', ' ', p.read_text()).split()))
