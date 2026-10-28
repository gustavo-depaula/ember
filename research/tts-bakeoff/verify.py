"""Transcribe every clip back to text and score it against what was asked for.

A machine check for skipped, invented or garbled words, since nobody can
listen to everything. It says nothing about how pleasant a voice is. Latin is
scored with Whisper's Latin mode, which is itself weak, so read Latin numbers
as a ranking between spellings and models, not as an error rate.

    flock /tmp/ember-tts-gpu.lock envs/verify/.venv/bin/python verify.py
    VERIFY_CPU=1 envs/verify/.venv/bin/python verify.py
"""

import json
import os
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel
from jiwer import wer

base = Path(__file__).parent
results = base / "out" / "_verify"
results.mkdir(parents=True, exist_ok=True)
whisperLang = {"en-US": "en", "pt-BR": "pt", "la": "la"}


def plain(text: str, latin: bool = False) -> str:
    text = unicodedata.normalize("NFD", text.lower().replace("æ", "ae").replace("œ", "oe"))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    if latin:
        # Whisper spells Latin as it hears it, so church pronunciation comes back
        # as "celis" for "cælis". Fold the spellings that sound alike in Rome,
        # or the right pronunciation would be scored as an error.
        for old, new in (("ae", "e"), ("oe", "e"), ("ph", "f"), ("y", "i"), ("j", "i"), ("h", "")):
            text = text.replace(old, new)
        text = re.sub(r"(.)\1", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def score(reference: dict, heard: dict[str, str]) -> dict:
    latin = reference["lang"] == "la"
    clips = {}
    for clip, said in heard.items():
        want = plain(reference["clips"][clip], latin)
        clips[clip] = {"wer": round(wer(want, plain(said, latin) or "-"), 3), "heard": said}
    count = lambda c: len(plain(reference["clips"][c], latin).split())  # noqa: E731
    total = sum(clips[c]["wer"] * count(c) for c in clips) / sum(count(c) for c in clips)
    summary = {"wer": round(total, 3), "worst": max(clips, key=lambda c: clips[c]["wer"])}
    if latin:
        # How often "ae" was heard as plain "e", the church way: a rough probe of
        # whether the voice said cælis as "chelis" or as "ka-elis".
        asE = sum(len(re.findall(r"\b(?:cel|nostre|marie|beate|tue|seculorum|terre|misericordie)", plain(h))) for h in heard.values())
        asAe = sum(len(re.findall(r"\b(?:cael|nostrae|mariae|beatae|tuae|saeculorum|terrae|misericordiae)", plain(h))) for h in heard.values())
        summary["aeSaidAsE"] = f"{asE}/{asE + asAe}"
    return {**summary, "clips": clips}


def samples(path: Path) -> np.ndarray:
    """16 kHz mono floats via ffmpeg; faster-whisper's own decoder breaks on current PyAV."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main() -> None:
    # VERIFY_CPU=1 runs without the GPU, slower, for when other models hold it.
    onCpu = bool(os.environ.get("VERIFY_CPU"))
    model = None
    for folder in sorted((base / "out").glob("*/*/*/")):
        if folder.parts[-3].startswith("_") or not (base / "scripts" / f"rosary.{folder.name}.json").exists():
            continue
        target = results / f"{folder.parts[-3]}__{folder.parts[-2]}__{folder.name}.json"
        # Latin is always compared with the corpus spelling, whichever respelling was spoken.
        reference = json.loads((base / "scripts" / f"rosary.{'la-raw' if folder.name.startswith('la') else folder.name}.json").read_text())
        clips = [c for c in reference["clips"] if (folder / f"{c}.wav").exists()]
        if target.exists() or len(clips) < len(reference["clips"]):
            continue
        model = model or (WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=12) if onCpu else WhisperModel("large-v3", device="cuda", compute_type="float16"))
        heard = {}
        for clip in clips:
            segments, _ = model.transcribe(samples(folder / f"{clip}.wav"), language=whisperLang[reference["lang"]], beam_size=5)
            heard[clip] = " ".join(seg.text for seg in segments).strip()
        target.write_text(json.dumps(score(reference, heard), ensure_ascii=False, indent=1) + "\n")
        print(f"transcribed {target.stem}", flush=True)

    # Rescore everything from the stored transcripts, so a scoring change needs no re-listening.
    for target in sorted(results.glob("*.json")):
        variant = target.stem.split("__")[-1]
        reference = json.loads((base / "scripts" / f"rosary.{'la-raw' if variant.startswith('la') else variant}.json").read_text())
        summary = score(reference, {c: v["heard"] for c, v in json.loads(target.read_text())["clips"].items()})
        target.write_text(json.dumps(summary, ensure_ascii=False, indent=1) + "\n")
        print(f"{target.stem.ljust(46)} {summary['wer']:6.1%}  {summary.get('aeSaidAsE', '')}  worst: {summary['worst']}")


if __name__ == "__main__":
    main()
