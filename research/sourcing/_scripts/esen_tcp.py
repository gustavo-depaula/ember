"""EEBO-TCP XML -> nested en-US book, splitting any div over MAXW words into its child divs. usage: esen_tcp.py KEY"""
import sys, os, re, json
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
import rhb_tcp as T
import esen_lib as B
NS = T.NS; tag = T.tag
MAXW = 15000
SMALL = {'of', 'the', 'and', 'in', 'to', 'for', 'by', 'a', 'at', 'on', 'from', 'as', 'or', 'with', 'is', 'it'}
def fixch(t, vv):
    t = t.replace('ſ', 's').replace('ʃ', 's')
    if vv: t = re.sub(r'vv', 'w', t); t = re.sub(r'VV', 'W', t); t = re.sub(r'Vv', 'W', t)
    t = re.sub(r'\s*depiction of Christ\b', '', t)
    return t
def title_fix(t, vv):
    t = fixch(t, vv); t = re.sub(r'\s*\[…\]\s*', ' ', t); t = re.sub(r'\s*[〈<].*$', '', t).strip(' .:;,')
    parts = re.split(r'(?<=[a-z])\.\s+(?=[A-Z])', t)
    if len(parts) > 2 and not re.search(r'\b(Cap|Chap)$', parts[0]): t = '. '.join(parts[:2])
    u = re.sub(r'[^A-Za-z]', '', t)
    if u and sum(c.isupper() for c in u) > 0.6 * len(u):
        w = t.title().split(); w = [x.lower() if i and x.lower() in SMALL else x for i, x in enumerate(w)]
        t = re.sub(r"(['’])S\b", r"\1s", ' '.join(w))
    t = re.sub(r'\b(Cap|Chap)\.\s+([IVXLivxl]+)\b', lambda m: m.group(1) + '. ' + m.group(2).upper(), t)
    t = re.sub(r'\s+', ' ', t)
    if len(t) > 100: t = t[:100].rsplit(' ', 1)[0] + '…'
    return t
