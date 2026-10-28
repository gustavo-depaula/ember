"""Turn a checked range of pages into a corpus book.

    .venv/bin/python assemble.py <work.json>...

A work file with `volume` and `leaves` is the proofread pilot (Genesis), cut at
its articles. One with `parts` comes from catalogue.py and may be an unchecked
draft; it is cut by `split_chapters`, which reads the work's own headings.

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
from catalogue import roman as roman_numeral
from ocr_local import in_margin, only_references, scripture_ref, text_cells
from run_volumes import data, volume_zip
from snap_notes import snap

repo = Path(__file__).resolve().parents[2]

roman = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
ordinals = {"PRIMUS": 1, "SECUNDUS": 2, "TERTIUS": 3, "QUARTUS": 4, "QUINTUS": 5}


def from_roman(s: str) -> int:
    s = s.upper().replace("U", "V").replace("H", "II")  # OCR reads "II" as "H" in running heads
    total = 0
    for a, b in zip(s, s[1:] + " "):
        total += -roman[a] if roman.get(b, 0) > roman[a] else roman[a]
    return total


# The margin notes become footnotes. Until the text is cut into chapters, each sits
# in it as a token, "\ue000<n>\ue001" (private-use characters, so no rule that
# reads the text mistakes it for a word or punctuation), indexing this list.
notes: list[str] = []
note_token = re.compile("\ue000(\\d+)\ue001")


def keep_note(text: str) -> bool:
    """Not the gutter's section letters, a stray verse number, or a Google scan's notice."""
    return not re.fullmatch(r"[A-Z]?[\d\s.,*']*", text) and "We also ask" not in text and "Google" not in text


page_images: dict[str, tuple[zipfile.ZipFile, dict]] = {}


def page_image(volume: str, leaf: str) -> Image.Image | None:
    if volume not in page_images:
        zf = zipfile.ZipFile(volume_zip(volume))
        page_images[volume] = zf, {Path(n).stem.rsplit("_", 1)[-1]: n for n in zf.namelist() if n.endswith((".jp2", ".tif"))}
    zf, names = page_images[volume]
    return Image.open(io.BytesIO(zf.read(names[leaf]))).convert("L") if leaf in names else None


def word_fraction(image: Image.Image, bbox: list, y: float) -> float | None:
    """How far into a text block, in words, the printed line at height `y` falls.

    Read off the scan: the block's lines are the bands of rows with ink, its words
    the runs of ink between gaps wider than about half a line's height. Counting
    words rather than characters matters because italic lines hold more of them.
    """
    scale = min(1.0, (4_000_000 / (image.width * image.height)) ** 0.5)  # the frame dots.mocr saw
    x0, y0, x1, y1 = (round(v / scale) for v in bbox)
    if x1 <= x0 or y1 <= y0:  # dots.mocr now and then gives a box inside out
        return None
    crop = np.asarray(image.crop((x0, y0, x1, y1)), dtype=float)
    if crop.size == 0:
        return None
    dark = crop < 0.6 * np.median(crop)
    lines, start = [], None
    for i, inked in enumerate(list(dark.mean(1) > 0.02) + [False]):
        if inked and start is None:
            start = i
        elif not inked and start is not None:
            if i - start > 8:
                lines.append((start, i))
            start = None
    if not lines:
        return None
    gap = 0.55 * float(np.median([b - a for a, b in lines]))
    counts = []
    for a, b in lines:
        n, run = 0, gap
        for inked in dark[a:b].any(0):
            if inked:
                n += run >= gap
                run = 0
            else:
                run += 1
        counts.append(n)
    target = y / scale - y0
    line = min(range(len(lines)), key=lambda i: abs((lines[i][0] + lines[i][1]) / 2 - target))
    return (sum(counts[:line]) + counts[line] / 2) / max(1, sum(counts))


def margin_anchors(drafts: Path, leaf: str, draft: str, fixes: list[dict], corrected: str) -> list[tuple]:
    """Each margin note of the page, with what says where it belongs.

    A note printed in the margin belongs to the line beside it: the block it is
    level with, at the same fraction of that block's height ("span": the block's
    text and the fraction). One the proofreader took out of the body, a reference
    read into the text, belongs where it was ("at": its place in the draft),
    unless the layout shows it as a block of its own in the margin.
    """
    leaked = {squeeze(f["margin"]) for f in fixes if "margin" in f}
    try:
        cells, _ = text_cells((drafts / f"{leaf}.raw.txt").read_text())
    except (ValueError, KeyError, TypeError):
        cells = []
    widest = max((c["bbox"][2] - c["bbox"][0] for c in cells if c["category"] == "Text"), default=0)
    image = None

    def margin(c: dict) -> bool:
        # The median block can itself be a note (a page with many), so measure against the widest.
        narrow = c["bbox"][2] - c["bbox"][0] < widest * 0.3
        text = c.get("text", "").strip()
        return c["category"] == "Text" and (only_references(text) or narrow) and (in_margin(c, 0) or squeeze(text) in leaked or narrow)

    body = [c for c in cells if c["category"] in ("Text", "List-item") and not margin(c)]
    anchors, seen = [], set()
    in_body = squeeze(corrected)
    for cell in cells:
        if not margin(cell):
            continue
        text = " ".join(cell.get("text", "").split())
        if squeeze(text) in in_body:  # still in the text (a draft, or a note the proofreader left): not a footnote too
            continue
        # One block can hold a column of references: split it where the next one starts.
        refs = re.split(r"(?<=[.;])\s+(?=(?:[IV]{1,3}\s+|\d\s*)?[A-Z][a-zæœ]{1,8}\.)", text) if only_references(text) else [text]
        x0, y0, x1, y1 = cell["bbox"]
        for k, ref in enumerate(refs):
            if not keep_note(ref):
                continue
            seen.add(squeeze(ref))
            y = y0 + (k + 0.5) / len(refs) * (y1 - y0)
            if not body:
                anchors.append(("at", None, ref))
                continue
            block = min(body, key=lambda b: (0 if b["bbox"][1] <= y <= b["bbox"][3] else abs(y - b["bbox"][1]),
                                             max(b["bbox"][0] - x1, x0 - b["bbox"][2], 0)))
            words, after = (re.sub(r"(?<=[a-zæœ])-\s?(?=[a-zæœ])", "", re.sub(r"\A[A-D] ", "", b.get("text", "").replace("*", "")))
                            for b in (block, body[body.index(block) + 1] if block is not body[-1] else {}))
            image = image or page_image(drafts.name, leaf)
            fraction = word_fraction(image, block["bbox"], y) if image else None
            if fraction is None:
                fraction = min(1.0, max(0.0, (y - block["bbox"][1]) / max(1, block["bbox"][3] - block["bbox"][1])))
            starts = [m.start() for m in re.finditer(r"\S+", words)] or [0]
            anchors.append(("span", words, after, fraction, locate(draft, words, starts[min(len(starts) - 1, int(fraction * len(starts)))]), ref))
    # The proofreader also lists, now and then, a note that was in the margin all along.
    for fix in fixes:
        if "margin" not in fix or not keep_note(fix["margin"]) or squeeze(fix["margin"]) in in_body:
            continue
        pieces = re.split(r"(?<=[.;])\s+(?=(?:[IV]{1,3}\s+|\d\s*)?[A-Z][a-zæœ]{1,8}\.)", fix["margin"])
        # Or a piece of one ("cal. parad." of "cal. parad. ad. xxv."), which is not a note of its own.
        if any(squeeze(p) in note for p in pieces for note in seen) or squeeze(fix["margin"]) in seen:
            continue
        seen.add(squeeze(fix["margin"]))
        anchors.append(("at", loose_find(draft, fix.get("find", fix["margin"]).replace("*", "")), fix["margin"]))
    # The margin read both whole and in pieces: a note that is part of another on the page is not one of its own.
    keys = [squeeze(a[-1]) for a in anchors]
    return [a for a, k in zip(anchors, keys) if not any(k != other and k in other for other in keys)]


def squeeze(text: str) -> str:
    """A note's text for comparison: "Ibid. XVI, 18;" and "* habitan- tibus" as the proofreader may write them."""
    return re.sub(r"[\s.,;*-]", "", text).lower()


