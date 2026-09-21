"""Merge the duplicate glossary rows for `in finem` and `movéri`, and set orbis terræ's rendering (D30). Run once.

    python3.13 research/psalterium/ps017/glossary_merge.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
lines = path.read_text(encoding='utf-8').splitlines()


def rows(name):
    return [i for i, line in enumerate(lines) if line.split(' | ')[0].lstrip('| ').strip() == name]


def merge(name, keep_first):
    found = rows(name)
    if len(found) != 2:
        raise SystemExit(f'{name}: expected two rows, found {len(found)}')
    keep, drop = (found[0], found[1]) if keep_first else (found[1], found[0])
    extra = lines[drop].split(' | ', 3)[3].rstrip(' |')
    lines[keep] = lines[keep].rstrip(' |') + f' **Merged from a duplicate row:** {extra} |'
    del lines[drop]


merge('in finem', keep_first=False)
first, second = rows('movéri (*motus fúero*, *movébor*)'), rows('movéri (*Non movébor*)')
if first and second:
    extra = lines[second[0]].split(' | ', 3)[3].rstrip(' |')
    lines[first[0]] = lines[first[0]].rstrip(' |') + f' **Merged from a duplicate row (*Non movébor*):** {extra} |'
    del lines[second[0]]
orbis = rows('orbis terræ')[0]
cells = lines[orbis].split(' | ')
cells[1] = 'o mundo (*julgará o mundo com equidade*); *o orbe da terra* the option'
lines[orbis] = ' | '.join(cells)
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('merged in finem, movéri; orbis terræ → o mundo')
