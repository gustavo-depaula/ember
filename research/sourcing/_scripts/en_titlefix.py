"""usage: en_titlefix.py BOOKDIR [lang] -- title-case shouted/mixed-caps chapter titles in book.json and their H1s (after the first '. ')"""
import sys, json, re
d = sys.argv[1]; lang = sys.argv[2] if len(sys.argv) > 2 else 'en-US'
SM = {'of','the','and','in','to','a','an','by','for','on','with','from','at','or','as','is','his','her','de','du','des','la','le','d'}
def tc(t):
    ws = t.lower().split(' ')
    return ' '.join(w if (i and w in SM) else re.sub(r"^([^\w]*)(\w)", lambda m: m.group(1)+m.group(2).upper(), w) for i, w in enumerate(ws))
def fix(t):
    m = re.match(r'^((?:Letter|Chapter|Dialogue|Fable|Book|Part) [IVXLC0-9]+\. )(.*)$', t)
    pre, rest = (m.group(1), m.group(2)) if m else ('', t)
    if len(re.findall(r'\b[A-Z]{3,}\b', rest)) == 0: return t
    rest = re.sub(r'(?<=[a-z])-\s+(?=[A-Za-z])', '-', rest)
    rest = re.sub(r"\bFl([lL])", 'Fi\\1', rest)
    return pre + tc(rest)
b = json.load(open(d + '/book.json'))
def walk(ns):
    for n in ns:
        t = n['title'].get(lang)
        if t:
            nt = fix(t)
            if nt != t:
                n['title'][lang] = nt
                f = '%s/%s/%s.md' % (d, lang, n['id'])
                try:
                    s = open(f).read(); open(f, 'w').write(re.sub(r'\A# .*', lambda _: '# ' + nt, s))
                except FileNotFoundError: pass
        walk(n.get('children', []))
walk(b['toc'])
json.dump(b, open(d + '/book.json', 'w'), ensure_ascii=False, indent=2); open(d + '/book.json', 'a').write('\n')
