#!/usr/bin/env python3
"""The archive's parquet tables as the JSON the importer reads.

    python3 scripts/loth/dump.py <archive>/liturgia_horas_motor/parquet <dumps dir>

Needs pyarrow. Writes cal.json (one row per date, 2020-2040, with the key of
each of its eight hours), chaves.json (key -> text id), textos.jsonl (text id
-> HTML) and the four smaller tables as they are.
"""

import json
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
