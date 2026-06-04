#!/usr/bin/env python3
"""
Parse Aquinas Catechetical Instructions PDF into per-chapter markdown files.

Uses pdftotext -bbox-layout for accurate paragraph detection (each <block>
in the XHTML output is a paragraph — pdftotext -raw loses these boundaries).

Run from repo root:
  python3 scripts/parse-aquinas-catechetical.py
"""
import re
import subprocess
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

PDF_PATH = Path("/Users/gustavo/Library/Mobile Documents/com~apple~CloudDocs/Books/Ember/THE CATECHETICAL INSTRUCTIONS.pdf")
BOOK_DIR = Path("content/books/aquinas-opera-omnia/catechetical-instructions")
OUT_DIR = BOOK_DIR / "en-US"
SRC_TXT = Path("content/_archive/base/sources/english-originals/catechetical-instructions.txt")
NS = {"x": "http://www.w3.org/1999/xhtml"}

# Chapter mapping: (file_stem, start_pattern_regex) — start matched against paragraph text.
# The chapter ends where the next chapter starts. Patterns are anchored at start.
CHAPTERS: list[tuple[str, str]] = [
    ("01-translators-preface", r"^TRANSLATOR['’]S PREFACE\b"),
    # We deliberately skip INTRODUCTION (Bandas) and INDEX OF KEY TERMS per user.
    ("creed-00-what-is-faith", r"^WHAT IS FAITH\?"),
    ("creed-01a-i-believe-in-one-god", r"^THE FIRST ARTICLE: \"I Believe in One God\.\""),
    ("creed-01b-father-almighty-creator", r"^THE FIRST ARTICLE \(CONTINUED\): \"The Father Almighty"),
    ("creed-02-jesus-christ", r"^THE SECOND ARTICLE: \"And in Jesus Christ"),
    ("creed-03-conceived-by-holy-ghost", r"^THE THIRD ARTICLE\b"),
    ("creed-04-suffered-under-pontius-pilate", r"^THE FOURTH ARTICLE: \"Suffered under Pontius Pilate"),
    ("creed-05a-descended-into-hell", r"^THE FIFTH ARTICLE: \"He Descended into Hell\.\""),
    ("creed-05b-resurrection", r"^THE FIFTH ARTICLE \(CONTINUED\): \"The third day"),
    ("creed-06-ascended-into-heaven", r"^THE SIXTH ARTICLE: \"He ascended into heaven"),
    ("creed-07-shall-come-to-judge", r"^THE SEVENTH ARTICLE: \"From thence"),
    ("creed-08-holy-ghost", r"^THE EIGHTH ARTICLE: \"I Believe in the Holy Ghost"),
    ("creed-09-holy-catholic-church", r"^THE NINTH ARTICLE: \"I Believe in the Holy Catholic"),
    ("creed-10-communion-of-saints", r"^THE TENTH ARTICLE: \"The Communion of Saints"),
    ("creed-11-resurrection-of-body", r"^THE ELEVENTH ARTICLE: \"The Resurrection of the Body"),
    ("creed-12-life-everlasting", r"^THE TWELFTH ARTICLE: \"Life everlasting"),
    ("commandments-00-introduction", r"^EXPLANATION OF THE TEN COMMANDMENTS\b"),
    ("commandments-01-strange-gods", r"^THE FIRST COMMANDMENT: \"Thou Shalt Not Have Strange Gods"),
    ("commandments-02-name-of-the-lord", r"^SECOND COMMANDMENT: \"Thou Shalt Not Take the Name"),
    ("commandments-03-sabbath", r"^THE THIRD COMMANDMENT: \"Remember"),
    ("commandments-04-honour-father-and-mother", r"^THE FOURTH COMMANDMENT: \"Honour"),
    ("commandments-05-not-kill", r"^THE FIFTH COMMANDMENT: \"Thou Shalt Not Kill"),
    ("commandments-06-not-commit-adultery", r"^THE SIXTH COMMANDMENT: \"Thou Shalt Not Commit Adultery"),
    ("commandments-07-not-steal", r"^THE SEVENTH COMMANDMENT: \"Thou Shalt Not Steal"),
    ("commandments-08-not-bear-false-witness", r"^THE EIGHTH COMMANDMENT: \"Thou Shalt Not Bear False"),
    ("commandments-09-not-covet-goods", r"^THE NINTH \(TENTH\) COMMANDMENT"),
    ("commandments-10-not-covet-wife", r"^THE TENTH \(NINTH\) COMMANDMENT"),
    ("commandments-summary", r"^SUMMARY OF THE TEN COMMANDMENTS\b"),
    ("lords-prayer-00-five-qualities", r"^EXPLANATION OF THE LORD['’]S PRAYER\b"),
    ("lords-prayer-01-opening-words", r"^THE OPENING WORDS OF THE LORD['’]S PRAYER\b"),
    ("lords-prayer-02-hallowed-be-thy-name", r"^THE FIRST PETITION: \"Hallowed Be Thy Name"),
    ("lords-prayer-03-thy-kingdom-come", r"^THE SECOND PETITION: \"Thy Kingdom Come"),
    ("lords-prayer-04-thy-will-be-done", r"^THE THIRD PETITION: \"Thy Will Be Done"),
    ("lords-prayer-05-daily-bread", r"^THE FOURTH PETITION"),
    ("lords-prayer-06-forgive-us", r"^THE FIFTH PETITION: \"And Forgive Us"),
    ("lords-prayer-07-lead-us-not", r"^THE SIXTH PETITION: \"And Lead Us Not"),
    ("lords-prayer-08-deliver-us-from-evil", r"^SEVENTH PETITION: \"But Deliver Us from Evil"),
    ("lords-prayer-short-explanation", r"^A SHORT EXPLANATION OF THE WHOLE PRAYER\b"),
    ("hail-mary", r"^THE HAIL MARY\b"),
    ("questions-for-discussion", r"^QUESTIONS FOR DISCUSSION\b"),
]

