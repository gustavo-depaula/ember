"""One-off: copy ps017/partial.py and ps017/part.py into ps036 with the psalm number changed (ps017 untouched)."""
from pathlib import Path

here = Path(__file__).resolve().parent
src = here.parent / 'ps017'
partial = (src / 'partial.py').read_text(encoding='utf-8')
partial = partial.replace("Ps 17 while it is PARTIAL — copied from ps009/partial.py (itself from ps118/partial.py; both left untouched) and adapted.",
                          "Ps 36 while it is PARTIAL — copied from ps017/partial.py (left untouched) with the psalm number changed.")
partial = partial.replace('ps017', 'ps036').replace("psalm = '17'", "psalm = '36'").replace('all 54 Latin verses', 'all 42 Latin verses').replace('from 17:2', 'from 36:1')
(here / 'partial.py').write_text(partial, encoding='utf-8')
part = (src / 'part.py').read_text(encoding='utf-8')
part = part.replace('Ps 17', 'Ps 36').replace('Copied from ps009/part.py (itself from ps118/part3.py; both left untouched)', 'Copied from ps017/part.py (left untouched)')
part = part.replace('ps017', 'ps036').replace('Psalm17.txt', 'Psalm36.txt').replace('26 51 part2      (17:26–17:51', '21 40 part2      (36:21–36:40')
(here / 'part.py').write_text(part, encoding='utf-8')
print('ok')
