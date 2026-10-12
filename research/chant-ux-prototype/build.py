"""Builds index.html: five ways a sung text could show its chant, on real corpus data.

Run from the repo root, after engrave.ts has written scores.json:
  (cd apps/app && ../../node_modules/.bin/tsx ../../research/chant-ux-prototype/engrave.ts)
  python3 research/chant-ux-prototype/build.py
"""

import base64, json, os, re

here = os.path.dirname(os.path.abspath(__file__))
scores = json.load(open(os.path.join(here, "scores.json"), encoding="utf-8"))
roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"]


def section(lang, name):
    text = open(f"content/do/web/www/missa/{lang}/Tempora/Adv1-0.txt", encoding="utf-8").read()
    body = re.search(rf"^\[{name}\]\n(.*?)(?=^\[|\Z)", text, re.S | re.M).group(1)
    return [line for line in body.strip().split("\n") if line]


def proper(name, take):
    """The lines of a proper as the page shows them: its citation, then its text."""
    out = {}
    for lang, key in (("Portugues", "pt"), ("Latin", "la")):
        lines = section(lang, name)[take]
        out[key + "Cite"] = next((l[1:] for l in lines if l.startswith("!")), "")
        out[key] = [re.sub(r"^V\. ", "℣. ", re.sub(r"^v\. ", "", l)) for l in lines if l[0] not in "!&$"]
    return out


def sung(key, label, text):
    head = scores[key]["headers"]
    return {
        "sung": True,
        "label": label,
        "name": head["name"],
        "mode": roman[int(head["mode"][0])],
        "book": head["book"],
        "svg": scores[key]["svg"],
        **text,
    }


mass = {
    "title": "Santa Missa",
    "caption": "domingo, 29 de novembro",
    "kicker": "Missa",
    "blocks": [
        sung("introit", "Intróito", proper("Introitus", slice(0, 4))),
        {"label": "Oração", "pt": [l for l in section("Portugues", "Oratio") if l[0] != "$"]},
        sung("gradual", "Gradual", proper("Graduale", slice(0, 3))),
        sung("alleluia", "Aleluia", proper("Graduale", slice(3, 5))),
    ],
}
# The gradual's verse runs into the Alleluia in the Missal's line; the chant books part them.
for block in mass["blocks"]:
    if block["label"] == "Gradual":
        block["pt"] = [re.sub(r" Aleluia, aleluia\.$", "", l) for l in block["pt"]]
        block["la"] = [re.sub(r" Allelúja, allelúja\.$", "", l) for l in block["la"]]
    if block["label"] == "Aleluia":
        block["pt"] = ["Aleluia, aleluia. " + re.sub(r"^℣\. ", "", block["pt"][0])]
        block["la"] = ["Allelúja, allelúja. " + re.sub(r"^℣\. ", "", block["la"][0])]

verum = json.load(open("content/practices/ave-verum/flow.json", encoding="utf-8"))["sections"][0]["inline"]
prayer = {
    "title": "Ave verum",
    "caption": "segunda-feira, 12 de outubro",
    "kicker": "Oração",
    "blocks": [
        sung(
            "aveVerum",
            "",
            {"pt": verum["pt-BR"].split("\n\n"), "la": verum["la"].split("\n\n"), "ptCite": "", "laCite": ""},
        )
    ],
}


def font(name):
    data = open(f"apps/site/src/fonts/{name}.woff2", "rb").read()
    return "data:font/woff2;base64," + base64.b64encode(data).decode()


faces = "".join(
    f"@font-face{{font-family:'{family}';font-weight:{weight};font-style:{style};src:url({font(name)}) format('woff2')}}"
    for family, weight, style, name in (
        ("EB Garamond", 400, "normal", "EBGaramond-400Regular"),
        ("EB Garamond", 400, "italic", "EBGaramond-400Regular_Italic"),
        ("EB Garamond", 700, "normal", "EBGaramond-700Bold"),
        ("Junicode", 400, "normal", "Junicode"),
        ("Junicode", 400, "italic", "Junicode-Italic"),
        ("Cinzel", 400, "normal", "Cinzel-400Regular"),
        ("Cinzel", 600, "normal", "Cinzel-600SemiBold"),
    )
)


