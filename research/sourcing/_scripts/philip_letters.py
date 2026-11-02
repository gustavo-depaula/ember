import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from philip_letters_raw import *
from gen import emit
from vocab import unknown

IT_FIX = [(r'\|\)', 'p'), (r'n:\)n', 'non'), (r'l\)adre', 'padre'), (r'\bInioni\b', 'buoni'), (r'\bi\)(?=[a-z])', 'p'), (r'\]"\)rima', 'prima'),
 (r'\(li\b', 'di'), (r'\balT\b', "all'"), (r'\bneir\b', "nell'"), (r'\bVamor\b', "l'amor"), (r'\bspirilo\b', 'spirito'),
 (r'ritorìiarsene', 'ritornarsene'), (r'diìiiostra', 'dimostra'), (r'propetisione', 'propensione'), (r'\bniesser\b', 'messer'),
 (r'\bAncìsa\b', 'Ancisa'), (r'\bvirtic\b', 'virtù'), (r'erciocchè', 'perciocchè'), (r'perciocchè', 'perciocchè'),
 (r'\b(r|1)\' ', "l'"), (r'\bIl ?\' ', "l'"), (r'\bjueste\b', 'queste'), (r'\bjuale\b', 'quale'), (r'\bmorlificandovi\b', 'mortificandovi'),
 (r'\bSanHus\b|\bSanclus\b|\bSanéìus\b|\bSaticlus\b', 'Sanctus'), (r'\bsitigolarmente\b', 'singolarmente'), (r'\bsingolarità\b', 'singolarità'),
 (r'\bintemamente\b', 'internamente'), (r'\bfuora\b', 'fuora'), (r'\bsennzio\b', 'silenzio'), (r'\bmalatiia\b', 'malattia'), (r'\bsc[ae]ecula\b|\bscecula\b', 'saecula'),
 (r'\bsceailorum\b', 'saeculorum'), (r'\bPraio\b', 'Prato'), (r'\bmilaxo\b|\bmilano\b', 'Milano'), (r'\bnapoli\b', 'Napoli')]
EN_FIX = [(r'(?<=, )1 ?(\d) ?(\d) ?(\d)\.', r'1\1\2\3.'), (r'\b(Boms|RoMK|RoMB|Romb|RoHS|Bomb|Bome|RoMS)\b', 'Rome'), (r'Phiup (Nebi|Nerl)|Philip Nerl|Philip Nebl|Phiup Nerl|Philip Nebi|FUippo', 'Philip Neri'),
 (r'\bYouT\b', 'Your'), (r'accoimts', 'accounts'), (r'afiection', 'affection'), (r'commimion', 'communion'), (r'difiicult', 'difficult'), (r'\bimcle', 'uncle'),
 (r'\bimder', 'under'), (r'\bimless', 'unless'), (r'\bimtil', 'until'), (r'oflFer', 'offer'), (r'suflFered', 'suffered'), (r'\bwhicli\b', 'which'), (r'\bhanda\b', 'hands'),
 (r'\bshovm\b', 'shown'), (r'\bsoimd', 'sound'), (r'\btoill\b', 'will'), (r'practire', 'practice'), (r'\bgiyen\b', 'given'), (r'\bloye\b', 'love'), (r'\blianded\b', 'handed'),
 (r'\bovm\b', 'own'), (r'\botir\b', 'our'), (r'mimnderstanding', 'misunderstanding'), (r'Elisahetta', 'Elisabetta'), (r'Gennanico', 'Germanico'),
 (r'\b(Grod|Crod)\b', 'God'), (r'\bGrentile\b', 'Gentile'), (r'\bLordy\b', 'Lord'), (r'\bbeginmng\b', 'beginning'), (r'\bestahlish', 'establish'), (r'\bsoiU\b', 'soul'),
 (r'\bplesusure\b', 'pleasure'), (r'\btfiMnks\b', 'thanks'), (r'\bpromified\b', 'promised'), (r'\bmherited\b', 'inherited'), (r'\bobhged\b', 'obliged'), (r'\bspiritucU\b', 'spiritual'),
 (r'\bmortifjring\b', 'mortifying'), (r'\binstrtictions\b', 'instructions'), (r'\bbevebend\b', 'reverend'), (r'\billustbious\b', 'illustrious'), (r'\bIn the Lord, — ?\^', 'In the Lord, —'), (r'\^', ''),
 (r'Bastiano', 'Bastiano'), (r'\bfoimdation\b', 'foundation'), (r'\bReconmiend\b', 'Recommend'), (r'\bintentionsy\b', 'intentions'), (r'\bthe Lordy\b', 'the Lord')]

