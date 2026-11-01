# St. John Eudes (1601–1680): sourcing report

Bibliography followed: the *Œuvres complètes du Vénérable Jean Eudes* (Vannes, Lafolye / Paris, Beauchesne, 1905–1911, 12 vols, ed. Charles Lebrun, Ange Le Doré, Joseph Dauphin CJM), which prints everything the Eudists had recovered after the Revolution scattered his manuscripts. Its own tables (checked in vols II, IV, X, XII) give the work list below. Not in the OC: *La Vie admirable de Marie des Vallées* (manuscript; first printed in modern critical eds, tier C) and a few lost works (*Le Testament de Jésus*, 1641, known only by title). Nothing by Eudes is in the corpus yet (`_corpus-books.txt`, `content/books/`: no `eudes*`).

Word counts below were **measured** on the downloaded texts in `research/sourcing/john-eudes/` (`lib_*.txt` = pdftotext of the Bibliothèque Saint Libère PDFs). French counts include the editors' introductions and footnotes (roughly 10–20%) and running page markers (`I-87`).

## Summary table

| Work (OC vol.) | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| La Vie et le Royaume de Jésus dans les âmes chrétiennes (I) | liberius.net PDF, born-digital transcription of OC I (1905) | A | *The Life and the Kingdom of Jesus in Christian Souls*, "a Trappist Father of Gethsemani", Kenedy 1946, liberius.net PDF | B | 191k / 144k | no |
| Traité de l'honneur dû aux lieux saints (II) | liberius.net OC II | A | none found | — | 18k / — | no |
| Méditations sur l'humilité + Profession d'humilité (II) | liberius.net OC II | A | in *Meditations on Various Subjects*, Kenedy 1947 | B | 17k / part of 106k | no |
| Entretiens intérieurs de l'âme chrétienne avec son Dieu (II) | liberius.net OC II | A | partly in *Meditations on Various Subjects* 1947 | B | 20k / part | no |
| Contrat de l'homme avec Dieu par le saint Baptême (II) | liberius.net OC II | A | *Man's Contract with God in Baptism* (in *Letters and Shorter Works*, Kenedy 1948; also separate archive.org item) | B | 15k / ~15k est. | no |
| Exercice de piété (II) | liberius.net OC II | A | none found (parts in *Life and Kingdom*) | — | 34k / — | no |
| La Vie du chrétien, ou le Catéchisme de la Mission (II) | liberius.net OC II | A | none found | — | 39k / — | no |
| Le Mémorial de la vie ecclésiastique (III) | liberius.net OC III | A | *The Priest: his Dignity and Obligations*, W. Leo Murphy, Kenedy 1947 (abridged selection) | B | 90k / 97k (whole book) | no |
| Manuel … pour une communauté ecclésiastique (III) | liberius.net OC III | A | none found | — | 73k / — | no |
| Le Prédicateur apostolique (IV) | liberius.net OC IV | A | part in *The Priest* 1947 | B | 42k / part | no |
| Le Bon Confesseur (IV) | liberius.net OC IV | A | Part III of *The Priest* 1947 (abridged) | B | 74k / part | no |
| Avertissements aux confesseurs missionnaires (IV) | liberius.net OC IV | A | none found | — | 9k / — | no |
| La Manière de bien servir à la sainte Messe (IV) | liberius.net OC IV | A | none found | — | 15k / — | no |
| L'Enfance admirable de la très sainte Mère de Dieu (V) | liberius.net OC V | A | none found | — | 155k / — | no |
| Le Cœur admirable de la très sacrée Mère de Dieu, 12 livres (VI–VIII) | liberius.net OC VI, VII, VIII | A | *The Admirable Heart of Mary*, Charles di Targiani & Ruth Hauser, Kenedy 1948 (abridged); Book XII = *The Sacred Heart of Jesus*, Dom Richard Flower OSB, Kenedy 1946 | B | ~600k (VI 201k + VII 225k + VIII part) / 138k + 67k | no |
| Opuscules sur les Sacrés Cœurs (VIII, end) | liberius.net OC VIII | A | partly in *The Sacred Heart of Jesus* 1946 | B | in VIII (221k incl. Bks X–XII) | no |
| Règles et Constitutions de la Congrégation de Jésus et Marie (IX; Latin + French) | liberius.net OC IX | A | none found | — | 182k / — | no |
| Constitutions, Règlement, Coutumier de Notre-Dame de Charité (X) | liberius.net OC X | A | none found | — | 111k / — | no |
| Lettres, livres I–III (X–XI) | liberius.net OC X, XI | A | *Letters and Shorter Works*, Ruth Hauser, Kenedy 1948 (selection) | B | 157k (118k + 39k) / 134k (whole book) | no |
| Offices propres (XI; Latin) | liberius.net OC XI | A | — (Latin liturgy) | — | 136k / — | no |
| Petits Offices (XII; Latin/French) | liberius.net OC XII | A | — | — | 19k / — | no |
| Opuscules et fragments, incl. *Memoriale beneficiorum Dei*, Testament, Contrat d'alliance avec Marie (XII) | liberius.net OC XII | A | some in *Letters and Shorter Works* 1948 | B | 37k / part | no |

