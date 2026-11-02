import re, os, json, sys, collections, glob
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import ocr_clean as oc
R = '/Users/gustavo/Documents/prayer/research/sourcing/brother-lawrence/'
B = '/Users/gustavo/Documents/prayer/content/books/brother-lawrence-opera-omnia/'
FIX = {}
if os.path.exists(R + 'lawrence_enfix.json'): FIX = json.load(open(R + 'lawrence_enfix.json'))
def fixen(s):
    s = s.replace('D£chauss£s', 'Déchaussés').replace('£', 'é').replace('\\', '').replace('*^', '').replace('_', '')
    s = re.sub(r'(?<!\[)\^', '', s)
    s = s.replace('“', '“').replace("'", '’')
    s = re.sub(r'\s+([;:!?,.])', r'\1', s)
    for a, b in FIX.items():
        s = re.sub(r'(?<![\w])' + re.escape(a) + r'(?![\w])', b, s)
    s = re.sub(r'  +', ' ', s).replace('Gop’s','God’s')
    return s
FURN = re.compile(r'^(Digitized by.*|THE PRACTICE OF THE|PRESENCE OF GOD|THE PRESENCE OF GOD|CONVERSATIONS|LETTERS|PREFACE TO ORIGINAL EDITION|[\W\d]*|\*\d+|[A-Z]{1,2}|FACS|Google|CONTENTS)$')
def blocks_of(lines):
    return [oc.join_lines(b) for b in oc.blocks(lines)]
def chapter(lines, head_n=1):
    bl = [b for b in blocks_of(lines) if not FURN.match(b)]
    return bl
def paras_notes(bl, hmark=False):
    paras, defs = [], {}
    mg = []
    for b in bl:
        if mg and not oc.SENT_END.search(mg[-1]) and b[:1].islower() and not re.match(r'^\d', b): mg[-1] += ' ' + b
        else: mg.append(b)
    bl = mg
    for b in bl:
        m = re.match(r'^(\d{1,2}) (?=[A-Z])', b)
        if m and len(b) < 600:
            defs[m.group(1)] = b[m.end():]; continue
        paras.append(b)
    notes, n = {}, 0
    for k, t in defs.items():
        n += 1; notes[n] = t
        done = False
        for i, p in enumerate([] if hmark else paras):
            mm = re.search(r'(?<=[\w.,;:!?)’”]) ' + k + r'(?=\s|$)', p)
            if mm:
                paras[i] = p[:mm.start()] + f'[^{n}]' + p[mm.end():]; done = True; break
        if not done and not hmark: paras[0] = paras[0] + f'[^{n}]'
    return paras, notes
def render(title, ital, paras, notes):
    t = [f'# {title}', '']
    for i in ital: t += [f'*{fixen(i)}*', '']
    for p in paras: t += [fixen(p), '']
    for k in sorted(notes): t += [f'[^{k}]: {fixen(notes[k])}', '']
    return '\n'.join(t).rstrip() + '\n'

ORD = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth']
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI']
def build_practice():
    L = open(R + 'ThePracticeOfThePresenceOfGod.txt', errors='replace').read().split('\n')
    heads = [(i, l.strip()) for i, l in enumerate(L) if re.match(r'^(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH|SIXTEENTH) (LETTER|CONVERSATION)\b', l.strip())]
    endl = next(i for i in range(3056, 3300) if 'GREAT SOULS' in L[i])
    out = os.path.join(B, 'practice-of-the-presence-of-god-allenson')
    os.makedirs(out + '/en-US', exist_ok=True)
    chaps, toc = [], []
    # prefaces
    chaps.append(('preface', 'Preface', None, L[239:326]))
    chaps.append(('preface-1692', 'From the Preface to the Original Edition (1692)', None, L[327:364]))
    for k, (i, h) in enumerate(heads):
        j = heads[k+1][0] if k+1 < len(heads) else endl
        if k == 3: j = 1539 - 2   # fourth conversation ends before 'LETTERS'
        kind = 'Conversation' if 'CONVERSATION' in h else 'Letter'
        n = ([x for x in heads[:k+1] if kind.upper() in x[1]]).__len__()
        cid = ('conversation-' if kind == 'Conversation' else 'letter-') + f'{n:02d}'
        chaps.append((cid, f'{kind} {RN[n-1]}', h, L[i+1:j]))
    tot = 0
    for cid, title, h, lines in chaps:
        bl = chapter(lines)
        ital = []
        if h:
            while bl and (re.match(r'^(To\b|Au\b)', bl[0]) or (title.startswith('Conversation') and re.match(r'^[A-Z][a-z]+ \d', bl[0]) and len(bl[0]) < 40)) and len(bl[0]) < 120:
                ital.append(bl.pop(0))
            # a stray page number glued to the heading, e.g. FIRST LETTER 1
        hm = bool(h and re.search(r' \d$', h))
        paras, notes = paras_notes(bl, hm)
        if cid.startswith('letter') and '1' == (re.search(r'LETTER (\d)$', h or '') or [0, ''])[1] and not notes: pass
        if h and re.search(r' \d$', h) and notes: ital[0] = ital[0] + '[^1]' if ital else None
        if cid == 'preface': fulltitle = 'Preface'
        elif cid == 'preface-1692': fulltitle = title
        else: fulltitle = ORD[n_of(cid)-1] + (' Conversation' if cid.startswith('conv') else ' Letter')
        txt = render(fulltitle, ital, paras, notes)
        open(f'{out}/en-US/{cid}.md', 'w').write(txt)
        tot += len(txt.split())
        toc.append((cid, fulltitle))
    return out, toc, tot
