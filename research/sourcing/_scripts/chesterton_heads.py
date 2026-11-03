#!/usr/bin/env python3 -I
"""List candidate headings in a Gutenberg text: short unindented blocks preceded by >=2 blank lines.
usage: chesterton_heads.py file.txt"""
import re, sys
L = open(sys.argv[1], encoding="utf-8-sig").read().splitlines()
s = next((i for i, l in enumerate(L) if l.startswith("*** START")), 0)
e = next((i for i, l in enumerate(L) if l.startswith("*** END")), len(L))
i = s + 1; blank = 0
while i < e:
    if not L[i].strip(): blank += 1; i += 1; continue
    if blank >= 2:
        j = i
        while j < e and L[j].strip(): j += 1
        blk = L[i:j]
        if len(blk) <= 3 and all(len(x) < 90 and not x.startswith("  ") for x in blk):
            print(i + 1, "|", " / ".join(x.strip() for x in blk))
        i = j; blank = 0; continue
    blank = 0; i += 1
