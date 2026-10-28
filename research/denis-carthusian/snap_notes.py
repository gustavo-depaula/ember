"""Move each Scripture footnote of a Denis book to the quotation it cites.

assemble.py places a margin note by the height of its line on the scan, and the
reading of the margin is often wrong. Here the cited verse is looked up in the
Vulgate (content/bible/vulgate) and the note moves to the end of the passage
nearby that quotes it; when no passage matches the verse but a neighbouring
chapter's verse does, the chapter numeral was misread and is corrected. A note
that matches nowhere (an allusion, a paraphrase, a reference read past repair)
stays where it is. "Ibid." is spelled out wherever a move changes what it
follows, and a block of several references is split so each finds its own place.

    python3 snap_notes.py [--write] [--log] [book-dir ...]     # default: every Denis book

assemble.py runs snap() on every chapter it writes.
"""
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

from note_check import books, corpus, norm, roman, vulgate

# Books with translations carry their notes in three languages: fixed by hand.
skip = {"opera-minora/de-sacra-communione-frequentanda"}

word_re = re.compile(r"[A-Za-zÆŒæœÀ-ÿ]+")
def stem(w: str) -> str:
    return w[:5]


vulgate_freq = Counter(stem(w) for book in vulgate.values() for chap in book.values() for v in chap.values() for w in re.findall(r"[a-z]+", norm(v)))
total = sum(vulgate_freq.values())


def idf(w: str) -> float:
    return math.log(total / (1 + vulgate_freq[w]))


common = {w for w, n in vulgate_freq.most_common(150)}


def content(text: str) -> set[str]:
    return {stem(w) for w in re.findall(r"[a-z]+", norm(text)) if len(w) >= 4 and stem(w) not in common}


ref_head = re.compile(r"^(?:Cf\.\s*)?(?:(Ibid(?:em)?)\.?|((?:I{1,3}V?|[1-4])\s*)?([A-Z][a-zæœ]+)\.?)\s*(.*)$")
split_refs = re.compile(r"(?<=[.;])\s+(?=(?:Cf\.\s*)?(?:[IV]{1,3}\s+|[1-4]\s*)?[A-Z][a-zæœ]{1,8}\.)")


def parse(text: str, last: dict | None) -> dict | None:
    """Book, chapter, verses and how the note names them; None if not Scripture."""
    m = ref_head.match(text.strip())
    if not m:
        return None
    ibid, num, name, rest = m.groups()
    if ibid:
        if not last:
            return None
        book, abbr = last["book"], last["abbr"]
    else:
        prefix = {"1": "i", "2": "ii", "3": "iii", "4": "iv"}.get((num or "").strip(), (num or "").strip().lower())
        book = books.get((prefix + " " + name.lower()).strip()) or books.get(name.lower())
        if not book:
            return None
        abbr = text.strip()[: m.start(4)].strip()
    first = rest.split(";")[0]
    parts = [p.strip(" .") for p in re.split(r"[,:]", first) if p.strip(" .")]
    chapter, chap_token, verses = None, None, []
    if parts and (not ibid or not re.fullmatch(r"[0-9]+(\s*-\s*[0-9]+)?", parts[0])):
        token = parts[0].split()[0] if parts[0].split() else ""
        chapter, chap_token = roman(token), token
        rest_first = parts[0].split()[1:]
        parts = ([" ".join(rest_first)] if rest_first else []) + parts[1:]
        if chapter is None:
            pass
    elif ibid:
        chapter = last["chapter"]
    for p in parts:
        for a, b in re.findall(r"([0-9]+)(?:\s*-\s*([0-9]+))?", p):
            verses += list(range(int(a), int(b or a) + 1))[:6]
    return {"book": book, "abbr": abbr, "chapter": chapter, "chap_token": chap_token, "verses": verses[:8], "ibid": bool(ibid), "parent": last if ibid else None}


def verse_set(ref: dict, chapter: int | None = None) -> set[str]:
    chap = vulgate[ref["book"]].get(str(chapter or ref["chapter"]))
    if not chap or not ref["verses"]:
        return set()
    out = set()
    for v in ref["verses"]:
        out |= content(chap.get(str(v), ""))
    return out


def best_cluster(tokens: list, vs: set[str], lo: int, hi: int) -> tuple[float, int, int] | None:
    """The densest run of the verse's words among tokens[lo:hi]: (score, distinct, index of its last new word)."""
    span = max(8, len(vs) + 6)
    best = None
    hits = [i for i in range(max(0, lo), min(len(tokens), hi)) if tokens[i][0] in vs]
    for k, i in enumerate(hits):
        seen, last = set(), i
        for j in hits[k:]:
            if j - i > span:
                break
            if tokens[j][0] not in seen:
                seen.add(tokens[j][0])
                last = j
        score = sum(idf(w) for w in seen)
        if best is None or score > best[0] + 1e-9:
            best = (score, len(seen), last)
    return best


