import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from bede_common import *
# ---------- Latin
src = read_ws('Vita_prosaica_S._Cuthberti')
t = clean_ws(src)
t = t.split('Vita prosaica S. Cuthberti', 1)[-1] if 'Vita prosaica S. Cuthberti' in t[:400] else t
la = {}; toc = []
parts = re.split(r'(?m)^(CAPUT PRIMUM|CAP\. [IVXLC]+|CAPUT [IVXLC]+)\.?-*\s*(.*)$', t)
pre = parts[0]
m = re.search(r'Praefatio, AD EADFRIDUM LINDISFARNENSEM EPISCOPUM\.(.*?)SANCTI CUTHBERTI\. LINDISFARNENSIS EPISCOPI, LIBER DE VITA ET MIRACULIS\.', pre, flags=re.S)
la['praefatio'] = '# Praefatio ad Eadfridum\n\n' + '\n\n'.join(paras(m.group(1)))
toc.append({'id': 'praefatio', 'title': {'la': 'Praefatio ad Eadfridum', 'en-US': 'Preface to Bishop Eadfrith'}})
n = 0
for k in range(1, len(parts), 3):
    n += 1
    num = roman(n)
    body = paras(parts[k+2])
    la['c%02d' % n] = '# Caput %s\n\n**%s**\n\n' % (num, parts[k+1].strip()) + '\n\n'.join(body)
    toc.append({'id': 'c%02d' % n, 'title': {'la': 'Caput %s' % num, 'en-US': 'Chapter %s' % num}})
print('latin chapters', n, sum(words(v) for v in la.values()))
# ---------- English
ps = fordham('/tmp/w/en/bede-cuthbert.html')
i = ps.index('PREFACE')
j = next(k for k, p in enumerate(ps) if p.startswith('*Bibliography'))
ps = ps[i:j]
en = {}; cur = None; seen = 0; buf = []
def flush():
    if cur: en[cur[0]] = '# %s\n\n' % cur[1] + '\n\n'.join(x for x in buf if x)
for p in ps:
    m = re.fullmatch(r'\**CHAPTER ([IVXL]+)\s*\**', p)
    if p == 'PREFACE' or m:
        flush(); buf = []
        if p == 'PREFACE': cur = ('praefatio', 'Preface to Bishop Eadfrith')
        else:
            seen += 1; cur = ('c%02d' % seen, 'Chapter %s' % roman(seen)); titlenext = True
        continue
    if cur and cur[0] != 'praefatio' and not buf:
        buf.append('**%s**' % titlecase(p.strip('*').replace(' 1N ', ' IN ').replace('TIIE', 'THE')).rstrip('.')); continue
    if cur: buf.append(unshout(re.sub(r'\s+\*$', '*', p).replace(' 1N ', ' IN ').replace('TIIE', 'THE')) if (not buf or buf[-1].startswith('**') or buf[-1].startswith('*')) else p)
flush()
print('english chapters', seen, sum(words(v) for v in en.values()))
book = {
 "id": "bede-vita-cuthberti", "cover": "classic",
 "name": {"la": "Vita sancti Cuthberti (prosa)", "en-US": "Life of St. Cuthbert", "pt-BR": "Vida de São Cuteberto"},
 "author": bede_author(),
 "description": {
  "la": "Vita prosaica sancti Cudbercti Lindisfarnensis episcopi, a Beda scripta c. 721, cum epistola praefatoria ad Eadfridum episcopum et fratres Lindisfarnenses.",
  "en-US": "Bede's prose Life of Cuthbert, bishop of Lindisfarne (d. 687), written about 721 from the testimony of Cuthbert's own companions and expanding the earlier anonymous Lindisfarne Life: the shepherd boy and the vision of Aidan's soul, the hermit of Farne, the reluctant bishop, the miracles of his incorrupt body. Latin text of Migne (PL 94); English translation of J. A. Giles as given by the Fordham Medieval Sourcebook.",
  "pt-BR": "A Vida em prosa de Cuteberto, bispo de Lindisfarne (+687), escrita por Beda por volta de 721 a partir do testemunho dos próprios companheiros do santo: o jovem pastor e a visão da alma de Áidan, o eremita de Farne, o bispo relutante, os milagres de seu corpo incorrupto."},
 "composed": "c. 721", "languages": ["la", "en-US"], "work": "bede/vita-cuthberti-prosaica",
 "editions": {"la": {"editor": "Migne, PL 94 (1862), after Smith/Giles", "year": 1862},
              "en-US": {"translator": "J. A. Giles", "year": 1843, "from": "la"}},
 "sources": [
  {"language": "la", "url": "https://la.wikisource.org/wiki/Vita_prosaica_S._Cuthberti_(Beda)",
   "edition": "Vita prosaica S. Cuthberti (Beda) on Latin Wikisource, from the Corpus Corporum TEI of Migne PL 94 (Praefatio and 46 chapters, with the chapter rubrics).",
   "description": "Wikitext removed; the inline PL column numbers dropped; chapter rubrics set in bold.",
   "tier": "A", "tierEvidence": "Eighth-century text in Migne's 19th-century reprint: public domain."},
  {"language": "en-US", "url": "https://sourcebooks.fordham.edu/basis/bede-cuthbert.asp",
   "edition": "Bede, The Life and Miracles of St. Cuthbert, Bishop of Lindisfarne, in the translation of J. A. Giles (The Miscellaneous Works of the Venerable Bede, vol. 6 / Minor Historical Works, 1843), as given by the Internet Medieval Sourcebook (Fordham). Preface and 46 chapters (the Sourcebook prints the heading of chapter 46 as 'XLV').",
   "description": "Page chrome removed; chapter titles set in bold and normalised; drop-cap capitals lowered. Giles's notes are not in the Sourcebook text. OCR slips of the Sourcebook transcription are uncorrected.",
   "tier": "A", "tierEvidence": "Translation of 1843: public domain."}],
 "arrived": {"la": "2026-11-02", "en-US": "2026-11-02"}, "toc": toc}
write_book(BD + 'vita-cuthberti', book, {'la': la, 'en-US': en}, src, 'vita-prosaica-cuthberti')
