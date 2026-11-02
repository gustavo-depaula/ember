import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from bede_common import *
which = sys.argv[1]
SMALL = {'la', 'ad', 'de', 'et', 'in', 'seu', 'sive', 'ac', 'cum'}
def tcase(s):
    ws = re.sub(r'\s+', ' ', s).strip(' .,*').split(' ')
    return ' '.join(w.lower() if (w.lower() in SMALL and k) else w[:1].upper() + w[1:].lower() for k, w in enumerate(ws))
def sections(raw):
    raw = strip_wiki(raw)
    raw = re.sub(r'\(\d{4}[A-D]?\)', '', raw)
    raw = re.sub(r'\[\[Categoria[^\]]*\]\]', '', raw)
    raw = re.sub(r'(?m)^.*Migne .?Patrologia Latina.? Tomus.*$', '', raw)
    raw = re.sub(r'^.*J\. P\. Migne\s*$', '', raw, flags=re.M)
    raw = re.sub(r"<poem>|</poem>", '', raw)
    parts = re.split(r'(?m)^==\s*(.*?)\s*(?:==)?\s*$', raw)
    return parts[0], list(zip(parts[1::2], parts[2::2]))
def verse(body):
    ls = [re.sub(r'\s+', ' ', l).strip() for l in body.split('\n')]
    blocks = []; cur = []
    for l in ls:
        if not l:
            if cur: blocks.append(cur); cur = []
        else: cur.append(l)
    if cur: blocks.append(cur)
    return ['  \n'.join(b) for b in blocks]
def finish(d, book, la, en=None, raw='', rawname=''):
    chs = {'la': la}
    if en: chs['en-US'] = en
    write_book(BD + d, book, chs, raw, rawname)
    print(d, {k: sum(words(m) for m in v.values()) for k, v in chs.items()})
if which == 'abbatum':
    raw = read_ws('Vita_V_sanctorum_abbatum')
    t = clean_ws(raw)
    t = t.split('LIBER PRIMUS.', 1)[1]
    t = t.replace('LIBER SECUNDUS.', '\n\n@@LIBER II@@\n\n')
    ps = paras(t)
    la_ps = ['**Liber I**'] + [('**Liber II**' if p == '@@LIBER II@@' else p) for p in ps]
    la = {'historia-abbatum': '# Historia abbatum\n\n' + '\n\n'.join(la_ps)}
    eps = fordham('/tmp/w/en/bede-jarrow.html')[5:28]
    eps = [re.sub(r'\s+\*$', '*', p) for p in eps]
    eps[0] = unshout(eps[0])
    en = {'historia-abbatum': '# Lives of the Holy Abbots\n\n' + '\n\n'.join(eps)}
    book = {
     "id": "bede-historia-abbatum", "cover": "classic",
     "name": {"la": "Historia abbatum", "en-US": "Lives of the Holy Abbots of Wearmouth and Jarrow", "pt-BR": "Vida dos Santos Abades de Wearmouth e Jarrow"},
     "author": bede_author(),
     "description": {
      "la": "Historia abbatum, id est Vita sanctorum abbatum monasterii in Wiramutha et Girvum: Benedicti Biscop, Ceolfridi, Eosterwini, Sigfridi et Hwaetberhti (post 716).",
      "en-US": "Bede's history of the first abbots of his own monastery, written after 716: Benedict Biscop, who founded Wearmouth and Jarrow and brought books and builders from Rome; Ceolfrith, who carried the Codex Amiatinus on his last journey; and Eosterwine, Sigfrith and Hwaetberht. Latin text of Migne (PL 94); English translation of J. A. Giles as given by the Fordham Medieval Sourcebook.",
      "pt-BR": "A história dos primeiros abades do próprio mosteiro de Beda, escrita depois de 716: Bento Biscop, que fundou Wearmouth e Jarrow e trouxe de Roma livros e artífices; Ceolfrido, que levou o Codex Amiatinus na última viagem; e Eosterwine, Sigfrido e Hwaetberht."},
     "composed": "c. 716-725", "languages": ["la", "en-US"], "work": "bede/historia-abbatum",
     "editions": {"la": {"editor": "Migne, PL 94 (1862)", "year": 1862}, "en-US": {"translator": "J. A. Giles", "year": 1843, "from": "la"}},
     "sources": [
      {"language": "la", "url": "https://la.wikisource.org/wiki/Vita_V_sanctorum_abbatum_(Beda)",
       "edition": "Vita V sanctorum abbatum (Beda) on Latin Wikisource, from the Corpus Corporum TEI of Migne PL 94 (Liber I and Liber II).",
       "description": "Wikitext removed; inline PL column numbers dropped; one chapter with the two books marked.",
       "tier": "A", "tierEvidence": "Eighth-century text in Migne's reprint: public domain."},
      {"language": "en-US", "url": "https://sourcebooks.fordham.edu/basis/bede-jarrow.asp",
       "edition": "Bede, The Lives of the Holy Abbots of Weremouth and Jarrow, translated by J. A. Giles (1843), as given by the Internet Medieval Sourcebook (Fordham).",
       "description": "Page chrome and bibliography removed. Giles's notes are not in the Sourcebook text. The transcription has a few OCR slips (e.g. 'resting. places', 'under taken') left uncorrected.",
       "tier": "A", "tierEvidence": "Translation of 1843: public domain."}],
     "arrived": {"la": "2026-11-02", "en-US": "2026-11-02"},
     "toc": [{"id": "historia-abbatum", "title": {"la": "Historia abbatum", "en-US": "Lives of the Holy Abbots"}}]}
    finish('historia-abbatum', book, la, en, raw, 'vita-v-sanctorum-abbatum')
