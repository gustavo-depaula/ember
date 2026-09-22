"""Ps 56 draft 2 from the v1 readers (latinist: no remarks; stylist; ambiguity). Run once on prayed.v1.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
v = d['verses']
v['56:2'] = 'Tende piedade de mim, {voc2}, tende piedade de mim: * porque em vós confia a minha alma.'
v['56:6'] = '{exaltare6} {caelos6}, {voc6}, * e {interram} a vossa glória.'
v['56:7b'] = 'Cavaram um {fovea} {faciem}: * e caíram nele.'
v['56:8'] = 'O meu coração está {paratum1}, {voc8}, o meu coração está {paratum2}: * cantarei, e {psalmum8}.'
v['56:9'] = '{exsurge1}, minha glória, {exsurge2}, {instruments}: * eu me levantarei ao amanhecer.'
v['56:12'] = '{exaltare12} {caelos12}, {voc12}: * e sobre toda a terra a vossa glória.'

dec = {x['id']: x for x in d['decisions']}

# 56:3 — the stylist's cadence point, met with the glossary's own build (7:18)
alt = dec['altissimum']
alt['why'] += (' **v2:** the stylist heard the proparoxytone *altíssimo* at the mediant as a dead syllable and asked '
               '*Ao Deus altíssimo clamarei*. The cadence point taken, by the glossary\'s own remedy (7:18 = 12:6b '
               '*do altíssimo Senhor*): the adjective before the noun, so the colon ends on *Deus* and the verb stays first, '
               'as the Latin has it. His inversion (verb last) is refused: an inversion made only for the cadence, when the plain order gives the same cadence; the verb is not a slot, so it is recorded here and in the audit.')
o = alt['options']
alt['options'] = [
    {'label': 'ao altíssimo Deus', 'forms': {'altissimum': 'ao altíssimo Deus'},
     'note': 'Ruling (v2); 7:18\'s build; oxytone mediant, verb first as the Latin.', 'from': 'glossary'},
    {'label': 'ao Deus altíssimo', 'forms': {'altissimum': 'ao Deus altíssimo'},
     'note': 'Draft 1; the Latin\'s order; MS1932; proparoxytone at the mediant.', 'from': 'draft'},
    o[2],
]

d['decisions'].append({
    'id': 'vocative', 'refs': ['56:2', '56:6', '56:8', '56:12'], 'latin': 'Deus (vocative, no *o*)', 'kind': 'glossary',
    'why': 'The stylist (v1) asked for *ó Deus* in all four places: the bare vocative reads as a calque, and at the mediant of 56:6 / 56:12 a lone monosyllable sounds clipped. Refused for now: the Latin has no *o*, the *Dóminus* row keeps the vocative without *ó* unless the Latin has it, and D44 has just held the bare *Deus* in Ps 50 against the same request (*flagged for Gustavo*). It is one ruling for the psalter, not for this psalm, so it stays with D44; *ó Deus* is one touch away here in all four verses at once.',
    'options': [
        {'label': 'Deus', 'forms': {'voc2': 'Deus', 'voc6': 'Deus', 'voc8': 'Deus', 'voc12': 'Deus'},
         'note': 'Ruling; the Latin; D44 (Ps 50), the Dóminus row.', 'from': 'glossary'},
        {'label': 'ó Deus', 'forms': {'voc2': 'ó Deus', 'voc6': 'ó Deus', 'voc8': 'ó Deus', 'voc12': 'ó Deus'},
         'note': 'stylist v1; MS1932 *ó Deus* (56:2, 56:8, 56:12); the familiar form.', 'from': 'stylist'},
    ],
})

d['decisions'].append({
    'id': 'fovea', 'refs': ['56:7b'], 'latin': 'fóveam', 'kind': 'glossary',
    'why': 'The stylist (v1) asked *uma cova* for *fosso* (a moat or ditch) and *e nela caíram* for the ending. The *lacus / fóvea* row keeps *cova* for *lacus* and *fosso* for *fóvea*, because 7:16 has both in one verse (*Abriu uma cova … e caiu no fosso que fez*) and the row names this verse and 93:13; so *fosso* stays. *e caíram nele* stays too: *nele* is a paroxytone, not a weak ending, and the natural order needs no inversion (rule 5). Both proposals are options.',
    'options': [
        {'label': 'fosso', 'forms': {'fovea': 'fosso'}, 'note': 'Ruling; the row; 7:16.', 'from': 'glossary'},
        {'label': 'cova', 'forms': {'fovea': 'cova'}, 'note': 'stylist v1; MS1932 *cova*; merges with *lacus* (7:16).', 'from': 'stylist'},
    ],
})

d['decisions'].append({
    'id': 'instruments', 'refs': ['56:9'], 'latin': 'psaltérium et cíthara', 'kind': 'order',
    'why': 'The stylist (v1) asked to swap the instruments so that the mediant falls on the paroxytone *saltério*. Refused: the Latin itself ends the colon on the proparoxytone *cíthara*, so the Portuguese sings as the Latin does; the pair is the same in 107:3, 32:2 (*cítara … saltério*, the other way round, because that Latin is) and 80:3, 91:4, 150:3, and a reader crossing columns should find the Latin\'s order. The swap is the option.',
    'options': [
        {'label': 'saltério e cítara', 'forms': {'instruments': 'saltério e cítara'}, 'note': 'Ruling; the Latin\'s order; MS1932.', 'from': 'draft'},
        {'label': 'cítara e saltério', 'forms': {'instruments': 'cítara e saltério'}, 'note': 'stylist v1; paroxytone mediant.', 'from': 'stylist'},
    ],
})

ex = dec['exsurge']
ex['why'] += (' **v2:** the ambiguity reader heard *minha glória* as God first, and the *tu* form then clashed with *vós*. '
              'The Latin is as open (the same *Exsúrge* serves *Dómine* elsewhere, and *glória mea* is God in 3:4); but one verb '
              'addresses the glory and the instruments together, and the instruments are not God, so *tu* stands; the *vós* '
              'reading is now option 4, one touch away.')
ex['options'].append({'label': 'Levantai-vos … levanta-te', 'forms': {'exsurge1': 'Levantai-vos', 'exsurge2': 'levanta-te'},
                      'note': 'ambiguity v1: *minha glória* = God (as 3:4); splits the Latin\'s one form into two addresses.', 'from': 'ambiguity'})

d['choices']['56:9'] = ('The mediant falls on *cítara*, a proparoxytone, as the Latin\'s *cíthara* does; kept (decision `instruments`). '
                        'The unknown words *saltério* and *cítara* (ambiguity reader) are the rows\' (32:2, 48:5), kept as the Latin\'s instruments.')

audit = d['audit']
audit.append({'step': 'latinist', 'file': 'critic/v1.latinist.json',
              'note': 'claude-opus-5-5 (fresh context). No remarks: tenses, voice, images, the *in / super omnem terram* distinction and the pointing all passed.',
              'outcomes': []})
audit.append({'step': 'stylist', 'file': 'critic/v1.stylist.json',
              'note': 'claude-opus-5-5 (fresh context). 7 remarks; best line 56:2b, worst 56:7b. 1 taken in substance (56:3 cadence, by the glossary\'s build), 6 kept as options (the bare vocative ×4, *cova*, the swap of the instruments).',
              'outcomes': [
                  {'verse': '56:2', 'remark': 'bare vocative *Deus* a calque → *ó Deus*', 'outcome': 'option', 'decision': 'vocative', 'reason': 'the Latin has no *o*; D44 held the bare vocative in Ps 50 and flagged it for Gustavo; one psalter-wide ruling'},
                  {'verse': '56:3', 'remark': 'proparoxytone *altíssimo* at the mediant → *Ao Deus altíssimo clamarei*', 'outcome': 'taken', 'reason': 'the cadence taken by 7:18\'s order (*ao altíssimo Deus*), not by the inversion (verb last), refused as inversion for its own sake'},
                  {'verse': '56:6', 'remark': 'bare vocative clipped at the mediant → *ó Deus*', 'outcome': 'option', 'decision': 'vocative', 'reason': 'as 56:2'},
                  {'verse': '56:7b', 'remark': '*fosso* a moat → *cova*; *nele* weak → *e nela caíram*', 'outcome': 'option', 'decision': 'fovea', 'reason': 'the *lacus / fóvea* row keeps the two words apart (7:16); *nele* is a paroxytone and the plain order needs no inversion'},
                  {'verse': '56:8', 'remark': 'bare vocative → *ó Deus*', 'outcome': 'option', 'decision': 'vocative', 'reason': 'as 56:2'},
                  {'verse': '56:9', 'remark': 'proparoxytone *cítara* at the mediant → *cítara e saltério*', 'outcome': 'option', 'decision': 'instruments', 'reason': 'the Latin ends the colon on *cíthara*; its order kept for the reader crossing columns and for 107:3'},
                  {'verse': '56:12', 'remark': 'bare vocative → *ó Deus*; keep the refrain identical to 56:6', 'outcome': 'option', 'decision': 'vocative', 'reason': 'as 56:2; the refrain already shares every slot the Latin shares'},
              ]})
audit.append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
              'note': 'claude-opus-5-5 (fresh context). 19 readings; the likely hearing was the intended one in most. Unknown: *saltério*, *cítara*, *afronta*, *calcam*, *filhotes de leões* — all glossary words, kept.',
              'outcomes': [
                  {'verse': '56:9', 'remark': '*Levanta-te, minha glória* heard as said to God, clashing with *vós*', 'outcome': 'option', 'decision': 'exsurge', 'reason': 'one Latin verb addresses the glory and the instruments together; the instruments are not God, so *tu*; the *vós* reading is option 4'},
                  {'verse': '56:4', 'remark': '*Enviou do céu* waits for an object', 'outcome': 'refused', 'reason': 'the Latin and the Greek have none; 56:4b supplies it; MS1932\'s gloss is option 2 of `misit`'},
                  {'verse': '56:4b', 'remark': '*dormi perturbado* disconnected from the lions', 'outcome': 'refused', 'reason': 'the Latin is as abrupt (*dormívi conturbátus*)'},
                  {'verse': '56:6', 'remark': '*Exaltai-vos* can be heard as said to the people', 'outcome': 'refused', 'reason': 'the settled *Exaltáre* row (7:7a, 20:14); *Deus* in the same colon names the addressee'},
                  {'verse': '56:2b', 'remark': '*iniquidade* heard as sin rather than a passing danger', 'outcome': 'refused', 'reason': 'the Latin\'s word (*iníquitas*, ἀνομία); the row'},
                  {'verse': '56:4', 'remark': '*afronta*, *calcam* unknown', 'outcome': 'refused', 'reason': 'rows (oppróbrium, conculcáre D44); reported to the rows'},
              ]})
audit.append({'step': 'revision', 'version': 2,
              'note': 'v2: 56:3 *ao altíssimo Deus* (stylist\'s cadence, 7:18\'s order); new decisions `vocative` (*ó Deus* option ×4), `fovea` (*cova* option), `instruments` (swap option); `exsurge` gains the *vós* reading as option. Draft 1 kept as prayed.v1.json. Handed to the coordinator for the Latinist gate.'})

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
