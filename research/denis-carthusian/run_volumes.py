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
import hashlib
import io
import json
import os
import subprocess
import threading
import time
import urllib.request
import zipfile
from concurrent.futures import Future, ThreadPoolExecutor
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


# Page images come as a zip of JPEG 2000s; a few Google scans have only TIFFs.
image_zips = ("jp2", "tif")


def expected(volume: str) -> tuple[str, int, str]:
    """Name, size and MD5 of the volume's page-image zip, as the archive lists them."""
    url = f"https://archive.org/metadata/{volume}/files"
    with urllib.request.urlopen(url, timeout=60) as response:
        files = {f["name"]: f for f in json.load(response)["result"]}
    for kind in image_zips:
        entry = files.get(f"{volume}_{kind}.zip")
        if entry:
            return entry["name"], int(entry["size"]), entry["md5"]
    raise FileNotFoundError(f"{volume} has no page-image zip ({', '.join(image_zips)})")


def volume_zip(volume: str) -> Path | None:
    """The volume's page-image zip on disk, whichever kind it is."""
    return next((p for kind in image_zips if (p := data / "zips" / f"{volume}_{kind}.zip").exists()), None)


def md5(path: Path) -> str:
    digest = hashlib.md5()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def fetch(volume: str) -> Path:
    """Download a volume's page-image zip, checked against the archive's MD5."""
    if on_disk := volume_zip(volume):
        return on_disk
    name, size, checksum = expected(volume)
    target = data / "zips" / name
    part = target.with_name(target.name + ".part")
    for attempt in range(8):
        # Always from the start: the archive's download servers do not all honour byte
        # ranges, and a resume against one fails, or splices in the wrong bytes.
        part.unlink(missing_ok=True)
        subprocess.run(
            ["curl", "-sSL", "--retry", "5", "-o", str(part),
             f"https://archive.org/download/{volume}/{name}"],
            check=False,
        )
        # The size alone is not enough: a resumed download once came out the right
        # length with a corrupt page inside (vol. 17, leaf 0443).
        if part.exists() and part.stat().st_size == size:
            if md5(part) == checksum:
                os.replace(part, target)
                log(f"{volume}: downloaded {size // 2**20} MB")
                return target
            log(f"{volume}: download corrupt (MD5 mismatch); fetching again")
            part.unlink()
        time.sleep(30 * (attempt + 1))
    raise RuntimeError(f"{volume}: download incomplete after retries")


def page_image(zf_path: Path, name: str) -> Image.Image:
    """A page from the volume's zip; if that entry is unreadable, the single page from the archive."""
    try:
        with zipfile.ZipFile(zf_path) as zf:
            data_ = zf.read(name)
    except zipfile.BadZipFile:
        volume, leaf = Path(name).stem.rsplit("_", 1)
        # The archive serves one file out of the zip by its path. (Its /page/nN
        # images are numbered differently from the leaves, so they could be the wrong page.)
        url = f"https://archive.org/download/{volume}/{zf_path.name}/{name}"
        with urllib.request.urlopen(url, timeout=300) as response:
            data_ = response.read()
        log(f"{volume}: leaf {leaf} unreadable in the zip; fetched the page on its own")
    image = Image.open(io.BytesIO(data_))
    image.load()
    return image


def ocr_page(client: OpenAI, zf_path: Path, name: str, out: Path) -> None:
    leaf = Path(name).stem.rsplit("_", 1)[-1]
    # Everything that can go wrong with one page, reading its image included, stays
    # with that page: an uncaught error here once restarted the service in a loop for
    # twelve hours on a single unreadable leaf.
    try:
        image = page_image(zf_path, name)
        content, _ = engine_request("dots", image)
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
        names = sorted(n for n in zf.namelist() if n.endswith((".jp2", ".tif")))
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
    # One background thread downloads the missing zips in order, so a volume is never
    # fetched twice at once; the GPU takes whichever volume is ready first, so a slow
    # download does not leave it idle.
    downloads = ThreadPoolExecutor(1)
    zips = {}
    for v in volumes:
        on_disk = volume_zip(v)
        if on_disk:  # ready now, not queued behind a slow download
            zips[v] = Future()
            zips[v].set_result(on_disk)
        else:
            zips[v] = downloads.submit(fetch, v)
    client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY", timeout=900)
    pending = list(volumes)
    while pending:
        ready = next((v for v in pending if zips[v].done()), None)
        if ready is None:
            time.sleep(30)
            continue
        pending.remove(ready)
        if zips[ready].exception():
            log(f"{ready}: skipped, download failed: {zips[ready].exception()!r}")
            continue
        run_volume(client, ready, zips[ready].result(), args.parallel, args.retry_failed)
    log("all volumes done")


if __name__ == "__main__":
    main()
