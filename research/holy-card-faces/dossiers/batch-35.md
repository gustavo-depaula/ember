# Batch 35 — the Pictorial Lives, 1 to 13 September

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 34: `giles`, `rosalia`, `laurence_justinian`, `eleutherius`, `cloud`, `omer`, `nicholas_tolentino`, `paphnutius`, `guy_anderlecht`, `eulogius_alexandria`. **One line is skipped: St. Seraphia (3 Sep)**, so the batch runs to St. Eulogius (13 Sep); see below. The 15 June line (Sts. Vitus, Crescentia, and Modestus) is still left alone. The book's other chapters here are carded already: Stephen of Hungary (2 Sep) `stephen_hungary`, the Nativity of Our Lady and the Holy Name of Mary (8 Sep) `nativity_bvm`, `holy_name_mary`, Peter Claver (9 Sep) `peter_claver`. The next unclaimed line is St. Seraphia (3 Sep) if she is reinstated, otherwise St. Catherine of Genoa (15 Sep), for batch 36.

The card data is in `../batches/batch-35.json`. `../consult/batch-35/build.py` writes it from `cards.py` (copied from batch 34's, every output path changed to batch 35 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- that Rosalia has no `lifeChapter` (see below) and that her excerpt is in her chapter;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but Omer's, in both languages. Omer's excerptSource says it has none;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`; it lists the formularies on every card's date and on the Martyrology's other days for them (8 Jan, 15 Jul, 1 Nov, 13 Jun);
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides and that no other card uses the chapter; initials and refs.

Consulted material is in `../consult/batch-35/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`, crops `crops.jpg`): Giles (the Master of Saint Giles, National Gallery), Serapia, Sabina (en, it), Rosalia (en: van Dyck; it: Luca Giordano), Lorenzo Giustiniani (Gentile Bellini's portrait), Clodoald, Audomar, Nicholas of Tolentino, Paphnutius, Guy of Anderlecht (Book of Hours miniature), Eulogius of Alexandria (Menologion of Basil II), Rose of Viterbo. English Wikipedia has no page on Eleutherius of Spoleto;
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`, including 29 Jul and 29 Aug for Seraphia and Sabina, 8 Jan for Laurence and 13 Jun for Eulogius); the name page for Serapia (`sb-nomi-Serapia.html`);
- Gregory the Great, Dialogues III.33 on Eleutherius, 1911 translation (`gregory-dialogues-3.html`, `.txt`);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`: Charles Borromeo, Alphonsus Liguori, Gregory the Great, Athanasius, Anthony Abbot, Benedict, Nicholas, Augustine). Cards of batches 18–34 are not yet in `content/saints/`, so they are compared through their face lines;
- every face line of batches 1–34 and 52–54 (`faces-all.txt`, regenerated for this batch).

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

**Seraphia skipped.** Her whole story is the passio of St. Sabina, whose Acts "have no historic value" (Catholic Encyclopedia, quoted in `Sabina.txt`); Wikipedia's Sabina article takes Sabina to be most plausibly the donor of the Aventine titulus, around whom the passio grew in the sixth to eighth centuries. The current Martyrology keeps Sabina only as "commemorazione di santa Sabina, la cui basilica… reca il suo venerando nome" (`sb-Sabina.txt`), without Serapia. Serapia is in the pre-1962 Martyrology (3 Sep, the translation; her martyrdom on 29 Jul), but **no current-Martyrology entry for her was found**: Santi e Beati's lists for 3 Sep and 29 Jul flag every Martyrology saint and do not have her at all, and its name page only mentions her name-day. That absence is inferred from those lists, not read in the 2004 Martyrology itself. See Doubts.

**Dates, names, initials.** Feasts follow the book (index days 09-01, 09-04, 09-05, 09-06, 09-07, 09-09, 09-10, 09-11, 09-12, 09-13). Names are the book's, with its pt-BR forms (Santo Egídio, Santa Rosália, São Lourenço Justiniano, Santo Eleutério, São Clodoaldo, Santo Omer, São Nicolau de Tolentino, São Pafnúcio, São Guido de Anderlecht, Santo Eulógio). Titles after the name are dropped ("Abbot", "Virgin", "Confessor", "Bishop"). One name is shortened and kept apart: **"St. Eulogius of Alexandria" / "Santo Eulógio de Alexandria"**, from the book's "Patriarch of Alexandria", because the catalog also has St. Eulogius, Martyr (Córdoba, 11 Mar); "Alexandria" is in the chapter title. "Of Tolentino" and "of Anderlecht" are the book's own. Initials: G, R, L, E, C, O, N, P, G, E.

