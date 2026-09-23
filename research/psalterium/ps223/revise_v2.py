"""Revise ps223 to v2 after the v1 readers, and record their outcomes in the audit.
python3.13 research/psalterium/ps223/revise_v2.py  (idempotent: refuses to run twice)"""
import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] != 1:
    raise SystemExit('already revised')
if not (here / 'prayed.v1.json').exists():
    shutil.copy(p, here / 'prayed.v1.json')
    shutil.copy(here / 'prayed.vos.json', here / 'prayed.v1.vos.json')

dec = {x['id']: x for x in d['decisions']}

# 2:2 dilatátum: the Latinist and the stylist both asked the cognate; *bem* was a filler.
a = dec['dilatatum']
a['why'] += (" v2: the Latinist (minor) and the stylist both named *Abriu-se bem* a paraphrase with a filler *bem* "
             "(the stylist: 'a dentist's instruction'), and the ambiguity reader heard *bem* also as 'rightly'. Both asked "
             "*Dilatou-se*, MS1932's cognate and 118:32's verb (*dilatastes o meu coração*); the medical colour feared in v1 "
             "was heard by no reader. Taken.")
a['options'] = [
    {'label': 'Dilatou-se', 'forms': {'dilatatum': 'Dilatou-se'},
     'note': 'v2; the Latinist and the stylist; MS1932; the cognate, as 118:32.', 'from': 'latinist'},
    {'label': 'Abriu-se bem', 'forms': {'dilatatum': 'Abriu-se bem'},
     'note': 'v1; the 80:11 idiom. *bem* heard as a filler (stylist) and as "rightly" (ambiguity reader).', 'from': 'draft'},
    {'label': 'Escancarou-se', 'forms': {'dilatatum': 'Escancarou-se'},
     'note': "= 34:21's word for the same Latin; the mockers' gape.", 'from': 'glossary'},
]

# 2:4 sublímia: the Latinist's construction replaces the heavier alternative.
s = dec['sublimia']
s['options'][1] = {'label': 'o falar de coisas altivas', 'forms': {'sublimia': 'o falar de coisas altivas'},
                   'note': "The Latinist (minor): keeps *loqui* as a verb. Heavy.", 'from': 'latinist'}

# 2:9 dedúcit … redúcit: D25 — dedúcere of a descent is *fazer descer*.
d['verses']['2:9'] = 'O Senhor {vivificat}, * {deducit} {inferos} e {reducit}.'
d['decisions'].insert(d['decisions'].index(dec['inferos']), {
    'id': 'deducit', 'refs': ['2:9'], 'latin': 'dedúcit ad ínferos et redúcit', 'kind': 'glossary',
    'why': ("v1 copied canticle 212 (*conduzis aos infernos, e trazeis de volta*) so that the two would move together. The "
            "Latinist (minor) found that *conduz* loses the downward motion of *de-dúcere* that pairs with *re-dúcere*. He is "
            "right, and the psalter already rules it: D25, *guiar* is for guidance, *dedúcere* of a descent is *fazer descer* "
            "(7:6, 21:16, 54:24 *os fareis descer ao poço*). 212's *conduzis* predates no rule; it simply did not meet D25. "
            "So 223 now differs from 212 in the verb only, and the *ad ínferos* row (for Gustavo) should rule both, "
            "*fazer descer* included. The stylist asked *conduz … e reconduz* for the paired prefix: kept as option; "
            "*reconduzir* is heard as re-electing an official."),
    'options': [
        {'label': 'faz descer … e traz de volta', 'forms': {'deducit': 'faz descer', 'reducit': 'traz de volta'},
         'note': "v2; the Latinist; D25 (DM1962 and the Brazilian liturgy also *faz descer*).", 'from': 'latinist'},
        {'label': 'conduz … e traz de volta', 'forms': {'deducit': 'conduz', 'reducit': 'traz de volta'},
         'note': 'v1; = canticle 212.', 'from': 'draft'},
        {'label': 'conduz … e reconduz', 'forms': {'deducit': 'conduz', 'reducit': 'reconduz'},
         'note': 'The stylist: the paired prefix. *reconduzir* is heard of officials.', 'from': 'stylist'},
    ]})

# 2:13 cárdines: two readers heard the geographic poles.
c = dec['cardines']
c['why'] += (" v2: the stylist and the ambiguity reader both heard *polos* as the North and South Poles, a geography "
             "lesson. The stylist asked *eixos*: the pivot, which is *cardo*'s own second sense (L&S), and a thing a world "
             "can be set upon. Taken; *polos* (DRB, MS1932) stays option 2.")
