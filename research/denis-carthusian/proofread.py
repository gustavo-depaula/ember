"""Proofread works in priority order, and rebuild each one as soon as it is done.

    .venv/bin/python proofread.py            # the whole queue, from where it left off
    .venv/bin/python proofread.py --tier 2   # stop after tier 2
    .venv/bin/python proofread.py --tier 5 --weekly-cap 90   # leave 10% of the week for other work

For each work: check_pages.py over every part's leaves, a second pass for any
page that failed, then catalogue.py (which drops the draft label once every page
has its fix list) and assemble.py for that work. Exits 75, like check_pages.py,
when the usage limit is reached; run it again after the reset and it resumes.
With --weekly-cap it also stops (exit 76) before a work once the week's usage
reaches that percentage, so the subscription keeps room for other work.
"""

import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path

from run_volumes import data

here = Path(__file__).parent
python = str(here / ".venv" / "bin" / "python")

# Most read first: short devotional treatises, then the Scripture people pray with, then the monastic classics,
# and so on down to the Sentences, read mostly by scholars.
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
    # The rest of the minor works on the Christian life, and his Life.
    ["vita-et-opera", "summa-de-vitiis-et-virtutibus", "de-conversione-peccatorum", "de-gravitate-peccati", "de-munificentia-dei",
     "de-mutua-cognitione-beatorum", "de-vita-conjugatorum", "de-vita-viduarum", "de-vita-virginum", "de-vita-inclusarum",
     "de-modo-devote-psallendi", "speculum-amatorum-mundi", "inter-jesum-et-senem-et-puerum-dialogi", "de-distantia-perfectionis",
     "de-exemplis-et-documentis", "de-obedientia-superioribus-praestanda", "de-reformatione-claustralium", "de-reformatione-monialium"],
    # The rest of the New Testament, the Penitential Psalms and the Passion.
    ["passio-juxta-quatuor-evangelistas", "enarratio-in-psalmum-poenitentialem", "enarratio-in-actus-apostolorum", "enarratio-in-romanos",
     "enarratio-in-i-corinthios", "enarratio-in-ii-corinthios", "enarratio-in-galatas", "enarratio-in-ephesios", "enarratio-in-philippenses",
     "enarratio-in-colossenses", "enarratio-in-i-thessalonicenses", "enarratio-in-ii-thessalonicenses", "enarratio-in-i-timotheum",
     "enarratio-in-ii-timotheum", "enarratio-in-titum-et-philemonem", "enarratio-in-hebraeos", "enarratio-in-jacobum", "enarratio-in-i-petri",
     "enarratio-in-ii-petri", "enarratio-in-epistolas-joannis", "enarratio-in-judam", "enarratio-in-apocalypsim", "monopanton"],
    # The sermons for the year.
    ["sermones-de-tempore-i", "sermones-de-tempore-ii", "sermones-de-sanctis-i", "sermones-de-sanctis-ii"],
    # The Pentateuch and the wisdom books.
    ["enarratio-in-exodum", "enarratio-in-leviticum", "enarratio-in-numeros", "enarratio-in-deuteronomium", "epilogatio-in-pentateuchum",
     "enarratio-in-job", "enarratio-in-proverbia", "enarratio-in-ecclesiasten", "enarratio-in-sapientiam", "enarratio-in-ecclesiasticum"],
    # The prophets.
    ["enarratio-in-isaiam", "enarratio-in-jeremiam", "enarratio-in-threnos", "enarratio-in-baruch", "enarratio-in-ezechielem",
     "enarratio-in-danielem", "enarratio-in-osee", "enarratio-in-joelem", "enarratio-in-amos", "enarratio-in-abdiam", "enarratio-in-jonam",
     "enarratio-in-michaeam", "enarratio-in-nahum", "enarratio-in-habacuc", "enarratio-in-sophoniam", "enarratio-in-aggaeum",
     "enarratio-in-zachariam", "enarratio-in-malachiam"],
    # The historical books, and the works on Scripture as a whole.
    ["enarratio-in-josue", "enarratio-in-judices", "enarratio-in-ruth", "enarratio-in-i-regum", "enarratio-in-ii-regum",
     "enarratio-in-iii-regum", "enarratio-in-iv-regum", "enarratio-in-i-paralipomenon", "enarratio-in-ii-paralipomenon",
     "enarratio-in-i-esdrae", "enarratio-in-ii-esdrae", "enarratio-in-tobiam", "enarratio-in-judith", "enarratio-in-esther",
     "enarratio-in-i-machabaeorum", "enarratio-in-ii-machabaeorum", "epitome-sacrae-scripturae", "de-causa-diversitatis-eventuum-humanorum"],
    # The Areopagite, and the praises of God.
    ["in-mysticam-theologiam", "in-divina-nomina", "in-coelestem-hierarchiam", "in-ecclesiasticam-hierarchiam", "in-epistolas-dionysii",
     "de-laudibus-dei", "de-laudibus-superlaudabilis-dei", "de-venustate-mundi", "creaturarum-consideratio-theologica"],
    # Theology and philosophy.
    ["summa-fidei-orthodoxae", "dialogion-de-fide-catholica", "de-lumine-christianae-theoriae", "de-natura-aeterni-et-veri-dei",
     "elementatio-theologica", "elementatio-philosophica", "in-boetium-de-consolatione"],
    # The Church, its reform, and Islam.
    ["de-auctoritate-summi-pontificis", "epistola-ad-principes-catholicos", "de-regimine-politiae", "contra-simoniam",
     "contra-pluralitatem-beneficiorum", "contra-ambitionem", "contra-vitia-superstitionum", "de-modo-agendi-processiones",
     "in-regulam-s-francisci", "sermones-et-epistolae-varia", "contra-perfidiam-mahometi", "dialogus-inter-christianum-et-sarracenum"],
    # The Sentences.
    ["in-i-sententiarum", "in-ii-sententiarum", "in-iii-sententiarum", "in-iv-sententiarum"],
]


def log(message: str) -> None:
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {message}"
    print(line, flush=True)
    with open(data / "proofread.log", "a") as f:
        f.write(line + "\n")


def weekly_used() -> int | None:
    """The week's usage in percent, as `claude /usage` reports it."""
    out = subprocess.run(["claude", "-p", "/usage"], cwd="/tmp", capture_output=True, text=True).stdout
    m = re.search(r"Current week \(all models\): (\d+)% used", out)
    return int(m.group(1)) if m else None


def unchecked(work: dict) -> int:
    return sum(1 for p in work["parts"] for leaf in p["leaves"]
               if (data / "dots" / p["volume"] / f"{leaf}.md").exists() and not (data / "checked" / p["volume"] / f"{leaf}.jsonl").exists())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tier", type=int, default=len(tiers))
    parser.add_argument("--weekly-cap", type=int, help="stop once the week's usage reaches this percentage")
    args = parser.parse_args()
    for n, slugs in enumerate(tiers[:args.tier], 1):
        for slug in slugs:
            work_path = here / "works" / f"{slug}.json"
            work = json.loads(work_path.read_text())
            if not work.get("draft") and not unchecked(work):
                continue
            if args.weekly_cap and (used := weekly_used()) is not None and used >= args.weekly_cap:
                log(f"weekly usage at {used}%, cap {args.weekly_cap}%; stopping")
                sys.exit(76)
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
