"""A whole Rosary on ElevenLabs, prayed three ways, to choose between by ear.

    A  one voice prays everything
    B  a leader says the first half of each prayer and one person answers
    C  the same leader, answered by a small group: each answer is voiced by
       several people and mixed here, stretched to one length so they stay together

A narrator announces each mystery and reads its meditation in all three. Each
prayer is voiced once per voice (the Hail Mary in several takes, rotated, so
fifty-three of them do not sound looped) and reused, so the three versions and
both languages cost little more than one.

    python3 rosary_day.py joyful     # writes out/_listen/terco/
"""

import html
import json
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

base = Path(__file__).parent
sys.path.insert(0, str(base / "drama"))
import eleven  # noqa: E402
from assemble import encode, pcm, rate, silence  # noqa: E402

mysteries = sys.argv[1] if len(sys.argv) > 1 else "joyful"
practices = base.parents[1] / "content" / "practices"
clipsDir = base / "out" / "rosary-day"
page = base / "out" / "_listen" / "terco"
page.mkdir(parents=True, exist_ok=True)

# Library voices; English ones speak Portuguese without an accent on v4.
voices = {
    "narrator": ("NOpBlnGInO9m6vDvFkFC", "Spuds Oxley - Grandpa"),
    "leader": ("RexqLjNzkCjWogguKyff", "Bradley - Earnest Narrator"),
    "beth": ("8N2ng9i2uiUWqstgmWlH", "Beth - Calm, Gentle and Nurturing"),
    "sally": ("kBag1HOZlaVBH7ICPE8x", "Sally Ford - Warm, Friendly and British"),
    "jon": ("MFZUKuGQUsGJPQjTS4wC", "Jon - Warm & Grounded Storyteller"),
    "rowan": ("kLhAstPcnnPxqzk6gS5i", "Rowan - Gentle, Soft-Spoken & Warm"),
}
group = ["beth", "sally", "jon", "rowan"]
# Nobody starts an answer on the same instant.
groupDelayMs = [0, 70, 120, 40]
# Where the leader's half ends, as a line index into the prayer's sense-lines.
responseSplit = {"our-father": 4, "hail-mary": 3, "glory-be": 1}
takes = {"hail-mary": 5, "our-father": 2, "glory-be": 2}
ordinals = {
    "en-US": ["First", "Second", "Third", "Fourth", "Fifth"],
    "pt-BR": ["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto"],
}
names = {
    "en-US": {"joyful": "Joyful", "sorrowful": "Sorrowful", "glorious": "Glorious", "luminous": "Luminous"},
    "pt-BR": {"joyful": "Gozosos", "sorrowful": "Dolorosos", "glorious": "Gloriosos", "luminous": "Luminosos"},
}


def prayer(ref: str, lang: str) -> list[str]:
    flow = json.loads((practices / ref / "manifest.json").read_text())["flow"]
    return [line.strip() for line in flow["sections"][0]["inline"][lang].split("\n") if line.strip()]


def texts(lang: str) -> dict[str, str]:
    """Every distinct thing said, by name: whole prayers, their halves, the mysteries."""
    said = {}
    for ref in ("sign-of-cross", "apostles-creed", "our-father", "hail-mary", "glory-be", "fatima-prayer", "hail-holy-queen"):
        lines = prayer(ref, lang)
        said[ref] = " ".join(lines)
        if ref in responseSplit:
            said[f"{ref}.v"] = " ".join(lines[: responseSplit[ref]])
            said[f"{ref}.r"] = " ".join(lines[responseSplit[ref] :])
    data = json.loads((practices / "rosary" / "flow.json").read_text())["data"][mysteries]
    word = "Mistério" if lang == "pt-BR" else "Mystery"
    for n, mystery in enumerate(data, start=1):
        said[f"mystery-{n}"] = f"{ordinals[lang][n - 1]} {word}: {mystery['name'][lang]}."
        said[f"meditation-{n}"] = mystery["meditation"][lang].replace("'", "")
    return said


def wanted(said: dict[str, str]) -> list[tuple[str, str, int]]:
    """(voice, clip, take) for everything the three versions need."""
    need = []
    for clip in said:
        stem, _, half = clip.partition(".")
        count = takes.get(stem, 1)
        who = ["narrator"] if clip.startswith(("mystery", "meditation")) else group if half == "r" else ["leader"]
        need += [(voice, clip, take) for voice in who for take in range(count)]
    return need


def path(lang: str, voice: str, clip: str, take: int) -> Path:
    return clipsDir / mysteries / lang / voice / f"{clip}.t{take}.mp3"


def synthesize(lang: str, said: dict[str, str]) -> int:
    todo = [(v, c, t) for v, c, t in wanted(said) if not path(lang, v, c, t).exists()]

    def make(item: tuple[str, str, int]) -> None:
        voice, clip, take = item
        target = path(lang, voice, clip, take)
        target.parent.mkdir(parents=True, exist_ok=True)
        # A different seed per take, so two takes are two readings.
        target.write_bytes(eleven.speak(voices[voice][0], said[clip], language_code=lang[:2], seed=take + 1))

    # The Starter plan allows three requests at once.
    with ThreadPoolExecutor(3) as pool:
        list(pool.map(make, todo))
    return sum(len(said[c]) for _, c, _ in todo)


