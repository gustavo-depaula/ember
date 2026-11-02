"""More, The Sadness of Christ (Basset's translation of De Tristitia Christi, ed. Hallett 1941): CTMS text-layer PDF -> en-US book."""
import re, json, os, shutil
ROOT = '/Users/gustavo/Documents/prayer'
src = ROOT + '/research/sourcing/more-and-fisher/ctms/sadness-of-christ-bassett.txt'
L = [l.rstrip() for l in open(src, encoding='utf8').read().replace('\x0c', '').split('\n')]
def chunk(a, b):
    lines = L[a - 1:b]
    lines = [re.sub(r'(?<=[^\s\d​])​(\d{1,3})​?(?=\W|$)', r'<FN\1>', l) for l in lines]
    lines = [l.replace('​', '') for l in lines]
    # page numbers (large indent, digits only)
    lines = [l for l in lines if not re.fullmatch(r'\s{20,}\d+', l)]
    notes = {}; body = []; i = 0
    while i < len(lines):
        l = lines[i]
        if re.fullmatch(r'\d{1,3}', l.strip()) and i + 1 < len(lines) and re.match(r'^ {1,6}\S', lines[i + 1]) and not re.match(r'^ {7,}', lines[i + 1]):
            n = l.strip(); j = i + 1; txt = []
            txt.append(lines[j].strip()); j += 1
            while j < len(lines) and lines[j].strip() and not re.match(r'^\s{7,}\S', lines[j]) and not lines[j].startswith('    ') is False and False: j += 1
            notes[n] = ' '.join(txt); i = j; continue
        body.append(l); i += 1
    blocks = []; cur = []
    for l in body:
        if not l.strip():
            if cur: blocks.append(' '.join(x.strip() for x in cur)); cur = []
        elif re.match(r'^ {6,}\S', l) and cur and re.search(r'[.!?’”)]$', cur[-1].strip()): blocks.append(' '.join(x.strip() for x in cur)); cur = [l]
        else: cur.append(l)
    if cur: blocks.append(' '.join(x.strip() for x in cur))
    blocks = [re.sub(r'\s+', ' ', b).strip() for b in blocks if b.strip()]
    used = []
    def sub(m):
        n = m.group(1)
        if n in notes: used.append(n); return '[^%s]' % n
        return ''
    blocks = [re.sub(r'<FN(\d+)>', sub, b) for b in blocks]
    blocks = [re.sub(r'<FN\d+>', '', b) for b in blocks]
    return blocks, {n: re.sub(r'<FN\d+>', '', notes[n]) for n in used}
def md(title, blocks, notes):
    s = '# %s\n\n%s\n' % (title, '\n\n'.join(blocks))
    if notes: s += '\n' + '\n\n'.join('[^%s]: %s' % (n, t) for n, t in notes.items()) + '\n'
    return s
root = ROOT + '/content/books/more-opera-omnia/sadness-of-christ'
if os.path.exists(root): shutil.rmtree(root)
os.makedirs(root + '/en-US'); os.makedirs(root + '/sources/en-US-originals')
parts = [('introduction', 'Introduction by P. E. Hallett', 40, 556), ('additional-note', 'Additional Note', 559, 576),
         ('printer-to-the-reader', 'The Printer to the Gentle Reader', 596, 613), ('exposition', 'An Exposition of a Part of the Passion', 614, 4262)]
toc = []; words = 0
heads = ["‘OF THE CUTTING OF MALCHUS'S EAR.’", 'HOW HIS DISCIPLES FORSOOK HIM.', 'OF THE TAKING OF CHRIST']
for cid, title, a, b in parts:
    bl, nt = chunk(a, b)
    bl = ['## ' + x.title().replace("'S", "'s") if (x.isupper() and len(x) < 160) else x for x in bl]
    m = md(title, bl, nt); open('%s/en-US/%s.md' % (root, cid), 'w').write(m); words += len(m.split())
    toc.append({'id': cid, 'title': {'en-US': title}})
shutil.copy(src, root + '/sources/en-US-originals/sadness-of-christ-hallett-1941.txt')
book = {'id': 'more-sadness-of-christ', 'cover': 'classic',
 'name': {'en-US': 'The Sadness of Christ (History of the Passion)', 'pt-BR': 'A Tristeza de Cristo (História da Paixão)'},
 'author': {'en-US': 'St. Thomas More', 'pt-BR': 'São Tomás More'},
 'description': {'en-US': "More's last work, written in the Tower of London in 1534-35 and left unfinished at the words 'they laid hands on Jesus': a meditation on the sorrow, weariness, fear and prayer of Christ in the Garden (De Tristitia Christi). This is Mary Basset's English translation of the Latin (1557), in modern spelling edited by Mgr P. E. Hallett (1941).",
   'pt-BR': 'A última obra de More, escrita na Torre de Londres em 1534-35 e deixada inacabada nas palavras «puseram as mãos em Jesus»: meditação sobre a tristeza, o tédio, o pavor e a oração de Cristo no Horto (De Tristitia Christi). Tradução inglesa de Mary Basset (1557), em grafia moderna, editada por Mons. P. E. Hallett (1941).'},
 'composed': 1535, 'languages': ['en-US'], 'work': 'more/de-tristitia-christi',
 'editions': {'en-US': {'translator': 'Mary Basset (1557), modernised and edited by P. E. Hallett (London: Burns Oates & Washbourne, 1941)', 'year': 1941}},
 'sources': [{'language': 'en-US', 'url': 'https://thomasmorestudies.org/wp-content/uploads/2020/09/sadness-of-christ-bassett.pdf', 'edition': "St. Thomas More's History of the Passion, tr. Mary Basset, modern spelling ed. P. E. Hallett (London: Burns Oates & Washbourne, 1941), text-layer PDF distributed by the Center for Thomas More Studies.",
   'description': "Introduction, additional note, the printer's address and the Exposition, with Hallett's footnotes kept. The Latin De Tristitia Christi has no usable e-text (see PROBLEMS.md). Raw text in sources/en-US-originals/.",
   'tier': 'B', 'tierEvidence': "Basset's 1557 translation and More's text are public domain; Hallett's 1941 modernisation is freely distributed on the Center for Thomas More Studies website."}],
 'toc': toc}
json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
print(words, 'words')
