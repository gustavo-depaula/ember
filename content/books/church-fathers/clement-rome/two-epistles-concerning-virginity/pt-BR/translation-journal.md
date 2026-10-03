# Translation Journal — Two Epistles Concerning Virginity (pt-BR)

Source: en-US (trans. B. P. Pratten, Ante-Nicene Fathers, Vol. 8; via New Advent). No Syriac/Greek original in the corpus.
Target: pt-BR

Sibling precedent: `clement-rome/first-epistle/pt-BR` ("Carta" for "Epistle", "Clemente de Roma", inline Scripture references with Portuguese book names, curly quotes “ ”, chapter summaries as sentence-case headings "Capítulo N. …").

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Two Epistles Concerning Virginity | Duas Cartas sobre a Virgindade | "Epistle" → "Carta", per `first-epistle` |
| First / Second Epistle | Primeira / Segunda Carta | |
| Clement of Rome | Clemente de Roma | |
| virgin (masc., "brother virgins") | virgem (masc.: "os virgens", "nenhum virgem") | the letter addresses consecrated men and women; masculine article kept where the source means both or men |
| virginity / sanctity / holiness | virgindade / santidade / santidade | |
| maiden(s) | donzela(s) | |
| "who has taken the vow" | "que fez o voto" | |
| consecrated (brother) | (irmão) consagrado | |
| brethren / sisters | irmãos / irmãs | |
| believer(s) | fiel / fiéis | "believing woman" → "mulher fiel" |
| heathen(s) | pagão / pagãos | |
| stumbling-block / stumble / offence | pedra de tropeço / tropeçar / escândalo | "without offence" → "sem escândalo" |
| adjurations / exorcising | esconjuros / exorcizar | |
| uncleanness | impureza | Ep. I Ch. 8, 10; Ep. II Ch. 11 (Gn 34:7, not the Bible's "infâmia") |
| workmen (Ch. 13) | operários | Mt 9:37-38 "messe … operários" |
| the mind of the flesh | o pensamento da carne | kept identical in Ch. 8–9, as the argument repeats it |
| long-suffering | longanimidade | as in `first-epistle` |
| self-restraint | domínio *de si* | italic keeps the source's `*self*-restraint` |
| circumspect(ness) | circunspecto / circunspecção | |
| Nazarite | nazireu | |
| Sirach | Eclesiástico | corpus-wide Church Fathers pt-BR convention |
| Bathsheba / Amnon / Tamar / Gehazi / Micah / Miriam / the Shunammite | Betsabé / Amnon / Tamar / Giezi / Miqueias / Míriam / a sunamita | Míriam as in `first-epistle` |
| Sea of Suth | mar de Suth | the source keeps the Syriac name, so not turned into "mar Vermelho" |
| "So be it" | "Assim seja" | |

## Translation Decisions

- **Footnotes**: the imported New Advent text has none; nothing dropped, no translator notes added.
- **Address form**: "you" addressed to the brethren collectively ("my brethren", Ch. 3 Eph 5:6, Ch. 9, Ch. 10–12, the whole of Epistle II's direct appeals, Ch. 16) → **vós**. The rhetorical single reader ("You desire, then, to be a virgin?", Ch. 5–6; "Are you … such a man?", Ch. 9–15; "Be admonished, O man") → **tu**. Scripture quoted in the singular (2 Tim 2:7, Sir 5:14, Prov 6, Sir 9) stays **tu**; plural verses (Heb 13:7, Col 4:6, Mt 10:8, Mt 25) stay **vós**. Ch. 3 closes with "while you walk upon the earth" after a third-person sentence → tu.
- **Scripture**: quotations follow Pratten's English clause by clause, not a Portuguese Bible. References kept inline, mid-sentence, in the same position, with Portuguese book names. Citations mirrored even where they look wrong (Ch. 13 "Philippians 3:9" for 3:19; Ch. 11 "Romans 16:17-19" for 16:18; Ch. 11 "Colossians 2:18").
- **Italics**: the ANF supplied words (`*is*`, `*brother*`, `*to them*` …) stay italic on their Portuguese counterpart, as far as the grammar allows.
- **Ch. 11** "at one time *it is proper* to keep silence, and at another you to speak": the stray "you" is New Advent's modernizing slip on "at another to speak"; rendered "e outro de falar" without it. Source left as is.
- **Ch. 5 heading (Epistle II)** "the Father Does Not Make a Stay" (the author, as a Church Father) → "o Padre não se detém", capitalized as in "Padre da Igreja".
- **Ch. 15** "affrontery" (archaic spelling of effrontery) → "descaramento".
- **Ch. 13 (Epistle I)** "Priests" in the heading → "sacerdotes"; "drunken" → "dados à embriaguez".

## Source edits (en-US, OCR-class)

- Epistle II Ch. 5: "These things, moreover, does **ever** one who truly loves God" → "every one".
- Epistle II Ch. 13: "long after the beauty **a** woman" (Prov 6:25) → "the beauty of a woman".

## Review log

### Round 1

Focus: paragraph-by-paragraph completeness (source en-US ↔ pt-BR, 63 non-blank lines each, 32 headings each); Scripture book names and chapter:verse numbers. Mechanical audit (What to Check 1–6, `book.json`) also run. Verdict: 3 defects, fixed; references all match (same 97 citations in the same order).

Fixed:
- Ep. I Ch. 10: "cheia de tropeços, e laços" → "cheia de pedras de tropeço, e laços". Source "full of stumbling-blocks and snares"; Key Terms fix stumbling-block → "pedra de tropeço".
- Ep. I Ch. 13: "envie operários para a sua messe" → "para a messe". Source "send forth workmen into the harvest"; "sua" is the Bible's Mt 9:38 wording, not Pratten's.
- Ep. II Ch. 5: "pecando *assim* contra" → "pecando assim contra". The source italic is the supplied *in* ("*in* “thus sinning”"), absorbed by the gerund; "thus" is a source word, so italicizing "assim" marked it as supplied.

Rejected:
- Ep. II Ch. 2 "we call *together* the brethren" → "convocamos os irmãos" (no italic): "together" is absorbed by "convocar"; dropping the italic where no Portuguese word carries it is what the Italics decision allows.
- Ep. II Ch. 13 "*in* which it says" → "aquela *passagem* em que diz": italic moved to the word Portuguese supplies; correct per the Italics decision.
- Ep. II Ch. 13 Prov 6:27 ends with ";" in the source and "?" in pt-BR: the clause is a question; punctuation choice, not content.

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read (en-US ↔ pt-BR, all 63 lines), looking for quotations pulled toward the Portuguese Bible. Mechanical audit (What to Check 1–6, `book.json`) also run; Key Terms and decision claims re-grepped and hold. Verdict: 3 defects, fixed.

Fixed:
- Ep. I Ch. 11 (Jas 3:2): "aquele que não tropeça na palavra" → "aquele que não transgride na palavra". Source "he who does not transgress in word"; "tropeça" is the Bible's verb.
- Ep. II Ch. 6 (Mt 10:16): "simples como as pombas" → "inofensivos como as pombas". Source "harmless as doves"; "simples" is the Bible's wording and means something else.
- Ep. II Ch. 11 (Gn 34:7): "cometeu uma infâmia em Israel" → "cometeu impureza em Israel". Source "wrought uncleanness in Israel"; "infâmia" is the Bible's wording. Key Terms row added (uncleanness → impureza).

Rejected:
- Ep. I Ch. 2 (Prov 3:4) "devise good things" → "maquinarás coisas boas": "maquinar" also means to plan; the object "coisas boas" fixes the sense.
- Ep. I Ch. 6 (Mt 11:11) "among those born of women" → "entre os nascidos de mulher": generic singular, same meaning.
- Ep. I Ch. 9 (1 Cor 9:27) "not be cast away" → "não seja reprovado": same sense.
- Ep. I Ch. 10 "pitfalls" → "precipícios": figurative hazard in a list of dangers; meaning holds.
- Ep. I Ch. 13 "workmen who shall not be ashamed" → "que não terão de que se envergonhar": same meaning.
- Ep. I Ch. 13 Let us, therefore, “ask of the Lord of the harvest” → “Peçamos”, pois, “ao Senhor da messe”: "ask" is inside the source quote, so "Peçamos" stays quoted; this is the one extra quote pair against the source.
- Ep. II Ch. 6 "wise as serpents" → "prudentes": a sense of "wise"; left as is.
- Ep. II Ch. 11 "humbled her" → "a humilhou": the same biblical euphemism works in Portuguese.

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-2.md`.

### Round 3

Focus: a source-blind cold read of pt-BR, with each mark then checked against the source, followed by a mechanical sweep of spelling, diacritics, crase, hyphenation, punctuation and quote pairing over the whole file. The mechanical audit (What to Check 1–6, `book.json`) was also run, and the Key Terms rows were re-grepped. Verdict: clean, nothing changed.

Rejected:
- Ep. I Ch. 2 "Pois todo aquele que é verdadeiramente justo, as suas obras dão testemunho…": an anacoluthon, but the source has the same one ("whosoever is truly righteous, his works testify").
- Ep. II Ch. 1 "se acontece que a hora *do repouso* nos surpreenda": subjunctive where other chapters use the indicative. It mirrors the source's "if it chance that the time … overtake us", and "se acontece que" with the subjunctive is grammatical.
- Ep. II Ch. 2 "*convidando-as*" after "os irmãos e todas as santas irmãs…": source "*inviting them*". The gathering is "for the sake of the women", so a feminine referent is defensible.
- Ep. II Ch. 7 "conviveram umas com os outros": source "associated with one another", with the women as subject. The mixed reciprocal is grammatical and says exactly that (women with men).
- Ep. II Ch. 15 "*tu*, contudo, vivas com elas": the antecedent ("mulheres e donzelas") comes after the pronoun, as in the source ("live with them, and are waited on by women and maidens").

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-3.md`.

### Round 4

Focus: function words (prepositions, articles, demonstratives, adversatives, `seu/sua`, `consigo`), all 32 headings, and every place pt-BR must commit where the source is open (gender, antecedent, tu/vós traced turn by turn). The mechanical audit (What to Check 1–6, `book.json`) was also run. Verdict: 2 defects, both fixed.

Fixed:
- Ep. II Ch. 8: "satisfazer o seu desejo apaixonado" → "satisfazer o desejo apaixonado dela". Source "gratify her passionate desire". The clause subject is Joseph ("ele"), so "seu" read as his own desire, which is coherent and false.
- Ep. II Ch. 13: "ela não consentiu na sua torpe paixão" → "na torpe paixão deles". Source "their foul passion". With "ela" as subject, "sua" read as Susanna's own passion.

Rejected:
- `seu/sua` where the clause subject is not the owner but the wrong reading makes no sense, so the reader resolves it: Ep. I Ch. 3 "contada com os seus inimigos" ("His enemies"; "esposo" precedes); Ch. 5 "não se retira *do seu serviço*" ("from His service"; "Deus" precedes); Ch. 7 "exprimem a sua semelhança" ("His likeness"; "their likeness [to Christ]" says the same); Ch. 10 "das suas más *obras*" (the men's deeds, not the divine apostle's); Ep. II Ch. 14 "semelhante à sua" ("like theirs"; "like their own" would be a tautology).
- Ep. I Ch. 8 "porque o Espírito de Deus não está nela": source "is not in it". Feminine commits to "carne", the nearest antecedent ("in the flesh, in which dwells no good").
- Ep. II Ch. 2 "falam-lhes, e as exortam": source "speak to them, and exhort them". Same feminine referent as "*convidando-as*" (Round 3), because the gathering is called "for the sake of the women".
- Ep. II Ch. 8 "por causa *daquela* mulher": source "*this* wretched woman". A distal demonstrative for an anaphoric referent in past narrative is idiomatic, and the supplied word keeps its italic.
- Ep. II Ch. 10 "acerca da mulher": source "concerning a woman". The quote that follows (Eccl 7:26) is about woman in general.

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-4.md`.

### Round 5

Focus: per-paragraph term-frequency diff against Key Terms in both directions; every journal claim grepped; proper names checked against standard Portuguese forms and sibling church-fathers pt-BR works. The mechanical audit (What to Check 1–6, `book.json`) was also run. Key Terms rows, decisions and Rounds 1–4 quotes all hold. Verdict: 1 defect (two occurrences), fixed.

Fixed:
- Ep. II Ch. 6 and Ch. 16: "suplicamo-vos" → "suplicamos-vos". Source "we beseech you". The 1st-plural -s drops only before the enclitic "nos", not before "vos".

Rejected:
- "fiel/fiéis" also renders "faithful" (Ep. I Ch. 13 "faithful workmen", "the faithful who have conducted themselves well"; Ep. II Ch. 8 and 10, Joseph and David "faithful"). That is the word's ordinary sense, and the English "the faithful" carries the same double meaning.
- Ep. II Ch. 5 (Rom 14:21) "made sad, or shocked" → "se entristece, ou se escandaliza": "escandalizar-se" is the precise sense of "shocked" in this verse. Ep. I Ch. 10 heading "Scandalous" → "escandaloso" is the source's own word. Neither clashes with the offence → escândalo row.
- Ep. II Ch. 13 (Prov 6:29) "is not pure from evil" → "não está limpo do mal": "pure" is not a key term, and "limpo" carries the sense.
- Ep. II Ch. 14 "Gehazi" → "Giezi": the Vulgate/Ave-Maria form, also used in `jerome/life-of-s-hilarion`. Athanasius and Cyril use "Geazi"; both forms are standard. "Potiphar" → "Putifar" is the Catholic Bible form.
- Ep. I Ch. 12 and Ep. II Ch. 2 "love of the brotherhood" → "amor fraterno": the noun is rendered by its adjective, not the "irmãos" row.

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-5.md`.

### Round 6

Focus: paragraph-by-paragraph completeness (63 ↔ 63 non-blank lines, 32 headings each, aligned one to one), with every quotation, parenthetical and supplied-word italic checked per paragraph; Bible book names and all 97 chapter:verse references. The mechanical audit (What to Check 1–6, `book.json`) was also run. Verdict: clean, nothing changed.

Rejected: none raised beyond the counts already explained in Rounds 1–2 (pt-BR has 98 italic spans to the source's 100, because Ep. II Ch. 2 `*together*` and Ch. 5 `*in*` are absorbed; and 137 quote pairs to 136, because of “Peçamos” in Ep. I Ch. 13).

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-6.md`.

### Round 7

Focus: a clause-by-clause bilingual fidelity read (en-US ↔ pt-BR, all 63 lines), checking every negation, subject and object, tense and mood, qualifier and Scripture clause. The mechanical audit (What to Check 1–6, `book.json`) was also run, and the counts quoted in Round 6 still hold. Verdict: clean, nothing changed.

Rejected:
- Ep. I Ch. 6 "The womb of a holy virgin carried our Lord" → "O seio … trouxe nosso Senhor": "trazer" also means to carry, in the womb or on the body, so the sense holds.
- Ep. II Ch. 2 "may no female … be there" → "nenhuma mulher": the source's "female" is then glossed as "young maiden or married woman … she that is aged", so "mulher" covers it.

Evidence: `ember-translation-evidence/church-fathers__clement-rome__two-epistles-concerning-virginity/review-7.md`.
