# Attribute lines of an OCR text to the last running-header keyword seen (label=regex args, matched on whole short lines); count words per section.
import sys, re, collections
lines = open(sys.argv[1], encoding="utf-8", errors="replace").read().splitlines()
start = int(sys.argv[2])
keys = [k.split("=", 1) for k in sys.argv[3:]]
cur, counts = "front", collections.Counter()
for i, l in enumerate(lines):
    if i >= start and len(l) < 70:
        for label, rx in keys:
            if re.match(rx, l.strip(), re.I):
                cur = label
                break
    counts[cur] += len(l.split())
for k, v in counts.items():
    print(f"{k:20s} {v:8d}w")
