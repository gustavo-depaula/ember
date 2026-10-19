"""Transcribe pages with Mistral OCR (needs MISTRAL_API_KEY).

    .venv/bin/python ocr_mistral.py <image>... [--model mistral-ocr-latest] [--out out/mistral]

The full JSON reply is kept beside the markdown: its blocks carry labels and
bounding boxes, which the post-processing may need once we see how Mistral
labels the margin references and running heads.
"""

import argparse
import base64
import json
import os
import time
import urllib.request
from pathlib import Path


def ocr(path: Path, model: str) -> dict:
    image = "data:image/jpeg;base64," + base64.b64encode(path.read_bytes()).decode()
    body = {"model": model, "document": {"type": "image_url", "image_url": image}, "include_blocks": True}
    request = urllib.request.Request(
        "https://api.mistral.ai/v1/ocr",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=300) as response:
        return json.load(response)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--model", default="mistral-ocr-latest")
    parser.add_argument("--out", type=Path, default=Path(__file__).parent / "out" / "mistral")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    for path in args.images:
        start = time.time()
        reply = ocr(path, args.model)
        (args.out / f"{path.stem}.raw.json").write_text(json.dumps(reply, ensure_ascii=False, indent=1))
        (args.out / f"{path.stem}.md").write_text("\n\n".join(p["markdown"] for p in reply["pages"]) + "\n")
        print(f"{path.name}: {time.time() - start:.1f}s, model {reply.get('model')}, usage {reply.get('usage_info')}", flush=True)


if __name__ == "__main__":
    main()
