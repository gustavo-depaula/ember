"""rhb_heads.py FILE [FROM] [TO]: list lines that are a lone numeral (or CHAPTER/SERMON N) with the next non-blank lines."""
import sys, re
L = open(sys.argv[1], errors='ignore').read().split('\n')
a = int(sys.argv[2]) if len(sys.argv) > 2 else 0; b = int(sys.argv[3]) if len(sys.argv) > 3 else len(L)
rx = re.compile(r'^\s*(?:(?:CHAPTER|SERMON|Chapter|Sermon|PART|BOOK)\s+)?([IVXLl1!]{1,8}|\d{1,2})\s*[.:]?\s*$|^\s*(?:CHAPTER|SERMON|PART|BOOK)\s+[IVXL]+\b.*$')
for i in range(a, min(b, len(L))):
    if rx.match(L[i]):
        nxt = [x.strip() for x in L[i+1:i+8] if x.strip()][:2]
        print(i + 1, repr(L[i].strip()), '|', ' / '.join(n[:55] for n in nxt))