def loose_find(text: str, needle: str) -> int | None:
    """`needle` in `text`, whatever the case and spacing ("Matth. XIV, 3" for "Matth. xiv,3")."""
    words = [re.escape(w) for w in needle.split()]
    m = re.search(r"\s*".join(words), text, flags=re.I) if words else None
    return m.start() if m else None


def locate(text: str, source: str, at: int) -> int | None:
    """Where position `at` of `source` (a block, or an earlier version of the page) falls in `text`."""
    for width in (40, 24, 14):
        for probe, offset in ((source[max(0, at - width):at], 0), (source[at:at + width], None)):
            if len(probe) < 8 or text.count(probe) != 1:
                continue
            start = text.index(probe)
            return start + len(probe) if offset == 0 else start
    match = difflib.SequenceMatcher(None, text, source, autojunk=False).find_longest_match(0, len(text), 0, len(source))
    return min(len(text), max(0, match.a + at - match.b)) if match.size >= 8 else None


def sentence_end(text: str, at: int, moves: int = 0) -> int:
    """The end of the sentence (or clause) running at `at`, within its paragraph; never in a heading."""
    line = text.rfind("\n", 0, at) + 1
    if moves > 4:  # sent back and forth between headings and scraps: before the headings
        return before_headings(text, line)
    if text.startswith("#", line):  # a heading: the note goes with the text after it, or before it at a page's end
        nxt = text.find("\n", at)
        rest = text[nxt:].strip() if nxt >= 0 else ""
        return sentence_end(text, nxt + len(text[nxt:]) - len(text[nxt:].lstrip()), moves + 1) if rest else before_headings(text, line)
    start = text.rfind("\n\n", 0, at) + 2 if "\n\n" in text[:at] else 0
    ends = [i for i in (text.find("\n\n", at), text.find("\n#", at)) if i >= 0]
    end = min(ends) if ends else len(text)
    paragraph = text[start:end].strip()
    def scrap(p: str) -> bool:
        return only_references(p) or not re.search(r"[A-Za-zæœ]{2}", p)

    if start >= 2 and scrap(paragraph):
        # Scraps left in the body (references, a page number): the paragraph before them.
        while start >= 2:
            before = text.rfind("\n\n", 0, start - 2)
            prev_start = before + 2 if before >= 0 else 0
            if not scrap(text[prev_start:start - 2]):
                return sentence_end(text, start - 2, moves + 1)
            start = prev_start
        return at
    for m in re.finditer(r"[.?!;:](?=\s|$)", text[at:end]):
        word = re.search(r"(\S+)$", text[:at + m.start()])
        # Not after an abbreviation ("S. Thomas", "cap. II.", "Is. ix") or a numeral.
        if m.group(0) == "." and word and re.fullmatch(r"[A-Z][a-zæœ]{0,4}|[IVXLCivxlc\d,]+|cap|art|lib|dist|part|q|v|n|c|p|t|cf|vers|ibid|seq|sec", word.group(1).strip("*(")):
            continue
        return at + m.end()
    if text[:end].rstrip().endswith("-") and end < len(text):  # a word broken here goes on below
        return sentence_end(text, end + len(text[end:]) - len(text[end:].lstrip()), moves + 1)
    return len(text[:end].rstrip())


