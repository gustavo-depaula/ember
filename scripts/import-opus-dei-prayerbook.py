#!/usr/bin/env python3
"""Import the Opus Dei Pocket Prayer Book into the corpus.

Reads research/opus-dei-prayerbook/prayerbook.json (built by
scrape-opus-dei-prayerbook.mjs + parse-opus-dei-prayerbook.mjs) and catalog.json
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


def block_kind(row_kind: str) -> str:
    return {"text": "prayer", "v": "response", "r": "response"}.get(row_kind, row_kind)


def langs_of(rows: list[dict]) -> set[str]:
    return {lang for r in rows for lang in r["text"]}


def complete(block: dict, required: tuple[str, ...]) -> bool:
    rows = block["rows"]
    if block["kind"] == "prayer":
        return all(lang in langs_of(rows) for lang in required)
    # Structured blocks render row by row, so every row needs every UI language.
    if not all(all(lang in r["text"] for lang in required) for r in rows):
        return False
    if block["kind"] == "response":
        kinds = [r["kind"] for r in rows]
        return len(kinds) % 2 == 0 and kinds == ["v", "r"] * (len(kinds) // 2)
    return True


def to_prayer(block: dict) -> dict:
    return {"kind": "prayer", "rows": block["rows"]}


def build_blocks(rows: list[dict], required: tuple[str, ...]) -> list[dict]:
    blocks: list[dict] = []
    for r in rows:
        k = block_kind(r["kind"])
        if blocks and blocks[-1]["kind"] == k and k in ("prayer", "response"):
            blocks[-1]["rows"].append(r)
        else:
            blocks.append({"kind": k, "rows": [r]})

    blocks = [b if complete(b, required) or b["kind"] == "prayer" else to_prayer(b) for b in blocks]

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


def emit(block: dict) -> dict:
    rows = block["rows"]
    kind = block["kind"]
    if kind == "prayer":
        inline: dict[str, str] = {}
        for lang in sorted(langs_of(rows)):
            inline[lang] = "\n\n".join(as_text(kind_in(r, lang), r["text"][lang]) for r in rows if lang in r["text"])
        return {"type": "prayer", "inline": inline}
    if kind == "response":
        verses = []
        for v, r in zip(rows[0::2], rows[1::2]):
            verses.append({"v": dict(sorted(v["text"].items())), "r": dict(sorted(r["text"].items()))})
        return {"type": "response", "verses": verses}
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
        return [emit({"kind": "prayer", "rows": p["rows"]})]
    return [emit(b) for b in build_blocks(p["rows"], ui_langs(p))]


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
        inline[lang] = "\n\n".join(r["text"][lang] for r in p["rows"] if lang in r["text"])
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
