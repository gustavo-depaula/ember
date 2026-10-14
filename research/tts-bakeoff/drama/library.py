"""One page listing every dramatized book that has been stitched: out/_listen/livros/.

    python3 drama/library.py
"""

import json
import subprocess
from pathlib import Path

here = Path(__file__).parent
listen = here.parent / "out" / "_listen"
titles = json.loads((here / "titles.json").read_text(encoding="utf-8"))
editions = {"en": "English, Douay-Rheims", "pt-ms": "Português, Matos Soares", "pt-am": "Português, Ave Maria"}
order = ["genesis", "exodus", "ruth", "tobias", "judith", "esther", "job", "jonas", "matthew", "mark", "luke", "john", "acts", "apocalypse"]


def minutes(folder: Path) -> float:
    total = 0.0
    for clip in folder.glob("*.m4a"):
        total += float(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)],
            capture_output=True, text=True, check=True).stdout)
    return total / 60


rows = []
grand = 0.0
for book in order + sorted(set(titles) - set(order)):
    for edition, label in editions.items():
        folder = listen / f"{book}-{edition}"
        if not (folder / "index.html").exists():
            continue
        chapters = len(list(folder.glob("*.m4a")))
        length = minutes(folder)
        grand += length
        name = titles.get(book, {}).get(edition.split("-")[0], book).rstrip(".")
        rows.append(f"<tr><td><a href='../{folder.name}/index.html'>{name}</a><br><small>{label}</small></td>"
                    f"<td>{chapters}</td><td>{int(length // 60)} h {int(length % 60):02d}</td></tr>")
page = listen / "livros"
page.mkdir(exist_ok=True)
(page / "index.html").write_text(f"""<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Livros</title>
<style>body{{font:17px/1.45 Georgia,serif;max-width:680px;margin:1rem auto;padding:0 1rem}}table{{border-collapse:collapse;width:100%}}
td,th{{padding:.6rem .4rem;border-bottom:1px solid #ddd;text-align:left}}small{{color:#666}}</style>
<h1>Dramatized books</h1>
<p>{int(grand // 60)} hours {int(grand % 60)} minutes in all. <a href="../opcoes/index.html">Voice and accent options</a> · <a href="../index.html">Rosary comparison</a></p>
<table><tr><th>Book</th><th>Chapters</th><th>Length</th></tr>{''.join(rows)}</table>""", encoding="utf-8")
print(f"{len(rows)} editions, {grand / 60:.1f} hours")
