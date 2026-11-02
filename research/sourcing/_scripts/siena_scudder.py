import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/catherine-of-siena/raw/scudder-gut7403.txt'
L = open(RAW).read().split('\n')
def paras(lines):
    out = []; cur = []
    for l in lines:
        s = l.rstrip()
        if not s.strip():
            if cur: out.append(' '.join(cur)); cur = []
            continue
        if s.startswith('[Illustration'): continue
        cur.append(s.strip())
    if cur: out.append(' '.join(cur))
    out = [re.sub(r'\b_([^_]+?)_\b', r'*\1*', p) for p in out]
    out = [re.sub(r'_([^_]+?)_', r'*\1*', p) for p in out]
    return [p for p in out if not re.fullmatch(r'\d+', p)]
def tc(t):
    small = {'of', 'the', 'and', 'in', 'to', 'at', 'a', 'di', 'del', 'dei', 'della', 'by', 'with', 'who', 'was', 'when', 'for', 'on', 'from', 'her'}
    words = t.lower().split()
    return ' '.join(w if (i and w in small) else (w[0].upper() + w[1:] if w[0].isalpha() else w) for i, w in enumerate(words)).replace("'S", "'s").replace(' Xi', ' XI').replace(' Vi', ' VI').replace('Gregory Xi','Gregory XI')
start = next(i for i in range(200, 260) if L[i].startswith('ST. CATHERINE OF SIENA AS SEEN')) + 1
iEv = next(i for i in range(600, 800) if L[i].startswith('CHIEF EVENTS IN THE LIFE'))
iCont = next(i for i in range(iEv, 900) if L[i].startswith('BRIEF TABLE OF CONTEMPORARY'))
iLet = next(i for i in range(880, 920) if L[i].strip() == 'LETTERS')
end = next(i for i, l in enumerate(L) if 'END OF THE PROJECT GUTENBERG' in l)
heads = [i for i in range(iLet, end) if re.match(r"^(TO|LETTERS)\b[A-Z ,'.-]*$", L[i]) and L[i-1] == '' and L[i-2] == '' and len(L[i]) > 8 and L[i] == L[i].upper() and not (L[i-3].strip() and L[i-3].upper() == L[i-3] and L[i-3].startswith('TO'))]
# merge multi-line TO headings
hs = []
for i in heads:
    j = i; t = L[i].strip()
    while L[j + 1].strip():  # heading continues on following line(s)
        j += 1; t += ' ' + L[j].strip()
    hs.append((i, j, t))
ch = [('introduction', {'en-US': ('Introduction', '\n\n'.join(paras(L[start:iEv])))}), ('chronology', {'en-US': ('Chief events in the life of Saint Catherine, and contemporary public events', '\n\n'.join(paras(L[iEv:iLet])))})]
sec = None; n = 0
lets = []
for k, (i, j, t) in enumerate(hs):
    e = hs[k + 1][0] if k + 1 < len(hs) else end
    if t.startswith('LETTERS'):
        sec = (tc(t), paras(L[j + 1:e])); continue
    n += 1
    body = paras(L[j + 1:e])
    pre = ''
    if sec: pre = '## ' + sec[0] + '\n\n' + '\n\n'.join(sec[1]) + '\n\n'; sec = None
    ch.append(('l%02d' % n, {'en-US': ('Letter %d. %s' % (n, tc(t)), pre + '\n\n'.join(body))}))
print(n)
META = {'id': 'catherine-lettere-scudder', 'cover': 'classic',
 'name': {'en-US': 'Saint Catherine of Siena as Seen in Her Letters', 'it': 'Santa Caterina da Siena nelle sue lettere (scelta inglese di Scudder)', 'pt-BR': 'Santa Catarina de Sena em suas cartas (seleção inglesa de Scudder)'},
 'author': {'it': 'Santa Caterina da Siena', 'en-US': 'St. Catherine of Siena', 'pt-BR': 'Santa Catarina de Sena'},
 'description': {'en-US': 'A selection of sixty-odd letters of St. Catherine of Siena (1347-1380) in English by Vida D. Scudder (1905), arranged by period of her life and linked by Scudder’s narrative and headnotes: letters to her mother, her brothers and her friends, to Raymond of Capua, to Gregory XI and Urban VI, to the Florentines, to the Queen of Naples, and the accounts of her last years. Several letters are abridged. It is a selection, not the epistolary, and does not follow the chapters of the Italian Lettere (not yet imported in full).',
   'it': 'Scelta di una sessantina di lettere di santa Caterina da Siena (1347-1380) in inglese, di Vida D. Scudder (1905), con le note e il racconto che le collegano; alcune sono abbreviate. È una scelta, non l’epistolario completo.',
   'pt-BR': 'Seleção de cerca de sessenta cartas de santa Catarina de Sena (1347-1380) em inglês, por Vida D. Scudder (1905), com a narrativa e as notas que as ligam; várias estão abreviadas. É uma seleção, não o epistolário completo.'},
 'composed': '1370-1380', 'languages': ['en-US'], 'work': 'catherine-of-siena/lettere',
 'editions': {'en-US': {'translator': 'Vida D. Scudder', 'year': 1905}},
 'sources': [{'language': 'en-US', 'url': 'https://www.gutenberg.org/ebooks/7403', 'edition': 'Vida D. Scudder, Saint Catherine of Siena as seen in her letters, London: Dent / New York: Dutton, 1905. Project Gutenberg #7403 (Distributed Proofreaders).',
  'description': 'Scudder’s introduction, her two chronologies, and each letter with its headnote; the section headings and narrative between letters open the first letter of each section. The tables of contents and of persons addressed are not imported.',
  'tier': 'A', 'tierEvidence': 'Scudder died in 1954; the 1905 translation of letters by a 14th-century author is public domain in the US (published before 1931).'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/catherine-of-siena-opera-omnia/lettere-scudder', META, ch))
