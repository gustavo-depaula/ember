# Content Sources

Where each Bible translation comes from and how it is rebuilt, and what the credits screen lists. Every other source is described by its own code under `apps/app/src/sources/`.

## Bible

The picker's list is `translations` in `apps/app/src/lib/bibleTranslations.ts`. Every translation files its books under the Douay slugs (`1-kings`, `psalms`, `apocalypse`), so a reference or a reading position opens the same book in any of them.

**In the corpus** (`content/bible/<dir>/`, one `<slug>.json` per book as `{chapter: {verse: text}}`):

| Code | Translation | Source | Rebuilt by |
|------|-------------|--------|------------|
| `DRB` | Douay-Rheims, Challoner's revision (1749–52) | `github.com/BibleCorps/ENG-B-DRC1750-pd-PSFM` | `import-bible-usfm.py drb` |
| `CPDV` | Catholic Public Domain Version (Conte, 2009) | `github.com/BibleCorps/ENG-B-CPDV2009-pd-PSFM` | `import-bible-usfm.py cpdv` |
| `VULG` | Clementine Vulgate | `ebible.org/Scriptures/latVUC_usfm.zip` | `import-bible-usfm.py vulgate` |
| `KNOX` | Knox Bible (1945–50) | `bibliacatolica.com.br/the-knox-bible/` (the same text as Baronius Press's `catholicbible.online/knox/`, which cuts off a crawl partway) | `import-bible-web.py knox` |
| `MS` | Matos Soares, 1956 edition | `liriocatolico.com.br/biblia_online/biblia_matos_soares/` | `import-bible-web.py matos-soares` |

- The Douay-Rheims is the fallback for every other translation: offline, or for a chapter the other numbers differently. The import keeps Challoner's chapter arguments and book introductions (`summaries.json`). Checked verse by verse against ebible.org's 1899 edition (`engDRA`): the same text. The source ran the last verse of seven chapters into the one before (John 11:57, 2 Corinthians 1:24, Genesis 5:32, 2 Kings 13:39, Psalms 28:11 and 150:6, Amos 9:15); the import splits them so references resolve.
- **Commentary** is read beside the text (tap a verse in the reader) and in full on the verse's own page. Every entry covers a run of verses of one chapter; a verse shows every entry whose run holds it.
  - **Haydock** (`content/bible/haydock/`, from `github.com/cmahte/ENG-B-Haydock1883-pd-PSFM`, the USFM of the transcription at `johnblood.gitlab.io/haydock`): `{chapter: {verses: [note, …]}}` per book against the Douay-Rheims' verses, where `verses` is `"3"`, `"8-9"` for a note on several, or `"0"` for the chapter as a whole; and `intros.json`, which nothing renders yet. 21,595 notes on 58% of the verses. The Greek and Latin apparatus sits inside the notes in `{…|}` and is left out on display.
  - **Catena Aurea** (`content/bible/catena/`, built by `scripts/build-catena-commentary.py` from the four Catena books in `content/books/aquinas-opera-omnia/catena-aurea/`): `{book, chapters: {chapter: [{from, to, lecture}]}}`, an index only. The text stays in the book: the app reads the lecture with `loadBookChapterText` and divides it into the Fathers' voices by `fathers.json`, the hand-kept table of how each transcription abbreviates their names, which the script reads too. English is shown; the books also have the Latin. A lecture names its verses three different ways across the four transcriptions; those that give only the words commented are placed by matching them to the Douay-Rheims between their neighbours, and the script prints the few it could place only by position (parts of Matthew 2 and 5, John 1). The Catena's verse numbers are the King James's, so a passage can be a verse off where the Douay numbers differently.
  - **St Thomas's commentaries** (`content/bible/aquinas/`, built by `scripts/build-aquinas-commentary.py` from `content/books/aquinas-opera-omnia/biblical/`): the same index shape for 21 books of the Bible; `index.json` lists them. The verse's page links to the lecture in the book reader. Most lectures open with their verses marked `^9:8^`. Where the commentary has a file to a chapter (Psalms 1–54, Isaiah, Jeremiah, Romans, the Pastorals) the passage is the chapter. 1–2 Corinthians and Hebrews have no marks, only the words expounded, in a modern English: their lectures are placed in order through each chapter by matching those words to the Douay-Rheims, and the script reports what it could not place (2 Corinthians 12, three lectures of 1 Corinthians). The lectures cite numbered paragraphs for each verse (`[n. 169]`), but the paragraphs lost their numbers on import, so a verse cannot yet be taken to its place inside a lecture.
  - **Where the Church cites a passage** (`content/bible/clerus/`, built by `scripts/build-clerus-index.py`): `{chapter: [{from, to, passage, ccc, homilies?, magisterium?}]}` by the passages Biblia Clerus divides the Bible into, renumbered to the Douay-Rheims. `ccc` is the Catechism's paragraphs, taken from the Catechism's own footnotes (Clerus's index of them is about half wrong); a paragraph's text is read from vatican.va. `homilies` are chapters of books in the corpus (Chrysostom, Augustine). `magisterium` is `{work, places: [[number, page, anchor]]}` for documents Clerus has in Portuguese, likewise taken from the documents' own pages; `sources/clerus/place.ts` reads the section from Clerus, which sends no CORS headers, so not on web. The whole index, every work, and what was checked of it, is in `research/clerus-index/`.
- Footnotes are in the other sources too and not imported: Challoner's annotations, Conte's notes, the Glossa Ordinaria in the Vulgate, Knox's and Matos Soares' notes.
- The CPDV prints Esther in the Greek order (15 chapters, where the Douay has 16).
- Lírio Católico sits behind Cloudflare, which turns away some non-browser clients; the importer sends an `okhttp` User-Agent.

**Read from the publisher** (one chapter per request, kept in the on-device `external_content` table):

| Code | Translation | Source |
|------|-------------|--------|
| `AM` | Bíblia Ave Maria | The Claretians' API, `biblia.parresia.com/wp-json/bible/v2/chapter/<livro>_<n>` (behind `claretianos.com.br/biblia-ave-maria-online/`); CORS open, so it reads on web too |

- The Ave Maria numbers the Psalms as the Vulgate does but follows the Hebrew chapter divisions elsewhere (Joel has 4 chapters, Malachi 3).

**Not in yet:**

- **Bíblia CNBB.** Lírio Católico withdrew its copy. Three others exist, none clean:
  - `clerus.org/bibliaclerusonline/pt/66c.htm` (the Dicastery for the Clergy): all 73 books as static HTML on opaque filenames, several chapters to a page, no API and no CORS.
  - `catolicaflix.com/biblia/biblia-cnbb`: one PDF per book (Word exports of 2008, real text layer), all 73 books. It shares clerus's gaps (Haggai 1:9 runs into verse 13), so both come from the same files.
  - The Bolls.life export: a different printing, 66 books only (no deuterocanon, Daniel 3 without the canticle), with book-introduction prose spliced into 1 Samuel 1:19. It is the one copy that has the passages the other two lost.
- **Original Douay-Rheims (1582, 1609–10).** EEBO-TCP `A16049` and `A11777` are in original spelling, the Old Testament without reliable verse marks. `github.com/janvier-s/original-douay-rheims` is modern-spelling JSON of unverified provenance.
- **Kenrick's revision, Figueiredo.** Page scans only (archive.org).
- Rejected: Bolls.life (no deuterocanon in its Douay-Rheims or its CNBB); Bible Gateway (no public API); API.Bible (FUMS tracking forces online-only use).

## Attribution

The credits screen should list:

1. "Scripture texts: Douay-Rheims, Catholic Public Domain Version, Clementine Vulgate, Knox Bible, Bíblia Matos Soares; commentary by Fr. George Leo Haydock and from the Catena Aurea of St Thomas Aquinas; index of citations from the Biblia Clerus of the Dicastery for the Clergy."
2. "Bíblia Ave Maria from the Claretian Missionaries."
3. "Catechism of the Catholic Church, Libreria Editrice Vaticana."
4. "Liturgical texts and traditional Mass propers from Divinum Officium."
5. "Liturgy of the Hours texts provided by iBreviary."
6. "Daily Gospel commentary and meditations courtesy of Opus Dei (opusdei.org)."
7. Links to the GitHub repositories used.
