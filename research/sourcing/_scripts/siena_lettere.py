import re, sys, json, os
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
from ws_md import convert
WS = '/Users/gustavo/Documents/prayer/research/sourcing/catherine-of-siena/ws/'
def rom(s):
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i + 1 < len(s) and v[s[i + 1]] > v[c] else v[c]
    return t
files = sorted([f[:-5] for f in os.listdir(WS) if re.fullmatch(r'[IVXLC]+\.json', f)], key=rom)
ch = []; words = 0; skipped = []
for f in files:
    paras, notes = convert(WS + f + '.json')
    if not paras: skipped.append(f); continue
    k = next((i for i, p in enumerate(paras[:8]) if re.match(r'^[A-Z]{1,9}\.?\s*[—–-]', p)), None)
    if k is None: skipped.append(f + '?'); continue
    paras = paras[k:]
    head = paras[0]
    m = re.match(r'^([A-Z]+)\.?\s*[—–-]\s*(.*?)(\[\^\d+\])?$', head)
    addressee = re.sub(r'\*', '', m.group(2)).strip().rstrip('.')
    mark = m.group(3) or ''
    n = rom(f)
    body = paras[1:]
    # a short italic-free paragraph following the heading is the editor's summary; italicise it
    if body and not body[0].startswith('Al nome') and len(body[0].split()) < 90: body[0] = '*' + body[0] + '*'
    used = set(re.findall(r'\[\^(\d+)\]', mark + ' '.join(body)))
    fn = [f'[^{k}]: {notes[k]}' for k in sorted(used, key=int) if k in notes]
    text = ((mark + '\n\n') if mark else '') + '\n\n'.join(body)
    if fn: text += '\n\n' + '\n\n'.join(fn)
    ch.append(('l%03d' % n, {'it': ('Lettera %s. %s' % (f, addressee), text)}))
print(len(ch), 'skipped', skipped)
META = {'id': 'catherine-lettere', 'cover': 'classic',
 'name': {'it': 'Le lettere di santa Caterina da Siena', 'en-US': 'The Letters of St. Catherine of Siena', 'pt-BR': 'As cartas de santa Catarina de Sena'},
 'author': {'it': 'Santa Caterina da Siena', 'en-US': 'St. Catherine of Siena', 'pt-BR': 'Santa Catarina de Sena'},
 'description': {'it': 'Le lettere di santa Caterina da Siena (1347-1380) nell’edizione di Niccolò Tommaseo, a cura di Piero Misciattelli (Siena 1913-1922), con le note e i sommari dell’editore: a Raimondo da Capua, a Gregorio XI e a Urbano VI, ai Fiorentini, alla madre Lapa, ai discepoli e a molti altri. Contiene le lettere finora trascritte e rilette su it.wikisource (numerazione dell’edizione Misciattelli); le altre lettere dell’epistolario non sono ancora importate.',
   'en-US': 'The letters of St. Catherine of Siena (1347-1380) in Niccolò Tommaseo’s edition, edited by Piero Misciattelli (Siena 1913-1922), with the editor’s notes and summaries: to Raymond of Capua, to Gregory XI and Urban VI, to the Florentines, to her mother Lapa, to her disciples and many others. It holds the letters transcribed so far on Italian Wikisource (the Misciattelli numbering); the remaining letters of the epistolary are not yet imported. A selection in English is in the Scudder book of the same work.',
   'pt-BR': 'As cartas de santa Catarina de Sena (1347-1380) na edição de Niccolò Tommaseo, organizada por Piero Misciattelli (Siena 1913-1922), com notas e sumários do editor: a Raimundo de Cápua, a Gregório XI e Urbano VI, aos florentinos, à mãe Lapa, aos discípulos e a muitos outros. Contém as cartas já transcritas no Wikisource italiano.'},
 'composed': '1366-1380', 'languages': ['it'], 'work': 'catherine-of-siena/lettere',
 'editions': {'it': {'editor': 'Niccolò Tommaseo, ed. Piero Misciattelli (Giuntini-Bentivoglio, Siena)', 'year': 1922}},
 'sources': [{'language': 'it', 'url': 'https://it.wikisource.org/wiki/Le_lettere_di_S._Caterina_da_Siena',
  'edition': 'Le lettere di S. Caterina da Siena e di alcuni suoi discepoli, ed. Niccolò Tommaseo, ordinate con nuovo metodo da Piero Misciattelli, vol. I, Siena 1922. Italian Wikisource transcription (proofread against the scans, mostly at 75%).',
  'description': 'Each letter page with its heading, the editor’s summary and Tommaseo’s footnotes (kept as footnotes). Only the letters transcribed on Wikisource are here; the six-volume Misciattelli OCR on archive.org (lelettere01cath to lelettere06cath) has the rest, with the footnotes interleaved in the text, and was not imported. Wikisource paragraph breaks across pages were rejoined by script.',
  'tier': 'A', 'tierEvidence': 'Catherine died in 1380, Tommaseo in 1874 and Misciattelli in 1937; the 1922 edition is public domain everywhere.'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/catherine-of-siena-opera-omnia/lettere', META, ch))
