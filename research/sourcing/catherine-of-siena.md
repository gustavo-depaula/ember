# St. Catherine of Siena (1347–1380) — sourcing

Complete works (the canon used by the Centro Nazionale di Studi Cateriniani and the ISIME critical-edition project): three works, all dictated in Tuscan volgare.

1. **Il Dialogo / Libro della divina dottrina** (1377–78), ~167 chapters in the vulgate division (Gigli 1707, Fiorilli 1912); Thorold groups them as treatises of Divine Providence, Discretion, Prayer, Obedience.
2. **Lettere / Epistolario**: ~380 letters (Tommaseo 1860 numbered 1–373; Misciattelli 1913–22 brings the total to 381 by adding later finds). A few are doubtful (e.g. letters known only from Gigli and not in the manuscript tradition); ISIME's critical edition (Dejure, 2023–) is the authority but is in copyright.
3. **Orazioni**: 26 prayers taken down by her secretaries in 1376–80 (Cavallini numbering I–XXVI).

Not hers: Raymond of Capua's *Legenda maior*, Caffarini's *Legenda minor*, letters of her disciples (in Grottanelli 1868, Misciattelli vol. 6 appendix).

Nothing by or about her is in the corpus apart from entries in `butler-lives-of-saints/` and `catholic-encyclopedia/`; `_corpus-books.txt` has no Catherine item.

## Summary

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Dialogo | it.wikisource, Fiorilli (Laterza, Bari 1912) — https://it.wikisource.org/wiki/Libro_della_divina_dottrina_(Caterina_da_Siena_-_Fiorilli) | A | Thorold 1896, complete — https://archive.org/details/seraphicvirginca00cathuoft (OCR) | A | ~155k / ~125k (1896 complete), ~85k (1907 abridged) | no |
| Lettere (~381) | Tommaseo–Misciattelli, Siena 1913, 6 vols — https://archive.org/details/lelettere01cath … `lelettere06cath` (OCR only) | A | Scudder, *St Catherine of Siena as seen in her letters*, 1905 (~64 letters, some abridged) — https://www.gutenberg.org/ebooks/7403 | A | ~500k (est.) / ~105k (selection) | no |
| Orazioni (26) | No clean text found. Scans only: Gigli, *L'opere*, vol. IV (1707); Aldine/older editions | A (scans) | No PD English found. Noffke 1983 (Paulist) is tier C | C | ~20k (est.) / — | no |

## Dialogo

Original sources, best first:
1. **it.wikisource, Fiorilli 1912**: https://it.wikisource.org/wiki/Libro_della_divina_dottrina_(Caterina_da_Siena_-_Fiorilli). Tier A (1912). It has 176 subpages: a prologue ("Al nome di Iesu Cristo crocifisso e di Maria dolce"), one page per chapter under the treatise headings (*Tractato de la discrezione*, *Tractato dell'orazione*, …), an "Aggiunta", Fiorilli's "Nota" and an index. I measured it through the API at about 186k words for every subpage, apparatus and index included, so the text alone comes to about 155k. Best because it has one page per chapter and is proofread against the scans.
2. **Project Gutenberg #26961**, the same Fiorilli text: https://www.gutenberg.org/ebooks/26961 (plain text: https://www.gutenberg.org/cache/epub/26961/pg26961.txt). Proofread by Distributed Proofreaders, chapters `CAPITOLO I`–`CLXVII`, 165k words with the PG boilerplate. Tier A. It is an independent transcription of the same edition, so it is the ideal cross-check for (1).
3. **Liber Liber**, Fiorilli again: https://liberliber.it/autori/autori-c/caterina-da-siena-santa/libro-della-divina-dottrina-volgarmente-detto-dialogo-della-divina-provvidenza/. The underlying text is PD, but Liber Liber puts CC BY-NC-SA 4.0 on its transcription, so use it only for cross-checking.
4. **it.wikisource, Caramella edition**: https://it.wikisource.org/wiki/Libro_della_divina_dottrina_(Caterina_da_Siena_-_Caramella). Only 4 chapters, so it is a fragment, useful at most for spot checks.
5. **Gigli 1707, *L'opere della serafica S. Caterina*, vol. IV** (the Dialogo with the Orazioni), as Google scans on archive.org (`bub_gb_RVl29ylUAp8C` and others are tomo I). Scans only, with older spellings. A different witness.

