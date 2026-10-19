"""Have Claude proofread dots.mocr drafts through the Claude Code subscription.

    .venv/bin/python check_pages.py <draft-dir> <out-dir> <image>... [--effort low] [--parallel 4]

One headless `claude -p` call per page, stripped to the fix-list instructions and
the Read tool (to view the image). A subagent carries a ~60k-token system prompt
before it reads a page; this carries ~3.5k, which is what makes the subscription
go far enough for 25k pages. Each call's reply goes to <stem>.jsonl and its
usage to <stem>.usage.json.
"""

import argparse
import json
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

here = Path(__file__).parent.resolve()
# Outside the repo, so neither CLAUDE.md nor the project memory loads into the call.
workdir = Path(tempfile.gettempdir()) / "denis-check"


def cropped(image: Path, draft_dir: Path, height: int) -> Path:
    """The page cut to its text and margin notes, from the draft's layout boxes.

    The image is most of what a check costs, and the page's blank border and
    running head carry nothing the check needs.
    """
    page = Image.open(image)
    boxes = [c["bbox"] for c in json.loads((draft_dir / f"{image.stem}.raw.txt").read_text())
             if c.get("category") not in ("Page-header", "Page-footer")]
    # The boxes are in the frame dots.mocr saw, scaled to at most 4 MP (ocr_local.fit_pixels).
    scale = min(1.0, (4_000_000 / (page.width * page.height)) ** 0.5)
    pad = 20
    x0, y0 = min(b[0] for b in boxes) - pad, min(b[1] for b in boxes) - pad
    x1, y1 = max(b[2] for b in boxes) + pad, max(b[3] for b in boxes) + pad
    crop = page.crop((max(0, round(x0 / scale)), max(0, round(y0 / scale)),
                      min(page.width, round(x1 / scale)), min(page.height, round(y1 / scale))))
    if crop.height > height:
        crop = crop.resize((round(crop.width * height / crop.height), height), Image.Resampling.LANCZOS)
    path = workdir / f"{image.stem}.crop{height}.jpg"
    crop.convert("RGB").save(path, quality=90)
    return path


def check(image: Path, draft_dir: Path, out: Path, effort: str, crop: int | None) -> dict:
    stem = image.stem
    draft = (draft_dir / f"{stem}.md").read_text()
    if crop:
        image = cropped(image, draft_dir, crop)
    reply = subprocess.run(
        [
            "claude", "-p", "--model", "sonnet", "--effort", effort,
            "--system-prompt", (here / "fix-prompt.md").read_text(),
            "--tools", "Read", "--allowedTools", "Read",
            "--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--no-session-persistence", "--output-format", "json",
            f"Page image: {image.resolve()} (view it with Read). Draft transcription:\n\n{draft}",
        ],
        cwd=workdir, capture_output=True, text=True, check=True,
    )
    result = json.loads(reply.stdout)
    if result.get("is_error"):
        raise RuntimeError(f"{stem}: {result.get('result')}")
    lines = [line for line in result["result"].splitlines() if line.strip().startswith("{")]
    (out / f"{stem}.jsonl").write_text("\n".join(lines) + "\n")
    usage = {**result["usage"], "total_cost_usd": result["total_cost_usd"]}
    (out / f"{stem}.usage.json").write_text(json.dumps(usage, indent=2))
    print(f"{stem}: {len(lines)} fixes, ${result['total_cost_usd']:.4f}", flush=True)
    return usage


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("draft_dir", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--effort", default="high")
    parser.add_argument("--parallel", type=int, default=4)
    parser.add_argument("--crop", type=int, help="crop to the text and scale to this height in pixels")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    workdir.mkdir(exist_ok=True)
    with ThreadPoolExecutor(args.parallel) as pool:
        usages = list(pool.map(lambda i: check(i, args.draft_dir, args.out, args.effort, args.crop), args.images))
    n = len(usages)
    total = {k: sum(u[k] for u in usages) for k in ("cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens", "total_cost_usd")}
    print(f"{n} pages · per page: " + ", ".join(f"{k} {v / n:,.4g}" for k, v in total.items()))


if __name__ == "__main__":
    main()
