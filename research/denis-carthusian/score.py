"""Score OCR outputs in out/<engine>/ against the reference transcriptions in samples/.

CER/WER compare the text after removing markup and normalising the spacing around
punctuation (the edition sets French spaces, « … » and ` : `, which engines render
either way). Ligatures are scored separately because losing æ/œ is the typical
failure of the older OCR, and CER alone hides it.
"""

import re
import sys
from pathlib import Path

from rapidfuzz.distance import Levenshtein

here = Path(__file__).parent


def normalise(text: str) -> str:
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = text.replace("*", "").replace("_", "")
    text = re.sub(r"\s+([;:?!»,.)])", r"\1", text)
    text = re.sub(r"([«(])\s+", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def ligature_words(text: str) -> list[str]:
    return re.findall(r"\w*[æœÆŒ]\w*", text)


def score(ref: str, hyp: str) -> dict:
    r, h = normalise(ref), normalise(hyp)
    rw, hw = r.split(), h.split()
    lig = ligature_words(r)
    hyp_words = set(hw) | {w.strip(".,;:?!»«()") for w in hw}
    kept = sum(1 for w in lig if w in hyp_words)
    return {
        "cer": Levenshtein.distance(r, h) / len(r),
        "wer": Levenshtein.distance(rw, hw) / len(rw),
        "lig": (kept, len(lig)),
        "italic": hyp.count("*") // 2,
        "italic_ref": ref.count("*") // 2,
    }


def main(engines: list[str]) -> None:
    refs = sorted((here / "samples").glob("*.md"))
    engines = engines or sorted(p.name for p in (here / "out").iterdir() if p.is_dir() and p.name != "crops")
    print(f"{'engine':<14}{'page':<34}{'CER':>7}{'WER':>7}{'æ/œ kept':>11}{'italics':>10}")
    for engine in engines:
        totals = []
        for ref in refs:
            hyp = here / "out" / engine / ref.name
            if not hyp.exists():
                print(f"{engine:<14}{ref.stem:<34}{'missing':>7}")
                continue
            s = score(ref.read_text(), hyp.read_text())
            totals.append(s)
            print(f"{engine:<14}{ref.stem:<34}{s['cer']:>7.2%}{s['wer']:>7.2%}{s['lig'][0]:>6}/{s['lig'][1]:<4}{s['italic']:>5}/{s['italic_ref']}")
        if totals:
            n = len(totals)
            kept = sum(t["lig"][0] for t in totals)
            all_lig = sum(t["lig"][1] for t in totals)
            print(f"{engine:<14}{'MEAN':<34}{sum(t['cer'] for t in totals) / n:>7.2%}{sum(t['wer'] for t in totals) / n:>7.2%}{kept:>6}/{all_lig}")
        print()


if __name__ == "__main__":
    main(sys.argv[1:])
