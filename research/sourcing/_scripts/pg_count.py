"""Download Project Gutenberg plain texts and count words between the START/END markers.
usage: pg_count.py OUTDIR id1 id2 ..."""
import sys, os, re, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for i in sys.argv[2:]:
    fn = os.path.join(out, f'pg{i}.txt')
    if not os.path.exists(fn):
        try:
            data = urllib.request.urlopen(f'https://www.gutenberg.org/cache/epub/{i}/pg{i}.txt', timeout=120).read()
            open(fn, 'wb').write(data)
        except Exception as e:
            print(i, 'ERR', e); continue
    t = open(fn, encoding='utf-8', errors='replace').read()
    m = re.search(r'\*\*\* ?START OF.*?\*\*\*(.*)\*\*\* ?END OF', t, re.S)
    body = m.group(1) if m else t
    title = re.search(r'Title: (.*)', t)
    print(i, len(body.split()), title.group(1).strip() if title else '', sep='\t', flush=True)
