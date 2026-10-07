"""Neutral upstream JSON (see extract.py) -> flat, typed documents.

A document is one upstream block (a celebration, a reading set, a preface, …)
as an ordered list of items. An item is one upstream slot: the same passage in
every language, tagged with where it sat in the skeleton (which part of the
Mass, which lectionary cycle, which alternative). Order is upstream's order,
so nothing has to be re-assembled to read a rite straight through.

Text is converted from upstream's markup to blocks of lines of segments, by
tag and class only. No wording is ever inspected.
"""

import re
from collections import Counter

langCodes = {
    "latin": "la",
    "port": "pt-BR",
    "engl": "en-US",
    "cast": "es",
    "ital": "it",
    "fran": "fr",
    "germ": "de",
}

# Upstream part classes -> the names used across Ember.
partNames = {
    "x_titulo": "title",
    "x_ant_ent": "entranceAntiphon",
    "x_gloria": "gloria",
    "x_colecta": "collect",
    "x_prim_lect": "firstReading",
    "x_salmo": "psalm",
    "x_seg_lect": "secondReading",
    "x_aleluya": "acclamation",
    "x_evangelio": "gospel",
    "x_credo": "creed",
    "x_antes_or_fieles": "beforeUniversalPrayer",
    "x_or_ofrend": "prayerOverOfferings",
    "x_prefacio": "preface",
    "x_pleg": "eucharisticPrayer",
    "x_ant_com": "communionAntiphon",
    "x_post_com": "postcommunion",
    "x_or_pueblo": "prayerOverPeople",
}
cycleNames = {
    "cicloA": "A",
    "cicloB": "B",
    "cicloC": "C",
    "annoprimo": "I",
    "annosecundo": "II",
}
roleNames = {
    "pueblo": "people",
    "rubrica": "rubric",
    "PsalmAlleluiaVerse": "verse",
    "oracionestodos": "all",
}
# Navigation and the per-part source buttons: app chrome, not missal text.
chromeClasses = {
    "marc_dcha",
    "cursores",
    "final_pagina",
    "soytiempo",
    "soysanto",
    "div-botones",
    "div-botones-row",
    "div-botones-col",
    "solodos",
    "boton_mas",
    "boton_menos",
    "indice",
}
toggleLabels = {"O_BIEN": "or", "BREVE": "short", "LARGO": "long"}

inlineTags = {"span", "i", "b", "em", "strong", "a", "small", "big", "sup", "sub", "font", "u"}
# Span/inline classes -> segment mark. Anything else is plain text.
markNames = {
    "red": "rubric",
    "re": "rubric",
    "rojo": "rubric",
    "rebo": "rubric",
    "rece": "rubric",
    "rubrica": "rubric",
    "cruzroja": "cross",
    "cap": "dropCap",
    "pueblo": "people",
    "cursiva": "italic",
    "letania": "litany",
    "rubric": "rubric",
    "‘red‘": "rubric",
    "rubr_colecta": "rubric",
    "rubr_ofert": "rubric",
    "rubr_final": "rubric",
    # The voices of the Passion.
    "cron": "narrator",
    "xto": "christ",
    "sinag": "crowd",
    "sinag2": "crowd",
    # Readings that must be taken with this celebration (upstream `lect_obl`).
    "lect_obl": "properReadings",
}
# Words said only on certain days (the proper Communicantes and the like):
# upstream shows or hides these spans by the day's celebration.
conditionNames = {
    "octava_pascua": "easter-octave",
    "octava_navidad": "christmas-octave",
    "pentecostes": "pentecost",
    "epifania": "epiphany",
    "ascension": "ascension",
    "solo_misa_jueves_sto": "lords-supper",
    "difuntos_orig": "for-the-dead",
}
langSpans = {f"misal_{name}": code for name, code in langCodes.items()}
ignoredClasses = {
    "boton", "enlacepref", "normal", "novisibleb", "alternativa", "indicepref", "ind1", "ind3",
    "pestana", "pestana2", "botonBueno", "solo_android", "solo_mac", "active", "button",
    "button-23", "black", "Black",
}
tagMarks = {"i": "italic", "em": "italic", "b": "bold", "strong": "bold"}

linkRe = re.compile(r"m_estructura/(\w+)/m_estructura_(\w+)\.html(?:\?parcial=(\w+))?(?:#([\w-]+))?")
toggleRe = re.compile(r"cambia_vista\('([\w-]+)'\)")

unknownClasses = Counter()


