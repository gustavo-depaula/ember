#!/usr/bin/env python3 -I
"""Gutenberg Australia / Roy Glashan HTML -> blank-line text for chesterton_auto.py.
usage: chesterton_pga.py in.html out.txt [start-marker-regex]
Headings (h1-h3) become '@@ text' blocks preceded by 3 blank lines. Paragraphs with <br> keep line breaks, indented 8 spaces
(verse, letters). <i>/<em> become _italic_. Writes a '*** START' line first and '*** END' last."""
import re, html, sys
raw = open(sys.argv[1], "rb").read()
try: s = raw.decode("utf-8")
except UnicodeDecodeError: s = raw.decode("cp1252", "replace")
if len(sys.argv) > 3:
    m = re.search(sys.argv[3], s)
    if m: s = s[m.start():]
out = ["*** START"]
for m in re.finditer(r"<h([123])[^>]*>(.*?)</h\1>|<(p|blockquote|div)[^>]*>(.*?)</\3>", s, re.S | re.I):
    if m.group(2) is not None:
        t = re.sub(r"<br\s*/?>", " ", m.group(2)); kind = "h"
    else:
        t = m.group(4); kind = "p"
        if re.search(r"<(p|div|blockquote|h\d)\b", t, re.I): continue
    t = re.sub(r"<(i|em)\b[^>]*>(.*?)</\1>", r"_\2_", t, flags=re.S | re.I)
    if kind == "p" and re.search(r"<br", t, re.I):
        parts = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", x))).strip() for x in re.split(r"<br\s*/?>", t, flags=re.I)]
        parts = [x for x in parts if x]
        if parts: out.append("\n".join("        " + x for x in parts))
        continue
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"\s+", " ", html.unescape(t)).strip()
    if not t: continue
    out.append(("\n\n\n@@ " + t) if kind == "h" else t)
out.append("*** END")
open(sys.argv[2], "w", encoding="utf-8").write("\n\n".join(out) + "\n")
