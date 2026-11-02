import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/catherine-of-genoa/raw/'
BOOKS = '/Users/gustavo/Documents/prayer/content/books/catherine-of-genoa-opera-omnia/'
L = open(RAW + 'life.txt').read().split('\n')
# insert the lost chapter XXXIV heading
k = next(i for i, l in enumerate(L) if l.strip().startswith('Catherine persevered in this way for about twenty-five'))
L[k:k] = ['  CHAPTER XXXIV', '', '   How God gave the saint a confessor in her extreme need, who', '   understood her and greatly consoled her.', '']

def paras(lines):
    out = []; cur = []
    for l in lines:
        s = l.strip()
        if not s or set(s) <= {'_'}:
            if cur: out.append(' '.join(cur)); cur = []
            continue
        cur.append(s)
    if cur: out.append(' '.join(cur))
    out = [re.sub(r'(\w)- (\w)', r'\1-\2', p) for p in out]
    return out

ROM = lambda n: n
def chapters(lo, hi, prefix, label):
    idx = [i for i in range(lo, hi) if re.match(r'^  CHAPTER [IVXL]+$', L[i])]
    res = []
    for j, i in enumerate(idx):
        e = idx[j + 1] if j + 1 < len(idx) else hi
        num = L[i].split()[1].replace('XLL', 'XLI')
        ps = paras(L[i + 1:e])
        # drop part headings that trail a chapter
        while ps and (ps[-1].isupper() or ps[-1].startswith(('SPIRITUAL DIALOGUES PART', 'FIRST PART', 'TREATISE ON'))): ps.pop()
        title = ps[0]; body = ps[1:]
        res.append((num, title, body))
    return res

def find(s, start=0):
    return next(i for i in range(start, len(L)) if L[i].startswith(s))

iVita = find('LIFE AND DOCTRINE OF SAINT CATHERINE OF GENOA'); iD = find('SPIRITUAL DIALOGUE BETWEEN'); iP2 = find('SPIRITUAL DIALOGUES PART SECOND'); iP3 = find('SPIRITUAL DIALOGUES PART THIRD'); iT = find('TREATISE ON PURGATORY'); iEnd = find('   THE END')
iIntro = find('INTRODUCTION')
def intro_paras():
    return [p for p in paras(L[iIntro + 1:iVita - 1]) if not re.match(r'^\[\d\]', p)]
FOOT = {'S. Luke x, 16': 1}
def mk(num, title, body): return ('Chapter %s. %s' % (num, title), '\n\n'.join(body))
def word_ids(pfx, items): return [('%s%02d' % (pfx, i + 1), it) for i, it in enumerate(items)]

def src(url, ed, desc, tier='A', ev='The 1874 New York translation and its 1907 reprint are anonymous or by Hecker\'s circle (Hecker died 1888); public domain everywhere.'):
    return {'language': 'en-US', 'url': url, 'edition': ed, 'description': desc, 'tier': tier, 'tierEvidence': ev}
CCEL = 'https://ccel.org/ccel/catherine_g/life'
ED = 'Life and Doctrine of Saint Catherine of Genoa, translated from the Italian, New York: Catholic Publication Society 1874 (reprinted Christian Press Association 1907), introduction by Isaac T. Hecker. CCEL transcription (proofed), checked against the Internet Archive scan lifedoctrineofsa0000vari.'
AUTH = {'it': 'Santa Caterina da Genova', 'en-US': 'St. Catherine of Genoa', 'pt-BR': 'Santa Catarina de Gênova'}
EDI = {'en-US': {'translator': 'Anonymous (Catholic Publication Society, introduction by I. T. Hecker)', 'year': 1874}}

def book(root, bid, name, desc, composed, work, ch, sources, edi=EDI, langs=('en-US',)):
    meta = {'id': bid, 'cover': 'classic', 'name': name, 'author': AUTH, 'description': desc, 'composed': composed, 'languages': list(langs), 'work': work, 'editions': edi, 'sources': sources}
    return emit(BOOKS + root, meta, ch)

