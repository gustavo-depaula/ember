"""Build Bernard's De diligendo Deo: Latin (CC / Migne PL 182) and Patmore's English (separate book).
usage: python3 -I bernard_diligendo.py   (from repo root)"""
import re, json, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections, roman

ROOT = Path('content/books/bernard-opera-omnia')
SRC = Path('research/sourcing/bernard-of-clairvaux')
WORDS = set(w.strip().lower() for w in open('/usr/share/dict/words', encoding='utf-8', errors='replace'))
AUTHOR = {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'}

def write(p, t):
    p.parent.mkdir(parents=True, exist_ok=True); p.write_text(t, encoding='utf-8')

def unitalic(p):
    return p[1:-1] if p.startswith('*') and p.endswith('*') and p.count('*') == 2 else p

def latin():
    secs = cc_sections(SRC / 'cc/diligendo.xml')
    chaps = []  # (id, title, paras)
    cur = None
    for s in secs:
        h = s['head']
        if re.match(r'ADMONITIO', h):
            cur = ('admonitio', 'Admonitio Mabillonii', []); chaps.append(cur)
        elif re.match(r'PRAEFATIO', h):
            cur = ('praefatio', 'Praefatio', []); chaps.append(cur)
        elif h.startswith('CAPUT'):
            m = re.match(r'CAPUT ([IVXL]+)\.\s*\*?(.*?)\*?\s*$', h)
            n = len(chaps) - 1  # admonitio + praefatio precede
            cur = ('c%02d' % n, 'Caput %s. %s' % (m.group(1), m.group(2).strip().rstrip('.')), []); chaps.append(cur)
            assert roman(n) == m.group(1), (n, h)
        cur[2].extend(s['paras'])
    out = []
    for cid, t, ps in chaps:
        if cid == 'admonitio': ps = [unitalic(p) for p in ps]
        out.append((cid, t, ps))
    return out

# ---------------------------------------------------------------- English (Patmore)
# Base text: archive.org saintbernardlove00bernuoft (cleaner OCR, but it lost the end-of-line hyphens);
# the hyphen-preserving scan OnTheLoveOfGod tells us where words were split across lines.
def hyphen_pairs():
    t = (SRC / 'ia/OnTheLoveOfGod_djvu.txt').read_text(encoding='utf-8')
    return set((a.lower(), b.lower()) for a, b in re.findall(r'(\w+)-[ \t]*\n+(?:[^\n\w]*\n)*[ \t]*(\w+)', t))

def en_lines():
    L = (SRC / 'ia/saintbernardlove00bernuoft_djvu.txt').read_text(encoding='utf-8').split('\n')[141:1555]
    keep = []
    for ln in L:
        t = ln.strip()
        if t and (len(t) < 28 and re.search(r'LOVE\s+OF\s+GOD', t) or re.match(r'^\d{1,3}$|^[^\w]*$', t)): continue
        keep.append(re.sub(r'\s+', ' ', t))
    return keep

def join_pairs(lines):
    P = hyphen_pairs()
    out = []
    for ln in lines:
        if out and ln and out[-1]:
            a = re.search(r'(\w+)$', out[-1]); b = re.match(r'(\w+)', ln)
            if a and b and (a.group(1).lower(), b.group(1).lower()) in P:
                w = a.group(1) + b.group(1)
                out[-1] = out[-1][:a.start()] + (w if w.lower() in WORDS or a.group(1).lower() in ('un','sur','presump') else a.group(1) + '-') + ln[b.start():].replace(b.group(1), '', 1) if False else out[-1][:a.start()] + (w if w.lower() in WORDS or True else a.group(1) + '-' + b.group(1)) + ln[b.end():]
                continue
        out.append(ln)
    return out

def english():
    L = join_pairs(en_lines())
    chaps, cur = [], None
    i = 0
    while i < len(L):
        t = L[i].strip()
        m = re.match(r'^CHAPTER ([IVXL]+)\.?$', t)
        if m:
            j = i + 1
            while not L[j].strip(): j += 1
            title = []
            while L[j].strip(): title.append(L[j].strip()); j += 1
            cur = {'n': m.group(1), 'title': ' '.join(title), 'lines': []}; chaps.append(cur); i = j; continue
        if cur is not None: cur['lines'].append(L[i])
        i += 1
    res = []
    for c in chaps:
        txt = '\n'.join(c['lines'])
        blocks = [re.sub(r'\s+', ' ', b).strip() for b in re.split(r'\n\s*\n', txt)]
        blocks = [b for b in blocks if b]
        paras = []
        for b in blocks:
            if paras and (b[0].islower() or paras[-1][-1] not in '.!?:;"”\')'):
                paras[-1] += ' ' + b
            else: paras.append(b)
        res.append((c['n'], c['title'], paras))
    return res

CAPS = {'god': 'God', 'him': 'Him', 'his': 'His', 'he': 'He', 'christ': 'Christ', 'lord': 'Lord', 'spirit': 'Spirit', 'holy': 'Holy',
        'son': 'Son', 'bernard': 'Bernard', 'jesus': 'Jesus', 'father': 'Father', 'thee': 'Thee', 'thou': 'Thou', 'thy': 'Thy', 'me': 'Me',
        'paul': 'Paul', 'john': 'John', 'bridegroom': 'Bridegroom', 'saint': 'Saint', 'creator': 'Creator', 'word': 'Word',
        'church': 'Church', 'david': 'David', 'solomon': 'Solomon', 'lamb': 'Lamb', 'truth': 'Truth', 'apostle': 'Apostle', 'redeemer': 'Redeemer', 'christians': 'Christians', 'christian': 'Christian'}

def sentence_case(t):
    t = t.lower()
    t = re.sub(r"\b[a-z]+\b", lambda m: CAPS.get(m.group(0), m.group(0)), t)
    return re.sub(r'(^|[.:?!] )([a-z])', lambda m: m.group(1) + m.group(2).upper(), t)

def tidy(p):
    p = re.sub(r'(\w)- (\w)', lambda m: (m.group(1) + m.group(2)) if (m.group(1) + m.group(2)).lower() in WORDS or m.group(1).lower() in ('quick', 'can') else m.group(1) + '-' + m.group(2), p)
    p = re.sub(r'^([A-Z]{2,})\b', lambda m: m.group(1).capitalize(), p)
    p = re.sub(r'\s+([;:,.!?])', r'\1', p)
    for a, b in (('our-selves', 'ourselves'), ('can-not', 'cannot'), ('quick-eneth', 'quickeneth')): p = p.replace(a, b)
    return p.replace('--', '—')

LA_DESC = 'Libellus Bernardi ad Haimericum cardinalem, de causa et modo diligendi Deum et de quattuor gradibus amoris: «causa diligendi Deum, Deus est; modus, sine modo diligere». Textus ex editione Migne (Patrologia Latina 182, 1854), cum Admonitione Mabillonii.'
EN_DESC = 'Bernard’s little treatise for Cardinal Haimeric on why and how God is to be loved, and the four degrees of love: “the reason for loving God is God; the measure, to love without measure.” The Latin is the Maurist text in Migne (Patrologia Latina 182, 1854), from a machine-corrected OCR, with Mabillon’s Admonitio, the preface and all fifteen chapters. The English is Marianne Caroline and Coventry Patmore’s 1881 translation, which renders chapters I to XI (the treatise proper) and not the Latin’s closing chapters XII to XV, drawn from the letter to the Carthusians; the Admonitio and the preface to Haimeric are untranslated.'
PT_DESC = 'O pequeno tratado de Bernardo ao cardeal Haimerico sobre por que e como se deve amar a Deus, e sobre os quatro graus do amor: «a razão de amar a Deus é Deus; a medida, amar sem medida».'

def main():
    d = ROOT / 'de-diligendo-deo'
    lat = latin()
    toc = []
    en = english()
    assert len(en) == 11
    for cid, t, ps in lat:
        write(d / 'la' / (cid + '.md'), '# %s\n\n%s\n' % (t, '\n\n'.join(ps)))
        toc.append({'id': cid, 'title': {'la': t}})
    byid = {t['id']: t for t in toc}
    for n, (rn, t, ps) in enumerate(en, 1):
        cid = 'c%02d' % n
        assert rn == roman(n)
        title = 'Chapter %s. %s' % (rn, tidy(sentence_case(t)).rstrip('.'))
        write(d / 'en-US' / (cid + '.md'), '# %s\n\n%s\n' % (title, '\n\n'.join(tidy(p) for p in ps)))
        byid[cid]['title']['en-US'] = title
    write(d / 'sources/latin-originals/de-diligendo-deo.xml', (SRC / 'cc/diligendo.xml').read_text(encoding='utf-8'))
    ia = SRC / 'ia/saintbernardlove00bernuoft_djvu.txt'
    write(d / 'sources/english-originals/de-diligendo-deo.txt', '\n'.join(ia.read_text(encoding='utf-8').split('\n')[141:1555]) + '\n')
    meta = {'id': 'bernard-de-diligendo-deo', 'cover': 'classic',
            'name': {'la': 'De diligendo Deo', 'en-US': 'On Loving God', 'pt-BR': 'Sobre o amor a Deus'},
            'author': AUTHOR,
            'description': {'la': LA_DESC, 'en-US': EN_DESC, 'pt-BR': PT_DESC},
            'composed': 'c. 1126-1141', 'languages': ['la', 'en-US'], 'work': 'bernard/de-diligendo-deo',
            'editions': {'la': {'editor': 'Jean Mabillon, in J.-P. Migne (Patrologia Latina 182)', 'year': 1854},
                         'en-US': {'translator': 'Marianne Caroline and Coventry Patmore', 'year': 1881}},
            'sources': [
              {'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=11196',
               'edition': 'S. Bernardi Claraevallensis abbatis opera omnia, ed. J. Mabillon, in Migne, Patrologia Latina 182 (Paris 1854), De diligendo Deo with Mabillon’s Admonitio; TEI XML of the Corpus Corporum (University of Zurich), text 11196, from machine-corrected OCR.',
               'description': 'The complete text: Admonitio, preface and chapters I to XV with Mabillon’s chapter headings. PL page breaks and column numbers are dropped, and so are the paragraph numbers; Scripture references stay in parentheses as printed. The Admonitio is Mabillon’s own note and is kept.',
               'tier': 'A', 'tierEvidence': 'Bernard died in 1153; Migne’s 1854 printing is public domain everywhere.'},
              {'language': 'en-US', 'url': 'https://archive.org/details/saintbernardlove00bernuoft',
               'edition': 'Saint Bernard on the Love of God, translated by Marianne Caroline and Coventry Patmore (London: Burns & Oates, 2nd ed. 1884; first published Kegan Paul, 1881). Internet Archive OCR (saintbernardlove00bernuoft), with line-end hyphens restored from the second scan, https://archive.org/details/OnTheLoveOfGod.',
               'description': 'Chapters I to XI only. The “Fragments from a fragment” and the Three Rosaries of Our Lady that follow in the volume are not imported. OCR running heads and page numbers are removed; chapter titles are set in sentence case.',
               'tier': 'A', 'tierEvidence': 'Published in London in 1881 and 1884; Coventry Patmore died in 1896 and Marianne in 1880s: public domain everywhere.'}],
            'toc': toc}
    write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
