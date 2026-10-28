"""Which book and edition the scripts work on, chosen by BOOK and EDITION.

    BOOK     mark (default), job, ... : a folder here and a slug in content/bible
    EDITION  en      Douay-Rheims
             pt-ms   Matos Soares, from content/bible/matos-soares
             pt-am   Ave Maria, fetched from the publisher; copyrighted, so
                     everything derived from it stays under consult/, which git ignores

Every book and edition has the same files (verses.json, attribution/,
utterances.json), so each step is one script pointed at a different folder.
The cast's voices are shared by all books, one set per language.
"""

import os
from pathlib import Path

here = Path(__file__).parent
book = os.environ.get("BOOK", "mark")
edition = os.environ.get("EDITION", "en")
lang = edition.split("-")[0]
bookDir = here / book
root = bookDir / "consult" / edition if edition == "pt-am" else bookDir / edition
clips = here.parent / "out" / "drama" / book / edition
listen = here.parent / "out" / "_listen" / f"{book}-{edition}"
# VOICESET picks another cast for the same language (an accent trial, say);
# its audio is kept apart so the two can be compared.
voiceSet = os.environ.get("VOICESET", lang)
voices = here / "voices" / voiceSet
if voiceSet != lang:
    clips = clips / voiceSet
    listen = listen.with_name(f"{listen.name}-{voiceSet}")
ttsLanguage = {"en": "English", "pt": "Portuguese"}[lang]


def chosen(utterances: dict) -> dict:
    """CHAPTERS="1" or "1,2" limits a run to those chapters: a trial needs
    one chapter to be judged by ear, not the whole book."""
    wanted = os.environ.get("CHAPTERS")
    return {c: utterances[c] for c in wanted.split(",")} if wanted else utterances
