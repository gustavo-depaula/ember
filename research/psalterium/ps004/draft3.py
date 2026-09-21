"""Ps 4, draft 2 → draft 3: the rulings of DECISIONS.md D8, and the move to the slot/decision schema.

    python3.13 research/psalterium/ps004/draft3.py

Draft 2 lived in two files: the flat `prayed.json` and, beside it, `decisions.json` (slots and options, converted
from review.html). This keeps both as the record of draft 2 (`prayed.v2.json`, `decisions.v2.json`) and writes one
`prayed.json` in the schema every other psalm uses, with the ruled option first in each decision. Run once; it
refuses to run again.
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent

# decision id → (index of the ruled option in draft 2's list, why it was ruled so)
rulings = {
    'exaudire': (1, 'Ruled (DECISIONS.md D3): escutar — a hearing verb, as exaudíre is; atender is needed for inténde, which stands beside exáudi in 16:1, 54:2, 60:2, 140:1.'),
    'gravi': (1, 'Ruled (D8, under D2): the stylist’s. It supplies a verb and nothing else — grammar, where the ear may lead; Matos Soares 1932 supplies one too (sereis).'),
    'mirificavit': (0, 'Ruled (D8): the draft stands. The stylist’s “fez maravilhas pelo seu santo” is what the Hebrew says, not what the Latin says; Matos Soares 1932 has the draft’s wording.'),
    'compungimini': (0, 'Ruled (D8): the draft stands. Arrepender-se is another word (pænitére); the sting is the Latin’s image, and the verb keeps the cadence. Matos Soares 1932: compungi-vos.'),
    'sacrificate': (0, 'Ruled (D8): the draft stands. The repetition is the Latin’s own (D2).'),
    'multiplicati': (1, 'Ruled (D8, under D2): the stylist’s. A subject pronoun is grammar — and without it the ear takes “trigo, vinho e azeite” as what multiplied, which “a fructu” excludes.'),
    'singulariter': (0, 'Ruled (D8): the draft stands. “Só vós” decides an ambiguity the Latin leaves open (D2).'),
    'dilatasti': (0, 'Ruled (D8): the draft stands. Matos Soares’ “me pusestes ao largo” keeps the width better, but in Brazil “ao largo” is heard first as “at a distance, offshore”. To be looked at again with 118:32 dilatásti cor meum.'),
    'bona': (0, 'Ruled (D8): the draft stands; no reader argued against it.'),
    'signatum': (0, 'Ruled (D8): the draft stands; no reader argued against it.'),
    'ordo': (0, 'Ruled (D8): the draft stands — natural order, where the ear may lead (D2).'),
    'idipsum': (0, 'Deferred (D9): “a um só tempo” stands until in idípsum has its word study; none of its other five places is translated yet.'),
}

governing = {
    'id': 'governing', 'kind': 'standing', 'title': 'How far may the ear pull against the Latin?',
    'why': 'Ruled overnight as DECISIONS.md D2, for Gustavo’s review. The stylist found eight of ten verses of draft 2 not yet native; the Latinist and both judges found nothing to correct. D2 is the rule under which both can be right, and draft 3 is draft 2 ruled by it.',
    'options': [
        {'label': 'Keep the Latin’s words, images, repetitions and ambiguities; yield to the ear on grammar and order.', 'note': 'D2 — the rule draft 3 and every psalm after it were made by', 'from': 'claude'},
        {'label': 'The Latin first. Its strangeness stays; the ear adapts, as it did to the Latin.'},
        {'label': 'The ear first. Where a line shows the work of translation, fluency wins.'},
        {'label': 'Verse by verse, as chosen below — and I will say in the note what the rule behind my choices is.'},
    ],
}


def main():
    if (here / 'prayed.v2.json').exists():
        raise SystemExit('draft 3 was already made (prayed.v2.json exists)')
    old = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
    extra = json.loads((here / 'decisions.json').read_text(encoding='utf-8'))
    decisions = [governing]
    for decision in extra['decisions']:
        if decision['id'] == 'governing':
            continue
        index, why = rulings[decision['id']]
        options = [dict(o) for o in decision['options']]
        if index:
            # what was draft 2's text is no longer "the draft": say so, so that the draft preset and the labels stay true
            options[0]['from'] = 'draft2'
            options[0]['note'] = f"draft 2’s wording — {options[0].get('note', '')}".rstrip(' —')
            options[index]['note'] = f"draft 3 — {options[index].get('note', '')}".rstrip(' —')
        options.insert(0, options.pop(index))
        decisions.append({**decision, 'why': f"{decision.get('why', '')} {why}".strip(), 'options': options})
    prayed = {
        'psalm': 4, 'tier': 3, 'version': 3, 'address': 'vós', 'status': 'reviewed', 'hour': extra.get('hour'),
        'intro': [
            'Draft 3 is draft 2 ruled by DECISIONS.md D2 and D3: escutar for exaudíre in three places, and the two stylist fixes that touch only grammar (4:3 a verb supplied, 4:8 a subject named). The stylist’s other four proposals change a word, dissolve a repetition, close an ambiguity or say what the Hebrew says; they are refused and stay here as options.',
            'Switch the wording to the stylist’s, pray it, switch back: every ruling can be overturned from this page.',
        ],
        'verses': extra['verses'],
        'decisions': decisions,
        'choices': old.get('choices', {}),
        'audit': [
            {'step': 'draft', 'note': 'Drafts 1 and 2 were made through the full pilot pipeline (dossier, interlinear, literal tier, prayed tier, stylist, judges, back-translation); see retrospective.md. prayed.v1.json and prayed.v2.json are those drafts; decisions.v2.json holds draft 2’s options as review.html had them.'},
            {'step': 'latinist', 'file': 'critic/prayed-v2.latinist.astra.json', 'note': 'Draft 2: nothing to correct.'},
            {'step': 'stylist', 'file': 'critic/prayed-v1.stylist.astra.json', 'note': 'Read draft 1; eight of ten verses marked not yet native. Its six proposals are the options marked “stylist”.', 'outcomes': [
                {'verse': '4:3', 'remark': 'gravi corde verbless', 'outcome': 'taken', 'decision': 'gravi', 'reason': 'grammar only (D2)'},
                {'verse': '4:4', 'remark': 'fez maravilhoso', 'outcome': 'option', 'decision': 'mirificavit', 'reason': 'its fix is the Hebrew’s sense, not the Latin’s'},
                {'verse': '4:5', 'remark': 'compungi-vos', 'outcome': 'option', 'decision': 'compungimini', 'reason': 'another word, and the image goes'},
                {'verse': '4:6', 'remark': 'Sacrificai sacrifício', 'outcome': 'option', 'decision': 'sacrificate', 'reason': 'the repetition is the Latin’s'},
                {'verse': '4:8', 'remark': 'multiplicaram without a subject', 'outcome': 'taken', 'decision': 'multiplicati', 'reason': 'grammar only, and it prevents a wrong parse'},
                {'verse': '4:10', 'remark': 'a sós na esperança', 'outcome': 'option', 'decision': 'singulariter', 'reason': 'its fix closes an ambiguity the Latin leaves open'},
            ]},
            {'step': 'revision', 'version': 3, 'note': 'v3, by the main session under Gustavo’s delegation of 2026-09-20 (DECISIONS.md D8): 4:2a, 4:2b, 4:4 atender → escutar (D3); 4:3 “até quando tereis o coração pesado?”; 4:8 “eles se multiplicaram”. No critic has read draft 3: the three changes are a glossary verb already gated in Pss 90 and 53, and two fixes the stylist itself proposed. The Hetzenauer page (p. 487) was read for this psalm during the collation.'},
        ],
    }
    shutil.copy(here / 'prayed.json', here / 'prayed.v2.json')
    (here / 'decisions.json').rename(here / 'decisions.v2.json')
    (here / 'prayed.json').write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps004: draft 3 written; draft 2 kept as prayed.v2.json + decisions.v2.json')


main()
