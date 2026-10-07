#!/usr/bin/env python3
"""The archive's parquet tables as the JSON the importer reads.

    python3 scripts/loth/dump.py <archive>/liturgia_horas_motor/parquet <dumps dir>

Needs pyarrow. Writes cal.json (one row per date, 2020-2040, with the key of
each of its eight hours), chaves.json (key -> text id), textos.jsonl (text id
-> HTML) and the four smaller tables as they are; and domingos.json, the
antiphons of the Gospel canticle for the Sundays of each year of the cycle,
which the app kept apart from its texts and set into the hour as it was shown
(so the archive's generated hours have them only in Ordinary Time).
"""

import json
import re
import sys
from pathlib import Path

import pyarrow.parquet as pq

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)


def rows(name: str) -> list[dict]:
    return pq.read_table(src / f"{name}.parquet").to_pylist()


def write(name: str, data) -> None:
    with (out / name).open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False)


write("cal.json", rows("lh_calendario"))
write("chaves.json", [{"chave": r["chave"], "texto_id": r["texto_id"]} for r in rows("lh_chaves")])
with (out / "textos.jsonl").open("w", encoding="utf-8") as fh:
    for r in rows("lh_textos"):
        fh.write(json.dumps({"id": r["texto_id"], "hora": r["hora"], "html": r["html"]}, ensure_ascii=False) + "\n")
for name in ("lh_extras", "lh_salterio", "lh_avulsos", "lh_avulsos_extras"):
    write(f"{name}.json", rows(name))


# season -> hour and Sunday ("laudes3", "vesperasIramos") -> year -> antiphon
sundays: dict[str, dict[str, dict[str, str]]] = {}
data = (src.parent / "fonte_js" / "lib" / "gx.js").read_text(encoding="utf-8")
for season, sunday, literal in re.findall(r'antifonaDomingo(\w+)\.(\w+)\s*=\s*("(?:[^"\\]|\\.)*")', data):
    text = json.loads(re.sub(r"\\x([0-9A-Fa-f]{2})", r"\\u00\1", literal))
    years = dict(re.findall(r"<Ano ([ABC])>(.*?)<Ano \1>", text, flags=re.S)) or dict(
        re.findall(r"Ano ([ABC])</font>(.*?)(?:<br><br>|$)", text, flags=re.S)
    )
    if years:
        sundays.setdefault(season, {})[sunday] = {
            year: "\n".join(line.strip() for line in re.split(r"<br>|\n", antiphon) if line.strip())
            for year, antiphon in years.items()
        }
write("domingos.json", sundays)
