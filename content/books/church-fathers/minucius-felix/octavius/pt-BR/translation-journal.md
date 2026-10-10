# Translation Journal — Octavius (pt-BR)

Source: en-US (trans. Robert Ernest Wallis, Ante-Nicene Fathers, Vol. 4; via New Advent). No Latin directory exists, so the en-US file is the source.
Target: pt-BR

No other Minucius Felix work has pt-BR. Conventions are taken from `justin-martyr/first-apology/pt-BR` (the closest apologetic sibling) and `ambrose/repentance/pt-BR`: curly quotes “ ” with ‘ ’ inside, `vós` for plural address, Roman god names in their Portuguese forms, chapter headings as `## Capítulo N. …`.

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| Minucius Felix (author) | Minúcio Félix | book.json `author`; no "São", as with Tertuliano, Lactâncio |
| Octavius (title, speaker) | Otávio | Brazilian spelling |
| Cæcilius / Natalis | Cecílio / Natal | Natalis is Cecílio's cognomen (Ch. 16) |
| Marcus (Minucius) | Marco | |
| Januarius (Octavius's cognomen, Ch. 15) | Januário | |
| Argument (chapter summary) | Argumento | `## Capítulo 5. Argumento: …` |
| superstition / religion | superstição / religião | kept distinct; "religions" (plural, rites) → "religiões" |
| the gods / deity / divinity | os deuses / divindade / divindade | |
| demons | demônios | |
| the Magi | os magos | also "magicians" (Ch. 26) |
| auspices / auguries | auspícios / augúrios | |
| providence / fate / fortune | providência / destino / fortuna | "fate" as the doctrine or the gods' decree (Ch. 7, 11, 36) is *destino*. A man's lot is *sorte*: "the fates of good and bad men" (Ch. 5), "the uncertainty of fate" (Ch. 9), "the fate of Protesilaus" and "their destiny" (Ch. 11), "this fortune" of the Jews (Ch. 33), "one lot" (Ch. 37). "Lots" cast for divination (Ch. 27) → *sortes* |
| Parent (of all) | Pai | capitalized as in the source |
| Artificer / Architect | Artífice / Arquiteto | capitalized only where the source is; *artífice* also renders "contriver" (Ch. 5) and "Supreme Artist" (Ch. 17) |
| Genius | Gênio | |
| the Idæan mother | a Mãe do Ida | |
| Jupiter, Juno, Mars, Venus, Vulcan, Neptune, Minerva, Mercury, Saturn, Janus, Diana, Ceres, Proserpine, Bacchus, Æsculapius | Júpiter, Juno, Marte, Vênus, Vulcano, Netuno, Minerva, Mercúrio, Saturno, Jano, Diana, Ceres, Prosérpina, Baco, Esculápio | as in the Justin pt-BR |
| Serapis, Isis, Osiris, Apis, Cynocephalus | Serápis, Ísis, Osíris, Ápis, Cinocéfalo | |
| Latiaris, Feretrius, Capitolinus, Hammon | Laciar, Ferétrio, Capitolino, Amon | *Laciar* as in `tatian/address-to-the-greeks`; Ammon in the standard Portuguese form |
| Taurians (Ch. 6) / Tauri (Ch. 30) / Tauris (Ch. 25) | tauros / tauros / Táuris | one people, one name |
| the Mantuan Maro (Virgil) | o Marão mantuano | |
| Fronto / the Cirtensian | Frontão / o Cirtense | |
| harlot | meretriz | as in `ambrose/repentance` |
| warfare (of the Christian) | milícia | Ch. 36, 37 |

## Translation Decisions

- **Address.** Cecílio speaks to Marco as tu and to the Christians as vós; the singular apostrophe in Ch. 12 ("You, who dreamest…") is tu. Otávio addresses his two listeners and the pagans as vós, Cecílio alone as tu, and the generic reader as tu.
- **Divine pronouns** lowercase (ele, seu). The source capitalizes He/Him inconsistently, and much of the text speaks of pagan gods with the same pronouns; lowercase throughout keeps the file internally consistent.
- **Speech framing.** The source opens Cecílio's speech (Ch. 5) without quotes and closes it with a quoted Ch. 13, and gives Otávio's speech no quotes. Mirrored.
- **Editor notes dropped.** Two ANF editor elucidations (on "the neighing of horses", after Ch. 18, and on "from nothing", after Ch. 34) are not Minucius's text and are omitted. Hence 84 non-empty lines in pt-BR against 86 in en-US; every heading and every paragraph of the author's text has its counterpart.
- **Latin passage (Ch. 28).** The ANF translator left one obscene passage in Latin; it stays in Latin, untranslated, as in the source.
- **Rendered by sense** where the en-US transcription is garbled (en-US left as is):
  - Ch. 2 heading "Cæcillus" → "Cecílio".
  - Ch. 21 "stolen away in her wandering, and corrupter" → "roubada e violada na sua errância".
  - Ch. 22 "who in the Trojan was allowed your gods" → "na guerra de Troia, permitiu que os vossos deuses".
  - Ch. 29 "crosses glided and adorned" → "cruzes douradas" (gilded).
  - Ch. 34 stray period in "do not flourish again. unless" → normal punctuation.
- **Mirrored, not corrected:** Ch. 26 "Sosthenes" (the Latin has Hostanes) → "Sóstenes"; Ch. 19 "Xeuxippus" (Speusippus) → "Xêusipo".
- **Ch. 22 "(latent)"** kept in italics as the Latin word the pun on *Latium* rests on.

## Source edits

- Ch. 28 Latin passage: "impudicitæ eorum" → "impudicitiæ eorum" and "iota impudicitia" → "tota impudicitia" (OCR slips; the Latin text reads *impudicitiae* and *tota*).

## Review log

### Round 1

Focus: completeness, paragraph by paragraph, plus the mechanical audit. Verdict: 2 defects, fixed. Paragraphs align 84 ↔ 84 once the two editor notes are set aside; italics, parentheticals and the Latin passage are all present; the book has no Scripture references.

Fixed:
- Ch. 27 "whom at a distance they harassed by your means in their assemblies": "nas vossas assembleias" → "nas suas assembleias". The source's possessor is "their", not "your".
- Ch. 31 "(various of us unviolated)": "invioláveis" → "inviolados". *Inviolável* means "that cannot be violated", which the source does not say.

Rejected (do not re-raise):
- Ch. 5 heading "Concerning the Chief of Things" → "a respeito do princípio das coisas": *princípio* as first principle covers "chief of things".
- Ch. 12 "God suffers it, He feigns" → "finge não ver": intransitive "feigns" needs an object in Portuguese. The sense is kept.
- Ch. 18 "nor estimated; He is greater than all perceptions" → "nem avaliado — é maior…": only the punctuation differs. Nothing is dropped.
- Ch. 24 opening question → exclamation; Ch. 25 "Doubtless … growing empire." → "!": the irony is in the source, and the punctuation is a style choice.
- Ch. 41 "the very great invidiousness of judging" → "o grandíssimo odioso encargo de julgar": stacked adjectives are a style choice.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-1.md`.

### Round 2

Focus: a clause-by-clause bilingual fidelity read of the whole text, plus the mechanical audit. Verdict: 2 defects, both fixed.

Fixed:
- Ch. 19 "as the Parent of all has appointed His day": "lhes determinou o dia" → "determinou o seu dia". The source's possessor is the Parent's day, not the men's.
- Ch. 25 "by whose feeding or abstinence": "pela cuja alimentação" → "por cuja alimentação". *Cujo* takes no article.

Rejected (do not re-raise):
- Ch. 7 "temples and lanes of the gods" → "templos e santuários": the Latin is *delubra*, and "lanes" is probably an f/l scan slip for "fanes". The en-US was left unedited because the printed ANF reading could not be checked this round. *Santuários* is right either way.
- Ch. 11 "rise again after death, and ashes, and dust" → "depois da morte, das cinzas e do pó": *das*/*do* are governed by *depois*, so the sense "after" is kept.
- Ch. 16 "What then?" → "Que fazer, então?": a rhetorical pivot into the traveller simile. The added verb does not change what is said.
- Ch. 23 "if the gods could create" → "pudessem gerar": the context is the gods' begetting (Juno, Minerva bearing children), so *gerar* is the sense of "create" here.
- Ch. 5 "the (divine) majesty, of which so many… (still doubt)" → "sobre a qual": the English antecedent is itself open, and majesty is the nearest reading.
- Ch. 37 "had it in their power to be sent away" → "estava em seu poder ser deixados ir": an uninflected infinitive with a plural predicative is admissible.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-2.md`.

### Round 3

Focus: a source-blind cold read of the pt-BR, with each mark then checked against the en-US; then a spelling, diacritics, crase, hyphenation and quote-pairing sweep, plus the mechanical audit. Verdict: 3 defects, all fixed.

Fixed:
- Ch. 5 "Man, and every animal which is born, inspired with life, and nourished, is as a voluntary concretion": "recebe o sopro da vida e se nutre, é como" → "animado pelo sopro da vida e nutrido, é como". The sentence had two finite predicates with no connector. The source has participles.
- Ch. 26 "which you have collected … and have borne testimony that": "e de que deste testemunho de que" → "e acerca dos quais deste testemunho de que". *Testemunho* had two *de* complements.
- Ch. 37 "Do you boast of the fasces…?": "Gloria-te" → "Glorias-te". *Gloria-te* is the imperative. The question needs the indicative, like the neighbouring "Elevas-te?", "Louvas?".

Rejected (do not re-raise):
- Ch. 14 "Restrain your self-approval against him" → "Contém a tua complacência contra ele": *complacência* also means self-satisfaction (*comprazimento*), and the chapter's own Argument glosses it as "orgulho de quem está satisfeito consigo". It is not a false friend here.
- The Ch. 16 shift to "a tua informação" with Natal in the third person, the Ch. 24 and Ch. 31 shifts to the third person ("saberem", "estão de se entregar"), the Ch. 31 run-on "com um corpo ainda mais casto (…) gozamos", the Ch. 17 doubled "não só", and the Ch. 19 "‘…homens.’ e que" punctuation all mirror the source's own wording.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-3.md`.

### Round 4

Focus: function words, headings, and the places where the Portuguese must commit and the source is open: a turn-by-turn tu/vós trace, pronoun gender and antecedent, possessive *seu*, and adversative connectors. Plus the mechanical audit. Verdict: 2 defects, both fixed.

Fixed:
- Ch. 31 "It was thus your own Fronto acted": "o vosso Frontão" → "o teu Frontão". Cecílio is the one who cited Fronto ("our Cirtensian", Ch. 9), and the Latin is *tuus Fronto*. Otávio answers Cecílio's own points in tu elsewhere too (Ch. 26, 27, 28, 33). The next sentence, "your own nations", stays plural (*vestris*).
- Ch. 40 "I do not wait for the decision. Even thus we have conquered": "Mesmo assim vencemos" → "Também assim vencemos". *Mesmo assim* reads as "nevertheless" and adds a concession. "Even thus" means "in this way too" (*sic vicimus*).

Rejected (do not re-raise):
- Ch. 11 "and as if it mattered not whether wild beasts tore the body" → "e como se importasse que…": the English "as if … not" follows the Latin *quasi non … resolvatur, nec intersit*, where *non* governs both clauses. Cecílio means the Christians act as though it made a difference. "Como se não importasse" would reverse his argument.
- Ch. 27 heading "But They are Constrained to Confess" → "constrangidos a confessá-lo": *-lo* points back to "Estas coisas não vêm de Deus". That is what the demons confess in the chapter.
- Ch. 32 "if you think rightly" → "se pensais retamente": a generic address after a plural "pensais". The en-US is open.
- Ch. 8 "When the men of Athens … expelled Protagoras" → "Se os homens de Atenas expulsaram": a factual *se* with the indicative keeps the a fortiori argument.
- Ch. 9 heading "the Nature of Their Father" → "as partes naturais do seu pai": the sense of the text's "*virilia* … the nature … of their common parent". It is not an addition.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-4.md`.

### Round 5

Focus: Key Terms, journal claims, and proper names. A per-chapter term-frequency diff in both directions, a grep of every falsifiable journal claim, and every proper name checked against standard Portuguese and sibling pt-BR works. Plus the mechanical audit. Verdict: 3 defects, all fixed.

Fixed:
- Ch. 6 "the Taurians, Diana": "os táurios" → "os tauros". Ch. 30 already has "os tauros do Ponto" for the same people, and *tauros* is the standard Portuguese name.
- Ch. 21 "when he is called Hammon": "Hamon" → "Amon". *Amon* (Júpiter Amon) is the standard Portuguese form. Key Terms row updated.
- Key Terms "fate → destino" and "fortune → fortuna" were false as blanket rules. Six places render a man's lot as *sorte* (Ch. 5, 9, 11 ×2, 33, 37), and the Latin there is *fata*/*sors*/*fortuna* in the sense of lot. The text is right. The row now records the split. Also noted: *magos* also renders "magicians" (Ch. 26), and *artífice* also renders "contriver" (Ch. 5) and "Supreme Artist" (Ch. 17).

Rejected (do not re-raise):
- Ch. 21 "Persæus" → "Perseu": the Stoic Persaeus of Citium is *Perseu de Cítio* in Portuguese, so the form is standard.
- Ch. 7 "the victory over the Persian" → "sobre o persa": the Latin is *de Perse* (Perses of Macedon). The ANF reads "Persian", and the reading is mirrored like Sóstenes and Xêusipo.
- Ch. 7 "Claudius" / Ch. 26 "Clodius" → "Cláudio" / "Clódio": the source spells the same consul two ways. Mirrored.
- Ch. 26 "Pyrrhus" and Ch. 38 "Pyrrho" both → "Pirro": Portuguese uses *Pirro* for the king and for the philosopher (Pirro de Élis).
- Ch. 22 "neither could the Cyclops imitate" → "nem os Ciclopes": English "Cyclops" is open for number. The scene is Vulcan's forge making Aeneas's arms, where the Cyclopes work together.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-5.md`.

### Round 6

Focus: completeness, paragraph by paragraph, re-run in full, plus Bible names and references, plus the mechanical audit. Verdict: clean, no changes. The book cites no Scripture by chapter and verse, so there are no Bible names or numbers to check.

Rejected (do not re-raise):
- Ch. 19 “For we both know and speak of a God … and never speak of Him in public” → “conhecemos e anunciamos um Deus … e nunca falamos dele em público”, and “impossible to speak of in public” → “impossível de anunciar em público”. The Latin is *dicimus*/*praedicamus* and *in publicum dicere*, so *anunciar* keeps the sense.
- Ch. 22 “Elsewhere Hercules threw out dung, and Apollo is feeding cattle” → “Hércules remove esterco, e Apolo apascenta”. The source already mixes tenses. The historical present is a style choice and changes no fact.
- Ch. 36 “so are we declared by critical moments” → “somos provados”: *provar* also means “to demonstrate”, which is the sense of *declaramur*.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-6.md`.

### Round 7

Focus: a clause-by-clause bilingual fidelity read of the whole text, plus the mechanical audit. Verdict: 1 defect, fixed.

Fixed:
- Ch. 27 "lest, if known, they should either imitate us, or not be able to condemn us": "para que, conhecidos, não nos imitem ou não sejam capazes de nos condenar" → "para evitar que, conhecidos, nos imitem ou não sejam capazes de nos condenar". With *para que*, the second member stated the demons' aim as men being unable to condemn, the reverse of the source (Latin *ne … damnare non possint*). The negation of "lest" has to govern both members.

Rejected (do not re-raise):
- Ch. 38 "Why do we grudge if the truth of divinity has ripened" → "Por que nos ressentimos": "grudge" here means resenting the event, and *ressentir-se* says that.
- Ch. 19 "Xenophanes delivered that God was all infinity with a mind" → "Deus era todo infinito com uma mente": follows the English wording. It is not a mistranslation.
- Ch. 35 "the punishment destined to him, with his worshippers, he shudders" → "o castigo que lhe está destinado com os seus adoradores, estremece": the English attachment of "with his worshippers" is open. Either reading has Jupiter share the punishment with his worshippers.
- Ch. 25 "for against their own people neither did the Thracian Mars … assist them" → "contra o seu próprio povo não os ajudaram": mirrors the source's own construction.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-7.md`.

### Round 8

Focus: a source-blind cold read of the pt-BR, with each mark then checked against the en-US; then a spelling, diacritics, crase, hyphenation, punctuation and quote-pairing sweep, plus the mechanical audit. Verdict: clean, no changes.

Rejected (do not re-raise):
- Ch. 17 "so manifest … than that there is some Deity" → "tão manifesto … como que existe alguma Divindade": the *tão … como* frame makes *que existe* a completive clause in the comparison. It cannot be read as *como que* ("as if").
- Ch. 18 "Is it not given by God, and that the breasts should become full" → "Não é dado por Deus, assim como que os seios se encham": *assim como* joins a second subject clause to "é dado por Deus". The sentence parses.
- Ch. 12 "they who have no capacity for understanding civil matters, are much more denied the ability" → "aqueles que não têm capacidade …, muito mais lhes é negada a capacidade": a hanging topic picked up by *lhes*. This is an accepted construction and the sense is intact.
- Ch. 5 "all men must be indignant … that certain persons … should dare" → "devem indignar-se … que certas pessoas … ousem": dropping *de* before *que* after *indignar-se* is accepted usage.
- Ch. 6 "their power and authority occupied" → "o seu poder e autoridade ocupou": one determiner covers both nouns, so the singular verb is admissible.
- Ch. 18 "if Lord, you will certainly understand Him as mortal" → "certamente o entenderás": the future tense after two conditionals is the source's own.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-8.md`.

### Round 9

Focus: function words, headings, and the places where the Portuguese must commit and the source is open: a turn-by-turn tu/vós trace, pronoun gender and antecedent, possessive *seu*/*sua*, *consigo*, and concessive and adversative connectors. Every heading was checked. Plus the mechanical audit. Verdict: 2 defects, both fixed.

Fixed:
- Ch. 20 heading "Although Delighted with Its Own Fables, It Has Brought in Ridiculous Traditions": "deleitada com as suas próprias fábulas, introduziu" → "embora deleitada com as suas próprias fábulas, introduziu". The concessive was dropped, and a bare participle at the head of the clause reads as causal.
- Ch. 24 "Spiders … weave their webs over his face, and suspend their threads from his very head": "sobre o seu rosto e penduram os seus fios da sua própria cabeça" → "sobre o rosto dele e penduram os seus fios da própria cabeça dele". With the spiders as subject, *sua própria cabeça* read as the spiders' own head. The source's "his" is the idol's.

Rejected (do not re-raise):
- Ch. 15 heading "that He is Foregoing the Office … When He is Weakening the Force of His Argument … All that He Had Advanced" → "que ele está renunciando … do seu argumento … tudo o que ele havia apresentado": the English pronouns are just as open. The body (Ch. 15, "my pleading") settles the sense.
- Ch. 10 "that fabric in which it is contained and bound together" → "aquela construção em que ela está contida e coesa": *ela* takes the nearest feminine, "a estrutura celeste", which is the natural reading of the open English "it".
- Ch. 21 "the tomb of your Serapis" → "o teu Serápis" among plural "vossos deuses" and "vosso próprio Júpiter": Cecílio is the one who kissed the Serapis image (Ch. 2), so tu is the right commitment there. It is not a slip in address.
- Ch. 19 heading "the Creator of All Things, and Their Mind and Spirit" → "e sua mente e espírito": *sua* admits a plural possessor and is no more committed than "Their".

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-9.md`.

### Round 10

Focus: Key Terms, journal claims, and proper names. A per-paragraph term-frequency diff in both directions against every Key Terms row, a grep of every falsifiable journal claim (including the quoted forms in rounds 1–9), and every proper name checked against standard Portuguese and sibling pt-BR works. Plus the mechanical audit. Verdict: clean, no changes.

Rejected (do not re-raise):
- Key Terms "Jupiter … Æsculapius → … as in the Justin pt-BR": Juno and Jano occur in no Justin pt-BR work. The other thirteen forms are there (first-apology, discourse-to-the-greeks). *Juno* and *Jano* are the only Portuguese forms, so the row prescribes nothing that a sibling contradicts.
- Augury count 11 in the source against 9 *augúri-*: Ch. 7 "inaugurated the rites" → "instituíram os ritos" and Ch. 25 "Augurs" → "Áugures" are not the term "augury". Ch. 20 "auspicious wounds" → "feridas propícias" is likewise not "auspices".
- "Galli" → "Galos" (Ch. 21) but "gauleses" (Ch. 30): Ch. 21 means Cybele's eunuch priests, and Ch. 30 means the Gauls (Latin *Gallis Mercurio*). Two referents, not an inconsistency.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-10.md`.

### Round 11

Focus: completeness, paragraph by paragraph, with every paragraph pair read unit by unit; Bible names and references; plus the mechanical audit. Verdict: clean, no changes. The book has no Scripture references, as Round 6 found.

Rejected (do not re-raise):
- Ch. 12 "you reject the public banquets, and abhor the sacred contests; the meats previously tasted by, and the drinks made a libation of upon, the altars." → "abominais os jogos sagrados, as carnes previamente provadas nos altares e as bebidas neles derramadas em libação": the English's verbless fragment is joined to the list it continues. Every member is present.
- Ch. 24 "Some fanes it is permitted to approach once a year, some it is forbidden to visit at all." → two clauses split by a semicolon; Ch. 30 "at one time expose … at another … crush" → one "ora … ora" sentence; Ch. 31 "not in appearance, but in our heart we gladly abide" → a semicolon after "no coração". These are punctuation changes inside one paragraph. No content is merged or dropped, and the Ch. 31 semicolon settles a run-on in the source.
- Ch. 37 "now nerveless player, while he feigns lust" → "ora um ator efeminado": the Latin is *enervis histrio*, and "nerveless" there means effeminate.

Evidence: `ember-translation-evidence/church-fathers__minucius-felix__octavius/review-11.md`.
