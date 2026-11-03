# Skipped texts: second sources

These texts were skipped during earlier imports because the only copy found was a damaged scan (see PROBLEMS.md). This report, from November 2026, records for each one whether a better source exists.

Samples, word-coordinate files and the helper scripts are in `research/sourcing/_skipped/`, which is gitignored:
- `samples/`: fetched texts, named by archive.org or TCP id.
- `coords/`: `_djvu.xml` and `_hocr.html` with word boxes, and the filtered outputs.
- `norm/`: long-s-normalised copies.
- `tools/`: `score.py`, `score_la.py`, `sidenote_filter.py`, `sidenote_filter_hocr.py`, `drop_running_heads.py`, `letters2.py`, `fts.sh`.

**Score** is the share of tokens found in `/usr/share/dict/words`, with suffix stemming. Read 0.97+ as clean and below 0.90 as rough; old spelling, names and Latin pull a clean text down to 0.95–0.98. Latin is scored against the corpus's own Latin vocabulary, where 0.89 is the ceiling for clean text.

## A method for marginalia

Most skips came from side-notes, marginal rubrics or margin references run into the lines. The archive.org `_djvu.xml` / `_hocr.html` give a box for every word, so these can be dropped by position:
1. On each page, take the median start and end of the long lines.
2. Drop any word that starts right of the right edge or ends left of the left edge.

`tools/sidenote_filter.py` (djvu.xml) and `tools/sidenote_filter_hocr.py` do this, and `tools/drop_running_heads.py` drops a page's top line. Filtering by word height was tried and rejected, because it drops short words.

## Importable, light work

1. **Bossuet, *A Treatise of Communion under Both Species* (1685).**
   - EEBO-TCP **A28850**: `https://raw.githubusercontent.com/textcreationpartnership/A28850/master/A28850.xml`.
   - Keyed text with 4 short `<gap>`s; long s to normalise.
   - Structure: the publisher's address, a preface, a table, then Part I (§§ I–VII, with "Communion of the sick") and Part II (§§ I–XII). Split on the TEI part and section divs.
   - Other Bossuet English in TCP: A28837 *Conference with Mr. Claude*, A28839 and A77108 *Exposition*, A28845 *Pastoral letter to the new Catholicks*, A28849 the funeral sermon for Marie-Thérèse, A28838 *Discourse on the history of the whole world*.
2. **Bernard, *On Conversion*.**
   - EEBO-TCP **A27472**, *A mirror that flatters not* (1677, anonymous translator); keyed, 6 gaps.
   - The sermon to the clergy on conversion is in 31 chapter divs, followed by four other sermons and the preface.
   - Compare the 31 chapters with the Latin's division before pairing them.
3. **Bernard, *Sermons on the Song of Songs*.**
   - Mount Melleray, *St. Bernard's Sermons on the Canticle of Canticles* (Dublin 1920, 2 vols): `stbernardssermon01bern` (0.975) and `stbernardssermon02bern` (0.970).
   - `^SERMON +[IVXLC]+\.? *$` finds 84 of the 86 headings in order; XVIII and LXXX must be found by hand. Each heading has a title line; notes are marked * †.
   - Vol. 1 sometimes loses a letter at the gutter.
   - The separate Eales 1895 *Cantica Canticorum* (`canticacanticoru0000sain`, 0.971) is an alternative. Check its openings before using it.
4. **Fénelon, *Dialogues on Pulpit Eloquence*.**
   - Eales's translation (London 1897), `threedialogueson00ealeuoft` (0.980).
   - Cut at the garbled dialogue headings: lines 463, 2396 and 4644.
   - Strip the running heads "PULPIT ELOQUENCE"; publisher's adverts from about line 7200.
5. **Challoner, *The Garden of the Soul*.**
   - The 1916 reprint of the 1741 impression of the first edition, in modern type.
   - Three scans of it, for collating: `gardenofsoul0000vari_t3p2`, `bwb_Y0-ARJ-962`, `gardenofsoul0000vari` (0.967–0.969).
   - Updated in 1916, by its own Advertisement: the feast and fasting tables, Vespers and Compline, the Litany of Loreto ("Mater boni consilii"), and a few Examination sentences.
   - Section headings are in capitals; fix the garbled ones by collation.
6. ***Speculum perfectionis*.**
   - **Latin:** already mirrored at `research/sourcing/francis-of-assisi/mirror-franciscanos-net/www.franciscanos.net/fuentes/SpecPerf.htm` (latin-1). About 35.6k words, clean, complete, in Sabatier's numbering.
     - A regex finds 117 of the 124 "Caput" numbers; 19, 35, 47, 65, 95, 98, 111 and CAPITULUM VIII are formatted differently.
   - **English:** Steele's translation in the 1910 Everyman volume, `thelittleflowers00francuoft` (0.977). Alternatives: Evans (`mirrorofperfecti00leob`, 0.969) and Wyatt (`TheMirrorOfPerfection`, 0.978).
