# Translation Journal — Deposition of Arius (pt-BR)

Source: en-US (M. Atkinson and Archibald Robertson translation, NPNF Second Series Vol. 4, New Advent edition)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Athanasius | Atanásio | author form as in the sibling `athanasius/*` book.json files |
| Alexander / Arius | Alexandre / Ário | as in `councils/nicaea-i` |
| Deposition | Deposição | title and running text |
| Encyclical Letter | Carta Encíclica | |
| fellow-ministers | colegas no ministério | |
| Presbyter / Deacon / Bishop / Clergy | presbítero / diácono / bispo / clero | lowercase common nouns, as in `apologia-de-fuga` |
| the Catholic Church / Faith | a Igreja Católica / a Fé católica | |
| the Word / Wisdom / Only-begotten | o Verbo / a Sabedoria / o Unigênito | |
| essence / substance | essência / substância | kept distinct as in the source |
| apostates / apostasy | apóstatas / apostasia | |
| cavils | sutilezas | |
| anathematize | anatematizar | |
| likewise (subscription lists) | igualmente | |
| the Mareotis | a Mareótida | the district west of Alexandria |
| Eusebius, now of Nicomedia / Berytus / the Nicomedians | Eusébio, agora de Nicomédia / Berito / os nicomedienses | forms as in `lactantius`, `hippolytus` |
| Secundus / Theonas | Secundo / Teonas | as in `councils/nicaea-i` |
| Hymenæus and Philetus / Belial | Himeneu e Fileto / Belial | corpus forms |
| Chares, Pistus, Serapion, Parammon, Zosimus, Irenæus | Cares, Pisto, Serapião, Parâmon, Zósimo, Irineu | |
| Achilles, Aeithales, Carpones, Sarmates, Euzoïus, Lucius, Julius, Menas, Helladius, Gaius | Aquiles, Etales, Carpones, Sármates, Euzoio, Lúcio, Júlio, Menas, Heládio, Gaio | |
| Colluthus | Coluto | |

## Translation Decisions

