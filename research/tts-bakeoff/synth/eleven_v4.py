"""ElevenLabs v4 on the Rosary, as the commercial yardstick beside the local models.

One designed voice per language, saved to the account by this script the first
time. Latin is the Italian-respelled text read by the Italian voice.

    envs/kokoro/.venv/bin/python synth/eleven_v4.py
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

base = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(base / "drama"))
import eleven  # noqa: E402
from common import run  # noqa: E402

priest = "Male, 50 to 60. Studio quality. Persona: priest leading prayer. Emotion: calm, warm, reverent. A measured, unhurried voice, praying aloud in a quiet chapel; never dramatic, never cheerful."
voices = {
    "en": ("Native English speaker with a neutral accent. " + priest,
           "Let us pray. O God, whose only-begotten Son, by his life, death and resurrection, has purchased for us the rewards of eternal life, grant, we beseech thee, that we may imitate what they contain."),
    "it": ("Native Italian speaker from Rome. " + priest,
           "Preghiamo. O Dio, il cui unico Figlio, con la sua vita, morte e risurrezione, ci ha procurato i beni della salvezza eterna, concedi a noi di imitare ciò che contengono e di ottenere ciò che promettono."),
}
store = base / "drama" / "voices" / "rosary-el.ids.json"
ids = json.loads(store.read_text()) if store.exists() else {}
for code, (description, sample) in voices.items():
    if code not in ids:
        generated, _ = eleven.design(description, sample, seed=11)[0]
        ids[code] = eleven.keep(generated, f"ember-priest-{code}", description[:480])
        store.write_text(json.dumps(ids, indent=1) + "\n")
# The Brazilian narrator designed for Mark leads the Portuguese.
ids["pt"] = json.loads((base / "drama" / "voices" / "pt-el1.ids.json").read_text())["narrator"]


def speak(text: str, script: dict):
    code = script.get("speakAs") or script["lang"].split("-")[0]
    mp3 = eleven.speak(ids[code], text, language_code=code)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "f32le", "-ac", "1", "-ar", "24000", "-"],
                         input=mp3, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32), 24000


before = eleven.used()
run("eleven-v4", "priest", ["pt-BR", "en-US", "la-ital"], speak)
print("counter moved by", eleven.used() - before)
