"""List the first cell of glossary rows containing each word (to find exact row prefixes).
python3.13 research/psalterium/ps225/rowfind.py word ..."""
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').split('\n')
for w in sys.argv[1:]:
    hits = [l.split('|')[1].strip() for l in lines if l.startswith('| ') and w.lower() in l.split('|')[1].lower()]
    print(w, '->', hits[:4])
