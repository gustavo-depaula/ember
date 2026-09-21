"""Ps 8 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps008/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2

# 8:3 — the stylist's verb
d = decisions['perfecisti']
d['why'] += ' Draft 1 had ‘fizestes perfeito o louvor’; the stylist: ‘a construção soa traduzida: a sequência de verbo, adjetivo e substantivo retarda a compreensão num primeiro membro já muito longo’.'
d['options'] = [
    option('aperfeiçoastes o louvor', {'perfecisti': 'aperfeiçoastes o louvor'}, 'Draft 2, the stylist’s: one verb for one, Douay-Rheims’s ‘perfected’ exactly, and the long colon moves faster. It changes only how the thing is said (D2). Proposed for the glossary: perfícere → aperfeiçoar — it carries the other places (10:4 ‘o que aperfeiçoastes, eles destruíram’; 17:34 ‘que aperfeiçoou os meus pés’; 39:7 ‘aperfeiçoastes os meus ouvidos’). Cost, the reason draft 1 avoided it: in everyday speech ‘aperfeiçoar’ is to improve what was wanting — which, of praise from mouths that cannot yet speak, is not far from the point.', 'stylist'),
    option('fizestes perfeito o louvor', {'perfecisti': 'fizestes perfeito o louvor'}, 'Draft 1: built as the glossary builds miri-ficáre → ‘fazer maravilhoso’. Passed the Latinist and the blind reader (who paraphrased it ‘tornar perfeito o louvor’); refused by the stylist as translated and slow.', 'draft'),
    option('fizestes sair um louvor perfeito', {'perfecisti': 'fizestes sair um louvor perfeito'}, 'Matos Soares 1932. Natural, and how the line is often quoted; ‘sair’ is supplied and the verb’s force moves into an adjective.', 'MS1932'),
    option('preparastes um louvor', {'perfecisti': 'preparastes um louvor'}, 'The Greek’s sense. The Latin chose perfícere, not paráre (rule 1).', 'draft'),
]

# 8:5 — held against the Latinist
d = decisions['quod']
d['why'] += ' The Latinist (draft 1, MAJOR): the Latin states the remembering and the visiting as facts, in the indicative; ‘para que’ with the subjunctive changes the mood and makes the fact less explicit — fix ‘Que é o homem, pois vos lembrais dele? * ou o filho do homem, pois o visitais?’'
d['options'][0]['note'] = 'Ruling, held against the Latinist’s major: this is the construction Portuguese has for exactly this question (as one says ‘quem sou eu, para que me procurem?’), and it presupposes the fact as firmly as an indicative states it — no one hears in it a doubt that God remembers. Mood and conjunction are grammar, where D2 lets the ear lead (D24 ruled so at 118:92, also against him); Matos Soares 1932, the outer bound, goes as far (‘para te lembrares dele’). Neither the stylist nor the blind reader stopped at the verse. The Latin’s quod / quóniam is one Greek word (ὅτι … ὅτι), so one Portuguese conjunction serves both (D15’s test). 143:3 will copy the frame.'
d['options'].insert(1, option('pois vos lembrais dele … pois o visitais', {'quod': 'pois vos lembrais dele', 'quoniam': 'pois o visitais'}, 'The Latinist’s fix (draft 1, major): the indicative kept, quod / quóniam read as causal. Faithful to the mood; in Portuguese a ‘pois’ clause hung on a question is not how the wonder is said — it reads as two sentences, ‘What is man? — for you remember him.’ One touch away if Gustavo sides with him.', 'latinist'))

# what the blind reader heard, recorded where it bears on a decision
decisions['magnificentia']['options'][0]['note'] += ' The blind reader listed ‘magnificência’ as a word some churchgoers may not know, and still paraphrased the verse rightly (‘a grandeza de Deus está acima dos céus’); kept.'
decisions['domine']['options'][0]['note'] += ' Heard: the stylist named 8:2a the psalm’s best line; neither he nor the blind reader stumbled on the doubled ‘Senhor’, and the Latinist passed it.'

choices = data['choices']
choices['8:3'] += ' The stylist: even with his verb the first colon ‘concentra a dificuldade de respiração’ — it does in the Latin too.'
choices['8:5'] += ' Heard: the blind reader took ‘o filho do homem’ first for Jesus, ‘pela familiaridade da expressão no ambiente da igreja’, and so 8:6 as said of him — the reading of Hebrews 2, which the Latin’s own phrase invites. The verse stands against the Latinist’s major on the mood (decision quod).'
choices['8:9'] += ' The stylist: ‘a repetição de «mar» corresponde à repetição latina e sustenta a oração’. The blind reader heard ‘que percorrem’ of the fishes alone — the Latin’s masculine ‘qui’. ‘Veredas’ (settled, D15) was again listed as unknown.'

data['audit'] += [
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1. One verse: 8:5 major — ‘para que’ + subjunctive for the Latin’s indicatives (quod memor es … quóniam vísitas). Everything else passed, marks confirmed: ‘Senhor, nosso Senhor’, ‘se elevou’ for the passive, ‘fizestes perfeito o louvor’, ‘Porque verei’, ‘um pouco menor que os anjos’, ‘debaixo dos seus pés’.',
        'outcomes': [
            {'verse': '8:5', 'remark': 'the Latin affirms the remembering and the visiting in the present indicative; ‘para que’ + subjunctive changes the mood → ‘pois vos lembrais dele … pois o visitais’ (MAJOR)', 'outcome': 'option', 'decision': 'quod', 'reason': 'Held against him on purpose: the ‘para que’ build is Portuguese’s idiom for this question and presupposes the fact; mood is grammar (D2; D24 at 118:92); Matos Soares 1932 has the same build with an infinitive. His ‘pois’ clause breaks the question in two. It is option 2.'},
        ],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': 'Draft 1. One verse; best 8:2a (the frame), worst 8:3. ‘O salmo soa sóbrio, reverente e, quase sempre, natural na boca; todas as terminações … permitem a cadência pedida … A repetição de «mar» corresponde à repetição latina e sustenta a oração.’',
        'outcomes': [
            {'verse': '8:3', 'remark': '‘fizestes perfeito o louvor’ sounds translated and slows an already long colon → ‘aperfeiçoastes o louvor’', 'outcome': 'taken', 'decision': 'perfecisti', 'reason': 'One faithful verb for another (Douay-Rheims ‘perfected’); how it is said is the ear’s (D2).'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': 'Draft 1, Portuguese only. Fifteen items, two unknown words (magnificência, veredas). No fault found: every item is the Latin’s own range. Worth Gustavo’s eye: ‘o filho do homem’ was heard first as Jesus, and 8:6 then as said of him.',
        'outcomes': [
            {'verse': '8:2a', 'remark': '‘o vosso nome’: the name God is called by / his fame; ‘em toda a terra’: the whole world / the earth as against the heavens (also 8:10)', 'outcome': 'refused', 'reason': 'nomen and terra are as open; the psalm itself plays earth against heavens in 8:2b.'},
            {'verse': '8:2b', 'remark': '‘se elevou … sobre os céus’: rose above the heavens / surpasses them', 'outcome': 'refused', 'decision': 'elevata', 'reason': 'eleváta est … super is both.'},
            {'verse': '8:3', 'remark': '‘por causa dos vossos inimigos’: the enemies moved God to it / the children praise on their account; ‘o inimigo e o vingador’: two foes / one', 'outcome': 'refused', 'reason': 'propter and the Latin’s pair are as open.'},
            {'verse': '8:4', 'remark': '‘que vós fundastes’: moon and stars / stars only / the heavens', 'outcome': 'refused', 'reason': 'The neuter ‘quæ’ is as loose.'},
            {'verse': '8:5', 'remark': '‘o homem’: mankind / a male; ‘o filho do homem’: a human being / Jesus (heard first) / the man’s son; ‘o visiteis’: a visit / God’s care', 'outcome': 'refused', 'reason': 'homo → homem (glossary, Ps 1); ‘fílius hóminis’ is the Gospel’s phrase in the Latin too, and Hebrews 2:6–9 reads the verse of Christ — the wording leaves both, as the Latin does. visitáre is as wide.'},
            {'verse': '8:6', 'remark': 'the three verbs: said of man / of Jesus / of a particular man’s son', 'outcome': 'refused', 'reason': 'As 8:5; the Latin’s ‘eum’ points back the same way.'},
            {'verse': '8:8', 'remark': '‘seus pés’: the man’s / God’s; ‘Tudo’: all creation / the animals listed', 'outcome': 'refused', 'reason': 'God is ‘vós’ throughout, so ‘seus’ is the man’s — heard so. ‘Ómnia’ followed by a list is the Latin’s build.'},
            {'verse': '8:9', 'remark': '‘que percorrem’: the fishes only / birds and fishes', 'outcome': 'refused', 'decision': 'perambulant', 'reason': 'The fishes were heard first, which is the Latin’s masculine ‘qui’.'},
            {'verse': '8:2b', 'remark': 'unknown word: magnificência', 'outcome': 'refused', 'decision': 'magnificentia', 'reason': 'The verse was still paraphrased rightly; the alternatives are other Latin words’ renderings (majestade, grandeza).'},
            {'verse': '8:9', 'remark': 'unknown word: veredas', 'outcome': 'refused', 'reason': 'Settled (D15); listed as unknown in Ps 118 too and kept there.'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': 'v2. One verse changed against draft 1, from the stylist: 8:3 ‘aperfeiçoastes o louvor’ (was ‘fizestes perfeito o louvor’). Held against the Latinist’s major: 8:5 ‘para que vos lembreis dele … para que o visiteis’. 8:2a and 8:10 are still one text (same two slots). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).',
    },
]

data['status'] = 'reviewed'
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['decisions']), 'decisions')
