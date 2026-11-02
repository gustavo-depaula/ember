import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
W = '/Users/gustavo/Documents/prayer/research/sourcing/scupoli/ws/'
BK = '/Users/gustavo/Documents/prayer/content/books/scupoli-opera-omnia/'
def title_case(t):
    small = {'of', 'the', 'a', 'an', 'in', 'and', 'to', 'for', 'on', 'with', 'by', 'at', 'from', 'as', 'is', 'be', 'it', 'or'}
    return t
def parse(fn, start_marker=None):
    t = open(W + fn).read()
    ps = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', t)]
    ps = [p for p in ps if p and not re.fullmatch(r'\d+', p) and 'MUIR AND PATERSON' not in p]
    chs = []
    for i, p in enumerate(ps):
        m = re.fullmatch(r'CHAPTER ([IVXLC]+)\.?', p)
        if m: chs.append([m.group(1), ps[i + 1], []]); continue
        if chs and p is not chs[-1][1] and not (len(chs[-1]) and p == chs[-1][1] and not chs[-1][2]): chs[-1][2].append(p)
    return chs
def mk(fn, root, meta):
    chs = parse(fn)
    ch = [('c%02d' % (i + 1), {'en-US': ('Chapter %s. %s' % (n, t.rstrip('.')), '\n\n'.join(b))}) for i, (n, t, b) in enumerate(chs)]
    return emit(BK + root, meta, ch), len(chs)
def src(page, desc):
    return [{'language': 'en-US', 'url': 'https://en.wikisource.org/wiki/The_Spiritual_Combat/' + page,
      'edition': 'The Spiritual Combat, a new translation, Library of Spiritual Works for English Catholics, London/Oxford/Cambridge: Rivingtons, 1875. English Wikisource transcription (proofread from scan index Spiritualcombat.djvu).',
      'description': desc + ' The series was Anglo-Catholic, but the Catholic content is kept. The Italian original of this piece (Venice 1770 and other collected editions) exists only as long-s OCR and is not imported.',
      'tier': 'A', 'tierEvidence': 'Published 1875 by an anonymous translator: public domain in the US (before 1931).'}]
AUTH = {'it': 'Lorenzo Scupoli, C.R.', 'en-US': 'Lorenzo Scupoli, C.R.', 'pt-BR': 'Lorenzo Scupoli, C.R.'}
ED = {'en-US': {'translator': 'Anonymous (Library of Spiritual Works for English Catholics, London: Rivingtons)', 'year': 1875}}
M1 = {'id': 'scupoli-aggiunta-en', 'cover': 'classic',
 'name': {'en-US': 'The Supplement to the Spiritual Combat', 'it': 'Aggiunta al Combattimento spirituale (trad. inglese 1875)', 'pt-BR': 'Suplemento ao Combate espiritual'},
 'author': AUTH,
 'description': {'en-US': 'The Supplement (Aggiunta) that Scupoli added to the Spiritual Combat, in thirty-eight short chapters: the nature of Christian perfection, the necessity of the conflict, the three things the young soldier of Christ needs, and further counsels on the spiritual war, the passions, prayer and the examination of conscience. English translation of 1875; the Italian is not yet imported.',
   'it': 'L’Aggiunta di Scupoli al Combattimento spirituale, in trentotto brevi capitoli. Traduzione inglese del 1875; l’originale italiano non è ancora importato.',
   'pt-BR': 'O Suplemento (Aggiunta) de Scupoli ao Combate espiritual, em trinta e oito capítulos breves. Tradução inglesa de 1875.'},
 'composed': 'c. 1600', 'languages': ['en-US'], 'work': 'scupoli/aggiunta', 'editions': ED, 'sources': src('Supplement', 'The thirty-eight chapters of the Supplement with their rubrics.')}
M2 = {'id': 'scupoli-pace-interiore-en', 'cover': 'classic',
 'name': {'en-US': 'Of Interior Peace, or The Path to Paradise', 'it': 'Della pace interiore, o Sentiero del Paradiso (trad. inglese 1875)', 'pt-BR': 'Da paz interior, ou O caminho do Paraíso'},
 'author': AUTH,
 'description': {'en-US': 'The short treatise of Scupoli on interior peace, called the Path to Paradise: how to govern the heart, keep a peaceful spirit under temptation, and walk the road of the cross with confidence in God. English translation of 1875; the Italian is not yet imported.',
   'it': 'Il breve trattato di Scupoli sulla pace interiore, detto Sentiero del Paradiso. Traduzione inglese del 1875; l’originale italiano non è ancora importato.',
   'pt-BR': 'O breve tratado de Scupoli sobre a paz interior, chamado Caminho do Paraíso. Tradução inglesa de 1875.'},
 'composed': 'c. 1600', 'languages': ['en-US'], 'work': 'scupoli/sentiero-del-paradiso', 'editions': ED, 'sources': src('Interior_Peace', 'The chapters of Of Interior Peace, or the Path to Paradise.')}
print(mk('Supplement.txt', 'aggiunta-en', M1)); print(mk('Interior_Peace.txt', 'sentiero-del-paradiso-en', M2))
