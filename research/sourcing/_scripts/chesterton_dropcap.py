#!/usr/bin/env python3 -I
"""Fix OCR drop caps ('W HEN' -> 'When') at the start of chapter files. usage: chesterton_dropcap.py dir"""
import re, sys
from pathlib import Path
for p in sorted(Path(sys.argv[1]).glob("*.md")):
    t = p.read_text(encoding="utf-8")
    t2 = re.sub(r"(\A# [^\n]*\n\n)([A-Z]) ([A-Z]{2,})\b", lambda m: m.group(1) + m.group(2) + m.group(3).lower(), t, count=1)
    if t2 != t: p.write_text(t2, encoding="utf-8")