def before_headings(text: str, line: int) -> int:
    """The end of the text before the run of heading lines that `line` starts or is in."""
    while True:
        end = len(text[:line].rstrip())
        previous = text.rfind("\n", 0, end) + 1
        if not end or not text.startswith("#", previous):
            return end
        line = previous


def place_notes(draft: str, body: str, anchors: list[tuple]) -> str:
    """The corrected page with a token at the end of the sentence each note belongs to."""
    # Fixes that took text out leave runs of blank lines.
    plain, mask = plain_and_mask(re.sub(r"\n{3,}", "\n\n", body).strip())
    draft_plain = plain_and_mask(draft)[0]
    placed = []
    for anchor in anchors:
        where = None
        if anchor[0] == "span":
            # Measured in the corrected text: the draft can lack lines the proofreader restored.
            # The block runs to where the next one starts: dots sometimes drops a block's
            # last lines, which the proofreader puts back.
            _, words, after, fraction, at, note = anchor
            start, end = locate(plain, words, 0), locate(plain, words, len(words))
            following = locate(plain, after, 0) if len(after) >= 8 else None
            if start is not None and following is not None and following > start and (end is None or following > end):
                end = following
            if start is not None and end is not None and end > start:
                starts = [m.start() for m in re.finditer(r"\S+", plain[start:end])] or [0]
                where = start + starts[min(len(starts) - 1, int(fraction * len(starts)))]
            elif at is not None:
                where = locate(plain, draft_plain, at)
        else:
            _, at, note = anchor
            where = locate(plain, draft_plain, at) if at is not None else None
        if where is None:  # nothing to go by: the end of the page's last paragraph
            where = len(plain.rstrip())
        placed.append((sentence_end(plain, where), note))
    for where, note in sorted(placed, key=lambda p: p[0], reverse=True):
        notes.append(note)
        token = f"\ue000{len(notes) - 1}\ue001"
        plain = plain[:where] + token + plain[where:]
        # In the italics of the text before it, so the run is not broken around the mark.
        mask[where:where] = [bool(where) and mask[where - 1]] * len(token)
    return render(plain, mask)


def with_footnotes(body: str) -> str:
    """A chapter's tokens as numbered footnotes, defined at its end."""
    defined = []

    def mark(m: re.Match) -> str:
        defined.append(notes[int(m.group(1))])
        return f"[^{len(defined)}]"

    body = note_token.sub(mark, body)
    if not defined:
        return body
    lines = [f"[^{i}]: " + " ".join(n.split()).replace("*", r"\*").replace("[", r"\[") for i, n in enumerate(defined, 1)]
    return body.rstrip() + "\n\n" + "\n".join(lines)


def untable(body: str) -> str:
    """Text dots.mocr read as an HTML table, back to paragraphs.

    It now and then takes a stretch of a two-column page, margin references and
    all, for a table. The app shows a table's cells without reading their
    Markdown, and the footnote marks in them are lost. Text cells become
    paragraphs in reading order; reference cells, footnotes on the text before them.
    """
    def paragraphs(m: re.Match) -> str:
        out: list[str] = []
        held = ""  # references before the first text cell go with it
        for cell in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", m.group(0), flags=re.S):
            text = " ".join(re.sub(r"<[^>]+>", " ", cell).split())
            if not text:
                continue
            if only_references(text.replace("*", "")) and keep_note(text):
                notes.append(text.replace("*", ""))
                token = f"\ue000{len(notes) - 1}\ue001"
                if out:
                    out[-1] += token
                else:
                    held += token
            else:
                out.append(text + held)
                held = ""
        return "\n\n".join(out) + held
    return re.sub(r"<table\b.*?</table>", paragraphs, body, flags=re.S)


