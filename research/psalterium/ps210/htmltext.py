"""Strip an HTML file to text lines matching a regex (default: bendiz|louv|exalt).
python3.13 research/psalterium/ps210/htmltext.py <file> [regex]"""
import html
import re
import sys
from pathlib import Path

raw = Path(sys.argv[1]).read_text(encoding='utf-8', errors='replace')
raw = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', raw)
text = html.unescape(re.sub(r'(?i)<br\s*/?>|</p>|</div>|</li>|</h\d>', '\n', raw))
text = re.sub(r'<[^>]+>', ' ', text)
pat = re.compile(sys.argv[2] if len(sys.argv) > 2 else r'(?i)bendiz|louv|exalt', re.I)
for line in text.splitlines():
    line = re.sub(r'\s+', ' ', line).strip()
    if line and pat.search(line):
        print(line)