def words(d): return len(' '.join(d.itertext()).split())
def run(cfg):
    path = B.ROOT + '/research/sourcing/more-and-fisher/tcp/' + cfg['src']
    r = ET.parse(path).getroot(); text = r.find(NS + 'text'); vv = cfg.get('vv', False)
    root = os.path.join(B.ROOT, 'content/books', cfg['dir'])
    os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
    for f in os.listdir(root + '/en-US'): os.remove(root + '/en-US/' + f)
    st = {'n': 0, 'words': 0, 'gaps': 0}
    def write(d, title, own_only=False):
        st['n'] += 1; cid = 'c%03d' % st['n']
        cx = T.Ctx(); ps = []; T.blocks(d, cx, ps)
        if not own_only:
            def rec(dd, lvl):
                for k in dd:
                    if tag(k) == 'div':
                        ps.append('#' * min(lvl, 6) + ' ' + title_fix(T.title_of(k, ''), vv)); T.blocks(k, cx, ps); rec(k, lvl + 1)
            rec(d, 2)
        ps = [fixch(p, vv) for p in ps if p.strip('# ')]
        md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
        if cx.notes: md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, fixch(n, vv)) for i, n in enumerate(cx.notes)) + '\n'
        open('%s/en-US/%s.md' % (root, cid), 'w').write(md); st['words'] += len(md.split()); st['gaps'] += cx.gaps
        return {'id': cid, 'title': {'en-US': title}}
    def node(d, fallback, forcetitle=None):
        title = forcetitle or title_fix(T.title_of(d, fallback), vv)
        kids = [k for k in d if tag(k) == 'div']
        if words(d) <= MAXW or not kids: return write(d, title)
        children = []
        intro = []; T.blocks(d, T.Ctx(), intro)
        if sum(len(p.split()) for p in intro) > 60: children.append(write(d, title, own_only=True))
        for i, k in enumerate(kids): children.append(node(k, 'Section %d' % (i + 1)))
        return {'id': 'g%03d' % (st['n'] + 1), 'title': {'en-US': title}, 'children': children}
    toc = []
    for part in cfg['parts']:  # list of (xpath-ish, kwargs)
        sel = text if part.get('text') is None else text.findall('.//' + NS + 'text')[part['text']]
        for sect in part['sections']:
            el = sel.find(NS + sect)
            if el is None: continue
            divs = [d for d in el if tag(d) == 'div']
            for i, d in enumerate(divs):
                if d.get('type') in cfg.get('skip', ()) or (d.get('type') == 'table_of_contents' and not cfg.get('toc')): continue
                if d.get('type') == 'title_page': continue
                ft = cfg.get('titles', {}).get(d.get('type'))
                toc.append(node(d, 'Section %d' % (i + 1), ft))
    def patch(ts):
        for t in ts:
            if t['id'] in cfg.get('patch', {}):
                t['title']['en-US'] = cfg['patch'][t['id']]; f = '%s/en-US/%s.md' % (root, t['id'])
                if os.path.exists(f):
                    x = open(f).read().split('\n', 1); open(f, 'w').write('# ' + cfg['patch'][t['id']] + '\n' + x[1])
            patch(t.get('children', []))
    patch(toc)
    open(root + '/sources/en-US-originals/%s.xml' % cfg['slug'], 'w').write(open(path).read())
    book = {'id': cfg['id'], 'cover': 'quarter', 'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
            'author': {'es-ES': 'Fray Luis de Granada', 'en-US': 'Louis of Granada', 'pt-BR': 'Frei Luís de Granada'},
            'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']}, 'composed': cfg['composed'], 'languages': ['en-US'], 'work': cfg['work'],
            'editions': {'en-US': {'translator': cfg['translator'], 'year': cfg['year']}},
            'sources': [{'language': 'en-US', 'url': 'https://github.com/textcreationpartnership/%s' % cfg['src'][:-4], 'edition': cfg['edition'],
                         'description': 'EEBO-TCP hand-keyed transcription (%s), old spelling kept; long s printed as s%s. %d illegible places in the source are marked […]. Marginal notes are footnotes. Raw TEI in sources/en-US-originals/.' % (cfg['src'][:-4], ', vv as w' if vv else '', st['gaps']),
                         'tier': 'A', 'tierEvidence': 'Printed %d; the TCP transcription is released to the public domain (CC0).' % cfg['year']}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print(root, st['n'], 'files', st['words'], 'words', st['gaps'], 'gaps')
G = dict(composed='1554', slug='tcp')
CFGS = {
 'hopkins': dict(G, id='granada-libro-de-la-oracion-hopkins', dir='louis-of-granada-opera-omnia/libro-de-la-oracion-hopkins', src='A06436.xml', work='louis-of-granada/libro-de-la-oracion',
   name='Of Prayer and Meditation (Hopkins, 1582)', name_pt='Da oração e meditação (Hopkins, inglês, 1582)', translator='Richard Hopkins (1582)', year=1582,
   edition="Of Prayer and Meditation, wherein are conteined fowertien devoute meditations for the seven daies of the weeke, translated by Richard Hopkins (1582), EEBO-TCP A06436.",
   desc="Richard Hopkins's 1582 English version of the first part of Louis of Granada's Libro de la oración y meditación: the great profit of consideration, the five parts of prayer, the fourteen meditations for the mornings and evenings of the week, the advices for meditation and the six points of the Redemption. The Spanish book's second part (on devotion) is not in this volume, and the division of chapters differs, so it is its own book.",
   desc_pt='A versão inglesa de Richard Hopkins (1582) da primeira parte do Libro de la oración y meditación de Luís de Granada.',
   patch={'c009': 'Tewsdaie Morninge', 'c017': 'Wensdaie Nighte. Of the Hower of Deathe', 'c018': 'Thvrsdaie Nighte. Of the Generall Daye of Ivdgement', 'c019': 'Frydaie Nighte. Of the Paynes of Hell'},
   parts=[dict(sections=['front', 'body'])], skip=('title_page',), titles={'dedication': 'Dedication', 'translator_to_the_reader': 'The Translator to the Reader', 'to_the_reader': 'An Exhortation to the Christian Reader', 'authors_dedication': "The Author's Dedication", 'prologue': 'The Prologue and Argument of This Book'}),
 'meres-devotion': dict(G, id='granada-libro-de-la-oracion-meres', dir='louis-of-granada-opera-omnia/libro-de-la-oracion-meres-devotion', src='A06431.xml', work='louis-of-granada/libro-de-la-oracion',
   name='Granados Devotion (Meres, 1598)', name_pt='A devoção de Granada (Meres, inglês, 1598)', translator='Francis Meres (1598)', year=1598,
   edition="Granados Devotion, exactly teaching how a man may truely dedicate and devote himselfe vnto God, englished by Francis Meres (1598), EEBO-TCP A06431.",
   desc="Francis Meres's 1598 English version of the second part of Louis of Granada's Libro de la oración y meditación, on devotion: what it is, the things that beget it, the impediments to it, the temptations and the admonitions about prayer. Meres worked from the Latin, Italian and French, so the divisions differ from the Spanish and this is its own book.",
   desc_pt='A versão inglesa de Francis Meres (1598) da segunda parte do Libro de la oración, sobre a devoção.',
   parts=[dict(sections=['front', 'body'])], skip=('title_page',), titles={}),
 'meres-exercises': dict(G, id='granada-meditaciones-meres', dir='louis-of-granada-opera-omnia/manual-y-opusculos-meres-exercises', src='A06448.xml', work='louis-of-granada/manual-y-opusculos',
   name='Granados Spiritual and Heavenly Exercises (Meres, 1598)', name_pt='Exercícios espirituais e celestiais de Granada (Meres, inglês, 1598)', translator='Francis Meres (1598)', year=1598, vv=True,
   edition="Granados Spirituall and Heavenlie Exercises, divided into seven pithie and briefe meditations, for every day in the weeke one, englished by Francis Meres (1598), EEBO-TCP A06448, with the Exposition of the 51st Psalm and a Prayer of the name of Jesus bound with it.",
   desc="Francis Meres's 1598 English version of Louis of Granada's seven short meditations for the days of the week (prologue, then Monday to Sunday), with the volume's exposition of Psalm 51 and a prayer on the name of Jesus. It follows the Latin and French redactions, not a single chapter of the Spanish Manual, so it is its own book.",
   desc_pt='A versão inglesa de Francis Meres (1598) das sete meditações para os dias da semana de Luís de Granada, com uma exposição do Salmo 51.',
   patch={'c002': 'The Prologue, and a Brief Manner of Meditation', 'c003': 'The First Meditation, for Monday', 'c010': 'Dedication to the Lady Judith Kinaston', 'c011': 'An Exposition upon the Fifty-first Psalm'},
   parts=[dict(text=0, sections=['front', 'body']), dict(text=1, sections=['front', 'body'])], skip=('title_page',), titles={'dedication': 'Dedication'}),
 'gibbons': dict(G, id='granada-doctrina-espiritual-gibbons', dir='louis-of-granada-opera-omnia/doctrina-espiritual-gibbons', src='A06450.xml', work='louis-of-granada/doctrina-espiritual', composed='1587',
   name='A Spiritual Doctrine (Gibbons, 1599)', name_pt='Doutrina espiritual (Gibbons, inglês, 1599)', translator='Richard Gibbons (Louvain, 1599)', year=1599, vv=True,
   edition="A Spiritual Doctrine conteining a rule to live well, with divers praiers and meditations, newly translated out of Spanish into English by Richard Gibbons (Louvain: Laurence Kellam, 1599), EEBO-TCP A06450.",
   desc="Richard Gibbons's 1599 English version of Louis of Granada's Doctrina espiritual: six treatises on mental prayer, vocal prayer, remedies against temptations, a rule of Christian life, the sacrament of Penance, and preparation for Communion. The treatises are divided differently from the Spanish book, so it is its own book.",
   desc_pt='A versão inglesa de Richard Gibbons (1599) da Doutrina espiritual de Luís de Granada.',
   parts=[dict(sections=['front', 'body'])], skip=('title_page',), titles={'dedication': 'Dedication', 'translator_to_the_reader': 'The Translator to the Reader', 'author_to_the_reader': 'The Author to the Christian Reader'}),
}
if __name__ == '__main__': run(CFGS[sys.argv[1]])
