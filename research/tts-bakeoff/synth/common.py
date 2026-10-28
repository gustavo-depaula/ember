"""Shared by every synth/<model>.py: which clips to make and where they go.

A model script calls `run(model, voice, variants, speak)` where
`speak(text, script) -> (samples, sampleRate)` returns mono float audio.
Clips land in out/<model>/<voice>/<variant>/<clip>.wav and are skipped when
already present, so a crashed run resumes.
"""

import json
import time
from pathlib import Path

base = Path(__file__).resolve().parents[1]
allVariants = ["en-US", "pt-BR", "la-raw", "la-plain", "la-ital"]


def load_script(variant: str) -> dict:
    return json.loads((base / "scripts" / f"rosary.{variant}.json").read_text(encoding="utf-8"))


def run(model: str, voice: str, variants: list[str], speak, only: list[str] | None = None) -> None:
    import soundfile as sf

    for variant in variants:
        script = load_script(variant)
        folder = base / "out" / model / voice / variant
        folder.mkdir(parents=True, exist_ok=True)
        audioSeconds = wallSeconds = 0.0
        for clip, text in script["clips"].items():
            if only and clip not in only:
                continue
            target = folder / f"{clip}.wav"
            if target.exists():
                continue
            started = time.time()
            samples, rate = speak(text, script)
            wallSeconds += time.time() - started
            audioSeconds += len(samples) / rate
            sf.write(target, samples, rate)
        if audioSeconds:
            meta = {"audioSeconds": round(audioSeconds, 1), "wallSeconds": round(wallSeconds, 1)}
            (folder / "_meta.json").write_text(json.dumps(meta) + "\n")
            print(f"{model}/{voice}/{variant}: {audioSeconds:.0f}s audio in {wallSeconds:.0f}s", flush=True)
