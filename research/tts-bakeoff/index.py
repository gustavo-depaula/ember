"""Write out/_listen/index.html: every assembled file with a player, by language.

    python3 index.py
"""

import html
import json
from pathlib import Path

base = Path(__file__).parent
listen = base / "out" / "_listen"
titles = {
    "en-US": "English",
    "pt-BR": "Português",
    "la-raw": "Latin, corpus spelling read as Italian",
    "la-plain": "Latin, accents removed, read as Italian",
    "la-ital": "Latin, respelled for Italian",
    "la-ipa": "Latin, rule-based phonemes",
}


def facts(model: str, voice: str, variant: str) -> str:
    parts = []
    meta = base / "out" / model / voice / variant / "_meta.json"
    if meta.exists():
        m = json.loads(meta.read_text())
        if m["wallSeconds"]:
            parts.append(f"{m['audioSeconds'] / m['wallSeconds']:.1f}× real time")
    check = base / "out" / "_verify" / f"{model}__{voice}__{variant}.json"
    if check.exists():
        parts.append(f"{json.loads(check.read_text())['wer']:.0%} words misheard by Whisper")
    return " · ".join(parts)


rows = []
for variant, title in titles.items():
    files = sorted((listen / variant).glob("*.sampler.m4a")) if (listen / variant).exists() else []
    if not files:
        continue
    rows.append(f"<h2>{html.escape(title)}</h2><table>")
    for sampler in files:
        name = sampler.name.removesuffix(".sampler.m4a")
        model, _, voice = name.partition("__")
        leader = voice.split("+")[0]
        rows.append(
            f"<tr><th>{html.escape(model)}<br><small>{html.escape(voice)}</small></th>"
            f"<td><audio controls preload='none' src='{variant}/{name}.sampler.m4a'></audio><br><small>sampler</small></td>"
            f"<td><audio controls preload='none' src='{variant}/{name}.full.m4a'></audio><br><small>whole Rosary</small></td>"
            f"<td><small>{html.escape(facts(model, leader, variant))}</small></td></tr>"
        )
    rows.append("</table>")

page = f"""<!doctype html><meta charset="utf-8"><title>Rosary voice bake-off</title>
<style>body{{font:16px/1.4 Georgia,serif;max-width:1100px;margin:2rem auto;padding:0 1rem}}
table{{border-collapse:collapse;width:100%}}td,th{{padding:.5rem;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}}
audio{{width:320px}}small{{color:#666}}</style>
<h1>Rosary voice bake-off</h1>
<p>Glorious mysteries. The sampler is the Sign of the Cross, the first mystery, an Our Father, two Hail Marys, a Glory Be and the Fatima prayer.</p>
{''.join(rows)}"""
(listen / "index.html").write_text(page)
print(listen / "index.html")
