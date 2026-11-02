import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
V = bc.clean_volume(8)
paras = explode(V.split('\n\n'))
def idx(rx, after=0):
    return next(i for i in range(after, len(paras)) if re.match(rx, paras[i]) and len(paras[i]) < 80)
st = {}
st['fel'] = idx(r'^(DE )?.{0,2}TERNA FELICITATE SANCTORUM', 1500)
st['gem'] = idx(r'^(DE )?GEMITU', st['fel'] + 100)
st['sep'] = idx(r'^(DE )?SEPTEM VERBIS', st['gem'] + 100)
st['art'] = idx(r'^(DE )?ARTE BENE MORIENDI', st['sep'] + 100)
st['cog'] = idx(r'^(DE )?COGNITIONE DEI', st['art'] + 100)
st['end'] = idx(r'^INDEX', st['cog'] + 100)
NB = {'fel': 5, 'gem': 3, 'sep': 2, 'art': 2, 'cog': 1}
ORDN = ['fel', 'gem', 'sep', 'art', 'cog', 'end']
BN = ['', 'I', 'II', 'III', 'IV', 'V']
def latin(k):
    lo, hi = st[k], st[ORDN[ORDN.index(k) + 1]]
    bks = walk(paras, lo, hi, nbooks=NB[k])
    multi = NB[k] > 1
    first = bks[0][2][0][1]
    chs = []; log = []
    pre = [bc.fix(p) for p in clean_body(paras[lo:bks[0][1] if bks[0][1] else first][:])]
    pre = [p for p in pre if not re.match(r'^(LIBER|DE )', p)]
    allc = [(b[0], c) for b in bks for c in b[2]]
    for bi, b in enumerate(bks):
        prev = 0
        for ci, (n, i, inl) in enumerate(b[2]):
            if n != prev + 1: log.append(f'{k} liber {b[0]}: chapter(s) {prev+1}-{n-1} lost (heading not read)')
            prev = n
            nxt = b[2][ci + 1][1] if ci + 1 < len(b[2]) else (bks[bi + 1][1] or bks[bi + 1][2][0][1]) if bi + 1 < len(bks) else hi
            t, j = title_after(paras, i, inl)
            body = [bc.fix(p) for p in clean_body(paras[j:nxt])]
            cid = f'b{b[0]}c{n:02d}' if multi else f'c{n:02d}'
            h = f'Caput {roman(n)}' + (f'. {t}' if t else '')
            chs.append(dict(id=cid, title={'la': h}, group=(f'b{b[0]}', {'la': f'Liber {roman(b[0])}'}) if multi else None, md={'la': (h, body)}, bn=(b[0], n)))
    return pre, chs, log

