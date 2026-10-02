"""Lifts the lessons of Morrow's *My Catholic Faith* on the Mass, its altar,
vessels, vestments and colours, the sacramentals and the Church year into
standalone chapters, so a holy card can put the one lesson it illustrates on
its reading shelf (a card's `related` names whole items, not a book's chapters).

The book's markdown pairs its plates in `:::row` fences that only the book
reader understands; here each row becomes a `gallery` section and each lone
plate an `image` section, with the line printed under it as its caption. The
prose between the plates is copied as it stands, in both languages.

Run from the repo root:  python3 research/holy-card-faces/morrow-chapters.py
"""

import json, os, re, shutil

book = "content/books/morrow-my-catholic-faith/"
langs = ("en-US", "pt-BR")
lessons = {
    "lesson-135": "morrow-the-altar",
    "lesson-136": "morrow-sacred-vessels",
    "lesson-137": "morrow-vestments",
    "lesson-138": "morrow-liturgical-colours",
    "lesson-140": "morrow-holy-sacrifice-of-the-mass",
    "lesson-177": "morrow-sacramentals",
    "appendix-church-year": "morrow-church-year",
}
image_line = re.compile(r"^!\[[^\]]*\]\(\.\./images/([^)]+)\)\s*$")


def parse(text):
    """The lesson as [('title', str), ('prose', str), ('image', [(file, caption)]) | ('row', …)]."""
    lines = text.split("\n")
    title = lines[0].lstrip("# ").strip()
    out, prose, i = [], [], 1

    def flush():
        body = "\n".join(prose).strip()
        if body:
            out.append(("prose", body))
        prose.clear()

    while i < len(lines):
        line = lines[i]
        if line.strip() == ":::row":
            flush()
            items, i = [], i + 1
            while lines[i].strip() != ":::":
                m = image_line.match(lines[i])
                if m:
                    cap = lines[i + 1].strip() if i + 1 < len(lines) and not image_line.match(lines[i + 1]) else ""
                    items.append((m.group(1), cap.strip("*_ ")))
                i += 1
            out.append(("row", items))
            i += 1
            continue
        m = image_line.match(line)
        if m:
            flush()
            # The caption is the italic lines right under the plate, after at most one blank line.
            j, cap = i + 1, []
            if j < len(lines) and not lines[j].strip():
                j += 1
            while j < len(lines) and re.match(r"^\*[^*].*\*\s*$", lines[j].strip()):
                cap.append(lines[j].strip().strip("*").strip())
                j += 1
                if j < len(lines) and not lines[j].strip() and j + 1 < len(lines) and re.match(r"^\*[^*]", lines[j + 1].strip()):
                    j += 1
            out.append(("image", [(m.group(1), "  ".join(cap))]))
            i = j if cap else i + 1
            continue
        prose.append(line)
        i += 1
    flush()
    # The book prints a pair of plates' captions together under the first
    # (1–4 then 5–8): one caption line per plate when the counts agree.
    for k, (kind, items) in enumerate(out):
        if kind != "image" or not items[0][1]:
            continue
        parts = items[0][1].split("  ")
        following = []
        for kind2, items2 in out[k + 1:]:
            if kind2 != "image" or items2[0][1]:
                break
            following.append(items2)
        if len(parts) > 1 and len(parts) == len(following) + 1:
            items[0] = (items[0][0], parts[0])
            for items2, part in zip(following, parts[1:]):
                items2[0] = (items2[0][0], part)
    return title, out


for lesson, cid in lessons.items():
    parsed = {lang: parse(open(f"{book}{lang}/{lesson}.md").read()) for lang in langs}
    shapes = {lang: [(k, [f for f, _ in v] if k != "prose" else None) for k, v in p[1]] for lang, p in parsed.items()}
    if shapes["en-US"] != shapes["pt-BR"]:
        raise SystemExit(f"{lesson}: the two languages place their plates differently")
    out_dir = f"content/chapters/{cid}/"
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir + "sections")
    os.makedirs(out_dir + "images")

    titles = {lang: re.sub(r"^\d+\.\s*", "", parsed[lang][0]) for lang in langs}
    sections = [{"type": "heading", "text": titles}]
    words, n = 0, 0
    for idx, (kind, _) in enumerate(parsed["en-US"][1]):
        per_lang = {lang: parsed[lang][1][idx][1] for lang in langs}
        if kind == "prose":
            n += 1
            for lang in langs:
                open(f"{out_dir}sections/part-{n:02d}.{lang}.md", "w").write(per_lang[lang] + "\n")
            words += len(per_lang["en-US"].split())
            sections.append({"type": "prose", "file": f"sections/part-{n:02d}"})
            continue
        items = []
        for k, (file, _) in enumerate(per_lang["en-US"]):
            shutil.copy(f"{book}images/{file}", out_dir + "images/" + file)
            item = {"src": f"images/{file}"}
            caps = {lang: per_lang[lang][k][1] for lang in langs}
            # A cross-reference to a page of the printed book points nowhere here.
            if caps["en-US"] and "SEE PAGE" not in caps["en-US"].upper():
                item["caption"] = caps
            items.append(item)
        if kind == "row":
            sections.append({"type": "gallery", "display": "row", "items": items})
        else:
            sections.append({"type": "image", **items[0]})

    number = re.match(r"^(\d+)\.", parsed["en-US"][0])
    where = {
        "en-US": f"From My Catholic Faith, lesson {number.group(1)}" if number else "From My Catholic Faith",
        "pt-BR": f"De Minha Fé Católica, lição {number.group(1)}" if number else "De Minha Fé Católica",
    }
    meta = {
        "id": cid,
        "title": titles,
        "subtitle": where,
        "estimatedMinutes": max(1, round(words / 200)),
        "tags": ["formation", "mass", "liturgy", "morrow"],
    }
    open(out_dir + "chapter.json", "w").write(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
    open(out_dir + "content.json", "w").write(json.dumps({"sections": sections}, ensure_ascii=False, indent=2) + "\n")
    print(cid, len(sections), "sections,", meta["estimatedMinutes"], "min")