def parse_link(value):
    m = linkRe.search(value or "")
    if not m:
        return None
    link = {"doc": f"{m.group(1)}/{m.group(2)}"}
    if m.group(4):
        link["anchor"] = m.group(4)
    if m.group(3):
        link["partial"] = m.group(3)
    return link


# --- language text -> blocks -------------------------------------------------


class Para:
    """Collects inline segments into lines until a block boundary."""

    def __init__(self, kind="p", cls=None):
        self.kind = kind
        self.cls = cls
        self.lines = [[]]
        self.cite = None
        self.hard_breaks = False

    def add(self, text, mark=None, link=None):
        if not text:
            return
        seg = text if mark is None and link is None else {"m": mark or "link", "t": text}
        if link:
            seg["to"] = link
        self.lines[-1].append(seg)

    def br(self):
        self.hard_breaks = True
        self.lines.append([])

    def done(self):
        lines = settle_lines(self.lines, self.hard_breaks)
        if not lines and not self.cite:
            return None
        block = {"k": self.kind, "lines": lines}
        if self.cls:
            block["cls"] = self.cls
        if self.cite:
            block["cite"] = self.cite
        return block


def seg_text(seg):
    return seg if isinstance(seg, str) else seg["t"]


def settle_lines(lines, hard_breaks):
    """Decide what a source newline means, then tidy each line.

    Where a passage has <br>, those are its line breaks and newlines are just
    the source file's wrapping. Where it has none, short uneven lines are the
    prayer's sense lines (the Portuguese orations), while lines that all run
    to the wrap margin are prose reflowed by upstream's formatter.
    """
    out = []
    for line in lines:
        pieces = [[]]
        for seg in line:
            text = seg_text(seg)
            parts = text.split("\n")
            for i, part in enumerate(parts):
                if i:
                    pieces.append([])
                if part:
                    pieces[-1].append(part if isinstance(seg, str) else {**seg, "t": part})
        pieces = [p for p in pieces if any(seg_text(s).strip() for s in p)]
        if not pieces:
            continue
        widths = [sum(len(seg_text(s)) for s in p) for p in pieces[:-1]]
        sense_lines = not hard_breaks and widths and min(widths) < 58
        if sense_lines:
            out.extend(pieces)
        else:
            joined = []
            for i, p in enumerate(pieces):
                if i:
                    joined.append(" ")
                joined.extend(p)
            out.append(joined)
    return [tidy(line) for line in out if tidy(line)]


def tidy(line):
    """Merge adjacent plain runs and trim the ends."""
    merged = []
    for seg in line:
        if isinstance(seg, str) and merged and isinstance(merged[-1], str):
            merged[-1] += seg
        else:
            merged.append(seg)
    merged = [re.sub(r"[ \t\xa0]+", " ", s) if isinstance(s, str) else s for s in merged]
    if merged and isinstance(merged[0], str):
        merged[0] = merged[0].lstrip()
    if merged and isinstance(merged[-1], str):
        merged[-1] = merged[-1].rstrip()
    return [s for s in merged if seg_text(s) != ""]


def has_block_child(node):
    return any(
        isinstance(c, dict) and "tag" in c and c["tag"] not in inlineTags and c["tag"] != "br"
        for c in node.get("children", [])
    )


def inline(node, para, mark=None):
    for child in node.get("children", []):
        if isinstance(child, str):
            para.add(child, mark)
        elif "comment" in child:
            continue
        elif child["tag"] == "br":
            para.br()
        else:
            classes = child.get("class", [])
            if "alindcha" in classes or "alin_dcha" in classes:
                cite = Para()
                inline(child, cite)
                done = cite.done()
                if done:
                    para.cite = " ".join(
                        "".join(seg_text(s) for s in line) for line in done["lines"]
                    )
                continue
            if "boton" in classes and not parse_link(link_of(child)):
                continue
            child_mark = mark
            for c in classes:
                if c in markNames:
                    child_mark = markNames[c]
                elif c in conditionNames:
                    child_mark = f"when:{conditionNames[c]}"
                elif c in langSpans:
                    child_mark = f"lang:{langSpans[c]}"
                elif c not in ignoredClasses:
                    unknownClasses[f"inline.{c}"] += 1
            child_mark = tagMarks.get(child["tag"], child_mark)
            link = parse_link(link_of(child))
            if link:
                text = Para()
                inline(child, text)
                done = text.done()
                label = (
                    " ".join("".join(seg_text(s) for s in line) for line in done["lines"])
                    if done
                    else ""
                )
                para.add(label or "→", None, link)
            else:
                inline(child, para, child_mark)


