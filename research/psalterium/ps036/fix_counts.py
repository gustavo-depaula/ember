"""Correct two counts in the Ps 36 draft note after the grep_latin.py accent fix (recount.py): malignári as a finite verb also at 73:3 and 82:4;
relíquiæ also at 20:13. Edits build_v1.py and every saved prayed*.json in place. python3.13 research/psalterium/ps036/fix_counts.py"""
from pathlib import Path

here = Path(__file__).resolve().parent
swaps = [
    ('malignári 36:8–9, 104:15;', 'malignári (finite or infinitive) 36:8–9, 73:3 malignátus est, 82:4 malignavérunt consílium, 104:15 (recounted after the grep_latin.py accent fix);'),
    ('relíquiæ 16:14c, 75:11, 36:37–38;', 'relíquiæ 16:14c, 20:13, 75:11, 36:37–38 (recounted);'),
]
for path in [here / 'build_v1.py', *sorted(here.glob('prayed*.json'))]:
    text = path.read_text(encoding='utf-8')
    new = text
    for old, repl in swaps:
        new = new.replace(old, repl)
    if new != text:
        path.write_text(new, encoding='utf-8')
        print('fixed', path.name)
