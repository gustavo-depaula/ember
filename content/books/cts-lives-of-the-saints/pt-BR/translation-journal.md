# Translation Journal — Lives of the Saints (CTS) (pt-BR)

Source: en-US
Target: pt-BR

75 short authored saint biographies from the Catholic Truth Society pamphlet
series. Each chapter is by a different author (or anonymous), so tone varies
chapter to chapter — some devotional and warm, some scholarly, some brisk
narrative. Translate each chapter's own register; don't flatten them into one
house style.

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| Saint / St. | São / Santo / Santa | `São` before a consonant, `Santo` before a vowel (Santo Antônio, Santo Agostinho), `Santa` for women. Match the app's existing convention from `butler-lives-of-saints`. |
| Blessed (Beatus, not-yet-canonized) | Beato / Beata | |
| Confessor | Confessor | |
| Martyr | Mártir | |
| Virgin | Virgem | |
| Abbot / Abbess | Abade / Abadessa | |
| Bishop | Bispo | |
| Pope | Papa | |
| the Blessed Virgin / Our Lady | a Santíssima Virgem / Nossa Senhora | |
| Our Lord | Nosso Senhor | |
| the Church | a Igreja | |
| grace | graça | |
| soul | alma | |
| holiness | santidade | |
| devotion | devoção | |
| feast day | dia de festa / festa | |
| religious order | ordem religiosa | |
| novice / novitiate | noviço / noviciado | |
| vows | votos | |
| convent / monastery | convento / mosteiro | mosteiro for monastic houses (Benedictine, etc.), convento for friars/religious houses generally — follow source usage |
| canonization / canonized | canonização / canonizado | |
| relics | relíquias | |
| shrine | santuário | |
| pilgrimage | peregrinação | |
| indulgence | indulgência | |
| Eucharist / Blessed Sacrament | Eucaristia / Santíssimo Sacramento | |
| miracle | milagre | |
| stigmata | estigmas | |

