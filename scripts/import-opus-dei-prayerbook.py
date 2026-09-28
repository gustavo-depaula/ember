#!/usr/bin/env python3
"""Import the Opus Dei Pocket Prayer Book into the corpus.

Reads research/opus-dei-prayerbook/prayerbook.json (built by
parse-opus-dei-prayerbook.mjs) and catalog.json
(prayer → practice id, plus the hand-written metadata of each new practice), then:

- writes every new practice (manifest.json + flow.json) with all the languages the
  book has;
- adds the book's missing languages to existing single-prayer practices, never
  touching a language already there;
- writes collection/opus-dei-prayerbook, mirroring the book's sections.

Re-runnable: new practices are regenerated, existing ones only ever gain keys.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "opus-dei-prayerbook"
PRACTICES = ROOT / "content" / "practices"
COLLECTION = ROOT / "content" / "collections" / "opus-dei-prayerbook.json"

# The languages the app shows. A block missing one of them would fall back to
# English (then any language) for that reader, so blocks are merged until each
# carries every UI language its prayer has.
UI_LANGS = ("en-US", "pt-BR")
SITE_PATH = {"en-US": "en", "pt-BR": "pt-br"}
SORT_BASE = 400


def load(path: Path):
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def dump(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")


def prayer_key(p: dict) -> str:
    """The id the catalog knows a prayer by: its Latin id, else English, else
    Portuguese, else (a prayer only one other language has) that language's."""
    for lang in ("la", "en-US", "pt-BR", *sorted(p["ids"])):
        if lang in p["ids"]:
            return f"{lang}:{p['ids'][lang]}"
    raise ValueError(p["ids"])


# — Rows → flow sections —

def unwrap(t: str) -> str:
    """Rubrics and subheadings are styled by their block; drop inline emphasis
    marks the page put around the whole line."""
    return re.sub(r"^\*+\s*|\s*\*+$", "", t).strip()


def as_text(kind: str, t: str) -> str:
    if kind == "rubric":
        return f"*{unwrap(t)}*"
    if kind == "subheading":
        return f"**{unwrap(t)}**"
    if kind == "v":
        return f"℣. {t}"
    if kind == "r":
        return f"℟. {t}"
    return t


def langs_of(rows: list[dict]) -> set[str]:
    return {lang for r in rows for lang in r["text"]}


def pivot_text(r: dict) -> str:
    for lang in ("la", "en-US", "pt-BR"):
        if lang in r["text"]:
            return r["text"][lang]
    return next(iter(r["text"].values()))


# Every language's word for it starts "Ant" (Antiphona, Antífona, Antienne, Antifon…).
# \S, not a letter class: a combining accent (Hungarian "Antifóna") isn't a letter.
ANTIPHON_LABEL = re.compile(r"^\*?Ant\S{0,10}?[.:]\*?\s*", re.I)
NUMBERED = re.compile(r"^\d+\.\s")
PSALM_TITLE = re.compile(r"^\*?(Psalm|Psalmus|Salmo|Ps\.)\s*\d", re.I)


def row_block_kind(r: dict, prev: str | None, in_psalm: bool) -> str:
    if r["kind"] in ("v", "r"):
        return "response"
    if r["kind"] != "text":
        return r["kind"]
    t = pivot_text(r)
    if ANTIPHON_LABEL.match(t):
        return "antiphon"
    # Psalm verses — numbered, under a "Psalm N" heading, or the whole of a
    # prayer titled as a psalm — and the Glory Be that closes them are set line
    # by line like the breviary's, not as paragraphs.
    if in_psalm or NUMBERED.match(t) or (prev == "psalm" and len(t) < 160):
        return "psalm"
    return "prayer"


def split_kyrie(rows: list[dict]) -> list[dict]:
    """The book answers "Kyrie, eleison" with "Christe, eleison. Kyrie, eleison."
    as one response; the prayer is ℣ Kyrie, ℟ Christe, ℣ Kyrie."""
    out: list[dict] = []
    for r in rows:
        if r["kind"] == "r" and re.match(r"^Christe, e.?l.?éison\. K", pivot_text(r)):
            # Some languages join the halves with a comma or semicolon ("Cristo, ten
            # piedad, Señor, ten piedad."): cut where the second invocation's
            # capital begins.
            parts = {lang: re.split(r"(?<=[.!;,])\s*(?=[A-ZÀ-ÝČŠŽ])", t.strip(), maxsplit=1) for lang, t in r["text"].items()}
            if all(len(v) == 2 for v in parts.values()):
                first = {lang: re.sub(r"[,;]$", ".", v[0].strip()) for lang, v in parts.items()}
                out.append({"kind": "r", "text": first})
                out.append({"kind": "v", "text": {lang: v[1] for lang, v in parts.items()}})
                continue
        out.append(r)
    return out


