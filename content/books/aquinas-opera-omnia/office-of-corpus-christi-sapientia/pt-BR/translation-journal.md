# Translation Journal — Office of Corpus Christi (Sapientia aedificavit, early draft) (pt-BR)

Source: la (canonical — Leonine/Marietti text mirrored from aquinas.cc)
Target: pt-BR
Cross-checked against: en-US (aquinas.cc translation), for interpretive confirmation only — never used as the base text.

## Why Latin, not English, as source

This book carries a genuine parallel Latin original (`la/`), unlike most translated
books in this corpus where en-US is itself the canonical source. Per the
translate-book philosophy ("never translate from another translation"), pt-BR is
translated directly from the Latin liturgical/patristic text. The existing en-US
translation was read chapter-by-chapter alongside the Latin to confirm difficult
constructions (e.g. the Ambrose/Gratian typological readings in Matins), but no
English wording was carried over mechanically.

## Key Terms

| Latin | Portuguese | Notes |
|-------|------------|-------|
| Vesperae (primae/secundae) | Vésperas (Primeiras/Segundas) | |
| Matutinum | Matinas | |
| Laudes | Laudes | unchanged, already feminine plural in Portuguese |
| Prima / Tertia / Sexta / Nona | Prima / Tércia / Sexta / Noa | traditional Portuguese Hour names |
| Nocturnus | Noturno | "In primo nocturno" → "No primeiro noturno" |
| Invitatorium | Invitatório | |
| Antiphona | Antífona | |
| Psalmus | Salmo | dual Vulgate/Hebrew numbering kept, e.g. "Salmo 109 (110)", matching the en-US edition's reader aid (not present in the bare Latin, which numbers only by Vulgate) |
| Capitulum | Capítula | the short liturgical reading at Lauds/Vespers/Little Hours — traditional Portuguese breviary term, distinct from "Leitura" (Matins reading) |
| Lectio | Leitura | Matins readings ("Lectio prima" → "Leitura 1") |
| Responsorium | Responsório | |
| Versiculus | Versículo | header; the sung couplet itself keeps ℣./℟. glyphs |
| Evangelium | Evangelho | |
| Hymnus | Hino | |
| Benedicite | Benedicite | canticle name, kept untranslated (traditional incipit), as en-US does |
| Benedictus / Magnificat | Benedictus / Magnificat | canticle names, kept untranslated |
| alleluia | aleluia | |
| ℟. / ℣. | ℟. / ℣. | kept as-is, standard liturgical glyphs |

## Translation Decisions

- 2026-09-03: Book selected because it is a small, fully self-contained catalog
  entry (`aquinas-office-corpus-christi-sapientia`, 8 chapters, ~10,400 words in
  en-US) with `la` + `en-US` but no `pt-BR`, found while auditing `content/books/`
  for monolingual works.
- **Scripture references**: kept in the book's existing bracket-citation format
  (`[Book chapter:verse]`), matching this book's own en-US convention, but with
  book names localized to standard Portuguese (Provérbios, Gênesis, Êxodo,
  Salmos, Eclesiástico/Sirácida, Isaías, Oséias, Zacarias, Cântico dos Cânticos,
  Juízes, 1 Samuel, Mateus, Marcos, Lucas, João, Romanos, 1 Coríntios, Hebreus,
  Apocalipse, Daniel), following the localization precedent set in the
  `church-fathers/ignatius/*` pt-BR translations (`Gálatas 1:1`, `2 Timóteo 3:6`).
- **Hymns** (*Pange lingua gloriosi*, *Sacris solemniis*, *Verbum supernum*):
  translated as plain, meaning-preserving prose, matching the en-US edition's own
  approach (a literal rendering, not a rhymed/metrical hymn version). No attempt
  was made to reproduce or approximate any specific published Portuguese
  liturgical hymnal text — a citation to a specific hymnal could not be verified,
  and a fabricated one would be worse than a fresh, faithful prose translation.
- **Psalm incipits**: every "Psalmus N … etc." line quotes only the first verse
  in the Latin manuscript. Translated that one verse plus "etc.", matching the
  editorial convention already used throughout the en-US edition (which also
  quotes only the incipit).
