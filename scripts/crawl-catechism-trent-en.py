#!/usr/bin/env python3
"""Download the McHugh & Callan 1923 Catechism of Trent from catholicapologetics.info.

Outputs a single .txt with --- page separators (one per source page), saved to
content/_archive/base/sources/english-originals/catechism-of-trent.txt (originally
written there pre-Hearth-v2; the archived path is now the source for re-imports).

Source: http://www.catholicapologetics.info/thechurch/catechism/
Translation: McHugh & Callan, 1923 — public domain in the US (pre-1929).
42 .shtml pages: 1 preface + 13 creed + 8 sacraments + 10 decalogue + 10 Lord's Prayer.
"""

from __future__ import annotations

import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = (
    ROOT
    / "content"
    / "libraries"
    / "base"
    / "sources"
    / "english-originals"
    / "catechism-of-trent.txt"
)
BASE_URL = "http://www.catholicapologetics.info/thechurch/catechism/"

PAGES: list[tuple[str, str]] = [
    # (filename, descriptive title)
    ("Preface.shtml", "Preface — Introduction to the Catechism of the Council of Trent"),
    # Part I — The Apostles' Creed (intro + 12 articles)
    ("ApostlesCreed00.shtml", "Part I — On Faith and the Creed"),
    ("ApostlesCreed01.shtml", "Article I — I believe in God the Father Almighty, Creator of heaven and earth"),
    ("ApostlesCreed02.shtml", "Article II — And in Jesus Christ, his only Son, our Lord"),
    ("ApostlesCreed03.shtml", "Article III — Who was conceived of the Holy Ghost, born of the Virgin Mary"),
    ("ApostlesCreed04.shtml", "Article IV — Suffered under Pontius Pilate; was crucified, dead, and buried"),
    ("ApostlesCreed05.shtml", "Article V — He descended into hell; the third day he rose again from the dead"),
    ("ApostlesCreed06.shtml", "Article VI — He ascended into heaven, sitteth at the right hand of God the Father Almighty"),
    ("ApostlesCreed07.shtml", "Article VII — From thence he shall come to judge the living and the dead"),
    ("ApostlesCreed08.shtml", "Article VIII — I believe in the Holy Ghost"),
    ("ApostlesCreed09.shtml", "Article IX — The Holy Catholic Church, the communion of saints"),
    ("ApostlesCreed10.shtml", "Article X — The forgiveness of sins"),
    ("ApostlesCreed11.shtml", "Article XI — The resurrection of the body"),
    ("ApostlesCreed12.shtml", "Article XII — And life everlasting. Amen"),
    # Part II — The Sacraments (intro + 7 sacraments)
    ("Holy7Sacraments.shtml", "Part II — On the Sacraments"),
    ("Holy7Sacraments-Baptism.shtml", "The Sacrament of Baptism"),
    ("Holy7Sacraments-Confirmation.shtml", "The Sacrament of Confirmation"),
    ("Holy7Sacraments-Eucharist.shtml", "The Sacrament of the Holy Eucharist"),
    ("Holy7Sacraments-Penance.shtml", "The Sacrament of Penance"),
    ("Holy7Sacraments-Unction.shtml", "The Sacrament of Extreme Unction"),
    ("Holy7Sacraments-Orders.shtml", "The Sacrament of Holy Orders"),
    ("Holy7Sacraments-Matrimony.shtml", "The Sacrament of Matrimony"),
    # Part III — The Decalogue (intro + 9 commandments; 9th & 10th merged)
    ("TenCommandments.shtml", "Part III — Introduction to the Decalogue"),
    ("TenCommandments-first.shtml", "First Commandment — No False Gods"),
    ("TenCommandments-second.shtml", "Second Commandment — No Misuse of God's Name"),
    ("TenCommandments-third.shtml", "Third Commandment — Honor the Sabbath"),
    ("TenCommandments-fourth.shtml", "Fourth Commandment — Honor Your Father and Mother"),
    ("TenCommandments-fifth.shtml", "Fifth Commandment — No Murder"),
    ("TenCommandments-sixth.shtml", "Sixth Commandment — No Adultery"),
    ("TenCommandments-seventh.shtml", "Seventh Commandment — No Theft"),
    ("TenCommandments-eighth.shtml", "Eighth Commandment — No False Witness"),
    ("TenCommandments-ninth-tenth.shtml", "Ninth and Tenth Commandments — No Coveting a Neighbor's Spouse or Property"),
    # Part IV — The Lord's Prayer (intro + Our Father + 7 petitions + Amen)
    ("TheLordsPrayer.shtml", "Part IV — On Prayer"),
    ("TheLordsPrayer00.shtml", "The Lord's Prayer — Our Father, who art in heaven"),
    ("TheLordsPrayer01.shtml", "First Petition — Hallowed be Thy name"),
    ("TheLordsPrayer02.shtml", "Second Petition — Thy kingdom come"),
    ("TheLordsPrayer03.shtml", "Third Petition — Thy will be done on earth as it is in heaven"),
    ("TheLordsPrayer04.shtml", "Fourth Petition — Give us this day our daily bread"),
    ("TheLordsPrayer05.shtml", "Fifth Petition — Forgive our trespasses"),
    ("TheLordsPrayer06.shtml", "Sixth Petition — And lead us not into temptation"),
    ("TheLordsPrayer07.shtml", "Seventh Petition — But deliver us from evil"),
    ("TheLordsPrayerAmen.shtml", "Amen"),
]


def fetch_page(filename: str) -> str:
    url = BASE_URL + filename
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    # The site uses 1990s charset; force latin-1 fallback if needed
    if resp.encoding is None or resp.encoding.lower() in ("iso-8859-1", "ascii"):
        resp.encoding = "windows-1252"
    soup = BeautifulSoup(resp.text, "html.parser")
    # Drop nav and script/style noise
    for tag in soup(["script", "style", "head", "meta", "link", "img"]):
        tag.decompose()
    text = soup.get_text(separator="\n\n")
    # Collapse runs of blank lines
    lines = [ln.rstrip() for ln in text.split("\n")]
    cleaned: list[str] = []
    blank = 0
    for ln in lines:
        if ln.strip() == "":
            blank += 1
            if blank <= 1:
                cleaned.append("")
        else:
            blank = 0
            cleaned.append(ln)
    return "\n".join(cleaned).strip()


def main() -> None:
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    parts: list[str] = []
    for i, (filename, title) in enumerate(PAGES, 1):
        print(f"[{i:>2}/{len(PAGES)}] {filename} — {title}")
        body = fetch_page(filename)
        header = f"=== PAGE {i}: {filename} ===\n=== TITLE: {title} ==="
        parts.append(header + "\n\n" + body)
        time.sleep(0.5)  # be polite

    text = "\n\n---\n\n".join(parts)
    OUT_FILE.write_text(text, encoding="utf-8")
    word_count = len(text.split())
    print(f"\nWrote {OUT_FILE}")
    print(f"  size: {len(text):,} chars, {word_count:,} words")


if __name__ == "__main__":
    main()