STRUCTURED = ("response", "psalm", "antiphon")


def complete(block: dict, required: tuple[str, ...]) -> bool:
    rows = block["rows"]
    if block["kind"] in STRUCTURED:
        # Rendered row by row, so every row needs every UI language.
        return all(all(lang in r["text"] for lang in required) for r in rows)
    return all(lang in langs_of(rows) for lang in required)


def to_prayer(block: dict) -> dict:
    return {"kind": "prayer", "rows": block["rows"]}


def build_blocks(rows: list[dict], required: tuple[str, ...], psalm: bool = False) -> list[dict]:
    blocks: list[dict] = []
    in_psalm = psalm
    for r in split_kyrie(rows):
        if r["kind"] == "subheading":
            in_psalm = bool(PSALM_TITLE.match(pivot_text(r)))
        elif r["kind"] != "text":
            in_psalm = False
        k = row_block_kind(r, blocks[-1]["kind"] if blocks else None, in_psalm)
        if blocks and blocks[-1]["kind"] == k and k in ("prayer", "response", "psalm"):
            blocks[-1]["rows"].append(r)
        else:
            blocks.append({"kind": k, "rows": [r]})

    blocks = [b if b["kind"] not in STRUCTURED or complete(b, required) else to_prayer(b) for b in blocks]

    def merge_runs(bs: list[dict]) -> list[dict]:
        out: list[dict] = []
        for b in bs:
            if out and out[-1]["kind"] == "prayer" and b["kind"] == "prayer":
                out[-1] = {"kind": "prayer", "rows": out[-1]["rows"] + b["rows"]}
            else:
                out.append(b)
        return out

    blocks = merge_runs(blocks)
    # A prayer block still missing a UI language swallows its neighbours until it
    # has them all (in the limit, the whole prayer becomes one block).
    while len(blocks) > 1:
        bad = next((i for i, b in enumerate(blocks) if not complete(b, required)), None)
        if bad is None:
            break
        j = bad - 1 if bad > 0 else bad + 1
        lo, hi = min(bad, j), max(bad, j)
        merged = {"kind": "prayer", "rows": to_prayer(blocks[lo])["rows"] + to_prayer(blocks[hi])["rows"]}
        blocks = merge_runs(blocks[:lo] + [merged] + blocks[hi + 1 :])
    return blocks


def kind_in(r: dict, lang: str) -> str:
    return r.get("kinds", {}).get(lang, r["kind"])


def plain(t: str) -> str:
    """℣/℟ and antiphon lines render without inline Markdown; the book's italics
    (the priest-only Dominus vobiscum) would show as asterisks."""
    return re.sub(r"\*+([^*]+?)\*+", r"\1", t).strip()


def by_lang(r: dict, fn=lambda t: t) -> dict:
    return {lang: fn(t) for lang, t in sorted(r["text"].items())}


def emit(block: dict) -> dict:
    rows = block["rows"]
    kind = block["kind"]
    if kind == "prayer":
        inline: dict[str, str] = {}
        for lang in sorted(langs_of(rows)):
            inline[lang] = "\n\n".join(as_text(kind_in(r, lang), r["text"][lang]) for r in rows if lang in r["text"])
        return {"type": "prayer", "inline": inline}
    if kind == "response":
        verses: list[dict] = []
        for r in rows:
            if r["kind"] == "r" and verses and set(verses[-1]) == {"v"}:
                verses[-1]["r"] = by_lang(r, plain)
            else:
                verses.append({r["kind"]: by_lang(r, plain)})
        return {"type": "response", "verses": verses}
    if kind == "psalm":
        return {"type": "psalm", "verses": [{"text": by_lang(r)} for r in rows]}
    if kind == "antiphon":
        return {"type": "antiphon", "text": by_lang(rows[0], lambda t: plain(ANTIPHON_LABEL.sub("", t)))}
    return {"type": kind, "text": {lang: unwrap(t) for lang, t in sorted(rows[0]["text"].items())}}


