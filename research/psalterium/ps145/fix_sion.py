"""v1 pre-reader fix: 145:10 mediant/final rhyme Sião / geração -> vocative before the apposition."""
import json
from pathlib import Path
p = Path('research/psalterium/ps145/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
for dec in d['decisions']:
    if dec['id'] == 'sion':
        dec['why'] = ("The apposition *Deus tuus* after *Dóminus*, then the vocative. The finished psalms leave the vocative of the city bare "
                      "(121:2 *nos teus átrios, Jerusalém*; 136:5 *Se eu me esquecer de ti, Jerusalém*). In the Latin's order the mediant falls on "
                      "*Sião* and the final on *geração*: an accidental -ão / -ão rhyme at mediant and final (checks.py), which the Latin "
                      "(*Sion / generatiónem*) does not really have. The vocative is moved before the apposition (order, D2), so the mediant "
                      "falls on *Deus*; DM1962 also ends a colon on *o teu Deus*. *Pelos séculos* for *in sǽcula* alone (row, settled D43, which "
                      "names 145:10); *de geração em geração* (formula row, which names 145:10).")
        dec['options'] = [
            {"label": "Sião, o teu Deus", "forms": {"sion": "Sião, o teu Deus"}, "note": "Ruling: the rhyme avoided by order alone.", "from": "checks"},
            {"label": "o teu Deus, Sião", "forms": {"sion": "o teu Deus, Sião"}, "note": "The Latin's order; rhymes Sião / geração at mediant and final.", "from": "draft"},
            {"label": "o teu Deus, ó Sião", "forms": {"sion": "o teu Deus, ó Sião"}, "note": "MS1932 'ó Sião'; the same rhyme.", "from": "MS1932"},
        ]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