def rejoin(paras):
    out = []
    for p in paras:
        if out and not re.search(r'[.!?:;»”"—)\]]$', out[-1]) and p[:1].islower() and len(out[-1].split()) > 8:
            out[-1] += ' ' + p
        else: out.append(p)
    return out

def fix(t, rules):
    for a, b in rules: t = re.sub(a, b, t)
    return t

EN_DROP2 = re.compile(r'^(\d+ +)?LETTERS OF ST\. PHILIP NERI( +\d+)?$|^ST\. PHILIP\'?S? LETTERS.*$|^\d+$')
def en_drop2(s): return en_drop(s) or bool(EN_DROP2.match(s))

IT_T = ['A Messer Francesco Vai, Prato', 'A Madonna Fiora Ragni, Napoli', 'A persona incerta, Firenze', 'A suor Maria Vittoria Trievi, monaca in San Pietro Martire, Firenze',
 'Alla stessa suor Maria Vittoria Trievi', 'A suor Anna Maria Trievi, monaca in Santa Lucia', 'A san Carlo Borromeo, Milano', 'A Donna Felice Orsina Colonna, vicereina di Sicilia, Napoli',
 'A monsignor Domenico Pinelli, vescovo di Fermo', 'A Madonna Fiora Ragni, Napoli', 'A san Carlo Borromeo, Milano', 'A san Carlo Borromeo, Milano',
 'A suor Anna Maria Trievi, monaca in Santa Lucia, Firenze', 'A san Carlo Borromeo, Milano', 'A suor Maria Vittoria Trievi, monaca in San Pietro Martire, Firenze',
 'Al vescovo di San Severino', 'A Tiberio (frammento)', 'A monsignor Michele Mercati, San Miniato', 'Al venerabile Giovenale Ancina, Napoli', 'Al venerabile Alessandro Luzzago, Brescia',
 'Al vescovo di San Severino', 'Al cardinale Federigo Borromeo, Arona', 'A suor Anna Maria Trievi, monaca in Santa Lucia, Firenze', 'A messer Vittorio dell’Ancisa, Firenze',
 'A suor Anna Maria Trievi, monaca in Santa Lucia, Firenze', 'Alle signore Spada, Napoli']
EN_T = ['To Messer Francesco Vai, Prato', 'To Madonna Fiora Ragni, Naples', 'To a person unknown, Florence', 'To Sister Maria Vittoria Trievi, nun at San Pietro Martire, Florence',
 'To Sister Maria Vittoria Trievi, again', 'To Sister Anna Maria Trievi, a nun in Santa Lucia, Florence', 'To St. Charles Borromeo, Milan', 'To Donna Felice Orsina Colonna, Vice-Queen of Sicily, Naples',
 'To Monsignor Domenico Pinelli, Bishop of Fermo', 'To Madonna Fiora Ragni, Naples', 'To St. Charles Borromeo, Milan', 'To St. Charles Borromeo, Milan',
 'To Sister Anna Maria Trievi, a nun in Santa Lucia, Florence', 'To St. Charles Borromeo, Milan', 'To Sister Maria Vittoria Trievi, nun at San Pietro Martire, Florence',
 'To the Bishop of San Severino', 'To Tiberio (a fragment)', 'To Monsignor Michele Mercati, San Miniato', 'To the Blessed Giovenale Ancina, Naples', 'To the Venerable Alessandro Luzzago, Brescia',
 'To the Bishop of San Severino', 'To Cardinal Federigo Borromeo, Arona', 'To Sister Anna Maria Trievi, a nun in Santa Lucia, Florence', 'To Messer Vittorio dell’Ancisa, Florence',
 'To Sister Anna Maria Trievi, a nun in Santa Lucia, Florence', 'To the Signore Spada, Naples']

