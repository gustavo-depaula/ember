# Translation Journal — Homily on the Paralytic Lowered Through the Roof (pt-BR)

Source: en-US (W.R.W. Stephens translation, NPNF First Series Vol. 9, via New Advent `1911.htm`)
Target: pt-BR

Single chapter (`ch001.md`): title and eight numbered sections over sixteen paragraphs (§1, §2, §3, §4 and §8 have unnumbered continuations). No editorial introduction, no footnotes.

## Terms

| en-US | pt-BR | Notes |
|-------|-------|-------|
| John Chrysostom | João Crisóstomo | as in the sibling Chrysostom works |
| paralytic / sick of the palsy | paralítico | |
| palsy / paralysis | paralisia | |
| infirmity / disease / malady / sickness | enfermidade / doença | |
| the pool | a piscina | Bethesda; baptism: "pool of water" (§3) → piscina de água, "pool of the sacred water" (§6) → piscina da água sagrada |
| philosophy (§1) / spiritual wisdom | filosofia / sabedoria espiritual | |
| endurance / patience / forbearance | perseverança / paciência | |
| lovingkindness | benignidade | as in *Sobre o Sacerdócio* and *Humildade de Espírito* |
| trial / temptation | provação / tentação | |
| gold refiner, furnace | refinador de ouro, fornalha | |
| to sift / winnow | joeirar | Luke 22:31 and the gloss that follows |
| physician / cautery / knife | médico / cautério / bisturi | |
| remission / forgiveness of sins | remissão / perdão dos pecados | |
| equality of rank with the Father | igualdade de dignidade com o Pai | |
| a handle / pretext | pretexto | |
| sonship | filiação | |
| fellow-servant | conservo | |
| centurion | centurião | |
| woman of Canaan | mulher de Canaã | as in *Humildade de Espírito* |
| Simon the Cyrenian | Simão Cireneu | |
| Prætorium | Pretório | |
| Capernaum, Ninevites, Cain, Lazarus, Job | Cafarnaum, ninivitas, Caim, Lázaro, Jó | |
| Sirach | Eclesiástico | corpus convention |

## Decisions

- Address: the congregation is vós. Where Chrysostom turns to a single hearer ("You say", "when you hear", "consider", "thou, O man"), the address is tu, as in the sibling Chrysostom works.
- Pronouns for God and Christ are capitalized (Ele, Lhe, O, Se). §7 "it was his endeavour" refers to Christ and is rendered "o Seu empenho".
- Paragraph numbers are `**N.**`; en-US writes them as `N. ` list markers.
- Scripture references stay inline where the edition puts them, with Portuguese book names. Quotations follow the Stephens English, not a Portuguese Bible. §8 1 Thess 4:13 is ordered "Acerca dos que dormem…" so the gloss "He did not say concerning the dying, but 'concerning them that are asleep'" finds its words in the quote.
- Wrong citations carried by the edition are mirrored: Sirach 1:1-2 (the verses are 2:1-2), Matthew 25:12 (25:42), Jonah 1:2 (the threat is 3:4), Matthew 15:22 (the quote merges 15:22 with 17:15).
- §3 "having displayed his own earnestness on the man's behalf" is ambiguous in the source (Christ's or the man's earnestness); the possessive is kept ambiguous ("o seu próprio empenho em favor do homem").
- §8 "you will easily be able to repent and regain your courage": "repent" is odd in context but mirrored ("arrepender-te").
- Doxology follows the source's wording ("a quem sejam a glória, a honra e o poder, sempre, agora e para sempre, pelos séculos dos séculos. Amém.").
- Quotes are curly “ ”, as in the sibling Chrysostom works.

## Source corrections

Fixed in en-US as OCR-class slips:

- §1: "thirty-eight; years" → "thirty-eight years" (stray semicolon).
- §5: "in the beginning and outset of the word disease … attacked the body of Cain" → "of the world"; "word" makes no sense here and the sentence is about the first age of mankind.

## Review log

### Round 1

Focus: completeness paragraph by paragraph (16 paragraphs aligned one to one), Scripture book names and chapter:verse numbers, plus the mechanical audit and `book.json`.

Verdict: clean. No changes to chapter files, `book.json` or Key Terms.