c['options'] = [
    {'label': 'os eixos', 'forms': {'cardines': 'os eixos'}, 'note': "v2; the stylist; the pivot.", 'from': 'stylist'},
    {'label': 'os polos', 'forms': {'cardines': 'os polos'},
     'note': 'v1; DRB, MS1932. Heard as the geographic poles by two readers.', 'from': 'MS1932'},
    {'label': 'os gonzos', 'forms': {'cardines': 'os gonzos'}, 'note': 'The hinge; little known.', 'from': 'draft'},
]

# 2:14: the stylist's order; the cleft was long before the breath's end.
r = dec['roborabitur']
r['why'] += (" v2: the stylist found the cleft prosaic and too long for the breath, and asked the plain order *porque o homem "
             "não se fortalecerá pela sua força*. Every word is kept; in Portuguese the negation before the verb still falls "
             "on *pela sua força* when it closes the line. Order only (D2); taken. The cleft stays as option.")
r['options'] = [
    {'label': 'porque o homem não se fortalecerá pela sua força',
     'forms': {'roborabitur': 'porque o homem não se fortalecerá pela sua força'},
     'note': 'v2; the stylist; the plain order.', 'from': 'stylist'},
    {'label': 'porque não é pela sua força que o homem se fortalecerá',
     'forms': {'roborabitur': 'porque não é pela sua força que o homem se fortalecerá'},
     'note': 'v1; the cleft puts the negation on the phrase, as the Latin.', 'from': 'draft'},
    {'label': 'porque não pela sua força se fortalecerá o homem',
     'forms': {'roborabitur': 'porque não pela sua força se fortalecerá o homem'},
     'note': "The Latin's order; stiff.", 'from': 'draft'},
]

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': ('Reader: claude-opus-5-5, fresh context, with latin.json. Four minor remarks, no major; judged a faithful, close '
              'rendering with the Septuagintal features kept and the pointing correct in every verse.'),
     'outcomes': [
         {'verse': '2:2', 'remark': 'abriu-se bem paraphrases dilatatum with an added intensifier; asks Dilatou-se', 'outcome': 'taken',
          'decision': 'dilatatum', 'reason': 'The stylist asked the same; MS1932, 118:32.'},
         {'verse': '2:4', 'remark': 'loqui nominalized into palavras; asks o falar de coisas altivas', 'outcome': 'option',
          'decision': 'sublimia',
          'reason': "*multiplicar* takes no infinitive in Portuguese; making verb and object one noun is grammar (D2), MS1932's. His wording replaces option 2."},
         {'verse': '2:7', 'remark': 'panibus plural; asks por pães', 'outcome': 'refused',
          'reason': "D42: *panes → pão*, the idiom (settled). The plural is heard as loaves counted."},
         {'verse': '2:9', 'remark': 'conduz loses the downward motion of deducit; asks faz descer', 'outcome': 'taken',
          'decision': 'deducit',
          'reason': "D25 (*dedúcere* of a descent → *fazer descer*, 7:6, 21:16, 54:24). It parts 223 from 212's *conduzis*; flagged for the *ad ínferos* row."}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': ('Reader: claude-opus-5-5, fresh context, with latin.json. 8 remarks: 3 taken, 5 refused or kept as options. '
              'Worst line 2:7, best 2:10.'),
     'outcomes': [
         {'verse': '2:1', 'remark': 'inverted passive reads as translation; asks e o meu chifre foi exaltado no meu Deus', 'outcome': 'refused',
          'reason': "The Latin's order, and the psalter's for this very phrase: 74:11, 88:18, 88:25, 91:11 all *será exaltado o … chifre*. The verb next to *exultou* also keeps the echo at the colon's head."},
         {'verse': '2:2', 'remark': 'bem a filler; asks Dilatou-se', 'outcome': 'taken', 'decision': 'dilatatum',
          'reason': 'With the Latinist.'},
         {'verse': '2:5', 'remark': 'saberes academic; asks o Deus dos conhecimentos', 'outcome': 'refused',
          'reason': "*sciéntia → o saber* is the glossary's row (18:3, 72:11); *conhecimento* would be a new word for it, and no plainer. *o Deus do saber* stays option 2 if the plural should go."},
         {'verse': '2:7', 'remark': 'se empregaram sounds like a job search; asks alugaram-se, eram fartos', 'outcome': 'option',
          'decision': 'locaverunt',
          'reason': "*alugar-se* is the literal verb but in Brazil is heard of renting property; the ambiguity reader heard *se empregaram* as intended, 'hired themselves out for bread'. *se alugaram* stays option 2. *estavam fartos* kept: the state before the fall."},
         {'verse': '2:9', 'remark': 'traz de volta colloquial; asks conduz aos infernos e reconduz', 'outcome': 'option',
          'decision': 'deducit',
          'reason': "The Latinist's *faz descer* took the verb; *reconduzir* is heard of officials. Option 3."},
         {'verse': '2:12', 'remark': 'ocupe administrative; asks tenha', 'outcome': 'refused',
          'reason': "*tenha um trono* is weak and possessive; *ocupar um trono* is the ordinary Portuguese for a king in his seat (MS1932). *tenha* stays option 3."},
         {'verse': '2:13', 'remark': 'polos heard as the geographic poles; asks os eixos', 'outcome': 'taken', 'decision': 'cardines',
          'reason': 'The ambiguity reader heard the same; *eixos* is the pivot, cardo\'s own sense.'},
         {'verse': '2:14', 'remark': 'the cleft is long and prosaic; asks porque o homem não se fortalecerá pela sua força', 'outcome': 'taken',
          'decision': 'roborabitur', 'reason': 'Order only (D2); every word kept.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': ('Reader: claude-opus-5-5, fresh context. 24 readings, most heard as intended. Unknown words: chifre (as a metaphor), '
              'altivas, cingidos, alçará.'),
     'outcomes': [
         {'verse': '2:1, 2:16', 'remark': 'chifre heard as a literal horn', 'outcome': 'refused',
          'reason': "*cornu → chifre* is the glossary's row across the psalter (74:11, 88:18, 91:11, 111:9); *força* and *fronte* stay options in `cornu`."},
         {'verse': '2:2', 'remark': "Abriu-se bem heard also as 'opened rightly'", 'outcome': 'taken', 'decision': 'dilatatum',
          'reason': '*Dilatou-se* (Latinist and stylist).'},
         {'verse': '2:3', 'remark': "santo heard as the noun, 'no saint like the Lord'", 'outcome': 'option', 'decision': 'nonest',
          'reason': "The reading is near the sense and the Latin's *sanctus* is as open; *Ninguém é santo* stays option 2."},
         {'verse': '2:4, 2:5', 'remark': 'vós shifts from God (2:2–2:3) to the proud', 'outcome': 'refused',
          'reason': "The Latin's shift of address (*tuo*, *te*, then *nolíte*); the reader resolved it himself."},
         {'verse': '2:5', 'remark': 'as coisas velhas vague; para ele são preparados os pensamentos unclear', 'outcome': 'refused',
          'reason': "Both as open in the Latin (*vétera*; *ipsi præparántur cogitatiónes*). Options stay in `vetera` and `ipsi`."},
         {'verse': '2:8', 'remark': 'Até que heard as temporal, confusing', 'outcome': 'refused',
          'reason': "The Latin's *donec* (DRB 'so that'); the climax it marks survives."},
         {'verse': '2:9', 'remark': 'infernos heard as the hell of the damned', 'outcome': 'refused', 'decision': 'inferos',
          'reason': 'Foreseen; the open *ad ínferos* row, with 212, for Gustavo. *traz de volta* in the line says it is a place one returns from.'},
         {'verse': '2:12', 'remark': 'se sente also sentir-se', 'outcome': 'refused',
          'reason': 'He heard *sits* from context; *com os príncipes* and *trono* fix it.'},
         {'verse': '2:13', 'remark': 'polos heard as the geographic poles', 'outcome': 'taken', 'decision': 'cardines',
          'reason': '*os eixos* (the stylist).'},
         {'verse': '2:16', 'remark': 'Cristo heard as Jesus Christ', 'outcome': 'refused', 'decision': 'christi',
          'reason': 'D19 (settled): *Christus → Cristo*; the Christian reading is the one the Church sings. *Ungido* stays option 2.'}]},
    {'step': 'revision', 'version': 2,
     'note': ('v2: 2:2 *Dilatou-se* (Latinist and stylist); 2:9 *faz descer aos infernos* (the Latinist, D25; now differs from '
              "212's *conduzis* in the verb — for the *ad ínferos* row); 2:13 *os eixos* (stylist and ambiguity reader); "
              '2:14 *porque o homem não se fortalecerá pela sua força* (stylist, order). The draft is kept as prayed.v1.json.')},
]
d['version'] = 2
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
