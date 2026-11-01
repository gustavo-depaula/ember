# Peter Lombard (c. 1100–1160): sourcing report

Peter Lombard wrote little, but it is large:
- the **Sententiae in IV libris distinctae** (c. 1155–58)
- the commentary on the Psalms, the so-called *Magna glosatura* on the Psalter (c. 1138)
- the *Collectanea* on the Pauline epistles (c. 1139–41, revised to 1158)
- about 30 sermons
- a few letters

The critical edition of the *Sentences* is I. Brady's third Quaracchi edition (Grottaferrata, Spicilegium Bonaventurianum 4–5, 1971–81), which is **C**. The second Quaracchi edition (1916) is public domain.

**Already in the corpus:** two commentaries on the *Sentences*, but not Lombard's own text. Both quote him only by lemma (the *divisio textus* / *expositio textus* sections):
- Aquinas's *Scriptum super Sententiis* (`content/books/aquinas-opera-omnia/commentaries/super-sententias/`, la + en-US, 186 chapter files)
- Denis the Carthusian's commentaries (`content/books/denis-opera-omnia/theology/in-i-sententiarum` … `in-iv-sententiarum`, la only)

I grepped both. The opening of the Lombard prologue, "Cupientes aliquid de penuria…", is absent from Aquinas, and appears in Denis only as a quotation inside his commentary on book I (`c051.md`). Importing the *Sentences* would give both commentaries their base text, and the distinction numbering (lib. I d. 1 c. 1 …) lines up one to one.

## Source keys

**Latin**
- **[CC]**: Corpus Corporum, *Patrologia Latina*, author "Petrus Lombardus" (id 2327): 4 works, 1,174.6k words. Browse: `https://mlat.uzh.ch/browser?path=/38/2327/<work-id>`. TEI: get the text id from `https://mlat.uzh.ch/php_modules/navigate.php?load=/38/2327/<work-id>`, then `https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=<text-id>`. The edition is Migne PL 191–192. For the *Sententiae* (work 6420, text 11468) I downloaded the TEI to `peter-lombard/cc/lombard-sent.xml`. It runs 258.6k words, books I–IV with prologue, *distinctio* and chapter `<head>`s, and ends with the PL appendix on the articles in which the Master "non tenetur". Machine-corrected OCR, clean in what I sampled (prologue; I d. 44). **Tier A.**
- **[Quar16]**: *Libri IV Sententiarum, studio et cura PP. Collegii S. Bonaventurae*, 2nd ed., 2 vols (Ad Claras Aquas/Quaracchi 1916). archive.org: `https://archive.org/details/libriivsententia01pete` (227k raw words) and `…02pete` (197k raw). Also `libreivsententia0001petr` and `bwb_C0-ANN-518…521`. This is the best public-domain *text*: it was collated from manuscripts and is the basis of the modern chapter numbering. The OCR is usable but it has two layers of footnote apparatus (variants and sources) under the text on every page (sampled at I d. 15), so it needs cleaning. **Tier A** (1916).
- **[DCO]**: Documenta Catholica Omnia, "Petrus Lombardus": PL-scan PDFs (MLT) of the *Sententiarum libri quatuor*, the *Collectanea* (2 parts), *In totum Psalterium* ("ex editione Parisiis 1541"), and their indices. Poor OCR text layer. **A**. Conspectus copy in `peter-lombard/conspectus-P.html`.
- **[Migne1841]**: *Petri Lombardi … Sententiarum libri quatuor, per Joannem Aleaume … necnon D. Thomae Aquinatis Summa theologica* (Migne, Paris 1841), vol. 1. The Aleaume text of the *Sentences* bound with the start of the *Summa*. `https://archive.org/details/petrilombardisen01pete` (1.16M raw words for the whole volume, weak OCR). **A**, a third witness.
- **[Inc]**: incunabula and 16th-century editions on archive.org and Google Books (1491, 1493, 1507 with Nicholas de Orbellis, 1514, 1563, 1576, 1578; e.g. `https://archive.org/details/A336077`). Scans only. **A**. Of no use for import.
- **[FA]**: The Franciscan Archive, `https://www.franciscan-archive.org/lombardus/index.html`. It hosts Latin and an English translation project (below). Its site security blocked my scripted fetch. The index states no edition for its Latin; its reference facsimile is the 1493 Freiburg edition with Bonaventure's commentary. **Unverified** edition.
- **[Brady]**: Grottaferrata 1971–81. **C**.

