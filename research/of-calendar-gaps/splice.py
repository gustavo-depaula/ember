"""Splice the date's other saints (the baseline's `alternatives[]`) from a `missal build` run into content/of.

`missal build` can't run against the live baseline here, so the importer is
run on the ember-extra snapshot at 8a9789412 (consult/baseline) into
consult/out, and only the new celebrations are copied over: their formulary
files, their calendar entries, their index lines. Without --write it reports.

    python3.13 research/of-calendar-gaps/splice.py [--write]
"""
import json
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
out = root / 'research/of-calendar-gaps/consult/out'
of = root / 'content/of'
write = '--write' in sys.argv

ours = {json.loads(f.read_text())['id']: f for f in (of / 'formularies').rglob('*.json')}
built = {json.loads(f.read_text())['id']: f for f in (out / 'formularies').rglob('*.json')}
# The snapshot predates later temporal fixes upstream; only saints are spliced.
new = sorted(i for i in built if i not in ours and i.startswith('sanctorale.'))
gone = sorted(i for i in ours if i not in built and i.startswith('sanctorale.'))
print(f'new: {len(new)}  only in ours: {len(gone)}')
for i in new:
    print('  +', i, built[i].relative_to(out))
for i in gone:
    print('  -', i)

cal_built = json.loads((out / 'calendar/sanctoral.json').read_text())
cal_ours = json.loads((of / 'calendar/sanctoral.json').read_text())
have = {e['formularyRef'] for e in cal_ours}
add = [e for e in cal_built if e['formularyRef'] in new]
assert {e['formularyRef'] for e in add} == set(new), 'a new formulary has no calendar entry'
for e in add:
    print('  cal', e['formularyRef'], e['scope'], e['rank'], e['dateRule'])

if write:
    for i in new:
        dst = of / built[i].relative_to(out)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(built[i], dst)
    # Each new saint goes right after the last entry of its date.
    merged = list(cal_ours)
    for e in add:
        d = e['dateRule']
        same = [n for n, x in enumerate(merged) if x['dateRule'] == d]
        merged.insert(same[-1] + 1, e)
    (of / 'calendar/sanctoral.json').write_text(json.dumps(merged, ensure_ascii=False, indent=2) + '\n')

    index = json.loads((of / 'index.json').read_text())
    ids = index['formularies']
    for i in new:
        date = '.'.join(i.split('.')[:2])
        same = [n for n, x in enumerate(ids) if x == date or x.startswith(date + '.')]
        ids.insert(same[-1] + 1, i)
    index['counts']['formularies'] += len(new)
    index['counts']['sanctoral'] += len(new)
    (of / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')

    # The calendar stub carries the regional rank the baseline gave Hildegard.
    stub = root / 'content/of-data/calendar/sanctorale/09-17/hildegard.json'
    s = stub.read_text()
    assert s.count('"rank": "feast"') == 1
    stub.write_text(s.replace('"rank": "feast"', '"rank": "optional-memorial"'))
