"""Turn an edition's labelled verses into the list of things to say: utterances.json.

Consecutive spans by one speaker are joined across verses so a voice reads a
whole thought in one breath, then cut at sentence ends when they run long.
A run never crosses into a new pericope, and the first line of each pericope
is marked so the assembled audio can leave a silence before it.

    EDITION=pt-ms python3 drama/build_utterances.py
"""

import hashlib
import json
import re
import sys
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here))
from edition import book, bookDir, edition, lang, root  # noqa: E402

# One person keeps one voice across every book: cast.json names it. A book may
# override that (its own casting.json), and anyone in neither is cast from what
# the labeller recorded about them.
casting = json.loads((here / "cast.json").read_text(encoding="utf-8"))
if (bookDir / "casting.json").exists():
    casting |= json.loads((bookDir / "casting.json").read_text(encoding="utf-8"))


def voice_for(speaker: str, about: dict) -> str:
    if speaker in casting:
        return casting[speaker]
    kind, gender, age = about.get("kind"), about.get("gender"), about.get("age")
    if kind in ("spirit", "divine", "angel"):
        return kind
    if gender == "female":
        return "woman-young" if age in ("child", "young") else "woman-old" if age == "old" else "woman-mature"
    if kind == "group" or gender == "mixed":
        return "crowd"
    return "man-young" if age in ("child", "young") else "man-old" if age == "old" else "man-common"

# Where each pericope begins, in the Vulgate numbering the Douay and Matos Soares
# share. A book without the file just pauses between chapters.
marked = bookDir / "pericopes.json"
pericopes = {c: set(v) for c, v in json.loads(marked.read_text()).items()} if marked.exists() else {}
if book == "mark" and edition == "pt-am":
    # The Ave Maria opens Mark 9 one verse earlier, so its verses there run one higher.
    pericopes["9"] = {v + 1 for v in pericopes["9"]}
longest = 320
units = {
    "en": "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(),
    "pt": "zero um dois três quatro cinco seis sete oito nove dez onze doze treze catorze quinze dezesseis dezessete dezoito dezenove".split(),
}[lang]
tens = {
    "en": "twenty thirty forty fifty sixty seventy eighty ninety".split(),
    "pt": "vinte trinta quarenta cinquenta sessenta setenta oitenta noventa".split(),
}[lang]
titles = json.loads((here / "titles.json").read_text(encoding="utf-8"))[book][lang]
heading = {"en": "Chapter", "pt": "Capítulo"}[lang]


def number(n: int) -> str:
    """Chapter numbers as words, so every voice reads them the same way."""
    if n < 20:
        return units[n]
    ten, unit = tens[n // 10 - 2], n % 10
    return ten if not unit else f"{ten}-{units[unit]}" if lang == "en" else f"{ten} e {units[unit]}"


# What the Matos Soares in the corpus gets wrong for the ear: scanning slips
# (a capital I for l, a split word) and the translator's own glosses in
# parentheses, which are notes, not Scripture. The verses themselves are untouched.
fixes = {
    "pt-ms": [
        (r"(?<=-)Ihe", "lhe"), ("E m qualquer", "Em qualquer"), ("dizía", "dizia"),
        ("lhe linha feito", "lhe tinha feito"), ("doa sapatos", "dos sapatos"), ("Imediamente", "Imediatamente"),
        (r"\s*\((?:ilicitamente|a vinda do Filho do homem para o juízo final|de Páscoa|indulto)\)", ""),
        # Job is full of the translator's bracketed supplies ("(Deus) enviará"); the sense
        # needs them, so they are read and only the brackets go. The old spelling "Job" is said "Jó".
        (r"[()]", ""), (r"\bJob\b", "Jó"),
    ],
}.get(edition, [])


def spoken(text: str) -> str:
    """Quotation marks say who is speaking, which the voices now do."""
    for old, new in fixes:
        text = re.sub(old, new, text)
    text = re.sub(r"[\"“”«»]", "", text)
    text = re.sub(r"(?<!\w)[‘’'](?!\w)|(?<=\w)[‘’'](?!\w)|(?<!\w)[‘’'](?=\w)", "", text)
    # With the quotes gone, the Ave Maria's full stop after a closing quote doubles up: "pedir?.".
    text = re.sub(r"([?!])[.,]", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def pieces(text: str) -> list[str]:
    """Split at sentence ends so no piece runs much past `longest` characters."""
    out, current = [], ""
    for sentence in re.split(r"(?<=[.?!;:])\s+", text):
        if current and len(current) + len(sentence) + 1 > longest:
            out.append(current)
            current = sentence
        else:
            current = f"{current} {sentence}".strip()
    return out + [current] if current else out


def clip_id(voice: str, text: str) -> str:
    # Named by what is said and who says it, so re-cutting the text only re-voices what changed.
    return hashlib.sha1(f"{voice}|{text}".encode()).hexdigest()[:16]


chapters = {}
improvised = {}
for path in sorted((root / "attribution").glob("*.json")):
    chapter = str(int(path.stem))
    data = json.loads(path.read_text(encoding="utf-8"))
    # Newer labelling carries each chapter's pericope starts with it.
    breaks = set(data["pericopes"]) if "pericopes" in data else pericopes.get(chapter, ())
    runs: list[dict] = []
    for n in sorted(data["verses"], key=int):
        starts = int(n) in breaks
        for at, span in enumerate(data["verses"][n]):
            # `skip` drops print debris that is in the verse but is not its text;
            # `say` rewords a span the source ran together and could not be split cleanly.
            if span.get("skip"):
                continue
            span = {**span, "t": span.get("say", span["t"])}
            if span["s"] not in casting:
                improvised[span["s"]] = voice_for(span["s"], data["cast"].get(span["s"], {}))
            opens = starts and at == 0
            if runs and runs[-1]["speaker"] == span["s"] and not opens:
                runs[-1]["text"] += " " + span["t"]
                runs[-1]["verses"].append(int(n))
            else:
                runs.append({"speaker": span["s"], "text": span["t"], "verses": [int(n)], "pericope": opens,
                             "voice": voice_for(span["s"], data["cast"].get(span["s"], {}))})
    title = f"{titles + ' ' if chapter == '1' else ''}{heading} {number(int(chapter))}."
    lines = [{"speaker": "narrator", "voice": "narrator", "text": title, "verses": [], "pericope": False}]
    for run in runs:
        voice = run["voice"]
        for at, piece in enumerate(p for p in pieces(spoken(run["text"])) if re.search(r"\w", p)):
            lines.append({
                "speaker": run["speaker"],
                "voice": voice,
                "text": piece,
                "verses": sorted(set(run["verses"])),
                "pericope": run["pericope"] and at == 0,
            })
    for line in lines:
        line["clip"] = clip_id(line["voice"], line["text"])
    chapters[chapter] = lines
if improvised:
    print("cast from their description:", ", ".join(f"{k} -> {v}" for k, v in sorted(improvised.items())))
(root / "utterances.json").write_text(json.dumps(chapters, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
lines = [x for u in chapters.values() for x in u]
print(f"{book} {edition}: {len(lines)} lines, {len({x['clip'] for x in lines})} distinct clips, "
      f"{sum(len(x['text']) for x in lines)} characters, {sum(x['pericope'] for x in lines)} pericopes")
