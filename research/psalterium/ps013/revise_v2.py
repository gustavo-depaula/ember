"""Ps 13 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps013/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def promote(d, label, note, source):
    """Move the option with this label to the front, rewriting its note; the old option 0 becomes 'draft 1'."""
    old = d['options'][0]
    old['note'] = 'Draft 1. ' + old['note'].removeprefix('Ruling: ')
    chosen = next(o for o in d['options'] if o['label'] == label)
    d['options'].remove(chosen)
    chosen['note'] = note
    chosen['from'] = source
    d['options'].insert(0, chosen)


data['version'] = 2
data['status'] = 'reviewed'

# 13:2 — 'olhou sobre' heard as a calque
d = decisions['prospexit']
d['why'] += ' Heard (draft 1): the stylist — «olhou sobre» soa transportada do latim; a boca espera «olhou para» — and he proposed the whole verse with ‘Do céu, o Senhor olhou para …’. The Latinist passed ‘sobre’.'
promote(d, 'olhou do céu para', 'Ruling (draft 2): the preposition Portuguese gives ‘olhar’ (Matos Soares 1932 in this psalm, and the stylist). A preposition follows the verb it hangs on — grammar (D2); what super adds, the look coming down, is still said by ‘do céu’. The stylist’s fronting (‘Do céu, o Senhor olhou para’) was not taken: the Latin’s order is also good Portuguese. Ps 52:3 should copy it (with Deus).', 'stylist')

# 13:3c — the adjective first was heard as declamatory
data['verses']['13:3c'] = 'A sua boca está cheia de maldição e de amargura: * {velozes} para derramar sangue.'
data['decisions'].append({
    'id': 'velozes', 'refs': ['13:3c'], 'latin': 'velóces pedes eórum ad effundéndum sánguinem', 'kind': 'order',
    'why': 'A verbless clause in the Latin (and in Romans 3:15, fetched): ‘swift their feet to shed blood’. Portuguese supplies ‘são’. Draft 1 kept the adjective first, as the Latin; the stylist: «A inversão dá à frase um tom declamatório que destoa da simplicidade do primeiro membro».',
    'options': [
        option('os seus pés são velozes', {'velozes': 'os seus pés são velozes'}, 'Ruling (draft 2): the stylist’s order — order yields to the ear (D2); every word kept. Matos Soares 1932 and the Diurnal build it so (‘os seus pés são ligeiros’).', 'stylist'),
        option('velozes são os seus pés', {'velozes': 'velozes são os seus pés'}, 'Draft 1: the Latin’s order, adjective first; heard by the stylist as declamatory.', 'draft'),
    ],
})

# 13:5 — Senhor / temor rhyme at mediant and final
data['verses']['13:5'] = '{invocaverunt}, * ali tremeram {timore}, onde não havia temor.'
data['decisions'].append({
    'id': 'invocaverunt', 'refs': ['13:5'], 'latin': 'Dóminum non invocavérunt', 'kind': 'order',
    'why': 'Draft 1 ‘Não invocaram o Senhor, * … onde não havia temor’ rhymed at mediant and final (Senhor / temor, flagged by checks.py and by the stylist: «“Senhor” na mediana rima com “temor” no final … A repetição de “temor” pertence ao texto e deve ficar»). The Latin has no such rhyme (invocavérunt / timor). The Latin puts the object first; 52:6a has the same words with Deum.',
    'options': [
        option('Ao Senhor não invocaram', {'invocaverunt': 'Ao Senhor não invocaram'}, 'Ruling (draft 2): the stylist’s line — which is the Latin’s own order, object first; the fronted object takes ‘a’ as Portuguese does with a fronted name of God. The rhyme goes, the colon ends on a paroxytone. Ps 52:6a should copy it: ‘A Deus não invocaram’.', 'stylist'),
        option('Não invocaram o Senhor', {'invocaverunt': 'Não invocaram o Senhor'}, 'Draft 1: natural order; rhymes with the final ‘temor’.', 'draft'),
    ],
})

# 13:7 — 'desviar o cativeiro'
d = decisions['averterit']
d['why'] += ' Heard (draft 1): the stylist — «“Desviar o cativeiro” soa pouco português» → ‘afastar’. The blind reader took ‘desviar o cativeiro’ first as ‘afastar ou evitar o cativeiro; o verbo não deixa evidente se ele já está acontecendo’ — which is as open as ‘turn away’ is in the Latin; the second hearing, averting a captivity still to come, is also a hearing of avértere.'
promote(d, 'afastar o cativeiro', 'Ruling (draft 2): the stylist’s verb. ‘Afastar’ is ‘turn away / put away’ in plain Portuguese, and says avértere’s image without the unidiomatic ‘desviar’ (which stays right for avértere with a face or with anger, 12:1, 77:38, 105:24). Cost: ‘afastar’ is the glossary’s working verb for amovére / repéllere (open) — they never stand in a verse with captivitátem (grep); 84:2 avertísti captivitátem Jacob should follow this psalm (‘afastastes o cativeiro de Jacó’). The blind reader’s doubt (a captivity present or threatened) stays, as in the Latin.', 'stylist')

# 13:7 — the stylist's order for the last clause (also removes the Israel / Israel echo at the ends)
data['verses']['13:7'] = '{quisdabit} de Sião a salvação de Israel? * quando o Senhor {averterit} do seu povo, {exsultabit}.'
data['decisions'].append({
    'id': 'exsultabit', 'refs': ['13:7'], 'latin': 'exsultábit Jacob, et lætábitur Israël', 'kind': 'order',
    'why': 'The last colon is the longest of the psalm (31 Latin syllables). The stylist («o membro também exige um fôlego longo; a ordem direta alivia a dicção») proposed the direct order. The words are 52:7’s too.',
    'options': [
        option('Jacó exultará, e Israel se alegrará', {'exsultabit': 'Jacó exultará, e Israel se alegrará'}, 'Ruling (draft 2): subject before verb, as the stylist asked — order only (D2); the verse now ends on the verb ‘alegrará’, not on a second ‘Israel’ (draft 1 ended both colons on ‘Israel’, the Latin’s own echo, flagged as a rhyme). Ps 52:7 copies it.', 'stylist'),
        option('exultará Jacó, e se alegrará Israel', {'exsultabit': 'exultará Jacó, e se alegrará Israel'}, 'Draft 1: the Latin’s order, verb first; both colons end on ‘Israel’, as the Latin’s do.', 'draft'),
    ],
})

data['choices']['13:3c'] = 'Quorum (a relative running on from 13:3b) → ‘A sua boca’, a new sentence: Portuguese does not open a prayed verse with ‘Cuja’; grammar (D2). maledíctio → maldição, amaritúdo → amargura. ‘são’ supplied in the second colon (decision velozes). effúndere → derramar (the glossary reserves ‘derramar’ for it, row eructáre).'
data['choices']['13:5'] = '13:5b = 52:6b word for word. invocáre → invocar (glossary). Draft 1’s rhyme Senhor / temor removed by the Latin’s own order (decision invocaverunt).'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
