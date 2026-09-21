"""Ps 18 draft 2: the three readers of draft 1 weighed. python3.13 research/psalterium/ps018/revise_v2.py
Reads prayed.v1.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
data['version'] = 2
data['status'] = 'reviewed'
byId = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


# 18:3 — order (stylist, blind reader)
V['18:3'] = 'Um dia {eructat} a palavra ao outro dia, * e uma noite indica {scientiam} à outra noite.'
byId['eructat']['why'] += (" Heard (draft 1): the stylist found *O dia ao dia … a noite à noite* piled before the verbs; the blind reader heard the second *à noite* as a time "
                           "('at night') and the first colon as 'day after day'. Draft 2 takes the order and the articles MS1932 also uses (*Um dia … ao outro dia*): "
                           "the Latin's datives (diéi, nocti) kept as the receivers, which is what the blind reader could not hear; grammar and order only (D2). "
                           "The stylist's *para outro dia* refused: heard as 'postponed'.")

# 18:5 — order (stylist): the echo of deles moved off the cadences
V['18:5'] = 'O som deles saiu por toda a terra: * e as palavras deles, até os confins {orbis}.'
byId['orbis']['why'] += (" Draft 2 takes the stylist's order (subject first; the second colon's verb left understood as the Latin's and Rom 10:18's): "
                         "the two *deles* no longer close both colons, which checks and the stylist flagged. Order only (D2).")

# 18:6a — tálamo (stylist, blind reader unknown)
d = byId['thalamo']
d['why'] += (" Heard (draft 1): the stylist — specialised word, and a proparoxytone at the cadence → *quarto nupcial*; the blind reader listed *tálamo* as unknown "
             "and heard only 'a husband leaving some place'. Taken: of two faithful words the plainer (D2); the chamber is the bride-chamber either way.")
d['options'] = [
    opt('quarto nupcial', {'thalamo': 'quarto nupcial'}, "Ruling (draft 2): the stylist's; the blind reader did not know *tálamo*.", 'stylist'),
    opt('tálamo', {'thalamo': 'tálamo'}, 'Draft 1: the Latin\'s word (MS1932, the Diurnal); unknown to the blind reader.', 'MS1932'),
    opt('câmara nupcial', {'thalamo': 'câmara nupcial'}, 'DRB *bride chamber*.', 'DRB'),
]

# 18:6b / 18:7b — order and the copula
V['18:6b'] = 'Exultou como um {gigas} para correr o caminho, * a sua saída é do {summo} do céu:'
V['18:7b'] = 'E a sua {occursus} é até o seu {summum}: * e não há quem se esconda do seu calor.'
byId['occursus']['why'] += (" Draft 2: 18:6b takes the stylist's order (*a sua saída é do extremo do céu*); 18:7b supplies the same copula (*E a sua chegada é até …*), "
                            "answering his remark that the noun line hangs without a verb — the two nouns kept, as the Latin's pair. His *E ele chega* refused: it "
                            "turns occúrsus into a verb and the subject into the sun by name.")

# 18:11 — the plural stones (stylist); multus still in both verses
d = byId['multa']
d['why'] += (" Heard (draft 1): the stylist — the collective singular *muita pedra preciosa* sounds like a quantity of material → *muitas pedras preciosas*. "
             "Taken: number is grammar; *muitas … muita* still repeats the Latin's one word in both verses.")
d['options'] = [
    opt('muitas … muita', {'lapidem': 'muitas pedras preciosas', 'multa': 'muita retribuição'}, "Ruling (draft 2): the stylist's plural; the repetition kept.", 'stylist'),
    opt('muita … muita', {'lapidem': 'muita pedra preciosa', 'multa': 'muita retribuição'}, 'Draft 1: the collective singular.', 'draft'),
    opt('muitas … grande', {'lapidem': 'muitas pedras preciosas', 'multa': 'grande retribuição'}, 'DRB; the repetition lost.', 'DRB'),
]

# 18:13 — alheias (Latinist major, stylist, blind reader)
d = byId['alienis']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — with *faltas* understood, aliénis are others' faults; *estranhas* may mean odd or unknown → *das alheias*. "
             "The stylist asked the same; the blind reader heard 'unusual faults' first. Taken: three readers, one fault. The glossary's *estranho* serves persons "
             "(17:46 *filhos estranhos*); with a feminine noun understood it is heard as 'strange'. The Greek's persons (ἀλλοτρίων, 'strangers') stay the option.")
d['options'] = [
    opt('alheias', {'alienis': 'alheias'}, 'Ruling (draft 2): the Latinist, the stylist, DRB *those of others*.', 'latinist'),
    opt('estranhas', {'alienis': 'estranhas'}, "Draft 1: the glossary word; heard as odd faults. The masculine *dos estranhos* (persons, the Greek's ἀλλοτρίων) would need the colon rebuilt; not offered.", 'glossary'),
]

# 18:14b — future perfect (Latinist major)
d = byId['dominati']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — the future perfect puts the dominion before the state *ero* announces; the simple future subjunctive loses it → "
             "*Se não me tiverem dominado*. Taken: the compound future subjunctive is Portuguese's own tense for it and is sayable; the colon was −3 against the Latin.")
d['options'] = [
    opt('tiverem dominado', {'dominati': 'tiverem dominado'}, "Ruling (draft 2): the Latinist's; the tense kept.", 'latinist'),
    opt('dominarem', {'dominati': 'dominarem'}, 'Draft 1: plainer; the anteriority lost (major).', 'draft'),
]

# 18:15a — erunt ut compláceant (Latinist major; stylist's worst line)
d = byId['eloquia']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — the future lies on the words' condition, not on the act of saying; the clause adds a future *disser*, loses the "
             "plural and flattens *erunt ut compláceant* → *E as palavras da minha boca serão tais que agradem*. The stylist named the line his worst (the subject late; "
             "the second colon without support). Taken, his line verbatim: outside Ps 118 elóquia is *palavras* already (11:7, 17:31 *As palavras do Senhor*, D27), "
             "so the psalm follows them; *serão* now carries the second colon too, as *erunt* does. The stylist's *do vosso agrado* is an option (adds *vosso*, the Latin "
             "names no one); his *estará* in the second colon refused (the Latin's ellipsis).")
d['options'] = [
    opt('E as palavras da minha boca serão tais que agradem', {'eloquia': 'as palavras da minha boca serão tais que agradem'}, "Ruling (draft 2): the Latinist's line; elóquia → palavras as in 11:7, 17:31.", 'latinist'),
    opt('E serão do vosso agrado as palavras da minha boca', {'eloquia': 'serão do vosso agrado as palavras da minha boca'}, "The stylist's; supplies *vosso* (the Greek's εὐδοκία has no owner either).", 'stylist'),
    opt('E há de agradar o que disser a minha boca', {'eloquia': 'há de agradar o que disser a minha boca'}, 'Draft 1: D26\'s clause; the Latinist marked it major (a future act of saying the Latin lacks).', 'D26'),
]

# 18:15b — auxílio held (Latinist major)
d = byId['adjutor']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — adjútor names the one who helps; *auxílio* puts the help for the helper → *meu auxiliador*. "
             "HELD: D19 fixes *adjútor → auxílio* beside suscéptor → amparo and protéctor → protetor; the row records the same ask twice (117:6–7, minor) and "
             "refused it for length and currency; changing it here alone would split one Latin word in the psalter. Reported for a ruling: this verse, where "
             "the agent noun *redentor* stands beside it, is the strongest case against the row.")

steps = [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. Four majors and one minor; the marks confirmed. «A tradução conserva, em geral, o sentido e as imagens do latim; os desvios … dizem respeito ao sentido lexical, à referência pessoal e à expressão temporal.» Three majors taken, one held (18:15b, D19), the minor refused (D27).',
     'outcomes': [
         {'verse': '18:10', 'remark': "minor: 'pelos séculos dos séculos' pluralises → 'pelo século do século'", 'outcome': 'refused',
          'reason': 'in sǽculum sǽculi → pelos séculos dos séculos is settled (D27); the row records the same ask.'},
         {'verse': '18:13', 'remark': "MAJOR: 'das estranhas' may mean odd faults → 'das alheias'", 'outcome': 'taken', 'decision': 'alienis',
          'reason': 'With faltas understood, aliénis are others\'; the stylist and the blind reader heard the same fault.'},
         {'verse': '18:14b', 'remark': "MAJOR: 'Se não me dominarem' loses the future perfect's anteriority → 'Se não me tiverem dominado'", 'outcome': 'taken', 'decision': 'dominati',
          'reason': "Portuguese's compound future subjunctive; sayable, and the colon was short."},
         {'verse': '18:15a', 'remark': "MAJOR: 'há de agradar o que disser' adds a future act of saying, loses the plural and erunt ut → 'E as palavras da minha boca serão tais que agradem'", 'outcome': 'taken', 'decision': 'eloquia',
          'reason': 'Outside Ps 118 elóquia is palavras (11:7, 17:31; D27); the stylist named this line his worst.'},
         {'verse': '18:15b', 'remark': "MAJOR: 'meu auxílio' puts the help for the helper → 'meu auxiliador'", 'outcome': 'refused', 'decision': 'adjutor',
          'reason': 'HELD: D19 fixes adjútor → auxílio; one Latin word must not split in one verse; for a ruling (the strongest case, beside redentor).'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Nine verses; best 18:2, worst 18:15a. «O salmo tem sobriedade e imagens fortes … A oração perde naturalidade em algumas inversões e construções nominais.» Six taken (four of order), one taken in part, one refused, one option.',
     'outcomes': [
         {'verse': '18:3', 'remark': "'O dia ao dia … a noite à noite' crowded before the verbs → 'Um dia faz jorrar a palavra para outro dia …'", 'outcome': 'taken', 'decision': 'eructat',
          'reason': "Order and articles (D2), with *ao outro dia … à outra noite*: *para outro dia* heard as 'postponed'."},
         {'verse': '18:5', 'remark': "inversion; *deles … deles* echo → 'O som deles saiu por toda a terra: * e as palavras deles, até os confins do mundo'", 'outcome': 'taken', 'decision': 'orbis',
          'reason': 'Order only; the rhyme flag gone.'},
         {'verse': '18:6a', 'remark': "'tálamo' specialised, proparoxytone cadence → 'quarto nupcial'", 'outcome': 'taken', 'decision': 'thalamo',
          'reason': 'The plainer of two faithful words; the blind reader did not know tálamo.'},
         {'verse': '18:6b', 'remark': "order sounds assembled from Latin → 'a sua saída é do extremo do céu'", 'outcome': 'taken', 'decision': 'occursus', 'reason': 'Order only.'},
         {'verse': '18:7b', 'remark': "the noun line hangs without a verb → 'E ele chega até o seu extremo'", 'outcome': 'taken', 'decision': 'occursus',
          'reason': 'Taken in part: the copula supplied (*E a sua chegada é até …*), parallel to 18:6b; his verb would unmake the noun occúrsus.'},
         {'verse': '18:10', 'remark': "'séculos' proparoxytone at the mediant → move 'e é santo' after the formula", 'outcome': 'refused',
          'reason': "The formula is settled (D27), and the Latin's own cadence is the proparoxytone sǽculi; his order breaks the adjective + participle series."},
         {'verse': '18:11', 'remark': "'muita pedra preciosa' sounds like material → 'muitas pedras preciosas'", 'outcome': 'taken', 'decision': 'multa',
          'reason': 'Number is grammar; multus still repeated in both verses.'},
         {'verse': '18:13', 'remark': "'das estranhas' heard as odd faults → 'das alheias'", 'outcome': 'taken', 'decision': 'alienis', 'reason': 'With the Latinist.'},
         {'verse': '18:15a', 'remark': "worst line; subject late, second colon unsupported → 'E serão do vosso agrado … estará sempre à vossa vista'", 'outcome': 'option', 'decision': 'eloquia',
          'reason': "The line rebuilt on the Latinist's fix instead; *do vosso agrado* kept as option 2 (adds *vosso*); *estará* refused (the Latin's ellipsis)."},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Draft 1, Portuguese only. 27 items, 3 unknown words (firmamento, tálamo, Exultou). Two wrong first hearings the Latin does not share — 18:3 (the second *à noite* as a time) and 18:13 (*estranhas* as odd) — both changed; the rest is the Latin\'s openness.',
     'outcomes': [
         {'verse': '18:2', 'remark': "'das suas mãos': God's (heard first) / the firmament's", 'outcome': 'refused', 'reason': 'Heard rightly.'},
         {'verse': '18:3', 'remark': "'O dia ao dia': unclear relation between the days; 'à noite' heard as a time", 'outcome': 'taken', 'decision': 'eructat', 'reason': 'Order and articles changed (with the stylist).'},
         {'verse': '18:4', 'remark': 'the double negation may not be taken in; heard as absence of speech', 'outcome': 'refused', 'decision': 'quorum',
          'reason': "The Latin's build (non sunt … quorum non); both readings are old readings of the verse."},
         {'verse': '18:5', 'remark': "'deles': the heavens' (heard first) / days and nights", 'outcome': 'refused', 'reason': 'eórum as open.'},
         {'verse': '18:6a', 'remark': "'pôs a sua tenda' and 'e ele': God / the sun", 'outcome': 'refused', 'decision': 'tabernaculum', 'reason': "The Latin's unnamed subject and ipse, kept."},
         {'verse': '18:6b', 'remark': "'Exultou': the sun (heard first) / the bridegroom / God", 'outcome': 'refused', 'reason': "The Latin's subject is as open."},
         {'verse': '18:7b', 'remark': "'seu extremo': the sun's own / heaven's", 'outcome': 'refused', 'decision': 'summo', 'reason': 'ad summum ejus as open.'},
         {'verse': '18:8', 'remark': "'converte as almas': religious conversion (heard first) / restores", 'outcome': 'refused', 'decision': 'convertens', 'reason': "Heard as meant (D25's exception)."},
         {'verse': '18:8', 'remark': "'o testemunho do Senhor': given by the Lord (heard first)", 'outcome': 'refused', 'reason': 'Heard rightly.'},
         {'verse': '18:8', 'remark': "'aos pequeninos': children (heard first) / the humble", 'outcome': 'refused', 'reason': 'párvuli row: heard as children, which is the Latin.'},
         {'verse': '18:9', 'remark': "'As justiças': just acts (heard first) / norms", 'outcome': 'refused', 'decision': 'lucidum', 'reason': 'justítiæ plural row; both hearings are in the Latin.'},
         {'verse': '18:9', 'remark': "'ilumina os olhos': understanding (heard first)", 'outcome': 'refused', 'reason': 'Heard rightly.'},
         {'verse': '18:10', 'remark': "'O temor do Senhor': fear (heard first) / reverence", 'outcome': 'refused', 'reason': 'timor holds both.'},
         {'verse': '18:10', 'remark': "'os juízos': judgments (heard first)", 'outcome': 'refused', 'reason': 'Heard rightly (D15).'},
         {'verse': '18:10', 'remark': "'justificados em si mesmos': need no outside justification (heard first)", 'outcome': 'refused', 'reason': 'Close to the Latin.'},
         {'verse': '18:11', 'remark': 'subject: the judgments (heard first) / all the list', 'outcome': 'refused', 'decision': 'desiderabilia', 'reason': "The Latin's verbless line, as open."},
         {'verse': '18:12', 'remark': "'os guarda': obeys (heard first) / remembers / protects", 'outcome': 'refused', 'reason': 'custodíre row.'},
         {'verse': '18:12', 'remark': "'muita retribuição': from God (heard first) / the fruit of keeping", 'outcome': 'refused', 'reason': 'retribútio row, neutral on purpose.'},
         {'verse': '18:13', 'remark': "'Quem entende as faltas?': one's own sins (heard first) / others' / absences", 'outcome': 'refused', 'decision': 'delicta', 'reason': "Heard rightly first; 'absences' only as a third reading."},
         {'verse': '18:13', 'remark': "'faltas ocultas': hidden from others (heard first) / unknown to myself", 'outcome': 'refused', 'reason': 'occúlta holds both.'},
         {'verse': '18:13', 'remark': "'das estranhas': odd faults (heard first) / others' / strange women", 'outcome': 'taken', 'decision': 'alienis', 'reason': '*das alheias* (with the Latinist and stylist).'},
         {'verse': '18:14b', 'remark': "'Se não me dominarem': the faults (heard first)", 'outcome': 'refused', 'reason': 'Heard rightly; tense changed for the Latinist.'},
         {'verse': '18:14b', 'remark': "'da maior falta': the gravest sin, unnamed", 'outcome': 'refused', 'reason': "The Latin's delíctum máximum, unnamed."},
         {'verse': '18:15a', 'remark': "'há de agradar': to God (heard first) / to hearers", 'outcome': 'refused', 'reason': 'compláceant names no one; line changed for the Latinist.'},
         {'verse': '18:15a', 'remark': "'e a meditação …': also pleasing (heard first) / only before God", 'outcome': 'refused', 'reason': "The Latin's ellipsis; *serão* now carries both colons."},
         {'verse': '18:2', 'remark': 'unknown word: firmamento', 'outcome': 'refused', 'decision': 'firmamentum', 'reason': 'D31 names 18:2 for firmamento.'},
         {'verse': '18:6a', 'remark': 'unknown word: tálamo', 'outcome': 'taken', 'decision': 'thalamo', 'reason': '*quarto nupcial* (with the stylist).'},
         {'verse': '18:6b', 'remark': 'unknown word: Exultou', 'outcome': 'refused', 'reason': 'exsultáre → exultar (glossary); listed unknown before (117:15).'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': ("v2. Changed against draft 1: 18:3 *Um dia … ao outro dia … uma noite … à outra noite* (stylist, blind reader); 18:5 subject first (stylist; rhyme flag gone); "
              "18:6a *quarto nupcial* (stylist, blind reader); 18:6b / 18:7b order and the copula (stylist, in part); 18:11 *muitas pedras preciosas* (stylist); "
              "18:13 *das alheias* (Latinist major, stylist, blind reader); 18:14b *tiverem dominado* (Latinist major); 18:15a *E as palavras da minha boca serão tais que agradem* "
              "(Latinist major). Held: 18:15b *auxílio* (Latinist major; D19). Refused: 18:10 formula (Latinist minor, stylist). Draft 1 is prayed.v1.json "
              "(flat text prayed.v1.vos.json, the file the three v1 critics read). Script: ps018/revise_v2.py.")},
]
data['audit'].extend(steps)
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
