"""Builds index.html: three directions for the saint page, on real corpus data.

Run from the repo root with a Python that has Pillow:
  python research/saint-page-prototype/build.py
"""

import base64, glob, io, json, os, re

from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
cards_dir = "content/practices/saint-of-the-day/data/holy-cards/"
months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

books = {}
for f in glob.glob("content/books/**/book.json", recursive=True):
    b = json.load(open(f))
    books[b["id"]] = b


def jpeg(path, width):
    img = Image.open(path).convert("RGB")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=78)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def card(cid):
    c = json.load(open(cards_dir + cid + ".json"))
    feast = c.get("feast")
    return {
        "id": cid,
        "name": c["name"]["en-US"],
        "feast": f"{months[feast['month'] - 1]} {feast['day']}" if feast else None,
        "patron": (c.get("patronOf") or {}).get("en-US"),
        "quote": (c.get("prayerExcerpt") or {}).get("en-US"),
        "proper": c.get("proper"),
        "lifeChapter": c.get("lifeChapter"),
        "art": jpeg(f"content/saints/{cid}.png", 420),
    }


def life(chapter):
    text = open(f"content/books/pictorial-lives-of-saints/en-US/{chapter}.md").read()
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    paras = [p for p in paras if not p.startswith("#") and not p.startswith("![")]
    reflection = None
    if paras and paras[-1].startswith("**Reflection**"):
        reflection = re.sub(r"^\*\*Reflection\*\*\W*", "", paras.pop())
    engraving = f"content/books/pictorial-lives-of-saints/images/{chapter}.webp"
    words = sum(len(p.split()) for p in paras)
    return {
        "paras": paras,
        "reflection": reflection,
        "minutes": max(1, round(words / 200)),
        "engraving": jpeg(engraving, 360) if os.path.exists(engraving) else None,
    }


def mass(proper):
    if not proper or not proper.startswith("sanctorale."):
        return None
    path = f"content/of/formularies/sanctoral/{proper.split('.')[1]}.json"
    if not os.path.exists(path):
        return None
    f = json.load(open(path))
    lines = f["collect"]["options"][0]["body"]["lines"].get("en-US", [])
    return {
        "title": f["title"]["en-US"],
        "rank": f.get("rank"),
        "color": f.get("color"),
        "about": (f.get("description") or {}).get("en-US"),
        "collect": ["".join(t.get("text", "") for t in line) for line in lines],
    }


def practice(pid):
    m = json.load(open(f"content/practices/{pid}/manifest.json"))
    return {"name": m["name"]["en-US"], "minutes": m.get("estimatedMinutes"), "kind": "practice"}


def item(ref):
    kind, _, rid = ref.partition("/")
    if kind == "practice":
        return practice(rid)
    b = books.get(rid)
    return {"name": b["name"].get("en-US") or next(iter(b["name"].values())), "kind": "book"} if b else None


def subject(cid, prayers, writings, linked, note):
    c = card(cid)
    return {
        **c,
        "note": note,
        "life": life(c["lifeChapter"]) if c["lifeChapter"] else None,
        "mass": mass(c["proper"]),
        "prayers": prayers,
        "writings": writings,
        "cards": [{**card(i), "why": why} for i, why in linked],
    }


def groups(collection, first, last):
    c = json.load(open(f"content/collections/{collection}.json"))
    out = []
    for s in c["sections"][first:last]:
        items = [i for i in (item(b["ref"]) for b in s["blocks"] if b.get("ref")) if i]
        if items:
            out.append({"title": s["title"]["en-US"], "items": items})
    return out, c["prologue"]["body"]["en-US"]


aq_prayers, aq_prologue = groups("thomas-aquinas", 0, 4)
aq_writings, _ = groups("thomas-aquinas", 4, 13)

subjects = [
    {
        **subject(
            "thomas_aquinas",
            aq_prayers,
            aq_writings,
            # The "why" lines are illustrative for the prototype, not sourced data.
            [
                ("albert_great", "His master at Cologne"),
                ("dominic", "Founder of his Order"),
                ("corpus_christi", "He wrote its Office"),
                ("bonaventure", "Fellow Doctor at Paris"),
            ],
            "The rich case: a hand-written collection, 9 prayers, over a hundred books.",
        ),
        "prologue": aq_prologue,
        "collection": "St. Thomas Aquinas — the collection",
    },
    subject(
        "peter",
        [{"title": "Novenas", "items": [practice("ss-peter-and-paul-novena")]}],
        [{"title": "Sacred Scripture", "items": [{"name": "The First Letter of Peter", "kind": "book"}, {"name": "The Second Letter of Peter", "kind": "book"}]}],
        [
            ("paul", "One feast, 29 June"),
            ("chair_peter", "His office as teacher"),
            ("peter_chair_rome", "He founds the Church of Rome"),
            ("peter_chains", "Freed by an angel"),
            ("basilicas_peter_paul", "The church over his tomb"),
        ],
        "The card-links case: five other cards are about him.",
    ),
    subject("philip_benizi", [], [], [], "The thin case: a life and nothing else. Most of the 631 cards look like this."),
]

data = "const subjects = " + json.dumps(subjects, ensure_ascii=False)
for src, dst in (("template.html", "index.html"), ("template-b.html", "b.html")):
    out = open(os.path.join(here, src)).read().replace("/*DATA*/", data)
    open(os.path.join(here, dst), "w").write(out)
    print(dst, len(out) // 1024, "KB")
for s in subjects:
    print(s["id"], "prayers", sum(len(g["items"]) for g in s["prayers"]), "writings", sum(len(g["items"]) for g in s["writings"]), "cards", len(s["cards"]), "mass", bool(s["mass"]))
