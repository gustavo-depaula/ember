"""How well do the Denis footnotes match the text they mark?

Each Scripture note is checked against the Vulgate: does the cited verse share
words with the text just before its marker? A miss is then classed:
  near      the verse matches text elsewhere in the same paragraph (note misplaced)
  numeral   a neighbouring chapter's verse matches here (numeral misread)
  none      no match found (allusion, paraphrase, or a reference read wrong)

    python3 note_check.py [book-dir ...]      # default: every Denis book
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

repo = Path(__file__).resolve().parents[2]
corpus = repo / "content/books/denis-opera-omnia"
vulgate_dir = repo / "content/bible/vulgate"

books = {
    "gen": "genesis", "exod": "exodus", "lev": "leviticus", "num": "numbers", "deut": "deuteronomy",
    "jos": "josue", "josue": "josue", "judic": "judges", "ruth": "ruth",
    "i reg": "1-kings", "ii reg": "2-kings", "iii reg": "3-kings", "iv reg": "4-kings",
    "i par": "1-paralipomenon", "ii par": "2-paralipomenon", "i esdr": "1-esdras", "ii esdr": "2-esdras",
    "tob": "tobias", "judith": "judith", "esth": "esther", "esther": "esther", "job": "job", "ps": "psalms",
    "prov": "proverbs", "eccle": "ecclesiastes", "eccl": "ecclesiastes", "cant": "canticles", "sap": "wisdom",
    "eccli": "ecclesiasticus", "is": "isaias", "isa": "isaias", "jer": "jeremias", "thren": "lamentations",
    "bar": "baruch", "baruch": "baruch", "ezech": "ezechiel", "dan": "daniel", "os": "osee", "osee": "osee",
    "joel": "joel", "amos": "amos", "abd": "abdias", "jon": "jonas", "jonæ": "jonas", "mich": "micheas",
    "nah": "nahum", "nahum": "nahum", "habac": "habacuc", "hab": "habacuc", "soph": "sophonias", "agg": "aggeus",
    "zach": "zacharias", "malach": "malachias", "mal": "malachias", "i mach": "1-machabees", "ii mach": "2-machabees",
    "matth": "matthew", "marc": "mark", "luc": "luke", "joann": "john", "act": "acts", "rom": "romans",
    "i cor": "1-corinthians", "ii cor": "2-corinthians", "galat": "galatians", "gal": "galatians",
    "ephes": "ephesians", "eph": "ephesians", "philipp": "philippians", "phil": "philippians", "coloss": "colossians",
    "col": "colossians", "i thess": "1-thessalonians", "ii thess": "2-thessalonians", "i tim": "1-timothy",
    "ii tim": "2-timothy", "tit": "titus", "philem": "philemon", "hebr": "hebrews", "heb": "hebrews",
    "jacob": "james", "jac": "james", "i petr": "1-peter", "ii petr": "2-peter", "i joann": "1-john",
    "ii joann": "2-john", "iii joann": "3-john", "jud": "jude", "judæ": "jude", "apoc": "apocalypse",
}
vulgate = {name: json.loads((vulgate_dir / f"{name}.json").read_text()) for name in set(books.values())}


def norm(s: str) -> str:
    s = s.lower().replace("æ", "e").replace("œ", "e").replace("ae", "e").replace("oe", "e").replace("j", "i").replace("v", "u")
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


def words(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z]+", norm(s)) if len(w) >= 4}


def roman(s: str) -> int | None:
    s = s.lower().strip()
    if re.fullmatch(r"[0-9]+", s):
        return int(s)
    if not re.fullmatch(r"[ivxlc]+", s):
        return None
    vals = {"i": 1, "v": 5, "x": 10, "l": 50, "c": 100}
    total = 0
    for a, b in zip(s, s[1:] + " "):
        total += -vals[a] if b != " " and vals[a] < vals[b] else vals[a]
    return total


ref_re = re.compile(r"^(?:(Ibid(?:em)?)\.?|((?:I{1,3}V?|[1-4])\s*)?([A-Z][a-zæœ]+)\.?)\s*(.*)$")


def parse(text: str, last: dict | None) -> dict | None:
    """The first reference of a note: book, chapter, verses. None if not Scripture."""
    m = ref_re.match(text.strip())
    if not m:
        return None
    ibid, num, name, rest = m.groups()
    if ibid:
        if not last:
            return None
        book = last["book"]
    else:
        prefix = {"1": "i", "2": "ii", "3": "iii", "4": "iv"}.get((num or "").strip(), (num or "").strip().lower())
        key = (prefix + " " + name.lower()).strip()
        book = books.get(key) or books.get(name.lower())
        if not book:
            return None
    rest = rest.split(";")[0].split(". ")[0]
    parts = [p.strip(" .") for p in re.split(r"[,:]", rest) if p.strip(" .")]
    chapter, verses = None, []
    if parts and not re.fullmatch(r"\d+(-\d+)?", parts[0]) or (parts and ibid is None):
        chapter = roman(parts[0].split()[0]) if parts[0].split() else None
        if chapter is None:
            return {"book": book, "chapter": None, "verses": [], "garbled": True}
        parts = parts[1:]
    elif ibid and last:
        chapter = last["chapter"]
    for p in parts:
        for a, b in re.findall(r"([0-9]+)(?:\s*-\s*([0-9]+))?", p):
            verses += list(range(int(a), int(b or a) + 1))[:6]
    return {"book": book, "chapter": chapter, "verses": verses[:8], "garbled": False}


def verse_words(ref: dict, chapter: int | None = None) -> set[str]:
    chap = vulgate[ref["book"]].get(str(chapter or ref["chapter"]), {})
    out = set()
    for v in ref["verses"] or list(map(int, list(chap)[:3])):
        out |= words(chap.get(str(v), ""))
    return out


def hit(vw: set[str], window: set[str]) -> bool:
    if not vw:
        return False
    shared = len(vw & window)
    return shared >= min(3, max(2, len(vw) // 2))


def check(path: Path, stats: Counter, samples: list):
    text = path.read_text()
    defs = dict(re.findall(r"^\[\^(\d+)\]: (.*)$", text, flags=re.M))
    body = re.sub(r"^\[\^\d+\]: .*$", "", text, flags=re.M)
    last = None
    for m in re.finditer(r"\[\^(\d+)\](?!:)", body):
        note = defs.get(m.group(1), "")
        ref = parse(note, last)
        if ref is None:
            stats["other"] += 1
            continue
        last = ref if not ref["garbled"] else last
        if ref["garbled"] or not ref["chapter"] or str(ref["chapter"]) not in vulgate[ref["book"]]:
            stats["unreadable"] += 1
            continue
        vw = verse_words(ref)
        before = re.sub(r"\[\^\d+\]", "", body[: m.start()])
        after = re.sub(r"\[\^\d+\]", "", body[m.end():])
        window = words(" ".join(before.split()[-45:]) + " " + " ".join(after.split()[:12]))
        if hit(vw, window):
            stats["match"] += 1
            continue
        start, end = body.rfind("\n\n", 0, m.start()), body.find("\n\n", m.end())
        para = words(body[max(0, start): end if end > 0 else None])
        if hit(vw, para):
            stats["near"] += 1
            kind = "near"
        elif any(hit(verse_words(ref, ref["chapter"] + d), window) for d in (-1, 1, -10, 10) if str(ref["chapter"] + d) in vulgate[ref["book"]]):
            stats["numeral"] += 1
            kind = "numeral"
        else:
            stats["none"] += 1
            kind = "none"
        if len(samples) < 400:
            samples.append((kind, str(path.relative_to(corpus)), note, " ".join(before.split()[-14:])))


def main():
    dirs = [Path(a) for a in sys.argv[1:] if not a.startswith("-")] or sorted({p.parent.parent for p in corpus.glob("**/la/*.md")})
    rows = []
    total = Counter()
    for d in dirs:
        stats, samples = Counter(), []
        for f in sorted((d / "la").glob("c*.md")):
            check(f, stats, samples)
        total += stats
        scripture = stats["match"] + stats["near"] + stats["numeral"] + stats["none"]
        if scripture:
            rows.append((stats["match"] / scripture, str(d.relative_to(corpus)), stats, scripture))
    for rate, name, stats, n in sorted(rows):
        print(f"{rate:5.0%}  n={n:5d}  near={stats['near']:4d} numeral={stats['numeral']:4d} none={stats['none']:4d} unreadable={stats['unreadable']:4d}  {name}")
    n = total["match"] + total["near"] + total["numeral"] + total["none"]
    print(f"\nALL: {n} scripture notes; match {total['match'] / n:.0%}, near {total['near'] / n:.0%}, numeral {total['numeral'] / n:.0%}, none {total['none'] / n:.0%}; unreadable {total['unreadable']}, other {total['other']}")


if __name__ == "__main__":
    main()