## Sources per work, ranked

The OC is the single edition behind every usable French text; all sources below are witnesses of it, so the ranking holds for every row of the table.

**French, best first**

1. **Bibliothèque Saint Libère (liberius.net)**: born-digital PDF of all 12 volumes, typed from OC 1905–11 (the PDF metadata says Word → Distiller 2001–08; vols II–VII, XI say "Numérisé par cotejr8@videotron.ca"). Text quality is clean, with no OCR noise; the accented typography, footnotes and Latin are kept. Quirks: page markers (`I-87`, `VIII-7`) are interleaved, footnotes sit at the page foot inline, and some soft-hyphen joins have leaked (`l u i même`, `l i v r a i t`). The notice reads *"© Bibliothèque Saint Libère 2008. Toute reproduction à but non lucratif est autorisée."* Eudes's text is PD (tier A) and a faithful transcription adds no new authorship, but note the site's non-commercial request. URLs (pattern `http://www.liberius.net/livres/OEuvres_completes_de_saint_Jean_Eudes_(tome_N)_000000ID.pdf`):
   - I 215 · II 347 · III 348 · IV 349 · V 350 · VI 351 · VII 352 · VIII 353 · IX 354 · X 355 · XI 356 · XII 357 (catalogue page `http://www.liberius.net/livre.php?id_livre=ID`).
