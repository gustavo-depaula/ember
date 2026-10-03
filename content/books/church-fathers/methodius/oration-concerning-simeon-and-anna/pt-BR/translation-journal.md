# Translation Journal — Oration Concerning Simeon and Anna (pt-BR)

Source: en-US (William R. Clark, Ante-Nicene Fathers Vol. 6, via New Advent)
Target: pt-BR

No other Methodius work has pt-BR yet. Conventions follow `ambrose/repentance` and `athanasius/*`:
- Author "Metódio", matching the bare-name form of en-US "Methodius" (as "Athanasius" → "Atanásio").
- Scripture references keep the source's numbers and inline placement, with Portuguese book names ("2 Coríntios 3:18", "Eclesiástico 1:10", "Cântico dos Cânticos 2:16-17", "Habacuque 3:2").
- Citations are mirrored even when wrong.
- Curly quotes “ ”. Reverential pronouns lowercase; capitals only on titles the source capitalizes (Senhor, Verbo, Luz, Rei Eterno).
- The section numerals I–XIV stay plain as in the source (Roman numerals are not parsed as list markers).

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| Oration | Discurso | title |
| virgin mother / virgin-mother | virgem-mãe / virgem mãe | hyphen follows the source |
| mother-virgin and virgin-mother | mãe-virgem e virgem-mãe | §IX |
| mother of God | mãe de Deus | lowercase, as in the source |
| ark | arca | Mary as the living ark |
| mercy-seat | propiciatório | |
| live coal / tongs | brasa viva / tenaz | Isaiah 6, applied to Christ and Mary |
| seraphim | serafins | |
| Thrice-Holy | Três-Vezes-Santo | |
| the Lord of hosts | o Senhor dos exércitos | |
| type / figure | tipo / figura | |
| Simeon / Anna | Simeão / Ana | |
| the old man | o ancião | §VII, §XI, §XII; "reverend senior" (§VII) → "venerando ancião" |
| the aged Simeon | o velho Simeão | §VI |
| Uzziah | Ozias | used for both 2 Sam 6:7 and Isaiah 6:1, as the source does |
| Obededom | Obed-Edom | |
| Hades | Hades | |
| Hail! | Salve! | salutations of §X, §XIII, §XIV |
| the Gentiles | os gentios | |
| incarnation / assumption of the manhood | encarnação / assunção da humanidade | |
| of one substance with | de uma só substância com | |
| Sun of Righteousness | Sol de Justiça | |
| Ancient of days | Ancião dos dias | |

## Translation Decisions

- Address: `tu` for Mary, Simeon, Isaiah, Christ and God in the prayers, Jerusalem, the Church and the "little flock" (§XIII, kept singular throughout the salutation); `vós` for the audience when plural ("meus divinos e santos ouvintes", "Caríssimos", "ó congregação santíssima").
- Scripture is translated from the source's wording, not from a Portuguese Bible.
- §I "the Lord has *manifestly come to His own*": the italics are kept.
- §III "Now that that parturition was polluted, and stood not in need of expiatory victims": the sentence's argument (Isaiah's witness to a painless birth) needs a negation, so it is rendered "não foi maculado". Check the printed ANF before changing en-US.
- §V "Since then, the God of gods has appeared…": the source's sentence break before "According to the blessed David" is mirrored.
- §IX "You also, prefiguring his successor Elisha, having been instructed…": the participles belong to Elisha, so "You" is read as the object of "prefiguring" ("Prefigurando-te também a ti, o seu sucessor Eliseu…").
- §XIII "keeping holy-day with the Father": kept "o Pai" as capitalized in the source.
- §XIV "earliest host of our holy religion" → "primeiro anfitrião" (Simeon received God in his arms).
- Small punctuation slips in the source are normalized in pt-BR only: §IV "and said. Holy" → colon; §VII "most venerable, Cling" → period; §VIII "and are saved Therefore" → period; §XIV "servant. yet" → comma; missing spaces before inline references (§I "all.Romans", §III "salvation.2 Samuel").

