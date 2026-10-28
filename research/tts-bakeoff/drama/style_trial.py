"""One-off trial: can a cloned voice shout or whisper if its reference clip does?

Reads out/eleven/style/plan.json (line, reference clip spoken in a style, its
transcript) and voices each line with Qwen from that styled reference.

    BOOK=mark EDITION=pt-am flock /tmp/ember-tts-gpu.lock envs/qwen3-tts/.venv/bin/python drama/style_trial.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

here = Path(__file__).parent
sys.path.insert(0, str(here))
from edition import root, ttsLanguage  # noqa: E402

folder = here.parent / "out" / "eleven" / "style"
plan = json.loads((folder / "plan.json").read_text())
lines = {x["clip"]: x for chapter in json.loads((root / "utterances.json").read_text()).values() for x in chapter}
tts = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda:0", dtype=torch.bfloat16)
for clip, trial in plan.items():
    prompt = tts.create_voice_clone_prompt(ref_audio=str(folder / f"{trial['ref']}.wav"), ref_text=trial["refText"])
    torch.manual_seed(3)
    text = lines[clip]["text"]
    wavs, rate = tts.generate_voice_clone(
        text=[text], language=[ttsLanguage], voice_clone_prompt=prompt, max_new_tokens=int(len(text) / 6 * 12.5) + 50
    )
    sf.write(folder / f"{clip}-qwen-styled.wav", np.asarray(wavs[0], dtype=np.float32).reshape(-1), rate)
    print(clip, trial["tag"], flush=True)
