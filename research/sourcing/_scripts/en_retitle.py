"""usage: en_retitle.py BOOKDIR MAP.json  -- map {toc-id: new title}; rewrites book.json titles and the H1 of the matching chapter file (lang en-US)"""
import sys, json, re, os
d = sys.argv[1]; m = json.load(open(sys.argv[2])); lang = sys.argv[3] if len(sys.argv) > 3 else 'en-US'
b = json.load(open(d + '/book.json'))
def walk(ns):
    for n in ns:
        if n['id'] in m:
            n['title'][lang] = m[n['id']]
            f = '%s/%s/%s.md' % (d, lang, n['id'])
            if os.path.exists(f):
                s = open(f).read(); s = re.sub(r'\A# .*', '# ' + m[n['id']], s); open(f, 'w').write(s)
            elif n.get('children') is None: print('nofile', n['id'])
        walk(n.get('children', []))
walk(b['toc'])
json.dump(b, open(d + '/book.json', 'w'), ensure_ascii=False, indent=2); open(d + '/book.json', 'a').write('\n')
