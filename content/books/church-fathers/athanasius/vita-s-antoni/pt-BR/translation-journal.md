# Translation Journal — Vita S. Antoni (Life of St. Anthony) (pt-BR)

Source: en-US (H. Ellershaw translation, NPNF Second Series Vol. 4, New Advent edition)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Athanasius | Atanásio | author form as in `athanasius/statement-of-faith` book.json |
| Antony | Antão | traditional pt form for the Egyptian hermit (Santo Antão), distinct from Santo Antônio de Pádua |
| discipline (ascetic sense) | ascese | the source's constant word for the monastic life; "training" (exercise) → exercício |
| ascetic(s) | asceta(s) | |
| monk / monastery | monge / mosteiro | |
| hermit(s) | ermitão / ermitães | |
| solitary life | vida solitária | |
| cell | cela | |
| the desert / inner desert | o deserto / o deserto interior | |
| inner / outer mountain | montanha interior / montanha exterior | quoted in headings as “montanha interior” where the source quotes |
| the old man (Antony) | o ancião | |
| brethren | irmãos | |
| the devil / the enemy / the Evil One | o diabo / o inimigo / o Maligno | |
| demon(s), evil spirits | demônio(s), espíritos malignos | |
| displays / delusions / apparitions | exibições / ilusões / aparições | kept distinct as in the source |
| wiles / devices | ciladas / artifícios | Ephesians 6:11 "devices" → "ciladas" |
| discerning of spirits | discernimento dos espíritos | |
| sign oneself (with the cross) | persignar-se | |
| lust | luxúria (spirit of lust); concupiscência (Jas 1:15) | |
| whoredom | fornicação | |
| freedom from anger | isenção de ira | |
| loving-kindness | bondade | |
| long-suffering | longanimidade | |
| Greeks (= pagans) | gregos | kept as in source; "heathen" → pagãos |
| Word / Wisdom / Essence | Verbo / Sabedoria / Essência | as in statement-of-faith |
| God-bearer | Mãe de Deus | |
| Meletians / Manichæans / Arians | melecianos / maniqueus / arianos | Manes → Mani |
| duke (dux) | duque | |
| acres | jeiras | |
| Thebaid / upper Thebaid | Tebaida / Alta Tebaida | |
| Saracens | sarracenos | |

## Translation Decisions

- 2026-09-27: Scripture references are bare, inline, and placed exactly where the en-US source places them (often mid-sentence, e.g. "os Apóstolos Mateus 4:20 deixaram tudo"). Book names localized to standard Portuguese Catholic usage (Gênesis, Mateus, 1 Reis, 2 Reis, Eclesiástico for "Sirach", Oseias, Tessalonicenses…), following `ambrose/mysteries/pt-BR`; chapter and verse numbers unchanged. Where a reference sits right after a closing quote, the pt-BR puts the reference after the quote's punctuation. Source citation errors are mirrored, not fixed (¶55 "Galatians 6:6" for the burden-bearing verse, which is 6:2).
- 2026-09-27: Scripture quotations follow the source's wording clause by clause, not Almeida or Ave-Maria phrasing: ¶3 "he who is idle let him not eat" → "Quem é ocioso não coma"; ¶7 Rom 8:4 "ordinance of the law" → "prescrição da lei"; ¶16 Ps 90 "in them … if they are in strength" kept; ¶24 the Job 41 imagery (hook, halter, ring, armlet, sparrow) rendered literally; ¶27 "kept silence from good words" → "calei-me até sobre as coisas boas".
- 2026-09-27: The source has no NPNF footnote markers left in the text, only stray spaces where they were stripped (e.g. "wealth , and"). Nothing to drop; the stray spaces are not reproduced. No translator notes added.
- 2026-09-27: Paragraph numbers mirror the en-US `N. ` form rather than the `**N.**` form preferred by `.claude/rules/books.md`, so both language files render identically and stay aligned for review tooling (same choice as `athanasius/incarnation-of-the-word/pt-BR`). Numbers run 1–94 without gaps or repeats, so list rendering does not renumber them.
- 2026-09-27: Quotation marks: the source's outer '…' become “…”, and its inner “…” become ‘…’. Antony's long discourse (¶16–43) keeps the source's pattern of reopening a quote at the start of each paragraph and closing it only where the source does. Direct speech the source leaves unquoted (¶6 "Who are you who speakest thus with me?", ¶9 "Here am I, Antony…", ¶46 "Let us go too…") is given quotes for readability; ¶69's unquoted shift into direct address ("Por isso não tenhais nenhuma comunhão…") is left unquoted as in the source.
- 2026-09-27: Address to God and to Christ uses capitalized pronouns (Ele, O, nEle) as in the sibling Church Fathers translations; ¶79 "Is It then a fit subject for mockery" (the Cross, capital It in source) → "É Ela, então, digna de zombaria".
- 2026-09-27: ¶6 "a black boy … the black one" kept literal ("um menino negro … o negro"): the text's point is the demon's appearance matching "the colour of his mind" (coração negro), and softening it would break the wordplay. Not modernized.
- 2026-09-27: ¶44 source is ungrammatical ("their cells were in the mountains, like filled with holy bands"); rendered as "as suas celas nas montanhas eram como que repletas de santos coros", without supplying the missing noun (Greek has "like tabernacles").
- 2026-09-27: Heading vs. body name mismatch mirrored: heading "Polycration" → "Policrátion", body "Polycratia" → "Policrácia".
- 2026-09-27: Title "Vita S. Antoni (Vida de Santo Antão)", keeping the Latin title as the en-US does.

## Review Round 1 (2026-09-27)

Mechanical audit: 94/94 paragraph markers and 45/45 headings match en-US; 71/71 scripture refs match in count and position; all pt-BR book-name mappings checked against en-US (Jó, Coríntios, Efésios, etc. all correct); no footnote markers, no YAML frontmatter, italics count matches (3/3); no systematic diacritics gaps found. Confirmed the paragraph-marker and Polycration/Polycratia journal claims above are true by direct grep.

Fixed (objective fidelity defects found in a 5-way clause-by-clause bilingual read):
- ¶2: "ao jovem rico" → "ao rico". EN says only "the rich man"; "jovem" (young) was an unsupported addition (the traditional epithet, but not what this source says).
- ¶11: "envergonhou o diabo que nele estava" → "envergonhou nele o diabo". EN "he put the devil in it to shame" uses "in it" instrumentally (shamed the devil by means of/through the dish); the original pt-BR relative clause ("que nele estava") asserted the devil was literally located inside the dish, a claim the source doesn't make.
- ¶48: "não querendo abrir" → "não suportando abrir", closer to EN "not bearing to open" (could not bring himself to, not mere unwillingness).
- ¶50: removed added "provisões" from "cuidaram de lhe enviar provisões" → "cuidaram de lhe enviar". EN "took care to send to him" leaves the object elliptical (understood as bread from context); Portuguese "enviar" can take the same ellipsis.
- ¶69: "ímpíssimos" → "impiíssimos" (typo; correct superlative of "ímpio").

Rejected/no action: none — the two rounds of parallel bilingual sub-review batches (¶1-19, 20-38, 39-56, 57-75, 76-94) turned up only the five items above; addressee register (tu/vós/nós) in Antony's discourse (¶16-43) was traced turn by turn and found consistent throughout.
