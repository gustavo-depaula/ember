"""Audition voices from ElevenLabs' library, and calmer designed ones, as the Portuguese narrator.

The first designed cast sounded strained rather than restful. This puts three
things on one page, out/_listen/narradores/: each library voice's own preview
(free), the opening of Mark read by a few of them on v4, and new designed
candidates described as low and relaxed.

A library voice must be added to the account to speak, which takes a voice slot.

    python3 drama/library_eleven.py
"""

import html
import json
import sys
import urllib.request
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here))
import eleven  # noqa: E402

page = here.parent / "out" / "_listen" / "narradores"
page.mkdir(parents=True, exist_ok=True)
log = here / "voices" / "pt-library.json"
state = json.loads(log.read_text()) if log.exists() else {"added": {}, "designed": {}}

# Read on v4: chosen from their descriptions for a calm, low, unhurried delivery.
read = [
    "I2ByPkgw1fQDNOd5TK9K", "H6h0eIkmytMwHWAqLwWR", "tl3CLlI7nj7OJW7IjsAl",
    "GIuLCSVfgJaUuh7hYOY8", "rVRk0uJAtO8T38Gm03mf", "X3j2R63Qu4Gdv6dsU2hB",
]
# Preview only.
more = [
    "zJ72ys7tsUtDi2rbhNPg", "LPfVDNIbutMazyzqW517", "A8xNkI7241GDqaH23gVz", "7iCLvASfMOr1mwIj7lBW",
    "8BWp4523yEDDjOJi73mz", "bZztR6P62TDbe6sgaZgz", "SvP2QJFsRvn3JevnwLQM", "Mn7FDiiQr3aIwMWsLE7r",
    "96bMRo5cMbvHHsds2Wr0", "8KPOk04tbmZ5EVDlxWAi", "lUaTJLTsNnLQQ5G5LJen", "ylkAmqCrRDIZwbkOGyJe",
    "rnJZLKxtlBZt77uIED10", "MA970ZXwnPbMzXiwZsUw" if False else "",
]
designs = {
    "narrador-sereno": "Native Brazilian Portuguese speaker with a neutral São Paulo accent. Male, 50 to 60. Studio quality, close to the microphone. "
    "A low, soft, relaxed baritone with a warm chest resonance. He speaks slowly and quietly, at ease, like someone reading to a friend late in the evening. "
    "Never strained, never tense, never projecting; no announcer tone.",
    "jesus-sereno": "Native Brazilian Portuguese speaker with a neutral São Paulo accent. Male, 33. Studio quality, close to the microphone. "
    "A gentle, low, unforced voice, soft and peaceful, speaking slowly with kindness. Relaxed throat, warm tone, never tense, never loud.",
}
sample = (
    "Havia um homem que saiu de manhã cedo para trabalhar no seu campo. E quando o sol estava alto, "
    "descansou debaixo de uma árvore, e disse ao seu servo: Traga-me água, porque o dia é longo, e o caminho é distante."
)
lines = json.loads((here / "mark" / "consult" / "pt-am" / "utterances.json").read_text(encoding="utf-8"))["1"]
# The first two scenes, title left out: the Baptist's preaching and the baptism.
opening = " ".join(line["text"] for line in lines[1:] if line["verses"] and line["verses"][0] <= 13)

found = {}
for query in ("use_cases=narrative_story", "use_cases=informative_educational", "descriptives=calm", "descriptives=deep", "category=professional"):
    for voice in eleven.call(f"/shared-voices?page_size=40&language=pt&accent=brazilian&{query}")["voices"]:
        found[voice["voice_id"]] = voice

before = eleven.used()
parts = [f"<p><small>Trecho lido: Marcos 1,1-13 (Ave Maria), {len(opening)} caracteres, sem elenco: só a voz do narrador.</small></p>"]
parts.append("<h2>1. Vozes da biblioteca lendo Marcos 1</h2><p>Vozes de locutores brasileiros reais, no ElevenLabs v4.</p>")
for vid in read:
    voice = found[vid]
    target = page / f"marcos-{vid}.mp3"
    if not target.exists():
        if vid not in state["added"]:
            state["added"][vid] = eleven.call(f"/voices/add/{voice['public_owner_id']}/{vid}", {"new_name": voice["name"][:60]})["voice_id"]
            log.write_text(json.dumps(state, ensure_ascii=False, indent=1) + "\n")
        target.write_bytes(eleven.speak(state["added"][vid], opening, language_code="pt"))
    parts.append(f"<h3>{html.escape(voice['name'])}</h3><p><small>{html.escape((voice.get('description') or '')[:300])}</small></p>"
                 f"<p>Marcos 1<br><audio controls preload='none' src='{target.name}'></audio></p>"
                 f"<p>Amostra do próprio locutor<br><audio controls preload='none' src='amostra-{vid}.mp3'></audio></p>")

parts.append("<h2>2. Vozes desenhadas de novo, pedindo voz grave e relaxada</h2>")
for name, description in designs.items():
    if name not in state["designed"]:
        previews = eleven.design(description, sample, seed=23)
        state["designed"][name] = [gid for gid, _ in previews]
        for n, (_, mp3) in enumerate(previews, start=1):
            (page / f"{name}-{n}.mp3").write_bytes(mp3)
        log.write_text(json.dumps(state, ensure_ascii=False, indent=1) + "\n")
    parts.append(f"<h3>{name}</h3><p><small>{html.escape(description)}</small></p>")
    parts += [f"<p>candidato {n}<br><audio controls preload='none' src='{name}-{n}.mp3'></audio></p>" for n in (1, 2, 3)]

parts.append("<h2>3. Mais vozes da biblioteca (só a amostra do locutor)</h2>")
for vid in read + [v for v in more if v]:
    voice = found.get(vid)
    if not voice:
        continue
    sampleFile = page / f"amostra-{vid}.mp3"
    if not sampleFile.exists() and voice.get("preview_url"):
        sampleFile.write_bytes(urllib.request.urlopen(voice["preview_url"], timeout=60).read())
    if vid not in read:
        parts.append(f"<p><b>{html.escape(voice['name'])}</b><br><small>{html.escape((voice.get('description') or '')[:300])}</small><br>"
                     f"<audio controls preload='none' src='{sampleFile.name}'></audio></p>")

(page / "index.html").write_text(
    "<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Narradores</title>"
    "<style>body{font:16px/1.45 Georgia,serif;max-width:760px;margin:1.5rem auto;padding:0 1rem}audio{width:100%}small{color:#666}</style>"
    "<h1>Narradores mais serenos</h1>" + "".join(parts), encoding="utf-8")
print(len(opening), "chars read per voice; credits spent:", eleven.used() - before)