elif which == 'metrica':
    raw = read_ws('Vita_metrica_S._Cuthberti')
    pre, secs = sections(raw)
    la = {}; toc = []
    for h, body in secs:
        if h.startswith('Prologus'):
            cid, ttl = 'prologus', 'Prologus ad Joannem presbyterum'
        else:
            m = re.match(r'Caput ([IVXL]+)\.\s*(.*)$', h)
            n = len([1 for k in la if k.startswith('c')]) + 1
            cid, ttl = 'c%02d' % n, 'Caput %s' % m.group(1)
        blocks = verse(body)
        rub = ''
        if cid != 'prologus': rub = '**%s**\n\n' % m.group(2).strip()
        la[cid] = '# %s\n\n%s' % (ttl, rub) + '\n\n'.join(blocks)
        toc.append({'id': cid, 'title': {'la': ttl, 'en-US': ttl.replace('Prologus ad Joannem presbyterum', 'Prologue to the Priest John').replace('Caput', 'Chapter')}})
    book = {
     "id": "bede-vita-cuthberti-metrica", "cover": "classic",
     "name": {"la": "Vita metrica sancti Cuthberti", "en-US": "Metrical Life of St. Cuthbert", "pt-BR": "Vida métrica de São Cuteberto"},
     "author": bede_author(),
     "description": {
      "la": "Vita sancti Cuthberti hexametris versibus, a Beda ante prosaicam conscripta (c. 705-716), cum prologo ad Joannem presbyterum et capitibus XLVII.",
      "en-US": "Bede's earlier Life of Cuthbert in Latin hexameters (before his prose Life, c. 705-716), in a prologue and 47 chapters of verse that retell the Lindisfarne saint's miracles in the high style of Sedulius and Aldhelm. Latin text of Migne (PL 94); no public-domain English translation is known.",
      "pt-BR": "A primeira Vida de Cuteberto escrita por Beda, em hexâmetros latinos (antes da Vida em prosa, c. 705-716), com prólogo e 47 capítulos em verso que recontam os milagres do santo de Lindisfarne no estilo elevado de Sedúlio e Aldhelm."},
     "composed": "c. 705-716", "languages": ["la"], "work": "bede/vita-cuthberti-metrica",
     "editions": {"la": {"editor": "Migne, PL 94 (1862)", "year": 1862}},
     "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Vita_metrica_S._Cuthberti_(Beda)",
       "edition": "Vita metrica S. Cuthberti (Beda) on Latin Wikisource, from the Corpus Corporum TEI of Migne PL 94.",
       "description": "Wikitext removed; PL column numbers dropped; verse lines kept with line breaks; chapter rubrics in bold.",
       "tier": "A", "tierEvidence": "Eighth-century text in Migne's reprint: public domain."}],
     "arrived": {"la": "2026-11-02"}, "toc": toc}
    finish('vita-cuthberti-metrica', book, la, None, raw, 'vita-metrica-cuthberti')