PART_HEADINGS = {
    "THE APOSTLES' CREED",
    "THE APOSTLES’ CREED",
}

TITLE_LOWER = {
    "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into",
    "nor", "of", "on", "or", "the", "to", "with", "upon",
}


def title_case(text: str) -> str:
    tokens = re.split(r'(\W+)', text.lower())
    word_indices = [i for i, t in enumerate(tokens) if re.match(r'\w', t)]
    for n, i in enumerate(word_indices):
        is_first = n == 0
        is_last = n == len(word_indices) - 1
        t = tokens[i]
        prev_sep = tokens[i - 1] if i > 0 else ''
        # Contraction suffix (translator's, don't, we'll) — apostrophe with NO following
        # whitespace, attached directly to a word. Possessives like "apostles' creed"
        # have an apostrophe + space, where the next word is independent.
        if re.fullmatch(r"['’]", prev_sep) and i >= 2 and re.match(r'\w', tokens[i - 2] or ''):
            continue
        # Word follows opening quote — capitalize regardless
        starts_quote = bool(re.search(r'["“‘]\s*$', prev_sep))
        if not is_first and not is_last and not starts_quote and t in TITLE_LOWER:
            tokens[i] = t
        else:
            tokens[i] = t[:1].upper() + t[1:] if t else t
    return ''.join(tokens)


