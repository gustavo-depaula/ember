"""Kokoro 82M. Small enough to run on the CPU, so it never waits for the GPU.

    envs/kokoro/.venv/bin/python synth/kokoro_synth.py
"""

import re
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from common import allVariants, run  # noqa: E402

# The pip-bundled espeak-ng looks for its data at the path of the CI machine
# that built it; point Kokoro's phonemizer at the system install instead.
import espeakng_loader  # noqa: E402

espeakng_loader.get_library_path = lambda: "/usr/lib/libespeak-ng.so.1"
espeakng_loader.get_data_path = lambda: "/usr/share/espeak-ng-data"

from kokoro import KPipeline  # noqa: E402

# Kokoro's voices belong to one language each, so a "voice" here is a trio.
voices = {
    "male": {"en-US": ("a", "am_michael"), "pt-BR": ("p", "pm_alex"), "la": ("i", "im_nicola")},
    "female": {"en-US": ("a", "af_heart"), "pt-BR": ("p", "pf_dora"), "la": ("i", "if_sara")},
    "male-british": {"en-US": ("b", "bm_george")},
}
speed = 0.88
pipelines: dict[str, KPipeline] = {}


def speaker(trio: dict):
    def speak(text: str, script: dict):
        code, voice = trio[script["lang"]]
        if code not in pipelines:
            pipelines[code] = KPipeline(lang_code=code, repo_id="hexgrad/Kokoro-82M", device="cpu")
        if script.get("speakAs") == "ipa":
            # Phonemes go straight to the model, a sentence at a time (it takes about 500 symbols).
            sentences = [s.strip() for s in re.split(r"(?<=[.:;])\s+", text) if s.strip()]
            results = [r for s in sentences for r in pipelines[code].generate_from_tokens(s, voice=voice, speed=speed)]
            chunks = [r.audio for r in results]
        else:
            chunks = [audio for _, _, audio in pipelines[code](text, voice=voice, speed=speed)]
        return np.concatenate([np.asarray(c) for c in chunks]), 24000

    return speak


for name, trio in voices.items():
    variants = [v for v in allVariants if v.split("-")[0] in {k.split("-")[0] for k in trio}]
    run("kokoro", name, variants + (["la-ipa"] if "la" in trio else []), speaker(trio))
