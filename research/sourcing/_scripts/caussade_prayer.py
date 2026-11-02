import re, os, json, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import ocr_clean as oc
R = '/Users/gustavo/Documents/prayer/research/sourcing/caussade/'
B = '/Users/gustavo/Documents/prayer/content/books/caussade-opera-omnia/instructions-spirituelles-thorold/'
L = open(R + 'onprayer_201911.txt', errors='replace').read().split('\n')
# (id, title, start line (1-based), kind)
D1T = ["General exposition of the errors of the false mystics on prayer; how these errors penetrated into France",
"On the particular errors of the false mystics of the seventeenth century: Bossuet opposes to them the principles of the true mystics",
"Bossuet refutes in particular the insidious passages in the books of the new mystics, and lays down the rule for distinguishing between the writings of the false and the true mystics",
"The doctrine of the saints opposed to the modern errors of the false mystics",
"The imperceptibility of our acts: the soul begins, by means of the prayer of pure faith, to distinguish intellectual acts from acts of the senses",
"Other errors of the false mystics: to be aware of one’s acts is culpable only in so far as it feeds one’s self-love",
"The reality of passive prayer: various passive prayers",
"The same subject continued: this kind of prayer does not exclude the acts commanded for the Christian life",
"On perfect love of God, which does not exclude the hope of reward",
"S. Francis de Sales professes the same doctrine: Christian indifference, and how it should be understood",
"The Bishop of Meaux’s views on the prayer of the Venerable Mother de Chantal, approved by S. Francis de Sales",
"On the prayer of the Venerable Mother de Chantal (continued): what writings she has left us on this important matter",
"On the impossible suppositions by which S. Francis de Sales and several other saints have from the beginning of the Church expressed the excess of love",
"On the trials of afflicted souls and the act of abandonment most perfect and most fitting to their state",
"On the acts of the condemnation of the Quietists: the precautions taken by the Bishops in condemning errors not to harm the teaching of the saints",
"The Ordinances continued: the views of the Bishop of Meaux on the same subject"]
D2T = ["On purity of conscience","On purity of heart","On purity of spirit","On purity of action",
"On the proximate dispositions for recollection, which consist in two rules to be observed","Advice for beginners",
"Advice to advanced souls on the aridities of their prayer, and on the particular temptations which accompany them",
"On emptiness of spirit, on the impotence which follows and the extraordinary revolts of the passions",
"Advice to those who have made great progress","The same subject continued"]
S1 = [2696,2912,3254,3717,4213,4674,5177,5739,6357,6833,7275,7646,8024,8409,8820,9163]
S2 = [10601,10928,11224,11492,11989,12718,13332,13901,14354,14953]
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI']
secs = [('introduction', 'Introduction by the Abbot of Downside', 972, 'front'),
        ('translators-note', 'Translator’s Note', 1856, 'front'),
        ('preface', 'Preface by Fr. Ludovic de Besse', 1903, 'front'),
        ('b1-prelim', 'Book I. Preliminary Dialogue: On the occasion of Bossuet’s publishing his Instruction sur les divers états d’oraison, and the author’s twofold intention', 2263, 'dlg')]
secs += [(f'b1-d{i+1:02d}', f'Book I. Dialogue {RN[i]}: {D1T[i]}', S1[i], 'dlg') for i in range(16)]
secs += [('b2-prelim', 'Book II. Preliminary Dialogue: On several questions touching the direct acts in which the different forms of mystical prayer consist, and the various names Bossuet gave to these forms of prayer', 9585, 'dlg')]
secs += [(f'b2-d{i+1:02d}', f'Book II. Dialogue {RN[i]}: {D2T[i]}', S2[i], 'dlg') for i in range(10)]
ends = [s[2] for s in secs[1:]] + [15955]
# the Book I final text ends before 'END OF THE FIRST BOOK' + BOOK II marker: trim at marker lines
HEAD = re.compile(r'^((\d{1,3} )?ON PRAYER( \d{1,3})?|(PRELIMINARY )?DIALOGUE( [IVX]+)?( \S{1,5})?|(INTRODUCTION|PREFACE|TRANSLATOR.S NOTE)( [ivxlcXVILC]+)?|[ivxlc]{1,6}|\d{1,3}|[A-Z]{1,3} \d{1,3}|CONTENTS( [ivx]+)?)$')
Q = re.compile(r'^\(?(?:Q|CL|Cl|QL|£+[L),.2*Z■\-•\s]{0,4})[.,\-•*]*\s')
def clean_text(s):
    s = s.replace('¬', '-').replace('‘', '‘')
    s = re.sub(r'(\w)- (?=[a-z])', r'\1', s) if False else s
    s = s.replace(' ,', ',').replace(' .', '.').replace(' ;', ';').replace(' :', ':')
    s = re.sub(r'(?<![A-Za-z])£\s?(?=[A-Za-z])', '‘', s)
    return s
