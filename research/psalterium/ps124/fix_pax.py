"""Correct the pax claim: 127:6 has the accusative 'pacem super Israël', not the same words. Idempotent."""
import json
from pathlib import Path

here = Path(__file__).parent
g = here.parent / 'glossary.md'
old = "| *pax super Israël* (124:5, 127:6 — grep) | *paz sobre Israel* (verbless, as the Latin) | open — Ps 124; MS1932's *a paz seja sobre Israel* the option; 127:6 should copy |"
new = "| *pax super Israël* (124:5 only; 127:6 has the accusative *pacem super Israël*, governed by *vídeas* — grep) | *paz sobre Israel* (verbless, as the Latin) | open — Ps 124; MS1932's *a paz seja sobre Israel* the option; 127:6 keeps *a paz sobre Israel* as the object of *vejas* |"
text = g.read_text(encoding='utf-8')
if old in text:
    g.write_text(text.replace(old, new), encoding='utf-8')
    print('glossary fixed')

p = here / 'prayed.json'
d = json.loads(p.read_text())
x = next(x for x in d['decisions'] if x['id'] == 'pax')
x['why'] = x['why'].replace("which closes this psalm and 127:6 identically (DO Latin)", "closing the psalm (127:6 has the accusative 'pacem super Israël', the object of 'vídeas', so it is not the same formula — grep)").replace(" Proposed as a glossary formula so that 127:6 matches.", " Proposed as a glossary formula.")
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('prayed', 'identically' not in x['why'])
