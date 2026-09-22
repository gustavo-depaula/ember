import json
from pathlib import Path
here = Path(__file__).parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json",
     "note": "Gate on draft 2: claude-opus-5-5, fresh context, with latin.json. Clean of majors; the same three minors as v1, all held for glossary rows (options recorded). He passed the draft-2 changes (69:3–4 commas, 69:4b *logo*, 69:5 order) without remark.",
     "outcomes": [
      {"verse": "69:3", "remark": "revereántur → confundidos (Sejam confundidos e envergonhados)", "outcome": "refused", "reason": "The reveréri row: three words of shame kept apart; *confundidos* is the word D15 removed from confúndi. = 34:4."},
      {"verse": "69:4b", "remark": "Que bom flat; now Muito bem, muito bem", "outcome": "option", "decision": "euge", "reason": "Rule 6 (= 39:16); the row is proposed for *Bem feito* in all four places; his *Muito bem* added as an option."},
      {"verse": "69:6b", "remark": "adjútor → auxiliador", "outcome": "option", "decision": "adjutor", "reason": "The adjútor row, open for Gustavo; held as at 39:18b."}]})
    for x in d['decisions']:
        if x['id'] == 'euge':
            x['options'].append({"label": "Muito bem, muito bem", "forms": {"euge": "Muito bem, muito bem"}, "note": "Latinist v2 ('Bravo!').", "from": "latinist"})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