def dedupe_heading(text: str) -> str:
    """Some PDF headings repeat themselves: 'The Fourth Petition The Fourth Petition...'."""
    words = text.split()
    n = len(words)
    for size in range(min(n // 2, 8), 0, -1):
        if [w.lower() for w in words[:size]] == [w.lower() for w in words[size:2 * size]]:
            kept = words[size:]
            if kept:
                kept[0] = kept[0][:1].upper() + kept[0][1:]
            return ' '.join(kept)
    return text


def split_inline_heading(text: str) -> tuple[str, str] | None:
    """If a paragraph starts with a run of ALL CAPS words (an inline subsection
    heading) followed by mixed-case body text, split into (heading, body).

    Returns None if no inline heading is found.
    """
    words = text.split()
    n = 0
    for w in words:
        core = re.sub(r'^[\W_]+|[\W_]+$', '', w)
        if not core:
            n += 1
            continue
        if any(c.islower() for c in core):
            break
        n += 1
    if n < 2 or n == len(words):
        return None
    heading = ' '.join(words[:n])
    body = ' '.join(words[n:])
    if not is_heading(heading):
        return None
    return heading, body


def is_heading(text: str) -> bool:
    s = text.strip()
    if not s:
        return False
    no_quotes = re.sub(r'"[^"]*"|"[^"]*"|"[^"]*"|\([^)]*\)', '', s)
    letters = [c for c in no_quotes if c.isalpha()]
    if len(letters) < 3:
        return False
    upper = sum(1 for c in letters if c.isupper())
    return upper / len(letters) > 0.85


def extract_paragraphs(xhtml: Path) -> list[str]:
    """Extract paragraphs from bbox-layout XHTML. Each <block> is a paragraph.

    Blocks containing only digits are page numbers — skip.
    Blocks within the same flow that continue (previous ends without sentence-final
    punctuation, current starts lowercase) are joined.
    """
    tree = ET.parse(xhtml)
    root = tree.getroot()
    paragraphs: list[str] = []

    for page in root.iter('{http://www.w3.org/1999/xhtml}page'):
        for flow in page.findall('x:flow', NS):
            for block in flow.findall('x:block', NS):
                words = [w.text or '' for w in block.iter('{http://www.w3.org/1999/xhtml}word')]
                text = ' '.join(words).strip()
                # Decode common HTML entities
                text = text.replace('&apos;', "'").replace('&amp;', '&').replace('&quot;', '"')
                if not text:
                    continue
                # Skip page-number-only blocks
                if re.fullmatch(r'\d{1,4}', text):
                    continue
                paragraphs.append(text)

    # Cross-page paragraph continuation: join paragraphs where the current ends
    # with no terminal punctuation AND the next starts with a lowercase letter.
    # Also handles the common case of mid-word hyphenation across pages: word--\n word.
    merged: list[str] = []
    for p in paragraphs:
        if merged and _looks_like_continuation(merged[-1], p):
            prev = merged[-1]
            # If the previous ends with "--" (em dash split mid-word), join without space
            if re.search(r'[a-zA-Z]--$', prev):
                merged[-1] = prev + p
            else:
                merged[-1] = prev + ' ' + p
        else:
            merged.append(p)
    return merged


def _looks_like_continuation(prev: str, cur: str) -> bool:
    prev_end = prev.rstrip()
    if not prev_end:
        return False
    cur_first = cur.lstrip()
    if not cur_first:
        return False
    # If current starts with a heading-style ALL-CAPS phrase, never join
    if is_heading(cur_first):
        return False
    # Previous ends mid-sentence (no terminal punctuation)
    last_char = prev_end[-1]
    if last_char not in '.!?"”’)':
        # Likely a page-break split mid-paragraph
        return cur_first[0].islower() or cur_first[0] == '"'
    # Previous ends with sentence terminator — only join if current visibly continues
    # (starts with a lowercase letter)
    return cur_first[0].islower()


def collect_body_refs(paragraphs: list[str]) -> set[int]:
    """Find all [N] / [^N] footnote references in the body (pre-ENDNOTES) text."""
    refs: set[int] = set()
    for p in paragraphs:
        if re.match(r'^ENDNOTES?\s*$', p.strip()):
            break
        for m in re.finditer(r'\[\^?(\d+)\]', p):
            refs.add(int(m.group(1)))
    return refs


def render_chapter(paragraphs: list[str], raw_notes: list[tuple[int, str]] | None = None) -> str:
    """Convert a chapter's flat paragraph list into rendered markdown.

    If raw_notes is provided, uses them in place of bbox-extracted endnotes
    (bbox-layout column-interleaves the 2-column endnote sections).
    """
    out_blocks: list[str] = []
    saw_first_heading = False
    endnotes_idx = None

    for i, p in enumerate(paragraphs):
        if re.match(r'^ENDNOTES?\s*$', p.strip()):
            endnotes_idx = i
            break

    body = paragraphs[:endnotes_idx] if endnotes_idx is not None else paragraphs

    for p in body:
        s = p.strip()
        # Drop "(For 'Questions for Discussion' see Chapter X.)" cross-refs.
        # Source sometimes has the closing paren missing (creed-08); accept either.
        s = re.sub(r'\(For\s+"Questions for Discussion"\s+see Chapter[^)\n]*?\.?\)?\s*$', '', s).strip()
        s = re.sub(r'\(For\s+"Questions for Discussion"\s+see Chapter[^)\n]*?\.?\)\s*', '', s).strip()
        if not s:
            continue
        # Soft-hyphen line breaks (PDF wrapped a hyphenated word) — join "long- lived" → "long-lived"
        s = re.sub(r'(\w)-\s+(\w)', r'\1-\2', s)
        # Convert inline footnote markers [N] -> [^N]  (applies to headings and body)
        s = re.sub(r'\[(\d+)\]', r'[^\1]', s)
        # Translator's Preface uses superscript footnotes without brackets, attached
        # to year endings: "1225.1 The name..." or "1272,4 in the full..." —
        # restore as "1225.[^1] The..." / "1272,[^4] in the...".
        s = re.sub(r'(\b\d{4}[.,])(\d{1,2})(\s+[A-Za-z])', r'\1[^\2]\3', s)
        if is_heading(s):
            if s in PART_HEADINGS and not saw_first_heading:
                continue
            kind = '#' if not saw_first_heading else '##'
            saw_first_heading = True
            out_blocks.append(f'{kind} {dedupe_heading(title_case(s))}')
            continue
        # Detect inline subsection headings (ALL CAPS run at start of paragraph)
        split = split_inline_heading(s)
        if split and saw_first_heading:
            heading, body = split
            out_blocks.append(f'## {dedupe_heading(title_case(heading))}')
            out_blocks.append(body)
            continue
        out_blocks.append(s)

    notes = raw_notes or []
    body_md = '\n\n'.join(out_blocks)
    if notes:
        body_md += '\n\n' + '\n'.join(f'[^{n}]: {t}' for n, t in notes)
    return body_md.rstrip() + '\n'


CHAPTER_RAW_RANGES: dict[str, tuple[int, int]] = {
    "01-translators-preface": (230, 454),
    "creed-00-what-is-faith": (819, 951),
    "creed-01a-i-believe-in-one-god": (952, 1053),
    "creed-01b-father-almighty-creator": (1054, 1162),
    "creed-02-jesus-christ": (1163, 1316),
    "creed-03-conceived-by-holy-ghost": (1317, 1466),
    "creed-04-suffered-under-pontius-pilate": (1467, 1617),
    "creed-05a-descended-into-hell": (1618, 1766),
    "creed-05b-resurrection": (1767, 1867),
    "creed-06-ascended-into-heaven": (1868, 1968),
    "creed-07-shall-come-to-judge": (1969, 2089),
    "creed-08-holy-ghost": (2090, 2213),
    "creed-09-holy-catholic-church": (2214, 2371),
    "creed-10-communion-of-saints": (2372, 2536),
    "creed-11-resurrection-of-body": (2537, 2692),
    "creed-12-life-everlasting": (2693, 2820),
    "commandments-00-introduction": (2821, 2841),
    "commandments-01-strange-gods": (2842, 2984),
    "commandments-02-name-of-the-lord": (2985, 3126),
    "commandments-03-sabbath": (3127, 3381),
    "commandments-04-honour-father-and-mother": (3382, 3552),
    "commandments-05-not-kill": (3553, 3755),
    "commandments-06-not-commit-adultery": (3756, 3884),
    "commandments-07-not-steal": (3885, 3980),
    "commandments-08-not-bear-false-witness": (3981, 4105),
    "commandments-09-not-covet-goods": (4106, 4173),
    "commandments-10-not-covet-wife": (4174, 4255),
    "commandments-summary": (4256, 4270),
    "lords-prayer-00-five-qualities": (4271, 4362),
    "lords-prayer-01-opening-words": (4363, 4539),
    "lords-prayer-02-hallowed-be-thy-name": (4540, 4605),
    "lords-prayer-03-thy-kingdom-come": (4606, 4711),
    "lords-prayer-04-thy-will-be-done": (4712, 4859),
    "lords-prayer-05-daily-bread": (4860, 4979),
    "lords-prayer-06-forgive-us": (4980, 5116),
    "lords-prayer-07-lead-us-not": (5117, 5236),
    # Seventh Petition and Short Explanation share a single endnotes block at
    # lines 5303-5329 (notes 1-15 belong to Seventh Petition, 16-17 to Short
    # Explanation). Both chapters point at the merged block; render_chapter
    # filters by body refs so each gets only its own notes.
    "lords-prayer-08-deliver-us-from-evil": (5237, 5329),
    "lords-prayer-short-explanation": (5279, 5329),
    "hail-mary": (5330, 5536),
    "questions-for-discussion": (5537, 5929),
}


def parse_raw_endnotes_for_chapter(stem: str, raw_lines: list[str], body_refs: set[int] | None = None) -> list[tuple[int, str]]:
    """Read endnotes from -raw extracted text within the chapter's line range.

    Each line that begins with "N." (digits + period + space) starts a new note;
    subsequent non-matching lines append to the current note. After parsing, two
    source-quirks are fixed in a second pass:
      - "30. Matt., vi. 21. 31. Phil., iii. 20." — two notes on one line; split
        when an embedded `<sequential>.\\s` is found inside a note's text
      - "52 Matt., vi. 6." (no period after 52) — accepted via relaxed regex

    If body_refs is provided, only notes whose numbers appear as body refs
    are returned — used when two chapters share an endnotes block.
    """
    rng = CHAPTER_RAW_RANGES.get(stem)
    if not rng:
        return []
    start, end = rng
    section = raw_lines[start - 1:end]
    idx = None
    for i, line in enumerate(section):
        if re.match(r'^\s*ENDNOTES?\s*$', line) or re.match(r'^\s*ENDNOTES?\d+\s*$', line):
            idx = i
            break
    if idx is None:
        return []

    notes: list[tuple[int, str]] = []
    cur_n: int | None = None
    cur_t: list[str] = []
    for line in section[idx + 1:]:
        s = line.rstrip()
        # Strip trailing concatenated page-number footers (e.g. "Penance.66")
        s = re.sub(r'(\D)(\d{1,3})$', r'\1', s)
        if not s.strip():
            continue
        # Relaxed: digit + optional period + optional whitespace + text. Some notes
        # in the source open immediately with a quote like `8". . . we believe` (no
        # period or space), and a few omit the period entirely (`52 Matt., vi. 6.`).
        # Treat as a new note only if the number is sequential — guards against false
        # positives on Bible references and dates inside continuation lines.
        m = re.match(r'^(\d+)\.?\s*(.*)$', s.lstrip())
        # Accept any forward-jump in the note number, not just exact +1: the source
        # PDF skips numbers in a few places (commandments-07 jumps 16 → 18, source
        # defect not bug). Backward / huge jumps are continuation lines that happen
        # to start with a digit and should be appended to the current note.
        if m and (cur_n is None or cur_n < int(m.group(1)) <= cur_n + 10):
            if cur_n is not None:
                notes.append((cur_n, ' '.join(cur_t).strip()))
            cur_n = int(m.group(1))
            cur_t = [m.group(2)]
        elif cur_n is not None:
            cur_t.append(s.lstrip())
    if cur_n is not None:
        notes.append((cur_n, ' '.join(cur_t).strip()))

    # Second pass: split notes whose text embeds the next sequential number.
    # E.g. captured "30 → 'Matt., vi. 21. 31. Phil., iii. 20.'" splits into 30 + 31.
    expanded: list[tuple[int, str]] = []
    for n, t in notes:
        nxt = n + 1
        while True:
            m = re.search(rf'\s+{nxt}\.?\s+', t)
            if not m:
                break
            head = t[:m.start()].strip()
            tail = t[m.end():].strip()
            expanded.append((n, head))
            n, t = nxt, tail
            nxt = n + 1
        expanded.append((n, t))

    if body_refs is not None:
        expanded = [(n, t) for n, t in expanded if n in body_refs]

    # Per-chapter manual corrections for OCR-merged or otherwise broken notes.
    overrides = NOTE_OVERRIDES.get(stem, {})
    if overrides:
        # Replace existing notes by number, then insert any new ones in order
        as_dict = dict(expanded)
        as_dict.update(overrides)
        expanded = sorted(as_dict.items(), key=lambda kv: kv[0])
    return expanded


# Source-defect repairs. These are the only places the script departs from a
# faithful pass-through of the 1939 Collins/Catholic Primer text. Each entry
# documents the OCR or numbering bug it corrects.
NOTE_OVERRIDES: dict[str, dict[int, str]] = {
    # Source line: `11. Acts, ii. 3~. Rom., vi, 4.` — OCR merged two distinct
    # Bible refs into one note. Note 11 cites "This Jesus hath God raised again"
    # (Acts 2:24); note 12 cites "Christ is risen from the dead by the glory of
    # the Father" (Rom 6:4). The "3~" is OCR for "24".
    "creed-05b-resurrection": {
        11: "Acts, ii. 24.",
        12: "Rom., vi. 4.",
    },
}


def split_into_chapters(paragraphs: list[str]) -> dict[str, list[str]]:
    """Split flat paragraph list into chapter dicts based on CHAPTERS patterns.

    The first chapter starts at the first matching pattern; each chapter
    extends until the next chapter's start pattern matches.
    """
    indices: list[tuple[int, str]] = []
    used = [False] * len(CHAPTERS)
    for i, p in enumerate(paragraphs):
        for ci, (stem, pat) in enumerate(CHAPTERS):
            if used[ci]:
                continue
            if re.match(pat, p.strip()):
                indices.append((i, stem))
                used[ci] = True
                break

    # Sanity: warn for any chapter not found
    missing = [stem for (stem, _), u in zip(CHAPTERS, used) if not u]
    if missing:
        print(f'WARNING: chapters not found in source: {missing}', file=sys.stderr)

    indices.sort(key=lambda x: x[0])
    out: dict[str, list[str]] = {}
    for j, (start, stem) in enumerate(indices):
        end = indices[j + 1][0] if j + 1 < len(indices) else len(paragraphs)
        out[stem] = paragraphs[start:end]
    return out


def main():
    xhtml_path = Path('/tmp/cati-bbox.xhtml')
    if not xhtml_path.exists():
        print(f'Generating {xhtml_path}...')
        subprocess.run(
            ['pdftotext', '-bbox-layout', str(PDF_PATH), str(xhtml_path)],
            check=True,
        )
    paragraphs = extract_paragraphs(xhtml_path)
    print(f'Extracted {len(paragraphs)} paragraphs from PDF')

    chapters = split_into_chapters(paragraphs)
    print(f'Identified {len(chapters)} chapter starts')

    # Strip form feed (page-break) characters that pdftotext inserts between pages.
    raw_lines = SRC_TXT.read_text().replace('\x0c', '').split('\n')

    # Chapters that share an endnotes block with another chapter — filter notes
    # by body refs so each chapter only ships the notes it references.
    SHARED_NOTES = {"lords-prayer-08-deliver-us-from-evil", "lords-prayer-short-explanation"}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for stem, paras in chapters.items():
        body_refs = collect_body_refs(paras) if stem in SHARED_NOTES else None
        notes = parse_raw_endnotes_for_chapter(stem, raw_lines, body_refs=body_refs)
        md = render_chapter(paras, notes)
        # Workaround for a one-off PDF typo: "Matt., xvi. l[9]" should be "Matt., xvi. 19"
        # (lowercase L mis-rendered for digit 1, plus stray brackets around 9). Fix only the
        # exact glyph-confusion match — leave the rest of the chapter unchanged.
        md = md.replace(' l[^9])', ' 19)')
        (OUT_DIR / f'{stem}.md').write_text(md)
        print(f'  wrote {stem}.md ({len(paras)} paragraphs, {len(notes)} notes)')


if __name__ == '__main__':
    main()
