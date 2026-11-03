#!/usr/bin/env python3 -I
"""List one-off short capitalised lines in an IA OCR text (candidate headings). usage: file [min_line]"""
import re, sys, collections
L = open(sys.argv[1], encoding="utf8", errors="ignore").read().splitlines()
m0 = int(sys.argv[2]) if len(sys.argv) > 2 else 0
norm = lambda s: re.sub(r"[^a-z]+", "", s.lower())
c = collections.Counter(norm(l) for l in L if l.strip())
for i, l in enumerate(L):
    s = l.strip()
    if i < m0 or not s or len(s) > 70 or len(s.split()) > 9: continue
    a = [x for x in s if x.isalpha()]
    if len(a) < 5: continue
    up = sum(x.isupper() for x in a) / len(a)
    if up > 0.8 and c[norm(s)] <= 2 and (i == 0 or not L[i-1].strip()) and (i + 1 >= len(L) or not L[i+1].strip()):
        print(i + 1, s)
