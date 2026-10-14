"""Turn the Rosary practice into speakable scripts, one JSON per language variant.

Reads content/practices (never writes to it). Each script lists the unique
clips a synthesizer must produce and the sequence that assembles the whole
Rosary from them, so a model voices each prayer once.

    python3 build_script.py            # writes scripts/rosary.<variant>.json
"""

import json
import re
import unicodedata
from pathlib import Path

from latin_g2p import to_ipa

root = Path(__file__).resolve().parents[2]
practices = root / "content" / "practices"
out = Path(__file__).parent / "scripts"

mysteries = "glorious"
hailMaryTakes = 3

ordinals = {
    "en-US": ["First", "Second", "Third", "Fourth", "Fifth"],
    "pt-BR": ["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto"],
}

# The corpus has no Latin mystery titles; these are the customary ones, added
# here for the experiment only. Latin gets no meditation text.
latinMysteries = [
    "Primum mystérium gloriósum: Resurréctio Dómini.",
    "Secúndum mystérium gloriósum: Ascénsio Dómini.",
    "Tértium mystérium gloriósum: Míssio Spíritus Sancti.",
    "Quartum mystérium gloriósum: Assúmptio Beátæ Maríæ Vírginis.",
    "Quintum mystérium gloriósum: Coronátio Beátæ Maríæ Vírginis.",
]

# Where the leader's half ends, as a line index into the prayer's sense-lines.
responseSplit = {"our-father": 4, "hail-mary": 3, "glory-be": 1}


def prayer_lines(ref: str, lang: str) -> list[str]:
    flow = json.loads((practices / ref / "manifest.json").read_text())["flow"]
    return flow["sections"][0]["inline"][lang].split("\n")


def speak(lines: list[str]) -> str:
    return " ".join(line.strip() for line in lines if line.strip())


def strip_stress(text: str) -> str:
    """Drop the stress accents the corpus prints on Latin words."""
    decomposed = unicodedata.normalize("NFD", text)
    return unicodedata.normalize("NFC", decomposed.replace("́", ""))


def latin_raw(text: str) -> str:
    table = {"æ": "ae", "Æ": "Ae", "ǽ": "áe", "œ": "oe", "Œ": "Oe"}
    return "".join(table.get(ch, ch) for ch in text)


def latin_italianized(text: str) -> str:
    """Respell ecclesiastical Latin so an Italian voice reads it as Rome does."""

    def word(match: re.Match) -> str:
        w = match.group(0)
        low = w.lower()
        low = low.replace("ǽ", "é").replace("æ", "e").replace("œ", "e")
        low = low.replace("ph", "f").replace("th", "t").replace("y", "i").replace("j", "i")
        low = re.sub(r"ch(?=[eiéí])", "ch", low)
        low = re.sub(r"ch(?![eiéí])", "c", low)
        low = re.sub(r"(?<=[iì])h(?=i)", "k", low)  # mihi, nihil
        low = re.sub(r"(?<![stx])ti(?=[aeouáéóú])", "zi", low)
        # Italian prints stress as grave on a/i/u; é and ó exist as written.
        low = low.replace("á", "à").replace("í", "ì").replace("ú", "ù")
        return low.capitalize() if w[0].isupper() else low

    return re.sub(r"[^\W\d_]+", word, text)


def build(lang: str) -> dict:
    clips: dict[str, str] = {}
    sequence: list[dict] = []

    def say(clip: str, pause: int, role: str = "leader") -> None:
        sequence.append({"clip": clip, "pauseMs": pause, "role": role})

    def prayer(ref: str, take: int | None = None) -> None:
        lines = prayer_lines(ref, lang)
        clips[ref] = speak(lines)
        if ref in responseSplit:
            cut = responseSplit[ref]
            clips[f"{ref}.v"] = speak(lines[:cut])
            clips[f"{ref}.r"] = speak(lines[cut:])
        if ref == "hail-mary":
            for t in range(1, hailMaryTakes + 1):
                clips[f"hail-mary.t{t}"] = clips["hail-mary"]
            say(f"hail-mary.t{(take or 0) % hailMaryTakes + 1}", 900)
            return
        say(ref, 1200)

    data = json.loads((practices / "rosary" / "flow.json").read_text())["data"][mysteries]

    prayer("sign-of-cross")
    prayer("apostles-creed")
    prayer("our-father")
    for i in range(3):
        prayer("hail-mary", i)
    prayer("glory-be")
    for n, mystery in enumerate(data):
        if lang == "la":
            clips[f"mystery-{n + 1}"] = latinMysteries[n]
            say(f"mystery-{n + 1}", 2500)
        else:
            clips[f"mystery-{n + 1}"] = f"{ordinals[lang][n]} {'Mistério' if lang == 'pt-BR' else 'Mystery'}: {mystery['name'][lang]}."
            clips[f"meditation-{n + 1}"] = mystery["meditation"][lang]
            say(f"mystery-{n + 1}", 900)
            say(f"meditation-{n + 1}", 2500)
        prayer("our-father")
        for i in range(10):
            prayer("hail-mary", i)
        prayer("glory-be")
        prayer("fatima-prayer")
    prayer("hail-holy-queen")
    prayer("sign-of-cross")
    return {"lang": lang, "mysteries": mysteries, "clips": clips, "sequence": sequence}


def write(name: str, script: dict, **extra) -> None:
    script = {**script, "variant": name, **extra}
    (out / f"rosary.{name}.json").write_text(json.dumps(script, ensure_ascii=False, indent=1) + "\n")
    chars = sum(len(t) for t in script["clips"].values())
    print(f"{name}: {len(script['clips'])} clips, {chars} chars, {len(script['sequence'])} steps")


out.mkdir(exist_ok=True)
write("en-US", build("en-US"))
write("pt-BR", build("pt-BR"))
latin = build("la")
# Three spellings of the same Latin, because no engine has a Latin voice: the
# corpus text as printed, without stress accents, and respelled for Italian.
for name, convert in (
    ("la-raw", latin_raw),
    ("la-plain", lambda t: strip_stress(latin_raw(t))),
    ("la-ital", latin_italianized),
):
    write(name, {**latin, "clips": {k: convert(v) for k, v in latin["clips"].items()}}, speakAs="it")
# And as phonemes, for engines that accept IPA and skip their own guesswork.
write("la-ipa", {**latin, "clips": {k: to_ipa(v) for k, v in latin["clips"].items()}}, speakAs="ipa")
