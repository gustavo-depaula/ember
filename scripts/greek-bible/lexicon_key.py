"""Lookup key for the Greek lexicons in content/bible/lexicon/.

A word in the text and a lexicon headword rarely agree to the last mark:
a capital, an accent thrown back by an enclitic, a grave for an acute, a
homograph number in the headword. The key keeps only the bare letters, so
every spelling of a word lands on the same shard entry, and homographs
(εἰμί "be" and εἶμι "go") share one list the app ranks by exact lemma.

apps/app/src/features/bible/lexiconKey.ts is the same algorithm; change both.
"""

import unicodedata


def lexicon_key(word: str) -> str:
    # Lowercase before NFD so capitals with breathings (Ἰ) decompose the same
    # way as their small letters.
    decomposed = unicodedata.normalize("NFD", word.lower())
    letters = "".join(
        ch for ch in decomposed if not unicodedata.category(ch).startswith("M") and ch.isalpha()
    )
    return unicodedata.normalize("NFC", letters.replace("ς", "σ"))


def shard_of(key: str) -> str:
    # One shard per letter of the Greek alphabet; anything else (a stray Latin
    # or Hebrew headword) goes to "_".
    first = key[:1]
    return first if "α" <= first <= "ω" and first != "ς" else "_"
