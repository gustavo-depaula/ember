"""Strip an HTML file to text and print the window around a marker. Usage: htmltext.py FILE MARKER [CHARS]"""
import html
import re
import sys

t = open(sys.argv[1], encoding='utf-8', errors='replace').read()
t = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', t, flags=re.S)
t = re.sub(r'<br\s*/?>', '\n', t)
t = re.sub(r'</(p|div|li|h\d)>', '\n', t)
t = re.sub(r'<[^>]+>', '', t)
t = html.unescape(t)
t = re.sub(r'[ \t]+', ' ', t)
t = re.sub(r'\n\s*\n+', '\n', t)
i = t.find(sys.argv[2])
n = int(sys.argv[3]) if len(sys.argv) > 3 else 4000
print(t[max(0, i - 300): i + n] if i >= 0 else 'MARKER NOT FOUND')
