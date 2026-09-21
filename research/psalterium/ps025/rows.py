"""Print glossary rows by line number (full or cut): python3.13 rows.py <max-chars> <n> [<n> ...]"""
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()
cut = int(sys.argv[1])
for n in sys.argv[2:]:
    line = lines[int(n) - 1]
    print(f'{n}: {line[:cut]}{" …" if len(line) > cut else ""}\n')