## Source edits (en-US, OCR-class)

- §I "— -things new" → "— things new".
- §II "Whom shall I strict" → "send"; "for oar sakes" → "our"; "anal also the Spirit" → "and"; "“Cod was in Christ" → "God".
- §III "The must holy virgin" → "most"; "un injured" → "uninjured".
- §VII "that which his old" → "is".
- §VIII "he taken captive" → "be".
- §X "who boldest the helm" → "holdest".

## Source citation slips (mirrored, not corrected)

- §I "Sirach 1:10" (the verse is Ecclesiastes 1:10).
- §III "Exodus 31:19" (Exodus 13:2 / 34:19); "Luke 11:24" (Luke 2:24).
- §VI "Exodus 3:23" (33:23); "Acts 18:28" (17:28).
- §VIII "Colossians 2:4" (2:14); "John 4:9" placed at "our degradation".
- §X "Isaiah 40:1" (11:1); "Exodus 35:17" (25:17).

## Review log

### Round 1

Focus: completeness paragraph by paragraph (17 blocks aligned one to one); Bible book names and chapter:verse numbers. Mechanical audit (structure, diacritics, Markdown, `book.json`) also run.

Verdict: 1 defect, fixed.

- §III "A santíssima virgem-mãe" → "virgem mãe"; §V "ó virgem-mãe" → "ó virgem mãe". The source has "virgin mother" unhyphenated in both places, and Key Terms says the hyphen follows the source.

Rejected:
- §X "Blessed of the Lord is your name, full of divine grace" → "Bendito do Senhor é o teu nome, cheio de graça divina". The English attaches "full of divine grace" to "name" as readily as to Mary, so agreeing with "nome" is a defensible reading; not changed to "cheia".

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of §I–§XIV against en-US. Mechanical audit (sections, diacritics, Markdown, `book.json`, Key Terms counts) also run.

Verdict: 2 defects, fixed.

- §VI "os que jazem nas trevas" → "os que estão sentados nas trevas"; §VIII "aos que jaziam nas trevas" → "aos que estavam sentados nas trevas". The source has "sit"/"sat" (Luke 1:79); "jazer" is "lie", the wording of the familiar Portuguese Benedictus, not of the source.
- §XIV "monte sombreado do Espírito Santo" → "monte umbroso". The source's "overshadowing" is active (the mount gives shade); "sombreado" says the mount is shaded.

Rejected:
- §IV "so that the miracle was the more stupendous" → "de modo que o milagre fosse mais estupendo". The subjunctive after "de modo que" leans to purpose, but the clause still states the outcome of the virginal birth; no change of sense.
- §IX "as prescient of your chastity" → "como que pressentindo a tua castidade". "Como que" softens "as" slightly, but Elijah's foreknowledge stays asserted through "emulando-a pelo Espírito"; style.
- §XII "There went up a smoke in His anger, and fire from His countenance devoured" → "Subiu fumaça na sua ira, e fogo devorador do seu semblante". The finite "devoured" becomes the attributive "devorador" under the shared verb "Subiu"; the image (consuming fire from His face) is unchanged.
- §XII "putting off the debt of death" → "adiava o tributo da morte". "Tributo" is a payment owed, which is the sense of "debt" here.
- §XIII "you peculiar people" → "povo adquirido". "Peculiar" is the KJV sense of "God's own possession", which "adquirido" renders; not a false friend.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, marks verified against en-US; then a spelling, diacritics, crase, hyphenation and quote-pairing sweep. Mechanical audit (blocks, Markdown, `book.json`) also run.

Verdict: 1 defect, fixed.

- §III "e por aquele que nos santificou é oferecido um par de aves puras" → "e em favor daquele que nos santificou é oferecido". The source has "offered for Him"; with a passive verb, "por" reads as the agent, so the Portuguese said Christ made the offering.

