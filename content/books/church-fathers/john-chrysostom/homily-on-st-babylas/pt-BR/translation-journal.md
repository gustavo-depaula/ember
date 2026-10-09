# Translation Journal — Homily on St. Babylas (pt-BR)

Source: en-US (T. P. Brandram translation, NPNF First Series Vol. 9, via New Advent `1906.htm`)
Target: pt-BR

Single chapter (`ch001.md`): title and eight paragraphs, three of them numbered (§1 has three unnumbered continuations, §2 two, §3 none).

## Terms

| en-US | pt-BR | Notes |
|-------|-------|-------|
| John Chrysostom | João Crisóstomo | as in the sibling Chrysostom works |
| St. Babylas | São Bábilas | title: Homilia sobre São Bábilas |
| Julian | Juliano | |
| Daphne | Dafne | as in *Atos de Paulo e Tecla* |
| Apollo | Apolo | |
| Galilæans | galileus | |
| Greeks (= pagans) | gregos | as in *Vita S. Antonii* and Athanasius |
| Gentiles | gentios | |
| Scythian | cita | |
| noble deeds / noble actions | nobres feitos / nobres ações | |
| deeds (Christ's, "the witness of the deeds") | feitos | |
| conversation (way of life) | conduta | |
| slaughter | imolação | |
| testimony (of the martyr) | testemunho | Brandram's word for the martyr's shrine (*martyrion*); kept literal |
| shrine (of Apollo / of the saint) | santuário | |
| chapel | capela | |
| pollution / polluting | contaminação / contaminar | |
| demon / Demon | demônio | lowercase throughout; the source's capital is incidental |
| the only Begotten | o Unigênito | |
| Hades | Hades | |
| powers above | potestades do alto | |
| Ezekiel / Moses / Joseph | Ezequiel / Moisés / José | |

## Decisions

- Address: the congregation is vós. The unbeliever ("thou, the unbeliever", ¶2 and ¶4), Julian ("O wretched and miserable man!") and the apostrophes to the demon and to Apollo take tu / vocative ó.
- Pronouns for God and Christ are capitalized (Aquele) where free-standing, as in *Homilia sobre Santo Inácio*.
- Paragraph numbers are `**N.**`; en-US writes them as `N. ` list markers. Unnumbered continuation paragraphs stay unnumbered.
- Scripture references stay inline where the edition puts them, with Portuguese book names (Lucas, Mateus, Êxodo, Efésios). Quotations follow Brandram's English, not a Portuguese Bible. The edition's "Ezekiel xxxvii" is given as "Ezequiel 37", the corpus's reference format; the chapter is the same.
- "The dead are not a pollution, a most wicked demon": the "a" is read as the vocative "O" (the next paragraph's parallel "O Apollo"), rendered "ó demônio perversíssimo". The source file is not edited, since this could be the edition's own misprint.
- "the elder among our teachers, and … our common father" and "this wonderful man" (the bishop buried beside Babylas) are kept unnamed, as in the source; no translator notes.
- Quotes are curly “ ”, as in the sibling Chrysostom works. No footnotes in the source.
- book.json: pt-BR added to `name`, `author`, `languages` and the toc title only.

## Source corrections

None.

## Review log

### Round 1

Focus: completeness paragraph by paragraph (8 ↔ 8), plus Bible names and chapter:verse. Verdict: clean, no changes.

Considered and rejected:
- ¶3 "the names of the Christians" → "o nome dos cristãos" (singular): the one name "Christian", opposed in the next clause to "a strange name". Same meaning.
- ¶8 "this man bore off the most dangerous of our passions, anger" → "venceu": "bore off" is carrying off the victory, the sense of "venceu".
- ¶6 "the great God of the Greeks" → "o grande deus dos gregos": lowercase for a pagan god is a style choice.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-babylas/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of all eight paragraphs, plus the mechanical audit and book.json. Verdict: clean, no changes.

Considered and rejected:
- ¶8 "but by a better method than these" → "por um meio melhor que estes": the masculine refers to the implied "meios" (means) that "construções" and "festas" stand for. It is not a concord slip with those feminine nouns.
- ¶3 "As it was impossible to destroy the heaven … and those things Christ foretold" → "Como era impossível destruir o céu … assim também aquilo que Cristo predisse": "assim também" spells out the comparison the English leaves loose. Same claim, nothing added.
- ¶7 "But the great Moses did not stand near the bones" → "E o grande Moisés": the contrast is carried by "não ficou … mas", so the connector is a style choice.
- ¶1 "Since thus did the master command" → "Assim, de fato, ordenou o senhor": "de fato" keeps the explanatory link to the previous sentence.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-babylas/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, then a spelling, diacritics, crase, hyphenation and quote-pairing sweep, plus the mechanical audit and book.json. Verdict: one defect, fixed.

Fixed:
- ¶3 "Pois eles, de fato, se afastam e odeiam igualmente os amigos e os estranhos" → "repelem e odeiam igualmente". *Afastar-se* takes *de* and cannot share a direct object with *odiar*. *Repelir* is transitive and is the rendering of the same "turn from" two sentences later ("a este ele repelia e odiava").

Considered and rejected:
- ¶7 "engano e mentira que de modo algum pode ser ocultada": the relative attaches to *mentira* ("a lie which is no wise able to be concealed"), so the feminine singular is correct.
- ¶6 "subamos imediatamente a Dafne" (no crase): the book uses Dafne without an article throughout ("em Dafne", "de Dafne"), so the "a" is correct.
- ¶8 "a cabeça da sua estátua" and "Pois partilhou com ele": the pronouns are as open as the source's "his image" and "he shared with him". The context resolves both.
- ¶8 "Assim toda idade e cada sexo saíram" ("Thus also"): leaving out "also" does not change the sense.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-babylas/review-3.md`.

### Round 4

Focus: function words, headings, and the places where pt-BR must commit and the source is open (possessive antecedents, demonstratives, connectors, a turn-by-turn tu/vós trace), plus the mechanical audit and book.json. Verdict: clean, no changes.

Considered and rejected:
- ¶5 "It shines forth by the very truth of the deed" → "pela própria verdade do fato": the Key Terms "deeds → feitos" row covers the plural deeds that "speak" (¶4–5). The singular here is the event that bears out the prophecy, and "fato" renders it.
- ¶6 "Not that I even would say" → "Não que eu diga": "even" only softens the disclaimer. The claim is unchanged.
- ¶8 "not even then enjoyed freedom from fear, but straightway learned" → "e logo aprendeu": the second clause adds to the first and does not correct it, so "e" holds.
- ¶8 "He imitates their life, emulates their courage" → "Imita a vida deles, emula a sua coragem": "sua" follows "deles", and the reflexive reading makes no sense, so the context fixes it as the martyrs'.
- ¶8 "returning from sojourn far away" → "de uma longa peregrinação": "longa" covers distance here, and "havia muito ausente" already carries the time.
- ¶1 "at all events, the longer the time is" → "afinal": the same concessive function.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-babylas/review-4.md`.

### Round 5

Focus: per-paragraph term-frequency diff against the Terms table in both directions, a grep of every falsifiable journal claim, and proper names against standard forms and sibling works, plus the mechanical audit and book.json. Verdict: clean, no changes.

Considered and rejected:
- ¶4 "receive the witness of the deeds" and ¶8 "the testimony of the martyr" both → "testemunho": the "deeds" row already quotes "the witness of the deeds", and the two English words are synonyms here, so a single Portuguese word for both is not a Terms conflict.
- ¶7 "the failure of the shameless deed" → "ato desavergonhado", not "feito": the "deeds → feitos" row covers the deeds that speak for Christ (¶4–5), not Apollo's attempt on Daphne.
- ¶8 "upon the head of his image" → "da sua estátua": the image is Apollo's cult statue, so "estátua" is accurate. "Image" is not in the Terms table.
- Journal "as in *Vita S. Antonii*": the sibling's title is spelled *Vita S. Antoni*, but the reference clearly identifies the work and the claim about "gregos" holds there.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-babylas/review-5.md`.
