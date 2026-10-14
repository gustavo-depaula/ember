"""Check an edition's attribution/<chapter>.json against its verses.json.

Each file is {"cast": {speakerId: {...}}, "verses": {"1": [{"s": speakerId, "t": text}, ...]}}.
The spans of a verse, joined with single spaces, must reproduce the verse
exactly, so labelling who speaks can never change what is said.

    EDITION=pt-ms python3 drama/check_attribution.py [chapter ...]
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from edition import root  # noqa: E402

verses = json.loads((root / "verses.json").read_text(encoding="utf-8"))
chapters = sys.argv[1:] or sorted(verses, key=int)
problems = 0
for chapter in chapters:
    path = root / "attribution" / f"{int(chapter):02d}.json"
    if not path.exists():
        print(f"chapter {chapter}: no file")
        problems += 1
        continue
    data = json.loads(path.read_text(encoding="utf-8"))
    for n, text in verses[chapter].items():
        spans = data["verses"].get(n)
        if not spans:
            print(f"{chapter}:{n} missing")
            problems += 1
            continue
        joined = " ".join(s["t"] for s in spans)
        if joined != text:
            print(f"{chapter}:{n} text differs\n  want: {text}\n  got:  {joined}")
            problems += 1
        for s in spans:
            if s["s"] not in data["cast"]:
                print(f"{chapter}:{n} speaker {s['s']!r} not in cast")
                problems += 1
            if not s["t"].strip() or s["t"] != s["t"].strip():
                print(f"{chapter}:{n} empty or untrimmed span")
                problems += 1
    extra = set(data["verses"]) - set(verses[chapter])
    if extra:
        print(f"chapter {chapter}: unknown verses {sorted(extra)}")
        problems += 1
print("OK" if not problems else f"{problems} problems")
sys.exit(1 if problems else 0)
