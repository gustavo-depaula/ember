"""Proofread works in priority order, and rebuild each one as soon as it is done.

    .venv/bin/python proofread.py            # the whole queue, from where it left off
    .venv/bin/python proofread.py --tier 2   # stop after tier 2

For each work: check_pages.py over every part's leaves, a second pass for any
page that failed, then catalogue.py (which drops the draft label once every page
has its fix list) and assemble.py for that work. Exits 75, like check_pages.py,
when the usage limit is reached; run it again after the reset and it resumes.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

from run_volumes import data

here = Path(__file__).parent
python = str(here / ".venv" / "bin" / "python")

# Most read first: short devotional treatises, then the Scripture people pray with, then the monastic classics.
tiers = [
    ["de-oratione", "de-meditatione", "de-contemplatione", "de-fonte-lucis", "sonus-epulantis", "inflammatorium-divini-amoris",
     "de-perfectione-caritatis", "de-particulari-judicio", "de-quatuor-hominis-novissimis"],
    ["expositio-missae", "de-sacramento-altaris", "de-sacra-communione-frequentanda", "de-sacramento-eucharistiae-sermones",
     "de-praeconio-et-dignitate-mariae", "de-dignitate-et-laudibus-mariae", "de-passione-domini-dialogus", "horae-de-passione",
     "de-laudibus-trinitatis", "de-donis-spiritus-sancti", "expositio-hymnorum"],
    ["enarratio-in-matthaeum", "enarratio-in-marcum", "enarratio-in-lucam", "enarratio-in-joannem", "commentaria-in-psalmos",
     "enarratio-in-canticum-canticorum"],
    ["in-scalam-paradisi", "in-cassiani-instituta", "in-cassiani-collationes", "de-vita-et-fine-solitarii", "de-laude-vitae-solitariae",
     "de-praeconio-ordinis-cartusiensis", "de-professione-monastica", "exhortatorium-noviciorum", "de-arcta-via-salutis",
     "de-doctrina-et-regulis-vitae-christianorum"],
]


def log(message: str) -> None:
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {message}"
    print(line, flush=True)
    with open(data / "proofread.log", "a") as f:
        f.write(line + "\n")


def unchecked(work: dict) -> int:
    return sum(1 for p in work["parts"] for leaf in p["leaves"]
               if (data / "dots" / p["volume"] / f"{leaf}.md").exists() and not (data / "checked" / p["volume"] / f"{leaf}.jsonl").exists())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tier", type=int, default=len(tiers))
    args = parser.parse_args()
    for n, slugs in enumerate(tiers[:args.tier], 1):
        for slug in slugs:
            work_path = here / "works" / f"{slug}.json"
            work = json.loads(work_path.read_text())
            if not work.get("draft") and not unchecked(work):
                continue
            log(f"tier {n}: {slug}, {unchecked(work)} pages to check")
            for attempt in range(2):  # the second pass retries pages that failed
                for part in work["parts"]:
                    leaves = f"{part['leaves'][0]}-{part['leaves'][-1]}"
                    code = subprocess.run([python, "check_pages.py", "--volume", part["volume"], "--leaves", leaves], cwd=here).returncode
                    if code == 75:
                        log("usage limit reached; stopping")
                        sys.exit(75)
                if not unchecked(work):
                    break
            if unchecked(work):
                log(f"{slug}: {unchecked(work)} pages still failing; left as a draft")
                continue
            subprocess.run([python, "catalogue.py"], cwd=here, check=True)
            subprocess.run([python, "assemble.py", str(work_path)], cwd=here, check=True)
            log(f"{slug}: proofread and assembled")
    log("queue done")


if __name__ == "__main__":
    main()