Rejected findings:
- §3 "became more chastened" → "tornou-se mais contrito": defensible for the converted thief; not a mistranslation.
- §5 "they tremble and turn giddy" → "tremem e vacilam": "vacilar" covers the unsteadiness meant; defensible.
- §3 "He publicly presents the boon" (baptism) → "apresenta publicamente a graça": defensible.
- §8 "this is continually vexing and gnawing his soul" → "isto continuamente lhe aflige e rói a alma": "lhe" is a possessive dative and "a alma" is the object of both verbs; grammatical.
- §6 "Do you see that this word “alone,” is not used …" (period in source) → question mark: the sentence is a rhetorical question; punctuation choice.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-the-paralytic-lowered-through-the-roof/review-1.md` (outside the repo).

### Round 2

Focus: a clause-by-clause bilingual read of all 16 paragraphs against en-US, plus the mechanical audit and `book.json`.

Verdict: 1 defect, in the journal. The chapter text has no fidelity defects.

Fixed:
- Terms table, "the pool" row: it said "pool of the sacred water" occurs in §3 and §6 and is rendered "piscina da água sagrada". §3 has "the pool of water" → "piscina de água"; only §6 has "the sacred water". The row now lists the two forms separately.

Rejected findings:
- §5 "the servant of the centurion who believed" → "o servo do centurião, que creu": the antecedent is ambiguous in both languages. The surrounding argument (the centurion believed, the servant was healed) settles it, and the English is just as open.
- §5 "They that are whole have no need of a physician but they that are sick" (Matthew 9:12) → "Não são os sãos que precisam de médico, mas os doentes": the cleft sentence matches the familiar Bible wording, but the meaning is identical and no gloss depends on the wording.
- §6 "a sign of His deity to show the secrets of His mind" → "mostrar os segredos da mente": the second "His" refers to the human mind being read, as 1 Kings 8:39 ("men's hearts") and the next sentence ("the secrets of the mind") show. "da Sua mente" would make God reveal His own thoughts, which reverses the argument. The neutral "da mente" is correct.
- §2 1 Corinthians 10:13 "will … make the way of escape" → "dará também o meio de saída", and §2 2 Corinthians 1:5 "abound to us" → "abundam em nós": the sense is kept. These are style choices.
- §1 "you see me who have been this long time lying sick" → "estou aqui doente": "aqui" is a natural deictic for "lying" and adds no content.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-the-paralytic-lowered-through-the-roof/review-2.md` (outside the repo).

### Round 3

Focus: a source-blind cold read of the pt-BR, with each mark then checked against en-US; a spelling, diacritics, crase, hyphenation and quote-pairing sweep; the mechanical audit and `book.json`.

Verdict: clean. No changes to chapter files, `book.json` or Key Terms.

Rejected findings:
- §8 "Suponhamos que alguém luta com uma pobreza perpétua, e está sem o alimento necessário" (source: "Suppose some one is struggling with perpetual poverty"): the indicative after "suponhamos que" presents the scenario as a given. Standard pt-BR accepts it, so it is not a grammar defect.
- §4 "não o privou da cura, não! nem sequer àquele que não mostrou fé alguma" ("not even him who displayed no faith at all"): "àquele" is a prepositioned direct object, the same pattern as §2 "nem a ele nem a nenhum outro homem". It is grammatical.
- §8 Matthew 12:36 "de toda palavra má … seja boa, seja má": the contradiction is in the source ("every evil word … whether it be good or evil"). It is mirrored on purpose.
- §8 1 Thessalonians 4:13 "não quero" and then "não queremos": the source changes person too ("I would not" and then "we would not").
- §1 "que lhe era estranho" ("a stranger to him"): "ser estranho a alguém" means unknown to someone. It is not a false friend.
- §2 "mas Eu … o contive", §3 "operou … mas dá", §1 the broken-off "embora tantos … — mas por que falo de vós", §6 the cleft "foi porque … que o Senhor": each one follows the source's own pronoun, tense shift, anacoluthon or cleft.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-the-paralytic-lowered-through-the-roof/review-3.md` (outside the repo).

### Round 4

Focus: function words (prepositions, articles, demonstratives, adversatives, possessive "seu/sua", "consigo"), the heading, and every place where pt-BR must commit and the English is open (tu/vós traced turn by turn, gender, antecedents). Plus the mechanical audit and `book.json`.

Verdict: clean. No changes to chapter files, `book.json` or Key Terms.

Rejected findings:
- §2 Luke 22:31-32 "asked to have you … sift you … prayed for you … your faith" → "vos ter … vos joeirar … roguei por ti … a tua fé": the English "you" is open, but the plural-then-singular split follows the Greek (ὑμᾶς / σοῦ). The gloss then speaks to Peter alone ("não és capaz").
- §4 "because you have proffered a smaller degree of faith the cure which you receive" → "oferecestes … recebeis": Christ's hypothetical words go to "the other two men", and the roof case rests on "their faith" (the bearers together with the paralytic), so the plural is justified.
- §5 "because he had no one to aid him, so did He wait for this man" → "porque este não tinha ninguém … esperou que este homem viesse": the first "este" points back to the last-named man (the Bethesda paralytic). The second follows the source's deictic "this man". Both read correctly.
- §5 "This it is which enervates our bodies" → "É ele que enfraquece": "ele" is "pecado", the noun the source's "this" points to. "a natureza" sits closer, but it is not the referent.
- §3 (cont.) "out of his own heart assisted by the grace of God" → "auxiliado": the source participle is open between the heart and the man. The masculine form fits either reading.
- §3 "him who receives the forgiveness of them" → "daquele que recebe o seu perdão": "seu" refers to the sins just named. Reading it as the man's own forgiving makes no sense, so the possessive cannot mislead.
- §8 "He indeed does well to mourn" → "Ele, na verdade, faz bem": the referent is the unbeliever. The capital comes only from the sentence start, not from the divine-pronoun convention.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__homily-on-the-paralytic-lowered-through-the-roof/review-4.md` (outside the repo).