elif which == 'felicis':
    raw = read_ws('Vita_Felicis_confessoris')
    t = clean_ws(raw).split('Beda', 1)[0] if False else clean_ws(raw)
    t = re.sub(r'^\s*Vita Felicis[^\n]*\n', '', t, count=1)
    ps = paras(t)
    print([p[:70] for p in ps[:3]])
    la = {'vita-felicis': '# Vita Felicis confessoris\n\n' + '\n\n'.join(ps)}
    book = {
     "id": "bede-vita-felicis", "cover": "classic",
     "name": {"la": "Vita sancti Felicis confessoris", "en-US": "Life of St. Felix, Confessor", "pt-BR": "Vida de São Félix, Confessor"},
     "author": bede_author(),
     "description": {
      "la": "Vita Felicis confessoris Nolani, a Beda ex hexametris Paulini Nolani in prosam sermonem redacta.",
      "en-US": "Bede's prose retelling of Paulinus of Nola's hexameter poems on St. Felix of Nola (3rd century): the priest who survived persecution, hidden by a spider's web and fed by an angel. Latin text of Migne (PL 94); the English of Giles survives only in an OCR scan, not yet imported.",
      "pt-BR": "O resumo em prosa que Beda fez dos poemas em hexâmetros de Paulino de Nola sobre São Félix de Nola (séc. III): o sacerdote que sobreviveu à perseguição, escondido por uma teia de aranha e alimentado por um anjo."},
     "composed": "c. 700-716", "languages": ["la"], "work": "bede/vita-felicis",
     "editions": {"la": {"editor": "Migne, PL 94 (1862)", "year": 1862}},
     "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Vita_Felicis_confessoris_(Beda)",
       "edition": "Vita Felicis confessoris (Beda) on Latin Wikisource, from the Corpus Corporum TEI of Migne PL 94.",
       "description": "Wikitext removed; PL column numbers dropped; one chapter.",
       "tier": "A", "tierEvidence": "Eighth-century text in Migne's reprint: public domain."}],
     "arrived": {"la": "2026-11-02"},
     "toc": [{"id": "vita-felicis", "title": {"la": "Vita Felicis confessoris", "en-US": "Life of St. Felix, Confessor"}}]}
    finish('vita-felicis', book, la, None, raw, 'vita-felicis')
elif which == 'epistolae':
    raw = read_ws('Epistolae_Beda_')
    pre, secs = sections(raw)
    la = {}; toc = []
    for h, body in secs:
        h = h.strip()
        m = re.match(r'EPISTOLA\s+([IVXL]+|PRIMA)\b[ ,.]*(.*)$', h)
        body = re.sub(r'^\s*\((Giles|Smith)[^)]*\)\s*$', '', body, flags=re.M)
        if m:
            n = 1 if m.group(1) == 'PRIMA' else {'I':1}.get(m.group(1)) or None
            cid = 'e%02d' % (len(toc) + 1 - sum(1 for t in toc if t['id'].startswith('f')))
            rest = tcase(m.group(2)).rstrip(':')
            ttl = 'Epistola %s%s' % ('I' if m.group(1) == 'PRIMA' else m.group(1), (', ' + rest) if rest else '')
        else:
            cid = 'f01'; ttl = 'Fragmentum: appendix ad epistolam praecedentem'
        ps = [p for p in paras(body)]
        la[cid] = '# %s\n\n' % ttl + '\n\n'.join(ps)
        toc.append({'id': cid, 'title': {'la': ttl}})
    print([t['id'] + ' ' + t['title']['la'] for t in toc])
    book = {
     "id": "bede-epistolae", "cover": "classic",
     "name": {"la": "Epistolae", "en-US": "Letters", "pt-BR": "Cartas"},
     "author": bede_author(),
     "description": {
      "la": "Epistolae Bedae: ad Albinum abbatem, ad Ecgberctum antistitem (734), ad Plegwinum de aetatibus mundi, ad Wicredam de Pascha, ad Accam episcopum, ad Nothelmum, ad Eusebium (Hwaetberht) et aliae de scripturis.",
      "en-US": "Bede's surviving letters: to Abbot Albinus on the Ecclesiastical History, the famous letter to Bishop Egbert of York (734) on the reform of the Northumbrian church, the apology to Plegwin on the six ages of the world, letters to Wicred on Easter, to Bishop Acca and others as prefaces to his biblical commentaries, and short exegetical letters. Latin text of Migne (PL 94); no public-domain English translation of the whole is available here.",
      "pt-BR": "As cartas de Beda que sobreviveram: a Albino sobre a História Eclesiástica, a célebre carta ao bispo Egberto de York (734) sobre a reforma da Igreja da Nortúmbria, a apologia a Plegwin sobre as seis idades do mundo, as cartas a Wicred sobre a Páscoa, a Acca e outros como prefácios dos comentários bíblicos, e breves cartas exegéticas."},
     "composed": "c. 700-734", "languages": ["la"], "work": "bede/epistolae",
     "editions": {"la": {"editor": "Migne, PL 94 (1862), after Giles and Smith", "year": 1862}},
     "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Epistolae_(Beda)",
       "edition": "Epistolae (Beda) on Latin Wikisource, from the Corpus Corporum TEI of Migne PL 94 (the 'Epistula ad Albinum abbatem' page is the same text as Letter I).",
       "description": "Wikitext removed; PL column numbers and source notes dropped; one file per letter.",
       "tier": "A", "tierEvidence": "Eighth-century texts in Migne's reprint: public domain."}],
     "arrived": {"la": "2026-11-02"}, "toc": toc}
    finish('epistolae', book, la, None, raw, 'epistolae')