7. **Bonaventure, *Legenda maior*.**
   - Salter's translation, reset in the same Everyman volume (`thelittleflowers00francuoft`, from about line 14750).
   - No rubrics, and the drop capitals survived.
   - Prologue plus chapters I–XV; the posthumous *Miracula* are not in this edition.
8. **Anselm, the 1891 selection of letters.**
   - About 89 letters, with real body headings ("2. To ODO AND LANZO.").
   - Scans: `curdeushomo00anseuoft` (0.977), `curdeushomotowhi00anse`, `curdeushomo00anse`, `curdeushomo00anse_0`, `bwb_T5-BAG-107`, `in.ernet.dli.2015.31369`.
   - `^ *N[.,] +To +NAME` finds 82–83 per scan. Across the scans only letters 35, 54 and 56, and 1 and 11 (OCR'd "i.", "ii."), are missed.
   - The contents list gives every addressee to check against.

## Importable, medium work

9. **Bernard, Eales's *Letters*.**
   - Best scans: `saintbernardlife00bernuoft` (vol. 1, 141 of 145 headings), `saintbernardlife02bernuoft` (vol. 2, 225 of about 234), `lifeworksofsaint03bern` (vol. 3, 89 of about 110).
   - Detection (`tools/letters2.py`): a "LETTER N." line with a date or bracket, or a "To …" line within four lines.
   - Close the gaps with the running heads: every page carries "LETTER N".
   - Clean fallback: *Some Letters of Saint Bernard* (1904), `somelettersofsai00bern` (0.971).
10. **Kempis, Scully's *Sermons to the Novices Regular*.**
    - `SermonsToTheNovicesRegular` (0.973, 30 of 30 headings).
    - `sidenote_filter.py` removes the margin references (`coords/SermonsToTheNovicesRegular_filtered.txt`).
    - 30 lost drop capitals to restore by hand against the Latin. The English pairs with the Latin book (p1-01 … p3-11).
11. **Bede, Life of St Felix and the letters to Egbert and Albinus.**
    - Giles, `theminorhistoric00bede`; the coordinate filter removes the side-notes (`coords/theminorhistoric00bede_filtered.txt`).
    - Footnotes still need stripping.
12. **Fénelon, *Dialogues of the Dead*.**
    - Elphinston's translation (Glasgow 1754), `bim_eighteenth-century_dialogues-des-morts-en_fnelon-franois-de-sal_1754_1` and `_2`.
    - The OCR writes the long s as "ſ"; `ſ→s` raises the score to about 0.91.
    - Number the dialogues by order and check against the contents in vol. 2.
    - Snap garbled speaker names to the two speakers in each dialogue's title.
13. **Celano, Howell's *Lives of S. Francis* (1908).**
    - `livesofsfranciso00thom` (0.970). The section numbers match the Latin already imported.
    - The drop capitals fail the same way each time, on the first word after a chapter's section number. About 220 openings to repair, with a dictionary pass, a vote across the 3 scans, and the Latin as referee.

## Medium-heavy

14. ***Three Companions*, Salter.** `dli.ministry.23680` (1905, 0.954). The hOCR filter leaves rubric fragments, so about 150 pages need a hand pass.
15. **Marshall's *Apocalypse* (1878).** Only the Google scan, `explanationapoc00bedegoog` (0.905). Side-notes can be removed; footnotes and OCR slips remain.
16. **Bede, Gospel Homilies (Latin).**
    - The Toronto scan of Giles vol. 5, `completeworksofv05bede`, is cleaner than the Google one.
    - Drop capitals are lost, and the homilies must be put into Bede's two books.
17. **Bellarmine, *Exhortationes domesticae*.**
    - Still the one Brussels 1899 scan.
    - Running heads drop by position. Each series numbers its own exhortations, so chapters are series × exhortation.
    - Bleed-through noise remains.

## Still blocked

- **Francis de Sales, *Spiritual Directory*.** The 1777 *Spiritual Director* is a different work, a 46-chapter florilegium (importable on its own terms, 0.933 after `ſ→s`). The only English of the Directory itself is a modern Oblate adaptation.
- **Meres, *Granados Devotion*.** One edition, 5,370 gaps. The Chester English (chs. 28–31) already covers the same part of Granada's book.
- **Bossuet, *Tradition défendue* and *Avertissements*.** No English translation exists.

## Places searched

- archive.org search, metadata and full text, checking every scan of each title.
- `research/sourcing/_tcp/TCP.csv` and the TCP GitHub repositories.
- The Gutenberg catalogue, the LibriVox API, the Wayback mirrors, and the web.

HathiTrust, quod.lib.umich.edu, the Google Books API and the Oxford Text Archive were unreachable this time.