def build_section(a, b, kind, first_title_drop):
    lines = [x.rstrip().replace('¬', '-') for x in L[a-1:b-1]]
    if kind == 'dlg':
        # drop the heading and title lines up to the first marker line
        k = 0
        while k < len(lines) and not (re.match(r'^[IVX]{1,4}$', lines[k].strip()) or Q.match(lines[k].strip()) or re.match(r'^A\s?[.,]', lines[k].strip())) and k < 14: k += 1
        lines = lines[k:]
    # pages
    pages, cur = [], []
    for ln in lines:
        s = ln.strip()
        if re.fullmatch(r'[vVaAxX]{8,}|END OF THE FIRST BOOK.*|BOOK II|[aA]{4,}.*', s): continue
        if HEAD.match(s) and not re.fullmatch(r'[IVX]{1,4}', s):
            if cur: pages.append(cur); cur = []
            continue
        cur.append(s)
    if cur: pages.append(cur)
    out, notes, nn = [], {}, 0
    for pg in pages:
        body, fns = [], []
        for s in pg:
            m = re.match(r'^(\d{1,2}|\*) (?=\S)', s)
            if m and (fns or (m.group(1) != '*' and re.search(r'(?<![\d\w])' + m.group(1) + r'(?![\d\w])', ' '.join(body)[:])) or (m.group(1) == '*' and any(x.endswith('*') or ' * ' in x for x in body))):
                fns.append([m.group(1), s[m.end():]]); continue
            if fns and not re.match(r'^(Q|CL|A)\b[.,]', s) and not re.fullmatch(r'[IVX]{1,4}', s):
                fns[-1][1] += ' ' + s; continue
            body.append(s)
        # paragraphs
        paras, cp = [], []
        for s in body:
            if not s:
                if cp: paras.append(cp); cp = []
                continue
            if (Q.match(s) or re.match(r'^A\s?[.,]', s) or re.fullmatch(r'[IVX]{1,4}', s)) and cp:
                paras.append(cp); cp = []
            cp.append(s)
            if re.fullmatch(r'[IVX]{1,4}', s): paras.append(cp); cp = []
        if cp: paras.append(cp)
        ptxt = [oc.join_lines(p) for p in paras]
        for key, text in fns:
            nn += 1; notes[nn] = clean_text(text.strip())
            ref = f'[^{nn}]'
            pat = re.compile(r'(?<=[^\d\s]) ?(?<![\d])' + re.escape(key) + r'(?![\d\w])(?= |$|[.,;:?)])') if key != '*' else re.compile(r'\*')
            done = False
            for i, t in enumerate(ptxt):
                if re.fullmatch(r'[IVX]{1,4}', t): continue
                mm = pat.search(t) if key == '*' else re.search(r'(?<=[^\d\s])\s' + re.escape(key) + r'(?=[\s.,;:?)]|$)', t)
                if mm:
                    ptxt[i] = t[:mm.start()] + ref + t[mm.end():]; done = True; break
            if not done:
                j = next((i for i, t in enumerate(ptxt) if not re.fullmatch(r'[IVX]{1,4}', t)), None)
                if j is None: ptxt.append(ref)
                else: ptxt[j] += ref
        out += ptxt
    merged = []
    for p in out:
        if merged and not re.fullmatch(r'[IVX]{1,4}', merged[-1]) and not oc.SENT_END.search(re.sub(r'\[\^\d+\]', '', merged[-1])) and p[:1].islower() and not Q.match(p):
            merged[-1] += ' ' + p
        else: merged.append(p)
    return merged, notes
def render(title, paras, notes):
    t = [f'# {title}', '']
    for p in paras:
        p = clean_text(p)
        if p.startswith('suopisotjsip') or p.startswith('^suopisotjsip'): continue
        p = re.sub(r'^\(?(?:Q|CL|Cl|QL|£+[L),.2*Z■\-•\s]{0,4})[.,\-•*]*\s+', 'Q. ', p) if Q.match(p) else re.sub(r'^A\s?[.,]\s*', 'A. ', p)
        p = re.sub(r'\s*FINIS\s*$', '', p)
        t += ([f'## {p}', ''] if re.fullmatch(r'[IVX]{1,4}', p) else [p, ''])
    for k in sorted(notes): t += [f'[^{k}]: {notes[k]}', '']
    return '\n'.join(t).rstrip() + '\n'
