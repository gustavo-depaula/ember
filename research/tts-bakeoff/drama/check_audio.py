"""Transcribe an edition's clips and score each against its line.

Prints the clips worth redrawing. Pass --redo to delete those so the next
synth run makes them again.

    EDITION=pt-ms flock /tmp/ember-tts-gpu.lock envs/verify/.venv/bin/python drama/check_audio.py [--redo]
"""

import json
import os
import sys
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here.parent))
sys.path.insert(1, str(here))
from faster_whisper import WhisperModel  # noqa: E402
from jiwer import wer  # noqa: E402
from edition import chosen, clips, lang, root  # noqa: E402
from verify import plain, samples  # noqa: E402

store = clips / "_heard.json"
utterances = chosen(json.loads((root / "utterances.json").read_text(encoding="utf-8")))
lines = {line["clip"]: line for chapter in utterances.values() for line in chapter}
heard = json.loads(store.read_text()) if store.exists() else {}
onCpu = bool(os.environ.get("VERIFY_CPU"))
model = None
for clip in lines:
    path = clips / f"{clip}.wav"
    if not path.exists() or (clip in heard and heard[clip]["mtime"] == path.stat().st_mtime):
        continue
    model = model or (
        WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=12)
        if onCpu
        else WhisperModel("large-v3", device="cuda", compute_type="float16")
    )
    # Whisper drifts into repeating itself on very short clips unless told not to lean on prior text.
    segments, _ = model.transcribe(samples(path), language=lang, beam_size=5, condition_on_previous_text=False)
    heard[clip] = {"heard": " ".join(seg.text for seg in segments).strip(), "mtime": path.stat().st_mtime}
store.write_text(json.dumps(heard, ensure_ascii=False, indent=1) + "\n")

words = errors = 0
bad = []
for clip, line in lines.items():
    # Chapter announcements come back as "Chapter 24" for "twenty-four": not an error.
    if clip not in heard or not line["verses"]:
        continue
    want = plain(line["text"])
    score = wer(want, plain(heard[clip]["heard"]) or "-")
    count = len(want.split())
    words += count
    errors += score * count
    # One misheard word in a three-word line is not worth a redraw.
    if score * count >= 2 and score > 0.2:
        bad.append((clip, round(score, 2), line["voice"], line["text"][:70], heard[clip]["heard"][:70]))
print(f"{len(heard)} clips checked, word error rate {errors / max(words, 1):.1%}, {len(bad)} suspect")
for item in bad:
    print(" ", *item, sep=" | ")
if "--redo" in sys.argv:
    for clip, *_ in bad:
        (clips / f"{clip}.wav").unlink()
    print(f"deleted {len(bad)} clips for redrawing")
