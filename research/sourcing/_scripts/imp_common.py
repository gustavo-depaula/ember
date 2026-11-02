"""Shared helpers for the Gregory/Bede completion imports (wikitext -> md, book.json)."""
import re, json, os
ROOT = '/Users/gustavo/Documents/prayer/'
ROM = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
       'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL']

def strip_wiki(t):
    t = re.sub(r'\{\{titulus2.*?\}\}', '', t, flags=re.S)
    t = re.sub(r'\{\{Liber.*?\}\}', '', t, flags=re.S)
    t = re.sub(r'\{\{(finis|Finis)\}\}', '', t)
    t = re.sub(r'__NOTOC__|</?div[^>]*>|<br\s*/?>', '', t)
    t = re.sub(r'<ref[^>]*>.*?</ref>', '', t, flags=re.S)
    t = re.sub(r"'''?", '', t)
    t = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', t)
    return t

def paras(t):
    out = []
    for p in re.split(r'\n\s*\n', t):
        p = re.sub(r'\s+', ' ', p).strip()
        if p:
            out.append(p)
    return out

def words(md):
    return len(md.split())

def write_book(d, book, chapters, raw=None, rawname=None, rawlang='la'):
    """chapters: {lang: {id: md}}; toc built by caller in book['toc']."""
    os.makedirs(d, exist_ok=True)
    for lang, chs in chapters.items():
        os.makedirs(f'{d}/{lang}', exist_ok=True)
        for cid, md in chs.items():
            open(f'{d}/{lang}/{cid}.md', 'w').write(md.rstrip() + '\n')
    if raw:
        rd = f'{d}/sources/{rawlang}-originals'
        os.makedirs(rd, exist_ok=True)
        open(f'{rd}/{rawname}.txt', 'w').write(raw)
    with open(f'{d}/book.json', 'w') as f:
        json.dump(book, f, ensure_ascii=False, indent=2); f.write('\n')

def gregory_author(la_sub=None):
    return {"la": "Gregorius Magnus, Papa (c. 540-604)", "en-US": "Gregory the Great, Pope (c. 540-604)", "pt-BR": "São Gregório Magno, Papa (c. 540-604)"}

START = re.compile(r'^(:|\d+\.(\s|$)|(EZECH|IBID|VERS|Ibid|Vers)\b[^\n]{0,30}---)')
def paras2(t):
    """Paragraphs of wrapped verse-style wikitext: blank lines, ':' lines, 'N.' numbering and lemma lines start a new one."""
    out = []; cur = []
    def flush():
        p = re.sub(r'\s+', ' ', ' '.join(cur)).strip()
        if p: out.append(p)
        cur.clear()
    for line in t.split('\n'):
        s = line.strip()
        if not s:
            flush(); continue
        if START.match(s): flush()
        cur.append(s.lstrip(':').strip())
    flush()
    return out

def roman(n):
    out = ''
    for v, s in [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: out += s; n -= v
    return out
