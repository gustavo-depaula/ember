"""Voice chosen chapters with Chatterbox, each line cloned from its character's reference clip.

A trial of whether another open model keeps a Brazilian reference's accent,
which Qwen's cloning does not. VOICESET names the model (chatterbox-v3 is the
multilingual one, chatterbox-ptbr its pt-BR finetune) and REFS the voice set
holding the reference clips.

    BOOK=mark EDITION=pt-am CHAPTERS=1 VOICESET=chatterbox-ptbr REFS=pt-el1 \
        flock /tmp/ember-tts-gpu.lock envs/chatterbox/.venv/bin/python drama/synth_chatterbox.py
"""

import json
import os
import sys
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

here = Path(__file__).parent
sys.path.insert(0, str(here))
sys.path.insert(1, str(here.parent / "synth"))
from chatterbox_synth import brazilian_model, gapSeconds, multilingual_model, split_text, tokenCapSeconds  # noqa: E402
from edition import chosen, clips, lang, root, voiceSet  # noqa: E402

# The defaults: a dramatized reading wants more life than the Rosary's even tone.
exaggeration = 0.5
cfgWeight = 0.5
refs = here / "voices" / os.environ["REFS"]
utterances = chosen(json.loads((root / "utterances.json").read_text(encoding="utf-8")))
clips.mkdir(parents=True, exist_ok=True)
todo = [line for lines in utterances.values() for line in lines if not (clips / f"{line['clip']}.wav").exists()]
# One voice at a time: the reference is loaded into the model, not passed per call.
todo.sort(key=lambda line: line["voice"])
print(f"{voiceSet}: {len(todo)} clips to voice", flush=True)
model, _ = (brazilian_model if voiceSet.endswith("ptbr") else multilingual_model)()
loaded = None
for line in todo:
    if line["voice"] != loaded:
        loaded = line["voice"]
        model.prepare_conditionals(str(refs / f"{loaded}.wav"), exaggeration=exaggeration)
    parts = []
    for chunk in split_text(line["text"]):
        # A call that runs to the 40 s cap is a runaway generation, not speech: redraw.
        for attempt in range(4):
            torch.manual_seed(zlib.crc32(chunk.encode()) + 1000 * attempt + int(os.environ.get("SEED", 0)))
            wav = model.generate(chunk, language_id=lang, exaggeration=exaggeration, cfg_weight=cfgWeight)
            wav = wav.squeeze(0).cpu().numpy().astype(np.float32)
            if len(wav) / model.sr < tokenCapSeconds:
                break
        parts += [wav, np.zeros(int(gapSeconds * model.sr), dtype=np.float32)]
    sf.write(clips / f"{line['clip']}.wav", np.concatenate(parts[:-1]), model.sr)
print(f"{voiceSet}: done", flush=True)
