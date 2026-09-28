# Problems found during the pt-BR translation pass

These problems were found while translating 17 books into pt-BR in September 2026. None of them were fixed in that pass, because each one is in a source file (usually `en-US`) or outside the scope of the translation. Each item is also recorded in the book's `pt-BR/translation-journal.md`.

Paths are relative to `content/books/`.

## Missing content

- `aquinas-opera-omnia/opuscula/de-articulis-fidei/en-US/g1-pr.md` has headings but no body text. The pt-BR prologue was translated from the Latin alone. The English prologue needs to be imported or translated.

## Typos in en-US sources

These are OCR or import errors, not readings of the printed edition. The pt-BR translations render the intended word. Per `.claude/rules/books.md`, fix them in the `en-US` files.

### church-fathers/clement-rome/first-epistle

- Ch. 15: "with their month" should be "mouth".
- Ch. 25: "the deed bird" should be "dead".

### church-fathers/tertullian/martyrdom-of-perpetua-and-felicity

- "the child no long desired the breast" should be "no longer".
- "while he has yet in the prison" should be "was".

### church-fathers/augustine/creed

- ¶3: "Man besets not an ox" should be "begets".
- "(or Creed )" has a stray space.

### church-fathers/augustine/faith-and-the-creed

- Introductory Notice: stray "?" after "flesh and blood".
- ¶9: "admonishesus" should be "admonishes us".
- ¶19: "proofs texts" should be "proof texts".
- ¶19: Latin "principia isne principio" should be "sine".
- ¶19: Latin "subsantiœ" should be "substantiæ".

### church-fathers/augustine/enchiridion

- Ch. 1: "the apostles wishes" should be "apostle".
- Ch. 14: "thelogicians".
- Ch. 76: "give aims" should be "alms".
- Ch. 80: "sameas".
- Ch. 97 heading: "GodWill".
- Ch. 97: "mostly truly".
- Ch. 99: "Pharoah".
- Ch. 118: "The, law".
- Ch. 112: the quotation marks around Ps 77:9 are misplaced.

### church-fathers/augustine/catechising-of-the-uninstructed

- ¶9: "gound" should be "ground".
- ¶12: "catchetical".
- ¶15: "neverless" should be "nevertheless".
- ¶30: "trangress".
- ¶27: the closing quotation mark is missing.

### church-fathers/athanasius/incarnation-of-the-word

- Run-together words: "sinand", "gracefollowing", "knowHim", "demonsin".
- 54.3: "impossible" should be "impassible".
- 48.5: "bold to be gods" should be "hold".
- 42.4: "light and movement and light" should end in "life".
- 39.4: "God and Asaph and Nathan" should be "Gad".
- Stray spaces before punctuation ("Jews :", "religion ,").

### church-fathers/athanasius/vita-s-antoni

- Stray spaces where footnote markers were stripped (for example "wealth , and").

### church-fathers/justin-martyr/first-apology

- Ch. 25: "impossible God" should be "impassible".
- Ch. 46: "But who, through the power of the Word" should be "But why".
- Ch. 55: "His power and role" should be "rule".

### church-fathers/cyprian/life-and-passion

- §1: "thought it wall" should be "well".
- §2: "observance of ." is missing a word; the ANF print reads "continency".
- §3: "rounded upon deep roots" should be "founded".
- §8: stray "I" in "I as indeed is the case".
- §8: "such needful then" should be "men".
- §12: stray "I" in "the brethren who I visited him".
- §14: "tread trader foot" should be "under foot".

### church-fathers/vincent/commonitory-for-the-antiquity-and-universality-of-the-catholic-faith

- §54: "enlarged n itself".

### church-fathers/apocrypha/protoevangelium-of-james

- "widwife" (twice) should be "midwife".

### church-fathers/hermas/pastor

- Mand. 11: "tees from him" should be "flees".
- Sim. 5.4: "sakes" should be "stakes".
- Sim. 8.7: "east out" should be "cast out".

### church-fathers/basil/de-spiritu-sancto

- §9: "k28--1 John 16:15" is footnote residue left in the text.
- Greek glosses split by a space: "ἐ κ", "ἐ ν", "ἀ νάστασις".
- "pastare", "in terchanged", "com mon".
- Chapter 16 heading: "separable" should be "inseparable", as §37 states.
- §32: a "not" is missing before "bear about in the body the dying of Jesus".
- §49: "disability to fall away".
- §79: "reeking not" should be "recking".
- Chapter 25 heading: the cross-reference "cf. note on p. 3" points to a note that isn't in the corpus.

## Paragraph numbers written as list markers

`.claude/rules/books.md` requires paragraph numbers to be written as inert bold (`**N.**`). These `en-US` files use `N. ` list markers, which `marked` renders as an ordered list and renumbers when there are gaps or repeats:

- `church-fathers/tertullian/martyrdom-of-perpetua-and-felicity`
- `church-fathers/augustine/creed`
- `church-fathers/augustine/faith-and-the-creed`
- `church-fathers/augustine/catechising-of-the-uninstructed`
- `church-fathers/augustine/care-to-be-had-for-the-dead`
- `church-fathers/cyprian/life-and-passion`
- `church-fathers/apocrypha/protoevangelium-of-james`
- `church-fathers/basil/de-spiritu-sancto`
- `church-fathers/athanasius/incarnation-of-the-word`
- `church-fathers/athanasius/vita-s-antoni`

The pt-BR files of the first eight books use `**N.**`. The pt-BR files of `incarnation-of-the-word` and `vita-s-antoni` still copy the `N. ` form so the two languages line up. Convert both languages in those two books together. `incarnation-of-the-word` also has irregular numbering in the source (§5 jumps from 4 to 8, and §10 restarts at 1).

## Title spelling in augustine-confessions

`augustine-confessions/pt-BR` uses "Enchirídion", which isn't a Portuguese word. The attested form is "Enquirídio", and the pt-BR Enchiridion now uses it. Check whether `augustine-confessions` should change to match.

## Unfinished work

- `church-fathers/john-chrysostom/priesthood/pt-BR/` holds a partial translation that is not committed. The translation was stopped partway through to stay within usage limits. Resume it or delete it and start over.
- Not started yet: `church-fathers/gregory-nyssa/soul-and-the-resurrection`, `church-fathers/tertullian/apology`, `church-fathers/augustine/spirit-and-the-letter` and `church-fathers/ambrose/repentance`.

## Wrong references in the printed edition (no action needed)

These errors are in the printed edition itself, not the import, so both languages keep them on purpose. They are listed here so that no one "fixes" only one of the languages.

- Commonitory: 1 Cor 2:9 should be 11:19, Gal 2:9 should be 1:9, 2 Cor 11:12 should be 11:13, and the second 1 Cor 14:33 in §74 should be 14:38.
- First Apology: Ch. 35 names Zephaniah for Zech 9:9, and Ch. 51 names Jeremiah for Dan 7:13.
- De articulis fidei: "Ro. VIII" is cited for Rom 9:5.
- Life of St. Anthony: ¶55 cites Galatians 6:6 for 6:2.
- Incarnation: 35.7 reads "Josias of Amos" (historically Amon).
- 1 Clement: Ch. 45 reads "Michael" where the biblical name is Mishael.
