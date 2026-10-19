"""Turn a checked range of pages into a corpus book.

    .venv/bin/python assemble.py <work.json>

<work.json> names the volume, the leaf range, the book's place under content/books/
and its metadata (see works/). The pages' drafts (dots/) get their fixes (checked/)
applied, the text is joined across page breaks, and it is cut into one chapter per
heading the author wrote (Præfatio, Articulus …). The table of contents groups
the articles under the running head's chapter of the book being commented on.

Also writes sources/latin-originals/<slug>.txt: every page in order, as corrected,
with the leaf and printed page number between them, so a passage can be traced back
to its scan.
"""

import difflib
import io
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

from apply_fixes import apply, plain_and_mask, render
from run_volumes import data

repo = Path(__file__).resolve().parents[2]

roman = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
ordinals = {"PRIMUS": 1, "SECUNDUS": 2, "TERTIUS": 3, "QUARTUS": 4, "QUINTUS": 5}


def from_roman(s: str) -> int:
    s = s.upper().replace("U", "V").replace("H", "II")  # OCR reads "II" as "H" in running heads
    total = 0
    for a, b in zip(s, s[1:] + " "):
        total += -roman[a] if roman.get(b, 0) > roman[a] else roman[a]
    return total


def page_text(drafts: Path, checked: Path, leaf: str) -> tuple[str, list[str]]:
    draft = (drafts / f"{leaf}.md").read_text()
    fixes_path = checked / f"{leaf}.jsonl"
    fixes = [json.loads(l) for l in fixes_path.read_text().splitlines() if l.strip()] if fixes_path.exists() else []
    text, _ = apply(draft, fixes)
    margin = re.findall(r"<!-- margin: (.*?) -->", text, flags=re.S)
    body = re.sub(r"\s*<!-- margin: .*? -->\s*", "\n", text, flags=re.S).strip()
    return body, margin


def running_head(drafts: Path, leaf: str) -> tuple[str, str]:
    """The running head and printed page number, from the draft's layout blocks."""
    cells = json.loads((drafts / f"{leaf}.raw.txt").read_text())
    heads = [c.get("text", "") for c in cells if c.get("category") == "Page-header"]
    number = next((h for h in heads if re.fullmatch(r"\d+", h.strip())), "")
    title = next((h for h in heads if not re.fullmatch(r"\d+", h.strip())), "")
    return title, number


def ink(zf: zipfile.ZipFile, names: dict, drafts: Path, leaf: str) -> float:
    """Share of dark pixels in the page's text block.

    Picks the better of two captures of one page: a faded, patchy or out-of-focus
    capture loses ink, and its OCR fills the gaps with plausible wrong words (leaf
    0377 of vol. 1 read "iis … cum … solo" where the print has "illis … quum … illo").
    Edge sharpness alone chose wrongly there.
    """
    image = Image.open(io.BytesIO(zf.read(names[leaf]))).convert("L")
    boxes = [c["bbox"] for c in json.loads((drafts / f"{leaf}.raw.txt").read_text()) if c.get("category") == "Text"]
    if not boxes:
        return 0.0
    scale = min(1.0, (4_000_000 / (image.width * image.height)) ** 0.5)
    box = [min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)]
    pixels = np.asarray(image.crop(tuple(round(v / scale) for v in box)), dtype=float)
    return float((pixels < 0.55 * np.median(pixels)).mean())


def tidy(text: str) -> str:
    """Last pass over the joined text: what page breaks, line breaks and fixes leave behind."""
    paragraphs = []
    for p in text.split("\n\n"):
        if not p.startswith("#"):
            # Lines the draft kept inside a paragraph: a hyphen at a line end joins the word.
            p = re.sub(r"-(\*?)\n(\*?)(?=[a-zæœ])", r"\1\2", p).replace("\n", " ")
            # A gutter section letter read in front of an italic run ("D *Habebat").
            p = re.sub(r"\A[A-D] (?=\*)", "", p)
            # Line-end hyphens brought back by fixes ("die- rum").
            p = re.sub(r"(?<=[a-zæœ])- (?=[a-zæœ])", "", p)
            # Rebuild the italics from scratch: markers left by page and line breaks
            # ("ani**mam", "est.* *Adoravit") come out as one balanced run.
            p = render(*plain_and_mask(p))
        paragraphs.append(p)
    return "\n\n".join(paragraphs)


def join_pages(pages: list[str]) -> str:
    """Join the pages into one text, rejoining a paragraph that runs over a page break."""
    text = ""
    for body in pages:
        if not text:
            text = body
            continue
        last_end = text.rstrip()
        if not re.search(r"[.:?!»]\**$", last_end) and not last_end.split("\n")[-1].startswith("#") and re.match(r"\**[a-zæœ]", body):
            text = last_end[:-1] + body if last_end.endswith("-") else f"{last_end} {body}"
        else:
            text = f"{last_end}\n\n{body}"
    return text