English, best first:
1. **Algar Thorold, 1896, complete** (Kegan Paul): https://archive.org/details/seraphicvirginca00cathuoft, full text at https://archive.org/download/seraphicvirginca00cathuoft/seraphicvirginca00cathuoft_djvu.txt (140k words with the introduction and contents). Tier A (1896; Thorold died 1936). The OCR is good but carries running heads and page numbers, which need cleanup. The only complete PD English text.
2. **Thorold, 1907, "new and abridged edition"**, on CCEL: https://www.ccel.org/ccel/c/catherine/dialog/cache/dialog.txt, also https://ccel.org/ccel/catherine/dialog. Tier A (the page says "This etext is in the public domain"; 1907). It is proofread (CCEL subject "Proofed", digitised by Harry Plantinga 1994) and 90.7k words with the introduction. It is **abridged**, so use it as the clean base for the passages it keeps and fill the cuts from the 1896 text. It keeps the same four treatises.
3. **IntraText ENG0139**: https://www.intratext.com/IXT/ENG0139/. The same CCEL abridged text (90,444 words), not independent.
4. Other copies of the 1907 text on archive.org (`dialogueofseraph00cath`, `dialogueseraphi00unkngoog`, and the 1925 and 1943 reprints): only scans of the same text.

Structure: prologue plus chapters 1–167, grouped into the treatises. Thorold's chapter numbering differs from Fiorilli's, and the 1896 text has 154 `CHAP.` headings in the OCR, so the import needs a concordance by incipit. Split by the Italian chapters.

## Lettere