def build(lang_paras, hdr, rules, dropnote):
    body = [fix(p, rules) for p in rejoin(lang_paras)]
    while body and body[0] == body[0].upper(): body.pop(0)
    notes = []; out = []
    for p in body:
        p = re.sub(r"\s*VOL\. II\. ' ?\w+ ?\w*$", '', p)
        if p.startswith('Note.') or notes:
            if sum(c.isupper() for c in p) > 0.5 * max(1, sum(c.isalpha() for c in p)): continue
            notes.append(p[len('Note.'):].lstrip(' —-').strip() if p.startswith('Note.') else p); continue
        out.append(p)
    return [re.sub(r'(?<=, )(1 ?\d ?\d ?\d)\.', lambda m: m.group(1).replace(' ', '') + '.', q) for q in out], [' '.join(notes)] if notes else []

if __name__ == '__main__':
    itl, tail = it_all(); enl, _ = en_all()
    chapters = []
    NUM = 'I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI'.split()
    for n in range(26):
        per = {}
        h, b = parse(itl[n], it_drop)
        arg = ' '.join(h[1:]) if len(h) > 1 and n + 1 not in (4,) else ''
        if n + 1 == 4: arg = h[-1] if False else ''
        b = [fix(p, IT_FIX) for p in rejoin(b)]
        if n + 1 == 4:
            b = [q for q in b if not q.startswith('I Altri leggono')]
            k = next(i for i, q in enumerate(b) if q.startswith('Nipote'))
            b[k] = b[k].replace('figliuola carissima.', 'figliuola carissima.[^1]', 1)
            b[0] = '*' + b[0].replace('V assicura', 'l’assicura') + '*'
            b = b[:k] + [b[k]] + b[k + 1:] + ['[^1]: Altri leggono Trevi, altri, anche meglio, Tregui (nota del Capecelatro).']
        if arg: b.insert(0, '*' + fix(arg, IT_FIX) + '*')
        per['it'] = ('Lettera %s. %s' % (NUM[n], IT_T[n]), '\n\n'.join(b))
        h2, b2 = parse(enl[n], en_drop2)
        b2, notes = build(b2, h2, EN_FIX, True)
        if b2 and len(b2[0].split()) < 45 and not b2[0].startswith(('Most', 'Very', 'Dearest', 'Jesus')) and not re.match(r'^[A-Z][^.]*—', b2[0]): b2[0] = '*' + b2[0] + '*'
        txt = '\n\n'.join(b2)
        if notes:
            txt += '[^1]\n\n[^1]: ' + ' '.join(notes)
        per['en-US'] = ('Letter %s. %s' % (NUM[n], EN_T[n]), txt)
        chapters.append(('l%02d' % (n + 1), per))
    import json
    ex = []
    for l in tail[3:70]:
        if 'FiLiPio' in l: break
        ex.append(l)
    exb = [fix(p, IT_FIX) for p in rejoin(clean(ex, it_drop))]
    chapters.append(('l27', {'it': ('Lettera XXVII. Al coadiutore di Bologna (inedita al tempo delle stampe)', '\n\n'.join(exb))}))
    extra = [fix(re.sub(r'\s+', ' ', l.strip()), IT_FIX) for l in tail[:70]]
    json.dump(extra, open('/tmp/_philip_extra.json', 'w'))
    import pickle; pickle.dump(chapters, open('/Users/gustavo/Documents/prayer/research/sourcing/philip-neri/letters_chapters.pkl', 'wb'))
    ti = ' '.join(c[1]['it'][1] for c in chapters); te = ' '.join(c[1]['en-US'][1] for c in chapters if 'en-US' in c[1])
    print(len(ti.split()), len(te.split()))
    print(sorted(unknown(ti, 'it').items())[:0])
    META = {
     'id': 'philip-neri-lettere', 'cover': 'classic',
     'name': {'it': 'Lettere di san Filippo Neri', 'en-US': 'Letters of St. Philip Neri', 'pt-BR': 'Cartas de são Filipe Néri'},
     'author': {'it': 'San Filippo Neri', 'en-US': 'St. Philip Neri', 'pt-BR': 'São Filipe Néri'},
     'description': {
      'it': 'Le ventisei lettere autentiche di san Filippo Neri (1515-1595) pubblicate da Alfonso Capecelatro nei «Documenti» della sua Vita di san Filippo Neri (1879): a Francesco Vai, a san Carlo Borromeo, al cardinale Federigo Borromeo, alle monache Trievi di Firenze, a Fiora Ragni e ad altri figli spirituali, ciascuna con il sommario dell’editore. Segue una lettera al coadiutore di Bologna non compresa nelle stampe precedenti. Il testo italiano viene dalla scansione OCR e non è rivisto sulle immagini; la traduzione inglese segue lettera per lettera.',
      'en-US': 'The twenty-six authentic letters of St. Philip Neri (1515-1595) as published by Alfonso Capecelatro in the Documents of his Life of St. Philip Neri (1879): to Francesco Vai, to St. Charles Borromeo, to Cardinal Federigo Borromeo, to the Trievi nuns of Florence, to Fiora Ragni and other spiritual children, each with the editor’s summary. A twenty-seventh letter, to the coadjutor of Bologna, which the earlier prints omit, is added in Italian. The Italian is from OCR and not proofread against the page images; the English is the translation in Antrobus’s edition of Bacci, letter for letter.',
      'pt-BR': 'As vinte e seis cartas autênticas de são Filipe Néri (1515-1595), publicadas por Alfonso Capecelatro nos «Documentos» de sua Vida de são Filipe Néri (1879): a Francesco Vai, a são Carlos Borromeu, ao cardeal Federico Borromeu, às religiosas Trievi de Florença, a Fiora Ragni e a outros filhos espirituais, cada uma com o sumário do editor.'},
     'composed': '1556-1595', 'languages': ['it', 'en-US'], 'work': 'philip-neri/lettere',
     'editions': {'it': {'editor': 'Alfonso Capecelatro (La vita di S. Filippo Neri, Milano)', 'year': 1889},
                  'en-US': {'translator': 'Anonymous (Oratorian translation, ed. Frederick Ignatius Antrobus)', 'year': 1902}},
     'sources': [
      {'language': 'it', 'url': 'https://archive.org/details/lavitadisfilippo01capeuoft',
       'edition': 'Alfonso Capecelatro, La vita di S. Filippo Neri, libri tre, Milano 1889, vol. I, Documenti, N. IV. Internet Archive scan, OCR text.',
       'description': 'Letters I-XXVI and the final letter to the coadjutor of Bologna, with Capecelatro’s summaries. Page furniture and hyphenation were stripped by script and obvious OCR slips corrected by a list of fixes; the text was not proofread against the scan and still carries stray OCR errors (roughly 1% of words), and a few of the editor’s footnotes may be left inline.',
       'tier': 'A', 'tierEvidence': 'Capecelatro died in 1912; the 1889 printing is public domain everywhere.'},
      {'language': 'en-US', 'url': 'https://archive.org/details/lifesaintphilip00baccgoog',
       'edition': 'Pietro Giacomo Bacci, The Life of Saint Philip Neri, ed. Frederick Ignatius Antrobus, London: Kegan Paul 1902, vol. II, Letters of Saint Philip, pp. 355-409. Internet Archive (Google) scan, OCR text.',
       'description': 'Letters I-XXVI with their summaries; Antrobus’s notes on the addressees are kept as footnotes. OCR cleaned by script and a list of fixes, not proofread; residual errors remain. The fragment to Tiberio is headed as such. Antrobus’s all-capitals Latin inscription quoted in a note to letter XXIV was too corrupt to keep.',
       'tier': 'A', 'tierEvidence': 'Antrobus died in 1903; the 1902 edition is public domain everywhere.'}]}
    print(emit('/Users/gustavo/Documents/prayer/content/books/philip-neri-opera-omnia/lettere', META, chapters))