def ui_langs(p: dict) -> tuple[str, ...]:
    have = langs_of(p["rows"])
    return tuple(lang for lang in UI_LANGS if lang in have)


SHOWN = (*UI_LANGS, "la")
STRUCTURAL = {"v", "r", "subheading"}


def pairing_is_a_guess(p: dict) -> bool:
    """Row pairing across the shown languages can't be trusted when a language was
    matched to the pivot by content (the parser's `realigned`), or when the site's
    grid lines up rows of different shape — a heading beside a paragraph, a versicle
    beside prose — which happens where two languages carry different compositions
    under one title (the Portuguese Way of the Cross)."""
    if any(lang in SHOWN for lang in p.get("realigned", [])):
        return True
    for r in p["rows"]:
        shown = [lang for lang in r["text"] if lang in SHOWN]
        kinds = {kind_in(r, lang) for lang in shown}
        if len(kinds) < 2 or not kinds & STRUCTURAL:
            continue
        if kinds & {"v", "r"}:
            return True
        # A heading one language merely didn't centre is still a heading; a
        # paragraph beside a heading is a different text.
        if any(kind_in(r, lang) == "text" and len(r["text"][lang]) > 80 for lang in shown):
            return True
    return False


def sections_for(p: dict) -> list[dict]:
    # Where the pairing is a guess, each language keeps its own sequence in a single
    # block rather than being cut at boundaries that belong to another language.
    if pairing_is_a_guess(p):
        return [emit({"kind": "prayer", "rows": split_kyrie(p["rows"])})]
    psalm = any(PSALM_TITLE.match(t) for t in p["title"].values())
    return [emit(b) for b in build_blocks(p["rows"], ui_langs(p), psalm)]


# — Clean-up —

def tidy(t: str) -> str:
    # "1.Why" → "1. Why", as the other languages print it.
    t = re.sub(r"(?m)^(\d+)\.(?=[^\s\d.])", r"\1. ", t)
    # A red label glued to its text: "Antífona.Seu reinado", "rispondono:Santo".
    t = re.sub(r"(?<=[^\W\d_]{3})([.:!])(?=[^\W\d_]{2})", r"\1 ", t)
    # A psalm's mediant asterisk (Danish, Swedish) would open an italic span in
    # the app's inline Markdown; the asterisk operator looks the same.
    return t.replace(" * ", " \u2217 ")


def tidy_sections(sections: list[dict]) -> None:
    for s in sections:
        for texts in texts_of(s):
            for lang, t in texts.items():
                texts[lang] = tidy(t)


# — Portuguese where the book has none —

def pt_pt_to_br(t: str) -> str:
    """The Portugal edition's text in Brazilian spelling. Only for prayers the
    Brazilian edition leaves out; the wording stays the book's."""
    for a, b in (("Avé", "Ave"), ("Ámen", "Amém"), ("trespass", "transpass"), ("«", "“"), ("»", "”"),
                 ("todos los ", "todos os "), ("N.e N.", "N. e N.")):
        t = t.replace(a, b)
    return t


def texts_of(section: dict) -> list[dict]:
    """Every per-language text dict in a section, in reading order."""
    if section["type"] == "response":
        return [verse[k] for verse in section["verses"] for k in ("v", "r") if k in verse]
    if section["type"] == "psalm":
        return [verse["text"] for verse in section["verses"]]
    return [section.get("inline") or section["text"]]


def fill_pt_br(sections: list[dict], translation: list[str] | None) -> None:
    """A translation in catalog.json (one string per section) comes first; the
    Portugal edition's Portuguese stands in for the rest."""
    assert not translation or len(translation) == len(sections), "catalog translation: one string per section"
    for i, s in enumerate(sections):
        for t in texts_of(s):
            if translation and translation[i]:
                t["pt-BR"] = translation[i]
            elif "pt-BR" not in t and "pt-PT" in t:
                t["pt-BR"] = pt_pt_to_br(t["pt-PT"])
            ordered = dict(sorted(t.items()))
            t.clear()
            t.update(ordered)


# — Easter-time alleluias —

