"""glossary_part4.json: the Ps 7 agent has meanwhile added a row for redímere (same verb proposed), so my new row
becomes evidence appended to that row.   python3.13 research/psalterium/ps118/glossary_part4_fix.py"""

import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'glossary_part4.json'
data = json.loads(path.read_text(encoding='utf-8'))
data['terms'] = [row for row in data['terms'] if not row.startswith('| redímere |')]
if not any(item['row'] == '| redímere |' for item in data['append']):
    data['append'].append({
        'row': '| redímere |',
        'text': '**Ps 118:134, 154 reached the same verb independently: *Resgatai-me das calúnias dos homens*; *Julgai em juízo a minha causa, e resgatai-me*** — for the reason this row gives (*Redimi-me* / *Remi-me* are also "I redeemed myself"; rule 3). The Diurnal has the verb at 118:134. Passed the Latinist four times, the stylist and the blind reader twice each, with no remark. In 118:154 it rhymes with *vivificai-me* at the cadence — the Latin\'s own echo (*rédime me … vivífica me*), accepted.',
    })
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(data['append']), 'appends,', len(data['terms']), 'terms,', len(data['formulas']), 'formulas')