def page_text(drafts: Path, checked: Path, leaf: str) -> tuple[str, list[str]]:
    draft = (drafts / f"{leaf}.md").read_text()
    fixes_path = checked / f"{leaf}.jsonl"
    fixes = [json.loads(l) for l in fixes_path.read_text().splitlines() if l.strip()] if fixes_path.exists() else []
    text, _ = apply(draft, fixes)
    margin = re.findall(r"<!-- margin: (.*?) -->", text, flags=re.S)
    body = re.sub(r"\s*<!-- margin: .*? -->\s*", "\n", text, flags=re.S).strip()
    draft_body = re.sub(r"\s*<!-- margin: .*? -->\s*", "\n", draft, flags=re.S).strip()
    body = place_notes(draft_body, body, margin_anchors(drafts, leaf, plain_and_mask(draft_body)[0], fixes, plain_and_mask(body)[0]))
    return untable(body), margin


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
            # A gutter letter read into a word broken at the line end ("fructificanti- B bus"),
            # or between two words ("semel et B iterum"): Latin has no lone capital there.
            p = re.sub(r"(?<=[a-zæœ])- [A-D] (?=\**[a-zæœ])", "- ", p)
            p = re.sub(r"(?<=[a-zæœ,;:]) [A-D] (?=\**[a-zæœ])", " ", p)
            # Line-end hyphens brought back by fixes ("die- rum").
            p = re.sub(r"(?<=[a-zæœ])- (?=\**[a-zæœ])", "", p)
            # Rebuild the italics from scratch: markers left by page and line breaks
            # ("ani**mam", "est.* *Adoravit") come out as one balanced run.
            p = render(*whole_words(*plain_and_mask(p)))
        paragraphs.append(p)
    return "\n\n".join(paragraphs)


def whole_words(plain: str, mask: list[bool]) -> tuple[str, list[bool]]:
    """Italics by whole words: a run the proofreader began or ended inside a word
    (at a page or column break, "pleni*tudine", "*Lavi pe*des") covers the word."""
    for m in re.finditer(r"[^\W\d_]+", plain):
        if any(mask[m.start():m.end()]):
            mask[m.start():m.end()] = [True] * (m.end() - m.start())
    return plain, mask


def reference_scrap(paragraph: str) -> bool:
    """A bit of a margin reference left in the body ("iv, 32.", "d. c. 8.", "cle. v, 4. Decret. II, caus.")."""
    words = note_token.sub("", paragraph).replace("*", "").split()
    if not words or len(paragraph) > 120:
        return False
    abbreviated = [w for w in words if re.fullmatch(r"[\w]{1,7}[.,;]|[\divxlcIVXLC]+[.,;-]?\d*[.,;]?", w)]
    return len(abbreviated) >= 0.7 * len(words)


def mend(text: str) -> str:
    """Rejoin paragraphs the text's column and page breaks split.

    The edition never starts a paragraph in lower case, so one that does goes on
    from the paragraph before (unless that is a heading). A scrap of margin
    reference left in the body becomes a footnote on the paragraph before it.
    """
    out: list[str] = []
    for p in text.split("\n\n"):
        if out and not out[-1].lstrip().startswith("#") and re.match(r"\**[a-zæœ]", p):
            if reference_scrap(p):
                notes.append(" ".join(note_token.sub("", p).split()))
                out[-1] += f"\ue000{len(notes) - 1}\ue001"
                continue
            out[-1] = out[-1][:-1] + p if out[-1].endswith("-") else f"{out[-1]} {p}"
            continue
        out.append(p)
    return "\n\n".join(out)


def join_pages(pages: list[str]) -> str:
    """Join the pages into one text, rejoining a paragraph that runs over a page break."""
    text = ""
    for body in pages:
        if not text:
            text = body
            continue
        last_end = text.rstrip()
        # Notes at the foot of a page go after the sentence the next page finishes,
        # so they cannot keep a word broken over the page ("di-" + "citur") apart.
        held = re.search(r"(\ue000\d+\ue001)+$", last_end)
        if held and not re.search(r"[.:?!»]\**$", last_end[:held.start()]) and re.match(r"\**[a-zæœ]", body):
            last_end = last_end[:held.start()]
            end = re.search(r"[.?!;:]\**(?=\s|$)|\n\n|$", body)
            body = body[:end.end()] + held.group(0) + body[end.end():] if end.group(0) != "\n\n" else body[:end.start()] + held.group(0) + body[end.start():]
        if not re.search(r"[.:?!»]\**(\ue000\d+\ue001)*$", last_end) and not last_end.split("\n")[-1].startswith("#") and re.match(r"\**[a-zæœ]", body):
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
    zf = zipfile.ZipFile(volume_zip(volume))
    names = {Path(n).stem.rsplit("_", 1)[-1]: n for n in zf.namelist() if n.endswith((".jp2", ".tif"))}
    dropped = set()
    for i, leaf in enumerate(leaves):
        start = note_token.sub("", texts[leaf][0])[:600]
        for earlier in leaves[max(0, i - 6):i]:
            if len(start) > 200 and difflib.SequenceMatcher(None, note_token.sub("", texts[earlier][0])[:600], start).ratio() > 0.6:
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
        source.append(f"--- leaf {leaf}, p. {number or '?'} ---\n{note_token.sub('', body)}" + (f"\n[margin: {' | '.join(margin)}]" if margin else ""))
        # A page with nothing but a number on it is a library stamp or a blank leaf.
        if not body or re.fullmatch(r"[\d\s]+", body):
            continue
        cap = re.search(r"CAP\.\s*([IVXLCUH]+)", head)
        pages.append(body)
        chapter_of_page[len(pages) - 1] = from_roman(cap.group(1)) if cap else None

    # Cut at the author's own headings; the title page's heading is dropped.
    text = join_pages(pages)
    text = mend(tidy(text))
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
        (out / "la" / f"{c['id']}.md").write_text(snap(f"# {c['la']}\n\n{with_footnotes(c['body'])}\n", Counter()))
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


