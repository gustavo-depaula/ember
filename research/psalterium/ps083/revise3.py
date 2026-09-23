"""Ps 83: record the v2 Latinist gate. One minor taken (83:11 *um dia*, a wording change of one word, no new draft
number: the gate read v2 and the fix removes a word only), one held (83:11b)."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text())
dec = {x['id']: x for x in d['decisions']}

di = dec['diesuna']
di['why'] += (" v2 gate: the Latinist (minor) said *só* adds a restrictive 'only' that *dies una* does not carry — the contrast "
              "with *míllia* does that work. Taken: with *é melhor … do que milhares* now joined across the mark, *um dia* is "
              "heard as one day against thousands, not as 'some day'.")
di['options'] = [
    {"label": "um dia", "forms": {"diesuna": "um dia"}, "note": "Ruling (after the v2 gate).", "from": "latinist"},
    {"label": "um só dia", "forms": {"diesuna": "um só dia"}, "note": "Draft 1–2; MS1932.", "from": "MS1932"},
]
ab = dec['abjectus']
ab['why'] += (" v2 gate: the Latinist again (minor) wants abasement, now *rebaixado* (already option 4). Held: "
              "*rebaixado* is heard first as demoted in rank; the Greek's παραρριπτεῖσθαι is 'to be cast aside', which "
              "*posto de lado* says, and the verse's contrast is of place (a cast-aside place in God's house against dwelling "
              "in sinners' tents). For Gustavo's ear: two Latinist runs asked for more lowliness.")
for o in ab['options']:
    if o['label'] == 'rebaixado':
        o['note'] += ' The v2 Latinist\'s fix.'
        o['from'] = 'latinist'

d['audit'].append({
    "step": "latinist", "file": "critic/v2.latinist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "Gate: no major. Two minors: 83:11 *só* taken; 83:11b *rebaixado* held (option).",
    "outcomes": [
        {"verse": "83:11", "remark": "*só* adds 'only' to dies una", "outcome": "taken"},
        {"verse": "83:11b", "remark": "*posto de lado* is neglect, not abasement → *rebaixado*", "outcome": "option",
         "decision": "abjectus", "reason": "*rebaixado* is heard as demoted; the Greek is 'cast aside', which the ruling says."},
    ],
})
d['audit'].append({"step": "revision", "version": 2,
                   "note": "After the v2 gate: 83:11 *um só dia* → *um dia* (one word removed; not re-read)."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