2. **JesusMarie.com mirror** (`http://jesusmarie.free.fr/jean_eudes_oeuvres_completes_tome_1.pdf` … `_tome_12.pdf`): the same Saint-Libère PDFs re-hosted (tome 1 checked: identical metadata and text). Fallback only; it's not independent.
3. **archive.org scans of OC 1905–11** with ABBYY OCR (Toronto/Kelly copy: `uvrescompltesd01eude` … `uvrescompltesd12eude`; a second 1906 copy series `oeuvrescompletes21eude`, `41`, `51`, `91`, `101`, `111`, `121eude`). Vol VI was checked: 207k words and good OCR (mostly clean, occasional `Gœurde`, `eharitatis`). This is the **independent witness** for checking the Saint-Libère typing against the printed page. Full text: `https://archive.org/download/uvrescompltesdNNeude/uvrescompltesdNNeude_djvu.txt`.
4. Older separate editions on archive.org/Google (e.g. *Méditations selon l'esprit du V. P. Eudes*, 1902, `mditationsselonl01eude`, which is not by Eudes himself). Useful only for spot checks.

**English, best first**

1. **Kenedy "Eudist Fathers" series 1946–48** (New York, P. J. Kenedy & Sons; Canadian imprimaturs), all as PDFs on liberius.net (ids 343, 344, 345, 346, 374, 375) and as archive.org copies (`lifekingdomofjes0000sain`, `sacredheartofjes0000sain`, `admirableheartof0000eude`, `lettersshorterwo0000sain`, `priesthisdignity0000eude`, `StJohnEudesMeditationsOnVariousSubjects`, `MansContractWithGodInBaptism`). Each carries "Copyright 1946/1947/1948 P. J. Kenedy & Sons". I searched the NYPL transcription of the Copyright Office renewal records (`research/sourcing/_cce/`, all years 1950–2001) for "Eudes" and for every title: **there is no renewal**, so this is a US work of 1946–48 that was never renewed → **tier B** (PD in the US). The translations are good, modern and faithful, but several are **abridged** (*Admirable Heart*, *The Priest*, *Letters*). The texts are liberius PDFs with clean text layers.
2. *The Reign of Jesus*, an abridgment of *Le Royaume de Jésus*, 1911 (`thereignofjesus00eudeuoft`): **tier A**. It is only a fallback for *Life and Kingdom*.
3. *The Most Pure Heart of Mary*, selections from *Le Cœur admirable*, 1923 (`mostpureheartofm0000eude`): **tier A**, but on the scan it is lending-library only (unverified if full text is open).

## Notes per work

- **Vie et Royaume de Jésus**: 7 parts (I principles and virtues of the Christian life; II–VII exercises of piety for the day, the year, the mysteries and feasts, the sacraments and death; the VIIth is the preparation for death that the Eudist intro mentions). Each part is subdivided into numbered sections, which is the natural chapter split. Lebrun's introduction runs to about 15 pages. The English 1946 translation is complete apart from the dedication pieces.
- **Cœur admirable**: Eudes's largest work (12 books, about 600k words). Books I–IV are in vol VI, V–IX in VII, X–XII plus the opuscules on the Sacred Hearts (offices, litanies, meditations for the feast) in VIII. Book XII is on the Heart of Jesus. The Latin office texts are embedded.
- **Offices (XI)** and **Petits Offices (XII)** are mostly Latin liturgical propers (Masses and offices of the Holy Name, the Sacred Hearts and others). They're worth keeping, but they're liturgy, not reading. Import them last, or as liturgical items.
- **Règles et Constitutions (IX)**: the *Regulae Domini Jesu* and *Regulae Mariae* are Latin; the *Constitutions* (13 parts) are French. The **Constitutions de N.-D. de Charité (X)** come with a Règlement for the penitents and a Coutumier.
- **Lettres**: Book I to the priests of his Congregation, Book II to the nuns of N.-D. de Charité (both vol X), Book III to various persons (vol XI). Each letter is dated and numbered, so split one letter per item or by book.
- **Opuscules et fragments (XII)**: 30 short pieces, among them the autobiographical *Memoriale beneficiorum Dei* (Latin, about 7k words), the Vow, the Testament, the "Contrat d'une sainte alliance avec la Vierge" and the "Lettre à la très sainte Vierge".
- **Apparatus**: every volume opens with a long Eudist introduction and has scriptural and analytical tables (XII ends with about 63k words of general tables, which should be skipped).

## Recommendation

- Layout `eudes-opera-omnia/<work>`, one book per work: `vie-et-royaume-de-jesus`, `coeur-admirable` (12 books as parts), `contrat-avec-dieu-par-le-bapteme`, `exercice-de-piete`, `entretiens-interieurs`, `meditations-sur-l-humilite`, `catechisme-de-la-mission`, `lieux-saints`, `memorial-de-la-vie-ecclesiastique`, `manuel-communaute-ecclesiastique`, `predicateur-apostolique`, `bon-confesseur`, `avertissements-aux-confesseurs`, `servir-la-messe`, `enfance-admirable-de-marie`, `regles-et-constitutions-cjm`, `constitutions-notre-dame-de-charite`, `lettres` (3 books), `offices`, `petits-offices`, `opuscules`.
- **Import first**: *Vie et Royaume de Jésus* (FR liberius + EN 1946 complete), then *Contrat de l'homme avec Dieu*, *Méditations sur l'humilité*, *Entretiens intérieurs* (short, devotional, with EN), then *Cœur admirable*: FR complete, with EN from the 1948 abridgment and *The Sacred Heart of Jesus* for Book XII, aligned where they correspond and the rest translated by the pipeline.
- Use Saint-Libère as the base text, strip page markers and pull footnotes out to the chapter foot, and spot-check against the archive.org OCR of the same OC volume.
- **Cannot be sourced cleanly**: no English at all for the *Enfance admirable*, the *Catéchisme de la Mission*, the Constitutions, the Offices or most of the letters (pipeline translation from French). *Marie des Vallées* is not available outside modern tier-C editions.
- A cleanup to-do at import: the leaked letter-spacing (`l u i même`).

**Total size**: about **2.06 M words** in French across the 12 OC volumes (measured, including introductions, notes and about 63k words of tables), so about **1.7 M words** of Eudes's own text. Usable English is about **0.69 M words** (Kenedy series, tier B, partly abridged).

## Portuguese

Eudes has **one complete modern Brazilian translation** (of *Vie et Royaume*), a short extract of the *Cœur admirable*, and the Breviary's readings. All are tier C. No pre-1930 Portuguese translation was found. Searched: archive.org (advancedsearch `creator:eudes` / `title:"joão eudes"` with `language:por`: nothing by him; the Spanish *Obras escogidas* item `obras-escogidas-san-juan-eudes` is Spanish, not Portuguese); pt.wikisource (no hits); Biblioteca Nacional Digital (Portugal) (no hits); eudistas.org (publications listed in Spanish only, "© 2026 Congregación de Jesús y María", no Portuguese downloads). Not checkable from here: dominiopublico.gov.br (HTTP 403), bndigital.bn.gov.br (Cloudflare), Google Books (quota or captcha). The web-search budget ran out before the other titles (*Contrato do homem com Deus*, *Coração admirável*, *Catecismo da Missão*) could each be searched in Portuguese, so they are **unverified, not ruled out**.

| Work | Translation (translator, year, publisher) | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| La Vie et le Royaume de Jésus (OC I) | ***Vida e Reino de Jesus nas almas cristãs***, trans. **Pe. Álvaro Duarte, cjm & Geovani Ferreira da Costa, cjm**, São Paulo: **Paulus**, 1st ed. 2025 (Coleção Clássicos de espiritualidade, ISBN 978-85-349-5886-8), produced with the Brazilian Eudists (Fortaleza) | publisher's preview PDF (front matter and contents, 18 pp.): https://deg.paulus.com.br/9788534958868.pdf, saved as `research/sourcing/john-eudes/pt/paulus-9788534958868-preview.pdf` | C ("Todos os direitos reservados pela Paulus Editora") | Appears complete (the contents follow the French parts: Exercícios diários …). Modern pt-BR from the French. The best pt-BR terminology reference for this work. |
| Le Cœur admirable, Book X ch. on the Magnificat (OC VIII) | ***O Magnificat***, Editora **Santa Cruz**, 2023, 52 pp., ISBN 9786587994581 (translator not named on the listing) | https://www.martinsfontespaulista.com.br/o-magnificat-1097902/p | C | Extract only (one chapter). |
| Excerpts: *Royaume de Jésus* III,4 and *Cœur admirable* I,5 | Liturgia das Horas (CNBB), Office of Readings: "Do Tratado sobre o Reino de Jesus" (OC 1,310–312) and "Do tratado sobre o admirável Coração de Jesus" (OC 6,107.113–115); **already in the corpus** in `content/loth/parts/reading-13.json`, `reading-09.json` | — | C (CNBB) | Two readings. |
| all other works (Contrat, Mémorial, Bon Confesseur, Enfance admirable, Constitutions, Lettres, Offices…) | none found | — | — | — |

**pt-BR reference:** use the Paulus 2025 *Vida e Reino de Jesus* (print copy) to check the pipeline's terminology for OC I. Everything else is translated from the liberius.net French. Nothing is importable.
