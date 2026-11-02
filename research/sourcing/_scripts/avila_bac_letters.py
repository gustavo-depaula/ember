"""Locate the letters of Sala Balust's Epistolario (BAC 1952, vol. I) in the OCR."""
import re
from pathlib import Path
R = Path("/Users/gustavo/Documents/prayer")
RAW = (R / "research/sourcing/john-of-avila/obrascompletased01avil.txt").read_text(encoding="utf-8").split("\n")
S = [re.sub(r"\s+", " ", l).strip() for l in RAW]
SRC = re.compile(r"^\(.{0,250}?(Ms\.|Mí\.|lis\.|ed\. |Ed\. |Ecl\. |Kd\. |Edic|ff?\. |Xf\.|tf\.|Cf\.|Orig|Arch|Bibl|Apógr|Copia|Rom).*", re.I)
def upper_ratio(s):
    a = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in a) / len(a) if a else 0
def starts(lo=18990, hi=72000):
    out = []
    for i in range(lo, hi):
        if SRC.match(S[i]) and not re.match(r"^\(\d", S[i]):
            # header: walk back over up to 4 non-empty lines for an uppercase run
            j = i - 1
            hdr = []
            while j > i - 7 and len(hdr) < 4:
                if S[j]:
                    if upper_ratio(S[j]) > 0.6 and len(S[j]) > 3 or (hdr and re.search(r"\]|\*", S[j]) and upper_ratio(S[j]) > 0.3):
                        hdr.insert(0, (j, S[j]))
                    else:
                        break
                j -= 1
            if hdr and re.match(r"^\S{1,5} (A|AL|AA|PARA|AUN|DE|AUNA|AL|ALAS)\b|^(A|AL|PARA|DE)\b", hdr[0][1]) or (hdr and re.match(r"^\S{1,5} [A-ZÁÉÍÓÚ]", hdr[0][1]) and len(hdr[0][1]) > 8 and not re.match(r"^[A-Z ]*EPISTOLARIO", hdr[0][1])):
                out.append((hdr[0][0], i, " ".join(h[1] for h in hdr)))
    return out
if __name__ == "__main__":
    st = starts()
    print(len(st))
    last = -100
    for k, (a, b, h) in enumerate(st):
        m = re.match(r"^(\S{1,5}) ", h)
        print(k + 1, a, m.group(1) if m else "-", h[:70])