def enough(cluster, vs: set[str]) -> bool:
    if not cluster:
        return False
    score, distinct, _ = cluster
    need = 3 if len(vs) >= 4 else len(vs)
    return distinct >= need and score >= 18


def place_after(text: str, tokens: list, last: int) -> int:
    """Where a note on a quotation ending at tokens[last] goes: after the punctuation that closes it."""
    end = tokens[last][2]
    limit = tokens[last + 12][1] if last + 12 < len(tokens) else len(text)
    m = re.compile(r"[^.;:?!\n]*?([.;:?!»])").match(text, end, limit)
    at = m.end() if m else end
    while at < len(text) and text[at] in ":;":  # "etc.:" — a marker before ":" would read as a definition
        at += 1
    return at


fix_log: list[tuple[str, str, str]] = []


def snap(text: str, stats: Counter) -> str:
    defs = dict(re.findall(r"^\[\^(\d+)\]: (.*)$", text, flags=re.M))
    body = re.sub(r"\n*(?:^\[\^\d+\]: .*\n?)+\Z", "\n", text, flags=re.M)
    if re.search(r"^\[\^\d+\]: ", body, flags=re.M):  # a definition mid-text: leave the file alone
        stats["skipped file"] += 1
        return text
    notes, plain, pos = [], [], 0
    for m in re.finditer(r"\[\^(\d+)\]", body):
        plain.append(body[pos: m.start()])
        notes.append({"at": sum(map(len, plain)), "text": defs.get(m.group(1), "")})
        pos = m.end()
    plain.append(body[pos:])
    plain = "".join(plain)
    tokens = [(stem(norm(m.group())), m.start(), m.end()) for m in word_re.finditer(plain)]
    starts = [t[1] for t in tokens]

    def token_index(at: int) -> int:
        lo, hi = 0, len(starts)
        while lo < hi:
            mid = (lo + hi) // 2
            if starts[mid] < at:
                lo = mid + 1
            else:
                hi = mid
        return lo

    # Split blocks of references; resolve every note in its printed order.
    expanded, last, recent = [], None, []
    for n in notes:
        pieces = [q for p in n["text"].split(" | ") for q in split_refs.split(p)]
        refs = []
        for p in pieces:
            r = parse(p, last if not refs else refs[-1][1] or last)
            refs.append((p, r))
        if len(pieces) > 1 and all(r for _, r in refs):
            stats["split"] += 1
            for i, (p, r) in enumerate(refs):
                expanded.append({"at": n["at"], "text": p, "ref": r, "order": len(expanded)})
        else:
            expanded.append({"at": n["at"], "text": n["text"], "ref": refs[0][1] if len(refs) == 1 else parse(n["text"], last), "order": len(expanded)})
        for e in expanded[-len(pieces):] if len(pieces) > 1 and all(r for _, r in refs) else expanded[-1:]:
            if e["ref"]:
                if e["ref"]["ibid"]:  # the margin's order is not the text's: it may mean an earlier book
                    e["ref"]["alts"] = [x for x in recent if x["book"] != e["ref"]["book"]]
                last = e["ref"]
                recent = ([last] + [x for x in recent if x["book"] != last["book"]])[:4]

    for e in expanded:
        r = e["ref"]
        if not r:
            stats["other"] += 1
            continue
        if r.get("parent") and r["chap_token"] is None:  # "Ibid. 15.": the chapter of the note it follows, as corrected
            r["chapter"] = r["parent"]["chapter"]
        here = token_index(e["at"])
        window = (here - 30, here + 8)
        region = (here - 350, here + 350)
        valid = r["chapter"] and str(r["chapter"]) in vulgate[r["book"]]
        vs = verse_set(r) if valid else set()
        local = best_cluster(tokens, vs, *window) if vs else None
        cluster = best_cluster(tokens, vs, *region) if vs else None
        if enough(local, vs) and local[0] >= 0.67 * cluster[0]:
            stats["in place"] += 1
            continue
        # Move only to a clearly better quotation: some support here (two of the verse's words)
        # is kept unless the passage elsewhere is much stronger.
        weak_here = local and local[1] >= 2
        strong = cluster and cluster[1] >= 3 and cluster[0] >= 24 and (not weak_here or (cluster[0] >= 1.5 * local[0] and cluster[1] >= local[1] + 2))
        if weak_here and not strong:
            stats["kept, weak match"] += 1
            continue
        if vs and strong:
            e["at"] = place_after(plain, tokens, cluster[2])
            stats["moved"] += 1
            continue
        rebound = None
        for alt in r.get("alts", []):
            cand = dict(r, book=alt["book"], abbr=alt["abbr"], chapter=r["chapter"] if r["chap_token"] else alt["chapter"])
            if not cand["chapter"] or str(cand["chapter"]) not in vulgate[cand["book"]]:
                continue
            vc = verse_set(cand)
            cl = best_cluster(tokens, vc, *region) if vc else None
            if enough(cl, vc) and cl[1] >= 3:
                rebound = (cand, cl)
                break
        if rebound:
            cand, cl = rebound
            r.update(book=cand["book"], abbr=cand["abbr"], chapter=cand["chapter"], parent=None, rebound=True)
            ctx_end = place_after(plain, tokens, cl[2])
            fix_log.append((e["text"], "→ " + cand["abbr"] + " " + to_roman(cand["chapter"]), " ".join(plain[max(0, ctx_end - 160): ctx_end].split())))
            e["at"] = place_after(plain, tokens, cl[2])
            stats["ibid rebound"] += 1
            continue
        # A misread chapter numeral: does another reading of it, or a neighbouring chapter, match here?
        found = None
        if r["verses"] and r["chap_token"]:
            bases = readings(r["chap_token"]) or ([r["chapter"]] if r["chapter"] else [])
            tries = [c for c in bases if c != r["chapter"]] + [b + d for b in bases for d in (1, -1, 2, -2, 10, -10, 9, -9, 11, -11)]
            for c in dict.fromkeys(tries):
                vc = verse_set(r, c)
                if len(vc) < 3:
                    continue
                cl = best_cluster(tokens, vc, *region)
                if cl and cl[1] >= 4 and cl[0] >= 32:
                    found = (c, cl)
                    break
        if found:
            c, cl = found
            old = r["chap_token"]
            new = to_roman(c)
            if old.isupper() and not old.isdigit():
                new = new.upper()
            before_text = e["text"]
            e["text"] = re.sub(r"(?<![A-Za-z0-9])" + re.escape(old) + r"(?![A-Za-z0-9])", new, e["text"], count=1)
            ctx_end = place_after(plain, tokens, cl[2])
            fix_log.append((before_text, e["text"], " ".join(plain[max(0, ctx_end - 160): ctx_end].split())))
            r["chapter"] = c
            e["at"] = place_after(plain, tokens, cl[2])
            stats["numeral fixed"] += 1
            continue
        stats["no match"] += 1

    # The new order; "Ibid." is spelled out wherever it no longer follows the note it meant.
    expanded.sort(key=lambda e: (e["at"], e["order"]))
    prev = None
    for k, e in enumerate(expanded):
        r = e["ref"]
        if r and r["ibid"] and prev is not None and prev.get("ref") and (prev["ref"]["book"] != r["book"] or (prev["ref"]["chapter"] != r["chapter"])):
            chap = to_roman(r["chapter"]) if r["chapter"] else ""
            m = re.match(r"(?:Cf\.\s*)?Ibid(?:em)?\.?\s*", e["text"])
            rest = e["text"][m.end():]
            gives_chapter = not re.match(r"[0-9]", rest)
            e["text"] = e["text"][: m.start()] + f"{r['abbr']} " + (rest if gives_chapter else f"{chap}, {rest}")
            stats["ibid spelled out"] += 1
        if r and r["chapter"]:
            prev = e
        elif r is None:
            prev = prev
    out, pos = [], 0
    for k, e in enumerate(expanded, 1):
        out.append(plain[pos: e["at"]] + f"[^{k}]")
        pos = e["at"]
    out.append(plain[pos:])
    result = "".join(out).rstrip() + "\n"
    if expanded:
        result += "\n" + "".join(f"[^{k}]: {e['text']}\n" for k, e in enumerate(expanded, 1))
    return result


