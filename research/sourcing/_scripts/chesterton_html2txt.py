#!/usr/bin/env python3 -I
"""html2txt.py in.html out.txt  -- PGA/RGL page: h2/h3 headings and <p> paragraphs to blank-line text.
Paragraphs containing <br> keep their line breaks, indented 8 spaces (verse/letters). _italics_ for <i>/<em>."""
import re, html, sys
s = open(sys.argv[1], encoding="latin-1").read()
a = s.index("INTRODUCTORY NOTE") if "INTRODUCTORY NOTE" in s else 0
a = s.rfind("<h2", 0, a)
b = s.index("<h2>THE END</h2>")
s = s[a:b]
out = []
for m in re.finditer(r"<h([23])[^>]*>(.*?)</h\1>|<p[^>]*>(.*?)</p>", s, re.S):
    if m.group(2) is not None:
        t = re.sub(r"<br\s*/?>", " ", m.group(2))
        kind = "h"
    else:
        t = m.group(3); kind = "p"
    t = re.sub(r"<(i|em)>(.*?)</\1>", r"_\2_", t, flags=re.S | re.I)
    has_br = bool(re.search(r"<br", t, re.I))
    if has_br and kind == "p":
        parts = re.split(r"<br\s*/?>", t)
        parts = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", x))).strip() for x in parts]
        out.append("\n".join("        " + x for x in parts if x))
        continue
    t = re.sub(r"<[^>]+>", "", t)
    out.append(re.sub(r"\s+", " ", html.unescape(t)).strip())
open(sys.argv[2], "w", encoding="utf-8").write("\n\n".join(out) + "\n")
