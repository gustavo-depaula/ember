"""Chatterbox (Resemble AI) clips for the bake-off.

Named chatterbox_synth.py because a script called chatterbox.py shadows the package.

    flock /tmp/ember-tts-gpu.lock envs/chatterbox/.venv/bin/python synth/chatterbox_synth.py [voice ...]

Voices: default-en (English-only model), default-multi (multilingual V3, built-in voice),
default-ptbr (pt-BR finetune of V3, built-in voice),
clone-priest (multilingual V3 cloned from out/_refs/design-priest.wav, when it exists).
"""

import re
import sys
import zlib
from pathlib import Path

import numpy as np
import torch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import allVariants, base, run  # noqa: E402

# Low exaggeration for an even, undramatic reading; the README's tip for "slower, more
# deliberate pacing" is a cfg_weight around 0.3 (default for both knobs is 0.5).
exaggeration = 0.3
cfgWeight = 0.3
# generate() hard-codes max_new_tokens=1000 and speech tokens run at 25 Hz, so one call
# cannot return more than 40 s. Chunks are kept well under that and joined with silence.
maxChars = 220
gapSeconds = 0.35
tokenCapSeconds = 39.9
priestRef = base / "out" / "_refs" / "design-priest.wav"


def split_text(text: str, limit: int = maxChars) -> list[str]:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
    pieces = []
    for sentence in sentences:
        if len(sentence) <= limit:
            pieces.append(sentence)
            continue
        # A sentence longer than the limit breaks at its commas instead.
        part = ""
        for clause in re.split(r"(?<=[,;:])\s+", sentence):
            if part and len(part) + 1 + len(clause) > limit:
                pieces.append(part)
                part = clause
            else:
                part = f"{part} {clause}".strip()
        pieces.append(part)
    chunks = []
    for piece in pieces:
        # A stray "Amen." rides with what precedes it rather than being spoken as its own call.
        if chunks and (len(chunks[-1]) + 1 + len(piece) <= limit or len(piece) < 25):
            chunks[-1] = f"{chunks[-1]} {piece}"
        else:
            chunks.append(piece)
    return chunks


def make_speak(generate, rate: int, voice: str):
    seen: dict[str, int] = {}

    def speak(text: str, script: dict):
        lang = script.get("speakAs") or script["lang"].split("-")[0]
        parts = []
        for chunk in split_text(text):
            # Seeded for repeatable runs, but by text and occurrence: the hail-mary.t1..t3
            # takes share one text and must not come out as the same audio.
            seen[chunk] = seen.get(chunk, 0) + 1
            # A call that runs to the 40 s cap is a runaway generation, not speech: redraw.
            for attempt in range(4):
                torch.manual_seed(zlib.crc32(chunk.encode()) + seen[chunk] + 1000 * attempt)
                wav = generate(chunk, lang).squeeze(0).cpu().numpy().astype(np.float32)
                seconds = len(wav) / rate
                if seconds < tokenCapSeconds:
                    break
                print(f"  [{voice} {script['variant']}] {len(chunk)} chars HIT-TOKEN-CAP, attempt {attempt + 1}", flush=True)
            print(f"  [{voice} {script['variant']}] {len(chunk)} chars -> {seconds:.1f}s", flush=True)
            parts += [wav, np.zeros(int(gapSeconds * rate), dtype=np.float32)]
        return np.concatenate(parts[:-1]), rate

    return speak


def english_model():
    from chatterbox.tts import ChatterboxTTS

    model = ChatterboxTTS.from_pretrained(device="cuda")
    return model, lambda text, lang: model.generate(text, exaggeration=exaggeration, cfg_weight=cfgWeight)


def multilingual_model(reference: Path | None = None):
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    model = ChatterboxMultilingualTTS.from_pretrained(device="cuda", t3_model="v3")
    if reference:
        model.prepare_conditionals(str(reference), exaggeration=exaggeration)
    return model, lambda text, lang: model.generate(
        text, language_id=lang, exaggeration=exaggeration, cfg_weight=cfgWeight
    )


def brazilian_model():
    """The pt-BR finetune from the V3 Single Language Pack.

    Its repo ships only the T3 weights, a retrained decoder (s3gen_v3) and the tokenizer, and the
    package has no loader for it, so a checkpoint folder is assembled from it plus the
    speaker encoder and built-in voice of the main repo, in the layout from_local reads.
    """
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    from huggingface_hub import hf_hub_download

    folder = base / "vendor" / "chatterbox-pt-br"
    folder.mkdir(parents=True, exist_ok=True)
    finetune, main = "ResembleAI/Chatterbox-Multilingual-pt-br", "ResembleAI/chatterbox"
    files = {
        "t3_pt_br.safetensors": (finetune, "t3_pt_br.safetensors"),
        "s3gen.pt": (main, "s3gen.pt"),
        "grapheme_mtl_merged_expanded_v1.json": (finetune, "grapheme_mtl_merged_expanded_v1.json"),
        "ve.pt": (main, "ve.pt"),
        "conds.pt": (main, "conds.pt"),
        "Cangjie5_TC.json": (main, "Cangjie5_TC.json"),
    }
    for name, (repo, source) in files.items():
        link = folder / name
        if not link.exists():
            link.symlink_to(hf_hub_download(repo, source))
    model = ChatterboxMultilingualTTS.from_local(folder, "cuda", t3_model="t3_pt_br.safetensors")
    # The finetune's decoder omits two fixed tokenizer buffers (mel filters, window) that
    # from_local's strict load demands, so it is laid over the main decoder instead.
    decoder = torch.load(hf_hub_download(finetune, "s3gen_v3.pt"), map_location="cuda", weights_only=True)
    missing = model.s3gen.load_state_dict(decoder, strict=False)
    assert set(missing.missing_keys) == {"tokenizer._mel_filters", "tokenizer.window"} and not missing.unexpected_keys
    return model, lambda text, lang: model.generate(
        text, language_id=lang, exaggeration=exaggeration, cfg_weight=cfgWeight
    )


voices = {
    "default-en": (english_model, ["en-US"]),
    "default-multi": (multilingual_model, allVariants),
    "default-ptbr": (brazilian_model, ["pt-BR"]),
    "clone-priest": (lambda: multilingual_model(priestRef), allVariants),
}


def main(wanted: list[str]) -> None:
    for voice in wanted or list(voices):
        if voice == "clone-priest" and not priestRef.exists():
            print(f"skip clone-priest: {priestRef} missing", flush=True)
            continue
        load, variants = voices[voice]
        model, generate = load()
        run("chatterbox", voice, variants, make_speak(generate, model.sr, voice))
        print(f"{voice}: peak VRAM {torch.cuda.max_memory_reserved() / 2**20:.0f} MiB reserved", flush=True)
        del model, generate
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()


if __name__ == "__main__":
    main(sys.argv[1:])