def n_of(cid): return int(cid.split('-')[1])
if __name__ == '__main__' and 'practice' in sys.argv:
    out, toc, tot = build_practice(); print(out, tot, toc)

MTITLES = ['Of Necessary Practices for Attaining to the Spiritual Life', 'Of How It Is Required of Us to Worship God in Spirit and in Truth', 'Of Union of the Soul with God', 'Of the Presence of God', 'Of Means for Attaining unto the Presence of God', 'Of the Benefits of the Presence of God']
FURN2 = re.compile(r'^(SPIRITUAL MAXIMS( OF BROTHER)?|(SPIRITUAL MAXIMS OF BROTHER )?LAWRENCE\.?|OF BROTHER LAWRENCE|OF BROTHER|THE CHARACTER( OF BROTHER)?|LAWRENCE|GATHERED THOUGHTS|BEING THE TEACHING OF HIS LIFE|THE CHARACTER OF BROTHER LAWRENCE|PREFACE|CONTENTS|[\W\d]*|[IVXl]{1,3}|PAGE|\d+ ?\W*|[A-Za-z]{1,3})$')
def build_maxims():
    L = open(R + 'spiritualmaximso01lawr.txt', errors='replace').read().split('\n')
    out = os.path.join(B, 'spiritual-maxims-allenson'); os.makedirs(out + '/en-US', exist_ok=True)
    fin = next(i for i in range(2000, len(L)) if L[i].strip() == 'FINIS')
    parts = [('preface', 'Preface', 71, 197), ('maxims', 'The Spiritual Maxims', 241, 846), ('character', 'The Character of Brother Lawrence, Being the Teaching of His Life', 871, 1845), ('gathered-thoughts', 'Gathered Thoughts of Brother Lawrence', 1860, fin)]
    toc, tot = [], 0
    for cid, title, a, b in parts:
        bl = [x for x in blocks_of(L[a:b]) if not FURN2.match(x)]
        paras, mi = [], 0
        for x in bl:
            if cid == 'maxims' and re.match(r'^(Or|Of|OF|Oy) [A-Z]', x) and sum(c.isupper() for c in x) > 0.6 * sum(c.isalpha() for c in x) and len(x) < 130 and mi < 6:
                paras.append('## ' + MTITLES[mi]); mi += 1; continue
            paras.append(x)
        # merge page-split paragraphs
        mg = []
        for x in paras:
            if mg and not oc.SENT_END.search(mg[-1]) and x[:1].islower() and not mg[-1].startswith('## '): mg[-1] += ' ' + x
            else: mg.append(x)
        txt = '\n\n'.join([f'# {title}'] + [(fixen(p) if not p.startswith('## ') else p) for p in mg]) + '\n'
        open(f'{out}/en-US/{cid}.md', 'w').write(txt); tot += len(txt.split()); toc.append((cid, title))
        if cid == 'maxims': print('headings', mi)
    return out, toc, tot
if __name__ == '__main__' and 'maxims' in sys.argv:
    print(build_maxims())

def meta(out, bid, cover, name, desc, composed, translator, year, src, toc, work='brother-lawrence/pratique-de-la-presence-de-dieu'):
    d = {'id': bid, 'cover': 'classic', 'name': name,
         'author': {'en-US': 'Brother Lawrence of the Resurrection', 'pt-BR': 'Frei Lourenço da Ressurreição'},
         'description': desc, 'composed': composed, 'languages': ['en-US'], 'work': work,
         'editions': {'en-US': {'translator': translator, 'year': year}}, 'sources': [src],
         'toc': [{'id': c, 'title': {'en-US': t}, **({'children': ch} if ch else {})} for c, t, ch in toc]}
    json.dump(d, open(out + '/book.json', 'w'), ensure_ascii=False, indent=2); open(out + '/book.json', 'a').write('\n')