def link_of(node):
    attrs = node.get("attrs", {})
    return attrs.get("href") or attrs.get("ontouchend") or ""


def blocks_of(node, inherited=None):
    """Block-level walk of one language's content for a slot."""
    blocks = []
    para = Para("p", inherited)

    def flush():
        nonlocal para
        done = para.done()
        if done:
            blocks.append(done)
        para = Para("p", inherited)

    for child in node.get("children", []):
        if isinstance(child, str):
            para.add(child)
        elif "comment" in child:
            continue
        elif child["tag"] == "br":
            para.br()
        elif child["tag"] in inlineTags:
            inline({"children": [child]}, para)
        else:
            flush()
            classes = [c for c in child.get("class", []) if c not in langCodes]
            if set(classes) & chromeClasses:
                continue
            cls = classes[0] if classes else inherited
            if child["tag"] == "hr":
                blocks.append({"k": "hr", "lines": []})
            elif has_block_child(child):
                blocks.extend(blocks_of(child, cls))
            else:
                kind = child["tag"] if re.fullmatch(r"h[1-6]", child["tag"]) else "p"
                inner = Para(kind, cls)
                mark = next((markNames[c] for c in classes if c in markNames), None)
                inline(child, inner, mark)
                done = inner.done()
                if done:
                    blocks.append(done)
    flush()
    return blocks


def is_rubric(block):
    segs = [s for line in block["lines"] for s in line]
    return bool(segs) and all(isinstance(s, dict) and s["m"] == "rubric" for s in segs)


# --- skeleton -> items -------------------------------------------------------


def convert_block(block, skeleton_langs):
    """One upstream `div.dia` (or whole file) -> {precedence, lectionary, items}."""
    doc = {"items": []}
    items = doc["items"]

    def toggle_group(node):
        """An element that upstream shows one-of-several: its id, its siblings'."""
        own = node.get("attrs", {}).get("id")
        if not own:
            return None
        for child in node.get("children", []):
            if not isinstance(child, dict):
                continue
            for btn in iter_nodes(child, depth=2):
                ids = toggleRe.findall(btn.get("attrs", {}).get("ontouchend", ""))
                if own in ids and len(ids) > 1:
                    label = next(
                        (
                            toggleLabels[c["comment"]]
                            for c in btn.get("children", [])
                            if isinstance(c, dict) and c.get("comment") in toggleLabels
                        ),
                        "or",
                    )
                    return {"group": "|".join(sorted(ids)), "id": own, "label": label}
        return None

    def walk(node, ctx):
        if isinstance(node, str):
            if node.strip():
                emit({"text": {"*": [{"k": "p", "lines": [[node.strip()]]}]}}, ctx)
            return
        if "comment" in node:
            return
        classes = node.get("class", [])
        attrs = node.get("attrs", {})
        if node["tag"] == "input":
            for c in classes:
                if c.endswith("_precedencia"):
                    doc["precedence"] = float(attrs.get("value", 0))
            return
        if set(classes) & chromeClasses:
            return
        # Upstream prints some lines twice, one copy for each of its two layouts.
        # The link to the readings is one of them and is kept: it marks where
        # the readings stand.
        duplicate = "noincrustado" in classes and "lectionarium" not in classes
        if duplicate or node["tag"] in ("style", "script"):
            return
        ctx = dict(ctx)
        for c in classes:
            if c in partNames:
                ctx["part"] = partNames[c]
            elif c in cycleNames:
                ctx["cycle"] = cycleNames[c]
            elif c in roleNames:
                ctx["role"] = roleNames[c]
            elif c == "sugerido":
                ctx["suggested"] = True
            elif c == "novisibleb":
                ctx["hidden"] = True
            elif c == "parcial":
                ctx["partial"] = attrs.get("id", "").replace("parcial_", "")
        if attrs.get("id"):
            ctx["in"] = ctx.get("in", []) + [attrs["id"]]
            # The Order of Mass marks where each proper part of the day goes;
            # what the placeholder holds is the Order's own text for that part.
            placeholder = re.fullmatch(r"x_ord_(\w+)", attrs["id"])
            if placeholder and f"x_{placeholder.group(1)}" in partNames:
                ctx["part"] = partNames[f"x_{placeholder.group(1)}"]
                items.append({"mark": ctx["part"]})
            elif re.fullmatch(r"x_(tmp|snt|com|otr|res|pf|pe)_\w+", attrs["id"]):
                return
        alt = toggle_group(node) or form_pair(attrs.get("id", ""))
        if alt:
            ctx["alt"] = alt
        if "lectionarium" in classes:
            ctx["lectionarium"] = True

        link = parse_link(link_of(node)) if node["tag"] in ("a", "span") else None
        if link and "boton" in classes:
            if ctx.get("lectionarium") and "part" not in ctx:
                doc["lectionary"] = link
                # Where the readings stand in a rite that is read straight through.
                items.append({"mark": "readings", "at": link.get("anchor", "")})
            else:
                emit({"ref": link}, ctx)
            return
        if "boton" in classes:
            return

        if "slot" in node:
            text = {}
            for lang, fills in node.get("fill", {}).items():
                blocks = []
                for filled in fills:
                    blocks.extend(blocks_of(filled))
                if blocks:
                    text[langCodes[lang]] = blocks
            # A slot can also carry language-neutral text of its own.
            own = blocks_of({"children": [c for c in node.get("children", []) if not is_structural(c)]})
            if own:
                text["*"] = own
            if text:
                emit({"slot": node["slot"], "text": text}, ctx)
            for child in node.get("children", []):
                if is_structural(child):
                    walk(child, ctx)
            return

        nested = any(
            is_structural(c) or is_ref(c) for c in node.get("children", [])
        ) or has_block_child(node)
        if node["tag"] in inlineTags or not nested:
            # Wrapped so the node's own tag and class decide the block's kind.
            own = blocks_of({"children": [node]})
            # A lone cycle letter under a cycle wrapper is a UI label.
            if own and not (ctx.get("cycle") and len(plain(own)) <= 2):
                emit({"text": {"*": own}}, ctx)
            return
        for child in node.get("children", []):
            walk(child, ctx)

    def emit(item, ctx):
        split_languages(item)
        for key in ("part", "cycle", "role", "alt", "in", "partial"):
            if key in ctx:
                item[key] = ctx[key]
        if ctx.get("suggested"):
            item["suggested"] = True
        if ctx.get("hidden"):
            item["hidden"] = True
        if "role" not in item and "text" in item:
            blocks = [b for bs in item["text"].values() for b in bs]
            if blocks and all(is_rubric(b) for b in blocks):
                item["role"] = "rubric"
        items.append(item)

    for child in block.get("children", []):
        walk(child, {})
    return doc


