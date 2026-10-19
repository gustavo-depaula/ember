"""Apply a proofreader's fix list (fix-prompt.md) to a dots.mocr draft.

    .venv/bin/python apply_fixes.py <draft-dir> <fixes-dir> <out-dir>

Fixes are applied in order; one whose text is missing or ambiguous is reported
and skipped, so a bad fix can never touch the wrong place on the page.
"""

import json
import sys
from pathlib import Path


def apply(draft: str, fixes: list[dict]) -> tuple[str, list[str]]:
    text, problems, margin = draft, [], []
    for fix in fixes:
        if "margin" in fix:
            margin.append(fix["margin"])
            continue
        if "italic" in fix:
            find = fix["italic"].strip("*")
            replace = f"*{find}*"
        else:
            find, replace = fix["find"], fix["replace"]
        count = text.count(find)
        if count != 1:
            problems.append(f"{'missing' if count == 0 else 'ambiguous'}: {find!r}")
            continue
        text = text.replace(find, replace)
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
