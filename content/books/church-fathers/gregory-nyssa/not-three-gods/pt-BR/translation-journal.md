# Translation Journal — On "Not Three Gods" (To Ablabius) (pt-BR)

Source: en-US (H. A. Wilson, NPNF Second Series vol. 5, via New Advent) — the book's only language directory
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Gregory of Nyssa | Gregório de Nissa | as in the other `gregory-nyssa` pt-BR book.json files |
| Ablabius | Ablábio | |
| Godhead (θεότης) | Divindade | always quoted when the source quotes it |
| Deity | Divindade | Portuguese has no separate common word; the argument turns on "Godhead", so no distinction is lost |
| God / Gods | Deus / Deuses | capitalized plural, as in the source ("três Deuses") |
| nature / operation | natureza / operação | the two poles of the argument; never varied |
| Person(s) | Pessoa(s) | capitalized as in the source |
| the Holy Trinity | a Santíssima Trindade | |
| Holy Ghost / Holy Spirit | Espírito Santo | both English forms |
| Only-begotten (God) | Unigênito / Deus Unigênito | |
| unbegotten / generation | ingênito / geração | |
| Cause / of the Cause / caused / without cause | Causa / da Causa / causado / sem causa | capitalization follows the source |
| behold / beholding / beholder | contemplar / contemplação / contemplador | kept apart from "see" (ver) so the θέα / θεατής etymology lines up |
| superintend / superintendence / superintender | superintender / superintendência / superintendente | |
| survey / overlook | vigiar / supervisionar | |
| circumscription | circunscrição | |
| stater / Daric | estáter / dárico | |
| "golden" (vs "gold") | "de ouro" (vs "ouro") | |
| husbandman / farmer | lavrador | |
| surveyors / shoemakers / rhetoricians | agrimensores / sapateiros / retóricos | |
| knowledge falsely so called | a falsamente chamada ciência | 1 Tm 6:20 allusion |
| Giver of life | Doador da vida | |

## Translation Decisions

- Conventions from the sibling Gregory pt-BR works (`baptism-of-christ`, `pilgrimages`): author without "São", straight double quotes, divine pronouns lowercase (ele, aquele que). Inline Scripture references stay where the source puts them, with Portuguese book names (Atos, Romanos, Isaías, Mateus, 1 Coríntios, 1 Timóteo, Hebreus, Deuteronômio), as in `ambrose/repentance`.
- Greek words (θεότης, θέα, θεατής, θεός, θεατά) kept as in the source with the Portuguese gloss after each.
- Scripture quotations translated from the source's wording (Deut 6:4 "o Senhor teu Deus é um só Senhor" in ¶5 and "o Senhor nosso Deus é um só Senhor" in ¶15, as the source has two forms).
- Address: `tu` for Ablabius in the opening and in the generic "you" ("como poderias persuadir", "não podes encontrar").
- English `:—` and `—` openers are rendered with Portuguese punctuation, not transplanted. The long parenthesis in ¶9 keeps its dashes around the parenthesis.
- Structure: title heading, the "A Ablábio." line and 18 paragraphs, unchanged. ¶N counts body paragraphs after the "A Ablábio." line. No footnotes in the source; no translator notes added.

## Source slips (mirrored, not corrected)

- ¶9 "judges all the earth Romans 3:6": the phrase is closer to Genesis 18:25; Romans 3:6 is kept as cited.
- ¶13 "difference figure and colour": a dropped "of"/"in"; rendered "diferença de figura e cor". Not edited in en-US because the edition's exact wording is uncertain.
- Last paragraph "since on the one hand … and since on the one hand": the second is clearly "on the other hand"; rendered "por um lado … por outro lado".
- Stray spaces before punctuation ("obedience ,", "Divine Nature ,", "judges no man ,") are not transplanted.

## Source edits

None.

## Review log

### Round 1

Focus: paragraph-by-paragraph completeness against en-US (the only source), Scripture references, plus the mechanical audit. Verdict: 2 defects, fixed.

Fixed:
- ¶15: "a natureza divina, simples e imutável" → "única e imutável". Source: "the Divine, single, and unchanging nature, that it may be one". "Simples" says non-composite; the source says single (one).
- Journal: the ¶ locators were file line numbers (¶13, ¶21, ¶29, ¶33), not paragraph numbers, in a file of 18 paragraphs. Renumbered to ¶5, ¶9, ¶13, ¶15 and stated the numbering.

Rejected:
- ¶6 "and questions why by His own power He pardons the sins of men?" → "e lhes pergunta por que ele, por seu próprio poder, perdoa os pecados dos homens." The source's subject of "questions" is Jesus, so the pt-BR keeps its sense; "lhes" and the period only make the indirect question explicit.
- ¶7 "One God" → "um só Deus" (lowercase): reverential capitalization is not normalized (`.claude/rules/books.md`).
- ¶9 "three Givers of life" → "três Doadores de vida" beside Key Terms "Doador da vida": the plural without the article is the same term.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__gregory-nyssa__not-three-gods/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read against en-US (negation, subject/object, tense/mood, false friends, dropped qualifiers, Scripture wording), plus the mechanical audit. Verdict: clean, no changes.

Rejected:
- ¶2 "nor such that but small harm will follow" → "nem tal que dela se siga um dano pequeno": the negation carries the sense (the harm would not be small); "apenas" is not needed.
- ¶4 "make our reply at greater length" → "com mais vagar": "com mais vagar" means taking more time over it, which is the sense.
- ¶5 "extends through the Holy Trinity" → "se estenda por toda a Santíssima Trindade": "toda" only makes "through" explicit; the claim is unchanged.
- ¶6 "belongs to one of the Persons … or … throughout the Three Persons" → "a uma só das Pessoas": the contrast requires the exclusive reading.
- ¶13 "on account of the multitude of the material" → "por causa da quantidade da matéria": "multitude" here is amount of a mass noun; "multidão da matéria" would be wrong in Portuguese.
- ¶16 "uma é a Causa e outra é da Causa" (Pessoa) then "um é diretamente … e outro por meio daquele" (the Son and the Spirit): the gender shift follows the implied referent in each sentence and names the same Persons.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__gregory-nyssa__not-three-gods/review-2.md`.

### Round 3

Focus: a source-blind cold read of the pt-BR, with each mark then checked against en-US, followed by a spelling, diacritics, crase, hyphenation and quote-pairing sweep, plus the mechanical audit. Verdict: clean, no changes.

Rejected:
- ¶4 "a um tempo enumerando … e, ao mesmo tempo, não admitindo": the source doubles the phrase too ("at once enumerating …, and at the same time not admitting").
- ¶6 "qualquer outra coisa que costumamos dizer dele" after "a Divindade": the source makes the same shift ("the Deity … say of Him"). "Dele" refers to God, as the following "dizemos que ele é incorruptível" confirms; "dela" would lose that.
- ¶9 "todas as coisas que participaram desta graça": "desta" has no earlier noun "graça", but the source has the same "this grace", pointing back to "gifts".
- ¶11 "assim também não são chamados três Deuses" has an implicit subject: the source has "so neither are they called three Gods".

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__gregory-nyssa__not-three-gods/review-3.md`.
