"""Have Claude proofread dots.mocr drafts through the Claude Code subscription.

    # pages of a drafted volume, read straight from its zip (see run_volumes.py)
    .venv/bin/python check_pages.py --volume operaomniainunum01deni --leaves 0117-0600
    # loose images, for experiments
    .venv/bin/python check_pages.py --images scans/*.jpg --drafts out/dots --out out/check

One headless `claude -p` call per page, stripped to the fix-list instructions and
the page image sent inline. A subagent carries a ~60k-token system prompt
before it reads a page; this carries ~3.5k, which is what makes the subscription
go far enough for 25k pages. Each reply goes to <leaf>.jsonl, its usage to
<leaf>.usage.json.

Safe to stop at any time: results are written atomically and a restart skips
pages already checked. When the subscription's usage limit is reached the run
stops with exit code 75 instead of failing page after page; run it again once
the limit resets (check-volume.service retries every 30 minutes).
"""

import argparse
import base64
import io
import json
import os
import re
import subprocess
import tempfile
import threading
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

from run_volumes import volume_zip

here = Path(__file__).parent.resolve()
data = Path(os.environ.get("DENIS_DATA", Path.home() / "ember-data" / "denis-carthusian"))
# Outside the repo, so neither CLAUDE.md nor the project memory loads into the call.
workdir = Path(tempfile.gettempdir()) / "denis-check"
limit_reached = threading.Event()


stop_code = 75  # 76 when it is the weekly cap that stopped the run


class LimitReached(Exception):
    pass


def usage() -> dict[str, int]:
    """The current session's and week's usage in percent, as `claude /usage` reports them."""
    out = subprocess.run(["claude", "-p", "/usage"], cwd="/tmp", capture_output=True, text=True).stdout
    found = {"session": re.search(r"Current session: (\d+)% used", out),
             "week": re.search(r"Current week \(all models\): (\d+)% used", out)}
    return {k: int(m.group(1)) for k, m in found.items() if m}


def over_cap(session_cap: int | None, weekly_cap: int | None) -> str | None:
    """Why to stop now, if a cap is reached; the session cap stops with 75, the weekly one with 76."""
    global stop_code
    used = usage()
    if weekly_cap and used.get("week", 0) >= weekly_cap:
        stop_code = 76
        return f"weekly usage at {used['week']}%, cap {weekly_cap}%"
    if session_cap and used.get("session", 0) >= session_cap:
        stop_code = 75
        return f"session usage at {used['session']}%, cap {session_cap}%"
    return None


def watch_caps(session_cap: int | None, weekly_cap: int | None) -> None:
    # Checked every two minutes rather than per work: one book of the Sentences is a thousand pages.
    while not limit_reached.wait(120):
        if reason := over_cap(session_cap, weekly_cap):
            print(f"{reason}; stopping", flush=True)
            limit_reached.set()


def write_atomic(path: Path, text: str) -> None:
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w") as f:
        f.write(text)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def cropped(page: Image.Image, raw: str, height: int) -> bytes:
    """The page cut to its text and margin notes, from the draft's layout boxes.

    The image is most of what a check costs, and the page's blank border and
    running head carry nothing the check needs.
    """
    boxes = [c["bbox"] for c in json.loads(raw) if c.get("category") not in ("Page-header", "Page-footer")]
    # The boxes are in the frame dots.mocr saw, scaled to at most 4 MP (ocr_local.fit_pixels).
    scale = min(1.0, (4_000_000 / (page.width * page.height)) ** 0.5)
    pad = 20
    x0, y0 = min(b[0] for b in boxes) - pad, min(b[1] for b in boxes) - pad
    x1, y1 = max(b[2] for b in boxes) + pad, max(b[3] for b in boxes) + pad
    crop = page.crop((max(0, round(x0 / scale)), max(0, round(y0 / scale)),
                      min(page.width, round(x1 / scale)), min(page.height, round(y1 / scale))))
    if crop.height > height:
        crop = crop.resize((round(crop.width * height / crop.height), height), Image.Resampling.LANCZOS)
    jpeg = io.BytesIO()
    crop.convert("RGB").save(jpeg, "JPEG", quality=90)
    return jpeg.getvalue()