**English**
- **[Bugnolo]**: Alexis Bugnolo / The Franciscan Archive, English translation of the *Sentences*. Book I is complete ("the First Complete, published English translation of the First Book of Sentences", "© 2006", and sold on CD-ROM). Book II is partial. Books III–IV are not translated. **C**: a copyright is asserted and the translation is sold.
- **[Silano]**: Giulio Silano, *The Sentences*, 4 vols (Pontifical Institute of Mediaeval Studies, Toronto 2007–10). archive.org lending copy `sentencesbook1my0000pete_k7w9`. **C**.
- There is no English before 1930. None exists for the Psalms commentary, the *Collectanea* or the sermons.

## Summary table

| Work | Original source (URL, edition) | Tier | English source | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Sententiae in IV libris distinctae (prologue; I: 48 dd.; II: 44 dd.; III: 40 dd.; IV: 50 dd.) | 1 [CC] 6420 (text 11468, PL 192); 2 [Quar16] 1916 (better text, needs apparatus stripped); 3 [Migne1841] (Aleaume); 4 [DCO] PL scan; 5 [FA] (edition unknown); C: [Brady] | A | 1 [Bugnolo] (book I + part of II); 2 [Silano] 2007–10 | C / C | 252.5k (CC count; 258.6k with the PL appendix) / – | no. Lemmata only, inside the Aquinas and Denis commentaries |
| Commentarius in Psalmos (*Magna glosatura*) | 1 [CC] 6407 (PL 191); 2 [DCO] PL scan (from the Paris 1541 ed.); 3 [Inc] 1541 ed. (`bub_gb_2N5U_p4bfIEC`) | A | none | – | 535.7k (CC count; includes the psalm text and the glossed patristic catenae) / – | no |
| Collectanea in omnes D. Pauli epistolas | 1 [CC] 6406 (part 1, PL 191: Romans–2 Cor.) + 6419 (part 2, PL 192: Gal.–Hebr.); 2 [DCO] PL scans; 3 [Inc] 1535/1537 Paris eds. (`bub_gb_pZJDbpMBEiAC` …) | A | none | – | 169.2k + 217.3k / – | no |
| Sermones (about 30) | printed among the sermons of Hildebert of Lavardin in PL 171 (under Hildebert's name); in CC under Hildebertus, not checked | A | none | – | ≈40k est. / – | no |
| Epistolae (very few) | scattered; not in CC under Lombard | – | none | – | <2k / – | no |

## Notes

- **Sentences: structure.** The modern division into books, *distinctiones* and *capitula* (with the "Hic quaeritur…" chapter titles) comes from the Quaracchi editors. PL/CC uses distinctions with numbered paragraphs, so the two do not always split chapters identically. The corpus's Aquinas and Denis commentaries are organized by book and distinction. A chapter split of **one file per distinction** (182 files plus the prologue, about 1.4k words each) matches both commentaries and both Latin witnesses.
- **Which Latin.** CC/PL is ready to use and is tier A. Quaracchi 1916 is the better text and also tier A, but it exists only as page OCR with heavy apparatus. Recommended: import from CC, then run a cross-check pass against Quaracchi 1916 (and the Aleaume 1841 text) to catch OCR slips, the same two-witness method used elsewhere in the corpus.
- **English.** There is none we may use, so pt-BR would be translated directly from the Latin. The en-US slot would stay empty unless we produce our own.
- **The two biblical commentaries** are huge (536k and 386k words). Much of their bulk is catena: patristic excerpts from Augustine, Cassiodorus, Ambrosiaster, Haymo and others. They are of interest mainly to scholars. Import them after the *Sentences*.
- **Sermons.** Lombard's sermons were long printed as Hildebert's (PL 171). Separating them needs a modern attribution list (Gastaldelli; Brady's prolegomena), which is C. They are low priority.

## Recommendation

Layout: `lombard-opera-omnia/` with:
- `sententiae/`: four books; one chapter file per distinction, plus the prologue.
- `in-psalmos/`
- `collectanea-in-paulum/`

Import the *Sentences* first, Latin only from CC, checked against Quaracchi 1916. Cross-link each distinction to the matching distinction in `aquinas-opera-omnia/commentaries/super-sententias` and `denis-opera-omnia/theology/in-*-sententiarum`. That is the immediate value: the corpus already holds two commentaries on a text it does not have. The Psalms commentary and the *Collectanea* come later and are optional.

Cannot be sourced cleanly: any English translation (Bugnolo and Silano are both C); Brady's critical text (C); a clean attribution of the sermons.

**Total size.** Latin **≈1.17M words**: *Sentences* 253k, Psalms 536k, *Collectanea* 386k. The sermons add about 40k. Public-domain English: none.

## Portuguese

**No Portuguese translation of any work by Peter Lombard was found**, complete or partial. That covers the *Sentences*, the Psalms commentary, the *Collectanea* and the sermons.

| Work | Portuguese translation | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| Sententiae | none found | – | – | gap |
| Commentarius in Psalmos; Collectanea; Sermones | none found | – | – | gap |

What the search did turn up, none of it a Lombard translation:

- **Documenta Catholica Omnia, PT listing** (`documentacatholicaomnia.eu/03d/`). The only Lombard-related Portuguese file is Aquinas's *In III Sent.* d. 25 q. 1 a. 2 ("Se a vida contemplativa consiste somente em um ato do entendimento"), from cristianismo.org.br, 2006. It is Aquinas, not Lombard, and it does not quote the distinction's text. A copy is in `peter-lombard/pt/`.
- **cristianismo.org.br** (the anonymous Brazilian Victorine site; see `victorines.md`, Portuguese). It hosts only **Latin** PDFs of the *Sentences* (`PetrusLombardus-SententiarumLibri-I.pdf`, `…-II.pdf`), beside Alexander of Hales's *Glossa* and Aquinas's *Scriptum*. These could serve as one more Latin witness, but their edition is not checked here.
- **BND Portugal** (`bndigital.bnportugal.gov.pt/records?search="Pedro Lombardo"`): 10 records, all Latin manuscripts (Alcobaça, 13th–14th c.: *Sententiae*, *Commentarium in Psalmos*, *in Epistolas Pauli*). The `lombardus` search gives 22 records, all Latin incunabula and commentaries.
- **Universidade de Coimbra Alma Mater** `dl.uc.pt/handle/10316.2/3146`: *Enarrationes in collectanea primi libri Magistri Sententiarum* (Coimbra). This is a Latin commentary, not a translation.
- Catarina Barreira's study *Os Livros das Sentenças de Pedro Lombardo na Biblioteca de Alcobaça* (seen as an oasisbr/RCAP record title only) is about manuscripts.
- The nearest Iberian translation is in **Spanish**: Carlos Domínguez's *Sentencias de Pedro Lombardo* (Universidad Católica San Pablo, Arequipa 2012), seen only in a review (`revistas.ugm.cl/index.php/rcem/article/view/97/87`). It is C.
- pt.wikisource (API full-text search for "Pedro Lombardo", "Sentenças Lombardo") has nothing.

Not checked:
- Google Books
- archive.org, which was "Temporarily Offline" during this pass
- dominiopublico.gov.br, which is behind a Cloudflare JS challenge
- BN Brasil
- Brazilian thesis repositories, which hold the likeliest partial translations of single distinctions; the web-search budget ran out before I could search them

**Recommendation.** No Portuguese reference exists to check our pt-BR against, so the *Sentences* go to pt-BR straight from the Latin (CC, checked against Quaracchi 1916). For theological vocabulary, the corpus's pt-BR Aquinas (the *Summa*) is the nearest guide. The *Scriptum super Sententiis* in the corpus is la + en-US only. Nothing is importable as tier A or B.