def stretch(frames: bytes, factor: float) -> bytes:
    """Change the length without changing the pitch (factor > 1 is faster)."""
    done = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-",
         "-af", f"atempo={factor:.4f}", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-"],
        input=frames, capture_output=True, check=True,
    )
    return done.stdout


def together(parts: list[bytes]) -> bytes:
    """Several people saying the same words at once."""
    target = sorted(len(p) for p in parts)[len(parts) // 2]
    longest = 0
    waves = []
    for part, delay in zip(parts, groupDelayMs):
        wave = np.frombuffer(stretch(part, len(part) / target), dtype=np.int16).astype(np.float32)
        wave = np.concatenate([np.zeros(rate * delay // 1000, dtype=np.float32), wave])
        waves.append(wave)
        longest = max(longest, len(wave))
    mix = sum(np.pad(w, (0, longest - len(w))) for w in waves) / np.sqrt(len(waves))
    peak = np.abs(mix).max()
    if peak > 30000:
        mix *= 30000 / peak
    return mix.astype(np.int16).tobytes()


def assemble(lang: str, said: dict[str, str], option: str, tmp: Path) -> tuple[bytes, bytes]:
    cache: dict[tuple, bytes] = {}
    used: dict[str, int] = {}

    def clip(voice: str, name: str, take: int) -> bytes:
        key = (voice, name, take)
        if key not in cache:
            # pcm() names its scratch file after the clip's folders, so each take needs its own.
            scratch = tmp / f"{lang}-{voice}-{name}-{take}"
            scratch.mkdir(exist_ok=True)
            cache[key] = pcm(path(lang, voice, name, take), scratch)
        return cache[key]

    def pray(ref: str) -> bytes:
        count = takes.get(ref, 1)
        # Rotate by threes so neighbouring Hail Marys are never the same take.
        take = (used.get(ref, 0) * 3) % count if count > 1 else 0
        used[ref] = used.get(ref, 0) + 1
        gap = silence(700 if ref == "hail-mary" else 1100)
        if option == "A" or ref not in responseSplit:
            return clip("leader", ref, take) + gap
        key = ("answer", option, ref, take)
        if key not in cache:
            people = ["beth"] if option == "B" else group
            parts = [clip(person, f"{ref}.r", take) for person in people]
            cache[key] = parts[0] if len(parts) == 1 else together(parts)
        return clip("leader", f"{ref}.v", take) + silence(280) + cache[key] + gap

    opening = pray("sign-of-cross") + pray("apostles-creed") + pray("our-father")
    opening += b"".join(pray("hail-mary") for _ in range(3)) + pray("glory-be") + silence(1200)
    decades = []
    for n in range(1, 6):
        decade = clip("narrator", f"mystery-{n}", 0) + silence(900) + clip("narrator", f"meditation-{n}", 0) + silence(2500)
        decade += pray("our-father") + b"".join(pray("hail-mary") for _ in range(10))
        decade += pray("glory-be") + pray("fatima-prayer") + silence(1500)
        decades.append(decade)
    closing = pray("hail-holy-queen") + pray("sign-of-cross")
    return opening + b"".join(decades) + closing, decades[0]


labels = {
    "A": "A. Uma só voz",
    "B": "B. Dirigente e uma pessoa que responde",
    "C": "C. Dirigente e um pequeno grupo que responde",
}
parts = []
for lang in ("pt-BR", "en-US"):
    said = texts(lang)
    spent = synthesize(lang, said)
    print(f"{lang}: {spent} characters voiced now", flush=True)
    parts.append(f"<h2>{'Português' if lang == 'pt-BR' else 'English'}: Mistérios {names['pt-BR'][mysteries]}</h2>")
    with tempfile.TemporaryDirectory() as t:
        for option in "ABC":
            full, decade = assemble(lang, said, option, Path(t))
            stem = f"{mysteries}-{lang[:2]}-{option.lower()}"
            encode(decade, page / f"{stem}-dezena.m4a", Path(t))
            encode(full, page / f"{stem}.m4a", Path(t))
            minutes = len(full) / 2 / rate / 60
            print(f"  {option}: {minutes:.1f} min", flush=True)
            parts.append(
                f"<h3>{labels[option]}</h3>"
                f"<p>Primeira dezena<br><audio controls preload='none' src='{stem}-dezena.m4a'></audio></p>"
                f"<p>Terço inteiro ({minutes:.0f} min)<br><audio controls preload='none' src='{stem}.m4a'></audio></p>"
            )
cast = "".join(f"<li>{html.escape(role)}: {html.escape(name)}</li>" for role, (_, name) in voices.items())
(page / "index.html").write_text(
    "<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Terço</title>"
    "<style>body{font:16px/1.45 Georgia,serif;max-width:760px;margin:1.5rem auto;padding:0 1rem}audio{width:100%}</style>"
    "<h1>Terço do dia, de três maneiras</h1>"
    "<p>O narrador anuncia cada mistério e lê a meditação; o resto muda conforme a versão.</p>"
    + "".join(parts) + f"<h2>Vozes</h2><ul>{cast}</ul><p>No grupo respondem beth, sally, jon e rowan; na versão B, só beth.</p>",
    encoding="utf-8",
)
print(page / "index.html")
