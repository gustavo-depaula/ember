"""Design the cast's voices once with Qwen3-TTS VoiceDesign.

Each voice is a description turned into one reference clip, saved to
drama/voices/<language>/<id>.wav with its transcript. Every line a character speaks is
later cloned from that clip, so the voice stays the same through the book.

    EDITION=pt-ms flock /tmp/ember-tts-gpu.lock envs/qwen3-tts/.venv/bin/python drama/design_voices.py
"""

import sys
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

here = Path(__file__).parent
sys.path.insert(0, str(here))
from edition import lang, ttsLanguage, voiceSet, voices as out  # noqa: E402

# Neutral, in the book's register, with both narration and speech in it.
sample = {
    "en": "There was a man who went out early in the morning to work in his field. "
    "And when the sun was high, he rested beneath a tree, and said to his servant: "
    "Bring me water, for the day is long, and the road is far.",
    # A voice cloned from an English clip carries its accent, so each language gets its own.
    "pt": "Havia um homem que saiu de manhã cedo para trabalhar no seu campo. "
    "E quando o sol estava alto, descansou debaixo de uma árvore, e disse ao seu servo: "
    "Traga-me água, porque o dia é longo, e o caminho é distante.",
}[lang]
voices = {
    "narrator": "A clear, warm, mature male storyteller's voice, around fifty, measured and unhurried, reading Scripture aloud with quiet gravity.",
    "jesus": "A man in his early thirties with a calm, gentle, steady voice, full of quiet authority and compassion. Never hurried, never harsh.",
    "divine": "A very deep, resonant, majestic older male voice, slow and solemn, like a voice from heaven.",
    "peter": "A rough, earnest working man's voice, around forty, warm and impulsive, slightly gravelly.",
    "baptist": "A strong, austere, ringing male voice, a desert preacher in his thirties, urgent and stern.",
    "elder": "A stern, dry, elderly male voice, precise and disapproving, a learned religious authority.",
    "ruler": "A cool, patrician, middle-aged male voice, weary and detached, used to giving orders.",
    "man-young": "A young man's light, clear, eager voice, in his early twenties.",
    "man-common": "An ordinary middle-aged villager's plain male voice, a little anxious and direct.",
    "man-old": "A low, humble, tired older man's voice, pleading and sincere.",
    "woman-mature": "A mature woman's warm, low voice, humble and determined.",
    "woman-young": "A young woman's light, bright voice.",
    "spirit": "A harsh, strained, rasping male voice, hostile and afraid, close to a snarl.",
    "crowd": "A loud, forceful man's voice calling out in a public place, rough and insistent.",
    # The Book of Job.
    "job": "A man of about sixty with a deep, weary, grief-worn voice, noble and anguished, speaking with passion and pain, yet with dignity.",
    "eliphaz": "A very old man's dignified, measured voice, grave and courteous, a sage entirely sure of his own wisdom.",
    "baldad": "A firm, blunt, middle-aged male voice, severe and traditional, impatient with complaint.",
    "sophar": "A sharp, hard, quick-tempered male voice, scornful and quick to rebuke.",
    "eliu": "A young man's earnest, fervent, confident voice, eager and a little indignant, speaking fast and warmly.",
    "satan": "A smooth, cold, insinuating male voice, quiet, sly and mocking.",
    # The other Gospels and Acts.
    "mary": "A young woman's gentle, clear, humble voice, quiet and full of calm strength and joy.",
    "angel": "A clear, bright, serene male voice, youthful and luminous, speaking with calm authority and gladness.",
    "woman-old": "An elderly woman's warm, slightly frail voice, joyful and devout.",
    "paul": "A fervent, educated, intense man's voice, around fifty, quick and persuasive, with fire and conviction.",
    "judas": "A cool, guarded, calculating man's voice, around thirty-five, smooth and slightly bitter.",
}

# The model has one "Portuguese" and, left to itself, designs voices from
# Portugal. The accent of a cloned voice is the accent of its reference clip,
# so it has to be asked for here.
accent = {
    "pt": " Fala português do Brasil, com sotaque brasileiro neutro, como em São Paulo. Nunca com sotaque de Portugal.",
    "pt-sp": " Brasileiro de São Paulo, com sotaque paulistano neutro de locutor de rádio: o S sempre sibilante, sem chiado carioca, vogais abertas e claras. Nunca sotaque de Portugal nem do Rio de Janeiro.",
}.get(voiceSet, "")
out.mkdir(parents=True, exist_ok=True)
todo = {k: v for k, v in voices.items() if not (out / f"{k}.wav").exists()}
if todo:
    design = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cuda:0", dtype=torch.bfloat16)
    for name, description in todo.items():
        torch.manual_seed(zlib.crc32(name.encode()))
        wavs, rate = design.generate_voice_design(text=sample, language=ttsLanguage, instruct=description + accent)
        audio = np.asarray(wavs[0], dtype=np.float32).reshape(-1)
        sf.write(out / f"{name}.wav", audio, rate)
        (out / f"{name}.txt").write_text(sample + "\n")
        (out / f"{name}.description.txt").write_text(description + "\n")
        print(f"{name}: {len(audio) / rate:.1f}s", flush=True)
