"""Record the v2 Latinist gate (critic/v2.latinist.json) in prayed.json; status → reviewed. Text unchanged."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')

d['verses']['45:20'] = 'Não falei {abscondito}, * num lugar tenebroso da terra:'
decs = d['decisions']
i = next(i for i, x in enumerate(decs) if x['id'] == 'frustra')
decs.insert(i, {
    'id': 'abscondito', 'refs': ['45:20'], 'latin': 'Non in abscóndito locútus sum', 'kind': 'word',
    'why': 'in abscóndito is a place in 26:5 and 30:21 (no lugar escondido, the row) and a manner in 9:30a (às escondidas). '
           'With a verb of speaking the manner is the usual sense (DRB "in secret", MS1932 "às ocultas"); the v2 Latinist '
           'reads it as a place, parallel to in loco terræ tenebróso.',
    'options': [
        {'label': 'às escondidas', 'forms': {'abscondito': 'às escondidas'},
         'note': 'Draft: the manner, as 9:30a; the second colon names the place, so the parallel is still heard; keeps the root '
                 'of "escondido" (45:15) — the hidden God did not speak in hiding.', 'from': 'glossary'},
        {'label': 'em lugar escondido', 'forms': {'abscondito': 'em lugar escondido'},
         'note': 'The v2 Latinist\'s fix: the place, as the 26:5 row; doubles "lugar" with the next colon.', 'from': 'latinist'}]})

d['audit'].append({
    'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': 'Draft 2, claude-opus-5-5 in a fresh context with latin.json (run by the coordinator). No majors; two minors on two verses, '
            'all held as options. It called the rendering close and faithful, tenses, voices and persons tracking the Latin, and '
            'passed fabricatóres errórum, plastes, justítiæ plural and the open dicet. Gate clean of majors.',
    'outcomes': [
        {'verse': '45:20', 'remark': 'in abscóndito is local, parallel to in loco terræ tenebróso; asks "Não falei em lugar escondido"',
         'outcome': 'option', 'decision': 'abscondito',
         'reason': 'With a verb of speaking, the adverbial sense is DRB\'s and MS1932\'s; 9:30a has the same phrase adverbially; the place '
                   'is named in the next colon, and "em lugar escondido, num lugar tenebroso" doubles "lugar". His form is option 2.'},
        {'verse': '45:23', 'remark': '"Nada souberam" adds an intensifying "nothing"; asks "Não souberam"', 'outcome': 'option',
         'decision': 'nescierunt',
         'reason': 'Held for Gustavo: the v1 stylist asked for "Nada" because bare "Não souberam" sounds unfinished in Portuguese; the '
                   'v2 Latinist asks it back. The Latin\'s absolute verb has no object in either; "Não souberam" (81:5) is option 2.'},
        {'verse': '45:23', 'remark': 'lignum sculptúræ suæ: the genitive made an adjective; asks "o lenho da sua escultura"', 'outcome': 'option',
         'decision': 'lignum',
         'reason': 'He calls it defensible. "escultura" is heard as art (the sculptília row), and his form is +2 syllables on a colon '
                   'already long; option 3.'}]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('recorded')
