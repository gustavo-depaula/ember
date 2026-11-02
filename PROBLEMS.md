# Open problems in the corpus

The open problems from the first-wave imports of November 2026, then those from translating church fathers and Aquinas opuscula into pt-BR in September 2026. The en-US OCR slips, the `N. ` list-marker paragraph numbers, and the "Enchirídion" spelling in the Confessions introduction have been fixed. Each book's `pt-BR/translation-journal.md` has the full notes.

Paths are relative to `content/books/`.

## Missing content

- `aquinas-opera-omnia/opuscula/de-articulis-fidei/en-US/g1-pr.md` has headings but no body text. The pt-BR prologue was translated from the Latin alone. `scripts/scrape-aquinas-cc.py` can't re-import it, because the aquinas.cc `getCells` endpoint now returns 404. Import the prologue from another copy of the Collins translation, or update the scraper to the site's current API.

## Source readings left as they are

- `church-fathers/athanasius/incarnation-of-the-word`: the source numbers sections irregularly. For example, §5 jumps from 4 to 8, and §10 restarts at 1. Most section numbers are inline, not at the start of a paragraph. The numbering matches the edition, so it was not changed.
- `church-fathers/justin-martyr/first-apology`, Ch. 55: "state possessions" doesn't make sense, and no reading for it has been found.
- `church-fathers/ambrose/repentance`, Book I ¶61: "the law of his flesh agreed … with the law of his flesh". The second "flesh" is probably "mind". Check the printed NPNF before fixing both languages.
- `church-fathers/john-chrysostom/priesthood`, Book V §4: "puffed up by the promises of these persons" is probably "praises". The pt-BR has "louvores".

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

These church-fathers books have no pt-BR translation yet: `gregory-nyssa/soul-and-the-resurrection`, `tertullian/apology` and `augustine/spirit-and-the-letter`.

## First-wave imports (November 2026)

Each book's `book.json` source notes give the details. The scripts that built them are in `research/sourcing/_scripts/` or the author's folder under `research/sourcing/`.

### Scanning errors left after cleanup

These books were imported from scans and corrected by script, not proofread. Proofread them against the page images (the `audit-book-vs-pdf` skill), worst first:

- `scupoli-opera-omnia/combattimento-spirituale`, `it/`: about 3% of words are still wrong, and about 25 chapter titles were rebuilt from fragments.
- `francis-de-sales-opera-omnia/traite-amour-de-dieu`, `fr-FR/`: misread letters ("four" for "jour"), stray margin citations, and some wrongly split or merged paragraphs.
- `challoner-opera-omnia/meditations`: about 1% of words are wrong, and a few stray "Digitized" fragments remain.
- `john-of-the-cross-opera-omnia/noche`, `en-US/`: about 0.5% of words. The other John of the Cross books are at 0.1–0.3%, worst in the Spanish of Subida III.19.
- `lallemant-opera-omnia/doctrine-spirituelle`, `en-US/`: noisier than the French, and 9 "Article" headings were not detected, so those articles run on into the one before.
- `chesterton-opera-omnia/the-thing`: from a scan, with no italics.
- `peter-of-alcantara-opera-omnia/tratado-oracion-meditacion`, `en-US/`: Hollings (1905) from OCR. The opening of Part I ch. VI (the preparation for prayer) is lost to the OCR, so `p1-c6` starts mid-sentence. Hollings's scripture-reference footnotes and a few drop-cap letters were dropped or restored by hand; stray OCR symbols remain in places. The meditation for Friday (`p1-c2-friday`) is about half the Spanish length, because Hollings abridges it.
- `catherine-of-siena-opera-omnia/dialogo-thorold`, `caussade-opera-omnia/abandon-a-la-providence-divine` (`fr-FR/`), `brother-lawrence-opera-omnia/pratique-de-la-presence-de-dieu`, `kempis-imitation-of-christ` (`la/`) and the Latin from Migne (`anselm-opera-omnia/*`, `peter-lombard-opera-omnia/sententiae`): a few errors remain.

