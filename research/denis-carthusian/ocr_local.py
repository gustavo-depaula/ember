"""Transcribe pages with a local OCR model served by `vllm serve` (see README).

    .venv/bin/python ocr_local.py <engine> <image>... [--out out/<engine>]

Each engine is sent its project's own prompt at its own image size, and its raw
reply is kept beside the markdown so a bad score can be traced to the model or
to the post-processing here.
"""

import argparse
import base64
import io
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from openai import OpenAI
from PIL import Image

dots_layout_prompt = """Please output the layout information from the PDF image, including each layout element's bbox, its category, and the corresponding text content within the bbox.

1. Bbox format: [x1, y1, x2, y2]

2. Layout Categories: The possible categories are ['Caption', 'Footnote', 'Formula', 'List-item', 'Page-footer', 'Page-header', 'Picture', 'Section-header', 'Table', 'Text', 'Title'].

3. Text Extraction & Formatting Rules:
    - Picture: For the 'Picture' category, the text field should be omitted.
    - Formula: Format its text as LaTeX.
    - Table: Format its text as HTML.
    - All Others (Text, Title, etc.): Format their text as Markdown.

4. Constraints:
    - The output text must be the original text from the image, with no translation.
    - All layout elements must be sorted according to human reading order.

5. Final Output: The entire output must be a single JSON object.
"""


def fit_pixels(image: Image.Image, max_pixels: int) -> Image.Image:
    w, h = image.size
    if w * h <= max_pixels:
        return image
    scale = (max_pixels / (w * h)) ** 0.5
    return image.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def fit_long_side(image: Image.Image, long_side: int) -> Image.Image:
    scale = long_side / max(image.size)
    return image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)


def data_url(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def dots_markdown(raw: str) -> str:
    cells = [c for c in json.loads(raw) if c.get("category") not in ("Page-header", "Page-footer", "Picture")]
    widths = sorted(c["bbox"][2] - c["bbox"][0] for c in cells if c["category"] == "Text")
    column = widths[len(widths) // 2] if widths else 0
    body, margin = [], []
    for c in cells:
        text = c.get("text", "").strip()
        # Scripture references and verse numbers printed in the outer margins come back
        # as Text blocks a fraction of a column wide.
        if c["category"] == "Text" and c["bbox"][2] - c["bbox"][0] < column * 0.3:
            margin.append(text)
            continue
        if c["category"] in ("Section-header", "Title"):
            body.append("## " + text.lstrip("# "))
            continue
        # The A–D section letters in the gutter get read into the start of the next column.
        text = re.sub(r"\A[A-D] (?=[a-zæœ])", "", text)
        prev = body[-1] if body else ""
        if prev and not prev.startswith("#") and not re.search(r"[.:?!»]\**\Z", prev) and re.match(r"[a-zæœ*]", text):
            # A paragraph that runs across the column break is two layout blocks.
            body[-1] = prev[:-1] + text if prev.endswith("-") else f"{prev} {text}"
            continue
        body.append(text)
    notes = f"\n\n<!-- margin: {' | '.join(margin)} -->" if margin else ""
    return "\n\n".join(body) + notes


def olmocr_markdown(raw: str) -> str:
    return re.sub(r"\A---\n.*?\n---\n", "", raw, flags=re.S).strip()


def chandra_markdown(raw: str) -> str:
    from chandra.output import parse_markdown

    return parse_markdown(raw)


def engine_request(engine: str, image: Image.Image) -> tuple[list, int]:
    if engine == "dots":
        content = [
            {"type": "image_url", "image_url": {"url": data_url(fit_pixels(image, 4_000_000))}},
            {"type": "text", "text": dots_layout_prompt},
        ]
        return content, 16_000
    if engine == "olmocr":
        from olmocr.prompts.prompts import build_no_anchoring_v4_yaml_prompt

        content = [
            {"type": "text", "text": build_no_anchoring_v4_yaml_prompt()},
            {"type": "image_url", "image_url": {"url": data_url(fit_long_side(image, 1288))}},
        ]
        return content, 8_000
    if engine == "chandra":
        from chandra.model.util import scale_to_fit
        from chandra.prompts import PROMPT_MAPPING

        content = [
            {"type": "image_url", "image_url": {"url": data_url(scale_to_fit(image))}},
            {"type": "text", "text": PROMPT_MAPPING["ocr_layout"]},
        ]
        return content, 12_000
    raise SystemExit(f"unknown engine {engine}")


to_markdown = {"dots": dots_markdown, "olmocr": olmocr_markdown, "chandra": chandra_markdown}


def transcribe(client: OpenAI, model: str, engine: str, path: Path, out: Path) -> float:
    content, max_tokens = engine_request(engine, Image.open(path))
    start = time.time()
    reply = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": content}],
        max_tokens=max_tokens,
        temperature=0.0,
    )
    elapsed = time.time() - start
    raw = reply.choices[0].message.content
    (out / f"{path.stem}.raw.txt").write_text(raw)
    (out / f"{path.stem}.md").write_text(to_markdown[engine](raw) + "\n")
    print(f"{path.name}: {elapsed:.1f}s, {reply.usage.completion_tokens} tokens out", flush=True)
    return elapsed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("engine", choices=sorted(to_markdown))
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--parallel", type=int, default=1)
    args = parser.parse_args()
    out = args.out or Path(__file__).parent / "out" / args.engine
    out.mkdir(parents=True, exist_ok=True)
    client = OpenAI(base_url=f"http://localhost:{args.port}/v1", api_key="EMPTY")
    model = client.models.list().data[0].id
    start = time.time()
    with ThreadPoolExecutor(args.parallel) as pool:
        list(pool.map(lambda p: transcribe(client, model, args.engine, p, out), args.images))
    print(f"{len(args.images)} pages in {time.time() - start:.1f}s")


if __name__ == "__main__":
    main()
