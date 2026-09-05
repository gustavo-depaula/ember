# Translation Journal — Hymns and Songs (Hinos e Cânticos) (pt-BR)

Source: la (canonical Latin, except hymns-c06 which is Italian in the `la/` folder)
Target: pt-BR

## Key Terms

| Latin / Italian | Portuguese | Notes |
|---|---|---|
| Sacramentum | Sacramento | |
| latens Deitas | Deus escondido | Adoro Te Devote, hymns-c05 |
| panis angelicus | Pão dos Anjos | |
| Genitori, Genitoque | ao Pai e ao Filho gerado | Trinitarian doxology, hymns-c01/c04-style closing |
| trina Deitas unaque | Deus uno e trino | |
| virtù (it.) | virtude | hymns-c06 |
| diletto (it.) | deleite | hymns-c06 |

## Translation Decisions

- **hymns-c01 through hymns-c05** (Pange Lingua, Sacris Solemniis, Verbum Supernum Prodiens, Lauda Sion, Adoro Te Devote): rather than producing a fresh translation, reused the existing canonical Portuguese texts already shipped in Ember's own devotional practices (`content/practices/pange-lingua`, `sacris-solemniis`, `verbum-supernum`, `lauda-sion`, `adoro-te-devote`). Those texts are stanza-for-stanza literal renderings of the same Latin originals and are already what users pray in the app — reusing them keeps the book and the practices saying the exact same thing in Portuguese, rather than shipping two competing translations of the same famous hymns. Attribution line in each chapter reads "tradução em uso nas práticas devocionais do Ember" since no single named Portuguese translator is documented for these texts (unlike the English cento translations, which are individually credited in `en-US`).
- **hymns-c06** ("Tanto ha virtù ciascun…"): this chapter's `la/` file is actually in **Italian**, not Latin — it's a sonnet only doubtfully attributed to Aquinas (per the scholarly footnote carried over from the English edition). No existing Portuguese rendering exists anywhere in the corpus, so this one was translated fresh, directly from the Italian, cross-checked against Rev. Paul Murray's English translation (`en-US/hymns-c06.md`) for interpretive accuracy. Kept the unrhymed, clause-by-clause register of the Murray translation rather than attempting a rhymed Portuguese sonnet, to preserve precision of meaning over poetic form — matching the English edition's own choice.
- Dropped the trailing `- {modern chant_*}` / `- {modern hymn_Adoro}` bullet lines present in every `la/` file. These are leftover link artifacts from the aquinas.cc source scrape (links to modern chant recordings), not part of the hymn text — the `en-US` edition already omits them, so pt-BR follows suit.
- hymns-c05's opening stanza is left unbolded (plain text) rather than wrapped in `***…***` like the opening stanzas of c01–c04. This matches the `la/hymns-c05.md` source, which (unlike `la/hymns-c01–04.md`) does not bold its own incipit — the `en-US` edition bolds it anyway, but pt-BR follows the Latin source's own formatting.
- Did not carry over the two inline textual-critical footnotes in `la/hymns-c04.md` (the BNF 1143 manuscript-variant notes on *consumitur/absumitur* and *tu nos/tuos*) or the **ten** inline critical-apparatus asides in `la/hymns-c05.md` (the *Te devote laudo, latens veritas* note plus nine shorter variant readings — *Tute*, *Sed*, *Vere*, *Mihi*, *Posset*, and the rest) — `en-US` omits these too, since they're apparatus for the Latin critical text, not part of the hymn as prayed.

## Post-Merge Review Corrections

A cross-language audit after the initial merge found four objective defects, all typographic or bibliographic, all now fixed:

- **Straight quotes → curly.** Every pre-existing file in this book (all six `en-US` and all six `la` chapters) uses curly typographic quotes exclusively; the new pt-BR files were the only ones using straight ASCII quotes. Converted `"assim se diz"` → `“assim se diz”` and `"Un 'Sonetto' attribuito a S. Tommaso,"` → `“Un ‘Sonetto’ attribuito a S. Tommaso,”` in `hymns-c06.md`, and the apostrophe in `d'Ambos` → `d’Ambos` in `hymns-c01.md`. Purely typographic — no word of any prayer text changed.
- **Italian proper name restored.** `hymns-c06.md` had translated the preposition inside an institution's own name: "Biblioteca Estense **de** Modena" → restored to "Biblioteca Estense **di** Modena", matching `en-US`.
- **Dropped date qualifier.** `hymns-c06.md` "datado de 1447" → "datado de 1447 **d.C.**", restoring the "AD" marker `en-US` carries.
- **Untranslated English left in Portuguese prose.** `hymns-c06.md` citation read "**in** *Memorie Domenicane*" → "**em** *Memorie Domenicane*".