- Source is the only language directory (en-US). It carries no footnotes, only stray spaces where NPNF notes were stripped ("Pistus , and"); these are not reproduced. No editor footnotes to drop; no translator notes added.
- Paragraph numbers: the en-US writes them as `N. ` list markers; the pt-BR writes `**N.**` per `.claude/rules/books.md`. The en-US is left as imported.
- Subscription lists: the source's list structure is mirrored item for item, including the scrape's "- Deacons" and "- *Presbyters of the Mareotis.*" list items. Names take the standard Portuguese form where one exists (Alexandre, Dionísio, Paulo, Pedro, Marcos, Amônio, Macário, Ágato as in `apologia-de-fuga`); obscure Egyptian names are lightly adapted (Harpocrácion for "Arpocration", Ptolárion, Sármaton, Bócon) or kept (Peroys, Nilaras, Copres, Seras, Carpon). "Sarapion" (Mareotis deacon) kept distinct from "Serapion" → Sarapião / Serapião, as the source distinguishes them.
- Scripture references: bare, inline, Portuguese book names, as in `apologia-de-fuga`. Where the source puts a reference inside a quotation, the pt-BR closes the quotation and puts the reference after it in parentheses ("No princípio era o Verbo" (João 1:1)). References: João 1:1, Hebreus 1:3, João 10:15, 2 Timóteo 2:17, Lucas 21:8, 2 João 10.
- Scripture quotations follow the source wording, not a Portuguese Bible: Ps 44 "My heart has uttered a good Word" → "O Meu coração proferiu um bom Verbo" (capital, since Alexander reads it of the Son); Ps 109 "Out of the womb I have begotten You before the morning star" → "Do seio Eu Te gerei antes da estrela da manhã"; Mal 3:6 "Behold Me, for I am, and I change not" → "Vede-Me, pois Eu sou, e não mudo"; Prov 18:3 "when the wicked falls into the depth of evils, he despises" → "quando o ímpio cai no abismo dos males, despreza"; 2 John 10 "bid such God speed" → "saudar a tais".
- Quotation marks: curly “…”, as in the source.
- Pronouns and clitics referring to God and Christ capitalized (Ele, Lhe, -Lo, Me, Te, d'Ele), as in `vita-s-antoni` and `apologia-de-fuga`.
- §3 "Who says, by Himself" → "Ele que diz, por Si mesmo" (in His own person, contrasted with "by the Prophet").
- Title and toc: "Deposição de Ário".

## Source Edits (en-US)

None.

## Review log

### Round 1

- Focus: paragraph-by-paragraph completeness against canonical en-US, including quotations, subscription lists, and Scripture references. Verdict: 1 objective defect, fixed.
- Fixed — ch001.md §5 [11]: “Paulo, que foi ensinado destas coisas pelo nosso Salvador” → “Paulo, a quem o nosso Salvador ensinou estas coisas”. Source: “Paul, who was taught these things by our Saviour”. Corrected defective regency while preserving teacher, recipient, and content.
- Rejected — emphasis flags in [7]–[12] and [14]: source paragraph openings “1. As there is”, “2. Now those”, “3. Now when”, “4. As to”, “5. By these”, “6. Since then”, “7. I, Colluthus” become inert bold numbers `**1.**`–`**7.**`, as required by `.claude/rules/books.md`; these are not added prose emphasis.
- Rejected — parentheses in [9]: source “Word John 1:1” / “brightness Hebrews 1:3” → “Verbo” (João 1:1) / “esplendor” (Hebreus 1:3); [10]: “Father John 10:15” → “Pai” (João 10:15); [11]: “Hymenæus and Philetus 2 Timothy 2:17” / “go ye not after them Luke 21:8” → “Himeneu e Fileto (2 Timóteo 2:17)” / “não vades atrás deles” (Lucas 21:8); [12]: “bid such God speed 2 John 10” → “saudar a tais” (2 João 10). These delimit existing references according to the documented convention; they neither add content nor change reference numbers.
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-1.md`.

### Round 2

- Focus: clause-by-clause bilingual fidelity read against en-US. Verdict: 1 objective defect, fixed.
- Fixed — ch001.md §1 [7]: “se um membro sofre ou se alegra, sofremos ou nos alegramos” → “se um membro sofrer ou se alegrar, soframos ou nos alegremos”. Source: “so that whether one member suffer or rejoice, we may either suffer or rejoice with one another”. This is a purpose clause; “de modo que” + indicative stated it as a fact.
- Rejected — §6 [12] “you may not receive them” → “não o recebais”: the singular agrees with “algum deles” (“should any of them … come”); the referent and meaning are unchanged.
- Rejected — §5 [11] “as approaching nearer to Antichrist” → “por se aproximarem mais do Anticristo”: the infinitive takes the main-clause subject (estes homens), as in the source.
- Rejected — the mechanical emphasis and parentheses flags, for the reasons recorded in Round 1.
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-2.md`.


### Round 3

- Focus: full source-blind pt-BR cold read, then source verification and a spelling, diacritics, crase, hyphenation, punctuation and quotation-pairing sweep. Verdict: 2 objective defects, fixed.
- Fixed — ch001.md §6 [12]: “nos deu a conhecer pelo Apóstolo a respeito de tais homens” → “nos informou pelo Apóstolo a respeito de tais homens”. Source: “has signified to us by the Apostle concerning such men”. The original Portuguese construction lacks the object of “dar a conhecer”; “informou” admits the existing topic complement and preserves the recipient, intermediary and subject matter.
- Fixed — ch001.md §2 [8] and Key Terms: “Euzóio” → “Euzoio” (source “Euzoïus”). Removed the acute accent on the stressed oi diphthong of a paroxytone, under the 1990 Agreement, Base IX.3; this changes neither the name nor its stress. Rule: https://portaldalinguaportuguesa.org/?action=acordo&template=print&version=1990 . One spelling defect, also corrected in the glossary.
- Rejected — [3] “reunido com … saúda-os”: source “being assembled with … greets them”; the greeting's recipients are the assembled brethren, so the pronoun is resolvable.
- Rejected — §1 [7] “a dá-lo a conhecer”: source “to make it known to you all”; “-lo” resumes “tal assunto”, the affair described in the intervening clauses. No missing antecedent.
- Rejected — §5 [11] “quando o ímpio cai no abismo dos males, despreza”: source “when the wicked falls into the depth of evils, he despises”. The absolute use preserves the source's unspecified object; supplying “a verdade” or another object would add content.
- Rejected — emphasis flags [7]–[12], [14]: source “1.”–“7.” → “**1.**”–“**7.**”, required inert paragraph numbering. Parentheses flags [9]–[12]: source “Word John 1:1”, “brightness Hebrews 1:3”, “Father John 10:15”, “Hymenæus and Philetus 2 Timothy 2:17”, “go ye not after them Luke 21:8”, “bid such God speed 2 John 10”; the parentheses merely delimit these same references, as recorded in Round 1.
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-3.md`.

### Round 4

- Focus: function words, headings, and forced commitments (possessives, pronoun antecedents, gender, tu/vós address). Verdict: 1 objective defect, fixed.
- Fixed — ch001.md [4]: “exortando-os a renunciar à sua impiedade” → “exortando-os a renunciar à impiedade dele”. Source: “exhorting them to renounce his impiety”. “sua” read as the fellows' own impiety; the source names Arius's.
- Rejected — §3 [9] “admitiram-nos à comunhão” (“admitted them”): “-nos” is the regular form of “os” after -m; context excludes “us”.
- Rejected — §2 [8] “nem é a Sua verdadeira Sabedoria” (“His true Wisdom”): resolves to the Father, as in the source.
- Rejected — §5 [11] “justificaram as outras em comparação consigo mesmos” (“justified the other in comparison of themselves”): “as outras” agrees with “heresias”; “consigo” is reflexive to the subject.
- Rejected — §6 [12] “como inimigos de Deus” (“as being enemies of God”): the attachment is equally open in the source.- Address: vós to the clergy in [4] and to the fellow-ministers in [6]–[12]; “Eu Te gerei” (the Son), “Vede-Me” and “Cuidai … não vades” (plural hearers) are consistent.
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-4.md`.

### Round 5

- Focus: Key Terms frequency diff in both directions, journal claims grepped against ch001.md, proper names against sibling pt-BR works. Verdict: clean, no defects.
- Rejected — "Achillas" → "Aquilas" ([17]) is not a Key Terms row: source "Achillas" differs from "Achilles" → "Aquiles" ([8]); they are different people and stay distinct.
- Rejected — single-use names with no sibling precedent (Sármates, Etales, Carpones, Heládio, Cares, Parâmon, Taleleu): they follow the adaptation rule in Translation Decisions, and no conflicting corpus form exists.
- Rejected — emphasis and parentheses flags, as in Rounds 1–3.
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-5.md`.

### Round 6

- Focus: completeness, paragraph by paragraph (alignment, quotations, parentheticals, Scripture references, Bible book names and verse numbers). Verdict: clean, no defects.
- Rejected — emphasis and parentheses flags [7]–[12], [14]: same reasons as Rounds 1–3 (inert paragraph numbers; parentheses delimiting the source's existing references, with Portuguese book names and matching numbers).
- Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__athanasius__deposition-of-arius/review-6.md`.
