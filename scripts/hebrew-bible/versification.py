#!/usr/bin/env python3
"""Write content/bible/hebrew-wlc/versification.json: each verse of the
Hebrew Bible (its own, Masoretic numbering) → the shared address the app keys
every Bible on (the Douay slug and the Clementine Vulgate's chapter:verse),
only where they differ; null where the Vulgate has no counterpart.

The contract is the Septuagint's (apps/app/src/features/bible/versification.ts):
the map stays inside a book, several Hebrew verses may fold onto one shared
verse (the first of them opens it), and a Hebrew verse the map does not name
keeps its own number.

How it is drafted and checked:

    1. SIL's draft (github.com/sillsdev/machine.py, MIT, machine/scripture/
       org.vrs and vul.vrs, read by ../greek-bible/vrs.py): org is BHS, the
       Hebrew numbering, so a Hebrew verse is sent through vul.vrs's mappings
       to the Vulgate's.
    2. STEPBible's TVTMS (github.com/STEPBible/STEPBible-Data Versification/,
       CC BY 4.0: "Data created by www.STEPBible.org based on work at Tyndale
       House Cambridge"), whose rows name, for each verse numbered differently
       somewhere, where it stands in the Hebrew and in the Latin tradition
       ("Ancient Versions": "(Hebrew=3:19 • Latin=4:1 • Greek=4:1)"). It is the
       second opinion: where it and SIL disagree, or SIL is silent, the texts
       decide.
    3. The texts: the TAHOT English glosses of the Hebrew verse are compared
       with the Douay's English of each candidate address (shared content
       words, a crude but honest measure); a candidate is kept only if it reads
       like the Hebrew. Every mapped verse is scored, and the weak ones listed.
    4. hebrew-wlc.map beside this script: the corrections settled by hand,
       with how each was checked. It overrides 1–3.

Usage: python3 -I scripts/hebrew-bible/versification.py <downloads dir>
       (org.vrs, vul.vrs, tvtms.txt, and the TAHOT files)
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "greek-bible"))
import vrs  # noqa: E402
from common import BIBLE, BOOKS, OUT, SIL_OF, SLUG_OF_TAHOT, dump  # noqa: E402

sys.path.insert(0, str(HERE.parent))
from bible_address import to_douay  # noqa: E402

STOP = set(
    """a an the and or of to in on at by for with from into unto upon as is was were be been are
    am i you he she it we they me him her us them my your his its our their this that these those
    which who whom what not no nor so all also shall will would should may might can could have has
    had do did does o thou thee thy thine ye said say saith there then when than but if out up down
    over under before after about over over""".split()
)


def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z]+", text.lower()) if w not in STOP and len(w) > 2}


def stem(w: str) -> str:
    for suf in ("ings", "ing", "eth", "est", "ed", "es", "s"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            return w[: -len(suf)]
    return w


def bag(text: str) -> set[str]:
    return {stem(w) for w in words(text)}


def score(hebrew: set[str], english: str | None) -> float:
    """How much of the Hebrew verse's glossed sense the English verse holds."""
    if not english or not hebrew:
        return 0.0
    other = bag(english)
    return len(hebrew & other) / len(hebrew)


# ── Sources ───────────────────────────────────────────────────────────────────


def load_json(edition: str, slug: str) -> dict:
    return json.loads((BIBLE / edition / f"{slug}.json").read_text(encoding="utf-8"))


def gloss_bags() -> dict:
    """(slug, c, v) → the set of content words of the verse's TAHOT glosses."""
    out = {}
    for path in sorted((OUT / "words").glob("*.json")):
        slug = path.stem
        for c, vs in json.loads(path.read_text(encoding="utf-8")).items():
            for v, es in vs.items():
                text = " ".join(p[1] for e in es for p in e["p"])
                out[(slug, int(c), int(v))] = bag(re.sub(r"[\[\]<>]", " ", text))
    return out


def tvtms_pairs(path: Path) -> dict:
    """(slug, hebrew c, v) → (latin c, v) from TVTMS's "Ancient Versions"
    column, where both are a plain chapter:verse."""
    code = {b[2]: b[0] for b in BOOKS}
    out: dict = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        cols = line.split("\t")
        if len(cols) < 8:
            continue
        m = re.match(r"^([1-3]?[A-Z][a-z]{1,2})\.", cols[1])
        if not m or m.group(1) not in code:
            continue
        hm = re.search(r"Hebrew=(\d+):(\d+)\s*(?:•|\))", cols[7])
        lm = re.search(r"Latin=(\d+):(\d+)\s*(?:•|\))", cols[7])
        if hm and lm:
            out.setdefault((code[m.group(1)], int(hm.group(1)), int(hm.group(2))), (int(lm.group(1)), int(lm.group(2))))
    return out


