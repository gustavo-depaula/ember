"""Shared book.json writer for the Louis of Granada imports."""
import json, shutil
from pathlib import Path
R = Path("/Users/gustavo/Documents/prayer")
BASE = R / "content/books/louis-of-granada-opera-omnia"
AUTHOR = {"es-ES": "Fray Luis de Granada", "en-US": "Ven. Louis of Granada", "la": "Ludovicus Granatensis", "pt-BR": "Frei Luís de Granada"}

def write_book(slug, bid, name, desc, composed, langs, editions, sources, toc, work, cover="quarter", author=None, copies=()):
    """name/desc: dict lang->text (must include en-US and pt-BR). toc: list of nodes {id,title:{lang:..},children?}."""
    a = dict(author or AUTHOR)
    meta = {"id": bid, "cover": cover, "name": name, "author": {k: v for k, v in a.items() if k in set(langs) | {"en-US", "pt-BR"}},
            "description": desc, "composed": composed, "languages": langs, "work": "louis-of-granada/" + work,
            "editions": editions, "sources": sources, "toc": toc}
    d = BASE / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for src, lang_dir, fname in copies:
        t = d / "sources" / lang_dir
        t.mkdir(parents=True, exist_ok=True)
        shutil.copy(src, t / fname)
    return d

def h1(path):
    for l in Path(path).read_text(encoding="utf-8").split("\n"):
        if l.startswith("# "):
            return l[2:].strip()

def toc_from(slug, groups, lang="es-ES"):
    """groups: list of (group_id|None, group_title|None, [chapter ids]). None group -> flat leaves."""
    d = BASE / slug / lang
    toc = []
    for gid, gt, ids in groups:
        leaves = [{"id": i, "title": {lang: h1(d / (i + ".md"))}} for i in ids]
        if gid is None:
            toc += leaves
        else:
            toc.append({"id": gid, "title": {lang: gt}, "children": leaves})
    return toc

def cuervo_source(vol, edition_note, description):
    return {"language": "es-ES", "url": "https://archive.org/details/obrascue%02dluisuoft" % vol,
            "edition": "Fr. Luis de Granada, Obras, ed. Justo Cuervo OP, vol. %d (Madrid: Viuda e hija de Gómez Fuentenebro, 1906-1908). %s" % (vol, edition_note),
            "description": description + " OCR of the University of Toronto scan, cleaned by script (running heads, page numbers and the editor's prologue removed; lost initial capitals restored from the corpus vocabulary), not proofread.",
            "tier": "A", "tierEvidence": "Granada's text of the 16th century, reprinted in 1906; Cuervo's edition is in the public domain on archive.org."}

def emit_treatises(slug, secs, front_ids, names, tail_ids=(), group_prefix="Tratado"):
    """Write es-ES chapter files and return toc groups. names: {n: title}."""
    from cuervo import write_sections
    write_sections(BASE / slug, "es-ES", secs)
    import re
    ids = [c for c, _, _ in secs]
    groups = [(None, None, [i for i in ids if i in front_ids])]
    roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
    for n in sorted(names):
        sub = [i for i in ids if re.match(r"t%d-" % n, i)]
        if sub:
            groups.append(("tratado-%d" % n, "%s %s: %s" % (group_prefix, roman[n], names[n]), sub))
    rest = [i for i in ids if i in tail_ids]
    if rest: groups.append((None, None, rest))
    return groups

def quick_book(slug, bid, vol, names3, desc3, composed, groups, src_desc, work, year, edition_note="", extra_sources=()):
    """names3/desc3: (es, en, pt). groups: toc groups as from toc_from input."""
    toc = toc_from(slug, groups)
    src = [cuervo_source(vol, edition_note, src_desc)] + list(extra_sources)
    write_book(slug, bid, {"es-ES": names3[0], "en-US": names3[1], "pt-BR": names3[2]}, {"es-ES": desc3[0], "en-US": desc3[1], "pt-BR": desc3[2]},
               composed, ["es-ES"], {"es-ES": {"editor": "Justo Cuervo OP", "year": year}}, src, toc, work,
               copies=[(Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia/obrascue%02dluisuoft.txt" % vol), "spanish-originals", "obras-cuervo-%02d.txt" % vol)])
