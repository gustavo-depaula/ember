"""Breeze TTS 2 (BreezeBlue/Breeze-TTS-2), eager mode, for the Rosary bake-off.

Run with the model's own venv, under the shared GPU lock:
  flock /tmp/ember-tts-gpu.lock envs/breeze-tts-2/.venv/bin/python synth/breeze_tts_2.py [voice ...]

Voice design samples a new speaker on every call (the prompt carries only the
description and the text), so each designed voice is generated once on a
neutral sentence and that clip is then cloned for every Rosary clip.
"""

import json
import sys
import time
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

base = Path(__file__).resolve().parents[1]
repo = base / "vendor" / "breeze-tts"
weights = base / "vendor" / "breeze-tts-2-weights"
refs = base / "envs" / "breeze-tts-2" / "refs"
sys.path[:0] = [str(base / "synth"), str(repo)]

from breeze_infer.runtime import load_runtime, set_all_seeds, update_generation_config_for_breeze  # noqa: E402
from breeze_infer.templates import get_template, prepare_inputs, select_template_name  # noqa: E402
from common import run  # noqa: E402
from models.fast_streaming import FastBreezeStreamingRuntime, FastStreamingConfig  # noqa: E402

maxNewTokens = 1500
maxSeqLen = 2048
refText = (
    "Peace be with you. Let us take a quiet moment together, "
    "and listen with an open heart to the words that follow."
)
directedInstruction = "Speak slowly with a restrained, serene, prayerful tone."
designs = {
    "design-priest": (
        "A calm, warm, middle-aged male voice, speaking slowly and reverently, "
        "like a priest leading prayer in a quiet chapel."
    ),
    "design-woman": (
        "A calm, gentle, mature female voice, speaking slowly and reverently, "
        "leading prayer in a quiet chapel."
    ),
}
supported = ["en-US"]
# voice -> (designed reference to clone, style instruction, variants)
voices = {
    "design-priest": ("design-priest", None, supported),
    "design-woman": ("design-woman", None, supported),
    "design-priest-directed": ("design-priest", directedInstruction, supported),
    # The model card lists English and Chinese only; these two are the
    # out-of-distribution experiment.
    "design-priest-unsupported": ("design-priest", None, ["pt-BR", "la-ital"]),
}

tokenizer, model, audioTokenizer = load_runtime(weights, device="cuda:0", attn_implementation="eager")
update_generation_config_for_breeze(model)
runtime = FastBreezeStreamingRuntime(
    model,
    audioTokenizer,
    FastStreamingConfig(max_new_tokens=maxNewTokens, max_seq_len=maxSeqLen, repetition_penalty=1.1),
    tokenizer=tokenizer,
)
log = base / "envs" / "breeze-tts-2" / "clips.jsonl"
log.parent.mkdir(parents=True, exist_ok=True)


def generate(text, seed, instruction=None, refAudio=None, tag=""):
    request = {"id": "clip", "text": text, "speaker": "S0"}
    if instruction:
        request["instruction"] = instruction
    if refAudio:
        request["ref_audio_path"] = str(refAudio)
        request["ref_text"] = refText
    template = select_template_name(request)
    set_all_seeds(seed)
    inputs = prepare_inputs(
        tokenizer,
        audioTokenizer,
        model,
        [request],
        get_template(template),
        # The README recommends 4 whenever an instruction is present; the plain
        # clone template has no negative prompt, so it only accepts 1.
        guidance_scale=4.0 if instruction else 1.0,
        guidance_scale_ref=None,
        guidance_scale_ins=None,
    )
    promptLen = int(inputs["input_ids"].shape[1])
    started = time.time()
    chunks = [c.audio for c in runtime.iter_audio_chunks(inputs, request_id="clip", seed=seed)]
    samples = np.concatenate(chunks).astype(np.float32).reshape(-1) if chunks else np.zeros(0, np.float32)
    seconds = len(samples) / runtime.sample_rate
    frames = round(seconds * 12.5)
    record = {
        "tag": tag,
        "template": template,
        "seed": seed,
        "chars": len(text),
        "promptLen": promptLen,
        "audioSeconds": round(seconds, 2),
        "wallSeconds": round(time.time() - started, 2),
        "peak": round(float(np.abs(samples).max()), 3) if len(samples) else 0,
        "rms": round(float(np.sqrt(np.mean(samples**2))), 4) if len(samples) else 0,
        # Generation stops silently at either limit, which cuts the clip short.
        "hitLimit": frames >= maxNewTokens - 2 or promptLen + frames >= maxSeqLen - 3,
        "vramPeakMiB": round(torch.cuda.max_memory_reserved() / 2**20),
    }
    with log.open("a") as f:
        f.write(json.dumps(record) + "\n")
    return samples


def reference(name):
    target = refs / f"{name}.wav"
    if not target.exists():
        refs.mkdir(parents=True, exist_ok=True)
        samples = generate(refText, 42, instruction=designs[name], tag=f"ref/{name}")
        sf.write(target, samples, runtime.sample_rate, subtype="PCM_16")
    return target


def speaker(voice):
    refName, instruction, _ = voices[voice]
    refAudio = reference(refName)
    seen = {}

    def speak(text, script):
        # Identical texts (the three Hail Mary takes) must get different seeds.
        key = f"{voice}/{script['variant']}/{text}"
        seen[key] = seen.get(key, 0) + 1
        seed = zlib.crc32(key.encode()) % 2**31 + seen[key]
        samples = generate(text, seed, instruction, refAudio, tag=f"{voice}/{script['variant']}")
        return samples, runtime.sample_rate

    return speak


for voice in sys.argv[1:] or list(voices):
    run("breeze-tts-2", voice, voices[voice][2], speaker(voice))
print(f"peak torch reserved: {torch.cuda.max_memory_reserved() / 2**20:.0f} MiB", flush=True)
