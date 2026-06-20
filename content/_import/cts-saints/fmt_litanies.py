#!/usr/bin/env python3
"""Format litany blocks in book chapters: tight hard-break lines with the
response italicized, split mushed invocations, promote 'Litany ...' to a heading.
Leaves orations (long paragraphs ending in 'Amen.') as normal paragraphs.
Idempotent: skips lines already italicized.
"""
import re, sys, pathlib

# response phrases that END a litany invocation (NOT 'Amen' — that's an oration)
RESP = (r"(?:have mercy on us|have mercy|graciously hear us(?:,? O Lord)?|"
        r"hear us|deliver us(?:,? O Lord)?|spare us(?:,? O Lord)?|"
        r"we beseech thee,? (?:hear|deliver) us|pray for us(?:,[^.]*)?)")
# one invocation = minimal lead text up to and including a response phrase
INVOC = re.compile(r"(.+?\b" + RESP + r"\b[.,]?)(?=\s|$)", re.I)
END_RESP = re.compile(RESP + r"\b[.,]?\s*$", re.I)
# split call / response for italicizing
SPLIT = re.compile(r"^(.*?)(,?\s*)(" + RESP + r")([.,]?)$", re.I)

def fmt_invocation(s):
    s = s.strip()
    if not s or "*" in s:           # already formatted / has emphasis
        return s
    m = SPLIT.match(s)
    if not m:
        return s
    call, sep, resp, punct = m.groups()
    if not call.strip():            # bare response (e.g. "Have mercy on us.")
        return f"*{resp}{punct}*"
    return f"{call}{sep}*{resp}{punct}*"

def is_litany_block(block):
    flat = re.sub(r"\s+", " ", block).strip()
    flat = re.sub(r"\.\s*\.\s*$", ".", flat)   # OCR "us. ." → "us."
    if not END_RESP.search(flat):
        return None
    invs = [m.strip() for m in INVOC.findall(flat) if m.strip()]
    if not invs:
        return None
    covered = sum(len(i) for i in invs)
    if covered < 0.75 * len(flat):  # an oration that merely ends in a response
        return None
    return invs

def process(text):
    m = re.search(r"^#\s+(.+)$", text, re.M)
    title = m.group(1).strip() if m else "the Saint"
    has_caption = bool(re.search(r"(?mi)^\s*Litany\b", text))

    # walk blocks with state: once a litany starts (explicit invocations), short
    # comma/"etc"-ending lines (responses elided by the source) continue it.
    out = []
    run = []          # raw invocation lines of the current litany (italicized at flush)
    synth_used = False
    did_format = False   # did this file actually contain a litany?

    def flush():
        nonlocal synth_used, did_format
        if not run:
            return
        if len(run) >= 3:                          # a real litany, not a stray line
            did_format = True
            prev_head = out and out[-1].lstrip().startswith("#")
            if not has_caption and not synth_used and len(run) >= 6 and not prev_head:
                out.append(f"### Litany of {title}")
                synth_used = True
            out.append("  \n".join(fmt_invocation(i) for i in run))  # tight hard breaks
        else:
            out.extend(run)                        # leave isolated invocations untouched
        run.clear()

    for block in re.split(r"\n\s*\n", text):
        b = block.strip("\n")
        s = re.sub(r"\s+", " ", b).strip()
        # a real "Litany ..." caption → heading
        if re.match(r"^Litany\b", s, re.I) and len(s) < 80:
            flush(); did_format = True; out.append(f"### {s}"); continue
        if s.startswith("#"):
            flush(); out.append(b); continue
        invs = is_litany_block(b)
        if invs:                                   # explicit invocation(s)
            run.extend(invs)
            continue
        # response elided by source: bare comma end, or short "etc" end —
        # only counts while a litany is already open
        if run and (s.endswith(",") or re.search(r"\betc\.?$", s)) and len(s) < 300:
            run.append(s)
            continue
        flush(); out.append(b)

    flush()
    if not did_format:
        return text                                # no litany → byte-for-byte unchanged
    return "\n\n".join(out).strip() + "\n"

if __name__ == "__main__":
    for path in sys.argv[1:]:
        p = pathlib.Path(path)
        new = process(p.read_text(encoding="utf-8"))
        p.write_text(new, encoding="utf-8")
        print("formatted", p.name)
