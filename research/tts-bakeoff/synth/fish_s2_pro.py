"""Fish Audio S2 Pro (fishaudio/s2-pro, official bf16 weights) through the fish-speech repo.

Run from the fish-s2-pro venv, under the shared GPU lock:
  flock /tmp/ember-tts-gpu.lock envs/fish-s2-pro/.venv/bin/python synth/fish_s2_pro.py

The model has no language parameter: it reads the language off the text, so the
Latin variants cannot be forced to Italian and `speakAs` is ignored.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

here = Path(__file__).resolve().parent
base = here.parent
sys.path.insert(0, str(here))
sys.path.insert(0, str(base / "vendor" / "fish-speech"))

import numpy as np
import torch
from common import allVariants, run

from fish_speech.models.text2semantic.inference import decode_one_token_ar, generate_long
from fish_speech.models.text2semantic.llama import DualARTransformer
from fish_speech.utils import set_seed

checkpoint = Path(os.environ.get("FISH_CHECKPOINT", base / "envs" / "fish-s2-pro" / "checkpoints" / "s2-pro"))
logPath = base / "envs" / "fish-s2-pro" / "logs" / "clips.jsonl"
device = "cuda"
# FISH_SEED redraws a clip that came out truncated: delete it and rerun with --only.
seed = int(os.environ.get("FISH_SEED", 1234))
temperature = 0.8
topP = 0.8
topK = 30
# The shipped config asks for a 32768-token context, whose KV cache (4.8 GB) and
# causal mask (1 GB) are what push the model past 12 GB. The longest clip here
# needs about 1500 tokens, reference included.
maxSeqLen = 4096
# The codec stays on the CPU in float32: the language model alone takes 10 GB of
# the 12, and decoding a minute of 44.1 kHz audio needs gigabytes of activations.
codecMaskLen = 8192
# Codec frames per second; a clip is capped well above any plausible reading pace
# so a generation that never emits its end token cannot run to the context limit.
framesPerSecond = 21.5
tag = "[calm, slow, reverent tone]"
anchorClip = "glory-be"
refWav = base / "out" / "_refs" / "design-priest.wav"
refTxt = base / "out" / "_refs" / "design-priest.txt"


def load():
    model = DualARTransformer.from_pretrained(checkpoint, load_weights=True, max_length=maxSeqLen)
    model = model.to(device=device, dtype=torch.bfloat16).eval()
    with torch.device(device):
        model.setup_caches(max_batch_size=1, max_seq_len=maxSeqLen, dtype=torch.bfloat16)
    model._cache_setup_done = True
    decode = decode_one_token_ar
    if os.environ.get("FISH_COMPILE"):
        decode = torch.compile(decode, backend="inductor", mode="default", fullgraph=True, dynamic=True)
    return model, load_codec(), decode


def load_codec():
    from hydra.utils import instantiate
    from omegaconf import OmegaConf

    config = OmegaConf.load(base / "vendor" / "fish-speech" / "fish_speech" / "configs" / "modded_dac_vq.yaml")
    codec = instantiate(config)
    state = torch.load(checkpoint / "codec.pth", map_location="cpu", mmap=True, weights_only=True)
    state = state.get("state_dict", state)
    if any("generator" in key for key in state):
        state = {key.replace("generator.", ""): value for key, value in state.items() if "generator." in key}
    print("codec:", codec.load_state_dict(state, strict=False, assign=True), flush=True)
    # Every transformer inside the codec registers a 32768x32768 boolean causal
    # mask, 1 GB apiece; cut them to what a minute-long clip can index.
    for module in codec.modules():
        mask = getattr(module, "causal_mask", None)
        if isinstance(mask, torch.Tensor) and mask.shape[0] > codecMaskLen:
            module.causal_mask = mask[:codecMaskLen, :codecMaskLen].clone()
    return codec.eval()


def encode_reference(codec, path):
    import torchaudio

    wav, rate = torchaudio.load(str(path))
    wav = torchaudio.functional.resample(wav.mean(dim=0), rate, codec.sample_rate)
    lengths = torch.tensor([wav.shape[0]], dtype=torch.long)
    with torch.inference_mode():
        codes, featureLengths = codec.encode(wav[None, None], lengths)
    return codes[0, :, : featureLengths[0]].cpu()


def anchor_reference(codec):
    """With no reference the model picks a new speaker for every clip. This pins
    one: the `default` voice's own rendering of a short prayer becomes the
    reference, per language, with the three Latin spellings sharing one anchor."""
    cache = {}

    def reference(script):
        variant = "la-plain" if script["lang"] == "la" else script["variant"]
        if variant not in cache:
            wav = base / "out" / "fish-s2-pro" / "default" / variant / f"{anchorClip}.wav"
            text = json.loads((base / "scripts" / f"rosary.{variant}.json").read_text())["clips"][anchorClip]
            cache[variant] = (text, encode_reference(codec, wav))
        return cache[variant]

    return reference


def make_speak(model, decode, codec, voice, prefix="", reference=None):
    def speak(text, script):
        # The takes (hail-mary.t1..t3) share one text, and one seed would make them
        # the same audio. The harness asks for clips in script order and skips the
        # ones on disk, so the clip being asked for is the first missing one.
        folder = base / "out" / "fish-s2-pro" / voice / script["variant"]
        sameText = [clip for clip, other in script["clips"].items() if other == text]
        take = next((i for i, clip in enumerate(sameText) if not (folder / f"{clip}.wav").exists()), 0)
        set_seed(seed + take)
        prompt = reference(script) if reference else None
        cap = int(len(text) / 4 * framesPerSecond) + 200
        started = time.time()
        codes = [
            r.codes
            for r in generate_long(
                model=model,
                device=device,
                decode_one_token=decode,
                text=f"<|speaker:0|>{prefix}{text}",
                max_new_tokens=cap,
                temperature=temperature,
                top_p=topP,
                top_k=topK,
                prompt_text=[prompt[0]] if prompt else None,
                prompt_tokens=[prompt[1]] if prompt else None,
            )
            if r.action == "sample"
        ]
        merged = torch.cat(codes, dim=1)
        with torch.inference_mode():
            audio = codec.from_indices(merged[None].cpu())[0, 0]
        samples = audio.float().cpu().numpy()
        frames = merged.shape[1]
        logPath.parent.mkdir(parents=True, exist_ok=True)
        with logPath.open("a") as log:
            entry = {
                "voice": voice,
                "take": take,
                "variant": script.get("variant"),
                "chars": len(text),
                "frames": frames,
                # One short of the cap: generate() spends a slot on the end token it never got.
                "hitCap": frames >= cap - 1,
                "audioSeconds": round(len(samples) / codec.sample_rate, 2),
                "wallSeconds": round(time.time() - started, 2),
                "peakVramGb": round(torch.cuda.max_memory_allocated() / 1e9, 2),
                "text": text[:40],
            }
            log.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return samples.astype(np.float32), codec.sample_rate

    return speak


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voices", nargs="+", default=["default", "default-tagged", "clone-priest"])
    parser.add_argument("--variants", nargs="+", default=allVariants)
    parser.add_argument("--only", nargs="+")
    args = parser.parse_args()

    model, codec, decode = load()
    for voice in args.voices:
        if voice == "default":
            speak = make_speak(model, decode, codec, voice)
        elif voice == "default-tagged":
            speak = make_speak(model, decode, codec, voice, prefix=f"{tag} ")
        elif voice == "clone-priest":
            if not (refWav.exists() and refTxt.exists()):
                print(f"skip clone-priest: no reference at {refWav}", flush=True)
                continue
            priest = (refTxt.read_text().strip(), encode_reference(codec, refWav))
            speak = make_speak(model, decode, codec, voice, reference=lambda script: priest)
        elif voice == "default-anchored":
            speak = make_speak(model, decode, codec, voice, reference=anchor_reference(codec))
        else:
            raise SystemExit(f"unknown voice {voice}")
        run("fish-s2-pro", voice, args.variants, speak, only=args.only)
    print(f"peak VRAM allocated {torch.cuda.max_memory_allocated() / 1e9:.2f} GB, reserved {torch.cuda.max_memory_reserved() / 1e9:.2f} GB", flush=True)


if __name__ == "__main__":
    main()
