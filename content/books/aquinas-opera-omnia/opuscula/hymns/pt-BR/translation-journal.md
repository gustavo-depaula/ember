# Translation Journal — Hymns and Songs (Hinos e Cânticos) (pt-BR)

Source: la (canonical Latin, except hymns-c06 which is Italian in the `la/` folder)
Target: pt-BR

## Key Terms

| Latin / Italian | Portuguese | Notes |
|---|---|---|
| Sacramentum | Sacramento | |
| latens Deitas | Deus escondido | Adoro Te Devote, hymns-c05 |
| panis angelicus | Pão dos Anjos | |
| Genitori, Genitoque | ao Pai e ao Filho gerado | Trinitarian doxology, hymns-c01's closing stanza |
| trina Deitas unaque | Deus uno e trino | |
| virtù (it.) | virtude | hymns-c06 |
| diletto (it.) | deleite | hymns-c06 |

## Translation Decisions

- **hymns-c01 through hymns-c05** (Pange Lingua, Sacris Solemniis, Verbum Supernum Prodiens, Lauda Sion, Adoro Te Devote): rather than producing a fresh translation, reused the existing canonical Portuguese texts already shipped in Ember's own devotional practices (`content/practices/pange-lingua`, `sacris-solemniis`, `verbum-supernum`, `lauda-sion`, `adoro-te-devote`). Those texts are stanza-for-stanza literal renderings of the same Latin originals and are already what users pray in the app — reusing them keeps the book and the practices saying the exact same thing in Portuguese, rather than shipping two competing translations of the same famous hymns. Attribution line in each chapter reads "tradução em uso nas práticas devocionais do Ember" since no single named Portuguese translator is documented for these texts (unlike the English cento translations, which are individually credited in `en-US`).
- **hymns-c06** ("Tanto ha virtù ciascun…"): this chapter's `la/` file is actually in **Italian**, not Latin — it's a sonnet only doubtfully attributed to Aquinas (per the scholarly footnote carried over from the English edition). No existing Portuguese rendering exists anywhere in the corpus, so this one was translated fresh, directly from the Italian, cross-checked against Rev. Paul Murray's English translation (`en-US/hymns-c06.md`) for interpretive accuracy. Kept the unrhymed, clause-by-clause register of the Murray translation rather than attempting a rhymed Portuguese sonnet, to preserve precision of meaning over poetic form — matching the English edition's own choice.
- Dropped the trailing `- {modern chant_*}` / `- {modern hymn_Adoro}` bullet lines present in every `la/` file. These are leftover link artifacts from the aquinas.cc source scrape (links to modern chant recordings), not part of the hymn text — the `en-US` edition already omits them, so pt-BR follows suit.
- hymns-c05's opening stanza is left unbolded (plain text) rather than wrapped in `***…***` like the opening stanzas of c01–c04. This matches the `la/hymns-c05.md` source, which (unlike `la/hymns-c01–04.md`) does not bold its own incipit — the `en-US` edition bolds it anyway, but pt-BR follows the Latin source's own formatting.
- Did not carry over the two inline textual-critical footnotes in `la/hymns-c04.md` (the BNF 1143 manuscript-variant notes on *consumitur/absumitur* and *tu nos/tuos*) or the textual-variant note in `la/hymns-c05.md` (*Te devote laudo, latens veritas*) — `en-US` omits these too, since they're apparatus for the Latin critical text, not part of the hymn as prayed.

## Post-Merge Audit Fixes

An independent adversarial review after the initial merge (see the project journal's caution that a few clean review rounds is a weak signal on its own) found and fixed two real defects:

- **hymns-c04** originally ended "…dos santos cidadãos. Amém. Aleluia." — copied verbatim from `content/practices/lauda-sion/manifest.json`, whose own `la`/`en-US` texts *do* end with "Amen. Alleluia." But this book's own `la/hymns-c04.md` and `en-US/hymns-c04.md` end at "Amen."/"Amen." with no Alleluia — a pre-existing discrepancy between the book edition and the practice edition of the same sequence. Dropped "Aleluia" from pt-BR to stay internally consistent with this book's own sibling-language files, rather than carrying over a difference that belongs to the practice, not the book.
- **hymns-c06**'s footnote used straight ASCII quotes (`"…"`) where `en-US/hymns-c06.md` and the rest of the pt-BR corpus use typographic quotes (`“…”`). Fixed to curly quotes.

Two additional issues were flagged but left as-is, since they're inherited verbatim from the shipped practice content this book's pt-BR reuses (not introduced by this translation) and fixing them would mean editing what users already pray in the app — out of scope for a book translation:
- `hymns-c01.md`: "défice" (European Portuguese) rather than "déficit" (standard Brazilian Portuguese), from `practices/pange-lingua`.
- `hymns-c03.md`: "…na pátria, juntamente. Amém." — "juntamente" has no counterpart in the Latin ("in patria"), from `practices/verbum-supernum`.

If `practices/pange-lingua` or `practices/verbum-supernum` are ever revised, this book's pt-BR chapters 1 and 3 should be updated to match.

## Chapter Titles (book.json toc, pt-BR)

Each title pairs the Latin/Italian name with a Portuguese rendering of the opening line, matching the `en-US` pattern of "Latin Name (English Incipit Translation)":

- hymns-c01: Pange Lingua (Canta, ó Língua)
- hymns-c02: Sacris Solemniis (Junte-se a Alegria a Esta Sagrada Festa)
- hymns-c03: Verbum Supernum Prodiens (O Verbo Supremo que Procede)
- hymns-c04: Lauda Sion (Louva, ó Sião)
- hymns-c05: Adoro Te Devote (Eu Vos Adoro com Devoção)
- hymns-c06: Soneto atribuído a Aquino ("Cada Homem Tem Tanta Virtude")
