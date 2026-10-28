"""Write an edition's verses.json: the text as it will be spoken.

    BOOK=job EDITION=en python3 drama/prepare.py
    EDITION=pt-am python3 drama/prepare.py   # reads <book>/consult/ave-maria/<chapter>.json

Mark's English was prepared from an earlier Douay source before this script
covered English; rerunning it there would change text that is already voiced.

Print furniture is removed and nothing else: footnote asterisks, soft
hyphens, and the Scripture references and synoptic parallels that both
Portuguese editions print in parentheses. Quotation marks stay; they help
whoever labels the speakers and are dropped when the lines are built.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from edition import book, bookDir, edition, here, root  # noqa: E402


def clean(text: str) -> str:
    text = text.replace("­", "").replace("*", "")
    # "(Ml 3, 1)", "(= Mt 8,2-4 = Lc 5,12-16)", "(29,13)": a reference always has a digit; a real aside never does.
    text = re.sub(r"\s*\([^)]*\d[^)]*\)", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+([.,;:?!])", r"\1", text)
    # The Ave Maria leaves the dash that opens the next verse's reply dangling here.
    return re.sub(r"\s[–—-]$", "", text)


corpus = here.parents[2] / "content" / "bible"
if edition == "en":
    source = json.loads((corpus / "drb" / f"{book}.json").read_text(encoding="utf-8"))
elif edition == "pt-ms":
    source = json.loads((corpus / "matos-soares" / f"{book}.json").read_text(encoding="utf-8"))
elif edition == "pt-am":
    source = {}
    for path in sorted((bookDir / "consult" / "ave-maria").glob("*.json"), key=lambda p: int(p.stem)):
        n = path.stem
        raw = json.loads(path.read_text(encoding="utf-8"))
        source[str(n)] = {v["number"]: v["text"] for v in sorted(raw, key=lambda v: int(v["number"]))}
verses = {c: {n: clean(t) for n, t in body.items()} for c, body in source.items()}
root.mkdir(parents=True, exist_ok=True)
(root / "verses.json").write_text(json.dumps(verses, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(book, edition, sum(len(c) for c in verses.values()), "verses", sum(len(t) for c in verses.values() for t in c.values()), "characters")