Deliberately **not** changed — reviewers will likely flag these again, so recording the reasoning:

- The audit questioned four wordings in chapters 1–5: `o pobre, o servo e o humilde` (c02, reads Latin `pauper servus et humilis` as three subjects where `en-US` reads one), `Aleluia` appended to the close of Lauda Sion (c04), `do Salvador` expanding `et vinum in Sanguinem` (c04), `juntamente` (c03), and the European spelling `défice` (c01). Every one of these is inherited **verbatim** from the app's shipped practice manifests (`content/practices/sacris-solemniis`, `lauda-sion`, `pange-lingua`, `verbum-supernum`), verified line by line — they are received Brazilian liturgical renderings, not choices made for this book. `Amém. Aleluia.` in particular is the canonical close of the Lauda Sion sequence in the Roman Missal, even though this book's `la` recension prints only `Amen.`
- Changing them here would break the invariant this translation was built on — that the book and the practices say the same thing in Portuguese — and would silently diverge the book from the text users actually pray. If any of these should change, the fix belongs in the practice manifest first, so book and practice move together. Left for the owner's call.

## Second Post-Merge Audit — Latin Edition Defects

A second full-book cross-language audit found that the defects left in this book were not in pt-BR at all, but in the `la` edition, inherited from the original aquinas.cc scrape and never caught because no one had read the Latin files against `book.json`:

- **Every `la/*.md` H1 was in English.** All six Latin chapters opened with the *English* translated title (`# Sing, My Tongue` in `la/hymns-c01.md`, `# Each Man has Virtue` in `la/hymns-c06.md`, and so on) — the aquinas.cc page heading is the English title, and the scrape captured it verbatim. The Latin edition therefore rendered English chapter titles in the app, and `pnpm build:corpus` warned `[la] H1 drifts from TOC title` on all six. Replaced with the Latin titles from `book.json`'s `toc` (`Pange Lingua`, `Sacris Solemniis`, `Verbum Supernum Prodiens`, `Lauda Sion Salvatorem`, `Adoro Te Devote`, `Tanto ha virtù ciascun`).
- **Unresolved scrape placeholders removed from `la`.** The five `- {modern chant_*}` / `- {modern hymn_Adoro}` bullets documented above as "dropped in the translations" were still sitting in the `la` files themselves, where they render as literal brace-text to anyone reading the Latin. Removed. (The translations were right to drop them; the source should never have kept them.)
- **`en-US/hymns-c01.md`: "pascal victim" → "paschal victim."** Caswall's translation reads *Paschal*; `pascal` is a different word.
- **`la/hymns-c06.md` Italian orthography.** The sonnet's first line read `Tanto ha virtu ciascun` without the grave accent, contradicting both the very next line (`quanto in virtù si stende`) and `book.json`'s own `la` title for the chapter. Restored `virtù`. Also fixed a wrong-direction quote used as an elision apostrophe: `ha ‘llhor` → `ha ’llhor` (every other elision in the sonnet — `l’intende`, `d’honor`, `ch’esser` — already uses the right single quote).
- **`pt-BR/hymns-c06.md`** got the two-space hard break at the end of its bibliographic parenthetical that `en-US` carries, for line-break convention consistency.
- **Translator's name misspelled.** `en-US/hymns-c01.md` credited "Rev. Edward **Caswell**"; the Oratorian hymn translator (1814–1878) is Edward **Caswall**. The app's own practice manifests (`content/practices/pange-lingua`, `verbum-supernum`) already spell it correctly, so the book was the outlier. (Left alone: `content/books/catholic-encyclopedia/en-US/11272a.md` carries the same misspelling, but that book is a faithful reproduction of the 1913 text and shouldn't be silently emended.)

Note for future audits: the `la/` folder is a *scrape*, not a hand-set edition, and it is the least-reviewed part of this book. Check it against `book.json` and against the `en-US`/pt-BR files rather than assuming the canonical-source file is canonical-quality.

## Chapter Titles (book.json toc, pt-BR)

Each title pairs the Latin/Italian name with a Portuguese rendering of the opening line, matching the `en-US` pattern of "Latin Name (English Incipit Translation)":

- hymns-c01: Pange Lingua (Canta, ó Língua)
- hymns-c02: Sacris Solemniis (Junte-se a Alegria a Esta Sagrada Festa)
- hymns-c03: Verbum Supernum Prodiens (O Verbo Supremo que Procede)
- hymns-c04: Lauda Sion (Louva, ó Sião)
- hymns-c05: Adoro Te Devote (Eu Vos Adoro com Devoção)
- hymns-c06: Soneto atribuído a Aquino ("Cada Homem Tem Tanta Virtude")