# Headings that open a chapter, by the word they start with. The most frequent of
# the main kinds in a work is its chapter; the others group chapters (the
# Areopagite's capitula hold Denis's articles, Cassian's books hold capitula).
main_units = ("ARTICULUS", "SERMO", "QUÆSTIO", "CAPITULUM", "COLLATIO", "PROPOSITIO", "LAUS")
# Chapter kinds headed by a phrase rather than a number ("Laus Dei ut bonus").
phrase_units = ("LAUS",)
front_units = re.compile(r"^(PRÆFATIO|PRÆFATIUNCULA|PROŒMIUM|PROOEMIUM|PROLOGUS|EPISTOLA NUNCUPATORIA|EPISTOLA DEDICATORIA|ENARRATIO IN (EVANGELIUM|EPISTOLAM)|EPILOGUS|CONCLUSIO|PROTESTATIO|ENARRATIO IN PSALMUM|VITA$|ELENCHUS$|REVELATIONES|DE RELIQUIIS)\b")
# Group headings, outermost first.
group_levels = [
    re.compile(r"^(LIBER|PARS|TRACTATUS)\s+[IVXLCA-Z]+\b"),
    re.compile(r"^(DISTINCTIO|GRADUS|PROSA|METRUM|COLLATIO|CAPITULUM|PSALMUS|DOMINICA|FERIA|COMMUNE|IN (FESTO|DIE|SOLENNITATE|NOCTE|VIGILIA|NATIVITATE|DIEBUS|OCTAVA)|AD (SECUNDAM|SUMMAM) MISSAM|EXPOSITIO HYMNI)\b"),
]
# A heading that belongs at the head of the next chapter ("Ad religiosos; Sermo sextus").
carried = re.compile(r"^(AD RELIGIOSOS|AD SÆCULARES)\b", re.I)

ordinal_stems = {"PRIM": 1, "SECUND": 2, "TERT": 3, "QUART": 4, "QUINT": 5, "SEXT": 6, "SEPTIM": 7, "OCTAV": 8,
                 "NON": 9, "DECIM": 10, "UNDECIM": 11, "DUODECIM": 12}
unit_words = {
    "ARTICULUS": ("Articulus", "Article", "Artigo"), "SERMO": ("Sermo", "Sermon", "Sermão"),
    "QUÆSTIO": ("Quæstio", "Question", "Questão"), "CAPITULUM": ("Capitulum", "Chapter", "Capítulo"),
    "COLLATIO": ("Collatio", "Conference", "Conferência"), "LIBER": ("Liber", "Book", "Livro"),
    "PARS": ("Pars", "Part", "Parte"), "TRACTATUS": ("Tractatus", "Treatise", "Tratado"),
    "DISTINCTIO": ("Distinctio", "Distinction", "Distinção"), "GRADUS": ("Gradus", "Step", "Degrau"),
    "PROSA": ("Prosa", "Prose", "Prosa"), "METRUM": ("Metrum", "Metre", "Metro"),
    "PSALMUS": ("Psalmus", "Psalm", "Salmo"), "PRÆFATIO": ("Præfatio", "Preface", "Prefácio"),
    "PROŒMIUM": ("Proœmium", "Proem", "Proêmio"), "PROOEMIUM": ("Proœmium", "Proem", "Proêmio"),
    "PROLOGUS": ("Prologus", "Prologue", "Prólogo"), "PROPOSITIO": ("Propositio", "Proposition", "Proposição"), "PRÆFATIUNCULA": ("Præfatiuncula", "Short Preface", "Breve prefácio"),
}
proper = {"DEI", "DEUS", "DEO", "DEUM", "DOMINI", "DOMINUS", "DOMINO", "CHRISTI", "CHRISTUS", "JESU", "JESUS", "MARIÆ", "MARIA",
          "SPIRITUS", "SANCTI", "TRINITATIS", "PASCHÆ", "PASCHA", "PENTECOSTES", "ADVENTUS", "EPIPHANIÆ", "QUADRAGESIMÆ",
          "SEPTUAGESIMÆ", "SEXAGESIMÆ", "QUINQUAGESIMÆ", "TRINITATEM", "ASCENSIONEM", "ASCENSIONIS", "NATIVITATEM", "PASSIONIS",
          "PALMARUM", "CRUCIS", "CORPORIS", "ECCLESIÆ", "ISRAEL", "PATRUM", "SS.", "S.", "B.", "V.", "D.", "N."}


def heading_number(rest: str) -> int | None:
    word = rest.split()[0].rstrip(".,:") if rest.split() else ""
    if re.fullmatch(r"[IVXLCUH]+", word):
        return from_roman(word)
    stem = next((n for s, n in sorted(ordinal_stems.items(), key=lambda kv: -len(kv[0])) if word.startswith(s)), None)
    return stem


