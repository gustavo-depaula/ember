# Translation Journal — The Life and Passion of Cyprian (pt-BR)

Source: en-US (Robert Ernest Wallis translation, Ante-Nicene Fathers Vol. 5, New Advent edition)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Cyprian of Carthage (book.json author) | Cipriano de Cartago | Matches the "X de Y" form of `Inácio de Antioquia`; the en-US author field has no "St.", so neither does pt-BR. |
| Cyprian / Thascius | Cipriano / Táscio | "Táscio" for his praenomen *Thascius* (§15). |
| Pontius the Deacon | Pôncio, o Diácono | "Pôncio" as in "Pôncio Pilatos" throughout the corpus. |
| Caecilius | Cecílio | |
| Xistus | Xisto | Standard Portuguese form of Pope Sixtus II. |
| Curubis | Curubis | Place name kept. |
| Carthage / Africa | Cartago / África | |
| Job, Elias, Daniel, Zacharias, Zacchaeus, Tobias, Philip, Isaiah | Jó, Elias, Daniel, Zacarias, Zaqueu, Tobias, Filipe, Isaías | Standard Portuguese biblical names. |
| priest (Cyprian as *sacerdos*/bishop) | sacerdote | Kept distinct from "presbyter" → "presbítero". |
| priesthood / presbyterate / episcopate | sacerdócio / presbiterado / episcopado | |
| pontiff | pontífice | |
| bishop's *cathedra* | *cathedra* do bispo | Latin kept italic as in source. |
| blessed (martyr, people) | bem-aventurado | Corpus convention (Perpetua, Polycarp, Ignatius pt-BR). "most blessed martyr" → "bem-aventuradíssimo mártir". |
| passion (martyrdom) | paixão | Technical term, as in Perpetua. |
| crown / crowned | coroa / coroado | |
| catechumen / neophyte / novice | catecúmeno / neófito / noviço | |
| lapsed | caídos | |
| confessors | confessores | |
| Gentiles / heathen(s) | gentios / pagãos | The source alternates; kept distinct. |
| proconsul / praetorium / officer | procônsul / pretório / oficial | |
| "Tesserarius" | “Tesserarius” | Kept in Latin inside quotes, as the source does. |
| tablet | tabuinha | Also for Zacharias's writing tablets, preserving the parallel Pontius draws. |
| banishment / exile | desterro / exílio | Source distinguishes the two words; kept distinct. |
| race-course | hipódromo | |
| standard-bearer | porta-estandarte | |
| discipline | disciplina | |
| Acts (proconsular) | Atas | |
| God the Father / Christ the Judge / God the Judge | Deus Pai / Cristo Juiz / Deus Juiz | |
| the morrow | o dia seguinte | Kept as one phrase throughout, since §13 and §15 argue from it. |

## Translation Decisions

- **Footnotes.** The source file carries no footnotes; nothing to drop. The one inline Scripture reference ("1 Timothy 3:6", §3) is kept inline in Portuguese book form ("1 Timóteo 3:6"), as the sibling Church Fathers pt-BR books do.
- **Address.** Pontius addresses his readers in the plural (*vós*): "vós estais ansiosos", "Quereis ter a certeza". The Church's reply in §8 is first person singular, as in the source.
- **Paragraph numbers** written as inert bold (`**1.**`) rather than the en-US file's `1. ` list markers, per `.claude/rules/books.md`. Numbers and breaks are unchanged.
- **Source defects translated as intended** (the en-US file is not edited):
  - §1 "I have thought it wall" → "julguei bem" (typo for "well"); "well near all" → "praticamente todas".
  - §2 "in comparison of the observance of ." — the New Advent text dropped the object; the ANF text reads "continency" (Latin *continentia*). Rendered "a observância da continência" so the sentence (and the following "lust of the flesh" gloss) makes sense.
  - §3 "rounded upon deep roots" → "fundada sobre raízes profundas" (typo for "founded").
  - §8 "I as indeed is the case" → stray "I" dropped; "such needful then are reserved" → "homens tão necessários sejam reservados" (typo for "men").
  - §11 "oh wickedness! With unacknowledged goodness" — capital after the exclamation is an editing slip; rendered as one sentence ("— ó maldade! — com bondade não reconhecida").
  - §12 "the brethren who I visited him" → stray "I" dropped.
  - §14 "tread trader foot" → "calcar aos pés" (typo for "under foot").
- **"from the city from Xistus"** (§14): the Latin *urbs* means Rome, but the English says "the city"; kept "da cidade", lowercase, without supplying Rome.
- **Punctuation.** The source's spaced dashes ("Then— what is even greater—") normalized to spaced em dashes; English `:—` constructions not transplanted.
- **Source italics kept** where the ANF marks supplied words: *cathedra*, *him seek* → *buscar*, *Thus* → *Assim*, *to wield* → *brandir*, *with blood of martyrdom* → *com o sangue do martírio*.

