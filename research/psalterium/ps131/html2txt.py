"""Strip an HTML page to text (Ps 131 circulation check). python3.13 html2txt.py in.html out.md"""
import html
import re
import sys
from pathlib import Path

raw = Path(sys.argv[1]).read_text(encoding='utf-8', errors='replace')
raw = re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ', raw)
m = re.search(r'(?is)<article.*?</article>', raw)
body = m.group(0) if m else raw
body = re.sub(r'(?i)<br\s*/?>|</p>|</h\d>|</li>|</div>', '\n', body)
text = html.unescape(re.sub(r'<[^>]+>', '', body))
text = re.sub(r'[ \t]+', ' ', text)
text = re.sub(r'\n\s*\n+', '\n', text).strip()
Path(sys.argv[2]).write_text(text + '\n', encoding='utf-8')
print(text[:6000])