def latin_case(text: str) -> str:
    """'IN FESTO S. ANDREÆ APOSTOLI' → 'In festo S. Andreæ apostoli'."""
    words, out, after_title = text.split(), [], False
    for i, w in enumerate(words):
        bare = w.strip(",.;:()").upper()
        keep = i == 0 or after_title or bare in proper or re.fullmatch(r"[IVXLC]+", bare)
        out.append(w if re.fullmatch(r"[IVXLC]+[.,;:]?", w) else (w[:1].upper() + w[1:].lower()) if keep else w.lower())
        after_title = bare in {"S.", "SS.", "B.", "BB.", "D.", "V."}
    return " ".join(out)


def heading_titles(heading: str) -> dict:
    """The three titles of a chapter or group heading: 'ARTICULUS XII.' → Articulus 12 / Article 12 / Artigo 12."""
    clean = re.sub(r"[*¹²³⁴⁵⁶⁷⁸⁹⁰]", "", heading).strip().rstrip(".")
    first, _, rest = clean.partition(" ")
    word = first.upper().replace("OE", "Œ") if first.upper() == "PROOEMIUM" else first.upper()
    if word in unit_words:
        n = heading_number(rest)
        tail = rest.split(" ", 1)[1].strip(" .,—-") if n and " " in rest else ("" if n else rest)
        la, en, pt = unit_words[word]
        if re.match(r"UNIC", rest.upper()):
            la, en, pt, tail = f"{la} unica", f"Single {en.lower()}", f"{pt} única", ""
        if n:
            la, en, pt = f"{la} {n}", f"{en} {n}", f"{pt} {n}"
        if tail:
            tail = latin_case(tail)
            return {"la": f"{la}: {tail}", "en-US": f"{en}: {tail}", "pt-BR": f"{pt}: {tail}"}
        return {"la": la, "en-US": en, "pt-BR": pt}
    title = latin_case(clean)
    return {"la": title, "en-US": title, "pt-BR": title}


def heading_kind(unit: str | None):
    """Classify a heading: ("unit"|"group"|"carry"|"sub", group level)."""
    def kind(heading: str) -> tuple[str, int | None]:
        upper = re.sub(r"[*¹²³⁴⁵⁶⁷⁸⁹⁰]", "", heading).upper().strip()
        if unit in phrase_units and upper.startswith(unit):
            return "unit", None
        if unit and re.match(rf"{unit}\b\s*([IVXLCUH]+\b|(?:{'|'.join(ordinal_stems)})|UNIC|$)", upper):
            return "unit", None
        if front_units.match(upper):
            return "unit", None
        if carried.match(upper):
            return "carry", None
        for level, pattern in enumerate(group_levels):
            if pattern.match(upper) and not (unit and upper.startswith(unit)):
                return "group", level
        return "sub", None
    return kind


def chapter_kind(text: str) -> str | None:
    """The work's chapter heading: the most frequent of the main kinds."""
    counts = Counter(h.split()[0].rstrip(".").upper() for h in re.findall(r"^## (.+)$", text, flags=re.M) if h.split())
    unit = max(main_units, key=lambda k: counts.get(k, 0))
    return unit if counts.get(unit) else None


opening = {"la": "Initium", "en-US": "Opening", "pt-BR": "Abertura"}


def split_chapters(text: str) -> tuple[list[dict], list[dict]]:
    """Cut the joined text at its headings into chapters, and the table of contents that nests them.

    A chapter starts at a heading of the work's chapter kind or a preface. Group
    headings (Liber, Distinctio, Dominica …) open a TOC group; text right under
    one, before its first chapter, becomes a chapter under the group's title.
    Other headings stay inside their chapter, one level down. Each chapter
    opened by a heading carries `unit`, its place among those headings, so the
    running heads of the pages can be matched to it.
    """
    kind = heading_kind(chapter_kind(text))
    chapters, toc, stack = [], [], []
    current, pending, carry, buffer, units = None, None, [], [], 0

    def place(node: dict) -> None:
        (stack[-1][1]["children"] if stack else toc).append(node)

    def open_chapter(title: dict, unit: int | None = None) -> dict:
        chapter = {"title": title, "lines": carry + buffer, "unit": unit}
        carry.clear()
        buffer.clear()
        chapters.append(chapter)
        place({"chapter": chapter})
        return chapter

    for line in text.split("\n"):
        m = re.match(r"^## (.+)$", line)
        if not m:
            if current:
                current["lines"].append(line)
            elif line.strip():
                buffer.append(line)
                current = open_chapter(pending["title"] if pending else opening)
                pending = None
            continue
        heading = m.group(1).strip()
        what, level = kind(heading)
        if what == "unit":
            units += 1
            current, pending = open_chapter(heading_titles(heading), units), None
        elif what == "group":
            while stack and stack[-1][0] >= level:
                stack.pop()
            node = {"title": heading_titles(heading), "children": []}
            place(node)
            stack.append((level, node))
            current, pending = None, node
        elif what == "carry":
            carry.append(f"### {latin_case(re.sub(r'[*]', '', heading).rstrip('.'))}")
        else:
            (current["lines"] if current else buffer).append(f"### {heading}")

    def prune(nodes: list) -> list:
        out = []
        for n in nodes:
            if "children" in n:
                n["children"] = prune(n["children"])
                if not n["children"]:
                    continue
            out.append(n)
        return out

    return chapters, prune(toc)