def main(work_path: Path) -> None:
    work = json.loads(work_path.read_text())
    volume, (first, last) = work["volume"], work["leaves"]
    drafts, checked = data / "dots" / volume, data / "checked" / volume
    skip = set(work.get("skip_leaves", []))  # bad captures the scanner retook; see the work file
    leaves = sorted(p.stem for p in drafts.glob("*.md") if first <= p.stem <= last and p.stem not in skip)

    pages, source, chapter_of_page = [], [], {}
    missing = [l for l in leaves if not (checked / f"{l}.jsonl").exists()]
    if missing:
        raise SystemExit(f"{len(missing)} pages not checked yet, e.g. {missing[:5]}")
    texts = {leaf: page_text(drafts, checked, leaf) for leaf in leaves}
    # The scanner sometimes retook a spread: the same pages turn up again a few leaves
    # later. Keep whichever capture has more ink; neither the first nor the retake
    # is reliably the good one.
    zf = zipfile.ZipFile(data / "zips" / f"{volume}_jp2.zip")
    names = {Path(n).stem.rsplit("_", 1)[-1]: n for n in zf.namelist() if n.endswith(".jp2")}
    dropped = set()
    for i, leaf in enumerate(leaves):
        start = texts[leaf][0][:600]
        for earlier in leaves[max(0, i - 6):i]:
            if len(start) > 200 and difflib.SequenceMatcher(None, texts[earlier][0][:600], start).ratio() > 0.6:
                worse = min((earlier, leaf), key=lambda l: ink(zf, names, drafts, l))
                dropped.add(worse)
                print(f"leaves {earlier} and {leaf} are the same page; dropping {worse}")
    leaves = [leaf for leaf in leaves if leaf not in dropped]
    numbers = [running_head(drafts, leaf)[1] for leaf in leaves]
    numbers = [int(n) if n else None for n in numbers]
    for i in range(1, len(leaves) - 1):
        a, b, c = numbers[i - 1], numbers[i], numbers[i + 1]
        # A single misread page number is noise; a jump the next page continues is a gap or a repeat.
        if a and b and c and b != a + 1 and c == b + 1:
            print(f"warning: leaf {leaves[i]} is p. {b} after p. {a}; check for a missing or repeated page")
    for leaf in leaves:
        body, margin = texts[leaf]
        head, number = running_head(drafts, leaf)
        source.append(f"--- leaf {leaf}, p. {number or '?'} ---\n{body}" + (f"\n[margin: {' | '.join(margin)}]" if margin else ""))
        # A page with nothing but a number on it is a library stamp or a blank leaf.
        if not body or re.fullmatch(r"[\d\s]+", body):
            continue
        cap = re.search(r"CAP\.\s*([IVXLCUH]+)", head)
        pages.append(body)
        chapter_of_page[len(pages) - 1] = from_roman(cap.group(1)) if cap else None

    # Cut at the author's own headings; the title page's heading is dropped.
    text = join_pages(pages)
    text = tidy(text)
    text = re.sub(work["drop_heading"], "", text)
    parts = re.split(r"^## (PRÆFATIO|ARTICULUS [A-Z]+)\.?\s*$", text, flags=re.M)
    chapters = []
    for heading, body in zip(parts[1::2], parts[2::2]):
        body = re.sub(r"^## ", "### ", body.strip(), flags=re.M)  # sub-headings inside an article
        if heading == "PRÆFATIO":
            chapters.append({"id": "praefatio", "n": 0, "la": "Præfatio", "body": body})
            continue
        word = heading.split()[1]
        n = ordinals.get(word) or from_roman(word)
        chapters.append({"id": f"a{n:03d}", "n": n, "la": f"Articulus {n}", "body": body})

    numbers = [c["n"] for c in chapters if c["n"]]
    gaps = sorted(set(range(1, max(numbers) + 1)) - set(numbers))
    dupes = [n for n, k in Counter(numbers).items() if k > 1]
    if gaps or dupes:
        print(f"warning: articles missing {gaps}, repeated {dupes}")

    # Which chapter of the commented book each article treats: the running head on its pages.
    caps_by_article, current = {}, None
    for i, body in enumerate(pages):
        for m in re.finditer(r"^## (?:ARTICULUS ([A-Z]+))", body, flags=re.M):
            word = m.group(1)
            current = ordinals.get(word) or from_roman(word)
        if current and chapter_of_page.get(i):
            caps_by_article.setdefault(current, Counter())[chapter_of_page[i]] += 1

    out = repo / "content" / "books" / work["path"]
    (out / "la").mkdir(parents=True, exist_ok=True)
    for old in (out / "la").glob("*.md"):
        old.unlink()
    for c in chapters:
        (out / "la" / f"{c['id']}.md").write_text(f"# {c['la']}\n\n{c['body']}\n")
    (out / "sources" / "latin-originals").mkdir(parents=True, exist_ok=True)
    (out / "sources" / "latin-originals" / f"{work['slug']}.txt").write_text("\n\n".join(source) + "\n")

    label = work["toc_group"]
    toc, group = [], None
    for c in chapters:
        node = {"id": c["id"], "title": {"la": c["la"], "en-US": c["la"].replace("Articulus", "Article").replace("Præfatio", "Preface"),
                                         "pt-BR": c["la"].replace("Articulus", "Artigo").replace("Præfatio", "Prefácio")}}
        cap = caps_by_article.get(c["n"], Counter()).most_common(1)
        if not cap:
            toc.append(node)
            group = None
            continue
        if not group or group["n"] != cap[0][0]:
            n = cap[0][0]
            group = {"id": f"cap{n:02d}", "n": n, "title": {k: v.format(n=n) for k, v in label.items()}, "children": []}
            toc.append(group)
        group["children"].append(node)
    for g in toc:
        g.pop("n", None)
    meta = {**work["meta"], "languages": ["la"], "toc": toc}
    (out / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
    words = sum(len(c["body"].split()) for c in chapters)
    print(f"{work['path']}: {len(chapters)} chapters, {words:,} words, {len(pages)} pages")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
