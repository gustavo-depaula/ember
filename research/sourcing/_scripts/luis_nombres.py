import sys; sys.path.insert(0, "/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
import wsfetch as w
from luis_import import *

P = "De los nombres de Cristo/Tomo {}, {}"
BOOKS = [
 ("1", ["Dedicatoria del Maestro", "Introducción", "De los nombres en general", "Pimpollo", "Faces de Dios", "Camino", "Pastor", "Monte", "Padre del siglo futuro"]),
 ("2", ["Dedicatoria del Maestro", "Introducción", "Brazo de Dios", "Rey de Dios", "Principe de paz", "Esposo"]),
 ("3", ["Dedicatoria del Maestro", "Introducción", "Hijo de Dios", "Amado", "Jesús", "Cordero"]),
]
TITLE = {"Dedicatoria del Maestro": "Dedicatoria", "Principe de paz": "Príncipe de paz"}
def slug(t):
    import unicodedata
    return re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", t.lower()).encode("ascii", "ignore").decode()).strip("-")
allpages = set(w.pages("De los nombres de Cristo"))
toc, raw, words = [], [], 0
for n, items in BOOKS:
    node = {"id": f"libro-{n}", "title": {"es-ES": ["Libro primero", "Libro segundo", "Libro tercero"][int(n) - 1], "en-US": ["Book One", "Book Two", "Book Three"][int(n) - 1], "pt-BR": ["Livro primeiro", "Livro segundo", "Livro terceiro"][int(n) - 1]}, "children": []}
    for it in items:
        parts = [P.format(n, it)] + [P.format(n, f"{it} ({r})") for r in ("II", "III") if P.format(n, f"{it} ({r})") in allpages]
        wts = [w.wikitext(t) for t in parts]
        wt = "\n\n".join(wts)
        raw.append(f"=== {' + '.join(parts)}\n{wt}\n---\n")
        md = w.to_md(wt)
        lo = w.leftovers(md)
        if lo: print(it, lo)
        title = TITLE.get(it, it)
        cid = f"l{n}-{slug(title)}"
        words += write_md("nombres-de-cristo", "es-ES", cid, title, md)
        node["children"].append({"id": cid, "title": {"es-ES": title}})
    toc.append(node)
print("words", words)
meta = {
 "id": "luis-nombres-de-cristo", "cover": "quarter",
 "name": {"es-ES": "De los nombres de Cristo", "en-US": "The Names of Christ", "pt-BR": "Dos nomes de Cristo"},
 "description": {
  "es-ES": "Diálogo en tres libros entre Marcelo, Juliano y Sabino sobre los nombres que la Escritura da a Cristo: Pimpollo, Faces de Dios, Camino, Pastor, Monte, Padre del siglo futuro, Brazo de Dios, Rey de Dios, Príncipe de paz, Esposo, Hijo de Dios, Amado, Jesús y Cordero. Obra maestra de la prosa castellana del siglo XVI (Salamanca, 1583; 1585; el nombre Cordero, en la edición póstuma de 1595).",
  "en-US": "A dialogue in three books between Marcelo, Juliano and Sabino on the names Scripture gives to Christ: Shoot, Face of God, Way, Shepherd, Mountain, Father of the Age to Come, Arm of God, King of God, Prince of Peace, Bridegroom, Son of God, Beloved, Jesus and Lamb. A masterpiece of sixteenth-century Castilian prose (Salamanca, 1583; 1585; the name Lamb added in the posthumous edition of 1595).",
  "pt-BR": "Diálogo em três livros entre Marcelo, Juliano e Sabino sobre os nomes que a Escritura dá a Cristo: Renovo, Faces de Deus, Caminho, Pastor, Monte, Pai do século futuro, Braço de Deus, Rei de Deus, Príncipe da paz, Esposo, Filho de Deus, Amado, Jesus e Cordeiro. Obra-prima da prosa castelhana do século XVI (Salamanca, 1583; 1585; o nome Cordeiro, na edição póstuma de 1595)."},
 "composed": "1583–1595", "languages": ["es-ES"], "work": "luis-de-leon/nombres-de-cristo",
 "editions": {"es-ES": {"editor": "es.wikisource transcription (text of the 1587 edition)", "year": 1587}},
 "sources": [{"language": "es-ES", "url": "https://es.wikisource.org/wiki/De_los_nombres_de_Cristo", "edition": "De los nombres de Cristo, es.wikisource, 30 pages (Tomo 1–3); pages split as (II)/(III) joined into one chapter per name. Order of Book III follows the 1595 edition (Hijo de Dios, Amado, Jesús, Cordero).", "description": "Proofread transcription of a public-domain edition (cross-check: Onís, Clásicos Castellanos, archive.org delosnombresdecr01le).", "tier": "A"}],
}
finish("nombres-de-cristo", meta, toc, "nombres-de-cristo.txt", "".join(raw))
