"""Rerun every count Ps 36 cites, after the grep_latin.py accent fix. python3.13 research/psalterium/ps036/recount.py"""
import subprocess
import sys
from pathlib import Path

grep = Path(__file__).resolve().parents[1] / 'ps005' / 'grep_latin.py'
patterns = ['æmul', 'zel', 'extermin', 'malign', 'heredit', 'aresc', 'arésc', 'relíqui', 'fænum', 'fæn', 'prospic', 'trucid', 'evagin',
            'strid', 'collid', 'mutu', 'superexalt', 'disper', 'interi', 'mortific', 'petitión', 'revél', 'revel', 'supplant',
            'miserétur et cómmodat', 'cómmod', 'commod', 'deíci', 'honorific', 'pusíll', 'olera', 'ólera', 'pascéris', 'pasc', 'cedr', 'pacific',
            'delectáre in', 'delectábor', 'subdit', 'súbdit', 'confírm', 'multitúdine pacis', 'abundántia pacis', 'apud', 'invént',
            'quemádmodum fumus', 'sicut fumus', 'Declína a malo', 'Divérte a malo', 'bonitátem', 'irrid', 'desin', 'désin', 'Mansuét', 'sénui']
for p in patterns:
    out = subprocess.run([sys.executable, str(grep), p], capture_output=True, text=True).stdout
    lines = [l for l in out.splitlines() if l.startswith('Psalm')]
    refs = [l.split(' ')[1] for l in lines]
    print(f'{p!r}: {len(lines)} — {", ".join(refs)}')