def load_map(path: Path) -> dict:
    """`slug c:v[-v] = c:v[-v]` (equal ranges, or a range onto one verse) or
    `= -` for no counterpart; `#` starts a comment; later lines win."""
    out: dict = {}
    if not path.exists():
        return out
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.split("#")[0].strip()
        if not line:
            continue
        m = re.fullmatch(r"([\w-]+) (\d+):(\d+)(?:-(\d+))? = (?:(-)|(\d+):(\d+)(?:-(\d+))?)", line)
        if not m:
            raise ValueError(f"{path.name}:{n}: {raw}")
        slug, c, v1, v2, null, tc, tv1, tv2 = m.groups()
        src = [(int(c), v) for v in range(int(v1), int(v2 or v1) + 1)]
        dst = [None] * len(src) if null else [(int(tc), v) for v in range(int(tv1), int(tv2 or tv1) + 1)]
        if len(dst) == 1:
            dst = dst * len(src)
        if len(dst) != len(src):
            raise ValueError(f"{path.name}:{n}: ranges of different length")
        out.setdefault(slug, {}).update(zip(src, dst))
    return out


# ── Draft and check ───────────────────────────────────────────────────────────


def realign(verses: list, hb_of, english, candidates: list) -> tuple[list, float]:
    """The best order-keeping alignment of a chapter's Hebrew verses onto
    `candidates` (shared addresses in order): each Hebrew verse lands on one
    candidate at or after the previous one's (several may fold onto one), or
    on none. Scored by `score`, less small costs for folding, skipping and
    leaving a verse without a counterpart. Returns targets and total."""
    n, m = len(verses), len(candidates)
    sc = [[score(hb_of(h), english(t)) for t in candidates] for h in verses]
    NONE, FOLD, SKIP = 0.15, 0.2, 0.03
    # best[j]: best total with the last placed verse on candidate j (-1: none yet)
    best = {-1: (0.0, [])}
    for i in range(n):
        nxt: dict = {}
        for last, (total, path) in best.items():
            # this verse has no counterpart
            cand = (total - NONE, path + [None])
            if last not in nxt or cand[0] > nxt[last][0]:
                nxt[last] = cand
            for j in range(max(last, 0), m):
                cost = FOLD if j == last else SKIP * max(0, j - last - 1) if last >= 0 else 0
                cand = (total + sc[i][j] - cost, path + [j])
                if j not in nxt or cand[0] > nxt[j][0]:
                    nxt[j] = cand
        best = nxt
    total, path = max(best.values(), key=lambda x: x[0])
    return [candidates[j] if j is not None else None for j in path], total



