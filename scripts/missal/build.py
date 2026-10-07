#!/usr/bin/env python3
"""Build `content/missal/` from the extracted upstream missal.

    python3 scripts/missal/extract.py      # upstream HTML -> neutral JSON
    node scripts/missal/sanctoral.mjs > research/missale-romanum/consult/sanctoral.json
    python3 scripts/missal/build.py        # neutral JSON -> content/missal

Everything written is derived; hand corrections go in `patches.py`, never in
the output.
"""

import copy
import json
import re
import shutil
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import convert  # noqa: E402
import ids  # noqa: E402
import patches  # noqa: E402

root = Path(__file__).parent.parent.parent
consult = root / "research" / "missale-romanum" / "consult"
neutral = consult / "out"
target = root / "content" / "missal"

driverLangs = ["la", "en-US", "pt-BR"]
months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

# Region named by the prefix upstream puts on a national proper's label.
regionPrefixes = {
    "Africa": ["africa"],
    "América": ["latin-america"],
    "Argentina": ["argentina"],
    "<br>Argentina": ["argentina"],
    "Argentina y Uruguay": ["argentina", "uruguay"],
    "Argentina...": ["argentina", "paraguay", "uruguay"],
    "Bolivia": ["bolivia"],
    "Brasil": ["brazil"],
    "Chile": ["chile"],
    "Chile y Argentina": ["chile", "argentina"],
    "En France ": ["france"],
    "España": ["spain"],
    "In Nigeria": ["nigeria"],
    "In deutscher Sprache": ["german-speaking"],
    "Nigeria": ["nigeria"],
    "Opus Dei": ["opus-dei"],
    "Paraguay": ["paraguay"],
    "United States": ["united-states"],
    "Uruguay": ["uruguay"],
    "Uruguay,...": ["uruguay", "argentina"],
}
# A proper gated on a language but not labelled with a country.
regionByLang = {
    "germ": ["german-speaking"],
    "cast": ["spain"],
    "engl": ["united-states"],
    "fran": ["france"],
    "port": ["brazil"],
    "ital": ["italy"],
}

report = {"unmapped": [], "collisions": [], "unresolvedRefs": [], "notes": []}


def load(section):
    for path in sorted((neutral / section).glob("*.json")):
        yield path.stem, json.loads(path.read_text(encoding="utf-8"))


def dia_blocks(nodes):
    """Every `div.dia`, at any depth, in document order."""
    for node in nodes:
        if not isinstance(node, dict) or "tag" not in node:
            continue
        if "dia" in node.get("class", []) and node.get("attrs", {}).get("id"):
            yield node
        yield from dia_blocks(node.get("children", []))


def heading(doc, lang, part):
    """The first heading of a document in one language: its lines."""
    for item in doc["items"]:
        if part and item.get("part") != part:
            continue
        for block in item.get("text", {}).get(lang, []):
            if block["k"] in ("h1", "h2"):
                return ["".join(convert.seg_text(s) for s in line).strip() for line in block["lines"]]
    return None


def title_of(doc, part, dated):
    """Display name per language. A saint's heading opens with the date line."""
    title = {}
    # Regional propers exist in one language only, inline in the skeleton ("*").
    for lang in [*convert.langCodes.values(), "*"]:
        lines = heading(doc, lang, part) or heading(doc, lang, None)
        if not lines:
            continue
        if dated and len(lines) > 1 and re.search(r"\d", lines[0]):
            lines = lines[1:]
        title[lang] = " — ".join(line for line in lines if line)
    return title


def rank_label(doc):
    label = {}
    for item in doc["items"]:
        if item.get("part") != "title":
            continue
        for lang, blocks in item.get("text", {}).items():
            for block in blocks:
                if block["k"] == "h3" and lang != "*":
                    label[lang] = convert.plain([block])
                    break
        break
    return label


# --- ids ---------------------------------------------------------------------


