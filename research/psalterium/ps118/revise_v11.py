"""Draft 11 of Ps 118: one verse, for the glossary's coherence. While this portion was with its readers the
Pss 5–6 agent proposed pérdere → fazer perecer (glossary row, held open by D22) — the very rendering draft 7
had at 118:95 and draft 8 gave up to the stylist. Draft 10 is kept as prayed.v10.json. 118:1–80 untouched.

Run once from the repo root, on a prayed.json that is still version 10:
  python3.13 research/psalterium/ps118/revise_v11.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 10:
    sys.exit(f"prayed.json is version {data['version']}, expected 10 — not touching it")
if not (here / 'prayed.v10.json').exists():
    sys.exit('prayed.v10.json is missing — copy prayed.json to it first')
byId = {d['id']: d for d in data['decisions']}

options = byId['perderent']['options']
chosen = next(o for o in options if o['label'] == 'para me fazer perecer')
options.remove(chosen)
options.insert(0, chosen)
chosen['note'] = 'Draft 11 (= draft 7). Keeps pérdere beside períre → perecer, as Latin and Greek do (118:92 periíssem, three verses earlier), and cannot be misheard. Restored after draft 8 had given it up: the Pss 5–6 agent, working at the same time and without sight of this psalm, proposed the same rendering for the same reason at 5:7a (glossary row pérdere, held open by D22: seven more places, "tried in each"; "perdereis" is heard as "you will lose", "destruí" falls to rule 3). Two psalms arriving at one word is worth more than one stylist remark about weight; the Latinist passed it on draft 7. Cost: the stylist found it "ceremonious and heavy", and the colon is +4 syllables.'
next(o for o in options if o['label'] == 'para me destruir')['note'] = 'Drafts 8–10, from the stylist (Douay-Rheims "to destroy me"); passed by him on his second reading and by the Latinist twice. Plain and short. Given up in draft 11 only so that pérdere has one word in the psalter (glossary row pérdere → fazer perecer); if that row is ruled the other way, this is the form to return to — as an infinitive it is safe from rule 3.'

data['choices']['118:95'] = data['choices']['118:95'].replace(' Draft 8: pérdere → "destruir" (decision "perderent").', ' pérdere → "fazer perecer" (decision "perderent"): draft 7\'s word, "destruir" in drafts 8–10 at the stylist\'s wish, restored in draft 11 to agree with the glossary row opened by Ps 5:7a.')

data['audit'].append({'step': 'revision', 'version': 11, 'note': 'Draft 11 = draft 10 with 118:95 "para me fazer perecer" restored (draft 7\'s wording, passed by the Latinist then; the stylist\'s "para me destruir" becomes the option), so that pérdere reads as in Ps 5:7a — the glossary row pérdere → fazer perecer appeared while this portion was being revised and is held open by D22. No critic re-run: nothing else changed. The gate state is therefore that of draft 10: two majors held on purpose (118:92, 118:114), three minors refused with options.'})
for s in data['audit']:
    if s['step'] == 'handoff':
        for old, new in [('copy prayed.json to prayed.v10.json first', 'copy prayed.json to prayed.v11.json first'),
                         ('pérdere → destruir;', 'pérdere → fazer perecer (as Ps 5:7a);'),
                         ('(make a v10 twin)', '(make a v11 twin)')]:
            if s['note'].count(old) != 1:
                sys.exit(f'handoff: {old!r} not found once')
            s['note'] = s['note'].replace(old, new)
data['version'] = 11
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 11 written')
