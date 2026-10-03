# Translation Journal — Assumption of Mary (pt-BR)

Source: en-US (Alexander Walker translation, Ante-Nicene Fathers Vol. 8, New Advent edition)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Assumption of Mary | Assunção de Maria | |
| Apocrypha (author field) | Apócrifos | As in `protoevangelium-of-james`. |
| Falling Asleep (Greek title) | Dormição | Standard term for the Eastern feast. |
| The Passing of Mary / First / Second Latin Form | A Passagem de Maria / Primeira / Segunda Forma Latina | "Passagem" mirrors Latin *Transitus*. |
| mother of God / holy mother of God | Mãe de Deus / santa Mãe de Deus | Capitalized throughout, as in the sibling Protoevangelium; "mother of the Lord" stays lowercase "mãe do Senhor", following the source. |
| ever-virgin Mary | sempre Virgem Maria | |
| the Lady / our Lady | a Senhora / Nossa Senhora | |
| blessed Mary / most blessed | bem-aventurada Maria / beatíssimo(a) | |
| departure / passing / assumption | partida / passagem / assunção | Kept distinct as in the source. |
| bier / couch | esquife | The source alternates for the funeral litter; one word in pt-BR. "Bed" (Mary's sickbed) stays "leito". |
| censer / cast incense | turíbulo / lançar incenso | |
| powers (of heaven) | potestades | |
| palm (branch) | palma (ramo de palmeira) | |
| girdle / belt | cíngulo / cinto | |
| translation (of the body) | trasladação; verb "transladar" | |
| the Lord's day | o dia do Senhor | |
| Hail, Mary, full of grace! The Lord be with you. | Ave, Maria, cheia de graça! O Senhor seja contigo. | |
| Thanks to God | Graças a Deus | |
| for ever and ever / ages of ages | pelos séculos dos séculos | |
| Tiberia / Hither India / Thebais | Tibéria / Índia Citerior / Tebaida | |
| Labdanus / Jephonias / Reuben | Labdano / Jefonias / Rúben | Rúben as in the Protoevangelium. |
| Sepphora, Abigea, Zaël | Séfora, Abigeia, Zael | |
| Simon the Cananæan / Chananæan | Simão, o Cananeu | Both spellings rendered alike. |
| Thaddæus / Matthias called Justus / Maximianus | Tadeu / Matias, chamado Justo / Maximiano | |
| Thomas called Didymus | Tomé, chamado Dídimo | |
| Joseph of Arimathæa | José de Arimateia | |
| Habakkuk | Habacuque | As in `methodius/oration-concerning-simeon-and-anna`. |
| Gethsemane / Mount Olivet / Mount Zion / Mount Thabor | Getsêmani / monte das Oliveiras / monte Sião / monte Tabor | |
| Valley of Jehoshaphat | vale de Josafá | |
| Gehenna | geena | |
| prætorium | pretório | |

## Translation Decisions

- **Address.** Human singular addressees use *tu*, plural *vós*; prayers to God and to Christ use reverent *Vós* with 2nd-person-plural verbs, as in the sibling Protoevangelium. The source's mix of "you" and "Thou/hast" is flattened accordingly. Christ speaking to Mary uses *tu*.
- **Divine pronouns** capitalized where the source capitalizes them (Ele, O, Lhe, nEle, dAquele); lowercase where it does not.
- **Paragraph numbers** in the Second Latin Form written as inert bold (`**1.**`) instead of the en-US `1. ` list markers, per `.claude/rules/books.md`. The unnumbered paragraph after ¶12 is kept.
- **Inline Scripture references** (ANF/New Advent apparatus) kept in place with pt-BR book names and the source's colon format (`João 19:26-27`, `Cântico dos Cânticos 2:2`), as in the sibling Protoevangelium.
- **Scripture echoes** (Magnificat, Ave, Ps 133:1, Ps 33:22, Mt 27:25, Mt 19:28, Ps 114:1) rendered from the source's wording, not harmonized to a Portuguese Bible.
- **Source italics** (supplied words: "*day*", "*as I am*", "*who have kept*", "*it, and saying*", "*relation;*") kept italic on the corresponding Portuguese words.
- **Obscure source sentences** kept literal rather than smoothed: Greek "canon of the third *day*" (cânon do terceiro *dia*); First Latin Thomas "not knowing the word of God"; Second Latin ¶9 "except that the splendour of the Lord appeared great, and nothing was perceived".
- **Punctuation.** The source's `:—` becomes a colon; its em-dash asides become spaced em dashes.
- **Footnotes.** The source carries none. No translator notes added.
- **Source edits.** None.

## Review log

### Round 1

Focus: completeness paragraph by paragraph (47 ↔ 47 blocks), Scripture references, Bible book names; plus the mechanical audit and `book.json`. Verdict: 3 defects, fixed. Nothing dropped, added, merged or split; all 11 references match.

Fixed:
- Account ¶11 (after five days): "soube-se pelo procurador, e pelos sacerdotes, e por toda a cidade, que…" → "o procurador, e os sacerdotes, e toda a cidade souberam que…". Source: "it was known to the procurator, and the priests, and all the city". The `soube-se por X` form makes them the informants, not the ones who learned.
- Divine-pronoun capitals where the source has lowercase, which breaks the rule under Translation Decisions: Account ¶11 "Aquele que nasceu da virgem" → "aquele" (procurator, source "he who was born"); Account ¶12 "respondeu e Lhe disse" → "lhe" (source "said to him"); First Latin, Joseph ¶ "o Seu santíssimo templo" → "seu" (source "his most sacred temple").
- Second Latin ¶9: "a não ser que o esplendor do Senhor aparecia grande" → "exceto que …". *A não ser que* needs the subjunctive; the source ("except that the splendour … appeared great") states a fact, so the sentence uses *exceto que* + indicative, still literal.

Rejected:
- Account ¶12 "a todo homem que invocar, ou orar a, ou pronunciar o nome da Vossa serva": the dangling "orar a" copies the source's zeugma ("calling upon, or praying to, or naming the name of, Your handmaid"). Leave it.
- Account ¶11 "a qual pensastes em expulsar": the source's "whom" could refer to the Son or the virgin. The Jews had asked to "chase her" from Bethlehem, so the feminine reading is justified.
- Account ¶7 "Tadeu, que tinham adormecido" (plural): "who had fallen asleep" covers everyone raised from the tombs in that sentence.
- First Latin, Reuben: "quis lançar por terra" completes the source's verbless fragment ("wishing to throw"). This is defensible smoothing, not an addition.
- Second Latin ¶7 "reclinou-se no seu leito" for "couch": this is Mary's deathbed, not the funeral litter, so it falls under the Key Terms "leito" rule, not "esquife".
- "adored" (of Mary) → "reverenciar" (Account ¶8, First Latin John ¶): this is a theological register choice. "adored Him" (of God/Christ) stays "adorar".

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of the whole text, plus the mechanical audit and `book.json`. Verdict: 3 defects, fixed. All three are Scripture echoes that used the familiar Portuguese Bible or liturgical verb instead of the source's verb, which made the Translation Decisions claim ("rendered from the source's wording") false.

Fixed:
- Account, Magnificat (Lk 1:48): "todas as gerações me chamarão bem-aventurada" → "me terão por bem-aventurada". Source: "shall count me blessed", not "call".
- Second Latin, unnumbered ¶ after ¶12 (Mt 27:25): "O seu sangue caia sobre nós" → "seja sobre nós". Source: "His blood be upon us". *Caia* ("fall") is the Bible's verb.
- Second Latin ¶15 (Ps 33:22): "Venha sobre nós, ó Senhor, a Vossa misericórdia" → "Seja sobre nós". Source: "Let Your mercy, O Lord, be upon us". *Venha* follows the liturgical response.

Rejected:
- First Latin, Thomas ¶ "porque tinham sido convencidos pelas palavras de Tomé" (source "because they had been convicted by the words of Thomas"): *convencer* also means "to prove someone wrong", and the reading "persuaded" fits the context too. Leave it.
- First Latin, opening "entre muitas palavras que a mãe pedia ao Filho" (source "among many words which the mother asked of the Son"): *pedir* covers "ask of" here. This is not a mistranslation.
- Account ¶ "decidem enviar gente contra" (source "they determine to send against"): *gente* supplies the object that the English leaves implicit. No content is added.
- Second Latin ¶2 "ordenou a salvação para Jacó" (source "commanded safety to Jacob"): Latin *salus* covers both "safety" and "salvation". This is a style choice.
- Second Latin ¶15 "pareceu-nos justo" (source "it had seemed to us … to be right"): the English pluperfect is an archaic conditional. *Pareceu-nos* keeps the sense.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, each mark then checked against the source; then a mechanical sweep of spelling, diacritics, crase, hyphenation, punctuation and quotation marks; plus the mechanical audit and `book.json`. Verdict: 1 defect, fixed. Key Terms rows and decision claims re-grepped against the text and still hold.

Fixed:
- Account, Mary to the apostles: "de que países e através de que distância viestes para cá, para assim vos apressardes a visitar-me" → "…, de modo que assim vos apressastes a visitar-me". Source: "that you have thus made haste to visit me". The source states a completed fact (result clause, present perfect). *Para* + personal infinitive turned it into a purpose clause, which does not make sense: they did not come in order to hurry.

Rejected:
- Account, opening "Estando a toda santa … Maria … a ir ao santo sepulcro" (source "As the … mother of God … was going to the holy tomb"): *estar a* + infinitive reads as European Portuguese, but it is grammatical and the sentence keeps the source's anacoluthon on purpose. Register choice.
- Account, "E assim a multidão dos judeus, tendo-se dirigido a Belém, aconteceu que, … viram" and First Latin, Thomas ¶ "E, vendo-se e beijando-se uns aos outros, o bem-aventurado Pedro disse-lhe": both broken constructions copy the source ("the multitude … when at the distance of one mile it came to pass that they beheld"; "And seeing and kissing each other, the blessed Peter said"). Leave them.
- Second Latin ¶8 "espera até que eu venha a vós" (source "wait until I come to you"): Peter alone gets the order to wait, but Christ comes back to all the apostles (¶15). The English "you" allows both readings, so the shift from *tu* to *vós* is defensible.
- Second Latin ¶10 "confiou-a a ti" (source "entrusted her to you"): grammatically *a* could point to "esta palma", but the cross scene (¶1, John 19:26-27) makes Mary the only possible referent. The English is just as implicit.
- Second Latin ¶3 "instruindo-o de que a fizesse levar" (source "instructing him that he should cause it to be carried"): *instruir alguém de* ("inform someone of") is a valid regency.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-3.md`.

### Round 4

Focus: function words, headings and the places where Portuguese must commit and the source does not (referent gender, pronoun antecedents, tu/vós traced turn by turn); plus the mechanical audit and `book.json`. Verdict: 1 defect, fixed. Headings, block count (46 blank-line breaks in each file), the bier/couch → esquife/leito counts (25 + 1 + 2) and the girdle/belt rows still hold.

Fixed:
- Account, last ¶: "tal como é dado às virgens, e só a elas, ouvir" → "aos virgens, e só a eles". Source: "such as is given to virgins, and them only, to hear". The source does not give the gender. The passage echoes Rev 14:3-4, where the song only the virgins can learn belongs to men "not defiled with women", and the Greek *parthenois* is common gender. The feminine article and pronoun limited the claim to women. The generic masculine keeps it open.

Rejected:
- Account, apostles' replies to Mary ("set me down in the same place as you", "beside you", "brought me to you") → *vós*: Paul's "same place as you" can only be plural, and the apostles arrived together. John's "the door where you are lying" stays *tu*, because "lying" points to Mary alone.
- Account, "having gone up to her feet and adored" → "os apóstolos, tendo-se aproximado dos seus pés": *seus* could grammatically point to the subject, but "ela diz isto" comes just before and the apostles cannot approach their own feet.
- Account, "the Lord stretched forth His undefiled hands, and received her holy and blameless soul" → "as Suas imaculadas mãos … a sua alma"; First Latin, "came out of her though her womb was closed" → "o seu ventre": the text capitalizes divine possessives, so lowercase *sua*/*seu* marks Mary.
- Account, "a stream of light coming to the holy virgin" → "vinha sobre a santa virgem": *sobre* fits light that comes to a person. The sense is unchanged.
- Account, "Just as I was going in to the holy altar" → "Quando eu entrava": the temporal sense is kept. The emphasis that drops is a style matter.
- First Latin, "the holy body was taken up by angels" → "pelos anjos": a generic plural takes the article in Portuguese.
- Second Latin ¶2, "Behold, said He" → "disse ele": the speaker is the angel. The source's capital is not a divine pronoun, so the Translation Decisions rule does not apply.
- Second Latin ¶7, "when he was able to find in me no trace" → "como não pôde achar": the clause gives the reason the prince of darkness left. Causal *como* is defensible.
- Second Latin ¶8, "send it to the right hand side of the city" → "leva-o": Peter lays the body in the tomb himself ("in which you will lay her"), so the verb's sense, to have the body brought there, is kept.
- Second Latin ¶9, "the three virgins, who were in the same place, and were watching" → restrictive clause with no commas: the house has only three virgins, so the restrictive clause sets no other group apart.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-4.md`.

### Round 5

Focus: terms, journal and names. A term-frequency diff per paragraph against the Key Terms table in both directions; every falsifiable journal claim grepped; every proper name checked against standard Portuguese and the sibling pt-BR works in `church-fathers/`; plus the mechanical audit and `book.json`. Verdict: clean. No changes.

Rejected:
- "taking her departure" (Account, apostles' reports ×3) → "está partindo", not *partida*: the English noun phrase is idiomatic for the verb "depart", and *partir* belongs to the same term family. Every *partida* in the text renders "departure".
- Key Terms row "Joseph of Arimathæa | José de Arimateia": the text reads "José, da cidade de Arimateia" (source "Joseph of the city of Arimathæa"). The row records the name form, not a quoted phrase. Neither column appears verbatim in its file, and the name form matches.
- "Isaac" rather than "Isaque": the sibling pt-BR works use *Isaac* 45 times and *Isaque* 7 times. Both are standard.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-5.md`.

### Round 6

Focus: completeness paragraph by paragraph (47 ↔ 47 blocks, sentence by sentence), quotations, dash asides, source italics, Scripture references and Bible book names; plus the mechanical audit and `book.json`. Verdict: clean. No changes.

Rejected:
- First Latin, Joseph ¶ "venerated and worshipped" → "venerada e honrada": this is the same register choice for Mary as Round 1's "adored" → "reverenciar". It is not a mistranslation.
- Second Latin ¶15 "A paz esteja convosco" vs ¶17 "A paz seja convosco": the source varies ("Peace be with you" / "Peace be to you"), and the pt-BR follows that variation.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__assumption-of-mary/review-6.md`.
