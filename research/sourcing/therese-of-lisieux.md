# St. Thérèse of Lisieux (1873–1897): sourcing report

Bibliography followed: the *Nouvelle Édition du Centenaire* (NEC, Cerf/DDB 1988–1992; one-volume *Œuvres complètes* 1992), whose sigla the Carmel's archive site also uses: **Ms A, B, C** (autobiographical manuscripts), **LT** (letters by Thérèse, LT 1–266 plus fragments), **PN** (poems, PN 1–54) + **PS** (supplementary poems, PS 1–8), **RP** (*Récréations pieuses*, RP 1–8), **Pri** (prayers, Pri 1–21), **CJ / DE** (*Derniers entretiens*: Mother Agnès's *Carnet jaune*, plus sayings recorded by other sisters), and minor writings (school notebooks, images, *Écrits divers*).

**In the corpus?** No. Nothing by Thérèse is in `content/books/` (`_corpus-books.txt` is empty; `grep` finds her only in the biographical entries of `catholic-encyclopedia` and `cts-lives-of-the-saints`).

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Manuscrits autobiographiques A, B, C (authentic text) | archives.carmeldelisieux.fr/archive/manuscrit-a/ (`-b/`, `-c/`), NEC transcription, folio by folio | A (text) | Taylor 1912, *Story of a Soul* (Pauline's 1898 recension, not the authentic text): gutenberg.org/ebooks/16772 | A | 79.8k (A 55.8k, B 4.9k, C 19.1k) / 60.2k (chs. I–XI) | no |
| *Histoire d'une âme* 1898 recension (ed. Mother Agnès) | fr.wikisource.org/wiki/Histoire_d’une_âme (1912 ed., 100 % proofread); gutenberg.org/ebooks/36708 (1911 ed.) | A | Taylor 1912 (as above), plus archive.org/details/saintthaeraeseof00thaeuoft (1912 scan) | A | ~76k (12 chs.) / 70.5k incl. epilogue | no |
| Lettres (LT 1–266) | archives.carmeldelisieux.fr/correspondance/ (270 LT entries, NEC text) | A (text) | Taylor 1912 selection (~60 letters); complete English only in Sheed 1949 / ICS Clarke 1982–88 | A (selection) / C (complete) | 96.4k / 16.3k (selection) | no |
| Poésies (PN 1–54, PS 1–8) | archives.carmeldelisieux.fr/type_archive/poesies/ (authentic text) | A (text) | S. L. Emery 1907, *Poems of St. Teresa, Carmelite of Lisieux*: ccel.org/ccel/therese/poems.html | A | 24.0k / ~30k (Emery, retouched versions) | no |
| Récréations pieuses (RP 1–8) | archives.carmeldelisieux.fr/type_archive/recreations-pieuses/ | A (text) | none in the public domain (ICS Kinney & Conroy 2008) | C | 40.0k / – | no |
| Prières (Pri 1–21) | archives.carmeldelisieux.fr/type_archive/prieres/ | A (text) | Taylor 1912 has the main ones (Act of Oblation, Holy Face, etc.) | A (partial) | 4.3k / 4.1k (partial) | no |
| Derniers entretiens: Carnet jaune (Mother Agnès) | archives.carmeldelisieux.fr/archive/carnet-jaune/ + `/carnet-jaune-2/` | A by brief rule (see US note) | *Novissima Verba*, Carmelite nuns of New York, Kenedy 1952 | unverified | 41.3k / ~28k | no |
| Conseils et souvenirs (1898 appendix, by the sisters) | Wikisource 1912 `/2/1`; Gutenberg 36708 | A | Taylor 1912 "Counsels and Reminiscences" | A | 12.4k / 12.1k | no |
| Minor writings (school notebooks, images, *Écrits divers*) | archives.carmeldelisieux.fr/oeuvres-de-therese/cahiers-scolaires/, `/ecrits-divers/`, `/images-faites-et-donnees-par-therese/` | A (text) | none | – | ~7–10k / – | no |

Word counts were measured on downloaded text (in `research/sourcing/therese-of-lisieux/raw/`) unless marked "~".

## Copyright: the Carmel's archive site

- Thérèse died in 1897, so her own text is in the public domain. Every posthumous first publication is now older than the 25-year French right for posthumous works (art. L123-4 CPI): Ms 1956, letters 1948/1972, DE 1971, poems 1979, RP 1985, NEC 1988–92.
- The old site `archives-carmel-lisieux.fr` returns 403 everywhere. The current site is **archives.carmeldelisieux.fr** (WordPress).
  - Its `/mentions-legales/` page renders no legal text, only a heading and cookie banner (checked 2026-11-01).
  - The archive pages show no ©, licence or "tous droits réservés".
  - So I found **no terms at all**. The Carmel neither grants nor reserves rights.
- What is ours to take is Thérèse's words. The NEC editorial apparatus is not: dating notes, "Destinataire", headnotes, the bracketed date corrections in Ms A, and the variant notes are the editors' work. Strip them at import.
- **US caveat for DE/CJ:** Mother Agnès died in 1951, so the brief's 70-year rule makes her notebook A. But the Carnet jaune was first published in 1971 and was still protected in France on 1 Jan 1996, so URAA restoration may give US protection until about 2066 for her framing narration (not for Thérèse's recorded words). Sayings recorded by Céline (Sr Geneviève, d. 1959) stay protected in the EU until the end of 2029. **Tier C for now.**

