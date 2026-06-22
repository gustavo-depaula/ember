#!/usr/bin/env python3
"""Build content/books/cts-lives-of-the-saints from the staged CTS scrape.
Curated: biographical lives only. Sermons, Marian doctrine, novenas, and
thematic devotional reflections are excluded.
"""
import json, re, pathlib
from fmt_litanies import process as format_litanies

ROOT = pathlib.Path("/home/gustavo/Documents/ember/.claude/worktrees/bridge-cse_01DShB2nEAXyLHVETpFuNf46")
STAGE = ROOT / "content/_import/cts-saints"
BOOK = ROOT / "content/books/cts-lives-of-the-saints"
EN = BOOK / "en-US"
EN.mkdir(parents=True, exist_ok=True)

manifest = json.load(open(STAGE / "manifest.json"))

# --- exclusion rules: not biographical histories ---
EXC = [
    "sermon", "novena", "how to pray", "importance of silence", "the real presence",
    "thoughts for the christmas",
    # Marian doctrine (not a life)
    "immaculate conception", "our lady's assumption", "dogma of the assumption",
    "of the dolours of mary", "the mother of our lady",
    # thematic St Joseph reflections (meditations, not history)
    "joseph's titles", "joseph's virtues", "joseph's dignity", "joseph's apostolic",
]

def is_bio(x):
    blob = (x["title"] + " " + x["link_title"]).lower()
    return not any(w in blob for w in EXC)

# clear OCR typos in the source link titles → corrected display names
FIX = {
    "Magadalen": "Magdalen", "Palotti": "Pallotti", "Maximillian": "Maximilian",
    "Mckillop": "MacKillop", "Spirtual": "Spiritual",
    "Saint Padre Pio": "Padre Pio",
}

def clean_name(link):
    s = link.strip().lstrip("-").strip()
    s = re.sub(r"\s*\([^)]*(bio|prayers|comentary|commentary)[^)]*\)\s*$", "", s, flags=re.I)
    for a, b in [(" Of ", " of "), (" The ", " the "), (" And ", " and "),
                 (" To ", " to "), (" In ", " in "), (" For ", " for ")]:
        s = s.replace(a, b)
    for bad, good in FIX.items():
        s = s.replace(bad, good)
    s = re.sub(r"\s+", " ", s)  # collapse double spaces from OCR
    return s.strip()

def strip_frontmatter(md):
    if md.startswith("---"):
        return md.split("---", 2)[2].lstrip("\n")
    return md

def clean_body(md):
    # source renders em-dashes as U+FFFD (+ a stray quote); repair them
    md = re.sub(r"�['‘’]?", "—", md)
    # drop trailing asterisk rules left on colophon/imprimatur lines
    md = re.sub(r"[ \t]*\*{3,}[ \t]*$", "", md, flags=re.M)
    return md

bios = [x for x in manifest if is_bio(x)]
excluded = [x for x in manifest if not is_bio(x)]

chapters = []
for x in sorted(bios, key=lambda x: clean_name(x["link_title"]).replace("Saint ", "").replace("St. ", "").lower()):
    slug = x["slug"]
    name = clean_name(x["link_title"])
    raw = (STAGE / "md" / f"{slug}.md").read_text(encoding="utf-8")
    body = clean_body(strip_frontmatter(raw))
    # replace the leading "# OLD OCR TITLE" with a clean H1
    body = re.sub(r"\A#\s+[^\n]*\n", f"# {name}\n", body, count=1)
    body = format_litanies(body)   # tight hard-break lines + italic responses
    (EN / f"{slug}.md").write_text(body, encoding="utf-8")
    chapters.append({"id": slug, "title": {"en-US": name}})

book = {
    "id": "cts-lives-of-the-saints",
    "name": {"en-US": "Lives of the Saints (CTS)"},
    "author": {"en-US": "Catholic Truth Society"},
    "description": {"en-US": (
        "Short narrative lives of the saints from the Catholic Truth Society's "
        "devotional pamphlet series — each a single authored biography written to "
        "inspire rather than catalogue. Drawn from the CTS booklets digitized at "
        "ecatholic2000.com; sermons, Marian doctrine, and novena booklets from the "
        "same series are omitted."
    )},
    "composed": "20th century",
    "languages": ["en-US"],
    "sources": [{
        "language": "en-US",
        "url": "https://www.ecatholic2000.com/saints.shtml",
        "description": "Catholic Truth Society pamphlets, digitized by Wildfire Fellowship (ecatholic2000.com). OCR — not yet proofed against the printed originals.",
    }],
    "toc": chapters,
}
(BOOK / "book.json").write_text(json.dumps(book, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"included {len(chapters)} lives, excluded {len(excluded)}")
print("\n--- EXCLUDED ---")
for x in sorted(excluded, key=lambda x: x["title"]):
    print(f"  {x['link_title']}")
print("\n--- INCLUDED TOC ---")
for c in chapters:
    print(f"  {c['title']['en-US']}")