# "(T. P. Allelúia)" and its translations: the book's note that Easter adds an
# alleluia. The app knows the season, so the note becomes the thing it describes.
EASTER_NOTE = re.compile(
    r"\s*\((?:T\. ?P\.|Easter Time\.|Tempo pasquale|V\. ?V\.|V\. ?Č\.|H\.i\.|Påsktiden[.:]|I påsketiden:)"
    r"\s*([^()]+?)\.?\)(\.?)"
)


def with_alleluia(t: str) -> str:
    def sub(m: re.Match) -> str:
        before = t[: m.start()].rstrip()
        word = m.group(1).strip()
        if not before:
            return f"{word[0].upper()}{word[1:]}."
        if before[-1] in ".!?":
            return f" {word[0].upper()}{word[1:]}."
        return f", {word[0].lower()}{word[1:]}."

    return EASTER_NOTE.sub(sub, t)


def without_alleluia(t: str) -> str:
    def sub(m: re.Match) -> str:
        before = t[: m.start()].rstrip()
        return "" if not before or before[-1] in ".!?" else "."

    return re.sub(r"\n{3,}", "\n\n", EASTER_NOTE.sub(sub, t)).strip()


def rehome_easter_notes(sections: list[dict]) -> None:
    """A language whose page ran one row ahead puts its Easter note where the
    others have the next heading (the French Athanasian Creed); give the note back
    to the prayer it ends."""
    for i, s in enumerate(sections[1:], 1):
        prev = sections[i - 1]
        if s["type"] != "subheading" or prev["type"] not in ("prayer", "antiphon"):
            continue
        last = texts_of(prev)[-1]
        for lang, t in list(s["text"].items()):
            if EASTER_NOTE.fullmatch(" " + t) and lang in last:
                last[lang] += " " + t
                del s["text"][lang]


# — Vexilla Regis: Good Friday or the Exaltation of the Cross —

# The book prints the Passiontide stanza with the feast's words as a note after
# it ("die 14 septembris: / in hac triumphi gloria"); English prints both stanzas
# whole. Each becomes the stanza the day calls for.
FEAST_NOTE = re.compile(r"^\*?[^\n\d]{0,30}\b14\b[^\n\d]{0,20}:\*?\n[^\n]+$")


def split_feast(t: str) -> tuple[str, str, str, str] | None:
    """(before, Passion stanza, feast stanza, after), or None where a language
    has no variant."""
    paras = t.split("\n\n")
    if any(p.startswith("On Good Friday:") for p in paras):
        i = next(i for i, p in enumerate(paras) if p.startswith("On the Feast of the Triumph"))
        strip = lambda p: p.split(": ", 1)[1]
        return "\n\n".join(paras[:i]), strip(paras[i + 1]), strip(paras[i]), "\n\n".join(paras[i + 2 :])
    i = next((i for i, p in enumerate(paras) if i and FEAST_NOTE.match(p)), None)
    if i is None:
        return None
    head, tail = paras[i - 1], paras[i + 1]
    feast = paras[i].split("\n", 1)[1].strip()
    cut = max(head.rfind("!"), head.rfind("\n"))
    cut = cut if cut >= 0 else head.rfind(",")
    phrase = head[cut + 1 :].strip()
    if phrase.startswith("*"):
        feast = f"*{feast}*"
    if phrase.lstrip("*")[:1].isupper():
        k = 1 if feast.startswith("*") else 0
        feast = feast[:k] + feast[k].upper() + feast[k + 1 :]
    sep = head[cut] if head[cut] == "\n" else head[cut] + " "
    return (
        "\n\n".join(paras[: i - 1]),
        f"{head}\n{tail}",
        f"{head[:cut]}{sep}{feast}\n{tail}",
        "\n\n".join(paras[i + 2 :]),
    )


def feast_select(sections: list[dict]) -> list[dict]:
    out: list[dict] = []
    for s in sections:
        splits = {lang: split_feast(t) for lang, t in s.get("inline", {}).items()} if s["type"] == "prayer" else {}
        if not any(splits.values()):
            out.append(s)
            continue
        part = lambda n: {lang: (sp[n] if sp else (s["inline"][lang] if n == 0 else "")) for lang, sp in splits.items()}
        prayer = lambda texts: {"type": "prayer", "inline": {k: v for k, v in texts.items() if v}}
        out.append(prayer(part(0)))
        out.append(
            {
                "type": "select",
                "on": "dateKey",
                "map": {"09-14": "triumph"},
                "default": "passion",
                "options": [
                    {"id": "passion", "label": {"en-US": "Passiontide", "pt-BR": "Tempo da Paixão"}, "sections": [prayer(part(1))]},
                    {
                        "id": "triumph",
                        "label": {"en-US": "Exaltation of the Holy Cross", "pt-BR": "Exaltação da Santa Cruz"},
                        "sections": [prayer(part(2))],
                    },
                ],
            }
        )
        out.append(prayer(part(3)))
    return out