**Titles.** None changes. All ten were "St." in the book and still are "san/santo/santa" in the Martyrology (`sb-*.txt`): Nicholas (canonized 1446) and Laurence (1690) formally, per Wikipedia, the other eight saints of the first millennium or of immemorial cult. No saint here died after 1930.

**lifeChapter and reflection.** Nine cards have their own chapter as lifeChapter. Eight get the chapter's own `**Reflection**` paragraph. Omer's chapter has none, so his card has none; there is no fallback, and the index has none for 09-09.

**Rosalia has no lifeChapter.** `sep-04-rosalia` tells her in its first paragraph and St. Rose of Viterbo in its second, and its Reflection is about Rose ("Rose lived but seventeen years, saved the Church's cause…"). Setting the lifeChapter would put Rose's reflection on Rosalia's card, as with Agapetus in batch 34, so her card has no lifeChapter and no reflection. Rose of Viterbo has no line in the catalog (see Doubts).

**proper.** None. No sanctoral formulary in the repo is proper to any of the ten; Laurence Justinian and Nicholas of Tolentino are no longer on the General Calendar (Wikipedia: Laurence moved to 8 Jan and dropped from it), and no national formulary names them. The title hits are namesakes with Spanish text only: `sanctorale.01-09.spain` (Eulogius of Córdoba) and `sanctorale.01-20.spain` (Fructuosus with the deacons Augurius and Eulogius). The formularies on the ten dates belong to other saints: 09-05 Teresa of Calcutta, 09-09 Peter Claver, 09-12 the Holy Name of Mary, 09-13 John Chrysostom; nothing on 1, 4, 6, 7, 10, 11 Sep. On the Martyrology's other days: 01-08 German-speaking Severinus, 07-15 Bonaventure, 11-01 All Saints, 06-13 Anthony of Padua.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Giles, Laurence, Eleutherius (Matthew 6:18), Paphnutius (with its quotation of the Wise Man);
  - first sentence: Guy, Eulogius;
  - first three sentences: Nicholas ("Would you die the death of the just? … Live the life of the just.");
  - the Scripture it quotes: Cloud ("The just shall live for evermore…", Wisdom 5:16–17), capitalised at its start.
- From the chapter, where the card has no Reflection of its own:
  - **Rosalia**: the clause of her paragraph after "where", capitalised ("She completed the sacrifice of her heart to God by austere penance and manual labor…" / "Consumou o sacrifício…");
  - **Omer**: the fifth sentence of the second paragraph ("In his old age St. Omer became blind, but that affliction did not lessen his pastoral concern for his flock.").

## St. Giles (1 September)

- Wikipedia (`Giles.txt`): a Greek hermit in Provence, "most likely in the 7th century"; "his hagiography is mostly legendary", from a Latin legend first attested in the 10th century; the hind, the royal hunters, the arrow that wounded him, the monastery of Saint-Gilles-du-Gard. Martyrology (`sb-Egidio.txt`): "Nel territorio di Nîmes… sant'Egidio… dove si tramanda che egli costruì un monastero". Santi e Beati's emblems: crozier and hind.
- The book: an Athenian, hermit near the Rhône, the Gard and in a forest near Nîmes, fed by a hind's milk, found by hunters pursuing her; esteemed by the French king; founder of an abbey later Benedictine. The engraving shows him hooded in the forest with the hind.
- The card: the old abbot in a black cowl with the hind at his side, in the forest near Nîmes; no arrow (the book does not tell it) and no king.
- Face after the Master of Saint Giles (`GilesCrop.jpg`: a bald crown under a black skullcap, a thin grey beard). **Against `benedict`** (broad round head, long full white beard, black habit) and `anthony_abbot` (triangular, hooded): Giles is oval, widest at soft cheekbones, with a Greek nose continuing the brow and a thin, wispy pointed beard.

## St. Rosalia (4 September)

- Wikipedia (`Rosalia.txt`): 1130–1166, of a Norman noble family claiming descent from Charlemagne, a hermit in a cave on Monte Pellegrino; the finding of her bones in the plague of 1624; her image since then van Dyck's. Martyrology (`sb-Rosalia.txt`): "A Palermo, santa Rosalia, vergine, che si tramanda abbia condotto vita solitaria sul monte Pellegrino." Emblems: lily, crown of roses, skull.
- The book: the same, dying in 1160, found in 1625, patroness of Palermo. **The book's dates (death 1160, finding 1625) differ from Wikipedia's (1166, 1624)**; the card shows none.
- The card: the hermit with the crown of roses and a lily at her cave above Palermo and its bay; no skull.
- **Against `rose_lima`** (the other rose-crowned virgin: a round face, dark hair): Rosalia is long and narrow with a pointed chin and golden-red hair.

