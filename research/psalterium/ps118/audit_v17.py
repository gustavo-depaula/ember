"""Record the stylist's reading of draft 17 (118:145–162) in the audit. Run once.

    python3.13 research/psalterium/ps118/audit_v17.py
"""

import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
prayed = json.loads(path.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v17.stylist.part5.json' for a in prayed['audit']):
    raise SystemExit('already recorded')
prayed['audit'].append({
    'step': 'stylist', 'version': 17, 'file': 'critic/v17.stylist.part5.json',
    'note': 'The blind stylist on 118:145–162 after D26, run by the main session to see whether the clause holds for the plural. It does: no remark on 118:148, 158 or 162, where “os vossos ditos” had been refused on both of his earlier readings. Two remarks on other matters; worst 118:152, best 118:153.',
    'outcomes': [
        {'verse': '118:152', 'remark': 'At the pause “soube dos vossos testemunhos” is heard as complete; wants “soube isto dos vossos testemunhos”.', 'outcome': 'refused', 'reason': 'It supplies a word the Latin does not have, in a verse already rebuilt three times and passed by the Latinist; the colon after the mediant is how every verse of the psalm continues.'},
        {'verse': '118:157', 'remark': '“me atribulam” is bookish; wants “me afligem”.', 'outcome': 'refused', 'reason': 'tribuláre → atribular is the glossary’s verb since Ps 3:2, with tribulátio → tribulação in the same stanza (118:143); “afligir” is afflígere’s.'},
    ],
})
path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ps118: stylist v17 recorded')