## Notes per work, with ranked sources

### Manuscrits A, B, C (authentic text)

Structure: Ms A, 85 folio entries (to Mother Agnès, 1895); Ms B, 5 folios (to Sr Marie du Sacré-Cœur, 1896); Ms C, 37 folios (to Mother Marie de Gonzague, 1897). A chapter split should follow the manuscripts, optionally sub-divided as NEC does (by folio), or into the thematic sections used in modern editions. The 1898 chapter division is Pauline's, not Thérèse's.

Original:
1. **archives.carmeldelisieux.fr/archive/manuscrit-a/** (`manuscrit-b/`, `manuscrit-c/`).
   - The transcription is not in the visible HTML. It sits in an embedded `<script id="json-cahiers">` JSON array, one entry per folio (`content_one` / `content_two` = recto / verso, plus facsimile URLs).
   - Clean typed text, the authentic NEC text. Extraction script: `research/sourcing/_tools/cahiers.py`.
   - Best: authentic, complete, clean, with facsimiles to check against.
2. **Wayback Machine copy of the old site**, folio pages such as `web.archive.org/web/2020id_/http://www.archives-carmel-lisieux.fr/carmel/index.php/02-10/02/02-recto`.
   - Same text, one page per folio side. The CDX index shows folio pages for A 02–86, B, and C 01–37.
   - Use as the cross-check witness.
3. *Manuscrits autobiographiques* 1957 (Office central de Lisieux, ed. Père François de Sainte-Marie): on archive.org only as restricted lending copies. Not usable as a text source.

English: **no public-domain English of the authentic manuscripts.** Knox 1958 (Harvill), Beevers 1957 and Clarke/ICS 1975 are all tier C. The only PD English is Taylor's translation of Pauline's recension (next section). For an `en-US/` beside an authentic `fr-FR/`, either accept Taylor as a non-aligned translation or wait for our own en translation.

### *Histoire d'une âme* (1898 recension)

Pauline's (Mother Agnès's) edited text: twelve chapters, the last being her account of Thérèse's death, plus appendices. Useful as the historical text the world read and as the base for the PD English.

Original:
1. **fr.wikisource.org/wiki/Histoire_d’une_âme**: 1912 edition, 100 % proofread.
   - Subpages `/1/1`–`/1/12` (chapters), `/2/*` (Conseils et souvenirs, Acte d'offrande, prayers), `/3/*` (letters), `/4/*` (poems in three parts), `/5` (*Pluie de roses*, 51.5k words of miracle accounts, not by Thérèse), `/6`.
   - Total 203k words.
   - Best: proofread text with a page scan behind it.
2. **gutenberg.org/ebooks/36708**: 1911 edition (imprimatur 18 Feb 1911), PGDP-proofread, 189k words. Prints "TOUS DROITS RÉSERVÉS" from the original book, which is irrelevant now (PD).
   - Excellent second witness.
3. archive.org item `24_20200705` ("HISTOIRE D'UNE AME 1898"): a modern retyping with no source text files. Low value.

English:
1. **Taylor, *Soeur Thérèse of Lisieux* (Burns Oates & Washbourne, 1912)**, gutenberg.org/ebooks/16772.
   - 110k words: chapters I–XI 60.2k, epilogue 10.3k, Counsels 12.1k, letters 16.3k, prayers 4.1k. Poems and papal letters omitted.
   - Clean.
2. **archive.org/details/saintthaeraeseof00thaeuoft**: the same 1912 book in full, including *Selected Poems* and *Shower of Roses*. OCR, 146k words; fair quality.
3. ccel.org/ccel/therese/autobio.html (Taylor, HTML).
4. archive.org/details/alittlewhiteflow00thaeuoft: Taylor 1916, abridged.

Translator note: T. N. Taylor's death date was not verified. The 1912 publication date makes the text A under the brief's rule.

### Lettres (LT)

Structure: 266 numbered letters plus fragments and variants (270 entries on the site), chronological, each with its recipient and date. One file per letter, or grouped by year.

Original:
1. **archives.carmeldelisieux.fr/correspondance/**, via the REST API `wp-json/wp/v2/correspondance` (3,555 records; the 270 titled "LT …" are Thérèse's).
   - Text is in the post body: clean, NEC text, 96.4k words.
   - The other records are family letters and Carmel circulars, not hers.
2. **Wayback copies of the old site**: per-letter pages such as `…/aout-1897/11445-lt-262-a-soeur-genevieve-3-aout-1897`. Cross-check.
3. Wikisource HdA 1912 `/3/*` and Gutenberg 36708: the 1898 selection, edited by Pauline, about 17k words. Not authentic, but independent.

English:
1. **Taylor 1912** (Gutenberg 16772, letters section): about 60 letters to Céline, Agnès, Marie, Léonie, the Guérins and her missionary brothers, 16.3k words. A.
2. archive.org `st.-therese-of-lisieux-letters` and `st-therese-letters.doc`: both are the same Taylor letters extracted, not a new translation.

Complete English (Sheed 1949, Sheed & Ward; Clarke, ICS 1982/88) is **C**. About 80 % of the letters have no PD English.

### Poésies (PN, PS)

Structure: 54 PN + 8 PS, one file per poem. The site's posts give the authentic text in the post body (64 posts including an index; 24.0k words of verse), with headnotes (date, recipient) to strip. The site also publishes the 1898 "retouched" variants (`synopse-retouches…`).

Original:
1. **archives.carmeldelisieux.fr/type_archive/poesies/** (e.g. `/archive/pn-23/`). Authentic.
2. **Wikisource HdA 1912 `/4/*`**: the poems as Pauline retouched them (about 37k words, more poems as printed).
3. Gutenberg 36708 poems section: the same recension.

English:
1. **S. L. Emery, *Poems of St. Teresa, Carmelite of Lisieux*** (Angel Guardian Press, Boston, 1907): ccel.org/ccel/therese/poems.html; also archive.org/details/poems-of-st-therese-of-lisieux (the CCEL PDF).
   - Verse translation of the 1898 texts, about 30k words.
2. **Taylor 1912 "Selected Poems"** (archive.org scan only, about 5k words).

Modern complete translations (Kinney/ICS 1996; Bancroft 1996) are C.

### Récréations pieuses (RP 1–8)

Eight convent plays, including two on Joan of Arc; RP 3 alone is 11.5k words. Original: **only the Carmel site** (json-cahiers transcription, 40.0k words).
- The new site's post bodies hold only metadata. The text is in the JSON.
- The old site on Wayback is probably a second witness, but I couldn't check it: archive.org went offline mid-session.

English: none PD. **Original-only work**, so our en translation is needed.

### Prières (Pri 1–21)

Original: Carmel site JSON, 4.3k words; 19 of 21 entries carry text, the other 2 are image-only. Includes the Act of Oblation (Pri 6). Second witness: Wikisource HdA 1912 `/2/2`–`/2/8` (the 1898 selection).

English: Taylor 1912 prayers (4.1k words: Act of Oblation, Consecration to the Holy Face, Prayer to the Child Jesus, etc.). The complete set (ICS 1997) is C.

### Derniers entretiens / Carnet jaune

Structure: April–September 1897, day by day, numbered sayings. The site has two pages: `carnet-jaune` (99 sheets) and `carnet-jaune-2` (47 sheets), together 41.3k words. These include Mother Agnès's narration and her closing attestation.

The other witnesses in the DE volume (sayings recorded by Céline, Marie of the Sacred Heart and others) were **not found** on the new site. Céline's records are tier C until 2030 regardless.

English:
1. ***Novissima Verba*** (Kenedy 1952, "revised translation by the Carmelite Nuns of New York"; marked "Copyright 1952"): archive.org/details/novissimaverba (31.5k words, OCR) and `novissima-verba-saint-therese-of-lisieux` (27.9k, cleaner retyping).
   - **Unverified.** US 1952, and I could not reach the renewal databases (Stanford's copyright renewal database timed out). It translates the older *Novissima Verba* selection, not the full DE.
2. Taylor 1912 "Counsels and Reminiscences" overlaps some sayings (A).

Clarke/ICS *Last Conversations* 1977 is C.

### Conseils et souvenirs; *Pluie de roses*

*Conseils et souvenirs* are the sisters' recollections of Thérèse, not her own writing (Wikisource 12.4k / Taylor 12.1k, both A). Import them only as an appendix of the 1898 recension. *Pluie de roses* (accounts of miracles) is not hers: skip it.

## Recommendation

Layout: `content/books/therese-opera-omnia/` with sub-books:

- `manuscrits` (A, B, C). The authentic text is `fr-FR/`. The `en-US/` is either left empty for now or filled with Taylor as a separate book, `histoire-dune-ame-1898`, so the two aren't misaligned.
- `histoire-dune-ame-1898`: Wikisource 1912 + Gutenberg 36708 (fr) and Taylor/Gutenberg 16772 (en), all A, and already chapter-aligned (Taylor's chapters I–XI correspond to the French I–XI, and his epilogue to chapter XII).
- `lettres` (LT, one chapter per letter, or per year; en = the Taylor selection where it exists).
- `poesies` (PN/PS; en = Emery 1907).
- `recreations-pieuses` (fr only).
- `prieres`.
- `derniers-entretiens` (Carnet jaune; hold back until the US status is decided).
- `ecrits-divers` (optional).

Import order:
1. `histoire-dune-ame-1898`: the cleanest bilingual PD pair, ready now.
2. `manuscrits` from the Carmel JSON (authentic text, which pt-BR should translate).
3. `poesies`.
4. `lettres`.
5. `prieres`.
6. `recreations-pieuses`.
7. `derniers-entretiens`.

Can't be sourced cleanly:
- Any PD English of the authentic manuscripts, the complete letters, the RP and DE (only tier C modern translations exist).
- The DE witnesses other than the Carnet jaune.
- The Carmel site's terms (none stated).

The Carmel's texts are clean digital text, not scans, but they come out of a JSON blob. Write the import script against the API and json-cahiers, and keep the facsimile URLs for audit.

**Total size, original (authentic French):** Ms 79.8k + LT 96.4k + PN/PS 24.0k + RP 40.0k + Pri 4.3k + CJ 41.3k + minor ~8k ≈ **294k words**. Plus the optional 1898 recension (HdA chapters, Conseils, its appendices) of about 90k words. **English PD available:** about 110k (Taylor) + about 30k (Emery) ≈ **140k words**.

Raw downloads are in `research/sourcing/therese-of-lisieux/raw/` (the WP API dumps in `api/` are about 92 MB).

## Portuguese

Search limits, so "not found" means "not found from here": the session's web-search budget ran out mid-task, and Domínio Público, BNDigital, HathiTrust and the BNP digital library were unreachable (403) from this machine. The pre-1960 Portuguese *História de uma alma* translations are therefore **not located**. Checked: archive.org, pt.wikisource API, the catalogues of Paulus (API + sample PDFs), Edições Carmelitanas and Cultor de Livros, and the Lisieux sanctuary site. Downloads: `research/sourcing/therese-of-lisieux/pt/`.

### Manuscrits autobiographiques A, B, C / *Histoire d'une âme*

1. **Religiosas do Carmelo do Imaculado Coração de Maria e de Santa Teresinha (Cotia, SP) (tr.), *História de uma alma: manuscritos autobiográficos*, São Paulo: Paulus, 1979 / 1986** (Clássicos do cristianismo).
   - Many reprints: ISBN 978-85-349-0456-8; bolso 978-85-349-1973-9; luxo 2019 978-85-349-4889-0; Clássicos de bolso 5th ed. 2024 978-85-349-5536-2.
   - Samples with CIP: https://deg.paulus.com.br/5054.pdf, https://deg.paulus.com.br/7486.pdf.
   - **Follows the authentic text**: translated from *Histoire d'une âme. Manuscrits autobiographiques*, Cerf/DDB 1972 (the centenary team's text, from Fr François de Sainte-Marie's 1956 *Manuscrits autobiographiques*), arranged in Mother Agnès's 1898 chapter scheme with Ms A/B/C marked.
   - **Tier C**: "© Editions du Cerf, Desclée-Brouwer, Paris, 1972"; "Todos os direitos reservados…".
   - An unauthorised upload (OCR ~93k words, fair; the cover page is garbled) is on archive.org `historia-de-uma-alma-santa-teresa-do-menino-jesus`. Its existence does not change the tier.
   - The standard Brazilian text and the best reference for our pt-BR of Ms A/B/C.
2. **Frei José Gregório [Lopes Cavalcante Júnior], OCD (tr.), *Obras completas de Santa Teresinha do Menino Jesus*, 2 tomos, "Edição crítica", Cultor de Livros**, ISBN 978-85-5638-370-9, 1698 pp. (https://cultordelivros.com.br/produtos/obras-completas-de-santa-teresinha-do-menino-jesus-02-tomos-edicao-critica/).
   - Its description: the Lisieux team's critical work ("trabalho de investigação e compilação que durou 45 anos"), so the NEC. It includes the Manuscripts, letters, poems, plays, prayers, images, school notebooks and loose notes, "com notas".
   - **Tier C.** The fullest Portuguese NEC.
3. **Paulus, *Obras completas de Santa Teresa do Menino Jesus e da Santa Face: escritos e últimos colóquios*** (Clássicos do Cristianismo 3), 2nd ed. 2016 (5th printing 2026), 1344 pp., ISBN 978-85-349-4471-7 (https://loja.paulus.com.br/obras-completas-vol-3-luxo/p).
   - Contents per the publisher: Manuscripts, 266 letters, 8 plays, 54 poems + 8 supplementary, 21 prayers, *escritos variados*, *Últimos colóquios*: the NEC sigla set.
   - Translator not confirmed. **Tier C.**
4. **Edições Loyola, *Obras completas de Santa Teresinha do Menino Jesus***, 1st ed. 1997 (centenary), 3rd ed. 2022, 1136 pp. (listed at https://www.edicoescarmelitanas.com.br/obras-completas-de-santa-teresinha-do-menino-jesus).
   - "Edições Loyola sente-se feliz de poder apresentar ao público brasileiro pela primeira vez as Obras completas…". Translator not confirmed. **Tier C.**
5. **Cultor de Livros, *História de uma alma*** (Clássicos de Espiritualidade 30), ISBN 978-85-5638-254-2, 256 pp. Which text it follows (1898 or Manuscripts) and the translator are not confirmed. **Tier C.** Lead, not opened.
6. **Pre-1960 Portuguese translations of the 1898 *Histoire d'une âme***: they existed. The Brazilian Carmelite magazine *Flores do Carmelo* (1928, archive.org `flores-do-carmelo-1928`, OCR) refers to readers of the "Historia d'uma alma". **No copy was located from here** (no archive.org or pt.wikisource hit). Lead: BN Brasil / BN Portugal catalogues for "Historia d'uma alma" / "Thereza do Menino Jesus" 1900–1930. A translation from that period by a translator dead 70+ years would be tier A and would follow Mother Agnès's 1898 text, not Ms A/B/C.

### Lettres, Poésies, Récréations pieuses, Prières, Derniers entretiens, minor writings

- **Only inside the in-print complete editions** (items 2–4 above: Cultor 2 tomos, Paulus 2016, Loyola 1997/2022), all tier C. The Paulus volume has the *Últimos colóquios* (Carnet jaune etc.).
- The Lisieux sanctuary's Portuguese pages (https://www.therese-de-lisieux.catholique.fr/pt/lhistoire/les-ecrits-de-therese/ and its `manuscrits/`, `lettres/`, `poesies/`, `prieres/`, `recreations-pieuses/` subpages) give short introductions, apparently machine-translated, plus a quotation or two each. "Consulte os textos completos" links back to the French archive. They have no Portuguese texts and no rights statement.
- Edições Carmelitanas lists anthologies (*No Coração da Igreja: textos seletos*, *Santa Teresinha do Menino Jesus escreve aos Seminaristas*): excerpts, tier C.

### Best Portuguese reference per work

| Work | Best PT | Tier | Use |
|---|---|---|---|
| Ms A, B, C (authentic) | Carmelo de Cotia, Paulus 1979/86 (from Cerf/DDB 1972) | C | reference for our pt-BR |
| *Histoire d'une âme* 1898 recension | old Portuguese translations exist (1928 mention) but none located | unverified | hunt in BN catalogues |
| Lettres (LT) | Frei José Gregório, Cultor (NEC); Paulus 2016 | C | reference |
| Poésies (PN/PS) | same | C | reference |
| Récréations pieuses | same | C | reference |
| Prières | same | C | reference |
| Derniers entretiens / Carnet jaune | Paulus 2016 *Últimos colóquios*; Cultor | C | reference |
| Minor writings | Cultor 2 tomos | C | reference |

**Recommendation.** No Portuguese text is importable now: every edition found is tier C. Translate from the authentic French (Carmel archive) in our pipeline. Use the Carmelo de Cotia *História de uma alma* (Paulus), the standard Brazilian wording, and the Cultor/Frei José Gregório NEC as references. If an early-1900s Portuguese *História d'uma alma* is located, it would be a PD pt witness for the 1898 recension only.
