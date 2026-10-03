# Translation Journal — Gospel of the Nativity of Mary (pt-BR)

Source: en-US (Alexander Walker translation, Ante-Nicene Fathers Vol. 8, New Advent edition). The book has no `la/` directory; en-US is its only language.
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Gospel of the Nativity of Mary (unknown date; late) | Evangelho da Natividade de Maria (data desconhecida; tardio) | "data desconhecida" as in `doctrine-of-the-apostles`. |
| Apocrypha (author field) | Apócrifos | As in `protoevangelium-of-james` and `assumption-of-mary`. |
| Joachim / Anna / Mary / Joseph | Joaquim / Ana / Maria / José | As in the Protoevangelium. |
| Issachar (high priest) | Issacar | Standard pt-BR biblical form. |
| Sarah / Isaac / Rachel / Jacob / Samson / Samuel / Jesse | Sara / Isaac / Raquel / Jacó / Sansão / Samuel / Jessé | *Isaac* as in `assumption-of-mary`. |
| ever-virgin Mary | sempre Virgem Maria | As in `assumption-of-mary`. |
| the virgin of the Lord | a virgem do Senhor | Lowercase "virgem" when the source lowercases it. |
| Golden gate | Porta Dourada | Ch. 4 explains the name ("é chamada Dourada"). |
| Psalms of Degrees | Salmos dos Degraus | Keeps the pun with the fifteen *degraus* (steps). |
| altar of burnt-offering | altar dos holocaustos | |
| oracle / mercy-seat | oráculo / propiciatório | |
| rod (Isaiah 11:1; suitors' rods) | vara | One word for both, so the prophecy and the sign match. |
| betrothed / espoused | prometida em noivado / desposada | |
| lust | concupiscência | |
| intercourse with man | união com homem | |
| conception (of the Lord) | conceição | |
| Hail, Mary! … the Lord is with you | Ave, Maria! … o Senhor é contigo | |
| hand-maiden | serva | As in the Protoevangelium. |
| from everlasting to everlasting | de eternidade em eternidade | |

## Translation Decisions

- **Address.** Human and angelic speakers use *tu* to one person, as in the sibling apocrypha. Ch. 3 "as you have vowed" → "como fizestes voto" (plural), because in Ch. 1 both parents made the vow. The source's stray archaic "wilt" (Ch. 9) is flattened to *tu* forms.
- **Divine pronouns** are capitalized where the source capitalizes them (Ele, Seu, Lhe); lowercase where the source has no capitalized pronoun ("te cobrirá com a sua sombra" for "shall overshadow you"; "só ele … será chamado Filho de Deus" for the source's lowercase "it").
- **Inline Scripture references** (New Advent apparatus) are kept in place with pt-BR book names and the source's colon format (`Atos 10:4`, `Isaías 11:1-2`, `Lucas 1:26-38`, `Apocalipse 19:16`, `Mateus 1:18-24`), as in the sibling apocrypha.
- **Scripture echoes** are rendered from the source's wording, not harmonized to a Portuguese Bible: Ch. 7 Isaiah 11:1-2 keeps Walker's "spirit of wisdom and piety" (wisdom twice) as "sabedoria e de piedade"; Ch. 7 "Vow and pay" → "Fazei votos e cumpri-os"; Ch. 2 "Cursed is every one who has not begot a male or a female in Israel" → "Maldito todo aquele que não gerou varão ou mulher em Israel".
- **Ch. 10 closing doxology** "who with the Father and the Son and the Holy Ghost lives and reigns" is mirrored as printed, although it names the Son beside Christ. It is the edition's reading, not an OCR slip.
- **Unnumbered paragraph after Ch. 9** (the author's aside about omitting what the Gospel narrates) is kept as its own paragraph.
- **Punctuation.** The source's em-dash asides become spaced em dashes.
- **Footnotes.** The source carries none. No translator notes added.
- **Source edits.** None.

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (12 ↔ 12), plus Scripture book names and chapter:verse. Mechanical audit and `book.json` also checked. Verdict: clean, no changes.

Rejected findings:
- Ch. 3 "an angel of the Lord stood by him in a great light" → "apareceu-lhe numa grande luz". Loses the posture of "stood by" but says nothing the source doesn't. The next sentence's "at his appearance" ("com a sua aparição") supports it. A style choice.
- Ch. 3 "believe in fact that conceptions very late in life …" → "crê pelo menos no fato de que …". "pelo menos" spells out the contrast the source sets up: if my words don't persuade you, then believe the facts. It adds no content.
- Ch. 7 "upon the end of whose rod the Spirit … should settle" → "sobre cuja ponta da vara o Espírito … pousasse". "Sobre a ponta de cuja vara" would be more polished, but the current wording reads correctly ("cuja" governs "ponta da vara") and keeps the meaning. Not a grammar defect.

Evidence: `ember-translation-evidence/church-fathers__apocrypha__gospel-of-the-nativity-of-mary/review-1.md`.

### Round 2

Focus: a clause-by-clause bilingual fidelity read of the whole text, plus the mechanical audit, `book.json`, and the journal's sibling-book claims. Verdict: clean, no changes.

Rejected findings:
- Ch. 10 "that which is begotten in her" → "o que nela foi gerado". The English means "has been begotten", which is what the past tense says. Not a tense error.
- Ch. 9 "For while, according to my vow, I never know man" → "Pois, se, segundo o meu voto, nunca conheço homem". "se" carries the "given that" sense of "while". Not a mistranslation.
- Ch. 3 "barren up to her eightieth year" → "estéril até os oitenta anos". In ordinary usage the two count the same way. Not a number error.
- Ch. 3 "even from her mother's womb" → "desde o ventre de sua mãe". The dropped "even" is emphasis only and adds no content. A style choice.

Evidence: `ember-translation-evidence/church-fathers__apocrypha__gospel-of-the-nativity-of-mary/review-2.md`.

### Round 3

Focus: a source-blind cold read of the pt-BR, with each mark then checked against the source, followed by a spelling-only sweep (diacritics, crase, hyphenation, punctuation). Mechanical audit and `book.json` also checked. Verdict: clean, no changes.

Rejected findings:
- Ch. 3 "For was it not the case that the first mother of your nation— Sarah— was barren" → "Pois não foi assim que a primeira mãe da tua nação — Sara — foi estéril". A grammatical rhetorical question that keeps the source's meaning. Not a grammar defect.
- Ch. 7 "publicly announced that the virgins who were publicly settled" → "anunciou publicamente … publicamente estabelecidas". The repetition is in the source.
- Ch. 7 "he predicted that all of the house and family of David …" → "ele predisse que todos …". The odd verb is the source's. Mirrored, not a mistranslation.
- Aside after Ch. 9 "It will be long … if we insert" → "Será longo … se inserirmos". The future tense with the future subjunctive is grammatical and matches the source's tense.

Evidence: `ember-translation-evidence/church-fathers__apocrypha__gospel-of-the-nativity-of-mary/review-3.md`.