def readings(token: str) -> list[int]:
    """The chapter numbers a scanned numeral can stand for: as read, and with the usual misreadings undone."""
    t = token.lower()
    alts = {t, t.replace("u", "ii"), t.replace("n", "ii"), t.replace("1", "i"), t.replace("l", "i"), t.replace("u", "ii").replace("1", "i")}
    out = [roman(a) for a in alts]
    return sorted({n for n in out if n})


def to_roman(n: int) -> str:
    out = ""
    for v, s in ((100, "c"), (90, "xc"), (50, "l"), (40, "xl"), (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")):
        while n >= v:
            out, n = out + s, n - v
    return out


def main():
    write = "--write" in sys.argv
    dirs = [Path(a) for a in sys.argv[1:] if not a.startswith("-")] or sorted({p.parent.parent for p in corpus.glob("**/la/*.md")})
    stats = Counter()
    changed = 0
    for d in dirs:
        if str(d.relative_to(corpus)) in skip:
            continue
        for f in sorted((d / "la").glob("c*.md")):
            text = f.read_text()
            new = snap(text, stats)
            if new != text:
                changed += 1
                if write:
                    f.write_text(new)
    print(dict(stats), f"files changed: {changed}")
    if "--log" in sys.argv:  # each corrected numeral and re-bound "Ibid.", with the passage it now marks
        print("".join(f"{a}\t{b}\t{c}\n" for a, b, c in fix_log))


if __name__ == "__main__":
    main()
