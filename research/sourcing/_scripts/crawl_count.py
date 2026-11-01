"""Crawl a site subtree from index pages and count words of the body text per work.
usage: crawl_count.py OUTDIR BASEURL work1/index.html work2/index.html ...
Follows only links that stay under the index's directory. Saves raw html into OUTDIR."""
import sys, re, html, os, urllib.request, urllib.parse, hashlib, json
from concurrent.futures import ThreadPoolExecutor
out, base, works = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out, exist_ok=True)
def get(url):
    fn = os.path.join(out, hashlib.md5(url.encode()).hexdigest() + '.html')
    if os.path.exists(fn):
        return open(fn, encoding='latin-1').read()
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (research)'})
        data = urllib.request.urlopen(req, timeout=60).read()
    except Exception as e:
        print('ERR', url, e, file=sys.stderr); return ''
    open(fn, 'wb').write(data)
    return data.decode('latin-1')
def words(s):
    s = re.sub(r'(?is)<(script|style|head)[^>]*>.*?</\1>', ' ', s)
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    return len(re.findall(r"[A-Za-zÀ-ɏ]+", s))
res = {}
def crawl(w):
    start = urllib.parse.urljoin(base, w)
    d = start.rsplit('/', 1)[0] + '/'
    if not w.endswith('index.html'):
        return w, 1, words(get(start))
    seen, todo, total, pages = set(), [start], 0, 0
    while todo:
        u = todo.pop()
        if u in seen: continue
        seen.add(u)
        s = get(u)
        if u != start:
            total += words(s); pages += 1
        for h in re.findall(r'href="([^"#]+)', s):
            v = urllib.parse.urljoin(u, h)
            if v.startswith(d) and v.endswith(('.html', '.htm')) and v not in seen:
                todo.append(v)
    if pages == 0:
        total = words(get(start)); pages = 1
    return w, pages, total
with ThreadPoolExecutor(6) as ex:
    for w, p, t in ex.map(crawl, works):
        print(f'{w}\t{p}\t{t}', flush=True)