Rejected:
- §VII "nor indeed does the law punish relentlessly those who would boldly touch" → "nem a lei pune implacavelmente os que ousadamente quisessem tocar". The imperfect subjunctive refers to the would-be touchers of Sinai, contrasted with the present; defensible.
- §I "boasting in our own unalterable defeat" → "derrota inalterável"; §IX the verbless "Por tua causa…" sentence; §XI the "pede … trouxe … falava" tense mix; §VII "o Verbo encarnado se dignou … encarnar-se". All mirror the source.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-3.md`.

### Round 4

Focus: function words (prepositions, articles, demonstratives, conjunctions, adversatives, possessive `seu/sua`, `consigo`), headings, and places where the Portuguese must commit and the source is open (referent gender, antecedents, a tu/vós addressee trace). Mechanical audit (blocks, Key Terms counts, `book.json`) also run.

Verdict: 1 defect, fixed.

- §XII "exibindo a todos a retribuição da sua repugnante impiedade" → "da repugnante impiedade deles". The source has "their" (the apostate body Uzziah represents); with "o qual" (Uzziah) as subject, "sua" read as his own impiety.

Rejected:
- §I "the publican … comes away just" → "sai justificado". Luke 18:14's publican goes home "justified", that is, made just; same sense.
- §II, §IV "one cried unto another, and said" → "clamavam um para o outro, e diziam". The English is the KJV reciprocal idiom; the antiphonal cry is unchanged.
- §IV "as the joint-partner of His throne and inseparable from His nature" → "a Deus Pai, como partícipe do seu trono e inseparável da sua natureza". "seu/sua" follows directly on "Deus Pai", the nearest antecedent.
- §V "Since then, the God of gods has appeared" → "Desde então"; §VI "I am exceeding joyful since I have seen You" → "desde que te vi". The temporal reading is open in the source. In §V it is the only reading that leaves the mirrored sentence break complete.
- §VIII "You have not unto the end overlooked Your servants" → "não desprezaste até o fim". "Desprezar" also means "to disregard".
- §X "who hast alone borne in the flesh Him" → "tu que só deste à luz". It follows "só tu foste julgada digna" and reads as "alone".
- §XI "the foolish Jewish children" → "os insensatos filhos dos judeus". This is the Hebraic "sons of" idiom for the people itself.
- §XIII "it is your Father's good pleasure" → "aprouve a teu Pai". The perfect states a standing decision.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-4.md`.

### Round 5

Focus: Key Terms per-paragraph frequency diff in both directions; every falsifiable journal claim grepped against the chapter files and the en-US `git diff`; proper names against standard Portuguese forms and sibling pt-BR works. Mechanical audit (blocks, 62 references, quotes, `book.json`) also run.

Verdict: 1 defect, fixed.

- Key Terms row "the old man | o ancião / o velho Simeão" was false: every "old man" is "o ancião"; "o velho Simeão" renders §VI "the aged Simeon". Split into two rows, with §VII "reverend senior" → "venerando ancião" noted.

Rejected:
- §VII "Let the bush which set forth me in type" → "a sarça que me prefigurou". "Type" → "tipo" is the noun rendering; the verb carries "in type" without loss.
- §XI "a new taking of man's nature, I say, by God" → "uma nova assunção da natureza humana". "Assunção" is the theological word for the taking of a nature; it does not compete with the "assumption of the manhood" row.
- "Habacuque" against "Habacuc" in cyril/basil, and "Sol de Justiça" against cyril's "Sol da Justiça": both forms are standard Portuguese; this book is internally consistent.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-5.md`.

### Round 6

Focus: completeness paragraph by paragraph (18 blocks aligned one to one, every quotation, parenthetical and clause checked); Bible book names and the 62 chapter:verse numbers. Mechanical audit (structure, quotes, italics, footnotes, `book.json`) also run.

Verdict: clean, no changes.