if __name__ == '__main__' and 'meta' in sys.argv:
    out, toc, tot = build_practice()
    leaf = lambda pre: [{'id': c, 'title': {'en-US': t}} for c, t in toc if c.startswith(pre)]
    tc = [(c, t, None) for c, t in toc if c.startswith('preface')] + [('conversations', 'Conversations', leaf('conversation')), ('letters', 'Letters', leaf('letter'))]
    os.makedirs(out + '/sources/english-originals', exist_ok=True)
    import shutil; shutil.copy(R + 'ThePracticeOfThePresenceOfGod.txt', out + '/sources/english-originals/practice-1906-allenson-archive-org.txt')
    meta(out, 'lawrence-practice-presence-of-god-allenson', 'classic',
      {'en-US': 'The Practice of the Presence of God (Allenson, 1906)', 'pt-BR': 'A prática da presença de Deus (Allenson, 1906)'},
      {'en-US': 'The four Conversations that Abbé de Beaufort took down from Brother Lawrence in 1666-1667 and his sixteen Letters, in the English of the new and revised Allenson edition of 1906, which compared the older translation with the French of 1692, put the letters in chronological order and added a letter (the seventh) and part of the original preface. The letters are therefore numbered differently from the French; the French book of the same work has the Maxims, the Éloge and the Mœurs besides. This edition does not carry Brother Lawrence’s Spiritual Maxims, which are in the separate Allenson book of 1907.',
       'pt-BR': 'As quatro Conversas que o abade de Beaufort recolheu do irmão Lourenço em 1666-1667 e as suas dezesseis Cartas, no inglês da edição nova e revista de Allenson (1906), que cotejou a tradução antiga com o francês de 1692, pôs as cartas em ordem cronológica e acrescentou uma carta (a sétima) e parte do prefácio original. A numeração das cartas difere, portanto, da do francês.'},
      '1666-1691', 'Anonymous (revised by H. G.), H. R. Allenson', 1906,
      {'language': 'en-US', 'url': 'https://archive.org/details/ThePracticeOfThePresenceOfGod', 'edition': 'The Practice of the Presence of God, being Conversations and Letters of Brother Lawrence (Nicholas Herman of Lorraine), new and revised edition with an additional letter, London: H. R. Allenson, Ltd. [1906]. Internet Archive scan (Google), OCR text.',
       'description': 'Allenson’s Preface and the extract from the 1692 preface, the four Conversations and the sixteen Letters in the edition’s chronological order with their footnotes. The publisher’s catalogue at the end, the contents table and the page furniture are left out. OCR corrected by a vocabulary check against the corpus’s English books and a few hand fixes; some stray marks and misreadings may remain.',
       'tier': 'A', 'tierEvidence': 'Brother Lawrence died in 1691; this English edition was published in London in 1906, so it is public domain everywhere.'}, tc)
    out2, toc2, tot2 = build_maxims()
    os.makedirs(out2 + '/sources/english-originals', exist_ok=True)
    shutil.copy(R + 'spiritualmaximso01lawr.txt', out2 + '/sources/english-originals/maxims-1907-allenson-archive-org.txt')
    meta(out2, 'lawrence-spiritual-maxims-allenson', 'classic',
      {'en-US': 'The Spiritual Maxims of Brother Lawrence (Allenson, 1907)', 'pt-BR': 'As máximas espirituais do irmão Lourenço (Allenson, 1907)'},
      {'en-US': 'Brother Lawrence’s own Spiritual Maxims, or Means for Attaining to the Presence of God, in their six sections, newly translated in 1907, with The Character of Brother Lawrence by the chronicler of the Conversations (Beaufort’s Mœurs) and a set of Gathered Thoughts compiled from the Life. It is the only public-domain English of the Maxims; the Conversations and Letters are in the separate Allenson book of 1906.',
       'pt-BR': 'As Máximas espirituais do próprio irmão Lourenço, ou Meios de alcançar a presença de Deus, em suas seis seções, traduzidas em inglês em 1907, com O caráter do irmão Lourenço, pelo cronista das Conversas (os Mœurs de Beaufort), e uns Pensamentos reunidos, tirados da Vida.'},
      '1666-1691', 'Anonymous, H. R. Allenson', 1907,
      {'language': 'en-US', 'url': 'https://archive.org/details/spiritualmaximso01lawr', 'edition': 'The Spiritual Maxims of Brother Lawrence, together with The Character by the chronicler of the Conversations, and Gathered Thoughts; newly translated into English, London: H. R. Allenson, Ltd. [1907]. Internet Archive scan (Duke Divinity School copy), OCR text.',
       'description': 'The translator’s Preface, the Spiritual Maxims (six sections), The Character and the Gathered Thoughts. The contents table, running heads and library stamps are left out. OCR corrected by a vocabulary check and hand fixes; a few of the footnotes of the Character and Maxims survive only as fragments inside paragraphs.',
       'tier': 'A', 'tierEvidence': 'Brother Lawrence died in 1691; this English edition was published in London in 1907, so it is public domain everywhere.'},
      [(c, t, None) for c, t in toc2])