def main(src: Path) -> None:
    org = vrs.load(src / "org.vrs")  # noqa: F841  (kept for symmetry: org is the Hebrew)
    vul = vrs.load(src / "vul.vrs")
    tv = tvtms_pairs(src / "tvtms.txt")
    fixed = load_map(HERE / "hebrew-wlc.map")
    bags = gloss_bags()
    report = defaultdict(list)
    verse_map: dict = {}
    scored = []
    englishes = {}
    for slug, _, _, sil in BOOKS:
        hebrew = load_json("hebrew-wlc", slug)
        vulgate = load_json("vulgate", slug)
        drb = load_json("drb", slug)
        shared = {(int(c), int(v)) for c, vs in vulgate.items() for v in vs}

        # The Douay's English at a shared (Vulgate) address. In a few chapters
        # the Douay prints its own numbers (Psalm 115 runs on from 114 as 10–19,
        # Psalm 147 as 12–20); where it has as many verses as the Vulgate, its
        # n-th verse is the Vulgate's n-th.
        renumbered = {}
        for ch in vulgate:
            ds, vs = sorted(map(int, drb.get(ch, {}))), sorted(map(int, vulgate[ch]))
            if ds != vs and len(ds) == len(vs):
                renumbered[int(ch)] = dict(zip(vs, ds))

        def english(at, drb=drb, renumbered=renumbered):  # bound now: kept per book
            if not at:
                return None
            v = renumbered.get(at[0], {}).get(at[1], at[1])
            return drb.get(str(at[0]), {}).get(str(v))

        englishes[slug] = english
        diff: dict = {}
        for c in sorted(hebrew, key=int):
            for v in sorted(hebrew[c], key=int):
                here = (int(c), int(v))
                hb = bags.get((slug, *here), set())
                out = vrs.from_org(vul, sil, *here)
                if out and out[0] == sil:
                    s = (out[1], out[2])
                else:
                    # vul.vrs also maps the Greek Daniel (DAG) onto the Hebrew,
                    # which hides the Vulgate's own Daniel: a verse it sends to
                    # another book keeps its number where the Vulgate has it
                    # and no other verse claims it.
                    s = here if here in shared and (sil, *here) not in vul["to_org"] else None
                t = tv.get((slug, *here))
                if here in fixed.get(slug, {}):
                    target, why = fixed[slug][here], "map"
                elif t and s != t:
                    # The two drafts disagree (or SIL is silent): the text decides.
                    cands = [x for x in (s, t, here) if x and x in shared]
                    best = max(cands, key=lambda x: score(hb, english(x)), default=None)
                    target, why = best, "text"
                    report["disagree"].append(
                        f"{slug} {c}:{v} SIL {s} TVTMS {t} → {best} "
                        + " ".join(f"{x}:{score(hb, english(x)):.2f}" for x in cands)
                    )
                else:
                    target, why = s, "sil"
                if target is not None and target not in shared:
                    report["absent"].append(f"{slug} {c}:{v} → {target} ({why}) not in the Vulgate")
                    target = None
                if target != here:
                    diff[f"{c}:{v}"] = f"{target[0]}:{target[1]}" if target else None
                if target:
                    scored.append((score(hb, english(target)), slug, here, target, why))
        if diff:
            verse_map[slug] = diff

    # Drafted against the Vulgate's numbering, kept in the Douay's: see bible_address.py.
    dump(OUT / "versification.json", to_douay(OUT.name, verse_map), pretty=True)

    # Chapters whose draft reads badly in places: align them on the texts and
    # propose the result where it reads clearly better (proposals only; the
    # accepted ones are copied into hebrew-wlc.map).
    by_chapter = defaultdict(list)
    for sc, slug, here, target, why in scored:
        by_chapter[(slug, here[0])].append((here, target, sc))
    flagged = {(slug, here[0]) for sc, slug, here, target, why in scored
               if sc < 0.2 and len(bags.get((slug, *here), ())) >= 4}
    for slug, c in sorted(flagged, key=lambda k: (BOOKS.index(next(b for b in BOOKS if b[0] == k[0])), k[1])):
        rows = sorted(by_chapter[(slug, c)])
        if sum(1 for _, _, sc in rows if sc < 0.2) < 2:
            continue
        vulgate = load_json("vulgate", slug)
        english = englishes[slug]
        chs = {t[0] for _, t, _ in rows if t}
        cands = [(int(ch), int(v)) for ch in sorted(vulgate, key=int) if min(chs) - 1 <= int(ch) <= max(chs) + 1
                 for v in sorted(vulgate[ch], key=int)]
        heb = [h for h, _, _ in rows]
        draft_total = sum(sc for _, _, sc in rows)
        targets, total = realign(heb, lambda h: bags.get((slug, *h), set()), english, cands)
        report["realign_checked"].append(f"{slug} {c}: draft {draft_total:.2f} aligned {total:.2f}")
        if total > draft_total + 1.0:
            lines = [f"{slug} {h[0]}:{h[1]} = {t[0]}:{t[1]}" if t else f"{slug} {h[0]}:{h[1]} = -"
                     for (h, d, _), t in zip(rows, targets) if t != d]
            report["realign"].append({"chapter": f"{slug} {c}", "draft": round(draft_total, 2),
                                      "aligned": round(total, 2), "lines": lines})

    # Weak matches: verses whose shared address reads least like them, and
    # those a neighbouring address would match much better.
    weak = []
    for sc, slug, here, target, why in scored:
        if sc >= 0.34 or len(bags.get((slug, *here), ())) < 4:
            continue
        drb = load_json("drb", slug)
        best = max(
            (
                (score(bags[(slug, *here)], drb.get(str(target[0] + dc), {}).get(str(target[1] + dv))), (target[0] + dc, target[1] + dv))
                for dc in (-1, 0, 1)
                for dv in range(-3, 4)
            ),
            default=(0, None),
        )
        if best[0] - sc >= 0.3:
            weak.append(f"{slug} {here[0]}:{here[1]} → {target[0]}:{target[1]} ({why}) {sc:.2f}; {best[1]} reads {best[0]:.2f}")
    report["weak"] = weak
    counts = Counter(w for _, _, _, _, w in scored)
    total = sum(1 for _ in scored)
    good = sum(1 for sc, *_ in scored if sc >= 0.34)
    print(f"mapped verses {total} ({dict(counts)}); entries in versification.json "
          f"{sum(len(v) for v in verse_map.values())}; reads like its address (≥0.34): {good}", file=sys.stderr)
    for k, v in report.items():
        print(f"{k}: {len(v)}", file=sys.stderr)
    dump(Path("/tmp/hebtools/vrs-report.json"), report, pretty=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
