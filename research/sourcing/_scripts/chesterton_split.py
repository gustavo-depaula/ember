#!/usr/bin/env python3 -I
"""Split a plain-text Chesterton e-text into chapter markdown files.

usage: chesterton_split.py config.json
config: src, start (1-based line to begin searching), end (line, exclusive), out (en-US dir),
chapters: [{id, title, re}] where re matches the heading line (searched in order after start);
optional "heading_lines": number of heading lines to drop (default 1), "skip_re": regex of lines to drop,
"sections": regex of lines that become '## ' subheadings (full-line match).
"""
import json, re, sys
from pathlib import Path

cfg = json.load(open(sys.argv[1]))
lines = Path(cfg["src"]).read_text(encoding="utf-8", errors="replace").splitlines()
end = cfg.get("end") or len(lines)
pos = cfg["start"] - 1
starts = []
for ch in cfg["chapters"]:
    rx = re.compile(ch["re"])
    i = pos
    while i < end and not rx.match(lines[i]):
        i += 1
    if i >= end:
        sys.exit(f"heading not found: {ch['id']}")
    starts.append(i)
    pos = i + 1
starts.append(end)
skip = re.compile(cfg["skip_re"]) if cfg.get("skip_re") else None
sec = re.compile(cfg["sections"]) if cfg.get("sections") else None
out = Path(cfg["out"]); out.mkdir(parents=True, exist_ok=True)

def clean(t):
    t = t.replace("--", "—")
    t = re.sub(r"_([^_]+)_", r"*\1*", t)
    return re.sub(r"\s+", " ", t).strip()

def render(chunk):
    paras, cur = [], []
    for l in chunk + [""]:
        if skip and skip.match(l):
            continue
        if cfg.get("rule_stop") and re.match(r"^-{20,}$", l.strip()):
            if cur:
                paras.append(cur)
            break
        if l.strip() == "":
            if cur:
                paras.append(cur); cur = []
        else:
            cur.append(l)
    res = []
    for p in paras:
        if len(p) == 1 and sec and sec.match(p[0].strip()):
            res.append("## " + clean(p[0])); continue
        ind = [len(x) - len(x.lstrip()) for x in p]
        verse = len(p) >= 2 and all(i >= 3 for i in ind) and sum(len(x.strip()) for x in p) / len(p) < 62 \
            and not all(i == ind[0] for i in ind[1:1]) and max(ind) - min(ind) >= 0 and cfg.get("verse", True) \
            and ind[0] >= 6 and all(i >= 6 for i in ind)
        if verse:
            res.append("  \n".join(clean(x) for x in p))
        else:
            res.append(clean(" ".join(p)))
    return res

wc = {}
for n, ch in enumerate(cfg["chapters"]):
    chunk = lines[starts[n] + ch.get("hl", cfg.get("heading_lines", 1)): starts[n + 1]]
    body = render(chunk)
    text = f"# {ch['title']}\n\n" + "\n\n".join(body) + "\n"
    (out / f"{ch['id']}.md").write_text(text, encoding="utf-8")
    wc[ch["id"]] = len(text.split())
print(sum(wc.values()), "words", len(wc), "chapters")
for k, v in wc.items():
    print(f"  {k}: {v}")
