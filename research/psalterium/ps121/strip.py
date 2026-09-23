"""Strip an HTML page to text lines containing any of the given words. Usage: strip.py file.html word..."""
import html
import re
import sys

raw = open(sys.argv[1], encoding='utf-8', errors='replace').read()
raw = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', '', raw)
txt = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</li>', '\n', raw)
txt = html.unescape(re.sub(r'<[^>]+>', '', txt))
lines = [l.strip() for l in txt.splitlines() if l.strip()]
words = [w.lower() for w in sys.argv[2:]]
start = None
for i, l in enumerate(lines):
    if any(w in l.lower() for w in words):
        start = i
        break
if start is not None:
    print('\n'.join(lines[max(0, start - 3):start + 45]))