if __name__ == '__main__':
    # Vita
    vita = chapters(iVita, iD, 'c', 'Chapter')
    ch = [('intro', {'en-US': ('Introduction (Hecker)', '\n\n'.join(intro_paras()))})]
    ch += [('c%02d' % (i + 1), {'en-US': mk(*v)}) for i, v in enumerate(vita)]
    print(len(vita))
    print(book('vita-e-dottrina-en', 'catherine-genoa-vita-dottrina-en', {'en-US': 'Life and Doctrine of Saint Catherine of Genoa', 'it': 'Vita mirabile e dottrina santa (trad. inglese, 1874)', 'pt-BR': 'Vida e doutrina de Santa Catarina de Gênova'},
      {'en-US': 'The life of St. Catherine Fieschi Adorno of Genoa (1447-1510), the mystic of pure love and of the divine fire that purifies, as written down by her confessor Cattaneo Marabotto and her disciple Ettore Vernazza and published as the Vita mirabile e dottrina santa: her early years and unwanted marriage, her conversion in 1473, her years of service at the Pammatone hospital, her interior purification, her sufferings and her death. In forty-two chapters, with Isaac Hecker’s introduction. This is the 1874 English translation; the Italian original (Vita mirabile, Padua 1743) exists in a long-s OCR only and is not yet imported.', 'it': 'Vita di santa Caterina Fieschi Adorno di Genova (1447-1510), scritta dal confessore Cattaneo Marabotto e da Ettore Vernazza. Traduzione inglese del 1874; l’originale italiano non è ancora importato.', 'pt-BR': 'A vida de santa Catarina Fieschi Adorno de Gênova (1447-1510), a mística do puro amor e do fogo divino que purifica, escrita por seu confessor Cattaneo Marabotto e pelo discípulo Ettore Vernazza. Tradução inglesa de 1874.'},
      '1507-1551', 'catherine-of-genoa/vita', ch,
      [src(CCEL + '/life', ED, 'Hecker’s introduction and the forty-two chapters of the Life with their rubrics. The CCEL text lacks the heading of chapter XXXIV (How God gave the saint a confessor in her extreme need); it is restored here from the scan’s table of contents and the chapter’s start. The Spiritual Dialogue and the Treatise on Purgatory of the same volume are separate books.')]))
    # Dialogo
    parts = [('Part I', chapters(iD, iP2, 'p1', ''), 'p1'), ('Part II', chapters(iP2, iP3, 'p2', ''), 'p2'), ('Part III', chapters(iP3, iT, 'p3', ''), 'p3')]
    intro = paras(L[iD + 1:iD + 17])
    ch = [('intro', {'en-US': ('Argument of the Spiritual Dialogue', '\n\n'.join(intro))})]
    for lab, cs, pid in parts:
        for i, (num, title, body) in enumerate(cs):
            ch.append(('%sc%02d' % (pid, i + 1), {'en-US': ('%s, Chapter %s. %s' % (lab, num, title), '\n\n'.join(body))}))
    print([len(c[1]) for c in parts])
    print(book('dialogo-spirituale-en', 'catherine-genoa-dialogo-spirituale-en', {'en-US': 'Spiritual Dialogue (attributed to St. Catherine of Genoa)', 'it': 'Dialogo spirituale (attribuito, trad. inglese 1874)', 'pt-BR': 'Diálogo espiritual (atribuído a Santa Catarina de Gênova)'},
      {'en-US': 'The Spiritual Dialogue between the Soul, the Body, Self-love, the Spirit, Humanity and the Lord God, attributed to St. Catherine of Genoa and printed with her Life in 1551: in three parts, her worldly entanglements and conversion, the sublime perfection of the spiritual life, and the divine love with its effects. Scholars attribute the second and third parts largely to the hand of her disciple Battista Vernazza, working from Catherine’s teaching. English translation of 1874 (21, 11 and 13 chapters). The Italian original exists only in long-s OCR of the 1590 and 1743 prints and is not yet imported.', 'it': 'Il Dialogo spirituale tra l’Anima, il Corpo, l’Amor proprio, lo Spirito, l’Umanità e il Signore Iddio, attribuito a santa Caterina da Genova. Traduzione inglese del 1874; l’originale italiano non è ancora importato.', 'pt-BR': 'O Diálogo espiritual entre a Alma, o Corpo, o Amor-próprio, o Espírito, a Humanidade e o Senhor Deus, atribuído a santa Catarina de Gênova, em três partes. Tradução inglesa de 1874.'},
      '1551', 'catherine-of-genoa/dialogo-spirituale', ch,
      [src(CCEL + '/life', ED, 'The argument and the three parts of the Spiritual Dialogue (21, 11 and 13 chapters) with their rubrics. Attribution: the work is traditionally ascribed to Catherine; the second and third parts are widely held to be by Battista Vernazza.')]))
    # Trattato (English)
    tr = chapters(iT, iEnd, 't', '')
    intro = paras(L[iT + 1:iT + 7])
    ch = [('intro', {'en-US': ('Argument', '\n\n'.join(intro))})]
    ch += [('c%02d' % (i + 1), {'en-US': mk(*v)}) for i, v in enumerate(tr)]
    print(len(tr))
    print(book('trattato-del-purgatorio-en', 'catherine-genoa-purgatorio-en', {'en-US': 'Treatise on Purgatory', 'it': 'Trattato del Purgatorio (trad. inglese 1874)', 'pt-BR': 'Tratado do Purgatório (trad. inglesa 1874)'},
      {'en-US': 'The Treatise on Purgatory of St. Catherine of Genoa: the divine fire that she felt in herself made her understand the state of the souls in purgatory, who are consumed with the love of God, content in the torment, and wish only to be wholly purified. The 1874 English translation in seventeen chapters; the Italian text, in nineteen chapters, is a separate book.', 'it': 'Il Trattato del Purgatorio di santa Caterina da Genova nella traduzione inglese del 1874, in diciassette capitoli; il testo italiano, in diciannove capitoli, è un libro a parte.', 'pt-BR': 'O Tratado do Purgatório de santa Catarina de Gênova: o fogo divino que ela sentia em si a fez compreender o estado das almas do purgatório. Tradução inglesa de 1874, em dezessete capítulos.'},
      '1551', 'catherine-of-genoa/trattato-del-purgatorio', ch,
      [src(CCEL + '/life', ED, 'The seventeen chapters of the Treatise on Purgatory with the argument. Cardinal Manning’s independent translation of 1858 (https://archive.org/details/TreatiseOnPurgatory) was not used.')]))
