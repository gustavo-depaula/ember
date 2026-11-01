# Sourcing brief: complete works of Catholic authors for the Ember corpus

Ember is a Catholic prayer app and an open library of the Catholic literary tradition. Its corpus (`content/books/` in this repo) holds books as one markdown file per chapter, per language: the **original-language text is the canonical source** (`la/`, `fr-FR/`, `it/`, …), a **public-domain English translation** sits beside it (`en-US/`), and our own pipeline translates into Brazilian Portuguese (`pt-BR/`). An author comes in **complete** (see `aquinas-opera-omnia/`, `denis-opera-omnia/`, `church-fathers/augustine/`), not only the famous works. `_corpus-books.txt` here lists what the corpus already holds; the import procedure is `.claude/skills/import-book/SKILL.md`.

This step is research only: find, verify and document sources. Write nothing under `content/`.

## What to find, per author

1. **The complete works**: every work the author wrote (treatises, letters, sermons, poems, minor works), from a reliable bibliography (a critical edition's table of contents, an authoritative catalogue). Note doubtful/spurious attributions as such.
2. For **each work**:
   - **Original-language digital text**: the best source of clean text (HTML or plain text, not page scans): Wikisource, thelatinlibrary.com, documentacatholicaomnia.eu, augustinus.it, corpusthomisticum.org, Gallica text mode, Biblioteca Virtual Miguel de Cervantes, liberliber.it, intratext.com, archive.org full-text (`_djvu.txt`, note OCR quality), etc. Open the page and confirm the text is actually there and complete; give the exact URL(s) and the edition it transcribes.
   - **English translation**: the best one we may use, with translator, year and source URL (CCEL, Gutenberg, newadvent, sacred-texts, archive.org full text, order/society websites…).
   - **Copyright tier** of each text, with the evidence:
     - **A**: public domain (published 1930 or earlier, or author/translator dead 70+ years).
     - **B**: free in practice: freely distributed on the internet with no one claiming it; given away openly by the author, translator or religious order (no "all rights reserved", no licence terms); or a US publication of 1931–1963 never renewed. Quote what the hosting page says.
     - **C**: actively sold or licensed by a publisher (e.g. ICS Publications, Paulist Classics of Western Spirituality, Libreria Editrice Vaticana, Tanner's councils, Peers' translations from Burns & Oates/Sheed & Ward): unusable; say so and look for an alternative.
   - **Size**: word count estimate (count it when the text is online; otherwise estimate and say so).
   - **Structure**: the author's own divisions (books, chapters, letters, sermons) as a chapter split would follow them; footnotes/apparatus present.
3. **Already in the corpus?** Check `_corpus-books.txt` and `content/books/` so nothing is imported twice; note works present only in English that the original would complete.

**Several sources per work.** For every work, list every usable source you find, not one: several original-language texts (different sites and editions) and several English translations, each with its URL, edition/translator, tier, completeness and text quality, ranked best first with a line on why. A second and third source are what we cross-check OCR and transcription errors against, and fall back to when the first fails.

**Portuguese too.** For each work, also list every Portuguese translation you can find (Brazilian or European), ranked the same way, with translator, year, URL, tier and text quality: Domínio Público (dominiopublico.gov.br), pt.wikisource, Biblioteca Nacional Digital (bndigital.bn.gov.br), Biblioteca Nacional de Portugal (purl.pt), archive.org, Google Books full view, Catholic sites (Permanência, Obras Católicas, Montfort Associação Cultural, mosteiros, ordens) and the orders' own Brazilian publishers. These serve as a reference for our pt-BR translation and may be imported where good. Put them in a `## Portuguese` section of the report.

**Requests carry no personal data.** Every web request uses a generic User-Agent (`EmberCorpusResearch/1.0`); never put the user's email, name or any other personal detail in a header, URL or payload, even where a site's policy asks for contact details.

## Output

Write `research/sourcing/<slug>.md` (one file per author; `<slug>` like `teresa-of-avila`). Start with a summary table:

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |

then notes per work (structure, quirks, OCR quality, gaps), then **a recommendation**: the corpus layout (e.g. `teresa-opera-omnia/<work>`), what to import first, and anything that cannot be sourced cleanly (scans only, tier C only). End with the total size.

Keep raw downloads, if you make any to measure, inside `research/sourcing/<slug>/` (not /tmp). Be honest about uncertainty: a tier you could not confirm is "unverified", not A.