def sanctoral_regions(rows, blocks):
    """(file, anchor) -> [{month, day, regions}] from upstream's saints switch."""
    by_date = defaultdict(lambda: {"langs": set(), "label": ""})
    for row in rows:
        m = re.fullmatch(r"santos/santos_(\w+)\.html#(\w+)", row["link"])
        file, anchor = m.group(1), m.group(2)
        if (file, anchor) not in blocks and anchor[:2].isdigit() and 1 <= int(anchor[:2]) <= 12:
            # Upstream links a few saints into the wrong month's file; the
            # anchor's own month is where the text is.
            by_anchor = (months[int(anchor[:2]) - 1], anchor)
            if by_anchor in blocks:
                report["notes"].append(f"link to {file}#{anchor} repaired to {by_anchor[0]}")
                file = by_anchor[0]
        key = (file, anchor, row["month"], row["day"])
        by_date[key]["langs"].add(row["lang"])
        by_date[key]["label"] = row["label"] or by_date[key]["label"]
    table = defaultdict(list)
    for (file, anchor, month, day), seen in sorted(by_date.items()):
        prefix = re.match(r"^((?:<br>)?[^:<]{2,40}):", seen["label"])
        if prefix and prefix.group(1) in regionPrefixes:
            regions = regionPrefixes[prefix.group(1)]
        elif "latin" in seen["langs"]:
            regions = None
        else:
            regions = sorted({r for lang in seen["langs"] for r in regionByLang[lang]})
        if file in ids.sanctoralRegionFiles and not (prefix and prefix.group(1) in regionPrefixes):
            # A regional file names the region better than the display language does.
            regions = [ids.sanctoralRegionFiles[file]]
        own_date = re.fullmatch(r"(\d\d)(\d\d)[A-Z]?", anchor)
        stray = own_date and (month, day) != (int(own_date.group(1)), int(own_date.group(2)))
        if stray and not regions and (file, anchor) not in ids.sanctoralSpecial:
            # Shown to everyone on a date that is not the anchor's own: a slip
            # in one season block of upstream's switch, not a second feast day.
            report["notes"].append(f"stray date dropped: {file}#{anchor} on {month}-{day}")
            continue
        table[(file, anchor)].append({"month": month, "day": day, "regions": regions})
    return table


def sanctoral_ids(blocks, table, titles):
    """Give every sanctoral block an id; base anchors first so they keep the plain date."""
    assigned = {}
    taken = set()

    def claim(key, candidate):
        if candidate in taken:
            report["collisions"].append([f"{key[0]}#{key[1]}", candidate])
            n = 2
            while f"{candidate}-{n}" in taken:
                n += 1
            candidate = f"{candidate}-{n}"
        taken.add(candidate)
        assigned[key] = candidate

    def order(key):
        return (len(key[1]) > 4, key)

    for key in sorted(blocks, key=order):
        file, anchor = key
        if key in ids.sanctoralSpecial:
            claim(key, ids.sanctoralSpecial[key])
            continue
        m = re.fullmatch(r"(\d\d)(\d\d)([A-Z]?)", anchor)
        if not m:
            report["unmapped"].append(f"santos/{file}#{anchor}")
            continue
        month, day, suffix = m.groups()
        entries = table.get(key, [])
        # The entry on the anchor's own date decides whether it is universal.
        own = next(
            (e for e in entries if (e["month"], e["day"]) == (int(month), int(day))),
            entries[0] if entries else None,
        )
        regions = own["regions"] if own else None
        if file in ids.sanctoralRegionFiles and not regions:
            regions = [ids.sanctoralRegionFiles[file]]
        base = f"sanctorale.{month}-{day}"
        if suffix == "V":
            claim(key, f"{base}.vigil")
        elif regions:
            claim(key, f"{base}.{'-'.join(regions)}")
        elif not suffix:
            claim(key, base)
        else:
            name = titles.get(key, {})
            label = name.get("en-US") or name.get("la") or name.get("pt-BR") or suffix
            claim(key, f"{base}.{ids.name_slug(label) or suffix.lower()}")
    return assigned


# --- documents ---------------------------------------------------------------


