"""Ps 120 draft 2: take the stylist's 120:3 opening; record reader outcomes."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2

for x in d['decisions']:
    if x['id'] == 'nondet':
        que, bare, ms = x['options']
        new = {
            'label': 'Que não deixe',
            'forms': {'nondet': 'Que não deixe vacilar'},
            'note': ("Draft 2, from the stylist. 'Que' alone marks the third-person wish, so 'deixe' is no longer heard as a command to "
                     "the listener, and no subject is supplied — the Latin names none; the next colon's 'aquele que te guarda' is heard "
                     "as the one who acts. It also removes the hiatus 'Que‿ele'."),
            'from': 'stylist',
        }
        que['note'] = ("Draft 1. The hidden subject named (rule 2 allows it). The stylist heard 'ele' as written grammar and the "
                       "hiatus 'Que‿ele' as a stumble; the ambiguity reader heard 'ele' as the Lord, possibly another protector.")
        x['options'] = [new, que, bare, ms]
        x['why'] = x['why'].replace(
            "The subject hidden in the ending may be named (rule 2); 'ele' names no one the Latin does not point to (the Lord of 120:2, the keeper of the second colon).",
            "A 'que' of wish before the verb is enough to make the jussive audible; naming the subject ('ele', draft 1) is allowed by rule 2 but not needed.")
    if x['id'] == 'dormitare':
        x['options'][0]['note'] += (" The v1 ambiguity reader listed both 'dormite' and 'dormitará' as unknown — the third and fourth "
                                    "blind readers to do so (after 118:28, 75:7) — and heard 'não dormitará nem dormirá' as a mere "
                                    "repetition; the stylist heard 'dormite' as 'dormi-te' for a moment but asked to keep it. Kept for "
                                    "the glossary row; the case for 'cochilar' is put to the main session (glossary.md, open).")

d['decisions'].append({
    'id': 'tuaprotecao', 'refs': ['120:5'], 'latin': 'Dóminus protéctio tua', 'kind': 'word',
    'why': ("The stylist found the first colon of 120:5 the heaviest of the psalm (17 syllables by checks.py, against the Latin's 16) and "
            "asked to drop the article before the possessive. The style rules keep the article before possessives (rule 5)."),
    'options': [
        {'label': 'é a tua proteção', 'forms': {'tuaprotecao': 'é a tua proteção'},
         'note': "Draft, kept: the article is the house rule (rule 5), and 'é‿a' elides in the mouth, so the colon is no longer than the Latin's.",
         'from': 'draft'},
        {'label': 'é tua proteção', 'forms': {'tuaprotecao': 'é tua proteção'},
         'note': "Stylist: one article less, lighter in choir. Refused for rule 5; kept here to be chosen.", 'from': 'stylist'},
    ],
})
d['verses']['120:5'] = "O Senhor te guarda, o Senhor {tuaprotecao}, * {super} a tua mão direita."

d['choices']['120:3'] += (" Draft 2 opens 'Que não deixe vacilar' (stylist). The ambiguity reader heard the wish ('may he not doze') as a "
                          "faint doubt that the keeper stays awake; that is the Latin's own jussive ('neque dormítet'), answered by "
                          "120:4 'Eis que não dormitará'; kept. 'vacilar' carries a faint colloquial 'blunder' for him; it is the "
                          "fluctuátio row's word (54:23, 65:9), kept.")
d['choices']['120:1'] += (" The ambiguity reader heard the relative reading first (help from the mountains), with 120:2 then seeming to "
                          "answer it — the Latin's own openness as printed; kept (decision unde).")
d['choices']['120:8'] += (" 'a tua entrada e a tua saída' was heard as comings and goings, somewhat literal — the Latin's concrete pair; kept.")

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': "Draft 1, claude-opus-5-5 in fresh context (with latin.json), run by the coordinator. No remarks: tenses, the custódit/custódiat contrast, the jussive of 120:3, the supplied 'vem', 'é', 'ele', and the marks all confirmed.",
     'outcomes': []},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': "Draft 1, claude-opus-5-5 in fresh context (with latin.json). Two verses; worst 120:3, best 120:6. One taken (120:3 'Que não deixe'), one refused and kept as an option (120:5 article), one a 'keep' (dormite).",
     'outcomes': [
         {'verse': '120:3', 'remark': "'Que ele' is a hiatus and written grammar; the Latin names no subject → 'Que não deixe vacilar'", 'outcome': 'taken', 'decision': 'nondet'},
         {'verse': '120:3', 'remark': "'dormite' can sound like 'dormi-te' for a moment; keep it", 'outcome': 'refused', 'decision': 'dormitare', 'reason': "Nothing to change: the stylist himself asks to keep it; noted in the dormitare decision."},
         {'verse': '120:5', 'remark': "first colon crowded; drop the article: 'é tua proteção'", 'outcome': 'option', 'decision': 'tuaprotecao', 'reason': "Rule 5 keeps the article before possessives; 'é‿a' elides, so the colon is within a syllable of the Latin."},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "Draft 1, Portuguese only, claude-opus-5-5 in fresh context. Ten items; unknown words 'dormite', 'dormitará'. One led to a change indirectly (120:3 'ele', removed by the stylist's fix); the rest are the Latin's own openness or accepted costs.",
     'outcomes': [
         {'verse': '120:1', 'remark': "relative vs question; relative heard first, seeming to clash with v. 2", 'outcome': 'refused', 'decision': 'unde', 'reason': "The Latin as printed is a relative (DO, DRB, MS1932); the question is the Hebrew's. Kept open as the Latin is."},
         {'verse': '120:3', 'remark': "'ele' = the Lord or another protector", 'outcome': 'taken', 'decision': 'nondet', 'reason': "'ele' removed in draft 2 (the stylist's fix)."},
         {'verse': '120:3', 'remark': "wish heard as doubt that the keeper stays awake", 'outcome': 'refused', 'reason': "The Latin's jussive ('neque dormítet'), answered by 120:4; a statement would change the mood."},
         {'verse': '120:3', 'remark': "'vacilar' with a faint colloquial 'blunder'", 'outcome': 'refused', 'reason': "The fluctuátio row's word (54:23, 65:9, the same Greek σάλος); slipping heard first."},
         {'verse': '120:3', 'remark': "'dormite' unknown / heard as a form of 'dormir'", 'outcome': 'option', 'decision': 'dormitare', 'reason': "Glossary row kept; 'cochilar' proposed to the main session."},
         {'verse': '120:4', 'remark': "'dormitará nem dormirá' heard as a repetition", 'outcome': 'option', 'decision': 'dormitare', 'reason': "Same as above; 'cochilará nem dormirá' would make the two degrees audible."},
         {'verse': '120:5', 'remark': "'sobre a tua mão direita' unclear (over, beside, by the hand)", 'outcome': 'refused', 'decision': 'super', 'reason': "The Latin's 'super' and its concrete hand; 'à' is the option."},
         {'verse': '120:7', 'remark': "'guarde' heard as statement; guarda/guarde barely audible", 'outcome': 'refused', 'reason': "The Latin's own shift (custódit / custódiat) is as slight; the wish is the Latin's."},
         {'verse': '120:7', 'remark': "'alma' soul or life", 'outcome': 'refused', 'reason': "ánima → alma (glossary); both senses are the Latin's."},
         {'verse': '120:8', 'remark': "'entrada … saída' literal or figurative", 'outcome': 'refused', 'reason': "The Latin's concrete pair; comings and goings heard first."},
     ]},
    {'step': 'revision', 'version': 2,
     'note': "v2: 120:3 'Que ele não deixe vacilar' → 'Que não deixe vacilar' (stylist). New decision tuaprotecao (the stylist's refused proposal as an option). Draft 1 kept as prayed.v1.json (flat text prayed.v1.vos.json, which the v1 readers read)."},
]

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