def easter_select(section: dict) -> dict:
    if section["type"] == "select" or not any(
        EASTER_NOTE.search(t) for texts in texts_of(section) for t in texts.values()
    ):
        return section

    def variant(fn) -> list[dict]:
        copy = json.loads(json.dumps(section))
        for texts in texts_of(copy):
            texts.update({lang: fn(t) for lang, t in texts.items()})
        return [copy]

    return {
        "type": "select",
        "on": "liturgicalSeason",
        "map": {"easter": "easter"},
        "default": "year",
        "options": [
            {"id": "easter", "label": {"en-US": "Easter Time", "pt-BR": "Tempo pascal"}, "sections": variant(with_alleluia)},
            {"id": "year", "label": {"en-US": "Outside Easter Time", "pt-BR": "Fora do Tempo pascal"}, "sections": variant(without_alleluia)},
        ],
    }


# — Practices —

def source_note(section: dict) -> dict:
    ids = section["ids"]
    out = {}
    for lang, label in (("en-US", "*Pocket Prayer Book*"), ("pt-BR", "*Devocionário*")):
        sid = ids.get(lang)
        if sid is None:
            continue
        url = f"https://opusdei.org/{SITE_PATH[lang]}/prayers/section/?section1={sid}&section2="
        out[lang] = f"Opus Dei, {label} — [opusdei.org]({url})"
    return out


def titles(p: dict) -> dict:
    return dict(sorted(p["title"].items()))


def new_practice(pid: str, meta: dict, members: list[tuple[dict, dict]], order: int) -> tuple[dict, dict]:
    section, first = members[0]
    card = meta.get("card")
    name = titles(first) if len(members) == 1 else {}
    name.update(meta.get("name", {}))
    if card:
        name.update(card)
    description = meta.get("description") or {
        "en-US": f"A prayer card for the private devotion of {card['en-US']}, asking a favour through their intercession.",
        "pt-BR": f"Estampa para a devoção particular de {card['pt-BR']}, para pedir um favor pela sua intercessão.",
    }
    manifest = {
        "id": pid,
        "form": "prayer",
        "icon": meta.get("icon", "prayer"),
        "name": dict(sorted(name.items())),
        "categories": meta.get("categories", ["saints", "devotion"]),
        "estimatedMinutes": meta.get("estimatedMinutes", 2),
        "description": description,
        **({"history": meta["history"]} if "history" in meta else {}),
        "source": source_note(section),
        "flowMode": "scroll",
        "completion": "flow-end",
        "tags": meta.get("tags", ["opus-dei", "prayer-card", "intercession"]),
        "defaults": {
            "sortOrder": SORT_BASE + order,
            "slots": [{"schedule": {"type": "daily"}, "tier": "extra", "enabled": False}],
        },
        "flow": "flow.json",
    }
    if len(members) == 1:
        flow = {"sections": sections_for(first)}
    else:
        flow = {"sections": []}
        for _, p in members:
            flow["sections"].append({"type": "subheading", "text": titles(p)})
            flow["sections"].extend(sections_for(p))
    tidy_sections(flow["sections"])
    fill_pt_br(flow["sections"], meta.get("translation", {}).get("pt-BR"))
    rehome_easter_notes(flow["sections"])
    flow["sections"] = feast_select([easter_select(s) for s in flow["sections"]])
    return manifest, flow


def read_flow(d: Path, manifest: dict) -> tuple[dict, bool]:
    if isinstance(manifest.get("flow"), dict):
        return manifest["flow"], True
    return load(d / "flow.json"), False