Rejected:
- §III "that He who, though both in time, was not limited by time" → "ele que, embora no tempo, não era limitado pelo tempo". "Both" has no second member in the source, so nothing is dropped.
- §XIII "many children of faith, Hail, you people of the Lord" → "muitos filhos da fé. Salve, povo do Senhor". The source's comma splice is normalized to a period, like the other punctuation slips listed above.
- §XI "the old man, the receiver of God, and our pious teacher" → "o ancião, o que recebeu Deus, nosso piedoso mestre". The dropped "and" leaves an appositive chain with all three members.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read of §I–§XIV against en-US (negation, subject/object, tense, false friends, dropped qualifiers, quotations pulled toward familiar Bible wording). Mechanical audit (18 blocks, quote pairing, italics, footnotes, diacritics, `book.json`) also run.

Verdict: 1 defect, fixed.

- §IV Galatians 4:4 "made of a woman, made under the law" → "nascido de mulher, nascido sob a lei" changed to "feito de mulher, feito sob a lei". "Nascido" is the familiar Portuguese Bible wording; the source says "made".

Rejected:
- §III Isaiah 66:7 "Before she travailed, … she brought forth before her pains came, she escaped" → "Antes de estar em trabalho de parto, deu à luz; antes que lhe viessem as dores, escapou". The source's unpunctuated run lets "before her pains came" attach to either verb; every clause is present.
- §V "a light has sprung up for the righteous, and joy for those who are true of heart" → "para o justo … para os retos de coração". "O justo" is the generic singular; "true of heart" is the sincere, upright heart, which "retos" renders.
- §VII "The blast of the trumpet" → "O som da trombeta"; §IV "that overshadowing of the divine glory" → "àquela sombra da glória divina". Same referent, no change of sense.
- §X "all the fiery darts of the wicked" → "do maligno". The English "the wicked" admits the evil one, as in Ephesians 6:16.
- §XI "shall be cut off from His people" → "será exterminada do seu povo"; "make a speech over against him" → "fizesse um discurso diante dele". "Exterminar" is the Portuguese sense of "cut off" from the people; "over against" is "facing".

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-7.md`.

### Round 8

Focus: source-blind cold read of the pt-BR, marks verified against en-US; then a spelling, diacritics, crase, hyphenation, punctuation and quote-pairing sweep over the whole file. Mechanical audit (18 blocks, italics, footnotes, `book.json`) also run.

Verdict: clean, no changes.

Rejected:
- §IV "Therefore the prophet brought the virgin from Nazareth" → "Por isso o profeta trouxe a virgem de Nazaré"; "there He paid … she presented Him" → "ali ele pagou … ela o apresentou". Both the odd agent and the pronoun shift are the source's.
- §VIII "Now, at length, I understand what I had from Solomon" → "compreendo o que aprendera de Salomão". "Had from" is received teaching; the pluperfect marks it as prior to the present understanding; grammatical.
- §XIII "as being present with them in spirit" → "como estando presentes com eles em espírito". "Eles" mirrors the source's "them" (the city's people and the Church).

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-8.md`.

### Round 9

Focus: function words (prepositions, articles, demonstratives, conjunctions, adversatives, possessive `seu/sua`, `consigo`), headings, and places where the Portuguese must commit and the source is open (referent gender, antecedents, a turn-by-turn tu/vós addressee trace). Mechanical audit (18 blocks, 38 quote pairs, 62 references, Key Terms counts, `book.json`) also run.

Verdict: clean, no changes.

Rejected:
- §II "Upon this, consider the Lord … Upon this virginal throne, I say" → "Sobre ele, considerai o Senhor". "Ele" agrees with "trono", and the next sentence names it, as the source's "I say" does.
- §IX "ministered help and healing to those who were in need of it" → "aos que dele precisavam". "Dele" agrees with "auxílio"; reading it as Elisha leaves the sense unchanged.
- §XII "destroyed those murderers, and burnt up their city" → "incendiou a sua cidade". "Aqueles homicidas" is the nearest antecedent and the parable fixes the referent. The Round 4 Uzziah fix differed: there the only available antecedent gave a wrong sense.
- §XII "Her very name also pre-signifies the Church" → "o seu próprio nome". The next sentence names Anna.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__methodius__oration-concerning-simeon-and-anna/review-9.md`.