def dedupe_retakes(volume: str, leaves: list[str], texts: dict) -> list[str]:
    """Drop the worse of two captures of one page (see `ink`)."""
    zf = zipfile.ZipFile(volume_zip(volume))
    names = {Path(n).stem.rsplit("_", 1)[-1]: n for n in zf.namelist() if n.endswith((".jp2", ".tif"))}
    drafts = data / "dots" / volume
    dropped = set()
    def start(leaf: str) -> str:
        return note_token.sub("", texts[leaf][0])[:600]

    for i, leaf in enumerate(leaves):
        if len(start(leaf)) <= 200:
            continue
        for earlier in leaves[max(0, i - 6):i]:
            if earlier in dropped:
                continue
            if difflib.SequenceMatcher(None, start(earlier), start(leaf)).ratio() > 0.6:
                worse = min((earlier, leaf), key=lambda l: ink(zf, names, drafts, l))
                dropped.add(worse)
    return [leaf for leaf in leaves if leaf not in dropped]


def first_chapter(node: dict) -> dict | None:
    """The node's first chapter opened by a heading of the chapter kind (the one running heads can be matched to)."""
    if "chapter" in node:
        return node["chapter"] if node["chapter"]["unit"] else None
    return next((c for n in node["children"] if (c := first_chapter(n))), None)


def group_by_head(pages: list, kind, toc: list, pattern: str, label: dict, by_first: bool = False) -> list:
    """Wrap the top-level TOC nodes in groups numbered by the running heads of their pages.

    A chapter's number is the one most of its pages' heads give (`by_first`: the
    first page's, for a book, where the last pages of one carry the next's head).
    Consecutive nodes with the same number share a group; a node with none stays put.
    """
    numbers, unit = {}, 0
    for body, head in pages:
        m = re.search(pattern, head.upper())
        for h in re.findall(r"^## (.+)$", body, flags=re.M):
            if kind(h.strip())[0] == "unit":
                unit += 1
        if m and unit:
            numbers.setdefault(unit, Counter())[from_roman(m.group(1))] += 1
    grouped, group = [], None
    for node in toc:
        chapter = first_chapter(node)
        counts = numbers.get(chapter["unit"]) if chapter and chapter["unit"] else None
        if not counts:
            (group["children"] if group else grouped).append(node)
            continue
        n = next(iter(counts)) if by_first else counts.most_common(1)[0][0]
        if not group or group["n"] != n:
            if group and by_first and n < group["n"]:
                group["children"].append(node)  # a stray head; books only go forward
                continue
            group = {"n": n, "title": {k: v.format(n=n) for k, v in label.items()}, "children": []}
            grouped.append(group)
        group["children"].append(node)
    # Chapters before the first group whose heads were missed open the first book.
    first = next((i for i, g in enumerate(grouped) if "n" in g), None)
    if first:
        lead = [n for n in grouped[:first] if (c := first_chapter(n)) and c["unit"] and not front_units.match(c["title"]["la"].upper())]
        grouped[first]["children"][:0] = lead
        grouped = [n for n in grouped[:first] if not any(n is l for l in lead)] + grouped[first:]
    for g in grouped:
        g.pop("n", None)
    return grouped


def merge_short(chapters: list, toc: list) -> list:
    """Fold a chapter with almost no text (a title page, a bare heading) into the next one."""
    def body(c):
        return re.sub(r"^#.*$", "", "\n".join(c["lines"]), flags=re.M).strip()
    dropped = set()
    for a, b in zip(chapters, chapters[1:]):
        if len(body(a)) < 300:
            b["lines"] = a["lines"] + [""] + b["lines"]
            if b["unit"] is None:
                b["unit"] = a["unit"]
            dropped.add(id(a))
    chapters[:] = [c for c in chapters if id(c) not in dropped]

    def prune(nodes):
        out = []
        for n in nodes:
            if "chapter" in n:
                if id(n["chapter"]) not in dropped:
                    out.append(n)
            else:
                n["children"] = prune(n["children"])
                if n["children"]:
                    out.append(n)
        return out
    return prune(toc)


def lacunae(volume: str) -> dict[str, tuple[str, str]]:
    """The volume's known gaps (gaps.tsv) as {leaf: (where, note)}: "at" the leaf for an
    unreadable page, "after" it for pages the scan skipped. The note is printed in the text."""
    found = {}
    for line in (Path(__file__).parent / "gaps.tsv").read_text().splitlines()[1:]:
        v, tomus, leaf, kind, before, after, note = (line.split("\t") + [""] * 7)[:7]
        if v != volume or note.startswith("Not a gap"):
            continue
        tome = roman_numeral(int(tomus))
        if kind == "unreadable":
            page = int(before) + 1 if before else int(after) - 1
            found[leaf] = ("at", f"> *Lacuna: p. {page} of tome {tome} cannot be read in the scan, so its text is missing here.*")
        elif kind == "missing":
            pages = range(int(before) + 1, int(after))
            span = f"p. {pages[0]}" if len(pages) == 1 else f"pp. {pages[0]}–{pages[-1]}"
            found[leaf] = ("after", f"> *Lacuna: {span} of tome {tome} {'is' if len(pages) == 1 else 'are'} missing from the scan, so {'its' if len(pages) == 1 else 'their'} text is missing here.*")
    return found


