"""Qwen3-TTS (1.7B, 12Hz) Rosary clips.

  python qwen3_tts.py custom [--voices serena uncle-fu] [--variants ...] [--only clip ...]
  python qwen3_tts.py design [--variants ...] [--only clip ...]

`custom` uses the CustomVoice model's built-in speakers with a style instruction.
`design` makes one reference clip with the VoiceDesign model, then clones it with
the Base model so the same voice speaks every language.
"""

import argparse
import sys
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import allVariants, base, run  # noqa: E402
from qwen_tts import Qwen3TTSModel  # noqa: E402

model = "qwen3-tts"
repo = "Qwen/Qwen3-TTS-12Hz-1.7B-"
speakers = {"serena": "Serena", "uncle-fu": "Uncle_Fu", "aiden": "Aiden", "ryan": "Ryan", "sohee": "Sohee"}
prayerInstruct = (
    "Speak slowly, calmly and reverently, in a warm, quiet, unhurried voice, "
    "like someone leading prayer in a quiet chapel. Not dramatic, not cheerful."
)
designInstruct = (
    "A calm, warm, middle-aged male voice, speaking slowly and reverently, "
    "like a priest leading prayer in a quiet chapel."
)
refText = (
    "Let us pray. O God, whose only-begotten Son, by his life, death and resurrection, "
    "has purchased for us the rewards of eternal life, grant, we beseech thee, "
    "that we may imitate what they contain, and obtain what they promise."
)
refWav = base / "out" / "_refs" / "design-priest.wav"


def load(kind: str) -> Qwen3TTSModel:
    return Qwen3TTSModel.from_pretrained(repo + kind, device_map="cuda:0", dtype=torch.bfloat16)


def language(script: dict) -> str:
    code = script.get("speakAs") or script["lang"]
    return {"en": "English", "pt": "Portuguese", "it": "Italian"}[code.split("-")[0]]


def seed_for(text: str) -> None:
    # Sampling is stochastic; a per-text seed makes a resumed run reproduce the same clip.
    torch.manual_seed(zlib.crc32(text.encode()))


def mono(wav) -> np.ndarray:
    return np.asarray(wav, dtype=np.float32).reshape(-1)


def run_custom(voices: list[str], variants: list[str], only) -> None:
    tts = load("CustomVoice")
    print("languages:", tts.get_supported_languages(), "speakers:", tts.get_supported_speakers(), flush=True)
    for voice in voices:

        def speak(text, script, speaker=speakers[voice]):
            seed_for(text)
            wavs, rate = tts.generate_custom_voice(
                text=text, language=language(script), speaker=speaker, instruct=prayerInstruct
            )
            return mono(wavs[0]), rate

        run(model, voice, variants, speak, only)


def make_reference() -> None:
    if refWav.exists():
        return
    design = load("VoiceDesign")
    print("design languages:", design.get_supported_languages(), flush=True)
    torch.manual_seed(1917)
    wavs, rate = design.generate_voice_design(text=refText, language="English", instruct=designInstruct)
    refWav.parent.mkdir(parents=True, exist_ok=True)
    sf.write(refWav, mono(wavs[0]), rate)
    refWav.with_suffix(".txt").write_text(refText + "\n")
    print(f"reference: {len(wavs[0]) / rate:.1f}s", flush=True)
    del design
    torch.cuda.empty_cache()


def run_design(variants: list[str], only) -> None:
    make_reference()
    tts = load("Base")
    print("base languages:", tts.get_supported_languages(), flush=True)
    prompt = tts.create_voice_clone_prompt(ref_audio=str(refWav), ref_text=refText)

    def speak(text, script):
        seed_for(text)
        wavs, rate = tts.generate_voice_clone(text=text, language=language(script), voice_clone_prompt=prompt)
        return mono(wavs[0]), rate

    run(model, "design-priest", variants, speak, only)


parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["custom", "design"])
parser.add_argument("--voices", nargs="+", default=["serena", "uncle-fu"])
parser.add_argument("--variants", nargs="+", default=allVariants)
parser.add_argument("--only", nargs="+")
args = parser.parse_args()
if args.mode == "custom":
    run_custom(args.voices, args.variants, args.only)
else:
    run_design(args.variants, args.only)
print("peak VRAM (torch) MiB:", torch.cuda.max_memory_allocated() // 2**20, flush=True)
