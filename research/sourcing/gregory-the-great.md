# St. Gregory the Great (c. 540–604): sourcing

**Bibliography backbone:** CPL 1708–1723, and the contents of Migne PL 75–79 (the Maurist edition, Sainte-Marthe 1705, reprinted by Migne 1849). PL is the edition every free Latin source below transcribes. The modern critical texts (CCSL 140–144, SC, MGH for the Register) are referenced only as authorities.

**Already in the corpus** (`content/books/church-fathers/gregory-great-pope/`):
- `pastoral-rule`: en-US Barmby (NPNF II/12, 1895, via New Advent), 4 chapters = 4 parts, plus pt-BR. **No Latin.**
- `register-of-letters`: en-US Barmby NPNF selection, 420 letters (Book I Letter 1 … Book XIV Letter 17), about 226k words. **No Latin, and only about half the Register.** NPNF uses the Maurist numbering, the same as PL 77 and Wikisource, so a Latin `la/` aligns letter for letter. MGH numbering differs.

Everything else of Gregory is absent from the corpus.

## Summary

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Moralia in Iob (35 books) | la.wikisource `Moralia/I`–`/VI` + `/prae` (PL 75–76) | A | *Morals on the Book of Job*, Library of the Fathers (Oxford: Parker 1844–50), Lectionary Central https://lectionarycentral.com/gregorymoraliaindex.html | A | 531k / ~810k | no |
| Homiliae XL in Evangelia | la.wikisource *Homiliarum in Evangelia* (PL 76) | A | none PD complete (Hurst 1990 = C) | – | 91.6k / – | no |
| Homiliae in Hiezechihelem (2 bks, 22 hom.) | Bk I: la.wikisource (12 hom.); Bk II: DCO LT PDF (PL 76) | A | none PD (Gray 1990 = C) | – | 111.5k / – | no |
| Regula pastoralis (4 parts) | la.wikisource *Regulae Pastoralis* (from DCO, PL 77) | A | Barmby 1895 (corpus); Bramley 1874 facing Latin | A | 41k / 67k | en-US + pt-BR yes, **la missing** |
| Dialogi (4 bks; II = Life of Benedict) | la.wikisource *Dialogi (Gregorius Magnus)* | A | 1608 "P.W." trans., ed. Gardner 1911, CCEL/Pearse | A | 56.8k / 97k | no |
| Registrum epistularum (14 bks, ~850 letters) | la.wikisource *Epistolae (Gregorius Magnus)* (PL 77, Corpus Corporum TEI) | A | Barmby NPNF 1895–98 (selection) | A | 233k / 226k (selection) | en-US partial, **la missing** |
| Expositio in Canticum (Cant 1:1–8) | la.wikisource *Expositio in Canticum Canticorum (Gregorius Magnus)* | B/unverified (see notes) | none PD (DelCogliano 2012 = C) | – | 7.5k / – | no |
| In I Regum expositiones VI (**doubtful**, prob. Peter of Cava, 12th c.) | la.wikisource *Commentarii in librum I Regum* (PL 79) | A | none found | – | 186k / – | no |
| Hymni (doubtful attributions) | la.wikisource *Hymni (Gregorius Magnus)* (PL 78) | A | Neale / Caswall versions (19th c.) | A | 0.6k / small | no |
| Spurious/attributed: In VII psalmos poenitentiales; Super Cantica expositio; Concordia testimoniorum; Liber sacramentorum; Liber antiphonarius; Liber responsalis | DCO Migne PDFs (PL 78–79) | A | – | – | not measured | no, leave out |

## Per work: every source found, ranked

### Moralia in Iob

