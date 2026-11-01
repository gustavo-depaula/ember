"""Download archive.org full text (_djvu.txt) for identifiers and report words + OCR quality.
usage: ia_count.py OUTDIR id1 id2 ...  (quality = share of lowercase alphabetic tokens found in /usr/share/dict/words)"""
import sys, os, re, json, urllib.request
from concurrent.futures import ThreadPoolExecutor
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
dic = set(w.strip().lower() for w in open('/usr/share/dict/words'))
def one(i):
    fn = os.path.join(out, i + '_djvu.txt')
    if not os.path.exists(fn):
        try:
            md = json.load(urllib.request.urlopen(f'https://archive.org/metadata/{i}', timeout=60))
            f = [x['name'] for x in md.get('files', []) if x['name'].endswith('_djvu.txt')]
            if not f: return i, 0, 0, 'no djvu.txt'
            data = urllib.request.urlopen(f'https://archive.org/download/{i}/{urllib.parse.quote(f[0])}', timeout=120).read()
            open(fn, 'wb').write(data)
        except Exception as e:
            return i, 0, 0, f'ERR {e}'
    t = open(fn, encoding='utf-8', errors='replace').read()
    toks = re.findall(r"[A-Za-z]+", t)
    low = [w for w in toks if w.islower() and len(w) > 2]
    q = sum(1 for w in low if w in dic or w.rstrip('s') in dic or w[:-2] in dic or w[:-1] in dic) / max(1, len(low))
    return i, len(t.split()), round(q, 3), ''
import urllib.parse
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(one, sys.argv[2:]):
        print('\t'.join(map(str, r)), flush=True)
