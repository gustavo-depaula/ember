"""Franciscan opuscula of Quaracchi VIII (djvu.xml). usage: python3 -I bonaventure_opusc.py KEY [dry]"""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

CAP = r'(?i)^c[a-z.\\]{1,3}p[a-z.\\]{2,7}\s+\.?[IVXLlUn1vx]+'
def W(slug, pages, la, en, pt, descr_la, descr_en, composed, pp, label='Capitulum', chap=CAP, toc=None, skip=None, pt_descr=None, edition='Opuscula ad Ordinem spectantia'):
    return dict(slug=slug, pages=pages, names={'la': la, 'en-US': en, 'pt-BR': pt}, descr={'la': descr_la + ' Textus ex editione Quaracchi (Opera omnia VIII, 1898), ex scanno OCR, sine notis criticis.',
        'en-US': descr_en + ' The Latin is the Quaracchi edition (Opera omnia VIII, 1898) from an OCR scan, without the editors’ critical notes.', 'pt-BR': pt_descr or pt + '.'},
        composed=composed, pp=pp, label=label, chap=chap, toc=toc, skip=skip)
WORKS = {
 'apologia': W('apologia-pauperum', (365, 462), 'Apologia pauperum', 'Defence of the Poor', 'Apologia dos pobres',
    'Apologia pauperum contra calumniatorem (Gerardum de Abbatisvilla), in duodecim capitulis, de perfectione evangelica et paupertate Ordinis.',
    'The Apologia pauperum, in twelve chapters, Bonaventure’s reply to Gerard of Abbeville on evangelical perfection and the poverty of the Friars Minor.',
    'c. 1269', '233-330', toc=r'^CAPITULA'),
 'tres': W('epistola-de-tribus-quaestionibus', (463, 468), 'Epistola de tribus quaestionibus', 'Letter on Three Questions', 'Carta sobre três questões',
    'Epistola ad magistrum innominatum de tribus quaestionibus: de usu pauperum, de Regula et de praeceptis.',
    'Bonaventure’s letter to an unnamed master answering three questions on the Rule: the poor use of goods, the obligation of the Rule and dispensations.',
    'c. 1255-1257', '331-336', chap=None),
 'determ': W('determinationes-quaestionum-circa-regulam', (469, 506), 'Determinationes quaestionum circa Regulam Fratrum Minorum', 'Determinations of Questions on the Rule of the Friars Minor', 'Determinações de questões sobre a Regra dos Frades Menores',
    'Determinationes quaestionum circa Regulam Fratrum Minorum, in duabus partibus (opus dubium).',
    'Determinations of questions on the Rule of the Friars Minor, in two parts (a work of doubtful authorship attributed to Bonaventure).',
    '13th century', '337-374', label='Pars', chap=r'(?i)^pars\s+[IVXLl1]+\.?$'),
 'quare': W('quare-fratres-minores-praedicent', (507, 517), 'Quare Fratres Minores praedicent et confessiones audiant', 'Why the Friars Minor Preach and Hear Confessions', 'Por que os Frades Menores pregam e ouvem confissões',
    'Tractatus quare Fratres Minores praedicent et confessiones audiant, cum additamento (opus dubium).',
    'A treatise on why the Friars Minor preach and hear confessions, with an addition (a work of doubtful authorship attributed to Bonaventure).',
    '13th century', '375-385', chap=None),
 'sand': W('epistola-de-sandaliis-apostolorum', (518, 522), 'Epistola de sandaliis Apostolorum', 'Letter on the Sandals of the Apostles', 'Carta sobre as sandálias dos Apóstolos',
    'Epistola de sandaliis Apostolorum (opus dubium), de calceamento fratrum.',
    'A letter on the sandals of the Apostles and the footwear of the friars (a work of doubtful authorship attributed to Bonaventure).',
    '13th century', '386-390', chap=None),
 'expo': W('expositio-super-regulam-fratrum-minorum', (523, 569), 'Expositio super Regulam Fratrum Minorum', 'Exposition of the Rule of the Friars Minor', 'Exposição da Regra dos Frades Menores',
    'Expositio super Regulam Fratrum Minorum (opus dubium; Ioanni Peckham aliisque quoque adscriptum).',
    'An exposition of the Rule of the Friars Minor, chapter by chapter (a work attributed to Bonaventure, now generally denied him).',
    '13th century', '391-437', chap=None),
 'sermo': W('sermo-super-regulam-fratrum-minorum', (570, 580), 'Sermo super Regulam Fratrum Minorum', 'Sermon on the Rule of the Friars Minor', 'Sermão sobre a Regra dos Frades Menores',
    'Sermo super Regulam Fratrum Minorum.',
    'A sermon on the Rule of the Friars Minor.',
    '13th century', '438-448', chap=None),
 'narb': W('constitutiones-narbonenses', (581, 599), 'Constitutiones generales Narbonenses', 'The General Constitutions of Narbonne', 'As Constituições gerais de Narbona',
    'Constitutiones generales Narbonenses, in capitulo generali Narbonensi anno 1260 conditae, cum additamento.',
    'The General Constitutions of Narbonne, drawn up at the general chapter of 1260 under Bonaventure as Minister General, with an addition.',
    '1260', '449-467', label='Additamentum', chap=r'(?i)^addit\w*\s+[IVXLl1]+\.?$'),
 'offic': W('epistolae-officiales', (600, 606), 'Epistolae officiales', 'Official Letters', 'Cartas oficiais',
    'Epistolae officiales Ministri Generalis ad Ordinem.',
    'The official letters of Bonaventure as Minister General to the Order.',
    '1257-1274', '468-474', chap=None),
 'novit': W('regula-novitiorum', (607, 622), 'Regula novitiorum', 'Rule for Novices', 'Regra dos noviços',
    'Regula novitiorum, in sexdecim capitulis, ad formandos in Ordine novitios.',
    'The Rule for Novices, in sixteen chapters, a guide for the formation of novices in the Order.',
    'c. 1260', '475-490'),
 'memor': W('epistola-xxv-memorialia', (623, 630), 'Epistola continens viginti quinque memorialia', 'Letter of Twenty-five Memorials', 'Carta dos vinte e cinco memoriais',
    'Epistola continens viginti quinque memorialia, de institutione religiosorum.',
    'A letter containing twenty-five memorials for the religious life.',
    '13th century', '491-498', chap=None),
 'imit': W('epistola-de-imitatione-christi', (631, 635), 'Epistola de imitatione Christi', 'Letter on the Imitation of Christ', 'Carta sobre a imitação de Cristo',
    'Epistola de imitatione Christi.',
    'A letter on the imitation of Christ.',
    '13th century', '499-503', chap=None),
}
w = WORKS[sys.argv[1]]
P = F.load_pages('research/sourcing/bonaventure/xml/v08.xml')
ps = F.paragraphs(F.stream(P, *w['pages']))
log = []; fx = lambda t: F.clean(t, fix_ocr, log)
single = not w['chap']
chs = [['text' if single else 'prologus', w['names']['la'] if single or w['label'] != 'Capitulum' else 'Prologus', []]]; n = 0; skipping = False
for k, t in ps:
    if k == 'H' and w['toc'] and re.match(w['toc'], t): skipping = True; continue
    if k == 'H' and w['chap'] and re.match(w['chap'], t) and F.head_roman(t) == roman(n + 1):
        n += 1; skipping = False; chs.append(['c%02d' % n, '%s %s' % (w['label'], roman(n)), []]); continue
    if k != 'P' or skipping: continue
    p = fx(t)
    if len(p.split()) >= 2: chs[-1][2].append(p)
chs = [c for c in chs if c[2]]
files = {'la': {}}; toc = []; total = 0
for cid, title, body in chs:
    files['la'][cid] = '# %s\n\n' % title + '\n\n'.join(body)
    toc.append((cid, {'la': title})); total += sum(len(p.split()) for p in body)
print(total, len(log), [(c[0], sum(len(p.split()) for p in c[2])) for c in chs])
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], w['names'], w['descr'], w['composed'], 'bonaventure/' + w['slug'], ['la'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1898}},
     [src('la', 'https://archive.org/details/doctorisseraphic08bona', 'S. Bonaventurae Opera omnia, tom. VIII (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1898), pp. %s.' % w['pp'],
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes (variant readings, cross-references) and small-type scholia are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1898 is public domain.')],
     toc, files)
