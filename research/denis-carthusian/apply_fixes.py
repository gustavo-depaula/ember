"""Apply a proofreader's fix list (fix-prompt.md) to a dots.mocr draft.

    .venv/bin/python apply_fixes.py <draft-dir> <fixes-dir> <out-dir>

Fixes are applied in order; one whose text is missing or ambiguous is reported
and skipped, so a bad fix can never touch the wrong place on the page.
"""

import json
import re
import sys
from pathlib import Path


def plain_and_mask(text: str) -> tuple[str, list[bool]]:
    """The text without its * markers, and which characters were in italics.

    An italic never runs past the end of a line: the draft sometimes leaves a "*"
    unclosed, or starts a line with "* " as if it were a list, and either would
    otherwise set everything after it in italics, headings included.
    """
    # Each "*" toggles, so "**" (the draft's bold, or a run resumed mid-word as in
    # "ani**mam") changes nothing.
    text = re.sub(r"(?m)^\* ", "", text)
    plain, mask, italic = [], [], False
    for ch in text:
        if ch == "\n":
            italic = False
        if ch == "*":
            italic = not italic
            continue
        plain.append(ch)
        mask.append(italic)
    return "".join(plain), mask


def render(plain: str, mask: list[bool]) -> str:
    """Write the * markers back: balanced, closed at every paragraph break, spaces outside."""
    out, open_ = [], False
    for i, ch in enumerate(plain):
        italic = mask[i] and not (ch == "\n")
        if italic and not open_ and not ch.isspace():
            out.append("*")
            open_ = True
        if open_ and (not italic or ch == "\n"):
            while out and out[-1] in " \t":
                out.pop()
            out.append("*")
            open_ = False
            if ch != "\n" and plain[i - 1:i] == " ":
                out.append(" ")
        out.append(ch)
    if open_:
        out.append("*")
    return "".join(out)


def apply(draft: str, fixes: list[dict]) -> tuple[str, list[str]]:
    """Apply word fixes to the marked-up text, then lay the italics over its plain form.

    Italics are kept as a per-character mask rather than inserted as markers, so a
    run Sonnet marks over one the draft already had cannot leave "**" or an open "*".
    """
    text, problems, margin, italics = draft, [], [], []
    for fix in fixes:
        if "margin" in fix:
            margin.append(fix["margin"])
        elif "italic" in fix:
            italics.append(fix["italic"].replace("*", ""))
        else:
            find, replace = fix["find"], fix["replace"]
            count = text.count(find)
            if count != 1:
                problems.append(f"{'missing' if count == 0 else 'ambiguous'}: {find!r}")
                continue
            text = text.replace(find, replace)
    # The margin note is not running text: a footnote mark there ("* immutationem.")
    # must not be read as an italic marker.
    notes = re.findall(r"\s*<!-- margin: .*? -->", text, flags=re.S)
    text = re.sub(r"\s*<!-- margin: .*? -->", "", text, flags=re.S)
    plain, mask = plain_and_mask(text)
    heading_lines = [m.span() for m in re.finditer(r"(?m)^#.*$", plain)]
    for run in italics:
        count = plain.count(run)
        if count != 1:
            problems.append(f"{'missing' if count == 0 else 'ambiguous'}: {run!r}")
            continue
        at = plain.index(run)
        mask[at:at + len(run)] = [True] * len(run)
    for a, b in heading_lines:
        mask[a:b] = [False] * (b - a)
    text = render(plain, mask) + "".join(notes)
    if margin:
        note = " | ".join(margin)
        text = text.replace(" -->", f" | {note} -->") if "<!-- margin:" in text else f"{text.rstrip()}\n\n<!-- margin: {note} -->\n"
    return text, problems


def main(draft_dir: Path, fixes_dir: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for fixes_path in sorted(fixes_dir.glob("*.jsonl")):
        draft = (draft_dir / f"{fixes_path.stem}.md").read_text()
        fixes = [json.loads(line) for line in fixes_path.read_text().splitlines() if line.strip()]
        text, problems = apply(draft, fixes)
        (out_dir / f"{fixes_path.stem}.md").write_text(text)
        print(f"{fixes_path.stem}: {len(fixes)} fixes, {len(problems)} not applied")
        for p in problems:
            print("   ", p)


if __name__ == "__main__":
    main(*map(Path, sys.argv[1:4]))
