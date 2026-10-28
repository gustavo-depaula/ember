"""Voice an edition's utterances.json with Qwen3-TTS, each line cloned from its character's voice.

Clips go to out/drama/<edition>/<clip>.wav; existing ones are kept, so a
stopped run resumes and a re-cut text only voices what changed. Lines are
generated several at a time, grouped by length. A clip whose pace is
implausible (cut short, or run on) is redrawn.

    EDITION=pt-ms flock /tmp/ember-tts-gpu.lock envs/qwen3-tts/.venv/bin/python drama/synth.py
"""

import json
import os
import sys
import time
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

here = Path(__file__).parent
sys.path.insert(0, str(here))
from edition import book, chosen, clips, edition, root, ttsLanguage, voices  # noqa: E402

batchSize = 6
utterances = chosen(json.loads((root / "utterances.json").read_text(encoding="utf-8")))
clips.mkdir(parents=True, exist_ok=True)
todo = {}
for lines in utterances.values():
    for line in lines:
        if not (clips / f"{line['clip']}.wav").exists():
            todo[line["clip"]] = line
todo = sorted(todo.values(), key=lambda u: len(u["text"]))
print(f"{book} {edition}: {len(todo)} clips to voice", flush=True)
if not todo:
    raise SystemExit

tts = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda:0", dtype=torch.bfloat16)
prompts = {
    wav.stem: tts.create_voice_clone_prompt(ref_audio=str(wav), ref_text=wav.with_suffix(".txt").read_text().strip())[0]
    for wav in sorted(voices.glob("*.wav"))
}


def plausible(seconds: float, text: str) -> bool:
    # Speech runs at roughly 10-17 characters a second; far outside that the
    # model stopped early or wandered. Very short lines get more slack.
    pace = len(text) / max(seconds, 0.01)
    return 5 <= pace <= (30 if len(text) < 30 else 24)


def generate(items: list[dict], attempt: int) -> list[np.ndarray]:
    # SEED=1 gives a different take of every clip: delete a bad one and rerun with it.
    torch.manual_seed(zlib.crc32("|".join(i["clip"] for i in items).encode()) + attempt + int(os.environ.get("SEED", 0)))
    wavs, rate = tts.generate_voice_clone(
        text=[i["text"] for i in items],
        language=[ttsLanguage] * len(items),
        voice_clone_prompt=[prompts[i["voice"]] for i in items],
        # Left uncapped, a one-word Portuguese line can run on for minutes of
        # noise and hold its whole batch. Allow the slowest plausible reading
        # (6 characters a second, 12.5 frames a second) and a little room.
        max_new_tokens=int(max(len(i["text"]) for i in items) / 6 * 12.5) + 50,
    )
    assert rate == 24000
    return [np.asarray(w, dtype=np.float32).reshape(-1) for w in wavs]


started = time.time()
audioSeconds = 0.0
redrawn = 0
for at in range(0, len(todo), batchSize):
    batch = todo[at : at + batchSize]
    for item, audio in zip(batch, generate(batch, 0)):
        attempt = 0
        while not plausible(len(audio) / 24000, item["text"]) and attempt < 3:
            attempt += 1
            redrawn += 1
            audio = generate([item], attempt)[0]
        if not plausible(len(audio) / 24000, item["text"]):
            print(f"  still implausible: {item['clip']} {len(audio) / 24000:.1f}s for {len(item['text'])} chars", flush=True)
        sf.write(clips / f"{item['clip']}.wav", audio, 24000)
        audioSeconds += len(audio) / 24000
    if (at // batchSize) % 10 == 9:
        print(f"  {at + len(batch)}/{len(todo)} clips; {audioSeconds / 60:.1f} min audio in {(time.time() - started) / 60:.1f} min", flush=True)
print(f"{book} {edition}: {audioSeconds / 60:.1f} min audio in {(time.time() - started) / 60:.1f} min; {redrawn} redrawn; "
      f"peak VRAM {torch.cuda.max_memory_allocated() // 2**20} MiB", flush=True)
