import sys; sys.path.insert(0, "/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
import wsfetch as w
from luis_import import *

def build(book, prefix, sep, extra, tail_name, cap_range, meta, rawname):
    pages = set(w.pages(prefix))
    toc, raw, words = [], [], 0
    def add(cid, title, parts, headings):
        nonlocal words
        mds = []
        for t, h in zip(parts, headings):
            wt = w.wikitext(t)
            raw.append(f"=== {t}\n{wt}\n---\n")
            md = w.to_md(wt)
            lo = w.leftovers(md)
            if lo: print(t, lo)
            mds.append((f"## {h}\n\n" if h else "") + md.strip())
        words += write_md(book, "es-ES", cid, title, "\n\n".join(mds))
        toc.append({"id": cid, "title": {"es-ES": title}})
    for name, title in extra:
        t = f"{prefix}{sep}{name}"
        if t in pages: add(slugify(name), title, [t], [None])
    for n in cap_range:
        base = f"{prefix}{sep}Capítulo {n}"
        parts = [x for x in (base, f"{base} {tail_name}") if x in pages]
        if len(parts) == 2: add(f"cap-{n:02d}", f"Capítulo {n}", parts, ["Traducción", "Exposición" if tail_name == "exposición" else "Declaración"])
        elif parts: add(f"cap-{n:02d}", f"Capítulo {n}", parts, [None])
        else: print("missing", base)
    print(book, "words", words)
    finish(book, meta, toc, rawname, "".join(raw))

def slugify(s):
    import unicodedata
    return re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()).strip("-")

job = {
 "id": "luis-exposicion-de-job", "cover": "quarter",
 "name": {"es-ES": "Exposición del libro de Job", "en-US": "Exposition of the Book of Job", "pt-BR": "Exposição do livro de Jó"},
 "description": {
  "es-ES": "El comentario más extenso de Fray Luis (terminado en 1591 y publicado en Madrid en 1779): dedicatoria a don Pedro Portocarrero y, por cada uno de los cuarenta y dos capítulos, la traducción literal del hebreo y la exposición, versículo por versículo.",
  "en-US": "Fray Luis's longest work (finished in 1591, printed in Madrid in 1779): a dedication to Don Pedro Portocarrero and, for each of the forty-two chapters, a literal translation from the Hebrew and a verse-by-verse exposition.",
  "pt-BR": "O mais extenso comentário de Frei Luís (terminado em 1591 e publicado em Madri em 1779): dedicatória a dom Pedro Portocarrero e, para cada um dos quarenta e dois capítulos, a tradução literal do hebraico e a exposição, versículo por versículo."},
 "composed": "1572–1591", "languages": ["es-ES"], "work": "luis-de-leon/exposicion-de-job",
 "editions": {"es-ES": {"editor": "es.wikisource transcription of the Madrid 1779 edition", "year": 1779}},
 "sources": [{"language": "es-ES", "url": "https://es.wikisource.org/wiki/Exposición_del_Libro_de_Job", "edition": "Exposición del Libro de Job, es.wikisource (dedicatoria and chapters 1-42, each translation page joined to its exposition page). Madrid 1779 princeps: archive.org exposiciondellibrode-jobobraposthuma.", "description": "Transcription of a public-domain edition.", "tier": "A"}],
}
cantar = {
 "id": "luis-cantar-de-los-cantares", "cover": "quarter",
 "name": {"es-ES": "Declaración del Cantar de los cantares", "en-US": "Exposition of the Song of Songs", "pt-BR": "Declaração do Cântico dos cânticos"},
 "description": {
  "es-ES": "Traducción literal del hebreo del Cantar de los cantares, con su declaración, que Fray Luis hizo en romance hacia 1561 y que le valió el proceso de la Inquisición; impresa en 1798. Prólogo, introducción y ocho capítulos.",
  "en-US": "A literal translation of the Song of Songs from the Hebrew with its commentary, made in Castilian by Fray Luis about 1561, which brought him before the Inquisition; printed in 1798. Prologue, introduction and eight chapters.",
  "pt-BR": "Tradução literal do hebraico do Cântico dos cânticos, com a sua declaração, que Frei Luís fez em romance por volta de 1561 e que lhe valeu o processo da Inquisição; impressa em 1798. Prólogo, introdução e oito capítulos."},
 "composed": "1561", "languages": ["es-ES"], "work": "luis-de-leon/cantar-de-los-cantares",
 "editions": {"es-ES": {"editor": "es.wikisource transcription of the text in BAE 37", "year": 1855}},
 "sources": [{"language": "es-ES", "url": "https://es.wikisource.org/wiki/Declaración_del_cantar_de_los_cantares", "edition": "Cantar de los cantares: Prólogo, Introducción, Capítulo 1-8 and 'declaración' pages, es.wikisource, from Obras de Fray Luis de León, BAE 37 (Madrid 1855).", "description": "Transcription of a public-domain edition.", "tier": "A"}],
}
if __name__ == "__main__":
    build("exposicion-de-job", "Exposición del Libro de Job", "/", [("Dedicatoria", "Dedicatoria")], "exposición", range(1, 43), job, "exposicion-de-job.txt")
    build("cantar-de-los-cantares", "Cantar de los cantares", ": ", [("Prologo", "Prólogo"), ("Introducción", "Introducción")], "declaración", range(1, 9), cantar, "cantar-de-los-cantares.txt")
