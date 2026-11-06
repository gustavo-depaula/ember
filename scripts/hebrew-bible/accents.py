#!/usr/bin/env python3
"""Write content/bible/hebrew-wlc/accents.json: the Masoretic accents, as
Gesenius' Hebrew Grammar §15 lists them, keyed by the Unicode marks the
Westminster Leningrad Codex writes them with.

Source: Gesenius' Hebrew Grammar, ed. E. Kautzsch, tr. A. E. Cowley (2nd
English ed., 1910; public domain), §15 "The Accents" and §29 i "the pause",
read in the English Wikisource transcription (en.wikisource.org/wiki/
Gesenius'_Hebrew_Grammar/15._The_Accents; /29._The_Tone,_its_Changes_and_the_
Pause). Only names, kinds, numbers and positions are taken from it — facts of
the book, not its prose. The codepoints are Unicode's names for the marks
(HEBREW ACCENT ETNAHTA, … ).

Gesenius numbers the disjunctives of each system (§15 f, h) roughly from the
strongest down, and warns that the Christian grammarians' four ranks
(Imperatores, Reges, Duces, Comites) are "the source of manifold confusion"
(§15 f, note); so the table gives his number, not a rank. "Great pause"
follows §29 i: Sillûq and ʾAthnâḥ, and in Psalms, Proverbs and Job ʿÔlè
weyôrēd; the lesser distinctives "often" make a lesser pause, which the
table does not mark.

Shape:
    {"prose" | "poetic": {"disjunctive" | "conjunctive": [
        {"n": Gesenius' number, "name", "hebrew", "marks": [codepoints],
         "with"?: what else it needs (a paseq after it, the word's last place,
                  another mark), "position"?: "prepositive" | "postpositive",
         "pause"?: "great", "section": "§15 f"}, ...]},
     "systems": {"poetic": [books], "job": ["3:2", "42:6"]}}

The poetic system rules Psalms, Proverbs, and Job 3:2–42:6 (§15 d: the
"books תא״ם"; Job's prose frame keeps the common accents).

Usage: python3 -I scripts/hebrew-bible/accents.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import OUT, dump  # noqa: E402

METEG = "U+05BD"  # Sillûq is a Mèthĕg on the tone-syllable of the verse's last word
PASEQ = "U+05C0"  # the stroke after Legarmēh and Great Šalšèleth (§15 f, note)


def a(n, name, hebrew, marks, section, **kw):
    out = {"n": n, "name": name, "hebrew": hebrew, "marks": marks, "section": section}
    out.update(kw)
    return out


prose_disjunctive = [
    a("1", "Sillûq", "סִלּוּק", [METEG], "§15 f", **{"with": "the last word before sôph pāsûq", "pause": "great"}),
    a("2", "ʾAthnâḥ", "אַתְנָח", ["U+0591"], "§15 f", pause="great"),
    a("3 a", "Segôltā", "סְגוֹלְתָּא", ["U+0592"], "§15 f", position="postpositive"),
    a("3 b", "Šalšèleth (Great)", "שַׁלְשֶׁלֶת", ["U+0593"], "§15 f", **{"with": PASEQ}),
    a("4 a", "Zâqēph gādôl", "זָקֵף גָּדוֹל", ["U+0595"], "§15 f"),
    a("4 b", "Zâqēph qāṭôn", "זָקֵף קָטוֹן", ["U+0594"], "§15 f"),
    a("5", "Ṭiphḥā", "טִפְחָא", ["U+0596"], "§15 f"),
    a("6", "Rebhîaʿ", "רְבִיעַ", ["U+0597"], "§15 f"),
    # The codex writes the prose Zarqā with U+05AE (972 times, as often as the
    # Segôltā it precedes); U+0598 is the poetic books' Ṣinnôrîth.
    a("7", "Zarqā", "זַרְקָא", ["U+05AE"], "§15 f", position="postpositive"),
    a("8 a", "Pašṭā", "פַּשְׁטָא", ["U+0599"], "§15 f", position="postpositive"),
    a("8 b", "Yethîbh", "יְתִיב", ["U+059A"], "§15 f", position="prepositive"),
    a("9", "Tebhîr", "תְּבִיר", ["U+059B"], "§15 f"),
    a("10 a", "Gèreš", "גֶּרֶשׁ", ["U+059C"], "§15 f"),
    a("10 b", "Gerāšáyim", "גְּרָשַׁיִם", ["U+059E"], "§15 f"),
    a("11 a", "Pâzēr", "פָּזֵר", ["U+05A1"], "§15 f"),
    a("11 b", "Pâzēr gādôl (Qarnê phārā)", "קַרְנֵי פָרָה", ["U+059F"], "§15 f"),
    a("12", "Teliša gedôlā", "תְּלִישָׁא גְדוֹלָה", ["U+05A0"], "§15 f", position="prepositive"),
    a("13", "Legarmēh", "לְגַרְמֶהּ", ["U+05A3"], "§15 f", **{"with": PASEQ}),
]
prose_conjunctive = [
    a("14", "Mûnaḥ", "מוּנַח", ["U+05A3"], "§15 g"),
    a("15", "Mehuppākh", "מְהֻפָּךְ", ["U+05A4"], "§15 g"),
    a("16 a", "Mêrekhā", "מֵירְכָא", ["U+05A5"], "§15 g"),
    a("16 b", "Mêrekhā khephûlâ", "מ׳ כְפוּלָה", ["U+05A6"], "§15 g"),
    a("17", "Dargā", "דַּרְגָּא", ["U+05A7"], "§15 g"),
    a("18", "ʾAzlā (Qadmā)", "אַזְלָא", ["U+05A8"], "§15 g"),
    a("19", "Teliša qeṭannā", "תְּלִישָׁא קְטַנָּה", ["U+05A9"], "§15 g", position="postpositive"),
    a("20", "Galgal (Yèraḥ)", "גַּלְגַּל", ["U+05AA"], "§15 g"),
    a("21", "Meʾayyelā", "מְאַיְּלָא", ["U+0596"], "§15 g",
      **{"with": "a word that also bears Sillûq or ʾAthnâḥ, or is joined by maqqēph to one: a variety of Ṭiphḥā marking the secondary tone"}),
]
poetic_disjunctive = [
    a("1", "Sillûq", "סִלּוּק", [METEG], "§15 h", **{"with": "the last word before sôph pāsûq", "pause": "great"}),
    a("2", "ʿÔlè weyôrēd", "עוֹלֶה וְיוֹרֵד", ["U+05AB", "U+05A5"], "§15 h",
      **{"with": "ʿÔlè over the word and Mêrekhā (yôrēd) under it, or on the next word", "pause": "great"}),
    a("3", "ʾAthnâḥ", "אַתְנָח", ["U+0591"], "§15 h", pause="great"),
    a("4", "Rebhîaʿ gādôl", "רְבִיעַ גָּדוֹל", ["U+0597"], "§15 h"),
    a("5", "Rebhîaʿ mugrāš", "רְבִיעַ מֻגְרָשׁ", ["U+0597", "U+059D"], "§15 h", **{"with": "Gèreš on the same word"}),
    a("6", "Šalšèleth (Great)", "שַׁלְשֶׁלֶת", ["U+0593"], "§15 h", **{"with": PASEQ}),
    a("7", "Ṣinnôr (Zarqā)", "צִנּוֹר", ["U+05AE"], "§15 h", position="postpositive"),
    a("8", "Rebhîaʿ qāṭôn", "רְבִיעַ קָטֹן", ["U+0597"], "§15 h", **{"with": "immediately before ʿÔlè weyôrēd"}),
    a("9", "Deḥî", "דְּחִי", ["U+05AD"], "§15 h", position="prepositive"),
    a("10", "Pâzēr", "פָּזֵר", ["U+05A1"], "§15 h"),
    a("11 a", "Mehuppākh legarmēh", "מְהֻפָּךְ לְגַרְמֶהּ", ["U+05A4"], "§15 h", **{"with": PASEQ}),
    a("11 b", "ʾAzlā legarmēh", "אַזְלָא לְגַרְמֶהּ", ["U+05A8"], "§15 h", **{"with": PASEQ}),
]
poetic_conjunctive = [
    a("12", "Mêrekhā", "מֵירְכָא", ["U+05A5"], "§15 i"),
    a("13", "Mûnaḥ", "מוּנַח", ["U+05A3"], "§15 i"),
    a("14", "ʿIllûy (Mûnaḥ superior)", "עִלּוּי", ["U+05AC"], "§15 i"),
    a("15", "Ṭarḥā", "טַרְחָא", ["U+0596"], "§15 i", **{"with": "under the tone-syllable (Deḥî stands under the first consonant)"}),
    a("16", "Galgal (Yèraḥ)", "גַּלְגַּל", ["U+05AA"], "§15 i"),
    a("17", "Mehuppākh", "מְהֻפָּךְ", ["U+05A4"], "§15 i", **{"with": "no paseq after it"}),
    a("18", "ʾAzlā", "אַזְלָא", ["U+05A8"], "§15 i", **{"with": "no paseq after it"}),
    a("19", "Šalšèleth qeṭannā", "שַׁלְשֶׁלֶת קְטַנָּה", ["U+0593"], "§15 i", **{"with": "no paseq after it"}),
    a("20", "Ṣinnôrîth", "צִנּוֹרִית", ["U+0598"], "§15 i",
      **{"with": "over an open syllable before a consonant with Mêrekhā or Mahpākh: not an independent accent"}),
]

data = {
    "source": "Gesenius' Hebrew Grammar, ed. Kautzsch, tr. Cowley (1910), §15 and §29 i",
    "systems": {"poetic": ["psalms", "proverbs", "job"], "job": ["3:2", "42:6"]},
    "prose": {"disjunctive": prose_disjunctive, "conjunctive": prose_conjunctive},
    "poetic": {"disjunctive": poetic_disjunctive, "conjunctive": poetic_conjunctive},
}
dump(OUT / "accents.json", data, pretty=True)
print(OUT / "accents.json")
