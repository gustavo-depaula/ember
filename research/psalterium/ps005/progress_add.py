"""Append one row (the content of a text file) to PROGRESS.md: python3.13 progress_add.py <row.txt>"""
import sys
from pathlib import Path

progress = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = Path(sys.argv[1]).read_text(encoding='utf-8').strip()
text = progress.read_text(encoding='utf-8')
if row in text:
    print('already there')
else:
    progress.write_text(text.rstrip('\n') + '\n' + row + '\n', encoding='utf-8')
    print('appended')
