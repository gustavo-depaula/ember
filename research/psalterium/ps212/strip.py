"""Strip an HTML page in consult/ to text and print lines between two markers (Ps 212 circulation).
python3.13 research/psalterium/ps212/strip.py <file in consult> <start regex> [<stop regex>]"""
import html, re, sys
from pathlib import Path
consult = Path(__file__).resolve().parents[1] / 'consult'
raw = (consult / sys.argv[1]).read_text(encoding='utf-8', errors='replace')
raw = re.sub(r'(?is)<(script|style).*?</\1>', '', raw)
text = html.unescape(re.sub(r'<br\s*/?>|</p>|</div>|</h\d>', '\n', raw))
text = re.sub(r'<[^>]+>', '', text)
lines = [l.strip() for l in text.splitlines() if l.strip()]
on = False
start = re.compile(sys.argv[2]); stop = re.compile(sys.argv[3]) if len(sys.argv) > 3 else None
out = []
for l in lines:
    if not on and start.search(l): on = True
    elif on and stop and stop.search(l): break
    if on: out.append(l)
print('\n'.join(out))
(consult / (sys.argv[1].rsplit('.', 1)[0] + '.txt')).write_text('\n'.join(out) + '\n', encoding='utf-8')
