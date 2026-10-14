"""Ecclesiastical (Roman) Latin to IPA, by rule.

Church Latin is regular enough to pronounce without a dictionary, and the
corpus already prints the stress accent on every word of three syllables or
more, so the two things an Italian voice gets wrong (where the stress falls,
and the handful of spellings Italian reads differently) can be settled here
and handed to any engine that accepts phonemes.

Symbols follow what espeak-ng emits for Italian (ʧ ʤ ʦ ʣ, stress mark right
before the vowel), because that is what Kokoro's Italian voices were trained on.
"""

import re
import unicodedata

front = "eiyæœ"
vowels = "aeiouyæœ"
# Said without a stress of their own.
clitics = {"et", "in", "ad", "a", "ab", "e", "ex", "de", "per", "pro", "cum", "sub", "ut", "sed", "est", "es", "nos", "ne"}


def letters(word: str) -> tuple[str, int | None]:
    """Lowercase letters without accents, and the index of the accented vowel."""
    out, stressed = [], None
    for ch in unicodedata.normalize("NFD", word.lower()):
        if ch == "́":
            stressed = len(out) - 1
        elif not unicodedata.combining(ch):
            out.append(ch)
    return "".join(out), stressed


def word_ipa(word: str) -> str:
    w, stressed = letters(word)
    if w in ("mihi", "nihil"):
        w = w.replace("h", "k")
    phones: list[tuple[str, bool, int | None]] = []  # symbol, is syllable nucleus, source index

    def emit(symbol: str, nucleus: bool = False, source: int | None = None) -> None:
        phones.append((symbol, nucleus, source))

    i, n = 0, len(w)
    while i < n:
        ch = w[i]
        nxt = w[i + 1] if i + 1 < n else ""
        after = w[i + 2] if i + 2 < n else ""
        prev = w[i - 1] if i else ""
        if ch == nxt and ch not in vowels and ch not in "cg":
            emit({"s": "s", "z": "ʣ"}.get(ch, ch) + "ː")
            i += 2
        elif ch == "c":
            if nxt == "c" and after and after in front:
                emit("tʧ"); i += 2
            elif nxt == "c":
                emit("kː"); i += 2
            elif nxt == "h":
                emit("k"); i += 2
            elif nxt and nxt in front:
                emit("ʧ"); i += 1
            else:
                emit("k"); i += 1
        elif ch == "g":
            if nxt == "n":
                emit("ɲ"); i += 2
            elif nxt == "g" and after and after in front:
                emit("dʤ"); i += 2
            elif nxt and nxt in front:
                emit("ʤ"); i += 1
            elif nxt == "u" and prev == "n" and after and after in vowels:
                emit("ɡw"); i += 2
            else:
                emit("ɡ"); i += 1
        elif ch == "s" and nxt == "c" and after and after in front:
            emit("ʃ"); i += 2
        elif ch == "x" and nxt == "c" and after and after in front:
            emit("kʃ"); i += 2
        elif ch == "x":
            emit("ks"); i += 1
        elif ch == "q" and nxt == "u":
            emit("kw"); i += 2
        elif ch in "ptr" and nxt == "h":
            emit({"p": "f", "t": "t", "r": "r"}[ch]); i += 2
        elif ch == "h":
            i += 1
        elif ch == "t" and nxt == "i" and after and after in vowels and prev and prev not in "stx" and stressed != i + 1:
            emit("ʦ"); i += 1
        elif ch == "s" and prev and prev in vowels and nxt and nxt in vowels:
            emit("z"); i += 1
        elif ch == "z":
            emit("ʣ"); i += 1
        elif ch in "ij" and nxt and nxt in vowels and (i == 0 or prev in vowels) and stressed != i:
            emit("j"); i += 1
        elif ch == "j":
            emit("j"); i += 1
        elif ch in "æœ":
            emit("e", True, i); i += 1
        elif ch == "y":
            emit("i", True, i); i += 1
        elif ch == "a" and nxt == "u":
            emit("au", True, i); i += 2
        elif ch in vowels:
            emit(ch, True, i); i += 1
        else:
            emit(ch); i += 1

    nuclei = [k for k, (_, nucleus, _) in enumerate(phones) if nucleus]
    if not nuclei:
        return "".join(p for p, _, _ in phones)
    marked = next((k for k in nuclei if phones[k][2] == stressed), None) if stressed is not None else None
    if marked is None and not (len(nuclei) == 1 and w in clitics):
        marked = nuclei[0] if len(nuclei) <= 2 else nuclei[-2]
    out = []
    for k, (symbol, nucleus, _) in enumerate(phones):
        if not nucleus:
            out.append(symbol)
        elif k == marked:
            out.append("ˈ" + {"e": "ɛ", "o": "ɔ"}.get(symbol, symbol))
        else:
            out.append({"u": "ʊ"}.get(symbol, symbol))
    return "".join(out)


def to_ipa(text: str) -> str:
    return re.sub(r"[^\W\d_]+", lambda m: word_ipa(m.group(0)), text)


if __name__ == "__main__":
    for line in (
        "Ave María, grátia plena, Dóminus tecum. Benedícta tu in muliéribus, et benedíctus fructus ventris tui, Iesus.",
        "Pater noster, qui es in cælis, sanctificétur nomen tuum. Panem nostrum quotidiánum da nobis hódie.",
        "et ne nos indúcas in tentatiónem. descéndit ad ínferos, ascéndit ad cælos, iudicáre vivos et mórtuos. Fílium eius únicum.",
        "in sǽcula sæculórum. Ecce ancílla. Regína cæli. excélsis. Agnus Dei. mihi. Spirítui Sancto. sicut erat in princípio. Christum. cathólicam. remissiónem peccatórum, carnis resurrectiónem",
    ):
        print(to_ipa(line))
