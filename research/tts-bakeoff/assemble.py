"""Stitch each model's clips into listenable files.

For every out/<model>/<voice>/<variant>/ holding a full set of clips, writes
out/_listen/<variant>/<model>__<voice>.sampler.m4a (about a minute and a half)
and .full.m4a (the whole Rosary). Standard library plus ffmpeg only.

    python3 assemble.py [--responses <model>/<voice>]   # second voice answers
"""

import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

base = Path(__file__).parent
rate = 24000
samplerClips = [
    "sign-of-cross", "mystery-1", "meditation-1", "our-father",
    "hail-mary.t1", "hail-mary.t2", "glory-be", "fatima-prayer",
]
# In a two-voice file the leader says the first half and the people answer.
halved = {"our-father", "hail-mary", "glory-be"}


def pcm(clip: Path, tmp: Path) -> bytes:
    """Clip as 24 kHz mono 16-bit, edges trimmed so pauses are ours to set, and
    brought to one loudness: some models swing 20 dB from one clip to the next."""
    target = tmp / f"{clip.parent.parent.name}-{clip.parent.name}-{clip.stem}.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05"
    trimmed = f"{trim},areverse,{trim},areverse"
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(clip), "-af", f"{trimmed},volumedetect", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    mean = float(re.search(r"mean_volume: (-?[\d.]+)", probe).group(1))
    peak = float(re.search(r"max_volume: (-?[\d.]+)", probe).group(1))
    gain = min(-23 - mean, -1.5 - peak)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(clip), "-af", f"{trimmed},volume={gain:.1f}dB",
         "-ar", str(rate), "-ac", "1", "-c:a", "pcm_s16le", str(target)],
        check=True,
    )
    with wave.open(str(target)) as w:
        return w.readframes(w.getnframes())


def encode(frames: bytes, target: Path, tmp: Path) -> None:
    raw = tmp / "joined.wav"
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(frames)
    target.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-18:TP=-2",
         "-ar", "44100", "-c:a", "aac", "-b:a", "96k", str(target)],
        check=True,
    )


def silence(ms: int) -> bytes:
    return b"\x00\x00" * (rate * ms // 1000)


def assemble(folder: Path, responses: Path | None) -> None:
    variant = folder.name
    script = json.loads((base / "scripts" / f"rosary.{variant}.json").read_text())
    missing = [c for c in script["clips"] if not (folder / f"{c}.wav").exists()]
    if missing:
        print(f"skip {folder.relative_to(base)}: missing {len(missing)} clips")
        return
    name = f"{folder.parent.parent.name}__{folder.parent.name}"
    if responses and (responses == folder.parent or not (responses / variant).exists()):
        return
    if responses:
        name += f"+{responses.parent.name}-{responses.name}"
    listen = base / "out" / "_listen" / variant
    done = listen / f"{name}.full.m4a"
    newest = max(f.stat().st_mtime for f in folder.glob("*.wav"))
    if done.exists() and done.stat().st_mtime > newest and not responses:
        return
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        cache: dict[Path, bytes] = {}

        def clip(path: Path) -> bytes:
            if path not in cache:
                cache[path] = pcm(path, tmp)
            return cache[path]

        def step(clipId: str, pauseMs: int) -> bytes:
            stem = clipId.split(".t")[0]
            if responses and stem in halved:
                return (
                    clip(folder / f"{stem}.v.wav") + silence(350)
                    + clip(responses / variant / f"{stem}.r.wav") + silence(pauseMs)
                )
            return clip(folder / f"{clipId}.wav") + silence(pauseMs)

        full = b"".join(step(s["clip"], s["pauseMs"]) for s in script["sequence"])
        sampler = b"".join(step(c, 900) for c in samplerClips if c in script["clips"])
        encode(sampler, listen / f"{name}.sampler.m4a", tmp)
        encode(full, listen / f"{name}.full.m4a", tmp)
    print(f"{variant}: {name}  full {len(full) / 2 / rate / 60:.1f} min")


def main() -> None:
    responses = None
    if "--responses" in sys.argv:
        responses = base / "out" / sys.argv[sys.argv.index("--responses") + 1]
    for folder in sorted((base / "out").glob("*/*/*/")):
        # out/ also holds the dramatized books and other trials; only Rosary folders have a script.
        if not (base / "scripts" / f"rosary.{folder.name}.json").exists():
            continue
        assemble(folder, responses)


if __name__ == "__main__":
    main()
