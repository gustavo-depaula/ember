"""Extract the psalm text from the fetched pages (kept in consult/) into plain text files."""
import html
import re
import subprocess

base = 'research/psalterium/consult/'
raw = open(base + 'ps109-cnbb-remicon.html', encoding='utf-8', errors='replace').read()
m = re.search(r"post-body.*?>(.*?)<div class='post-footer", raw, re.S)
body = m.group(1) if m else raw
body = re.sub(r'<br\s*/?>', '\n', body)
body = re.sub(r'<[^>]+>', '', body)
body = html.unescape(body)
body = re.sub(r'\n\s*\n+', '\n', body).strip()
open(base + 'ps109-cnbb-remicon.txt', 'w', encoding='utf-8').write(body)
print(body[:3000])
print('=====PDF')
try:
    out = subprocess.run(['pdftotext', '-layout', base + 'ps109-lh-arqbh.pdf', '-'], capture_output=True, text=True).stdout
    open(base + 'ps109-lh-arqbh.txt', 'w', encoding='utf-8').write(out)
    print(out[:3000])
except Exception as e:
    print('pdftotext failed', e)
