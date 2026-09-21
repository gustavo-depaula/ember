"""Print the visible text of a saved HTML page: python3.13 show_html.py <file> [<regex to start at>]"""
import html
import re
import sys
from pathlib import Path

raw = Path(sys.argv[1]).read_bytes()
try:
    text = raw.decode('utf-8')
except UnicodeDecodeError:
    text = raw.decode('latin-1')
text = re.sub(r'(?is)<(script|style).*?</\1>', ' ', text)
text = re.sub(r'(?i)<br\s*/?>|</p>|</tr>|</div>|</h\d>', '\n', text)
text = html.unescape(re.sub(r'<[^>]+>', ' ', text))
lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
lines = [line for line in lines if line]
if len(sys.argv) > 2:
    start = next((i for i, line in enumerate(lines) if re.search(sys.argv[2], line)), 0)
    lines = lines[start:]
print('\n'.join(lines[:120]))