def ask_claude(image: bytes, draft: str, model: str, effort: str, prompt: Path) -> dict:
    # The scan goes in the message itself: handing the model a path to Read costs a
    # round trip, a tool call and the whole prefix read again, on every page.
    message = {"type": "user", "message": {"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                     "data": base64.b64encode(image).decode()}},
        {"type": "text", "text": f"Draft transcription:\n\n{draft}"},
    ]}}
    reply = subprocess.run(
        [
            "claude", "-p", "--model", model, "--effort", effort,
            "--system-prompt", prompt.read_text(), "--tools", "",
            "--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--no-session-persistence", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
        ],
        input=json.dumps(message), cwd=workdir, capture_output=True, text=True,
    )
    try:
        result = json.loads(reply.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        result = {"is_error": True, "result": (reply.stderr or reply.stdout).strip()[:500]}
    if result.get("is_error") or reply.returncode != 0:
        message = str(result.get("result", ""))
        if "limit" in message.lower():
            raise LimitReached(message)
        raise RuntimeError(message)
    return result


def check(stem: str, load_page, drafts: Path, out: Path, model: str, effort: str, crop: int, prompt: Path) -> dict | None:
    if limit_reached.is_set() or (out / f"{stem}.jsonl").exists():
        return None
    draft_path = drafts / f"{stem}.md"
    if not draft_path.exists():
        print(f"{stem}: no draft, skipped", flush=True)
        return None
    draft = draft_path.read_text()
    raw = (drafts / f"{stem}.raw.txt").read_text()
    if not draft.strip() or not json.loads(raw):
        write_atomic(out / f"{stem}.jsonl", "")  # a blank page
        return None
    try:
        result = ask_claude(cropped(load_page(), raw, crop), draft, model, effort, prompt)
    except LimitReached as error:
        limit_reached.set()
        print(f"{stem}: usage limit reached ({error}); stopping", flush=True)
        return None
    except Exception as error:  # one bad page must not stop the run; it is retried next time
        write_atomic(out / f"{stem}.err", f"{type(error).__name__}: {error}\n")
        print(f"{stem}: failed: {error}", flush=True)
        return None
    # Read the reply as a run of JSON objects, not line by line: a fix can hold a line break.
    lines, text, at = [], result["result"], 0
    decoder = json.JSONDecoder(strict=False)
    while (at := text.find("{", at)) >= 0:
        try:
            fix, end = decoder.raw_decode(text, at)
        except json.JSONDecodeError:
            write_atomic(out / f"{stem}.err", f"unreadable fix in the reply: {text[at:at + 200]!r}\n")
            print(f"{stem}: unreadable fix in the reply; will retry", flush=True)
            return None
        lines.append(json.dumps(fix, ensure_ascii=False))
        at = end
    usage = {**result["usage"], "total_cost_usd": result["total_cost_usd"]}
    write_atomic(out / f"{stem}.usage.json", json.dumps(usage, indent=2))
    write_atomic(out / f"{stem}.jsonl", "\n".join(lines) + "\n" if lines else "")
    (out / f"{stem}.err").unlink(missing_ok=True)
    print(f"{stem}: {len(lines)} fixes, ${result['total_cost_usd']:.4f}", flush=True)
    return usage


def volume_pages(volume: str, leaves: str) -> list[tuple[str, callable]]:
    first, last = leaves.split("-")
    zf_path = volume_zip(volume)
    with zipfile.ZipFile(zf_path) as zf:
        names = {Path(n).stem.rsplit("_", 1)[-1]: n for n in zf.namelist() if n.endswith((".jp2", ".tif"))}

    def loader(name: str):
        def load() -> Image.Image:
            with zipfile.ZipFile(zf_path) as zf:
                image = Image.open(io.BytesIO(zf.read(name)))
                image.load()
            return image
        return load

    return [(leaf, loader(names[leaf])) for leaf in sorted(names) if first <= leaf <= last]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--volume")
    parser.add_argument("--leaves", help="first-last leaf, e.g. 0117-0600")
    parser.add_argument("--images", nargs="*", type=Path)
    parser.add_argument("--drafts", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--model", default="claude-opus-5-5")
    parser.add_argument("--effort", default="low")
    parser.add_argument("--session-cap", type=int, help="stop (exit 75) once the session's usage reaches this percentage")
    parser.add_argument("--weekly-cap", type=int, help="stop (exit 76) once the week's usage reaches this percentage")
    parser.add_argument("--crop", type=int, default=1600, help="crop to the text and scale to this height")
    parser.add_argument("--parallel", type=int, default=4)
    parser.add_argument("--prompt", type=Path, default=here / "fix-prompt.md", help="the fix-list instructions (another book's, e.g. ../ocr-books/fix-prompt.md)")
    args = parser.parse_args()
    if args.volume:
        pages = volume_pages(args.volume, args.leaves)
        drafts = args.drafts or data / "dots" / args.volume
        out = args.out or data / "checked" / args.volume
    else:
        pages = [(p.stem, lambda p=p: Image.open(p)) for p in args.images]
        drafts, out = args.drafts, args.out
    out.mkdir(parents=True, exist_ok=True)
    workdir.mkdir(exist_ok=True)
    print(f"{time.strftime('%Y-%m-%d %H:%M:%S')} checking {len(pages)} pages into {out}", flush=True)
    if args.session_cap or args.weekly_cap:
        if reason := over_cap(args.session_cap, args.weekly_cap):
            print(f"{reason}; stopping", flush=True)
            raise SystemExit(stop_code)
        threading.Thread(target=watch_caps, args=(args.session_cap, args.weekly_cap), daemon=True).start()
    with ThreadPoolExecutor(args.parallel) as pool:
        usages = [u for u in pool.map(lambda p: check(p[0], p[1], drafts, out, args.model, args.effort, args.crop, args.prompt.resolve()), pages) if u]
    if usages:
        n = len(usages)
        total = {k: sum(u[k] for u in usages) for k in ("cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens", "total_cost_usd")}
        print(f"{n} pages checked this run · per page: " + ", ".join(f"{k} {v / n:,.4g}" for k, v in total.items()), flush=True)
    if limit_reached.is_set():
        raise SystemExit(stop_code)


if __name__ == "__main__":
    main()
