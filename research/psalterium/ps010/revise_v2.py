"""Ps 10 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps010/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2

# 10:2 — the cost of vós: 'dizeis' heard as said to the Lord
d = decisions['quomodo']
d['why'] += ' Heard (draft 1): the blind reader took ‘como dizeis à minha alma’ first as a question put to the Lord, ‘mencionado imediatamente antes’ — a cost of vós: in the Latin the number tells the two addressees apart (dícitis, plural, the advisers; perfecísti, 10:4, singular, God), in Portuguese both are ‘vós’.'
d['options'][0]['label'] = 'como dizeis'
d['options'][0]['note'] = 'Draft 1: the Latin’s ‘how’ (Douay-Rheims). Heard by the blind reader first as said to the Lord.'
d['options'][0]['from'] = 'draft'
d['options'].insert(0, option('como dizeis vós', {'quomodo': 'como dizeis vós'}, 'Ruling (draft 2): the subject hidden in the verb ending is named (D2 allows it), and set straight against ‘o Senhor’ of the first colon — in the Lord I trust; how can you say … — so that the hearer is told that ‘vós’ here is someone other than the Lord. Nothing is added that the Latin’s ‘dícitis’ does not say. One syllable more; the colon is still shorter than the Latin’s.', 'ambiguity'))

# 10:5b — the stylist's 'estão voltados para'
d = decisions['respiciunt']
d['why'] += ' The stylist (draft 1): ‘«olhos olham» repete sons muito próximos e faz a boca tropeçar; essa repetição não corresponde a uma repetição de raiz no latim’ → ‘Os seus olhos estão voltados para o pobre’.'
d['options'][0]['note'] = 'Draft 1: Matos Soares 1932’s words. Refused by the stylist for the jingle ‘olhos olham’, which the Latin does not have (Ps 53:9 accepted ‘o meu olho olhou’, where the Latin has óculus … despéxit).'
d['options'][0]['from'] = 'draft'
d['options'].insert(0, option('estão voltados para', {'respiciunt': 'estão voltados para'}, 'Ruling (draft 2), the stylist’s: the jingle gone, and the re- of respícere (to look back, turn one’s gaze to) heard. It is a participle of state (‘facing, turned towards’), not the reflexive ‘voltar-se’ that is convértere’s verb (glossary; Ps 5:8b has the same ‘voltado para’ for ad). Cost: a present of action becomes a state — to be weighed by the gate.', 'stylist'))

# 10:7 — the stylist's punctuation
data['verses']['10:7'] = '{pluet} sobre os pecadores: * fogo e enxofre e {procellarum} {calicis}.'
data['choices']['10:7'] = 'The list keeps the Latin’s repeated ‘et’ (fogo e enxofre e …): rule 2. Draft 1 had commas before each ‘e’ (fogo, e enxofre, e …); the stylist heard them as small stops that break a colon already long, and the two ‘e’ carry the weight — taken (punctuation only). The second colon is the psalm’s heaviest (+4 on the Latin’s 20 syllables), as it is in the Latin.'
data['choices']['10:2'] += ' Heard: the blind reader took ‘dizeis’ first as said to the Lord — a cost of vós (decision quomodo); draft 2 names the subject.'
data['choices']['10:8'] += ' Heard: ‘as justiças’ was understood first as ‘os atos justos’ — the test the decision asked for; the plural stands. ‘o seu rosto’ was heard as the Lord’s.'
data['choices']['10:3'] += ' The blind reader listed ‘aljava’ as unknown; there is no plainer word for a quiver, and the image is the Latin’s; kept.'

decisions['justitias']['options'][0]['note'] = 'Ruling: the Latin’s number kept — the plural of an abstract noun names its deeds, as ‘as misericórdias’ does. Tested: the blind reader heard ‘os atos ou comportamentos justos’ first, not the courts; the Latinist passed it.'
decisions['interrogant']['options'][0]['note'] += ' Heard: in 10:6 the blind reader took ‘interroga’ first as ‘faz perguntas ou exige explicações’, second as ‘examina ou põe à prova’ — the Latin verb’s own two senses; in 10:5b the eyelids were heard as a look that examines. The Latinist passed it.'
decisions['justus']['options'][0]['note'] += ' Heard: the blind reader took it first as ‘que mal o justo fez para merecer isso?’, second as ‘what did he do in the face of the destruction’ — both are in the Latin.'
decisions['calicis']['options'][0]['note'] += ' Heard: the blind reader understood ‘a porção de sofrimento ou castigo que lhes cabe’, the cup’s old sense.'

data['audit'] += [
    {
        'step': 'checks',
        'note': 'Draft 1: hard pass (ids and marks). Soft flags, all accepted: 10:2 third colon +3 (‘Muda-te para o monte como um pardal’: the article of the simile and ‘para’); 10:3 last colon +4 (‘os retos de coração’ is the glossary’s length for rectos corde); 10:7 second colon +4 (a copula supplied, ‘deles’ for eórum so that the verse does not end on the proparoxytone ‘cálice’). Every cadence is oxytone or paroxytone.',
    },
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1: clean — ‘A tradução conserva o sentido do latim em todos os versículos, incluindo suas imagens concretas, tempos verbais e peculiaridades septuagintais. As marcas de divisão são as mesmas e aparecem na mesma ordem que no latim.’ Passed without remark: ‘Muda-te’, ‘pardal’, ‘flecharem’, ‘aperfeiçoastes’ in natural order, ‘o Senhor tem no céu o seu trono’, ‘interrogam … interroga’, ‘as justiças’, ‘o seu rosto viu a equidade’.',
        'outcomes': [],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': 'Draft 1. Two verses, both ‘sayable’; best 10:4, worst 10:7. ‘O salmo soa sóbrio e reverente, com terminações adequadas ao canto e sem rimas insistentes nas cadências. As imagens incomuns permanecem concretas.’ Both taken: they change only how the thing is said (D2).',
        'outcomes': [
            {'verse': '10:5b', 'remark': '‘olhos olham’ makes the mouth stumble, a repetition the Latin does not have → ‘Os seus olhos estão voltados para o pobre’', 'outcome': 'taken', 'decision': 'respiciunt', 'reason': 'The jingle is not the Latin’s; ‘estar voltado para’ also lets the re- of respícere be heard. ‘Olham para’ stays option 2.'},
            {'verse': '10:7', 'remark': 'the commas of ‘fogo, e enxofre, e vento de tempestades’ fragment an already long colon → ‘fogo e enxofre e vento de tempestades’', 'outcome': 'taken', 'reason': 'Punctuation only; the Latin’s repeated ‘et’ is kept.'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': 'Draft 1, Portuguese only. Seventeen items, four unknown words (aljava, ímpio, iniquidade, equidade). One real fault: 10:2 ‘como dizeis à minha alma’ heard first as said to the Lord — a cost of vós, mended in draft 2. Everything else is the Latin’s own range, and the plural ‘as justiças’ (10:8), which the draft had put to the test, was heard rightly.',
        'outcomes': [
            {'verse': '10:2', 'remark': '‘como dizeis’: said to other people / to the Lord (heard first)', 'outcome': 'taken', 'decision': 'quomodo', 'reason': 'A fault the Latin does not have (dícitis is plural, God is singular in 10:4); draft 2 names the subject, ‘como dizeis vós’, against ‘o Senhor’ of the first colon.'},
            {'verse': '10:2', 'remark': '‘à minha alma’: to me / to the spiritual part of me', 'outcome': 'refused', 'reason': 'ánima → alma (glossary); the Latin is as open.'},
            {'verse': '10:3', 'remark': '‘no escuro’: in darkness / in secret', 'outcome': 'refused', 'reason': 'in obscúro holds both.'},
            {'verse': '10:4', 'remark': '‘destruíram’: the sinners / others', 'outcome': 'refused', 'reason': 'The sinners were heard first; the Latin leaves the subject in the verb as well.'},
            {'verse': '10:4', 'remark': '‘o que aperfeiçoastes’: the Lord’s work (heard first) / the addressees’ of 10:2', 'outcome': 'refused', 'reason': 'Heard rightly; the naming of ‘vós’ in 10:2 (draft 2) should make the turn to God plainer still.'},
            {'verse': '10:4', 'remark': '‘mas que fez o justo?’: what did he do in the face of it / what wrong did he do (heard first)', 'outcome': 'refused', 'decision': 'justus', 'reason': 'Both are in the Latin’s perfect.'},
            {'verse': '10:5b', 'remark': '‘as suas pálpebras’: the Lord’s (heard first) / the poor man’s', 'outcome': 'refused', 'reason': 'Heard rightly; ejus … ejus in the Latin.'},
            {'verse': '10:5b', 'remark': '‘as suas pálpebras interrogam’: the gaze examines / the eyelids ask questions', 'outcome': 'refused', 'decision': 'interrogant', 'reason': 'The Latin’s image; ‘examinam’ is option 2.'},
            {'verse': '10:5b', 'remark': '‘os filhos dos homens’: mankind (heard first) / sons of certain men', 'outcome': 'refused', 'reason': 'Glossary; heard rightly.'},
            {'verse': '10:6', 'remark': '‘interroga’: asks questions, demands explanations (heard first) / examines, tests', 'outcome': 'refused', 'decision': 'interrogant', 'reason': 'Both are senses of interrogáre (Lewis & Short: to question; to examine judicially).'},
            {'verse': '10:6', 'remark': '‘odeia a sua alma’: his own (heard first) / another’s', 'outcome': 'refused', 'decision': 'animam', 'reason': 'Heard rightly; ‘a sua própria alma’ is option 2.'},
            {'verse': '10:6', 'remark': '‘a sua alma’: the spiritual part (heard first) / the person, his life', 'outcome': 'refused', 'decision': 'animam', 'reason': 'ánima is as open (glossary: a minha alma, with vida as the known alternative).'},
            {'verse': '10:7', 'remark': '‘Fará chover’: the Lord (heard first) / the lover of iniquity', 'outcome': 'refused', 'decision': 'pluet', 'reason': 'Heard rightly; the Latin leaves the subject in the verb.'},
            {'verse': '10:7', 'remark': '‘laços’: snares (heard first) / ribbons', 'outcome': 'refused', 'reason': 'láqueus → laço (glossary, Ps 90:3); heard rightly.'},
            {'verse': '10:7', 'remark': '‘a parte do cálice deles’: the punishment that falls to them (heard first) / part of a cup', 'outcome': 'refused', 'decision': 'calicis', 'reason': 'The cup’s figurative sense was heard; the image is the Latin’s.'},
            {'verse': '10:8', 'remark': '‘as justiças’: just acts (heard first) / forms of justice or judgement', 'outcome': 'refused', 'decision': 'justitias', 'reason': 'The plural was heard as the draft meant it; kept.'},
            {'verse': '10:8', 'remark': '‘o seu rosto’: the Lord’s (heard first) / the just man’s', 'outcome': 'refused', 'reason': 'Heard rightly.'},
            {'verse': '10:3', 'remark': 'unknown word: aljava', 'outcome': 'refused', 'reason': 'The one word for a quiver; the image is the Latin’s.'},
            {'verse': '10:6', 'remark': 'unknown words: ímpio, iniquidade', 'outcome': 'refused', 'reason': 'Glossary words (ímpius → ímpio, iníquitas → iniquidade), listed as unknown in earlier psalms too.'},
            {'verse': '10:8', 'remark': 'unknown word: equidade', 'outcome': 'refused', 'reason': 'Glossary (ǽquitas → equidade; also listed as unknown in Ps 118).'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': 'v2. Three changes against draft 1: 10:2 ‘como dizeis vós’ (the subject named, after the blind reader heard ‘dizeis’ as said to the Lord); 10:5b ‘estão voltados para’ (the stylist’s, for ‘olham para’); 10:7 the commas of the list removed (the stylist’s). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).',
    },
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
