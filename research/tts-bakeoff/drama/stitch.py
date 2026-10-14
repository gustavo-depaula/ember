"""Stitch an edition's clips into one file per chapter, and write a page to follow along.

    EDITION=pt-ms python3 drama/stitch.py
"""

import html
import json
import shutil
import sys
import tempfile
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here.parent))
sys.path.insert(1, str(here))
from assemble import encode, pcm, silence  # noqa: E402
from edition import book, chosen, clips, edition, lang, listen, root, voices  # noqa: E402

utterances = json.loads((root / "utterances.json").read_text(encoding="utf-8"))
# Only the chosen chapters are stitched again; the page still lists every chapter already made.
wanted = set(chosen(utterances))
listen.mkdir(parents=True, exist_ok=True)
(listen / "voices").mkdir(exist_ok=True)
names = {"en": "Douay-Rheims", "pt-ms": "Matos Soares", "pt-am": "Ave Maria"}


def pause_after(line: dict, following: dict | None, first: bool) -> int:
    """Silence in milliseconds: the reading's punctuation, heard."""
    if following is None:
        return 1800  # the chapter ends
    if first:
        return 1400  # after the chapter is announced
    if following["pericope"]:
        return 2600  # a new scene
    if following["speaker"] == line["speaker"]:
        return 450  # the same voice goes on
    if line["speaker"] == "narrator" and line["text"].rstrip()[-1] in ":,":
        return 300  # "And he said to them:" runs straight into the words
    return 650  # another voice takes over


sections = []
for chapter in sorted(utterances, key=int):
    lines = utterances[chapter]
    paths = [clips / f"{line['clip']}.wav" for line in lines]
    if chapter in wanted and not all(p.exists() for p in paths):
        print(f"chapter {chapter}: clips missing, skipped")
        continue
    target = listen / f"{book}-{int(chapter):02d}.m4a"
    if chapter not in wanted and not target.exists():
        continue
    if chapter in wanted:
        with tempfile.TemporaryDirectory() as t:
            frames = b""
            for n, (line, path) in enumerate(zip(lines, paths)):
                following = lines[n + 1] if n + 1 < len(lines) else None
                frames += pcm(path, Path(t)) + silence(pause_after(line, following, n == 0))
            encode(frames, target, Path(t))
        print(f"chapter {chapter}: {len(frames) / 2 / 24000 / 60:.1f} min", flush=True)
    script = "".join(
        ("<hr>" if line["pericope"] else "")
        + f"<p><b>{html.escape(line['speaker'])}</b> <small>{html.escape(line['voice'])}"
        f"{' · v.' + str(line['verses'][0]) if line['verses'] else ''}</small><br>{html.escape(line['text'])}</p>"
        for line in lines
    )
    sections.append(
        f"<h2>{'Capítulo' if lang == 'pt' else 'Chapter'} {chapter}</h2>"
        f"<audio controls preload='none' src='{target.name}'></audio>"
        f"<details><summary>Text with speakers</summary>{script}</details>"
    )

cast = ""
for wav in sorted(voices.glob("*.wav")):
    shutil.copy(wav, listen / "voices" / wav.name)
    description = wav.with_name(wav.stem + ".description.txt").read_text().strip()
    cast += (
        f"<tr><th>{wav.stem}</th><td><audio controls preload='none' src='voices/{wav.name}'></audio></td>"
        f"<td><small>{html.escape(description)}</small></td></tr>"
    )
others = " · ".join(f"<a href='../{book}-{e}/index.html'>{n}</a>" for e, n in names.items() if e != edition and (listen.parent / f'{book}-{e}').exists())
(listen / "index.html").write_text(f"""<!doctype html><meta charset="utf-8"><title>{book.capitalize()}, dramatized: {names[edition]}</title>
<style>body{{font:16px/1.45 Georgia,serif;max-width:900px;margin:2rem auto;padding:0 1rem}}audio{{width:100%;max-width:520px}}
small{{color:#666}}table{{border-collapse:collapse}}td,th{{padding:.4rem;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}}
details p{{margin:.5rem 0}}hr{{border:0;border-top:1px solid #ccc;margin:1.2rem 0}}</style>
<h1>{book.capitalize()}, dramatized: {names[edition]}</h1>
<p>Pilot, voiced by Qwen3-TTS with a cast of designed voices. Other editions: {others} · <a href="../index.html">Rosary comparison</a></p>
{''.join(sections)}
<h2>The cast's voices</h2><table>{cast}</table>""", encoding="utf-8")
print(listen / "index.html")