def resolve_refs(doc, readings):
    """Replace a pointer into the commons lectionary with the passage itself.

    Upstream's saints borrow single readings from the commons by link; inlining
    them keeps a day's readings one document.
    """
    items = []
    for item in doc["items"]:
        ref = item.get("ref")
        if not ref or not ref["doc"].startswith("lecturas/"):
            items.append(item)
            continue
        source = readings.get(ref.get("anchor"))
        if not source:
            report["unresolvedRefs"].append(f"{doc['source']} -> {ref}")
            items.append(item)
            continue
        borrowed = source["items"]
        if "partial" in ref:
            partial = [i for i in borrowed if i.get("partial") == ref["partial"]]
            borrowed = partial or borrowed
        for b in borrowed:
            # The common's own title line is not part of the borrowed reading.
            if "part" not in b and "role" not in b and b is source["items"][0]:
                continue
            copied = copy.deepcopy(b)
            copied["part"] = item.get("part", copied.get("part"))
            copied["from"] = source["id"]
            for key in ("cycle", "alt"):
                if key in item:
                    copied[key] = item[key]
            copied.pop("partial", None)
            items.append(copied)
    doc["items"] = items


def attach_responses(doc):
    """The people's reply after a reading sits beside it in the skeleton, not
    inside it; give it the reading's part so the two travel together."""
    previous = None
    for item in doc["items"]:
        if item.get("role") == "people" and "part" not in item and previous:
            if previous.get("part") and previous.get("cycle") == item.get("cycle"):
                item["part"] = previous["part"]
                for key in ("alt",):
                    if key in previous and key not in item:
                        item[key] = previous[key]
        previous = item


def retag_sequence(doc):
    """Upstream files a sequence inside the Gospel acclamation; give it its own part.

    The sequence is every acclamation item before the acclamation proper, which
    is always the last one.
    """
    for cycle in {i.get("cycle") for i in doc["items"]}:
        acclamation = [
            i for i in doc["items"] if i.get("part") == "acclamation" and i.get("cycle") == cycle
        ]
        for item in acclamation[:-1]:
            item["part"] = "sequence"


def link_ids(doc, anchor_ids):
    """Rewrite upstream links in a document's text to Ember ids; collect them."""
    found = defaultdict(list)

    def visit(seg):
        if isinstance(seg, dict) and "to" in seg:
            target_id = anchor_ids.get((seg["to"]["doc"], seg["to"].get("anchor")))
            if target_id:
                seg["to"] = target_id
                found[target_id.split(".")[0]].append(target_id)
            else:
                seg["to"] = f"upstream:{seg['to']['doc']}#{seg['to'].get('anchor', '')}"

    for item in doc["items"]:
        for blocks in item.get("text", {}).values():
            for block in blocks:
                for line in block["lines"]:
                    for seg in line:
                        visit(seg)
        if "ref" in item:
            ref = item["ref"]
            target_id = anchor_ids.get((ref["doc"], ref.get("anchor")))
            item["ref"] = target_id or f"upstream:{ref['doc']}#{ref.get('anchor', '')}"
    return found


def write(path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )


def main():
    rows = json.loads((consult / "sanctoral.json").read_text(encoding="utf-8"))

    docs = {}  # (kind, id) -> doc
    anchor_ids = {}  # (upstream doc, anchor) -> id

    def add(store, doc_id, source, doc, **meta):
        doc = {"id": doc_id, "source": source, **meta, **doc}
        if (store, doc_id) in docs:
            report["collisions"].append([source, f"{store}/{doc_id}"])
            return None
        docs[(store, doc_id)] = doc
        return doc

    # Temporal formularies.
    for name, data in load("tiempos"):
        for block in dia_blocks(data["nodes"]):
            anchor = block["attrs"]["id"]
            doc_id = ids.temporal_id(anchor, False)
            if not doc_id:
                report["unmapped"].append(f"tiempos/{name}#{anchor}")
                continue
            add("formulary", doc_id, f"tiempos/{name}#{anchor}", convert.convert_block(block, None), kind="tempore")
            anchor_ids[(f"tiempos/{name}", anchor)] = doc_id

    # Sanctoral formularies: ids need every block's title first.
    sanctoral = {}
    for name, data in load("santos"):
        file = name.replace("santos_", "")
        for block in dia_blocks(data["nodes"]):
            sanctoral[(file, block["attrs"]["id"])] = convert.convert_block(block, None)
    table = sanctoral_regions(rows, sanctoral)
    titles = {key: title_of(doc, "title", True) for key, doc in sanctoral.items()}
    assigned = sanctoral_ids(sanctoral, table, titles)
    for key, doc in sanctoral.items():
        if key not in assigned:
            continue
        if not any(item.get("text") for item in doc["items"] if item.get("part") != "title"):
            # A skeleton with a heading at most: upstream's placeholder for a
            # proper it keeps in a regional file.
            report["notes"].append(f"empty block dropped: {key}")
            continue
        file, anchor = key
        add("formulary", assigned[key], f"santos/santos_{file}#{anchor}", doc, kind="sanctoral")
        anchor_ids[(f"santos/santos_{file}", anchor)] = assigned[key]

    # Commons, votive Masses, Masses for various needs and for the dead.
    for name, data in load("comunes_votivas"):
        kind = {"difuntos": "for-the-dead", "diversas": "various-needs", "votivas": "votive"}.get(name, "common")
        for block in dia_blocks(data["nodes"]):
            anchor = block["attrs"]["id"]
            doc_id = ids.common_id(name, anchor)
            if not doc_id:
                report["unmapped"].append(f"comunes_votivas/{name}#{anchor}")
                continue
            add("formulary", doc_id, f"comunes_votivas/{name}#{anchor}", convert.convert_block(block, None), kind=kind)
            anchor_ids[(f"comunes_votivas/{name}", anchor)] = doc_id

    # Prefaces.
    for name, data in load("prefacios"):
        for block in dia_blocks(data["nodes"]):
            anchor = block["attrs"]["id"]
            doc_id = f"preface.{int(anchor[2:])}"
            add("preface", doc_id, f"prefacios/{name}#{anchor}", convert.convert_block(block, None))
            anchor_ids[(f"prefacios/{name}", anchor)] = doc_id

    # Lectionary. The commons' readings are indexed by anchor for borrowing.
    readings = {}
    for name, data in load("lecturas"):
        file = name.replace("lecturas_", "")
        for block in dia_blocks(data["nodes"]):
            anchor = block["attrs"]["id"]
            source = f"lecturas/{name}#{anchor}"
            converted = convert.convert_block(block, None)
            if file.startswith("santos_"):
                key = (file.replace("santos_", ""), anchor)
                doc_id = assigned.get(key)
                if not doc_id:
                    only = sanctoral_ids({key: converted}, table, {key: title_of(converted, None, True)})
                    doc_id = only.get(key)
            elif file.startswith("comunes_") or file == "difuntos":
                doc_id = f"readings.{anchor}"
            else:
                doc_id = ids.temporal_id(anchor, True)
            if not doc_id:
                report["unmapped"].append(source)
                continue
            doc = add("lectionary", doc_id, source, converted)
            if doc:
                anchor_ids[(f"lecturas/{name}", anchor)] = doc_id
                if doc_id.startswith("readings."):
                    readings[anchor] = doc

    # Order of Mass and Eucharistic Prayers: one document per upstream file.
    for section, table_of_ids in (("ordinario", ids.order), ("plegarias_euc", ids.eucharisticPrayers)):
        for name, data in load(section):
            doc_id = table_of_ids[name]
            kind = "order" if section == "ordinario" else "eucharistic-prayer"
            add(kind, doc_id, f"{section}/{name}", convert.convert_block({"children": data["nodes"]}, None))

    # Everything else upstream ships, kept as documents for later use.
    for path in sorted((neutral / "standalone").rglob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        name = ids.slug(path.stem.replace("m_estructura_", ""))
        add("extra", name, data["source"], convert.convert_block({"children": data["nodes"]}, None))

    for (kind, doc_id), doc in docs.items():
        if kind == "lectionary":
            attach_responses(doc)
            resolve_refs(doc, readings)
            if doc_id in patches.sequences:
                retag_sequence(doc)
        if "lectionary" in doc:
            ref = doc.pop("lectionary")
            doc["lectionary"] = anchor_ids.get((ref["doc"], ref.get("anchor")))
            if not doc["lectionary"]:
                report["unresolvedRefs"].append(f"{doc['source']} -> {ref}")
                del doc["lectionary"]
        found = link_ids(doc, anchor_ids)
        if kind == "formulary":
            if found.get("preface"):
                doc["prefaces"] = list(dict.fromkeys(found["preface"]))
            commons = [i for k in ("common", "for-the-dead") for i in found.get(k, [])]
            if commons:
                doc["commons"] = list(dict.fromkeys(commons))
            doc["title"] = title_of(doc, "title", doc["kind"] == "sanctoral")
            label = rank_label(doc)
            if label:
                doc["rankLabel"] = label
        elif kind in ("lectionary", "preface"):
            doc["title"] = title_of(doc, None, True)
        else:
            doc["title"] = title_of(doc, None, False)
        patches.apply(kind, doc)

    for doc_id in patches.sequences:
        doc = docs.get(("lectionary", doc_id))
        for lang in driverLangs:
            has = doc and any(i.get("part") == "sequence" and lang in i.get("text", {}) for i in doc["items"])
            if not has:
                sys.exit(f"sequence missing: {doc_id} {lang}")

    calendar = build_calendar(table, assigned, docs)

    if target.exists():
        shutil.rmtree(target)
    folders = {
        "formulary": "formularies",
        "lectionary": "lectionary",
        "eucharistic-prayer": "eucharistic-prayers",
        "order": "order",
        "extra": "extras",
    }
    prefaces = {}
    index = {"formularies": {}, "lectionary": [], "prefaces": {}, "eucharisticPrayers": [], "extras": []}
    for (kind, doc_id), doc in sorted(docs.items()):
        if kind == "preface":
            prefaces[doc_id] = doc
            index["prefaces"][doc_id] = {"title": doc.get("title", {})}
            continue
        write(target / folders[kind] / f"{doc_id}.json", doc)
        if kind == "formulary":
            entry = {"kind": doc["kind"], "title": doc.get("title", {})}
            for key in ("precedence", "lectionary"):
                if key in doc:
                    entry[key] = doc[key]
            index["formularies"][doc_id] = entry
        elif kind == "lectionary":
            index["lectionary"].append(doc_id)
        elif kind == "eucharistic-prayer":
            index["eucharisticPrayers"].append(doc_id)
        elif kind == "extra":
            index["extras"].append(doc_id)
    colors = json.loads((Path(__file__).parent / "colors.json").read_text(encoding="utf-8"))
    for doc_id, entry in index["formularies"].items():
        color = colors.get(doc_id) or patches.color_of(docs[("formulary", doc_id)])
        if color:
            entry["color"] = color
    # One blob holds everything the calendar needs, so resolving a day never
    # loads a formulary.
    calendar["formularies"] = {
        doc_id: entry
        for doc_id, entry in index["formularies"].items()
        if entry["kind"] in ("tempore", "sanctoral")
    }
    calendar["lectionary"] = [i for i in index["lectionary"] if not i.startswith("readings.")]
    write(target / "prefaces.json", prefaces)
    write(target / "calendar.json", calendar)
    write(target / "index.json", index)
    (consult / "anchors.json").write_text(
        json.dumps({f"{doc}#{anchor}": doc_id for (doc, anchor), doc_id in anchor_ids.items()}, indent=1),
        encoding="utf-8",
    )
    (consult / "build-report.json").write_text(
        json.dumps({**report, "unknownClasses": convert.unknownClasses}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )

    counts = Counter(kind for kind, _ in docs)
    print(dict(counts))
    for key in ("unmapped", "collisions", "unresolvedRefs"):
        print(key, len(report[key]), report[key][:6])
    missing = Counter()
    for (kind, doc_id), doc in docs.items():
        if kind in ("formulary", "lectionary"):
            for lang in driverLangs:
                if not any(lang in i.get("text", {}) for i in doc["items"]):
                    missing[lang] += 1
    print("documents with no text at all, by language:", dict(missing))
    print("unknown classes:", convert.unknownClasses.most_common(12))


def build_calendar(table, assigned, docs):
    """The sanctoral cycle as data: who is kept on which date, where."""
    entries = []
    for key, dates in sorted(table.items()):
        doc_id = assigned.get(key) or ids.sanctoralSpecial.get(key)
        if not doc_id or ("formulary", doc_id) not in docs:
            report["notes"].append(f"calendar entry without formulary: {key}")
            continue
        for date in dates:
            entry = {"id": doc_id, "month": date["month"], "day": date["day"]}
            if date["regions"]:
                entry["regions"] = date["regions"]
            entries.append(entry)
    entries.sort(key=lambda e: (e["month"], e["day"], e["id"]))
    return {"sanctoral": entries, "movable": patches.movable}


if __name__ == "__main__":
    main()