| lay-brother / Coadjutor Brother | irmão leigo / Irmão Coadjutor | |
| Clerks/Clerics Regular | Clérigos Regulares | Theatines, Camillians |
| Theatines | Teatinos | |
| Doctor of the Church | Doutor da Igreja | |
| taumaturgo/a (wonder-worker, thaumaturgus) | taumaturgo / taumaturga | recurring epithet across many chapters |
| bilocation | bilocação | |
| Sodality | Sodalidade | |
| Third Order / Tertiary | Terceira Ordem / Terciário, Terciária | |
| Salesian(s) | Salesiano(s) | |
| the Society of Jesus / Jesuits | a Companhia de Jesus / jesuítas | not "Sociedade de Jesus" |
| Servite(s) (Order of the Servants of Mary) | Servita(s) / Ordem dos Servos de Maria | |
| Passionist(s) | Passionista(s) | |
| Oblates of Mary Immaculate | Oblatos de Maria Imaculada | |
| Daughters of Charity | Filhas da Caridade | |
| Daughters of Mary, Help of Christians | Filhas de Maria Auxiliadora | |
| recusant (Elizabethan legal term) | recusante | |
| Landgrave | Landgrave (kept untranslated) | no standard PT equivalent; kept as a foreign title |
| viaticum | Viático | |
| discalced / barefoot (Carmelites) | descalço(a) | |
| foundations (Teresa of Ávila's convents) | fundações | matches her own book title *Fundações* |

## Translation Decisions

- 2026-09-06: Seeded journal before batch translation. Saints' names rendered
  in their standard Portuguese liturgical form (e.g. "St. Francis Xavier" →
  "São Francisco Xavier", "St. Teresa of Avila" → "Santa Teresa d'Ávila" /
  "Santa Teresa de Ávila" — confirm per-chapter which spelling the source
  itself favors and keep it consistent within that chapter).
- **Front matter (Nihil Obstat / Imprimi Potest / Imprimatur) is KEPT, not
  dropped.** These CTS pamphlets end with the original censor/bishop
  approbation lines — that's the pamphlet's own historical front matter, not
  a later editor's scholarly apparatus, so it's translated and kept at the
  end of every chapter that has it in the source (Latin formulas Nihil
  Obstat/Imprimi Potest/Imprimatur stay untranslated; "Censor Deputatus" →
  "Censor Deputado", "Diocesan Censor" → "Censor Diocesano", "Archbishop of
  Melbourne" → "Arcebispo de Melbourne"; personal names, dates, and any OCR
  typos already in the source are kept as-is). *(Note: an earlier draft of
  this journal said the opposite — several batches dropped these blocks
  before this line was corrected; all 8 affected chapters — mary-mckillop,
  saint-gertrude, saint-jean-b-m-vianney-cure-of-ars-1785-1859,
  saint-john-francis-regis, saint-martin-of-tours, saint-mary-magdalen,
  saint-mary-mazzarello, saint-patrick — have had the block restored to match
  this policy.)*
- Genuine author footnotes (source citations, the author's own asides) are
  kept and translated as markdown footnotes; only later scholarly/editorial
  apparatus would be dropped, and none of that turned up in this book — every
  chapter is a single author's own pamphlet text.
- **Distances in miles**: several chapters (e.g. saint-joseph-cafasso,
  saint-margaret-mary-alacoque, saint-louise-de-marillac,
  saint-margaret-of-cortona, saint-stanislaus-kostka, and others) were
  translated with mile figures converted to approximate metric km for a
  Brazilian reader. This was an unplanned, independent choice made by several
  translating agents (not a house policy), so it's inconsistent with chapters
  that may have kept miles as "milhas" instead. **Resolved in review round 1**:
  every "quilômetro(s)" conversion in the book was checked against the
  source miles; all were arithmetically sound except one ("two thousand
  miles" → wrongly "dois mil quilômetros" in `saint-francis-xavier-s-j.md`,
  fixed to "cerca de três mil e duzentos quilômetros"). Decision: keep the
  metric conversions as-is (reverting ~40 instances across 23 files to
  miles would be a much larger, riskier edit than the value it adds) —
  future translators/reviewers of this book should treat "convert miles to
  km" as the book's convention going forward, for consistency.

## Review Log

- **Round 1** (8 parallel agents, full book, en-US vs pt-BR): found and fixed
  ~28 objective defects — 2 more chapters missing their closing Imprimatur
  block (`padre-pio.md`, `saint-mary-euphrasia-pelletier.md`, beyond the 8
  already fixed pre-review), several grammar/gender-agreement slips, a few
  untranslated/leftover English or Spanish-shaped words, one dropped-vs-
  invented historical name (`saint-martin-of-tours.md`'s "Constantine II"
  restored to match the source instead of the translator's unrequested
  "Constantius II" substitution), one duration mistranslation ("eight
  years" → wrongly "eight weeks" in
  `the-life-of-saint-john-berchmans-s-j.md`), one sense inversion
  (`saint-philomena.md`), a saint-gender mismatch ("São Fé" → "Santa Fé" in
  `poet-priest-martyr.md`), a torture-device mistranslation ("a roda" →
  "o cavalete" in `saint-edmund-campion.md`), and the one unit-conversion
  math error noted above. All fixes applied same round; `pnpm build:corpus`
  re-verified after.
- **Round 2** (8 parallel agents, full book, re-checking round-1 fixes plus a
  fresh pass): found and fixed ~20 more defects, smaller than round 1's —
  mostly a leftover third "a roda" instance in `saint-edmund-campion.md` the
  round-1 fix missed, obsolete pre-1990-orthography "ungüento" (→ "unguento")
  in `saint-clare-of-assisi.md`, a couple of gender/agreement slips, two
  more unit-conversion touch-ups (a yards→meters rounding in
  `saint-dominic-savio.md`, a mile→km consistency fix in
  `the-mothers-saint.md`), a name-epithet error ("Giraldo de Cambrai" →
  "Giraldo de Gales", since Giraldus Cambrensis means "of Wales", not
  "of Cambrai" — `saint-patrick.md`), a numeric exaggeration ("thousands"
  inflated to "hundreds of thousands" — `saint-pius-x.md`), a dropped Latin
  incipit rendered as vernacular instead of kept in Latin
  (`saint-margaret-of-cortona.md`), two orphaned footnote markers restored
  (`the-martyrdom-of-saint-perpetua-and-felicitas-with-their-companions.md`),
  and a few smaller consistency nits (São/Santo agreement, a duplicated
  "editor", an untranslated "liege", a French place name half-translated).
  Not yet a clean round — proceeding to round 3.
- **Round 3** (8 parallel agents, full book, final verification pass):
  found and fixed ~10 more small defects — mostly gender/number-agreement
  slips (a feminine noun "grade" paired with masculine articles in
  `saint-edmund-campion.md`; "voto(s) algum" in `eugene-de-mazenod.md`;
  "outras membros" in `the-adventurous-nun.md`; subject-verb agreement in
  `saint-maximilian-kolbe.md`), one theological sense inversion ("ordained
  *by* men" instead of "ordained *for/on behalf of* men", an allusion to
  Hebrews 5:1, in `saint-john-fisher.md`), one word-choice mistranslation
  ("Arca da Bíblia" for "Armory of the Bible" — an armory/arsenal, not an
  ark — in `the-life-of-saint-anthony.md`), a dangling-subject sentence
  rewritten for clarity (`saint-edith-stein.md`), and a misread Roman
  numeral citation ("ii" as "11") in `saint-teresa-of-avila.md`. Two agent
  findings this round did not hold up under direct verification and were
  NOT acted on (a claimed "Chiana"/"Chiano" inconsistency in
  `saint-margaret-of-cortona.md` — the file was already fully consistent;
  a claimed capitalization slip in `saint-mary-euphrasia-pelletier.md` —
  the quoted phrase didn't exist in the file at all) — a reminder that
  review-agent reports should be spot-checked against the actual file
  before fixing, not applied blindly. Not yet a clean round — proceeding
  to round 4.
- **Period racial/political language** (e.g. "the-adventurous-nun.md"'s
  quoted period slurs about a missionary sister who worked among enslaved and
  formerly enslaved people, "the-dauntless-virgin-of-siena.md"'s Cold-War-era
  "Red barbarian" framing) was kept, in quotation marks, matching the
  source authors' own critical/period usage rather than silently sanitized —
  consistent with "modernize only when the original would be confusing or
  offensive," since here the offensive terms are being quoted and criticized
  by the source, not endorsed narratorially.
- St. Dymphna's name rendered "Santa Dympna" in `saint-dymphna.md` (dropping
  the silent 'h', matching common PT-BR hagiographic spelling).
- `saint-rita.md`: corrected a name that would be an easy mistranslation —
  the source's "St. James della Marca" (San Giacomo della Marca, a distinct
  Franciscan) is NOT St. Didacus/Diego of Alcalá; rendered "São Tiago da
  Marca," keeping the two saints distinct.
- `mary-mckillop.md`: the English source itself spells the saint's surname
  inconsistently ("MacKillop" in the title, "McKillop" in body text) — this
  inconsistency was preserved as in the source rather than silently
  normalized to one spelling.
- Several OCR-era artifacts in the English source (garbled line breaks,
  duplicated clauses, a dangling footnote marker with no footnote text in
  `saint-patrick.md`, a probably-mistyped Imprimatur date in
  `saint-pius-x.md`) were resolved silently where they were obvious
  transcription noise (not content), and left as-is (not invented/corrected)
  where the intended reading was genuinely ambiguous.