## Review Round 1 (fixes)

- §8 "a man of an intelligence, besides other excellences, also spiritually trained" — the participle agrees with "homem" (the man), not with the intervening "inteligência". Fixed "formada" → "formado".
- §9 "if it seem well, let me glance at the rest" — first-person singular cohortative ("let me"), matching the narrator's *eu* voice used throughout (§1, §2, §12, §19). Fixed "lancemos" (let us) → "lance eu".

## Review Round 2 (fixes)

- §16 "he had to pass by the place of a corresponding struggle" — rendered "uma luta correspondente aquele que" was missing the preposition "a" that "correspondente" requires before its complement. Fixed to "uma luta correspondente àquele que, tendo terminado o seu combate, corria para a coroa da justiça." (preposition "a" + demonstrative "aquele" contracts to "àquele" — crase; corrected in round 3, see below.)

## Review Round 2 — checks performed, nothing else to report

- Source-blind cold read of the full chapter, function-word/agreement pass (prepositions, articles, este/aquele, conjunctions, possessive "sua", verb person/tense/mood, participle/adjective agreement), and a spelling/diacritics sweep: no further defects found.
- Grep-verified every Key Terms row against both language files (proper names, technical terms, "the morrow" / "Atas" distinction) — all present and consistent in both directions.
- Checked italicized Latin/supplied-word spans (*cathedra*, *buscar*, *Assim*, *brandir*, *com o sangue do martírio*) — match the source list recorded above.

## Review Round 3 (fixes)

- §16 "uma luta correspondente a aquele que" — preposition "a" before the demonstrative pronoun "aquele" contracts to "àquele" (crase). Fixed to "uma luta correspondente àquele que…". Corrected the round-2 journal entry above to match.

## Review Round 3 — checks performed, nothing else to report

- Grep sweep of the whole file for every uncontracted "a aquele/a aquela/a aquilo/a aqueles/a aquelas": only the §16 instance above existed; no other misses.
- Checked every existing "à/às" occurrence against its governing verb/adjective and the English (e.g. "atribuído à minha ignorância", "à precocidade de sua fé", "escravizada às advertências divinas", "atribuir a última e pior maldade àqueles", "confirmação à disciplina") — all correctly require crase and are correctly rendered; no wrongful crase found.
- Checked candidate "a + word-starting-with-a" spots that are not crase contexts (infinitives after "a", "para a alma", "entre a alegria", "a alguém") — correctly left uncontracted.
- Sampled commitment points (seu/sua, ele/ela referents, "o qual/que", tu-vós register, but/for/therefore connectors) across the multi-referent passages most at risk of drift: §4 (Cyprian/Caecilius), §12 (dream vision: proconsul/youth/Cyprian), §13 (Zacharias parallel), §16 (Tesserarius offering clothes). All pronoun referents match the English, including places where the English itself is ambiguous (§3's Job passage, §16's "his moistened garments") — the Portuguese preserves the same ambiguity rather than resolving or shifting it. No tu/vós mixing (grep for tu/teu/tua/te: no hits); vós forms are consistently and correctly conjugated.
- Term-frequency diff (English stem vs Portuguese stem, both directions) on every Key Terms row: priest/priesthood/priestly (22) ↔ sacerdote/sacerdotes/sacerdócio/sacerdotal (22); presbyter/presbyterate (3) ↔ presbítero/presbiterado (3); pontiff (3) ↔ pontífice (3); blessed (4, excluding the unrelated verb "blessing") ↔ bem-aventurado (4); passion (15, excluding "compaixão" false hits) ↔ paixão (15); banishment/exile (11) ↔ desterro/desterrado + exílio/exilado (11). All other rows already matched on inspection. No mismatches found.

## Reviewed, not changed

- §3 "novices should be passed over" (1 Timothy 3:6) is rendered "neófitos", not "noviços", even though the Key Terms row above pairs "novice" with "noviço". Checked: this is the correct choice, not an inconsistency — the Wallis translation uses "novice" only here as the traditional KJV wording for the Vulgate's *neophytum* (1 Timothy 3:6 refers to a recent convert, not to someone new to office). §5's "still a neophyte, and, as it was considered, a novice" is the one place where the source distinguishes the two senses for Cyprian personally, and pt-BR correctly keeps "neófito"/"noviço" distinct there.
- 2026-09-27: The en-US OCR slips recorded in this journal were corrected in the en-US source. The pt-BR text already rendered the corrected reading.
