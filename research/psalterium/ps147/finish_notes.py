"""Neighbour notes (Pss 145-146 finished in parallel) on two decisions; no wording change."""
import json
from pathlib import Path
p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
for dec in d['decisions']:
    if dec['id'] == 'v1open' and 'Ps 145:10' not in dec['why']:
        dec['why'] += " Neighbour, seen at the finish: Ps 145:10 took the stylist's 'o teu Deus, ó Sião' (so that Sião is not heard as in apposition to God). No reader of 147:1 raised it; 'Sião' is left bare here as the Latin, and whoever wants the two alike adds 'ó' in the second colon — a particle, not re-read by a gate."
    if dec['id'] == 'qui' and 'Ps 146' not in dec['why']:
        dec['why'] += " Neighbours, seen at the finish: Ps 145:7a has 'Ele guarda' (the same choice, against a Latinist minor asking 'Que guarda'); Ps 146 (drafted in parallel) keeps the bare relative 'Que cura … Que conta … Que dá'. 146:9 'Qui dat' and 147:5 'Qui dat' therefore differ: for the main session to align (one touch here: option 3)."
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
