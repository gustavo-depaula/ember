import sys; sys.path.insert(0, "/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
import wsfetch as w
from luis_import import *
from luis_job_cantar import slugify

ORIG = [("A Felipe Ruiz", "A Felipe Ruiz"), ("A Francisco Salinas", "A Francisco Salinas"), ("Al apartamiento", "Al apartamiento"), ("Al salir de la cárcel", "Al salir de la cárcel"), ("Al salir de la prisión", "Al salir de la prisión"), ("Imitación de diversos", "Imitación de diversos"), ("Noche serena", "Noche serena"), ("Profecía del Tajo", "Profecía del Tajo"), ("Vida retirada", "Vida retirada"), ("Cuando me paro a contemplar mi vida", "Soneto: «Cuando me paro a contemplar mi vida»"), ("Preguntas de amor", "Preguntas de amor")]
buc = sorted(p for p in w.pages("La Bucólica (Fray Luis de León)/"))
geo = sorted(p for p in w.pages("Geórgicas (Fray Luis de León)/"))
print(buc, geo)
groups = [("originales", "Poesías originales", "Original poems", "Poesias originais", [(t, h) for t, h in ORIG]),
          ("bucolicas", "Traducción de las Bucólicas de Virgilio", "Translation of Virgil's Eclogues", "Tradução das Bucólicas de Virgílio", [(p, p.split("/")[-1]) for p in buc]),
          ("georgicas", "Traducción de las Geórgicas de Virgilio (libros I y II)", "Translation of Virgil's Georgics (Books I and II)", "Tradução das Geórgicas de Virgílio (livros I e II)", [(p, "Geórgica " + p.split("/")[-1]) for p in geo])]
toc, raw, words = [], [], 0
for gid, es, en, pt, items in groups:
    node = {"id": gid, "title": {"es-ES": es, "en-US": en, "pt-BR": pt}, "children": []}
    for t, title in items:
        wt = w.wikitext(t)
        raw.append(f"=== {t}\n{wt}\n---\n")
        md = w.to_md(wt)
        lo = w.leftovers(md)
        if lo: print(t, lo)
        cid = f"{gid[:3]}-{slugify(title)}"
        words += write_md("poesias", "es-ES", cid, title, md)
        node["children"].append({"id": cid, "title": {"es-ES": title}})
    toc.append(node)
print("words", words)
meta = {
 "id": "luis-poesias", "cover": "quarter",
 "name": {"es-ES": "Poesías", "en-US": "Poems", "pt-BR": "Poesias"},
 "description": {
  "es-ES": "Las odas y el soneto de Fray Luis de León que recoge Wikisource (A Felipe Ruiz, A Francisco Salinas, Noche serena, Profecía del Tajo, Vida retirada, Al salir de la cárcel…) y sus versiones de las Bucólicas y de las Geórgicas I y II de Virgilio. Primera edición de las poesías: Quevedo, 1631.",
  "en-US": "The odes and sonnet of Fray Luis de León preserved on Wikisource (To Felipe Ruiz, To Francisco Salinas, Serene Night, Prophecy of the Tagus, The Retired Life, On leaving prison…) and his translations of Virgil's Eclogues and Georgics I and II. First printed by Quevedo in 1631.",
  "pt-BR": "As odes e o soneto de Frei Luís de León reunidos na Wikisource (A Felipe Ruiz, A Francisco Salinas, Noite serena, Profecia do Tejo, Vida retirada, Ao sair do cárcere…) e as suas versões das Bucólicas e das Geórgicas I e II de Virgílio. Primeira edição das poesias: Quevedo, 1631."},
 "composed": "1550–1591", "languages": ["es-ES"], "work": "luis-de-leon/poesias",
 "editions": {"es-ES": {"editor": "es.wikisource transcription", "year": 1855}},
 "sources": [{"language": "es-ES", "url": "https://es.wikisource.org/wiki/Autor:Fray_Luis_de_León", "edition": "Individual poem pages on es.wikisource (category Poesías de Fray Luis de León, Sonetos, Bucólicas, Geórgicas), from the Obras of BAE 37 (1855).", "description": "Partial: Wikisource lacks the other odes, the Psalm paraphrases and the translations of Horace, Pindar, Petrarch and others; see PROBLEMS.md.", "tier": "A"}],
}
finish("poesias", meta, toc, "poesias.txt", "".join(raw))