if __name__ == '__main__':
    os.makedirs(B + 'en-US', exist_ok=True)
    tot = 0
    toc = []
    for (cid, title, a, kind), b in zip(secs, ends):
        paras, notes = build_section(a, b, kind, None)
        txt = render(title, paras, notes)
        open(B + f'en-US/{cid}.md', 'w').write(txt)
        w = len(txt.split()); tot += w
        print(cid, w, len(notes))
    print(tot)

    def mk(cid, title): return {'id': cid, 'title': {'en-US': title}}
    kids = lambda pre: [mk(c, t) for c, t, a, k in secs if c.startswith(pre)]
    toc = [mk('introduction', secs[0][1]), mk('translators-note', secs[1][1]), mk('preface', secs[2][1]),
      {'id': 'book-1', 'title': {'en-US': 'Book I. The errors of the false mystics and the doctrine of Bossuet'}, 'children': kids('b1-')},
      {'id': 'book-2', 'title': {'en-US': 'Book II. The practice of prayer'}, 'children': kids('b2-')}]
    d = {
     'id': 'caussade-instructions-spirituelles-thorold', 'cover': 'classic',
     'name': {'en-US': 'On Prayer: Spiritual Instructions in the Form of Dialogues on the Various States of Prayer', 'pt-BR': 'Sobre a oração: instruções espirituais em forma de diálogos sobre os diversos estados de oração', 'fr-FR': 'Instructions spirituelles en forme de dialogues sur les divers états d’oraison'},
     'author': {'en-US': 'Jean-Pierre de Caussade', 'pt-BR': 'Jean-Pierre de Caussade', 'fr-FR': 'Jean-Pierre de Caussade'},
     'description': {
      'en-US': 'The only book Jean-Pierre de Caussade, S.J. (1675-1751) published in his lifetime (Perpignan, 1741, anonymously): a set of dialogues, in question and answer, on the states of prayer according to Bossuet’s Instruction sur les divers états d’oraison. Book I defends the true mystics against the Quietist errors, drawing on Bossuet, Francis de Sales and Jane de Chantal; Book II teaches the practice, the four purities, the rules of recollection, and advice for beginners, the advanced and those far on. Algar Thorold’s English of 1931 from the 1892-95 French text, with the Abbot of Downside’s (Dom John Chapman’s) Introduction, Thorold’s Note and Fr. Ludovic de Besse’s Preface. The French text could not be found in a clean edition, so this book has the English only.',
      'pt-BR': 'O único livro que Jean-Pierre de Caussade, S.J. (1675-1751) publicou em vida (Perpignan, 1741, anonimamente): diálogos em perguntas e respostas sobre os estados de oração segundo a Instruction sur les divers états d’oraison de Bossuet. O Livro I defende os verdadeiros místicos contra os erros quietistas; o Livro II ensina a prática, as quatro purezas, as regras do recolhimento e conselhos para principiantes e adiantados. Tradução inglesa de Algar Thorold (1931), com a introdução de Dom John Chapman, a nota do tradutor e o prefácio de Ludovic de Besse. O texto francês não foi encontrado em edição limpa.',
      'fr-FR': ''},
     'composed': '1741', 'languages': ['en-US'], 'work': 'caussade/instructions-spirituelles',
     'editions': {'en-US': {'translator': 'Algar Thorold', 'year': 1931}},
     'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/onprayer_201911', 'edition': 'Jean-Pierre de Caussade, On Prayer: Spiritual Instructions in the form of Dialogues on the various States of Prayer according to the doctrine of Bossuet, Bishop of Meaux, translated by Algar Thorold from the Bussenot text (Reims, 1892-95) of the Perpignan 1741 edition, with an Introduction by the Abbot of Downside and a Preface by Fr. Ludovic de Besse, London: Burns Oates & Washbourne, 1931. Internet Archive scan, OCR text.',
       'description': 'Introduction, Translator’s Note, Preface, and both Books (Book I: preliminary dialogue and sixteen dialogues; Book II: preliminary dialogue and ten dialogues, with the closing prayer) with the translator’s footnotes. The contents tables, the Bossuet appendix and the printer’s matter are left out. OCR corrected only by script: running heads and page numbers stripped, hyphenation rejoined, question and answer marks normalised, footnotes tied to their markers by page; quotation marks misread as digits or "£", some footnote markers and the notes that continue over a page remain imperfect, and one upside-down page in Book I, Dialogue XI is lost.',
       'tier': 'A', 'tierEvidence': 'Published London 1931, imprimatur 27 April 1931; Thorold died in 1936 and Chapman in 1933, so the text is public domain by the death rule. Caussade died in 1751.'}],
     'toc': toc}
    del d['description']['fr-FR']; del d['name']['fr-FR']
    json.dump(d, open(B + 'book.json', 'w'), ensure_ascii=False, indent=2); open(B + 'book.json', 'a').write('\n')
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    open(B + 'sources/english-originals/on-prayer-1931-thorold-archive-org.txt', 'w').write('\n'.join(L[966:15955]) + '\n')
