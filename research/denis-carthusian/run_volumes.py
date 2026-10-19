"""Draft every volume with dots.mocr, resumably (expects `serve.sh dots` on :8000).

    .venv/bin/python run_volumes.py [--parallel 8] [--volumes id ...]

Everything lives under $DENIS_DATA (default ~/ember-data/denis-carthusian):

    zips/<id>_jp2.zip            page images, as the Internet Archive serves them
    dots/<id>/<leaf>.md          the draft, after ocr_local.dots_markdown
    dots/<id>/<leaf>.raw.txt     the model's layout JSON
    dots/<id>/<leaf>.err         the page failed; skipped on restart, retried by --retry-failed
    progress.log

Safe to kill at any moment, including by a power cut: a page's files are written
to a temporary name and renamed into place, a zip is only used once its size
matches the archive's listing, and a restart skips every page already done.
"""

import argparse
import io
import json
import os
import subprocess
import threading
import time
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from openai import OpenAI
from PIL import Image

from ocr_local import dots_markdown, engine_request

here = Path(__file__).parent.resolve()
data = Path(os.environ.get("DENIS_DATA", Path.home() / "ember-data" / "denis-carthusian"))
log_lock = threading.Lock()


def log(message: str) -> None:
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {message}"
    print(line, flush=True)
    with log_lock, open(data / "progress.log", "a") as f:
        f.write(line + "\n")


def write_atomic(path: Path, text: str) -> None:
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w") as f:
        f.write(text)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def expected_size(volume: str) -> int:
    url = f"https://archive.org/metadata/{volume}/files"
    with urllib.request.urlopen(url, timeout=60) as response:
        files = json.load(response)["result"]
    return next(int(f["size"]) for f in files if f["name"] == f"{volume}_jp2.zip")


def fetch(volume: str) -> Path:
    """Download (or resume downloading) a volume's page-image zip."""
    target = data / "zips" / f"{volume}_jp2.zip"
    if target.exists():
        return target
    part = target.with_name(target.name + ".part")
    size = expected_size(volume)
    for attempt in range(8):
        subprocess.run(
            ["curl", "-sSL", "--retry", "5", "-C", "-", "-o", str(part),
             f"https://archive.org/download/{volume}/{volume}_jp2.zip"],
            check=False,
        )
        if part.exists() and part.stat().st_size == size:
            os.replace(part, target)
            log(f"{volume}: downloaded {size // 2**20} MB")
            return target
        time.sleep(30 * (attempt + 1))
    raise RuntimeError(f"{volume}: download incomplete after retries")


def ocr_page(client: OpenAI, zf_path: Path, name: str, out: Path) -> None:
    leaf = Path(name).stem.rsplit("_", 1)[-1]
    with zipfile.ZipFile(zf_path) as zf:
        image = Image.open(io.BytesIO(zf.read(name)))
        image.load()
    content, _ = engine_request("dots", image)
    try:
        reply = client.chat.completions.create(
            model="dots", messages=[{"role": "user", "content": content}], max_tokens=6000, temperature=0.0,
        )
        raw = reply.choices[0].message.content
        markdown = dots_markdown(raw)
    except Exception as error:  # a page that will not parse must not stop the volume
        write_atomic(out / f"{leaf}.err", f"{type(error).__name__}: {error}\n")
        return
    write_atomic(out / f"{leaf}.raw.txt", raw)
    write_atomic(out / f"{leaf}.md", markdown + "\n")


def run_volume(client: OpenAI, volume: str, zf_path: Path, parallel: int, retry_failed: bool) -> None:
    out = data / "dots" / volume
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zf_path) as zf:
        names = sorted(n for n in zf.namelist() if n.endswith(".jp2"))
    if retry_failed:
        for err in out.glob("*.err"):
            err.unlink()

    def pending(name: str) -> bool:
        leaf = Path(name).stem.rsplit("_", 1)[-1]
        return not (out / f"{leaf}.md").exists() and not (out / f"{leaf}.err").exists()

    todo = [n for n in names if pending(n)]
    if not todo:
        return
    log(f"{volume}: {len(todo)} of {len(names)} pages to do")
    start = time.time()
    with ThreadPoolExecutor(parallel) as pool:
        list(pool.map(lambda n: ocr_page(client, zf_path, n, out), todo))
    failed = len(list(out.glob("*.err")))
    log(f"{volume}: done in {(time.time() - start) / 60:.0f} min, {failed} failed pages")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parallel", type=int, default=8)
    parser.add_argument("--volumes", nargs="*")
    parser.add_argument("--retry-failed", action="store_true")
    args = parser.parse_args()
    (data / "zips").mkdir(parents=True, exist_ok=True)
    volumes = args.volumes or [line.split()[0] for line in (here / "volumes.txt").read_text().splitlines() if line.strip()]
    # Downloads go through one queue, one volume ahead of the GPU, so a volume is
    # never fetched twice at once.
    downloads = ThreadPoolExecutor(1)
    zips = {}

    def zip_for(volume: str):
        if volume not in zips:
            zips[volume] = downloads.submit(fetch, volume)
        return zips[volume]

    client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY", timeout=900)
    for i, volume in enumerate(volumes):
        zf_path = zip_for(volume).result()
        if i + 1 < len(volumes):
            zip_for(volumes[i + 1])
        run_volume(client, volume, zf_path, args.parallel, args.retry_failed)
    log("all volumes done")


if __name__ == "__main__":
    main()