formSuffixes = {"largo": "long", "larga": "long", "breve": "short", "otro": "or"}


def form_pair(dom_id):
    """`pregon_largo` / `pregon_breve`: the long and short forms of one text,
    which upstream toggles by id rather than with its usual button."""
    m = re.fullmatch(r"(.+)_(largo|larga|breve|otro)", dom_id)
    if not m:
        return None
    return {"group": m.group(1), "id": dom_id, "label": formSuffixes[m.group(2)]}


def split_languages(item):
    """Skeleton text that carries every language inline becomes per-language text."""
    neutral = item.get("text", {}).get("*")
    if not neutral:
        return
    marked = {
        seg["m"][5:]
        for block in neutral
        for line in block["lines"]
        for seg in line
        if isinstance(seg, dict) and seg["m"].startswith("lang:")
    }
    if not marked:
        return
    del item["text"]["*"]
    for lang in marked:
        blocks = []
        for block in neutral:
            lines = []
            for line in block["lines"]:
                kept = [
                    seg["t"] if isinstance(seg, dict) and seg["m"] == f"lang:{lang}" else seg
                    for seg in line
                    if not (isinstance(seg, dict) and seg["m"].startswith("lang:") and seg["m"] != f"lang:{lang}")
                ]
                if tidy(kept):
                    lines.append(tidy(kept))
            if lines:
                blocks.append({**block, "lines": lines})
        if blocks:
            item["text"].setdefault(lang, blocks)


def is_structural(node):
    """A skeleton child that holds slots of its own, as opposed to inline text."""
    if not isinstance(node, dict) or "comment" in node:
        return False
    if "slot" in node or node["tag"] == "input":
        return True
    return any(is_structural(c) for c in node.get("children", []))


def is_ref(node):
    return (
        isinstance(node, dict)
        and "boton" in node.get("class", [])
        and parse_link(link_of(node)) is not None
    )


def iter_nodes(node, depth):
    yield node
    if depth:
        for child in node.get("children", []):
            if isinstance(child, dict) and "tag" in child:
                yield from iter_nodes(child, depth - 1)


def plain(blocks):
    return " ".join(
        "".join(seg_text(s) for s in line) for b in blocks for line in b["lines"]
    ).strip()
