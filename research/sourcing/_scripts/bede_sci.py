import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from bede_common import *
from bede_comm import CAP, SUB
def split_caps(name):
    raw = read_ws(name)
    t = clean_ws(raw)
    t = re.sub(r'(?m)^.*\(Beda\), J\. P\. Migne\s*$', '', t)
    t = re.sub(r'(?m)^\s*\(cf\.[^\n]*$|^\s*\'\'\(cf[^\n]*$', '', t)
    t = re.sub(r'</?poem>', '', t)
    secs = [('Praefatio', [])]; buf = []; vbuf = False
    def flush():
        if buf:
            secs[-1][1].append(('  \n' if len(buf) > 1 and all(len(x) < 90 for x in buf) else ' ').join(re.sub(r'\s+', ' ', x) for x in buf))
            buf.clear()
    for line in t.split('\n'):
        l = line.strip()
        if not l: flush(); continue
        m = CAP.match(l)
        if m:
            flush()
            num = 'I' if m.group(1) == 'PRIMUM' else (roman(int(m.group(1))) if m.group(1).isdigit() else m.group(1))
            secs.append(('Caput %s' % num, []))
            rub = m.group(2).strip().rstrip('.')
            if rub: secs[-1][1].append('**%s**' % rub)
            continue
        if SUB.match(l) and len(l) < 90:
            flush(); secs[-1][1].append('**%s**' % (l.rstrip('.').capitalize() if l.isupper() else l.rstrip('.'))); continue
        buf.append(l)
    flush()
    return raw, [s for s in secs if s[1]]
CFG = {
 'dtr': ('De_ratione_temporum', 'bede-de-temporum-ratione', 'de-temporum-ratione', 'De temporum ratione', 'The Reckoning of Time', 'O Cômputo do Tempo', '725',
   'De temporum ratione liber, ad Hwaetberhtum abbatem: computus ecclesiasticus, cum chronica maiore.',
   "Bede's masterwork of the calendar (725): finger-counting, the divisions of time, the months of the Greeks, Romans and English, the lunar and solar cycles, the calculation of Easter, and, in chapter 66, the Chronica maiora, a chronicle of the six ages of the world. Latin text of Migne (PL 90); no public-domain English translation is known.",
   'A obra-prima de Beda sobre o calendário (725): o cômputo digital, as divisões do tempo, os meses de gregos, romanos e ingleses, os ciclos lunar e solar, o cálculo da Páscoa e, no capítulo 66, a Chronica maior, uma crônica das seis idades do mundo.', 'PL 90'),
 'dnr': ('De_natura_rerum_Beda_', 'bede-de-natura-rerum', 'de-natura-rerum', 'De natura rerum', 'On the Nature of Things', 'Sobre a Natureza das Coisas', 'c. 703',
   'De natura rerum liber, compendium cosmographicum ex Isidoro.',
   "Bede's early compendium of cosmology (c. 703), drawn chiefly from Isidore of Seville and Pliny: the creation of the world, the elements, the heavens, winds, tides, thunder, earthquakes. Latin text of Migne (PL 90); no public-domain English translation is known.",
   'O compêndio cosmológico do jovem Beda (c. 703), tirado sobretudo de Isidoro de Sevilha e Plínio: a criação do mundo, os elementos, os céus, ventos, marés, trovões e terremotos.', 'PL 90'),
 'dt': ('De_temporibus_Beda_', 'bede-de-temporibus', 'de-temporibus', 'De temporibus', 'On Times', 'Sobre os Tempos', '703',
   'De temporibus liber, brevis tractatus de temporum divisionibus et de aetatibus mundi (703).',
   "Bede's short early treatise on the divisions of time and the six ages of the world (703), the seed of his later De temporum ratione. Latin text of Migne (PL 90); no public-domain English translation is known.",
   'O breve tratado do jovem Beda sobre as divisões do tempo e as seis idades do mundo (703), semente do posterior De temporum ratione.', 'PL 90'),
}
key = sys.argv[1]
name, bid, slug, la_name, en_name, pt_name, composed, la_d, en_d, pt_d, pl = CFG[key]
raw, secs = split_caps(name)
chs = {}; toc = []
for k, (title, blocks) in enumerate(secs):
    cid = 'praefatio' if title == 'Praefatio' else 'c%02d' % int(re.sub(r'\D', '', '0') or 0) if False else None
    cid = 'praefatio' if title == 'Praefatio' else 'c%02d' % k
    chs[cid] = '# %s\n\n' % title + '\n\n'.join(blocks)
    toc.append({'id': cid, 'title': {'la': title, 'en-US': title.replace('Caput', 'Chapter').replace('Praefatio', 'Preface')}})
book = {"id": bid, "cover": "classic", "name": {"la": la_name, "en-US": en_name, "pt-BR": pt_name}, "author": bede_author(),
 "description": {"la": la_d, "en-US": en_d, "pt-BR": pt_d}, "composed": composed, "languages": ["la"], "work": "bede/" + slug,
 "editions": {"la": {"editor": "Migne, Patrologia Latina 90 (1862), after Giles (1843)", "year": 1862}},
 "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Scriptor:Beda_Venerabilis",
   "edition": name.replace('_', ' ').strip() + " on Latin Wikisource, from the Corpus Corporum TEI of Migne's Patrologia Latina.",
   "description": "Wikitext removed; inline PL column numbers dropped; one file per chapter with its rubric.",
   "tier": "A", "tierEvidence": "Eighth-century text in Migne's reprint of Giles: public domain."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(BD + slug, book, {'la': chs}, raw, slug)
print(slug, len(chs), sum(words(m) for m in chs.values()))
