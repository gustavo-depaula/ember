"""After the v2 gate and the v2 blind reading: options and notes only (option 0 and the text are untouched). Safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
path = folder / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


d = decisions['defecit']
if 'held against' not in d['options'][0]['note']:
    d['options'][0]['note'] += ' Tested: the second blind reading heard ‘Não há mais pessoas santas’ first — the fault of draft 1 is gone. HELD AGAINST THE LATINIST’S MAJOR (draft 2): he wants the perfect back (‘desapareceu o santo’, which he had passed on draft 1). Held because (1) the perfect of defícere here is resultative — ‘has come to an end’ is ‘is no more’ — and both Vulgate-family versions say it as a present state (Douay-Rheims ‘there is now no saint’, Matos Soares 1932 ‘não se encontra’), so this is inside D2’s outer bound; (2) the wording with a perfect was heard as the death of one particular person, a sense the Latin does not have, while this one loses only an aspect; (3) D24: a repeated major is weighed, not obeyed, and this one reverses his own pass.'
    d['why'] += ' The Latinist (draft 2, MAJOR): ‘já não há santo’ replaces the Latin perfect with a present statement of existence → ‘desapareceu o santo’.'
if not any(o['label'] == 'não restou santo' for o in d['options']):
    d['options'].insert(2, option('não restou santo', {'defecit': 'não restou santo'}, 'A past tense that stays generic (a bare noun after a negated verb): a middle way between the gate and the blind reader. Not read by any critic.', 'draft'))

d = decisions['diminutae']
if 'passed it on draft 1' not in d['options'][0]['note']:
    d['options'][0]['note'] += ' The Latinist passed it on draft 1 and, with the words unchanged, marked it (inside his 11:2 major on draft 2) as a change of voice → ‘foram diminuídas as verdades’. Refused: the Portuguese intransitive is the medio-passive the Greek ὠλιγώθησαν means (‘became few’), as ‘se elevou’ for eleváta est in Ps 8:2b, which he passed twice; the passive to the letter asks ‘by whom?’. His wording is option 3.'

d = decisions['magniloquam']
if not any(o['label'] == 'a língua que fala com altivez' for o in d['options']):
    d['options'].append(option('a língua que fala com altivez', {'magniloquam': 'a língua que fala com altivez'}, 'The Latinist’s second fix (draft 2, minor; on draft 1 he proposed ‘com arrogância’). Names the manner; the echo with ‘Engrandeceremos’ is lost.', 'latinist'))
    d['options'][0]['note'] += ' Draft 2: the Latinist repeated the minor with another fix (‘com altivez’); the second blind reading again heard ‘a fala de quem se vangloria ou faz afirmações arrogantes’ first. Held.'

d = decisions['anobis']
if 'Pedro Lombardo' not in d['why']:
    d['why'] += ' The Latinist (draft 2, minor, new): possession is a defensible reading, but it effaces the ‘from’ of a nobis, which Peter Lombard’s commentary reads as origin (cited by him, not checked here) → ‘os nossos lábios vêm de nós’.'
    d['options'][0]['note'] += ' Held against the Latinist’s minor (draft 2): possession is the reading of Douay-Rheims (‘our own’), of Matos Soares 1932 (‘somos donos’) and of the Greek’s παρ᾿ ἡμῶν ἐστιν in its usual sense; his ‘vêm de nós’ is option 2 and was the draft’s own second thought.'

data['status'] = 'reviewed'
steps = [
    {
        'step': 'checks',
        'note': 'Draft 2: hard pass. Soft flags: 11:2 first colon −3 (‘já não há santo’); 11:3 second colon +6 (‘falaram com um coração e outro coração’: the stylist’s order plus the two determiners — the longest colon of the psalm, sayable in one breath); 11:6a +4 / +3, 11:7 +4, 11:8 −3 as draft 1. The rhyme 11:5 / 11:6a is the Latin’s own echo (Dóminus / Dóminus).',
    },
    {
        'step': 'latinist',
        'file': 'critic/v2.latinist.json',
        'note': 'Draft 2 — the gate. NOT clean: one major, held on purpose (11:2), and two minors, refused. 11:2 MAJOR, two remarks: ‘já não há santo’ turns the perfect into a present of existence (fix: draft 1’s ‘desapareceu o santo’, which he passed then), and ‘diminuíram’ changes the voice (fix ‘foram diminuídas’ — words he passed unchanged on draft 1). 11:4 minor again (‘com altivez’, a different fix from draft 1’s). 11:5 minor, new: ‘são nossos’ effaces the ‘from’ of a nobis. Passed: ‘com um coração e outro coração’, ‘As palavras do Senhor são palavras puras’.',
        'outcomes': [
            {'verse': '11:2', 'remark': '‘já não há santo’: a present of existence for the perfect defécit → ‘desapareceu o santo’ (MAJOR)', 'outcome': 'option', 'decision': 'defecit', 'reason': 'Held: the perfect is resultative and both Vulgate-family versions say the present state; the perfect wording was heard by the blind reader as one person’s death; he reverses his own pass of draft 1 (D24: weighed, not obeyed). Option 2; ‘não restou santo’ (a past that stays generic) added as option 3 for Gustavo.'},
            {'verse': '11:2', 'remark': '‘diminuíram’: intransitive for a passive → ‘foram diminuídas as verdades’ (inside the major)', 'outcome': 'option', 'decision': 'diminutae', 'reason': 'Passed by him on draft 1 unchanged; the intransitive is the medio-passive of the Greek, as Ps 8:2b ‘se elevou’, which he passed. Option 3.'},
            {'verse': '11:4', 'remark': '‘fala grandezas’ may mean only grand subjects → ‘a língua que fala com altivez’ (minor)', 'outcome': 'option', 'decision': 'magniloquam', 'reason': 'Both blind readings heard boasting first; the echo with 11:5 is the Latin’s.'},
            {'verse': '11:5', 'remark': '‘são nossos’ effaces the ‘from’ of a nobis → ‘os nossos lábios vêm de nós’ (minor)', 'outcome': 'option', 'decision': 'anobis', 'reason': 'Possession is Douay-Rheims’ and Matos Soares 1932’s reading; the origin reading stays option 2.'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v2.ambiguity.json',
        'note': 'Draft 2, Portuguese only — run to test the three fixes. All three hold: 11:2 ‘já não há santo’ heard as ‘não há mais pessoas santas’ (canonised saints second); 11:3 ‘com um coração e outro coração’ heard as duplicity (‘embora a imagem possa não ficar clara’) — no ‘heart to heart’; 11:7 ‘As palavras do Senhor são palavras puras’ drew no item at all. Unknown words: vãs, indigentes (again), ímpios. The rest as draft 1 (11:6b ‘nele’ heard as ‘in the Lord’, and the colon as the psalmist’s — the Latin’s openness).',
        'outcomes': [
            {'verse': '11:2', 'remark': '‘já não há santo’: no holy people (heard first) / no canonised saints', 'outcome': 'refused', 'decision': 'defecit', 'reason': 'The fix holds.'},
            {'verse': '11:3', 'remark': '‘com um coração e outro coração’: duplicity (heard first) / different people, different intentions', 'outcome': 'refused', 'decision': 'corde', 'reason': 'The fix holds.'},
            {'verse': '11:6b', 'remark': '‘nele’: the poor / the Lord (heard first) / unnamed; ‘agirei com confiança’: the psalmist again (heard first)', 'outcome': 'refused', 'decision': 'fiducialiter', 'reason': 'As draft 1: the Latin marks the Lord’s words off no better.'},
            {'verse': '11:6a', 'remark': 'unknown word: indigentes (second time)', 'outcome': 'refused', 'decision': 'propter', 'reason': 'Kept; ‘desvalidos’ is option 3. Recorded in the glossary row as a known cost.'},
        ],
    },
]
known = [json.dumps(s, sort_keys=True, ensure_ascii=False) for s in data['audit']]
for step in steps:
    if json.dumps(step, sort_keys=True, ensure_ascii=False) not in known:
        data['audit'].append(step)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('patched')