- **Manuscript apparatus dropped**: image/illumination placeholder markers in the
  Latin source (`{image-207}`, `{image-201}`, etc. — references to the Strahov
  manuscript's illuminations) are not textual content and were dropped, exactly
  as the en-US edition already does.
- **Editorial/manuscript notes kept**: two English-only parenthetical notes from
  the modern editor (Corrigan) — the note on Ch. 4's antiphon citation and the
  note on Second Vespers being "written by a different hand … much of what
  follows is conjectural," plus the note on the uncertain responsory music in
  Ch. 8 — are genuine textual-critical information about this specific edition,
  not scholarly apparatus explaining a term, so they were kept and translated
  (in italics, as in en-US), unlike ordinary editor footnotes which the
  translate-book default is to drop.
- **`haedum` (Ch. 1 / Ch. 2 Third Nocturn / Ch. 11's responsory) → "cabrito" (kid
  goat), not "cordeiro" (lamb)**. The en-US edition renders this antiphon "kill
  the lamb," but the Latin word is specifically *haedus* (young goat), distinct
  from *agnus* (lamb) used elsewhere in this same office (e.g. the Matins hymn's
  "Christus creditur agnum et azyma dedisse"). Exodus 12:5 permits either a lamb
  or a goat for the Passover victim, and this office's compiler specifically
  chose the goat reading — translating from the Latin (not the English) surfaced
  this and it was corrected rather than reproduced.
- **Lauds chapter (Ch. 3) has no scripture citation in the Latin** — the en-US
  edition adds "***Hebrews 5:11***", but the quoted text ("Every priest chosen
  from among men…") is Hebrews 5:1, not 5:11. Added the citation "Hebreus 5:1"
  (correct verse) as a translator's editorial addition, rather than reproducing
  the en-US edition's apparent citation error.
- **"Tu autem" dropped** at the end of Matins Reading 4 — a rubric telling the
  reader to finish the versicle quietly, not part of the text proper (parallel
  to how the en-US edition silently omits it too).
- **Address register**: this is liturgical/devotional prose (collects, homiletic
  readings), not a letter to a "you" congregation, so no plural/singular "vós"
  address decision was needed except in the direct-address collect and hymn
  refrains ("Te … poscimus" → "A vós … suplicamnos", "da robur" → "dai-nos
  força") and the Ch. 1 collect ("tribue, quaesumus" → "concedei-nos, Vos
  pedimos"), where **"vós"** was used throughout, consistent with the formal
  register of the corpus's other translated collects and liturgical texts.
- **Reused antiphons/responsories translated once, then copied verbatim** at
  every recurrence, to guarantee word-for-word consistency across chapters (the
  Latin manuscript itself reuses these blocks across Vespers/Nocturns/Little
  Hours, and several are explicitly marked "as in First Vespers" etc.):
  - Ch. 1's Responsory ("Cumque operuisset ros…", Exod 16:14–15) = Ch. 2's final
    responsory (end of Reading 12), explicitly marked in the Latin as a reuse.
  - Ch. 2 Third Nocturn's responsory after Reading 7 ("Ego sum panis vitae…",
    John 6:48–51) = Ch. 8's Second Vespers responsory, explicitly marked in the
    Latin as a reuse ("use image for 1st Responsory in 3rd Nocturn").
  - Ch. 3's five Lauds antiphons reappear verbatim as the antiphons of Prime
    (Ch. 4), Terce (Ch. 5), Sext (Ch. 6), and None (Ch. 7).
  - Ch. 1's capitulum (1 Cor 11:23–24) and Ch. 5's Terce capitulum quote the same
    verse from slightly different Latin manuscript wording ("Dominus Iesus
    Christus" vs. "Dominus Iesus"); each was translated from its own line, and
    they came out effectively identical in Portuguese, which is expected and
    correct — both are the same verse.
- 2026-09-03 — translation of all 8 chapters completed in a single pass, given
  the size of the work (~10,400 words). Review rounds documented in
  `docs/journal.md`, not repeated here.
