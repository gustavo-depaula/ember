"""Design the Portuguese cast with ElevenLabs Voice Design, as reference clips for cloning.

Each description gives three candidate voices. Candidate n of every character
goes to drama/voices/pt-el<n>/, so the three sets can each voice a chapter and
be compared, and one voice per character picked by ear afterwards.

    python3 drama/design_eleven.py
"""

import json
import subprocess
import sys
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here))
import eleven  # noqa: E402

sample = (
    "Havia um homem que saiu de manhã cedo para trabalhar no seu campo. E quando o sol estava alto, "
    "descansou debaixo de uma árvore, e disse ao seu servo: Traga-me água, porque o dia é longo, e o caminho é distante."
)
# The accent is asked for first and plainly: a clone speaks with the accent of its reference.
accent = "Native Brazilian Portuguese speaker with a neutral São Paulo accent, never European Portuguese."
cast = {
    "narrator": "Male, 45 to 55. Studio quality. Persona: Scripture narrator. Emotion: calm, warm, grave. A clear, measured storyteller's voice, unhurried, reading aloud with quiet gravity.",
    "jesus": "Male, 30 to 35. Studio quality. Persona: gentle teacher. Emotion: calm, compassionate, assured. A steady, gentle voice full of quiet authority; never hurried, never harsh.",
    "divine": "Male, 60 to 70. Studio quality. Persona: voice from heaven. Emotion: solemn, majestic. A very deep, resonant voice, slow and solemn.",
    "peter": "Male, 40 to 45. Studio quality. Persona: fisherman. Emotion: earnest, impulsive, warm. A rough working man's voice, slightly gravelly.",
    "baptist": "Male, 30 to 35. Studio quality. Persona: desert preacher. Emotion: urgent, stern, fervent. A strong, austere, ringing voice.",
    "elder": "Male, 65 to 75. Studio quality. Persona: religious authority. Emotion: stern, disapproving. A dry, precise elderly voice.",
    "ruler": "Male, 45 to 55. Studio quality. Persona: Roman governor. Emotion: cool, weary, detached. A patrician voice used to giving orders.",
    "man-young": "Male, 20 to 25. Studio quality. Persona: eager young man. Emotion: earnest, bright. A light, clear voice.",
    "man-common": "Male, 40 to 50. Studio quality. Persona: villager. Emotion: anxious, direct. An ordinary, plain voice.",
    "man-old": "Male, 65 to 75. Studio quality. Persona: humble old man. Emotion: pleading, tired, sincere. A low, worn voice.",
    "woman-mature": "Female, 45 to 55. Studio quality. Persona: humble woman. Emotion: determined, warm. A low, warm voice.",
    "woman-young": "Female, 18 to 25. Studio quality. Persona: young servant. Emotion: bright, curious. A light, clear voice.",
    "spirit": "Male, 40 to 50. Studio quality. Persona: tormented spirit. Emotion: hostile, afraid, strained. A harsh, rasping voice, close to a snarl.",
    "crowd": "Male, 35 to 45. Studio quality. Persona: man shouting in a crowd. Emotion: insistent, rough, loud. A forceful voice calling out in a public place.",
}

log = here / "voices" / "pt-el.json"
done = json.loads(log.read_text()) if log.exists() else {}
before = eleven.used()
for role, description in cast.items():
    if role in done:
        continue
    full = f"{accent} {description}"
    previews = eleven.design(full, sample, seed=11)
    done[role] = {"description": full, "generated": [gid for gid, _ in previews]}
    for n, (_, mp3) in enumerate(previews, start=1):
        folder = here / "voices" / f"pt-el{n}"
        folder.mkdir(parents=True, exist_ok=True)
        (folder / f"{role}.mp3").write_bytes(mp3)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(folder / f"{role}.mp3"), "-ar", "24000", "-ac", "1", str(folder / f"{role}.wav")], check=True)
        (folder / f"{role}.txt").write_text(sample + "\n")
        (folder / f"{role}.description.txt").write_text(f"ElevenLabs Voice Design, candidate {n}. {full}\n")
    log.write_text(json.dumps(done, ensure_ascii=False, indent=1) + "\n")
    print(role, len(previews), flush=True)
print("credits spent:", eleven.used() - before)