def patch_existing(pid: str, members: list[tuple[dict, dict]]) -> str:
    d = PRACTICES / pid
    manifest = load(d / "manifest.json")
    if len(members) != 1:
        return "skip: several book prayers"
    _, p = members[0]
    flow, inline_flow = read_flow(d, manifest)
    secs = flow.get("sections", [])
    if not (len(secs) == 1 and secs[0].get("type") in ("prayer", "hymn") and isinstance(secs[0].get("inline"), dict)):
        return "skip: structured flow"
    if any(r["kind"] != "text" for r in p["rows"]):
        return "skip: book prayer has versicles, rubrics or headings"
    inline = secs[0]["inline"]
    added = []
    for lang in sorted(langs_of(p["rows"])):
        if lang in inline:
            continue
        inline[lang] = tidy("\n\n".join(r["text"][lang] for r in p["rows"] if lang in r["text"]))
        added.append(lang)
    names = manifest.setdefault("name", {})
    for lang, t in titles(p).items():
        if lang not in names and lang not in UI_LANGS and lang != "la":
            names[lang] = t
    if not added:
        return "unchanged"
    if inline_flow:
        manifest["flow"] = flow
    else:
        dump(d / "flow.json", flow)
    dump(d / "manifest.json", manifest)
    return "added " + " ".join(added)


# — Collection —

def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def collection(book: dict, catalog: dict) -> dict:
    sections = []
    for s in book["sections"]:
        refs: list[str] = []
        for p in s["prayers"]:
            pid = catalog["prayers"].get(prayer_key(p))
            if pid and pid not in refs:
                refs.append(pid)
        if not refs:
            continue
        sections.append(
            {
                "id": slug(s["title"]["en-US"]),
                "title": {lang: s["title"][lang] for lang in UI_LANGS if lang in s["title"]},
                "blocks": [{"kind": "item", "ref": f"practice/{pid}"} for pid in refs],
            }
        )
    return {
        "id": "collection/opus-dei-prayerbook",
        "version": "1.0.0",
        "cover": "boxed",
        "name": {"en-US": "Pocket Prayer Book", "pt-BR": "Devocionário"},
        "description": {
            "en-US": "Opus Dei's book of prayers, in the order of the book: the common prayers, the Blessed Trinity, the Eucharist, the Holy Spirit and Our Lady, the preparation for Mass and the thanksgiving after it, hymns, prayers for the dead, the formulas of Catholic doctrine, and the prayer cards of the saints and servants of God of the Work.",
            "pt-BR": "O livro de orações do Opus Dei, na ordem do livro: as orações comuns, a Santíssima Trindade, a Eucaristia, o Espírito Santo e Nossa Senhora, a preparação para a Missa e a ação de graças depois dela, hinos, orações pelos defuntos, as fórmulas da doutrina católica e as estampas dos santos e servos de Deus da Obra.",
        },
        "icon": "book",
        "languages": list(UI_LANGS),
        "tags": ["opus-dei", "prayer-book", "josemaria", "latin"],
        "defaults": {"autoSeed": False},
        "sections": sections,
    }


def main() -> None:
    book = load(RESEARCH / "prayerbook.json")
    catalog = load(RESEARCH / "catalog.json")

    by_practice: dict[str, list[tuple[dict, dict]]] = {}
    for s in book["sections"]:
        for p in s["prayers"]:
            pid = catalog["prayers"].get(prayer_key(p))
            if pid:
                by_practice.setdefault(pid, []).append((s, p))

    unmapped = [
        (prayer_key(p), p["title"].get("en-US") or next(iter(p["title"].values())))
        for s in book["sections"]
        for p in s["prayers"]
        if prayer_key(p) not in catalog["prayers"] and set(ui_langs(p)) | ({"la"} & set(p["ids"]))
    ]
    if unmapped:
        raise SystemExit(f"prayers with a UI language or Latin but no practice: {unmapped}")

    order = 0
    for pid, members in by_practice.items():
        meta = catalog["practices"].get(pid)
        exists = (PRACTICES / pid / "manifest.json").is_file()
        if meta is None:
            if not exists:
                raise SystemExit(f"{pid}: not in the corpus and no metadata in catalog.json")
            print(f"  {pid:48} {patch_existing(pid, members)}")
            continue
        manifest, flow = new_practice(pid, meta, members, order)
        order += 1
        dump(PRACTICES / pid / "manifest.json", manifest)
        dump(PRACTICES / pid / "flow.json", flow)
        print(f"  {pid:48} {'regenerated' if exists else 'new'} ({len(flow['sections'])} blocks)")

    dump(COLLECTION, collection(book, catalog))
    print(f"  {COLLECTION.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
