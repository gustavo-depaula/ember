# Translation Journal — On the Creed: A Sermon to Catechumens (pt-BR)

Source: en-US (trans. H. Browne, Nicene and Post-Nicene Fathers, First Series, Vol. 3; via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Augustine of Hippo | Agostinho de Hipona | author field; matches the corpus's "X of Place" → "X de Place" pattern with no added honorific (`clement-rome/first-epistle`: Clement of Rome → Clemente de Roma; `dionysius-rome`: Dionysius of Rome → Dionísio de Roma; `gregory-nyssa`: Gregory of Nyssa → Gregório de Nissa; `ignatius/*`: Ignatius of Antioch → Inácio de Antioquia). The row previously read "Santo Agostinho de Hipona", citing `augustine-confessions/pt-BR` as precedent for "Santo Agostinho" — but that file's author field is "Agostinho, Santo, Bispo de Hipona (345-430)", a library-catalog format where "Santo" is a separate descriptor, not "Santo Agostinho" as a unit; it does not support the claim and was corrected (review round 1, 2026-09-27) |
| the Creed / the Symbol | o Credo / o Símbolo | title uses "Credo" as the source does; "Símbolo" only where the source says Symbol (¶1) |
| Rule of Faith | Regra da Fé | |
| catechumen(s) | catecúmeno(s) | as in `ambrose/mysteries` and `augustine-confessions`; capitalized in ¶16 where the source capitalizes |
| Almighty / Omnipotence | Todo-Poderoso / Onipotência | never "Onipotente" for Almighty: ¶2-¶5 argue from the one word |
| Only Son / the Only | Filho único / o Único | ¶3 "One begets One, and therefore Only" → "Um gera Um, e por isso Único" keeps the link |
| begets / engenders | gera / engendra | two verbs kept distinct as in the source |
| coeval / coeternal | coevo / coeterno | ¶8's argument stretches one into the other; both kept as single words |
| Holy Ghost | Espírito Santo | as in Confessions and Ambrose |
| Nativity (of Christ) | Nascimento | capitalized where the source capitalizes |
| lowly / lowliness / stooped | humilde / humildade / inclinou-se | |
| exsufflation, exorcism | exsuflação, exorcismo | technical name of the baptismal rite |
| the end of the Lord | o fim do Senhor | Jas 5:11; "fim" held in every occurrence in ¶10 since Augustine glosses it |
| forsaken / leave / left (¶10) | abandonar / abandonado | one verb: the gloss "leave Him for present felicity" hangs on the Psalm's "forsaken" |
| dwell / seats (*sedit*, *sedes*) | residir / sedes | Portuguese "sede" carries the seat→dwelling link of the Latin |
| dearness of love | ternura do amor | ¶4 (twice) and ¶13 |
| build / create | edificar / criar | kept apart in ¶13, where both verbs work in the argument |
| Forgiveness of sins / remitted | perdão dos pecados / perdoados | ¶16 "remitted" rendered "perdoados" so it points back to the article in ¶15 |
| venial | venial | |
| soldier's mark | marca do soldado | |

## Translation Decisions

- 2026-09-27: Address. Augustine speaks to the catechumens in the plural throughout (source mixes "you"/"ye"): rendered with "vós" and 2nd-person-plural verbs, as `ambrose/mysteries/pt-BR` does for a homily to the newly baptized. Where the source turns to a single imagined hearer (¶10 "If what you have lost you seek…", ¶15 "What have you done?"), "tu" is used, matching the shift the Latin makes.
- 2026-09-27: Pronouns for God lowercase ("ele", "nele"), as in `ambrose/mysteries/pt-BR`; divine nouns and titles keep the source's capitals (Pai, Filho, Verdade, Médico, Cabeça, Videira).
- 2026-09-27: Creed articles rendered from the source's wording, not the familiar Portuguese Apostles' Creed: "Nascido do Espírito Santo e da Virgem Maria" (not "concebido pelo poder do Espírito Santo, nasceu da Virgem Maria"), "Subiu ao céu" (singular, as the source), "Donde há de vir a julgar os vivos e os mortos", "A santa Igreja" (no "católica" in the article; the word appears only in Augustine's gloss), "O perdão dos pecados", "a ressurreição da carne", "Para a vida eterna" (source "Into"). "Creio em Deus Pai Todo-Poderoso" and "Padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado" coincide with the familiar text.
- 2026-09-27: Scripture quotations follow the source's wording. The source gives no chapter-and-verse references, so none were added. ¶15 the Lord's Prayer is "Perdoai-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores" (source "debts"), not the familiar pt-BR "ofensas". ¶10 Ps 22:1 "por que me abandonastes?" uses the reverent "Vós" for address to God, per the `augustine-confessions/pt-BR` convention, rather than the psalter's "abandonaste". ¶4 "No man can serve two Lords" keeps the capital, since Augustine is arguing about "two Lords" in the Godhead.
- 2026-09-27: Footnotes. The source carries no editor footnotes; nothing dropped. The editorial brackets "[in Latin]" (¶11) and "[this article of]" (¶15) are kept as brackets. The stray space in "(or Creed )" is a transcription artifact; rendered "(ou Credo)".
- 2026-09-27: ¶3 "Man besets not an ox" is an OCR slip for "begets" in the New Advent text; translated as "gera". The en-US file was not edited in this pass.
- 2026-09-27: Paragraph numbers written `**N.**` per `.claude/rules/books.md`. The en-US file still uses `N.` list markers; the numbering is a gapless 1–17, so it renders correctly, but it should be converted in a later pass.
- 2026-09-27: ¶7 "For whom?" → "Em favor de quem?", since "Por quem?" also reads "by whom?". ¶12 "not yet is the Trinity perfect" → "a Trindade ainda não está completa": the sense is that the exposition has not yet reached the third Person; "perfeita" would suggest a defect in the Trinity.
- 2026-09-27: ¶8 "put you on the stretch" → "vos ponha em aperto"; the English pun on "stretch the coeval" is not reproducible and is not in the Latin argument.
- 2026-09-27 (review round 2, reverted round 3): ¶11 "conforme à piedade" was changed to "conforme a piedade" on the claim that "conforme" never takes crase. That rule holds only for "conforme" as an invariable preposition/conjunction ("conforme a lei manda" — no preposition "a" is needed to link it to what follows). Here "conforme" is a predicative adjective after "ser" ("Acaso é conforme a/à piedade dispô-los..." = "is [this] in conformity with piety to arrange them...?"), the same construction as 1 Tm 6:3 "a doutrina que é conforme à piedade" — an adjective governing the preposition "a", which does contract with a following feminine noun. Reverted to "conforme à piedade" (round 3, 2026-09-27).
- 2026-09-27 (review round 3, count corrected round 4): Term-frequency diff of every Key Terms row, both directions, per paragraph. All rows balance once inflection and phrase-order differences are accounted for (e.g. "venial" 1× ↔ "veniais" 1×, plural required by the Portuguese antecedent "pecados"). The "Only Son" row was misreported as "9× ↔ 9×"; re-checked by grep (round 4, 2026-09-27), the true counts are "Only" (doctrinal sense, i.e. excluding the two discourse uses of "Only," meaning "however") 11× ↔ "único/Único" 11×, matching 1:1 by paragraph (¶3 ×6, ¶5/¶6/¶7/¶8/¶12 ×1 each). Two counts were investigated and left as-is, not defects:
  - ¶8: "coevo" appears 11× against "coeval" 10× — the source elides the second adjective in "this father coeval with son, or son with father"; the translation spells out "filho coevo do pai" instead of "filho do pai". Meaning unaffected, no fix.
  - ¶2: "criatura(s)" appears 7× against "creature(s)" 6× — "the air with things that fly" is rendered "o ar das criaturas que voam", adding "criaturas" where the source just has "things"; the referents are still creatures, no wrong content. No fix.
- 2026-09-27 (review round 3): Commitment-point sweep (pronoun antecedents, seu/dele, gender/number of relative-clause referents, but/for/therefore, tu/vós) across all 17 paragraphs, with attention to ¶10 (Job, God, devil, wife all in play) and ¶17 ("a Cabeça" as a feminine noun for Christ). No wrong commitments found: Portuguese's invariant relative "que" and null subject sidestep most of the antecedent choices English pronouns force, and the tu-shift in ¶10/¶15 (established round 1) is applied consistently in every quoted and narrated sentence, including the archaic "praisest" → "louvas" and the Job 1:8 quotation "Reparaste... no meu servo Jó?".
- 2026-09-27: The en-US OCR slips recorded in this journal were corrected in the en-US source. The pt-BR text already rendered the corrected reading.
