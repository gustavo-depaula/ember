"""Voice chosen chapters with Kokoro's Brazilian voices, on the CPU.

Kokoro ships three Brazilian voices, too few for a cast. A voice there is a
style vector, and the accent comes from the pt-BR phonemes, so a cast is made
by blending the three with each other and with voices of other languages.
Whether a blend keeps the accent is for the ear to judge. The blends' sample
clips are written to voices/kokoro/ so the page can show them.

    BOOK=mark EDITION=pt-am CHAPTERS=1 VOICESET=kokoro envs/kokoro/.venv/bin/python drama/synth_kokoro.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

here = Path(__file__).parent
sys.path.insert(0, str(here))
from edition import chosen, clips, root, voices  # noqa: E402

# The pip-bundled espeak-ng looks for its data at the path of the CI machine
# that built it; point Kokoro's phonemizer at the system install instead.
import espeakng_loader  # noqa: E402

espeakng_loader.get_library_path = lambda: "/usr/lib/libespeak-ng.so.1"
espeakng_loader.get_data_path = lambda: "/usr/share/espeak-ng-data"

from kokoro import KPipeline  # noqa: E402

# role: (blend of voice weights, speed)
cast = {
    "narrator": ({"pm_alex": 1}, 0.9),
    "jesus": ({"pm_santa": 1}, 0.85),
    "baptist": ({"pm_alex": 0.5, "am_fenrir": 0.5}, 0.95),
    "divine": ({"pm_santa": 0.5, "bm_george": 0.5}, 0.78),
    "spirit": ({"pm_alex": 0.5, "am_onyx": 0.5}, 1.05),
    "crowd": ({"pm_alex": 0.5, "pm_santa": 0.5}, 1.0),
    "man-common": ({"pm_santa": 0.6, "em_alex": 0.4}, 0.95),
    "man-old": ({"pm_alex": 0.5, "im_nicola": 0.5}, 0.82),
    "man-young": ({"pm_santa": 0.6, "am_puck": 0.4}, 1.0),
    "peter": ({"pm_alex": 0.6, "am_michael": 0.4}, 0.95),
    "elder": ({"pm_santa": 0.5, "bm_lewis": 0.5}, 0.85),
    "ruler": ({"pm_alex": 0.5, "bm_daniel": 0.5}, 0.9),
    "woman-mature": ({"pf_dora": 1}, 0.9),
    "woman-young": ({"pf_dora": 0.6, "af_heart": 0.4}, 0.98),
}
sample = "Havia um homem que saiu de manhã cedo para trabalhar no seu campo. E quando o sol estava alto, descansou debaixo de uma árvore."
pipeline = KPipeline(lang_code="p", repo_id="hexgrad/Kokoro-82M", device="cpu")


def speak(role: str, text: str) -> np.ndarray:
    blend, speed = cast[role]
    style = sum(pipeline.load_single_voice(name) * weight for name, weight in blend.items())
    return np.concatenate([np.asarray(audio) for _, _, audio in pipeline(text, voice=style, speed=speed)])


voices.mkdir(parents=True, exist_ok=True)
for role, (blend, speed) in cast.items():
    if not (voices / f"{role}.wav").exists():
        sf.write(voices / f"{role}.wav", speak(role, sample), 24000)
        (voices / f"{role}.txt").write_text(sample)
        mix = " + ".join(f"{name} {weight:g}" for name, weight in blend.items())
        (voices / f"{role}.description.txt").write_text(f"Kokoro: {mix}, speed {speed}")
utterances = chosen(json.loads((root / "utterances.json").read_text(encoding="utf-8")))
clips.mkdir(parents=True, exist_ok=True)
made = 0
for lines in utterances.values():
    for line in lines:
        target = clips / f"{line['clip']}.wav"
        if not target.exists():
            sf.write(target, speak(line["voice"], line["text"]), 24000)
            made += 1
print(f"kokoro: {made} clips")