def write(template, name, data):
    html = open(os.path.join(here, template), encoding="utf-8").read()
    html = html.replace("/*FONTS*/", faces).replace("/*DATA*/", json.dumps(data, ensure_ascii=False))
    open(os.path.join(here, name), "w", encoding="utf-8").write(html)
    print(name, len(html) // 1024, "KB")


write("template.html", "index.html", {"mass": mass, "prayer": prayer})


# The direction chosen from those five: the mark by the title (D) turns the block to its score (B).
def piece(key, part):
    head = scores[key]["headers"]
    note = "Tom " + head["tone"] if "tone" in head else "Modo " + roman[int(head["mode"][0])]
    return {"part": part, "name": head["name"], "note": note, "book": head.get("book", ""), "svg": scores[key]["svg"]}


def paras(lines):
    return "".join(f"<p>{line}</p>" for line in lines)


def turning(block, pieces):
    cite = f'<div class="cite">{block["ptCite"]}</div>' if block.get("ptCite") else ""
    return {"label": block["label"], "html": cite + paras(block["pt"]), "gloss": paras(block["pt"]), "pieces": pieces}


def psalm(number, line):
    """A psalm of Sunday Vespers under its antiphon, as the hour sets it."""
    horas = "content/do/web/www/horas/Portugues/Psalterium/"
    day = open(horas + "Psalmi/Psalmi major.txt", encoding="utf-8").read().split("[Day0 Vespera]\n")[1].split("\n")
    antiphon = day[line].split(";;")[0]
    verses = [l.split(" ", 1) for l in open(horas + f"Psalmorum/Psalm{number}.txt", encoding="utf-8").read().split("\n") if "*" in l]
    prayers = open(horas + "Common/Prayers.txt", encoding="utf-8").read()
    gloria = re.search(r"^\[Gloria\]\n(.*?)\n\n", prayers, re.S | re.M).group(1).split("\n")
    ant = f'<p><span class="r">Ant.</span> {antiphon}</p>'
    body = "".join(f'<p class="v"><sup>{n.split(":")[1]}</sup> {text}</p>' for n, text in verses)
    body += "".join(f'<p class="v">{re.sub(r"^([VR])\. ", "", l)}</p>' for l in gloria)
    return {
        "label": f"Salmo {number}",
        "html": ant + body + ant.replace(" * ", " "),
        "gloss": ant,
        "pieces": [piece(f"ant{number}", "Antífona"), piece(f"psalm{number}", "")],
    }


blocks = mass["blocks"]
write(
    "template-mark.html",
    "mark.html",
    [
        {
            "scene": "Missa",
            "title": "Santa Missa",
            "caption": "domingo, 29 de novembro",
            "note": "A marca fica na linha do título. O título não sai do lugar; o que vira é o corpo.",
            "blocks": [
                turning(blocks[0], [piece("introit", "")]),
                {"label": "Oração", "html": paras(blocks[1]["pt"])},
                turning(
                    {"label": "Gradual", "ptCite": blocks[2]["ptCite"], "pt": blocks[2]["pt"] + blocks[3]["pt"]},
                    [piece("gradual", "Gradual"), piece("alleluia", "Aleluia")],
                ),
            ],
        },
        {
            "scene": "Oração",
            "title": "Ave verum",
            "caption": "segunda-feira, 12 de outubro",
            "note": "Uma oração solta não tem título de seção: a marca ganha uma linha só dela, à direita, sobre o texto.",
            "blocks": [turning({"label": "", "pt": prayer["blocks"][0]["pt"]}, [piece("aveVerum", "")])],
        },
        {
            "scene": "Vésperas",
            "title": "Vésperas",
            "caption": "domingo, 29 de novembro",
            "note": "Num salmo, a face cantada traz a antífona e, logo abaixo, o salmo apontado no tom que ela pede.",
            "blocks": [psalm(109, 0), psalm(110, 1)],
        },
    ],
)
