"""Draft, with Claude, the pages dots.mocr cannot: those it loops on even on retry.

    .venv/bin/python draft_with_claude.py [--parallel 4]

Every page left with a .err under dots/ is transcribed from scratch by a lean
`claude -p` Sonnet call (prompt.md, the bake-off's full-transcription
instructions, 0.04% CER there). So the rest of the pipeline needs no special case,
each page gets what a dots.mocr page has:

- dots/<volume>/<leaf>.md       the transcription
- dots/<volume>/<leaf>.raw.txt  a minimal layout: the running head and page number
                                Claude reports, and one text block over the whole page
- checked/<volume>/<leaf>.jsonl empty: Claude already read this page, so the
                                proofreading pass skips it
- dots/<volume>/<leaf>.source   "claude", to tell these pages apart later

Safe to stop and rerun: a page is done once its .err is gone.
"""

import argparse
import io
import json
import re
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

from check_pages import LimitReached, workdir, write_atomic
from run_volumes import data, volume_zip

here = Path(__file__).parent.resolve()
head_instruction = """
Begin your reply with one line giving the page's running head and printed page number, exactly as printed:
<!-- head: ENARRATIO IN CAP. XII GENESIS. — ART. XLV | page: 233 -->
(leave either part empty if the page has none), then a blank line, then the transcription.
For a page of an index, transcribe the entries as printed, one per line.
If the page is blank, or its print cannot be read (faded, covered, out of focus), give the
head line and then only `<!-- unreadable: <a few words why> -->`; never write prose about the page."""

# Before the marker above existed, Claude answered unreadable pages in prose
# ("I can't transcribe this page. The scan is almost blank…"). Never let that into a draft.
prose_refusal = re.compile(r"\A(I can['’]?t|I couldn['’]?t|I cannot|The page|The scan|The image|This page)\b")


def page_image(volume: str, leaf: str) -> Image.Image:
    with zipfile.ZipFile(volume_zip(volume)) as zf:
        name = next(n for n in zf.namelist() if Path(n).stem.endswith(f"_{leaf}"))
        image = Image.open(io.BytesIO(zf.read(name)))
        image.load()
    return image


def ask(image_path: Path) -> dict:
    import subprocess

    reply = subprocess.run(
        [
            "claude", "-p", "--model", "sonnet",
            "--system-prompt", (here / "prompt.md").read_text() + head_instruction,
            "--tools", "Read", "--allowedTools", "Read",
            "--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--no-session-persistence", "--output-format", "json",
            f"Page image: {image_path.resolve()} (view it with Read).",
        ],
        cwd=workdir, capture_output=True, text=True,
    )
    try:
        result = json.loads(reply.stdout)
    except json.JSONDecodeError:
        result = {"is_error": True, "result": (reply.stderr or reply.stdout).strip()[:500]}
    if result.get("is_error") or reply.returncode != 0:
        message = str(result.get("result", ""))
        if "limit" in message.lower():
            raise LimitReached(message)
        raise RuntimeError(message)
    return result


def record_gap(volume: str, leaf: str, reason: str) -> None:
    """A page with no usable text: blank, or a scan to replace from another copy."""
    with open(data / "gaps.tsv", "a") as f:
        f.write(f"{volume}\t{leaf}\t{reason}\n")


def draft(err: Path) -> float:
    volume, leaf = err.parent.name, err.stem
    image = page_image(volume, leaf)
    # The whole page, scaled like the cropped checks (the text block is unknown here).
    shown = image.copy()
    shown.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
    path = workdir / f"{volume}-{leaf}.draft.jpg"
    shown.convert("RGB").save(path, quality=90)
    result = ask(path)
    text = result["result"].strip()
    head = re.match(r"<!--\s*head:\s*(.*?)\s*\|\s*page:\s*(.*?)\s*-->\s*", text)
    running, number = (head.group(1), head.group(2)) if head else ("", "")
    body = text[head.end():].strip() if head else text
    unreadable = re.fullmatch(r"<!--\s*unreadable:\s*(.*?)\s*-->", body, flags=re.S)
    reason = unreadable.group(1) if unreadable else (body[:200].replace("\n", " ") if prose_refusal.match(body) else "")
    if reason:
        body = ""
        record_gap(volume, leaf, reason)
    # The frame dots.mocr's boxes use: the page scaled to at most 4 MP.
    scale = min(1.0, (4_000_000 / (image.width * image.height)) ** 0.5)
    w, h = round(image.width * scale), round(image.height * scale)
    cells = [{"category": "Page-header", "bbox": [0, 0, w, 0], "text": t} for t in (running, number) if t]
    cells.append({"category": "Text", "bbox": [0, 0, w, h], "text": body})
    out = err.parent
    write_atomic(out / f"{leaf}.raw.txt", json.dumps(cells, ensure_ascii=False))
    write_atomic(out / f"{leaf}.md", body + "\n")
    write_atomic(out / f"{leaf}.source", "claude\n")
    checked = data / "checked" / volume
    checked.mkdir(parents=True, exist_ok=True)
    write_atomic(checked / f"{leaf}.jsonl", "")
    err.unlink()
    print(f"{volume} {leaf}: {len(body.split())} words, p. {number or '?'}, ${result['total_cost_usd']:.4f}", flush=True)
    return result["total_cost_usd"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parallel", type=int, default=4)
    args = parser.parse_args()
    workdir.mkdir(exist_ok=True)
    errs = sorted((data / "dots").glob("*/*.err"))
    print(f"{len(errs)} pages to draft", flush=True)

    def one(err: Path) -> float:
        try:
            return draft(err)
        except LimitReached as error:
            print(f"usage limit reached: {error}", flush=True)
            raise
        except Exception as error:
            print(f"{err.parent.name} {err.stem}: failed: {error!r}", flush=True)
            return 0.0

    with ThreadPoolExecutor(args.parallel) as pool:
        costs = list(pool.map(one, errs))
    left = len(list((data / "dots").glob("*/*.err")))
    print(f"done: ${sum(costs):.2f} at API rates, {left} pages still without a draft")


if __name__ == "__main__":
    main()