- `john-of-avila-opera-omnia/audi-filia`, `en-US/`: EEBO-TCP keying leaves about 500 illegible characters, shown as `●` (for example `sa●●`); the translator's marginal glosses are footnotes, but a few untagged margin references remain in the text. `es-ES/` is the modernised Apostolado Mariano reprint (OCR, not proofread); it has no critical apparatus.
- `john-of-avila-opera-omnia/tratado-del-amor-de-dios`: modernised Apostolado Mariano booklet (OCR, not proofread); two scripture footnotes are garbled (c08 note 1 "¡BX. 8,20.", c03 note 2 "Ef. 3,18" reconstructed) and the editor's headings are kept. The 1603/1793 prints are not collated.
- `teresa-opera-omnia/fundaciones`: `es-ES/` is two Silverio scans merged by script, not proofread (about 0.3% of words wrong, mostly in the footnotes; a few footnotes have markers that could not be paired and were placed by hand). `en-US/` is Agnes Mason (1909), not the Lewis/Zimmerman translation the report ranked first, because that scan's OCR is too damaged to split; a handful of Mason's footnote markers were lost to OCR and the notes placed by guess in two or three chapters.

### English left out

These books have no English because the only public-domain translations are badly scanned or don't follow the original's divisions:

- `bernard-opera-omnia/sermones-super-cantica`: Eales (1896) is scanned with misplaced sermon breaks and lost footnote markers.
- `brother-lawrence-opera-omnia/pratique-de-la-presence-de-dieu`: the English orders and numbers the letters differently, so it would be its own book.
- `francis-of-assisi-opera-omnia/opuscula`: Robinson (1906) groups the pieces differently.
- `anselm-opera-omnia/{de-veritate,de-libertate-arbitrii,de-casu-diaboli}`: McKeon (1929) doesn't follow Migne's chapters.
- `ignatius-opera-omnia/ejercicios`: the English has no [1]–[370] section numbers, because Mullan's paragraphs don't match the Spanish units.

### Partial texts

- `john-of-avila-opera-omnia/epistolario`: the 100 letters of the Epistolario espiritual only, from the modernised Apostolado Mariano edition (OCR, not proofread; Latin quotations replaced by Spanish glosses in brackets). The other ~150 letters of Sala Balust's critical edition (BAC 1952, 252 letters) are not imported, and there is no English yet (EEBO-TCP A23433 has 57 letters, Stanbrook 1904 has 25; both need their own book mapped to these letter numbers).
- `peter-of-alcantara-opera-omnia/cartas`: only 2 of his 12 authenticated letters (to Teresa and to the bishop of Ávila, 1562). The other ten (Infantas Isabel and María of Portugal, Luisa de la Cerda, Álvaro de Mendoza…) are only in Barrado Manzano 1965 and BAC 570 (1996); leads: Archivo Ibero-Americano 22 (1962), *Salmanticensis* 1955. English exists only for the first, as Willoughby's free rendering.
- Peter of Alcántara's constitutions (1540, 1561, 1562), the commentary on the *Miserere*, the short *Camino de perfección* and the Spanish *Breve introducción* / *De tres cosas* (traditionally attributed; only scans with unusable OCR, English in Hollings 1905 App. I-II) are not in the corpus: no free text was found.
- `bernard-opera-omnia/de-diligendo-deo`: Patmore's English stops at chapter XI, so chapters XII–XV are Latin only.
- `church-fathers/councils/trent`: the Latin lacks the bull of indiction, the acclamations and the confirmation, which are in English only.
- `church-fathers/gregory-great-pope/dialogues`: the Latin Book II has 6 sections against the English's 38 chapters.
- `church-fathers/gregory-great-pope/register-of-letters`: Latin only for the 420 letters NPNF translates. About 440 more exist only in Latin.
