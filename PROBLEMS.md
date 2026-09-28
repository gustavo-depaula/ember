# Problems found during the pt-BR translation pass

These are the open problems from translating church fathers and Aquinas opuscula into pt-BR in September 2026. The en-US OCR slips, the `N. ` list-marker paragraph numbers, and the "Enchirídion" spelling in the Confessions introduction have been fixed. Each book's `pt-BR/translation-journal.md` has the full notes.

Paths are relative to `content/books/`.

## Missing content

- `aquinas-opera-omnia/opuscula/de-articulis-fidei/en-US/g1-pr.md` has headings but no body text. The pt-BR prologue was translated from the Latin alone. `scripts/scrape-aquinas-cc.py` can't re-import it, because the aquinas.cc `getCells` endpoint now returns 404. Import the prologue from another copy of the Collins translation, or update the scraper to the site's current API.

## Source readings left as they are

- `church-fathers/athanasius/incarnation-of-the-word`: the source numbers sections irregularly. For example, §5 jumps from 4 to 8, and §10 restarts at 1. Most section numbers are inline, not at the start of a paragraph. The numbering matches the edition, so it was not changed.
- `church-fathers/justin-martyr/first-apology`, Ch. 55: "state possessions" doesn't make sense, and no reading for it has been found.

## Wrong references in the printed edition

These errors are in the printed edition itself, not the import, so both languages keep them on purpose. They are listed here so that no one fixes only one of the languages.

- Commonitory: 1 Cor 2:9 should be 11:19, Gal 2:9 should be 1:9, 2 Cor 11:12 should be 11:13, and the second 1 Cor 14:33 in §74 should be 14:38.
- First Apology: Ch. 35 names Zephaniah for Zech 9:9, and Ch. 51 names Jeremiah for Dan 7:13.
- De articulis fidei: "Ro. VIII" is cited for Rom 9:5.
- Life of St. Anthony: ¶55 cites Galatians 6:6 for 6:2.
- On the Holy Spirit: several references, including Romans 11:38, Isaiah 60:1, Galatians 6:4 and Ezekiel 23:5. See the book's journal.
- Incarnation: 35.7 reads "Josias of Amos" (historically Amon).
- 1 Clement: Ch. 45 reads "Michael" where the biblical name is Mishael.
- Protoevangelium of James: ¶6 "led her astray" is a known mistranslation in Walker's English. The pt-BR adds a translator's note.

## Unfinished work

These church-fathers books have no pt-BR translation yet: `gregory-nyssa/soul-and-the-resurrection`, `tertullian/apology`, `augustine/spirit-and-the-letter` and `ambrose/repentance`.