META = {
 'fel': dict(slug='de-aeterna-felicitate', dir='ascetica/de-aeterna-felicitate', composed='1616',
   name={'la': 'De aeterna felicitate sanctorum', 'en-US': 'The Eternal Happiness of the Saints', 'pt-BR': 'A eterna felicidade dos santos'},
   desc={'la': 'Quinque libri de aeterna sanctorum felicitate, ex nominibus quibus Scriptura eam designat (regnum, domus, civitas, hereditas, corona). 1616.',
         'en-US': 'Five books on the eternal happiness of the saints, drawn from the names Scripture gives it: kingdom, house, city, inheritance, crown (1616). The Latin is the Vivès edition (1870-74) from an OCR scan; the English is John Dalton\'s translation (London: Richardson, mid-19th century).',
         'pt-BR': 'Cinco livros sobre a felicidade eterna dos santos, a partir dos nomes que a Escritura lhe dá (1616).'},
   en=('theeternalhappin00belluoft', 5, 'John Dalton', 'c. 1850', 'https://archive.org/details/theeternalhappin00belluoft', 'The Eternal Happiness of the Saints, trans. John Dalton (London: Richardson and Son, n.d. [18--]).')),
 'gem': dict(slug='de-gemitu-columbae', dir='ascetica/de-gemitu-columbae', composed='1617',
   name={'la': 'De gemitu columbae', 'en-US': 'On the Groaning of the Dove', 'pt-BR': 'O gemido da pomba'},
   desc={'la': 'Tres libri de bono lacrymarum et gemituum: de necessitate gemituum, de eorum fructibus, de rationibus gemendi (1617).',
         'en-US': 'Three books on the value of tears and groans in the Christian life (1617). Latin only: the Vivès edition (1870-74) from an OCR scan; no complete public-domain English translation exists.',
         'pt-BR': 'Três livros sobre o valor das lágrimas e dos gemidos na vida cristã (1617).'}, en=None),
 'sep': dict(slug='de-septem-verbis', dir='ascetica/de-septem-verbis', composed='1618',
   name={'la': 'De septem verbis a Christo in cruce prolatis', 'en-US': 'The Seven Words Spoken by Christ on the Cross', 'pt-BR': 'As sete palavras de Cristo na cruz'},
   desc={'la': 'Duo libri de septem verbis a Christo in cruce prolatis: explicatio litteralis et fructus ex singulis (1618).',
         'en-US': 'Two books on the seven last words of Christ: the literal sense of each word and the fruits to be drawn from it (1618). The Latin is the Vivès edition (1870-74) from an OCR scan; the English is the anonymous Burns & Oates translation of 1877.',
         'pt-BR': 'Dois livros sobre as sete palavras de Cristo na cruz: o sentido literal e os frutos de cada uma (1618).'},
   en=('sevenwordsspoken00bell', 2, 'Anonymous (Burns & Oates)', '1877', 'https://archive.org/details/sevenwordsspoken00bell', 'The Seven Words Spoken by Christ on the Cross (London: Burns & Oates, 1877), reprinted from the Messenger of the Sacred Heart.')),
 'art': dict(slug='de-arte-bene-moriendi', dir='ascetica/de-arte-bene-moriendi', composed='1620',
   name={'la': 'De arte bene moriendi', 'en-US': 'The Art of Dying Well', 'pt-BR': 'A arte de bem morrer'},
   desc={'la': 'Duo libri: praecepta vitae bene ducendae ut bene moriatur homo, et de adjumentis in extremo (1620).',
         'en-US': 'Two books on the art of dying well: how to live so as to die well, and the help of the sacraments and prayer at the end (1620). The Latin is the Vivès edition (1870-74) from an OCR scan; John Dalton\'s English of 1847 gives the first book only.',
         'pt-BR': 'Dois livros sobre a arte de bem morrer (1620).'},
   en=('theartofdyingwel00belluoft', 1, 'John Dalton', '1847', 'https://archive.org/details/theartofdyingwel00belluoft', 'The Art of Dying Well, trans. John Dalton (London, 1847): the first book only (sixteen chapters).')),
 'cog': dict(slug='de-cognitione-dei', dir='ascetica/de-cognitione-dei', composed='n.d.',
   name={'la': 'Tractatus de cognitione Dei', 'en-US': 'Treatise on the Knowledge of God', 'pt-BR': 'Tratado sobre o conhecimento de Deus'},
   desc={'la': 'Tractatus de cognitione Dei in tredecim capitibus, in tomo VIII operum a Vivès editus (auctoris adscriptio non confirmata).',
         'en-US': 'A short treatise on the knowledge of God in thirteen chapters, printed in the Vivès volume of Bellarmine\'s ascetical works (the attribution to Bellarmine is not verified). Latin only.',
         'pt-BR': 'Breve tratado sobre o conhecimento de Deus, impresso no volume ascético da edição Vivès (autoria não confirmada).'}, en=None),
}
def build(k):
    m = META[k]
    pre, chs, log = latin(k)
    chapters = []
    if sum(len(p.split()) for p in pre) >= 150:
        chapters.append(dict(id='praefatio', title={'la': 'Praefatio', 'en-US': 'Preface'}, md={'la': ('Praefatio', pre)}))
    for c in chs: c['title']['en-US'] = c['title']['la']; chapters.append(c)
    langs = ['la']; eds = {'la': dict(VIVES_ED)}; srcs = [vives_source(8)]
    if m['en']:
        f, nb, tr, yr, url, ed = m['en']
        d = en_split(f'{bc.SRC}/en/{f}.txt', nb=nb)
        have = {c['bn']: c for c in chs}
        ALL = ' '.join(q for v in d.values() for q in v[1])
        prev = None
        for key in sorted(d):
            t, ps = d[key]
            for q in ps: pass
            ps = [q for q in ps if not isjunk(q) and not re.match(r'(?i)^print\\w* by', q)]
            ps = dropcap_merge(repair_en(ps, ALL, (m['name']['en-US'].upper().replace('THE ETERNAL', 'THE ETERNAL'),)))
            t = titlecase(t) if t.isupper() else t.strip(' .')
            if key in have:
                c = have[key]; c['md']['en-US'] = (f'Chapter {key[1]}' + (f'. {t}' if t else ''), ps); c['title']['en-US'] = c['md']['en-US'][0]; prev = c
            elif prev and 'en-US' in prev['md']:
                prev['md']['en-US'][1].extend([f'## Chapter {key[1]}' + (f'. {t}' if t else '')] + ps); log.append(f'{k}: English chapter {key} has no Latin chapter (heading unread there); appended to the previous')
        langs.append('en-US'); eds['en-US'] = {'translator': tr, 'year': int(re.sub(r'\D', '', yr)[:4])}
        srcs.append({'language': 'en-US', 'url': url, 'edition': ed, 'description': 'Archive.org OCR (djvu.txt): page heads removed, lines rejoined; a few chapter-opening letters lost to drop caps and some words split at line ends remain.', 'tier': 'A', 'tierEvidence': 'Published before 1928; public domain.'})
    for c in chapters: c['title'] = {l: v for l, v in c['title'].items() if l in langs or l in ('en-US',)}
    for c in chapters: c.pop('bn', None); 
    for c in chapters:
        if c.get('group'): c['group'] = (c['group'][0], {**c['group'][1], 'en-US': c['group'][1]['la'].replace('Liber', 'Book')})
    names = m['name']; 
    d = mkbook('bellarmine-' + m['slug'], m['slug'], names, m['desc'], m['composed'], langs, eds, srcs)
    wc = write_book(m['dir'], d, chapters)
    author_file()
    return wc, log

if __name__ == '__main__':
    for k in sys.argv[1:]:
        wc, log = build(k); print(k, wc); print('\n'.join(log))
