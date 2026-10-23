"""Join a proofread one-column book into a single Markdown file.

    ../denis-carthusian/.venv/bin/python assemble.py <book-id>...

Each page's draft (dots/) gets its fix list (checked/) applied, as for Denis. A
paragraph broken by a page turn is rejoined; the notes at the foot of each page
("²⁷ Mala sua…") become Markdown footnotes, defined at the end of their chapter
and numbered in order through it: Bruyère numbers them by chapter, Frost by page,
so a mark is matched with the note of the same number on its own page.
Writes ~/ember-data/ocr-books/<book-id>.md.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "denis-carthusian"))
from apply_fixes import apply  # noqa: E402

data = Path.home() / "ember-data" / "ocr-books"
mark = re.compile(r"[⁰¹²³⁴⁵⁶⁷⁸⁹]+")


def page(book: str, leaf: str) -> tuple[list[str], list[str]]:
    draft = (data / "dots" / book / f"{leaf}.md").read_text()
    fixes_path = data / "checked" / book / f"{leaf}.jsonl"
    fixes = [json.loads(l) for l in fixes_path.read_text().splitlines() if l.strip()] if fixes_path.exists() else []
    text, problems = apply(draft, fixes)
    for p in problems:
        print(f"{book} {leaf}: fix not applied, {p}")
    # Notes printed one under another come back as one block: one note per line that starts with a mark.
    paragraphs = [q.strip() for p in text.split("\n\n") for q in re.split(r"\n(?=[⁰¹²³⁴⁵⁶⁷⁸⁹]+ )", p) if q.strip()]
    notes = [p for p in paragraphs if mark.match(p)]
    return [p for p in paragraphs if not mark.match(p)], notes


def main() -> None:
    for book in sys.argv[1:]:
        out, pending, count = [], [], [0]

        def flush() -> None:
            if pending:
                out.append("\n".join(pending))
                pending.clear()
            count[0] = 0

        for draft in sorted((data / "dots" / book).glob("*.md")):
            body, notes = page(book, draft.stem)
            numbers: dict[str, int] = {}

            def number(printed: str) -> int:
                if printed not in numbers:
                    count[0] += 1
                    numbers[printed] = count[0]
                return numbers[printed]

            for i, p in enumerate(body):
                if re.match(r"## (CHAPTER|PART|APPENDIX|BIBLIOGRAPHY|INDEX|INTRODUCTION|PREFACE|AUTHOR'S PREFACE|DEDICATED|CONTENTS|TABLE OF CONTENTS)\b", p):
                    flush()
                    numbers.clear()
                p = mark.sub(lambda m: f"[^{number(m.group(0))}]", p)
                previous = out[-1] if out else ""
                # A paragraph the page turn broke: the last one did not end a sentence, this one starts lower case.
                if i == 0 and previous and not previous.startswith("#") and not re.search(r"[.:?!”’»)]\**(\[\^\d+\])*$", previous) and re.match(r"\**[a-z]", p):
                    out[-1] = previous[:-1] + p if previous.endswith("-") else f"{previous} {p}"
                else:
                    out.append(p)
            for n in notes:
                printed = mark.match(n).group(0)
                pending.append(f"[^{number(printed)}]: {n[mark.match(n).end():].strip()}")
        flush()
        target = data / f"{book}.md"
        target.write_text("\n\n".join(out) + "\n")
        print(f"{book}: {sum(len(p.split()) for p in out):,} words, {sum(p.startswith('#') for p in out)} headings -> {target}")


if __name__ == "__main__":
    main()
