"""Denzinger 1911: fixed entries -> content/books/denzinger-enchiridion (la).
usage: denz_write.py <_fixed.json> <book-dir>"""
import json, re, sys, pathlib

a = json.load(open(sys.argv[1]))
book = pathlib.Path(sys.argv[2])
E = a['entries']

def tidy(t):
    t = re.sub(r'\(\s*[\d*^ilIO]{2,5}\s*\)', ' ', t)               # Stahl's older numbers
    t = re.sub(r'(?<=[A-Za-z-])\s?[il]?\d{2,4}(?=[\s,.;:)\]]|$)', ' ', t)   # cross-reference numbers fused to words
    t = re.sub(r'^(\*?\d{1,4}\s+)+(?=[A-Za-zÀ-ÿ«\[])', '', t)
    t = re.sub(r'(\w)- (?=[a-zæœ])', r'\1', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t
LAT = re.compile(r'\b(et|in|est|quod|ad|de|non|cum|ut|qui|quae|sit|sunt|per|ex|si|quis|esse|eius|Deus|Dei)\b')
def latin_ok(t): return len(LAT.findall(t)) >= 2
for e in E: e['text'] = tidy(e['text']) if e.get('src') != 'catho' and e.get('src') != 'catho-unconfirmed' else re.sub(r'\s+', ' ', e['text']).strip()
E = [e for e in E if e['d'] >= 48 and latin_ok(e['text'])]

GREEKTOK = re.compile(r"[|<>^~{}¡]|[a-z]{1,3}[A-Z]{2,}|[A-Z]{2,}[a-z]+[A-Z]|[a-z][A-Z][a-z]|\\|^[A-Z][a-z]?[A-Z]{2,}[a-z]*$")
def degreek(t):
    toks = t.split()
    flagged = [bool(GREEKTOK.search(k)) and not re.fullmatch(r"[A-Z]{2,}[.,;:]?", k) for k in toks]
    return ' '.join(k for k, f in zip(toks, flagged) if not f)
for e in E:
    if e.get('src') == 'ocr': e['text'] = degreek(e['text'])
heads = {int(k): v for k, v in json.load(open(sys.argv[3])).items()} if len(sys.argv) > 3 else {}
def head(p):
    ks = [k for k in heads if k <= p]
    h = heads[max(ks)] if ks else ''
    h = re.sub(r'^\d{1,3}\s+|\s+\d{1,3}$|\.$', '', h.replace('Conc. ', 'Conc. ')).strip(' .,')
    return re.sub(r'\s+', ' ', h)
parts = []
B = 40
for i in range(0, len(E), B):
    es = E[i:i + B]
    h0, h1 = head(es[0]['p']), head(es[-1]['p'])
    h = h0 if h0 == h1 or not h1 else f'{h0} … {h1}'
    parts.append((f'D {es[0]["d"]}–{es[-1]["d"]}' + (f' ({h})' if h else ''), es))
la = book / 'la'; la.mkdir(parents=True, exist_ok=True)
toc = []
for n, (title, es) in enumerate(parts, 1):
    cid = f'ch{n:03d}'
    body = '\n\n'.join(f'**{e["d"]}.** {e["text"]}' for e in es)
    (la / f'{cid}.md').write_text(f'# {title}\n\n{body}\n')
    toc.append({'id': cid, 'title': {'la': title}})
(book / 'toc.json').write_text(json.dumps(toc, ensure_ascii=False, indent=1))
print(len(parts), 'chapters', sum(len(e['text'].split()) for e in E), 'words', len(E), 'entries')