Latin:
1. **la.wikisource**, https://la.wikisource.org/wiki/Moralia (six "Pars" pages `Moralia/I`…`/VI` + `Moralia/prae`). Migne text with PL column numbers and Maurist "[ Vet. XIV. ]" old-chapter markers inline. These must be stripped, but they are regular. Complete: the Epistle to Leander, then Books 1–35, ending "*…pro me lacrymas reddat*". Counted at **531k words**. Books are `==LIBER …==` headings, numbered sections within. Downloaded: `gregory-the-great/ws/moralia/`. Ignore the stray `Moralia I/IV` page: it is a 67k-word duplicate fragment.
2. **DCO** `Moralia Pars 01–11` LT PDFs (born-digital Migne transcription, same family as #1), https://www.documentacatholicaomnia.eu/01_01_0590-0604-_Gregorius_I,_Magnus,_Sanctus.html. Also the PL 75–76 scan PDFs (`Moralium Libri… Pars I/II`, MLT). Tier A.
3. **Corpus Corporum** (Zürich, TEI of PL by Ph. Roelli 2013), mlat.uzh.ch. This is the upstream of the Wikisource texts. Its JS browser could not be scraped. Tier A.
4. Critical: Adriaen, CCSL 143–143B (1979–85) = **C**, cite only.

English:
1. **Library of the Fathers, *Morals on the Book of Job*** (3 vols in 4, Oxford: Parker; London: Rivington, 1844–50; translator usually given as James Bliss, preface by Charles Marriott; attribution varies by catalogue). Lectionary Central transcription: https://lectionarycentral.com/gregorymoraliaindex.html, pages `GregoryMoralia/Book01.html` … `Book35.html` + Epistle + Preface, plus a complete PDF/EPUB. Complete (Book 35 ends at the same sentence as the Latin). The site says "this project is ongoing… all the notes will also be added", so footnotes are partial. No copyright claim on the site. **~810k words** counted including light navigation. Tier **A**. Downloaded: `gregory-the-great/en/lc-moralia/`.
2. HathiTrust / Princeton Theological Seminary scans of the same LoF volumes (e.g. https://commons.ptsem.edu/id/moralsonbookofjo18greg, `…jo21greg`; HathiTrust record 009927228). Use these to check the LC transcription. Tier A.
3. DCO `Moralia in Job` EN .doc (same LoF text, unverified). Kerns/Cistercian *Moral Reflections on the Book of Job* (2014–22) = **C**.

### Homiliae XL in Evangelia

Latin:
1. **la.wikisource**, https://la.wikisource.org/wiki/Homiliarum_in_Evangelia: preface + homilies I-I…I-XX, XXI…XL. Complete, **91.6k words**. Page `XXXX` is a 40-byte stub; XL is the real page.
2. **DCO** *XL Homiliarum in Evangelia Liber Primus / Secundus* LT PDFs (clean born-digital Migne, 35.7k + 55.9k = 91.6k words, matching #1). Downloaded: `gregory-the-great/dco/`. Tier A.
3. PL 76 scan (DCO MLT). Critical: Étaix, CCSL 141 (1999) = C.

English: **no complete PD translation found.** Hurst, *Forty Gospel Homilies* (Cistercian 1990; Gorgias reprint 2009) = **C**. Burke, *Parables of the Gospel* (Scepter 1960; Cluny reissue) = C. Bhattacharji (hom. 21–26, 2001) = C. PD fragments: Hom. 17 as *A Homily of Saint Gregory the Great on the Pastoral Office* (Dublin: Gill, 1908), archive.org `homilystgregory00greguoft`, tier A. Matins lessons in Bute's *Roman Breviary* (1879). Excerpts in Aquinas's *Catena Aurea* (Newman ed. 1841–45, already in the corpus). **The pipeline must translate from Latin** (la → en/pt-BR), or ship la + pt-BR only.

### Homiliae in Hiezechihelem prophetam (2 books: 12 + 10 homilies)

Latin:
1. **Book I: la.wikisource**, https://la.wikisource.org/wiki/Homiliarum_in_Ezechielem_Prophetam (preface to Marinianus + hom. I–XII), 58k words. **Wikisource lacks Book II.**
2. **Book II: DCO** *Homiliarum in Ezechielem Prophetam Liber Secundus* LT PDF, `…/01p/0590-0604,_SS_Gregorius_I_Magnus,_Homiliarum_in_Ezechielem_Prophetam_Liber_Secundus,_LT.pdf`. Clean text: preface + 10 homilies, ending "FINIS", 53.5k words. DCO Liber Primus (58.1k) duplicates Wikisource Book I. Tier A.
3. PL 76 scan (DCO MLT). Critical: Adriaen, CCSL 142 (1971) = C.

English: **none PD.** Theodosia Tomkinson (Gray), *Homilies on the Book of the Prophet Ezekiel* (Center for Traditionalist Orthodox Studies, 1990; 2nd ed. 2008) = **C**.

### Regula pastoralis

Latin (this would complete the corpus book):
1. **la.wikisource**, *Regulae Pastoralis* (one page per chapter, e.g. `Regulae_Pastoralis/I/VI`; about 133 pages including short duplicate-name redirects). Fons = DCO. About 41k words.
2. **DCO** *Regulae Pastoralis Liber* LT PDF (41.9k words, clean, PL 77). Downloaded: `gregory-the-great/dco/`. Tier A.
3. **Bramley, *S. Gregory on the Pastoral Charge: the Benedictine text with an English translation*** (Oxford: Parker 1874), facing Latin/English. archive.org `sgregoryonpastor0000unse` (djvu.txt, about 123k words for both languages, decent OCR). Tier **A** (Bramley d. 1917). The best independent PD witness for **both** languages.
4. **Hedley, *Lex levitarum … with the Regula Pastoralis*** (Benziger 1905). The Latin text is appended (archive.org `lexlevitarumorpr00hedl`). Tier A. Third witness.
5. Critical: Judic/Rommel, SC 381–382 (1992) = C. Alfred's Old English version (Sweet 1871) is a curiosity.

English: (1) **Barmby, NPNF II/12 (1895)**, already in the corpus, A. (2) **Bramley 1874**, A: a cross-check, more literal. (3) Davis, ACW 11 (1950) and Demacopoulos (SVS 2007) = **C**.

The corpus book splits by Part (I–IV), so `la/ch001–ch004` follow the same four parts.

### Dialogi (4 books; Book II = Life of St. Benedict)

Latin:
1. **la.wikisource**, *Dialogi (Gregorius Magnus)* `/Liber I`…`/Liber IV`. Complete, **56.8k words** (I 10.0k, II 11.6k, III 16.3k, IV 17.7k). Orthography is early-printed (*vti*, *prouincia*), with bracketed marginal summaries and chapter headings `== CAPUT I. … ==`. The edition is not stated. Tier A (pre-1700 print text).
2. **la.wikisource *Dialogi (Gregorius Magnus – Migne)*** (pages `/1`, `/3`, `/4`; PL 77 with Maurist notes, so larger). An alternative witness. Tier A.
3. **DCO** *Dialogorum Libri IV* LT PDF (clean Migne, 45.8k words). **Book II is missing** from this file: its header sits empty between I and III. DCO files Book II under Benedict ("Vita Operaque [Ex Libro Dialogorum…]", MLT scan). Tier A.
4. **Schmidt, *Vita et Regula SS. P. Benedicti* vol. 1** (Pustet 1880), Book II alone, archive.org `VitaEtRegulaSSPBenedicti1`. Tier A.
5. Critical: de Vogüé, SC 251/260/265 (1978–80) = C.

English:
1. **"P.W." 1608 (Paris) translation, re-edited by Edmund G. Gardner** (London: P. L. Warner, 1911). Roger Pearse's transcription on CCEL: https://ccel.org/ccel/pearse/morefathers/files/gregory_01_dialogues_book1.htm (…`_00_dialogues_intro`, `_02_…book2`, `_03_…book3`, `_04_…book4`). The page says "All material on this page is in the public domain – copy freely." Complete, about **97k words** (intro 2.7k; books 17k / 20k / 27k / 33k, with page chrome). The old tertullian.org URLs now return 404. Modernized Jacobean English. Tier **A** (Gardner d. 1935). Downloaded: `gregory-the-great/en/`.
2. **The 1911 Gardner print**, archive.org `cu31924029222076` (Cornell scan, djvu.txt). Use it to check the transcription. Tier A.
3. **Book II only: the 1638 English, revised in the Rome 1895 *Life … of S. Benedict, with the Rule*** (London: Baker 1898). CCEL https://www.ccel.org/ccel/gregory/life_rule (also in `benedict/ccel-life_rule.txt`). Tier A.
4. Zimmerman, FOTC 39 (CUA 1959) = **C** (in print).

### Registrum epistularum (14 books by indiction)

Latin:
1. **la.wikisource**, *Epistolae (Gregorius Magnus)* `/I`…`/XIV`. PL 77, Maurist numbering, from the Corpus Corporum TEI ("encoded in TEI xml … by Ph. Roelli in 2013"). Complete across 14 books, **233k words**. About 860 `EPISTOLA` headings counted roughly (I 76 … XIV 15), with PL column numbers inline. Each letter has a summary + address + text. Tier A. **Best match for the corpus**, since NPNF uses the same numbering.
2. **MGH Epistolae 1–2**, Ewald & Hartmann, *Gregorii I papae Registrum epistolarum* (Berlin 1887–99), the critical edition, PD. dMGH: https://www.dmgh.de/mgh_epp_1/ (Books I–VII), https://www.dmgh.de/mgh_epp_2/ (Books VIII–XIV), scans with OCR. archive.org `gregoriiipapaer00greggoog` (Google OCR, heavy apparatus). Tier **A**. Its numbering differs from PL/NPNF, so use it for checking only.
3. DCO *Registri Epistolarum* + *Appendix* (PL 77 scan, MLT); DCO LT .doc single letters (*Qui sincera*, letters to Constantina). Critical: Norberg, CCSL 140–140A (1982) = C.

English:
1. **Barmby, NPNF II/12–13 (1895–98)**, already in the corpus (420 letters). That covers only about half the Register, so **about 430 letters have no PD English.**
2. DCO EN "Epistolarum Libri XIV" (same NPNF text).
3. Martyn, *The Letters of Gregory the Great* (PIMS 2004, complete, MGH numbering) = **C**.

The *Libellus responsionum* to Augustine (Reg. XI.56a/64) and the letter to Mellitus (XI.56/76) also have PD English in every Bede *Historia ecclesiastica* translation (I.27, I.30).

### Expositio in Canticum Canticorum (authentic; Cant 1:1–8)

- **la.wikisource** *Expositio in Canticum Canticorum (Gregorius Magnus)*, 7.5k words. It is labelled "Editio=Migne 1849", but the text uses *u* for *v* (*uita*, *ueniens*, *Vnde*), which is the orthography of Verbraken's CCSL 144 (1963), not Migne. Tier is therefore **B/unverified**: the critical edition's text is copied, which may be fine for a 6th-century work but is not confirmed.
- **DCO** *Expositio in Canticum Canticorum* LT .doc (not opened; likely the same text).
- PL 79 scan. Note that PL 79 also prints the spurious long *Super Cantica Canticorum expositio* (Robert of Tombelaine, 11th c.; DCO MLT). Don't confuse the two.
- English: DelCogliano, *Gregory the Great on the Song of Songs* (Cistercian 2012) = **C**. No PD English found.

### In librum primum Regum expositionum libri VI (doubtful)

- **la.wikisource** *Commentarii in librum I Regum* (PL 79, prologue + 6 books), **186k words**. Tier A.
- PL 79 scan (DCO MLT). Critical: Verbraken CCSL 144; de Vogüé SC 351ff. (1989–2003) = C.
- **Authorship:** Verbraken and de Vogüé first defended it as Gregory's lectures redacted by Claudius. De Vogüé later (1996) attributed it to Peter of Cava (12th c.). Treat it as **doubtful** and label it so. (This summary of the scholarship is from memory; verify before writing book metadata.)
- English: **none found.**

### Hymni (doubtful) and other attributed/spurious items

- la.wikisource *Hymni (Gregorius Magnus)* (PL 78: *Primo dierum omnium*, *Nocte surgentes*, *Ecce iam noctis*, *Lucis creator optime*, *Clarum decus ieiunii*, *Audi benigne Conditor*, …), 621 words. Attribution is traditional and doubtful. English versions exist by J. M. Neale and E. Caswall (19th c., A), scattered across hymnals. Small. Fits better as practices or office hymns than as a book.
- *Benedictiones* (Wikisource *Benedictiones (Gregorius I)*, 1.6k words) and the PL 78 liturgical books (*Liber sacramentorum*, *Liber antiphonarius*, *Liber responsalis*, all DCO MLT scans) are attributed liturgical compilations, not Gregory's writings. *In septem psalmos poenitentiales* (PL 79) is by Heribert of Reggio (11th c.), and *Concordia quorundam testimoniorum* is spurious. The notary Paterius's *Liber testimoniorum* (DCO) is an anthology of Gregory excerpts, not a separate work. **Leave all of these out** of the opera omnia, or put them in a clearly labelled `dubia/` group.
- *Vitae* of Gregory (John the Deacon, Paul the Deacon; DCO) are about Gregory, not by him.

## Recommendation

**Layout.** Keep the existing `church-fathers/gregory-great-pope/` directory (ids are stable) and add sibling works:

- `pastoral-rule/la/` (Wikisource/DCO, checked against Bramley 1874). This completes an existing book: small (41k), clean. **Import first.**
- `register-of-letters/la/` (Wikisource PL 77). Same numbering as the existing en-US. Then extend the book to all ~860 letters. Letters with no NPNF English get la + pt-BR only (or a pipeline en).
- `dialogues/` (la Wikisource + en Gardner 1911): complete PD on both sides, 57k/97k. **Second priority**, and the companion to Benedict's Rule.
- `moralia-in-job/` (la Wikisource + en LoF via Lectionary Central): 35 books. Huge (531k Latin, about 810k English), but both sides are complete and PD.
- `homilies-on-the-gospels/` and `homilies-on-ezekiel/`: Latin only (Ezekiel Book II from DCO). No usable English, so translate from Latin.
- `song-of-songs/` (small; confirm the text tier first) and `first-kings/` (doubtful attribution, Latin only): import last and label as doubtful.

**What can't be sourced cleanly:** PD English for the Gospel and Ezekiel homilies, the Song of Songs, 1 Kings, and about 430 letters of the Register (all modern English versions are tier C). There is also no Wikisource Latin for Ezekiel Book II (DCO PDF only), and the Song of Songs Latin may come from CCSL.

**Total size.**
- Authentic Latin: about 1.07M words (Moralia 531k + Register 233k + Ezekiel 112k + Gospel homilies 92k + Dialogues 57k + Pastoral Rule 41k + Song 7.5k). The doubtful 1 Kings adds 186k, for about 1.26M.
- PD English available: about 1.2M (Moralia 810k + Register 226k [in corpus] + Dialogues 97k + Pastoral Rule 67k [in corpus]).
- New to the corpus: about 1.0M Latin + about 0.9M English.

Raw downloads: `research/sourcing/gregory-the-great/` (`ws/` Wikisource wikitext, `dco/` DCO PDFs + text, `en/`, `ia/`). Scripts: `research/sourcing/_scripts/`.

## Portuguese

The general web-search budget ran out partway through this pass. After that, searching went through the sites' own catalogues: archive.org advancedsearch, the pt.wikisource API (no Gregory there), the Martins Fontes Paulista catalogue API (raw JSON in `gregory-the-great/pt/mf-gregorio.json`), Paulus sample PDFs, and Permanência / Montfort site search (nothing). Domínio Público and Lírio Católico (which has a "Regra Pastoral" page) sit behind a Cloudflare challenge, and UFBA's repository returns HTTP 468, so none of them could be read. Publisher listings below give what the catalogue records show. Translators are named only where a page names them.

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| Moralia in Iob | *Coleção Moralia in Iob*, vols. labelled "Comentário místico ao livro de Jó" (2, 3, 6, 7) and "Comentário literal…" (4, 5, 8), Sacro Elóquio, 1ª ed. 2024–2025, about 300–430 pp. each (ISBNs 978-65-985238-00/-17/-24/-31/-48/-55/-62) | https://www.martinsfontespaulista.com.br/colecao-moralia-in-iob---comentario-mistico-ao-livro-de-jo---vol--2---vol--2-1122700/p (and sister listings) | C (current commercial edition) | Catalogue listing only. Vol. 1 not seen. The translator and source text (Latin, or the 1844 Oxford English) are not stated. Apparently heading toward the complete work. Print only. |
| Moralia (excerpt) | *Liturgia das Horas* lesson "Dos Comentários sobre o livro de Jó" | `content/loth/parts/reading-*.json` | as the LotH corpus | 1 excerpt |
| Homiliae XL in Evangelia | *40 Sermões sobre os 4 Evangelhos: Homilias de São Gregório Magno*, Sacro Elóquio, 1ª ed. 2025, 472 pp., ISBN 9786598523879 | https://www.martinsfontespaulista.com.br/40-sermoes-sobre-os-4-evangelhos--homilias-de-sao-gregorio-magno-1177209/p | C | Listing only. The title suggests all 40 homilies. Translator not stated. |
| Homiliae in Evangelia (selection?) | *Parábolas do Evangelho*, Cultor de Livros, 1ª ed. 2023, 172 pp., ISBN 9788556383396 | https://www.martinsfontespaulista.com.br/parabolas-do-evangelho-1063595/p | C | Listing only. Probably a selection of the Gospel homilies (unverified). |
| Homiliae in Evangelia (excerpts) | LotH, "Das Homilias sobre os Evangelhos" | `content/loth/parts/reading-*.json` | as the LotH corpus | About 8 excerpts |
| Homiliae in Hiezechihelem | *Homilias sobre Ezequiel*, Ecclesiae, 1ª ed. 2021, 432 pp., ISBN 9786587135366 | https://www.martinsfontespaulista.com.br/homilias-sobre-ezequiel-963763/p | C | Listing only. Translator not stated. Likely both books (432 pp.), unverified. |
| Hom. in Ez. (excerpt) | LotH "Das Homilias sobre Ezequiel" | `content/loth/` | as the LotH corpus | 1 excerpt |
| Regula pastoralis | *Regra Pastoral*, Coleção Patrística vol. 28, Paulus, 2ª ed. 2018, 264 pp., ISBN 9788534932462 | https://www.martinsfontespaulista.com.br/patristica---regra-pastoral---vol--28---vol--28-886073/p | C (Paulus; the series pages carry "Todos os direitos reservados") | Complete (4 parts) per the series. The translator could not be confirmed: a search snippet of a 2024 record named only a preface by Dom Moacyr OSM and introduction and notes by Heres Drian de Oliveira Freitas. Print only. |
| Regula pastoralis | Lírio Católico, "Regra Pastoral" page | https://www.liriocatolico.com.br/padres_igreja/view/sao_gregorio_magno_papa/regra_pastoral/ | unverified | Cloudflare-blocked (403), so neither content nor translation could be checked. |
| Reg. past. (excerpt) | LotH "Da Regra Pastoral" | `content/loth/` | as the LotH corpus | 1 excerpt |
| Dialogi (4 books) | *Diálogos: vida e milagres dos santos*, Sacro Elóquio, 1ª ed. 2026, ISBN 9786501807584 ("dividida em quatro partes") | https://www.martinsfontespaulista.com.br/dialogos--vida-e-milagres-dos-santos-1192166/p | C | Listing only. Apparently complete. Translator not stated. Pre-sale. |
| Dialogi II (Life of Benedict) | *Vida e milagres do Patriarca São Bento*, PhVox, 1ª ed. 2024, 136 pp., ISBN 9786585676076 (the blurb calls it a "tradução inédita") | https://www.martinsfontespaulista.com.br/vida-e-milagres-do-patriarca-sao-bento-1096069/p | C | Book II. Listing only. |
| Dialogi II | *Vida de São Bento*, Santa Cruz, 1ª ed. 2023, 128 pp., ISBN 9786587994598 | https://www.martinsfontespaulista.com.br/vida-de-sao-bento-1097911/p | C | Book II. Listing only. Translator not stated. |
| Dialogi II | *Vida de São Bento*, Edições Livre, 1ª ed. 2019, 96 pp., ISBN 9788592852238 | https://www.martinsfontespaulista.com.br/vida-de-sao-bento-987685/p | C | Book II. Listing only. |
| Dialogi II (?) | *Vida de São Bento*, Cultor de Livros, 60 pp. (no author in the record) | https://www.martinsfontespaulista.com.br/vida-de-sao-bento-1108799/p | C | Unclear whether this is Gregory's text. |
| Dialogi (medieval Portuguese) | Old Portuguese versions (codices A–D, 14th–15th c.). Ed. Américo Venâncio Lopes Machado Filho, *Diálogos de São Gregório: edição e estudo de um manuscrito medieval português* (Salvador: Edufba, 2008), and a semidiplomatic edition (2015) in the UFBA repository | http://repositorio.ufba.br/ri/handle/ri/17923 (blocked, HTTP 468); stemma article https://revistas.usp.br/flp/article/view/59833 | the medieval text is PD, the modern edition unverified | Known from search snippets only. Archaic Galician-Portuguese, so a philological witness, not a modern reference. |
| Dial. (excerpt) | LotH "Dos Diálogos de São Gregório Magno" | `content/loth/` | as the LotH corpus | 1 excerpt |
| Registrum epistularum | *Registro epistolar, vol. 1 (livros 1–7)*, trad. **Luciano Rouanet Bastos**, Coleção Patrística vol. 52/1, Paulus, 1ª ed. 2024, 680 pp., ISBN 978-85-349-5459-4 | sample PDF https://deg.paulus.com.br/7464.pdf (`gregory-the-great/pt/paulus-7464.pdf`) | **C**: the sample's copyright page reads "© PAULUS – 2024 … Todos os direitos reservados pela Paulus Editora" | Books 1–7 of 14. Vol. 2 not seen. Print. |
| Epistolae (excerpt) | LotH "Das Cartas de São Gregório Magno" | `content/loth/` | as the LotH corpus | 1 excerpt |
| Expositio in Canticum; In I Regum (doubtful); Hymni | none found (searched archive.org, pt.wikisource, Martins Fontes catalogue) | – | – | – |

Notes:
- **No tier-A or tier-B Portuguese Gregory was found.** archive.org has no pre-1930 Portuguese Gregory; it has only Italian *Morali* (Zanobi da Strata, 1714–46) and a Spanish BAC volume (1958). pt.wikisource has nothing. The modern editions are all recent (2018–2026) commercial books, and most listings don't name the translator.
- Sacro Elóquio is putting out the Moralia, the Gospel homilies and the Dialogues at the same time. Whether these are translated from the Latin or from the old English versions is unverified, so check a sample before trusting them as a reference.

**Recommendation.** No Portuguese Gregory is importable. For pt-BR reference: the **Paulus *Regra Pastoral*** (an established patristic series) for the Pastoral Rule; the **Sacro Elóquio *Diálogos*** or one of the Book II editions for the Dialogues, after checking the translator on the copyright page; the **Sacro Elóquio *Moralia*** volumes, with the same caveat; and **Bastos (Paulus 2024)** for letters, Books 1–7. The *Liturgia das Horas* excerpts already in `content/loth/` are the cheapest check on terminology. Our pt-BR (which exists already for the Pastoral Rule) should keep coming from the pipeline.