def assemble_parts(work: dict) -> None:
    """Build a corpus book from a catalogue work: its leaves across one or more volumes, checked or not."""
    pages, source = [], []  # (body, running head); the page-by-page record of a proofread work
    for part in work["parts"]:
        volume = part["volume"]
        drafts, checked = data / "dots" / volume, data / "checked" / volume
        leaves = [l for l in part["leaves"] if (drafts / f"{l}.md").exists()]
        if not work.get("draft"):
            missing = [l for l in leaves if not (checked / f"{l}.jsonl").exists()]
            if missing:
                raise SystemExit(f"{work['slug']}: {len(missing)} pages not checked yet, e.g. {missing[:5]}")
        texts = {leaf: page_text(drafts, checked, leaf) for leaf in leaves}
        gaps = lacunae(volume)
        # An unreadable leaf right after the work's last one is its last page (Sentences IV, p. 482).
        tail = f"{int(part['leaves'][-1]) + 1:04d}"
        for leaf in dedupe_retakes(volume, leaves, texts):
            if gaps.get(leaf, ("",))[0] == "at":
                pages.append((gaps[leaf][1], ""))
                continue
            body, margin = texts[leaf]
            head, number = running_head(drafts, leaf)
            source.append(f"--- {volume} leaf {leaf}, p. {number or '?'} ---\n{note_token.sub('', body)}" + (f"\n[margin: {' | '.join(margin)}]" if margin else ""))
            if body and not re.fullmatch(r"[\d\s]+", note_token.sub("", body)):
                pages.append((body, head))
            if gaps.get(leaf, ("",))[0] == "after":
                pages.append((gaps[leaf][1], ""))
        if gaps.get(tail, ("",))[0] == "at":
            pages.append((gaps[tail][1], ""))

    text = mend(tidy(join_pages([body for body, _ in pages])))
    chapters, toc = split_chapters(text)

    toc = merge_short(chapters, toc)
    # Group by the running heads where the text's own headings don't: the chapter
    # of the sacred book a commentary's articles treat (as the pilot did), and the
    # books (Liber I, II …) of a work whose articles start again at 1 in each.
    kind = heading_kind(chapter_kind(text))
    group_by = work.get("toc_group")
    if group_by and not any("children" in n for n in toc):
        toc = group_by_head(pages, kind, toc, group_by["pattern"], group_by["label"])
    books = {m.group(2) for _, head in pages if (m := re.search(r"\b(LIBER|TRACTATUS) ([IVXLC]+)\b", head.upper()))}
    has_books = any("children" in n and re.match(r"(Liber|Tractatus) ", n["title"]["la"]) for n in toc)
    # Only where the numbering starts again: Cassian's conferences run 1–24 across his two books.
    top = [n["title"]["la"] if "children" in n else n["chapter"]["title"]["la"] for n in toc]
    if len(books) > 1 and not has_books and len(top) > len(set(top)):
        word = next(m.group(1) for _, head in pages if (m := re.search(r"\b(LIBER|TRACTATUS) ([IVXLC]+)\b", head.upper())))
        la, en, pt = unit_words[word]
        toc = group_by_head(pages, kind, toc, rf"\b{word} ([IVXLC]+)\b", {"la": f"{la} {{n}}", "en-US": f"{en} {{n}}", "pt-BR": f"{pt} {{n}}"}, by_first=True)

    width = 3 if len(chapters) < 1000 else 4
    for i, c in enumerate(chapters, 1):
        c["id"] = f"c{i:0{width}d}"
    groups = iter(range(1, 10_000))

    def finish(nodes: list) -> list:
        out = []
        for n in nodes:
            if "chapter" in n:
                out.append({"id": n["chapter"]["id"], "title": n["chapter"]["title"]})
            else:
                out.append({"id": f"g{next(groups):03d}", "title": n["title"], "children": finish(n["children"])})
        return out

    out = repo / "content" / "books" / work["path"]
    (out / "la").mkdir(parents=True, exist_ok=True)
    for old in (out / "la").glob("*.md"):
        old.unlink()
    for c in chapters:
        body = "\n".join(c["lines"]).strip()
        (out / "la" / f"{c['id']}.md").write_text(snap(f"# {c['title']['la']}\n\n{with_footnotes(body)}\n", Counter()))
    if not work.get("draft"):
        (out / "sources" / "latin-originals").mkdir(parents=True, exist_ok=True)
        (out / "sources" / "latin-originals" / f"{work['slug']}.txt").write_text("\n\n".join(source) + "\n")
    meta = {**work["meta"], "languages": ["la"], "toc": finish(toc)}
    (out / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
    words = sum(len(" ".join(c["lines"]).split()) for c in chapters)
    print(f"{work['path']}: {len(chapters)} chapters, {words:,} words, {len(pages)} pages, chapters by {chapter_kind(text)}")


if __name__ == "__main__":
    for path in sys.argv[1:]:
        work = json.loads(Path(path).read_text())
        main(Path(path)) if "volume" in work else assemble_parts(work)
