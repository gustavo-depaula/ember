import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from bede_common import *
def verse(body):
    blocks = []; cur = []
    for l in body.split('\n'):
        l = re.sub(r'\s+', ' ', l).strip()
        if not l:
            if cur: blocks.append(cur); cur = []
        else: cur.append(l)
    if cur: blocks.append(cur)
    return ['  \n'.join(b) for b in blocks]
def prep(raw):
    raw = strip_wiki(raw)
    raw = re.sub(r'\(\d{4}[A-D]?\)', '', raw)
    raw = re.sub(r'\[\[Categoria[^\]]*\]\]', '', raw)
    raw = re.sub(r'(?m)^.*Migne .?Patrologia Latina.? Tomus.*$|^.*\(Beda\), J\. P\. Migne\s*$', '', raw)
    return re.sub(r'</?poem>', '', raw)
raws = []
raw = read_ws('Hymni_XIII'); raws.append(raw)
parts = re.split(r'(?m)^==\s*(.*?)\s*==\s*$', prep(raw))
la = {}; toc = []
for h, body in zip(parts[1::2], parts[2::2]):
    m = re.match(r'HYMNUS ([A-Z]+)\.\s*(.*)$', h)
    n = len(toc) + 1
    num = roman(n); ttl = 'Hymnus %s' % num
    la['h%02d' % n] = '# %s\n\n**%s**\n\n' % (ttl, m.group(2).strip()) + '\n\n'.join(verse(body))
    toc.append({'id': 'h%02d' % n, 'title': {'la': ttl, 'en-US': 'Hymn %s' % num}})
for name, cid, ttl, ttle in [('De_die_judicii', 'de-die-iudicii', 'De die iudicii', 'On the Day of Judgment'), ('Epigramma_de_B._Joanne_et_ejus_Apocalypsi', 'epigramma-ioannes', 'Epigramma de beato Ioanne et eius Apocalypsi', 'Epigram on St. John and his Apocalypse')]:
    r = read_ws(name); raws.append(r)
    t = prep(r)
    t = re.sub(r'(?m)^' + re.escape(ttl.split(' ')[0]) + r'.*$', '', t, count=0) if False else t
    t = re.sub(r'^\s*(De die judicii|EPIGRAMMA[^\n]*)\s*$', '', t, count=1, flags=re.M | re.I)
    la[cid] = '# %s\n\n' % ttl + '\n\n'.join(verse(t))
    toc.append({'id': cid, 'title': {'la': ttl, 'en-US': ttle}})
book = {"id": "bede-hymni-et-carmina", "cover": "classic",
 "name": {"la": "Hymni et carmina", "en-US": "Hymns and Poems", "pt-BR": "Hinos e Poemas"}, "author": bede_author(),
 "description": {
  "la": "Hymni XIII, De die iudicii et Epigramma de beato Ioanne, quae Bedae adscribuntur (PL 94).",
  "en-US": "The hymns and poems printed under Bede's name in Migne: the thirteen hymns (on the reckoning of time, the Innocents, the Ascension, St. Agnes, St. John the Baptist, Peter and Paul, the Mother of God, St. Andrew), the poem On the Day of Judgment, and the epigram on St. John and the Apocalypse. The attribution of the hymns, which mix authentic and doubtful pieces, is uncertain. Latin text of Migne; no public-domain English translation of the whole is available (19th-century hymnal versions of single hymns exist).",
  "pt-BR": "Os hinos e poemas impressos sob o nome de Beda em Migne: os treze hinos (sobre o cômputo do tempo, os Inocentes, a Ascensão, Santa Inês, São João Batista, Pedro e Paulo, a Mãe de Deus, Santo André), o poema Sobre o Dia do Juízo e o epigrama sobre São João e o Apocalipse. A atribuição dos hinos, que misturam peças autênticas e duvidosas, é incerta."},
 "composed": "c. 700-735", "languages": ["la"], "work": "bede/hymni-et-carmina",
 "editions": {"la": {"editor": "Migne, Patrologia Latina 94 (1862), after Giles", "year": 1862}},
 "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Scriptor:Beda_Venerabilis",
   "edition": "Hymni XIII (Beda), De die judicii (Beda) and Epigramma de B. Joanne et ejus Apocalypsi on Latin Wikisource, from the Corpus Corporum TEI of Migne's Patrologia Latina 94.",
   "description": "Wikitext removed; inline PL column numbers dropped; verse lines kept with line breaks; one file per hymn or poem.",
   "tier": "A", "tierEvidence": "Eighth-century texts (attribution doubtful for some hymns) in Migne's reprint: public domain."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(BD + 'hymni-et-carmina', book, {'la': la}, '\n---\n'.join(raws), 'hymni-et-carmina')
print(len(la), sum(words(m) for m in la.values()))