## St. Laurence Justinian (5 September)

- Wikipedia (`Laurence.txt`): 1381 – 8 January 1456, a Giustiniani, canon regular of San Giorgio in Alga, prior general, bishop of Castello in 1433, first Patriarch of Venice in 1451; canonized 1690; his 5 September feast (the anniversary of his episcopal consecration) removed from the General Calendar and moved to 8 January. Martyrology (`sb-Giustiniani.txt`), on 8 January: "A Venezia, san Lorenzo Giustiniani, vescovo, che illuminò questa Chiesa con la dottrina dell'eterna sapienza."
- The book: the vision of Eternal Wisdom, the Canons of St. George, the friend won from the world, the first patriarch, death on straw, "in 1435, aged seventy-four". **The book's year of death (1435) is wrong by Wikipedia (1456)**; the card shows none. His age at death agrees (74).
- Face after Gentile Bellini's portrait (1465, `Laurence.jpg`): a very long, gaunt, clean-shaven face, a great hooked nose, a deep-set eye, a sunken cheek, a jutting chin, the black skullcap and white habit. The card keeps the dress and the Venetian lagoon, and no mitre, as in the portrait.
- **Against `charles_borromeo`** (a hook-nosed profile, but young, in cardinal's red) and **`alphonsus_liguori`** (old, white hair and beard): Laurence is old, clean-shaven, sallow, with a jutting chin and a black skullcap.

## St. Eleutherius (6 September)

- Gregory, Dialogues III.33 (`gregory-dialogues-3.txt`): abbot of St. Mark's in the suburbs of Spoleto, who lived "long time together with me" in Gregory's monastery in Rome and died there; "a man of such simplicity and compunction"; by his tears he raised a dead man; the possessed boy. Martyrology (`sb-Eleuterio.txt`): "A Spoleto in Umbria, sant'Eleuterio, abate, di cui il papa san Gregorio Magno loda la semplicità e la compunzione del cuore." Santi e Beati notes 6 Sep is not his day of death, which is unknown.
- The book: the same, the Easter-eve fast of Gregory, death about 585 in St. Andrew's in Rome.
- The card: the old abbot praying in tears before his abbey of St. Mark outside Spoleto. Gregory is not shown, so `gregory_great` is not a recurring figure here.
- **Against `benedict`** (long full beard) and the round, bearded Bonajuncta of `servite_founders` (dark beard, snub nose, middle-aged): Eleutherius is old and moon-round with a short soft white beard, reddened, tearful eyes and brows drawn up in compunction.

## St. Cloud (7 September)

- Wikipedia (`Cloud.txt`): Clodoald, 522 – c. 560, son of Chlodomer and grandson of Clovis and Clotilda, saved when his uncles killed his brothers, disciple of Séverin of Paris, a hermit and priest at Novigentum (Saint-Cloud) on the Seine, where he built a church to St. Martin. The story of the shearing of the princes' long hair, "a sign of nobility in Frankish culture", is told there. Martyrology (`sb-Clodoaldo.txt`): "…san Clodoaldo, sacerdote, che, nato da stirpe regale… fu accolto dalla nonna santa Clotilde e, rifiutato con sdegno il potere terreno, si fece chierico."
- The book: the same, ordained priest by Eusebius of Paris in 551, the monastery at Saint-Cloud, died about 560. The engraving shows a young man in a cloak hurrying out past a bearded monk at a hermitage door.
- The card: the young monk-priest with a chalice, laying aside a Frankish crown, above the Seine with Paris far off. His grandmother **St. Clotilda** has a card (`clotilda`, batch 29) but is not shown, so no recurring figure.
- **Against `louis_toulouse`** (the other young prince who renounced a crown: pale, wider at the jaw, small narrow eyes) and `clotilda`: Cloud is an inverted triangle, wide at the brow, with a cleft chin and pale-blue deep-set eyes, cropped and tonsured.

## St. Omer (9 September)

- Wikipedia (`Omer.txt`): Audomar, of a family of Coutances, a monk of Luxeuil under Eustace with his father, bishop of Thérouanne from 637, founder with Bertin of Sithiu (Saint-Bertin) and the church of Our Lady of Sithiu, died about 670. Martyrology (`sb-Audomaro.txt`), on 1 November: "Nel territorio di Thérouanne… sant'Audomaro, che fu discepolo di sant'Eustasio abate di Luxeuil e, nominato vescovo di Thérouanne, rinnovò la fede cristiana di questa regione." Santi e Beati (Platelle): blind by 663, still signing acts in 664 and 667; feast generally 9 Sep, in places 1 Nov; invoked against eye diseases.
- The book: born "in the territory of Constance", Luxeuil ("Luxen"), Thérouanne ("Terouenne"), blind in old age, died on a visit to Wavre in 670. **"Constance" is the book's; Wikipedia and Santi e Beati give Coutances (or Orval, Guldindal near Constance)**. The patron line uses the modern spelling Thérouanne in both languages.
- The card: the old bishop with closed eyes, blessing, before the church of Our Lady at Sithiu in the marshes of Artois. The chapter has no Reflection.
- **Against `nicholas`** (full, curled white beard, round) and the Eleutherius of this batch (round, soft): Omer is hexagonal and flat-planed with a bulbous nose tip, a long upper lip, a close-trimmed white beard and closed eyes.

## St. Nicholas of Tolentino (10 September)

- Wikipedia (`Nicholas.txt`): c. 1246 – 10 September 1305, an Augustinian friar at Tolentino, preacher and confessor, the blessed bread dipped in water, prayer for the souls in Purgatory; canonized 1446. Martyrology (`sb-Nicola.txt`): "A Tolentino nelle Marche, san Nicola, sacerdote dell'Ordine degli Eremiti di Sant'Agostino, che, dedito a una severa astinenza e assiduo nella preghiera…". Emblems: basket of bread, bread, star.
- The book: his austerities, the Holy Souls, the apparition of Our Lady; died "September 10, 1310". **The book's year (1310) differs from Wikipedia's (1305)**; the card shows none.
- The card: the friar in the black Augustinian habit with the star on his breast, the lily and crucifix, and a small blessed loaf, in the cloister at Tolentino. **Our Lady is not shown** (the book's apparition), so her recurring face is not needed.
- **Against `philip_benizi`** (round, big hooked nose) and `peter_verona` (compact, dark, brows meeting): Nicholas is heart-shaped and gaunt with a small fine nose and a full tonsure ring.

## St. Paphnutius (11 September)

- Wikipedia (`Paphnutius.txt`): an Egyptian disciple of Anthony, bishop in the Upper Thebaid, blinded in the right eye and hamstrung on the left under Maximinus, sent to the mines; at Nicaea (the celibacy intervention) and at Tyre with Athanasius; **his existence and his part at Nicaea are contested by some historians** (Winkelmann, Stickler) and defended by others (Hefele, Funk). Martyrology (`sb-Pafnuzio.txt`): "Commemorazione di san Pafnuzio, vescovo in Egitto: fu uno di quei confessori della fede… dopo che fu loro cavato l'occhio destro e tagliato il tendine del piede sinistro; prese in seguito parte al Concilio di Nicea…". Emblem: a bishop with the right eye lost.
- The book: the same, Constantine kissing the empty socket, Tyre, Maximus of Jerusalem. The engraving shows Constantine's embrace.
- The card: the old bishop alone with a staff, his right eye closed under a healed lid, the Nile and the cliffs of the Thebaid behind; no Constantine, no wound.
- **Against the other Egyptians** (`macarius_alexandria`: wide, low, rounded-square; `paul_hermit`: bald, long tapering; `anthony_abbot`: triangular; `john_egypt`: elfin; `james_nisibis`: square, big-boned): Paphnutius is long and horse-like, with a broad-based nose, full lips and a long square-cut grey-white beard.

## St. Guy of Anderlecht (12 September)

- Wikipedia (`Guy.txt`): c. 950–1012, a poor sacristan at Our Lady of Laeken, a failed trading venture on the Senne, pilgrimages to Rome and Jerusalem, died at Anderlecht on 12 September 1012; patron of sacristans, sextons, labourers, horses and stables; shown as a pilgrim with hat and staff and an ox at his feet. Martyrology (`sb-Guido.txt`): "Ad Anderlecht in Brabante… san Guido, che fu dapprima custode della chiesa di Mariensee; noto per la sua generosità verso i poveri, si fece pellegrino per sette anni ai luoghi santi…".
- The book: the same, without the pilgrimages ("the rest of his life was one long penance"), dying about 1033. **The book's year (about 1033) differs from Wikipedia's (1012)**.
- Face after the Book of Hours miniature (`GuyCrop.jpg`: a broad face, a short broad nose, brown hair, a red tunic).
- The card: the peasant-pilgrim with staff and hat, the sacristan's altar-bell, an ox beside him, the chapel of Laeken behind.
- **Against the Cloud of this batch** (wedge-shaped, cleft chin) and `hyacinth` (fair, flat-topped, cleft chin): Guy is broad and square with heavy jaw corners, a low forehead, a rounded short nose and prominent ears.

## St. Eulogius of Alexandria (13 September)

- Wikipedia (`Eulogius.txt`): Patriarch of Alexandria from about 580 to 608, first abbot of a monastery of the Mother of God in Antioch, opponent of the Monophysites and Novatians, friend and correspondent of Gregory the Great; feast 13 June. Martyrology (`sb-Eulogio.txt`), on 13 June: "Ad Alessandria d'Egitto, sant'Eulogio, vescovo, insigne per la sua dottrina, al quale il papa san Gregorio Magno inviò molte lettere…".
- The book: a Syrian monk, priest of Antioch, patriarch in 583, the friendship with Gregory at Constantinople, died 606. **The book's dates (583, 606) differ from Wikipedia's (about 580, 608)**; the card shows none.
- The card follows the Menologion of Basil II (`Eulogius.jpg`, `EulogiusCrop.jpg`): phelonion, omophorion with crosses, the Gospels, grey hair and a rounded grey beard; the Pharos and the harbour of Alexandria behind.
- **Against `cyril_alexandria`** (oblong, hair hidden, high-bridged nose), `anicetus` (egg-shaped, long black beard) and `lucian_antioch` (short, broad-browed): Eulogius has a bald dome, narrow-set eyes under heavy, nearly meeting brows and a medium, rounded grey beard.

## Look-alike risks that remain

- **Giles against `benedict`**: both old, bald and in a black cowl. Reject a long, full white beard or a broad round head; Giles has a thin, wispy grey beard, an oval face and a skullcap.
- **Laurence Justinian against `charles_borromeo`**: both hook-nosed. Reject youth, red or a beard; Laurence is very old, sallow, gaunt, with a jutting chin and a black skullcap.
- **Eleutherius against Omer**: both old monks or bishops with short white beards. Reject a long face for Eleutherius or a round face for Omer; Omer's eyes are closed.
- **Nicholas of Tolentino against `anthony_padua`**: both tonsured friars. Reject a round, young face; Nicholas is gaunt and heart-shaped, in black, not brown.
- **Paphnutius**: reject an open right eye or any wound; the healed, closed lid is the one mark.
- **Cloud against `louis_toulouse`**: reject a broad jaw; Cloud narrows to a cleft chin.
- **Rosalia against `rose_lima`**: reject dark hair or a round face.

## Doubts

- **Seraphia skipped** (3 Sep): her story rests on Sabina's legendary passio, and no entry for her was found in the current Martyrology, which keeps Sabina only for her basilica's name. The absence is inferred from Santi e Beati's day lists, not read in the 2004 Martyrology. If she should be kept, she would be the batch's eleventh line, or replace `eulogius_alexandria`.
- **Rosalia's lifeChapter** omitted: the chapter's Reflection is Rose of Viterbo's. Same alternatives as Agapetus in batch 34.
- **St. Rose of Viterbo** has no catalog line, though the book tells her life in Rosalia's chapter and its Reflection is hers. Not carded here; a line for her would take that chapter as lifeChapter.
- **Legendary material, lines kept.** None of these cults is suppressed; each saint is in the current Martyrology. But:
  - **Giles**: Wikipedia calls his hagiography "mostly legendary", from a 10th-century legend; the Martyrology says "si tramanda". The card paints the hind, the book's scene, without the arrow.
  - **Rosalia**: the Martyrology says "si tramanda" of her solitary life.
  - **Paphnutius**: his existence and his part at Nicaea are contested by some historians.
- **Dates that differ from the Martyrology or Wikipedia**, the card following the book: Laurence (Martyrology 8 Jan), Omer (1 Nov), Eulogius (13 Jun); the book's years of death for Laurence, Nicholas, Guy and Eulogius differ from Wikipedia's (none is on a card).
- **Added and kept names**: "of Alexandria" added to Eulogius, to keep him apart from Eulogius of Córdoba (11 Mar line).
- **Patron lines not from the book**: Giles "Hermit and abbot", Rosalia "Patroness of Palermo" (the book says so), Laurence "First Patriarch of Venice" (the book says so), Eleutherius "Abbot at Spoleto" (the book: "abbot of St. Mark's near Spoleto"), Cloud "Prince and priest", Omer "Bishop of Thérouanne" (the book: "Terouenne"), Nicholas "Patron of the Holy Souls" (Wikipedia), Guy "Patron of sacristans" (Wikipedia).
- **Rosalia's excerpt** begins with a capitalised "She"/"Consumou" cut from the middle of the book's sentence.
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: Gregory the Great, Clotilda, Constantine and Our Lady, who appear in these chapters, are left off the cards.