Original sources, best first:
1. **Tommaseo, ed. Misciattelli, *Le lettere di S. Caterina da Siena*, Siena: Giuntini-Bentivoglio, 1913–1922, 6 vols.** archive.org `lelettere01cath` through `lelettere06cath`, e.g. https://archive.org/download/lelettere02cath/lelettere02cath_djvu.txt. Tier A: 1913 and 1922, Tommaseo died 1874 and Misciattelli 1937. I measured the OCR at 121k, 128k, 128k, 127k, 120k and 89k words (712k in all). That count includes Tommaseo's footnotes (interleaved and numbered), hyphenation, a biographical essay, indexes and summaries, so the letter text is roughly 500k (an estimate). The OCR is fair to good, with scattered errors such as "Carila" for *Carità* and "1'" for *l'*. Vol. 6 ends with an alphabetical index by addressee that gives every letter's summary, which helps with titles. **This is the base text, but only as OCR.**
2. **it.wikisource, the same Misciattelli edition** (vol. I 1922 reprint): https://it.wikisource.org/wiki/Le_lettere_di_S._Caterina_da_Siena. It has 205 subpages, mostly at 75% (proofread once), but the work is marked incomplete: it covers letters I–CLXXX+ of vol. I–II and only part of the later volumes. Use it as the clean text where it exists. The index has numbering slips (two entries labelled CXIII).
3. **it.wikisource, Burlamacchi's edition** (*Epistole*, Milano: Pirotta 1842, tomo I): https://it.wikisource.org/wiki/Epistole_(Caterina_da_Siena). It has 198 letters plus "A chi legge" and an "Orazione", ordered by addressee in Gigli's sequence. Letters 1–9 and 42 are at 75% and the other 188 at 25% (unproofread). Its numbering differs from Tommaseo's. A second transcription for cross-checking.
4. **Tommaseo 1860, 4 vols** (Firenze: Barbèra): archive.org `leletterediscat00tommgoog`, `…01tommgoog` to `…04tommgoog`, and `bub_gb_*` copies. These are Google scans with OCR, the editio princeps of the modern numbering. A third witness.
5. ISIME *Database Epistolario Katerina da Siena* (https://www.dekasisime.it/) and the Dejure critical edition (2023–): tier C, reference only.

English, best first:
1. **Vida D. Scudder, *Saint Catherine of Siena as seen in her letters*, London: Dent / New York: Dutton, 1905**, on Gutenberg as "Letters of Catherine Benincasa", #7403: https://www.gutenberg.org/ebooks/7403. Tier A (1905). Proofread, 114.6k words with Scudder's introduction and the linking narrative. It has about 64 letters (headings "TO …"), several of them abridged, so it is a selection and not the epistolary.
2. Scudder 1905 scans: https://archive.org/details/saintcatherineof00cath. The same text, useful for checking the Gutenberg transcription.
3. Edmund G. Gardner, *Saint Catherine of Siena* (1907): https://archive.org/details/StCatherineOfSiena. A biography that quotes and translates many letter passages. Tier A, but only in fragments.
4. Suzanne Noffke, *The Letters of Catherine of Siena* (MRTS/ACMRS 1988–2008, 4 vols): complete, but **tier C**.

There is no complete PD English. About 315 letters exist only in Italian, so pt-BR would have to be translated from the Italian.

## Orazioni

- **Original**: I found no clean digital text, not on it.wikisource (one "Orazione" page inside the Burlamacchi *Epistole*: https://it.wikisource.org/wiki/Epistole_(Caterina_da_Siena)/Orazione), not on Liber Liber, Gutenberg or IntraText. Scans: Gigli, *L'opere*, vol. IV (Siena/Lucca 1707–21, Google Books / archive.org `bub_gb_*`), which by the standard bibliographies prints the Orazioni after the Dialogo; I did not locate vol. IV on archive.org, so it is unverified. The critical text (Cavallini, Ed. Cateriniane 1978) is tier C.
- **English**: no PD translation found. Noffke, *The Prayers of Catherine of Siena* (Paulist 1983; 2nd ed. 2001) is tier C.
- Size: 26 prayers, about 20k words (estimate).
- Getting the text means OCR from the Gigli scans. It is small enough to do, but it is a scans-only job.

## Portuguese

I searched pt.wikisource, archive.org (Portuguese titles), dominiopublico.gov.br and Catholic sites (Permanência, Montfort, Obras Católicas) through web search and found **no PD or freely given Portuguese translation** of any of the three works. I found no early Portuguese printing of the *Diálogo* either. Known translations, best first, all tier C:
1. Frei João Alves Basílio, O.P., *O Diálogo* (São Paulo: Paulus, 1984; reprinted). Complete, sold. Tier C.
2. Frei João Alves Basílio, *Cartas completas* (Paulus, 2016 and later; the 2022 "Espiritualidade" edition is ISBN 978-65-5562-556-1; sample: https://deg.paulus.com.br/6913.pdf). Complete letters, sold. Tier C.
3. Frei João Alves Basílio, *Orações* (Paulus, "Clássicos do Cristianismo"; sample: https://deg.paulus.com.br/6251.pdf). Sold. Tier C.

So pt-BR has to come from our own translation of the Italian. Basílio's versions are useful only for spot-checking terminology, not for import.

## Recommendation

- Layout: `catherine-of-siena-opera-omnia/dialogo/` (it/ + en-US/), `…/lettere/` (one file per letter, Tommaseo–Misciattelli number plus addressee), `…/orazioni/`.
- **Import first: the Dialogo.** The Italian is clean (Wikisource, cross-checked against Gutenberg #26961). Build the English from Thorold 1896, using the proofread 1907 CCEL text wherever it overlaps, to cut the OCR cleanup.
- Second: the letters, which are the bulk of her work. The base is the 6-volume Misciattelli OCR, cleaned with the Wikisource vol. I–II transcriptions and the Burlamacchi Wikisource text. Strip Tommaseo's footnotes or keep them as notes. English only for Scudder's ~64 letters (mark the abridged ones), the rest Italian plus pt-BR.
- Orazioni: scans only (Gigli vol. IV), with no PD English. Do them last, by OCR.
- **Total**: about 675k Italian words (Dialogo ~155k, Lettere ~500k, Orazioni ~20k) and about 230k English words (Thorold 1896 ~125k, Scudder ~105k).

Measurements: raw downloads are in `research/sourcing/catherine-of-siena/raw/`, the Wikisource counter is `research/sourcing/scripts/ws.py`.
