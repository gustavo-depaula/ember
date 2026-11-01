# St. Augustine of Hippo (354–430): the Latin opera omnia

The corpus holds Augustine **in English only**: 48 NPNF books under `content/books/church-fathers/augustine/` (≈3.93M English words; 35 with pt-BR) plus the separate `augustine-confessions/` (en + pt-BR). None has a `la/` text. This report covers:
- the complete Latin works, in *Retractationes* order (I.1–II.67), then works written after the Retractationes, then works it doesn't list (preaching, letters, short treatises, Regula), then doubtful/spurious items and texts by others transmitted with his works
- which works the corpus already has in English
- where PD English exists for the rest

**Measurement.** I mirrored all 110 work directories of augustinus.it's Latin section (`https://www.augustinus.it/latino/index.htm`, the "PATROLOGIAE LATINAE ELENCHUS", PL 32–46):
- 2,134 text pages in `research/sourcing/augustine-latin/raw/` (61 MB), fetched by `augustine-latin/crawl.py`
- I counted Latin words on every text page and excluded the `_note` pages (biblical references)
- page titles and NBA section headings add <1%
- per-work counts are in `augustine-latin/counts.tsv` + `counts2.tsv`; the table comes from `augustine-latin/table.py`
- the in-corpus/missing split of letters and sermons uses `augustine-latin/split.py`, which maps augustinus.it's sequential file numbers to Maurist numbers through its `tavola_lettere.htm` and the "SERMO n" heading of each sermon page
- English counts are `wc -w` over the corpus's `en-US/*.md`

The "Original source" column is the same for every row (augustinus.it, cross-checked against Migne's PL on DCO). See "Latin sources, ranked" below for the alternatives (Latin Library, CSEL, Morin, Corpus Corporum) and their tiers. "A/B" means the PL/Maurist text is tier A, and the NBA presentation of augustinus.it (editorial headings, occasional CCL/CSEL readings) is tier B.

## Summary

| Work (Retract.) | Original source | Tier | English source | Tier | Words (la / en) | In corpus? |
|---|---|---|---|---|---|---|
| Contra Academicos (3 bks) (I.1) | augustinus.it `latino/contr_acc/` · DCO PL pdf | A/B | Kavanagh, *Answer to Skeptics* 1943 (archive.org `answertoskeptics00augu`, open); Garvey, Marquette 1957 (© 1957; archive.org `augustinesagainsttheacademicians`, open) | B? (renewal unverified) | 21.5k / — | **no** |
| De beata vita (I.2) | augustinus.it `latino/felicita/` · DCO PL pdf | A/B | Tourscher, *Happiness: a study* 1937 (Peter Reilly; not online); *The Happy Life* 1939 (archive.org `happylife0000aure`, lending only; translator not verified) | A (Tourscher d. 1939) / B? | 7.3k / — | **no** |
| De ordine (2 bks) (I.3) | augustinus.it `latino/ordine/` · DCO PL pdf | A/B | Russell, *Divine Providence and the Problem of Evil* 1942 (Cosmopolitan; not located open) | B? (unverified) | 18.1k / — | **no** |
| Soliloquia (2 bks) (I.4) | augustinus.it `latino/soliloqui/` · DCO PL pdf | A/B | NPNF I.7 (Starbuck 1888) — in corpus; alt. Cleveland 1910 | A | 15.6k / 22.5k | en only: `soliloquies` |
| De immortalitate animae (I.5) | augustinus.it `latino/immortalita_anima/` · DCO PL pdf | A/B | Leckie 1938 (Appleton-Century; archive.org lending only) | B? (renewal unverified) | 5.8k / — | **no** |
| De grammatica (Ars breviata) / Regulae [dubious] (I.6) | augustinus.it `latino/grammatica/` · DCO PL pdf | A/B | none | — | 7.3k / — | **no** |
| De grammatica: Regulae [spurious] (I.6) | augustinus.it `latino/regole/` · DCO PL pdf | A/B | none | — | 12.6k / — | **no** |
| De dialectica [prob. authentic] (I.6) | augustinus.it `latino/dialettica/` · DCO PL pdf | A/B | Jackson 1975 (Reidel) | C | 5.7k / — | **no** |
| De rhetorica [dubious] (I.6) | augustinus.it `latino/retorica/` · DCO PL pdf | A/B | none | — | 4.2k / — | **no** |
| De moribus ecclesiae et Manichaeorum (2 bks) (I.7) | augustinus.it `latino/costumi/` · DCO PL pdf | A/B | NPNF I.4 (Stothert) — in corpus | A | 26.9k / 39.0k | en only: `morals-of-the-catholic-church + morals-of-the-manichaeans` |
| De quantitate animae (I.8) | augustinus.it `latino/grandezza_anima/` · DCO PL pdf | A/B | Tourscher, *The Measure of the Soul* 1933 (Peter Reilly; not online) | A (d. 1939), not online | 19.4k / — | **no** |
| De libero arbitrio (3 bks) (I.9) | augustinus.it `latino/libero_arbitrio/` · DCO PL pdf | A/B | Tourscher 1937 (Peter Reilly, Latin+English; archive.org `saintaugustinede0000fran`, lending only; HathiTrust search-only) | A (d. 1939), not open | 37.0k / — | **no** |
| De Genesi contra Manichaeos (2 bks) (I.10) | augustinus.it `latino/genesi_dcm/` · DCO PL pdf | A/B | none PD (Teske FOTC 1991) | C | 19.8k / — | **no** |
| De musica (6 bks) (I.11) | augustinus.it `latino/musica/` · DCO PL pdf | A/B | none PD (Taliaferro FOTC 1947; archive.org copy is unauthorised) | C | 46.4k / — | **no** |
| De magistro (I.12) | augustinus.it `latino/maestro/` · DCO PL pdf | A/B | Tourscher, *The Philosophy of Teaching* 1924 (Villanova), archive.org `philosophyofteac00augu` | A | 11.6k / — | **no** |
| De vera religione (I.13) | augustinus.it `latino/vera_religione/` · DCO PL pdf | A/B | none PD (Burleigh LCC 1953) | C | 20.2k / — | **no** |
| De utilitate credendi (I.14) | augustinus.it `latino/utilita_credere/` · DCO PL pdf | A/B | NPNF I.3 / LF 22 (Browne 1847) — in corpus | A | 11.1k / 17.2k | en only: `profit-of-believing` |
| De duabus animabus (I.15) | augustinus.it `latino/due_anime/` · DCO PL pdf | A/B | NPNF I.4 — in corpus | A | 6.9k / 10.6k | en only: `two-souls-against-the-manichaeans` |
| Acta contra Fortunatum (I.16) | augustinus.it `latino/contro_fortunato/` · DCO PL pdf | A/B | NPNF I.4 — in corpus | A | 7.0k / 9.6k | en only: `acts-or-disputation-against-fortunatus-the-manichaean` |
| De fide et symbolo (I.17) | augustinus.it `latino/fede_simbolo/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 5.7k / 10.8k | en only: `faith-and-the-creed` |
| De Genesi ad litteram imperfectus liber (I.18) | augustinus.it `latino/genesi_incompiuto/` · DCO PL pdf | A/B | none PD (Teske FOTC 1991) | C | 10.9k / — | **no** |
| De sermone Domini in monte (2 bks) (I.19) | augustinus.it `latino/montagna/` · DCO PL pdf | A/B | NPNF I.6 (Findlay) — in corpus | A | 35.2k / 54.1k | en only: `our-lord-s-sermon-on-the-mount` |
| Psalmus contra partem Donati (I.20) | augustinus.it `latino/salmo_contro_donato/` · DCO PL pdf | A/B | none PD | — | 2.4k / — | **no** |
| Contra Adimantum (I.22) | augustinus.it `latino/contro_adimanto/` · DCO PL pdf | A/B | none PD (WSA) | C | 17.9k / — | **no** |
| Expositio quarundam propositionum ex ep. ad Romanos (I.23) | augustinus.it `latino/esposizione_romani/` · DCO PL pdf | A/B | none PD (Landes 1982) | C | 9.7k / — | **no** |
| Expositio epistulae ad Galatas (I.24) | augustinus.it `latino/esposizione_galati/` · DCO PL pdf | A/B | none PD (Plumer 2003) | C | 17.5k / — | **no** |
| Epistulae ad Romanos inchoata expositio (I.25) | augustinus.it `latino/incompleta_romani/` · DCO PL pdf | A/B | none PD (Landes 1982) | C | 7.3k / — | **no** |
| De diversis quaestionibus LXXXIII (I.26) | augustinus.it `latino/ottantatre_questioni/` · DCO PL pdf | A/B | none PD (Mosher FOTC 1982) | C | 36.4k / — | **no** |
| De mendacio (I.27) | augustinus.it `latino/menzogna/` · DCO PL pdf | A/B | NPNF I.3 / LF 22 — in corpus | A | 12.3k / 19.1k | en only: `lying` |
| Ad Simplicianum (2 bks) (II.1) | augustinus.it `latino/questioni_simpliciano/` · DCO PL pdf | A/B | none PD (Burleigh LCC 1953) | C | 17.9k / — | **no** |
| Contra epistulam Manichaei quam vocant Fundamenti (II.2) | augustinus.it `latino/contro_lettera_mani/` · DCO PL pdf | A/B | NPNF I.4 — in corpus | A | 13.4k / 19.4k | en only: `against-the-epistle-of-manichaeus-called-fundamental` |
| De agone christiano (II.3) | augustinus.it `latino/agone_cristiano/` · DCO PL pdf | A/B | **LF 22 (Cornish 1847) 'On the Christian Conflict'**, archive.org `seventeenshort00augu` | A | 7.7k / — | **no** |
| De doctrina christiana (4 bks) (II.4) | augustinus.it `latino/dottrina_cristiana/` · DCO PL pdf | A/B | NPNF I.2 (Shaw) — in corpus | A | 41.5k / 67.3k | en only: `christian-doctrine` |
| Confessiones (13 bks) (II.6) | augustinus.it `latino/confessioni/` · DCO PL pdf | A/B | NPNF I.1 (Pilkington) — in corpus twice; alt. Pusey LF 1838, Watts/Loeb 1912 (Latin facing) | A | 81.3k / 123.3k | en only: `confessions (+ augustine-confessions)` |
| Contra Faustum (33 bks) (II.7) | augustinus.it `latino/contro_fausto/` · DCO PL pdf | A/B | NPNF I.4 (Stothert) — in corpus | A | 129.6k / 173.4k | en only: `reply-to-faustus-the-manichaean` |
| Contra Felicem (2 bks) (II.8) | augustinus.it `latino/contro_felice/` · DCO PL pdf | A/B | none PD (WSA) | C | 13.4k / — | **no** |
| De natura boni (II.9) | augustinus.it `latino/natura_bene/` · DCO PL pdf | A/B | NPNF I.4 — in corpus | A | 8.3k / 12.1k | en only: `concerning-the-nature-of-good-against-the-manichaeans` |
| Contra Secundinum (+ Secundini epistula) (II.10) | augustinus.it `latino/contro_secondino/` · DCO PL pdf | A/B | none PD (WSA) | C | 12.3k / — | **no** |
| Quaestiones evangeliorum (2 bks) (II.12) | augustinus.it `latino/questioni_vangeli/` · DCO PL pdf | A/B | none PD | C | 16.3k / — | **no** |
| Adnotationes in Iob (II.13) | augustinus.it `latino/annotazioni_giobbe/` · DCO PL pdf | A/B | none | — | 26.3k / — | **no** |
| De catechizandis rudibus (II.14) | augustinus.it `latino/catechesi_cristiana/` · DCO PL pdf | A/B | NPNF I.3 — in corpus; alt. LF 22, Christopher 1926 (CUA, A) | A | 14.7k / 28.1k | en only: `catechising-of-the-uninstructed` |
| De Trinitate (15 bks) (II.15) | augustinus.it `latino/trinita/` · DCO PL pdf | A/B | NPNF I.3 (Haddan) — in corpus | A | 118.8k / 185.8k | en only: `holy-trinity` |
| De consensu evangelistarum (4 bks) (II.16) | augustinus.it `latino/consenso_evangelisti/` · DCO PL pdf | A/B | NPNF I.6 (Salmond) — in corpus | A | 77.2k / 145.7k | en only: `harmony-of-the-gospels` |
| Contra epistulam Parmeniani (3 bks) (II.17) | augustinus.it `latino/contro_parmeniano/` · DCO PL pdf | A/B | none PD | C | 28.6k / — | **no** |
| De baptismo (7 bks) (II.18) | augustinus.it `latino/sul_battesimo/` · DCO PL pdf | A/B | NPNF I.4 (King) — in corpus | A | 54.0k / 86.2k | en only: `baptism-against-the-donatists` |
| De opere monachorum (II.21) | augustinus.it `latino/lavoro_monaci/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 13.1k / 19.6k | en only: `work-of-monks` |
| De bono coniugali (II.22) | augustinus.it `latino/dignita_matrimonio/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 8.9k / 13.8k | en only: `good-of-marriage` |
| De sancta virginitate (II.23) | augustinus.it `latino/santa_verginita/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 12.5k / 18.9k | en only: `holy-virginity` |
| De Genesi ad litteram (12 bks) (II.24) | augustinus.it `latino/genesi_lettera/` · DCO PL pdf | A/B | none PD (Taylor ACW 1982; Hill WSA) | C | 100.2k / — | **no** |
| Contra litteras Petiliani (3 bks) (II.25) | augustinus.it `latino/contro_petiliano/` · DCO PL pdf | A/B | NPNF I.4 — in corpus | A | 58.6k / 98.7k | en only: `answer-to-letters-of-petilian-bishop-of-cirta` |
| Contra Cresconium (4 bks) (II.26) | augustinus.it `latino/contro_cresconio/` · DCO PL pdf | A/B | none PD | C | 59.1k / — | **no** |
| De divinatione daemonum (II.30) | augustinus.it `latino/potere_divinatorio/` · DCO PL pdf | A/B | none PD (FOTC 1955) | C | 3.6k / — | **no** |
| De peccatorum meritis et remissione (3 bks) (II.33) | augustinus.it `latino/castigo_perdono/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 35.7k / 57.7k | en only: `merits-and-remission-of-sin-and-infant-baptism` |
| De unico baptismo (II.34) | augustinus.it `latino/unicita_battesimo/` · DCO PL pdf | A/B | none PD (DCO's 'EN' file is mislabelled Contra litt. Petiliani) | C | 7.2k / — | **no** |
| De spiritu et littera (II.37) | augustinus.it `latino/spirito_lettera/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 18.0k / 29.6k | en only: `spirit-and-the-letter` |
| De fide et operibus (II.38) | augustinus.it `latino/fede_opere/` · DCO PL pdf | A/B | **LF 22 (Cornish 1847) 'Of Faith and Works'**, archive.org `seventeenshort00augu` | A | 12.8k / — | **no** |
| Breviculus collationis cum Donatistis (II.39) | augustinus.it `latino/sommario_conferenza/` · DCO PL pdf | A/B | none PD | C | 0.0k / — | **no** |
| Contra Donatistas post collationem (II.40) | augustinus.it `latino/donatisti_dopo_conf/` · DCO PL pdf | A/B | none PD | C | 15.6k / — | **no** |
| De natura et gratia (II.42) | augustinus.it `latino/natura_grazia/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 17.0k / 28.5k | en only: `nature-and-grace` |
| De civitate Dei (22 bks) (II.43) | augustinus.it `latino/cdd/` · DCO PL pdf | A/B | NPNF I.2 (Dods) — in corpus | A | 304.3k / 442.5k | en only: `city-of-god` |
| Ad Orosium contra Priscillianistas et Origenistas (II.44) | augustinus.it `latino/orosio/` · DCO PL pdf | A/B | none PD | C | 4.8k / — | **no** |
| De gestis Pelagii (II.47) | augustinus.it `latino/atti_pelagio/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 16.0k / 27.3k | en only: `proceedings-of-pelagius` |
| De gratia Christi et de peccato originali (2 bks) (II.50) | augustinus.it `latino/grazia_cristo/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 20.2k / 34.0k | en only: `grace-of-christ-and-on-original-sin` |
| Gesta cum Emerito (II.51) | augustinus.it `latino/confronto_emerito/` · DCO PL pdf | A/B | none PD | C | 3.7k / — | **no** |
| Sermo ad Caesareensis ecclesiae plebem (II.51) | augustinus.it `latino/discorso_cesarea/` · DCO PL pdf | A/B | none PD | C | 3.1k / — | **no** |
| Contra sermonem Arrianorum (+ Sermo Arrianorum) (II.52) | augustinus.it `latino/contro_sermone_ariani/` · DCO PL pdf | A/B | none PD (WSA) | C | 13.1k / — | **no** |
| De nuptiis et concupiscentia (2 bks) (II.53) | augustinus.it `latino/nozze_concupiscenza/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 24.1k / 41.1k | en only: `marriage-and-concupiscence` |
| Locutiones in Heptateuchum (7 bks) (II.54) | augustinus.it `latino/locuzioni_ettateuco/` · DCO PL pdf | A/B | none | — | 22.8k / — | **no** |
| Quaestiones in Heptateuchum (7 bks) (II.55) | augustinus.it `latino/questioni_ettateuco/` · DCO PL pdf | A/B | none PD (WSA) | C | 118.8k / — | **no** |
| De anima et eius origine (4 bks) (II.56) | augustinus.it `latino/anima_origine/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 31.1k / 53.2k | en only: `soul-and-its-origin` |
| De adulterinis coniugiis (2 bks) (II.57) | augustinus.it `latino/connubi_adulterini/` · DCO PL pdf | A/B | none PD (FOTC 1955) | C | 14.1k / — | **no** |
| Contra adversarium legis et prophetarum (2 bks) (II.58) | augustinus.it `latino/contro_avversario/` · DCO PL pdf | A/B | none PD (WSA) | C | 26.5k / — | **no** |
| Contra Gaudentium (2 bks) (II.59) | augustinus.it `latino/contro_gaudenzio/` · DCO PL pdf | A/B | none PD | C | 18.8k / — | **no** |
| Contra mendacium (II.60) | augustinus.it `latino/contro_menzogna/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 12.1k / 18.5k | en only: `consentius` |
| Contra duas epistulas Pelagianorum (4 bks) (II.61) | augustinus.it `latino/contro_lettere_pelagiani/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 34.2k / 54.1k | en only: `against-two-letters-of-the-pelagians` |
| Contra Iulianum (6 bks) (II.62) | augustinus.it `latino/contro_giuliano/` · DCO PL pdf | A/B | none PD (Schumacher FOTC 1957) | C | 94.0k / — | **no** |
| Enchiridion (II.63) | augustinus.it `latino/enchiridion/` · DCO PL pdf | A/B | NPNF I.3 — in corpus; alt. LF 22, Outler 1955 (CCEL) | A | 22.4k / 34.9k | en only: `enchiridion` |
| De cura pro mortuis gerenda (II.64) | augustinus.it `latino/cura_morti/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 6.8k / 10.8k | en only: `care-to-be-had-for-the-dead` |
| De octo Dulcitii quaestionibus (II.65) | augustinus.it `latino/questioni_dulcizio/` · DCO PL pdf | A/B | none PD (FOTC 1952) | C | 8.6k / — | **no** |
| De gratia et libero arbitrio (II.66) | augustinus.it `latino/grazia_libero_arbitrio/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 12.9k / 20.9k | en only: `grace-and-free-will` |
| De correptione et gratia (II.67) | augustinus.it `latino/correzione_grazia/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 12.6k / 19.3k | en only: `rebuke-and-grace` |
| Retractationes (2 bks) (post) | augustinus.it `latino/ritrattazioni/` · DCO PL pdf | A/B | none PD (Bogan FOTC 1968; archive.org copy is unauthorised) | C | 28.6k / — | **no** |
| De praedestinatione sanctorum (post) | augustinus.it `latino/predestinazione_santi/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 13.2k / 47.0k | en only: `predestination-of-the-saints-gift-of-perseverance` |
| De dono perseverantiae (post) | augustinus.it `latino/dono_perseveranza/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 16.8k / (in the 47.0k above) | en only: `predestination-of-the-saints-gift-of-perseverance` |
| De haeresibus (post) | augustinus.it `latino/eresie/` · DCO PL pdf | A/B | Müller 1956 (CUA Patristic Studies 90) | B? (unverified) | 10.5k / — | **no** |
| Contra Iulianum opus imperfectum (6 bks) (post) | augustinus.it `latino/incompiuta_giuliano/` · DCO PL pdf | A/B | none PD (Teske WSA) | C | 224.7k / — | **no** |
| Collatio cum Maximino (post) | augustinus.it `latino/conferenza_massimino/` · DCO PL pdf | A/B | none PD (WSA) | C | 13.6k / — | **no** |
| Contra Maximinum (2 bks) (post) | augustinus.it `latino/contro_massimino/` · DCO PL pdf | A/B | none PD (WSA) | C | 32.3k / — | **no** |
| Speculum (De scriptura sacra) (post) | augustinus.it `latino/speculum/` · DCO PL pdf | A/B | none (DCO 'EN' is mislabelled Harmony) | — | 62.0k / — | **no** |
| Enarrationes in Psalmos (150 Pss.) (—) | augustinus.it `latino/esposizioni_salmi/` · DCO PL pdf | A/B | **LF 24/25/30/32/37/39 (1847–57), complete, 6 vols**, archive.org | A | 810.2k / 654.1k | en only: `enarrations-or-expositions-on-the-psalms (NPNF, condensed)` |
| Tractatus in Iohannis evangelium (124) (—) | augustinus.it `latino/commento_vsg/` · DCO PL pdf | A/B | NPNF I.7 (Gibb & Innes) — in corpus, complete | A | 268.2k / 400.4k | en only: `tractates-on-the-gospel-of-john` |
| In epistulam Iohannis ad Parthos (10) (—) | augustinus.it `latino/commento_lsg/` · DCO PL pdf | A/B | NPNF I.7 — in corpus | A | 38.3k / 58.2k | en only: `homilies-on-the-first-epistle-of-john` |
| Epistulae (≈270 + Divjak 29*) (—) | augustinus.it `latino/lettere/` · DCO PL pdf | A/B | NPNF I.1 (Cunningham) — 161 in corpus; rest none PD (Parsons FOTC, Teske WSA) | A / C | 462.5k (310 letters; 228k in the 147 without English) / 372.3k | partly: `letters` (161 letters) |
| Sermones (Maurist 1–396 + post-Maurist) (—) | augustinus.it `latino/discorsi/` · DCO PL pdf | A/B | NPNF I.6 / LF 16, 20 (MacMullen 1844) — 97 in corpus; rest none PD | A / C | 1011.0k (600 sermons incl. Dolbeau 1–31, Étaix, Erfurt 1–6; 803k in the ≈500 without English) / 293.5k | partly: `sermons-on-selected-lessons-of-the-new-testament` (Serm. 51–147) |
| De continentia (—) | augustinus.it `latino/continenza/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 8.9k / 13.1k | en only: `continence` |
| De bono viduitatis (—) | augustinus.it `latino/dignita_vedovile/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 7.6k / 11.9k | en only: `good-of-widowhood` |
| De patientia (—) | augustinus.it `latino/pazienza/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 5.5k / 8.1k | en only: `patience` |
| De symbolo ad catechumenos (—) | augustinus.it `latino/simbolo_catecumeni/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 3.8k / 5.7k | en only: `creed` |
| De fide rerum quae non videntur (—) | augustinus.it `latino/fede_nelle_cose/` · DCO PL pdf | A/B | NPNF I.3 — in corpus | A | 3.7k / 5.6k | en only: `concerning-faith-of-things-not-seen` |
| De perfectione iustitiae hominis (—) | augustinus.it `latino/perfezione_giustizia/` · DCO PL pdf | A/B | NPNF I.5 — in corpus | A | 10.1k / 16.4k | en only: `man-s-perfection-in-righteousness` |
| De disciplina christiana (—) | augustinus.it `latino/disciplina_cristiana/` · DCO PL pdf | A/B | none PD (FOTC 16, 1952) | C | 3.8k / — | **no** |
| De utilitate ieiunii (—) | augustinus.it `latino/utilita_digiuno/` · DCO PL pdf | A/B | none PD (FOTC 16) | C | 3.8k / — | **no** |
| De excidio urbis Romae (—) | augustinus.it `latino/rovina_roma/` · DCO PL pdf | A/B | none PD (FOTC 16) | C | 2.8k / — | **no** |
| Adversus Iudaeos (—) | augustinus.it `latino/contro_giudei/` · DCO PL pdf | A/B | none PD (FOTC 27, 1955) | C | 4.9k / — | **no** |
| Epistula ad catholicos de secta Donatistarum (De unitate ecclesiae) [doubtful] (—) | augustinus.it `latino/lettera_cattolici/` · DCO PL pdf | A/B | none PD | C | 22.9k / — | **no** |
| Regula (Praeceptum, Ordo monasterii, Obiurgatio = ep. 211) (—) | augustinus.it `latino/regola/` · DCO PL pdf | A/B | Rule of St Augustine, Sinsinawa 1889 (archive.org `RuleOfSaintAugustine`); Smith 1911 (with Hugh of St Victor) | A | 2.2k / — | **no** |
| Quaestiones XVII in Matthaeum [doubtful] (—) | augustinus.it `latino/questioni_matteo/` · DCO PL pdf | A/B | none | — | 4.2k / — | **no** |
| De octo quaestionibus ex Veteri Testamento [doubtful] (—) | augustinus.it `latino/questioni_at/` · DCO PL pdf | A/B | none | — | 1.2k / — | **no** |
| Gesta collationis Carthaginiensis (411) [acts, not by A.] (—) | augustinus.it `latino/gesta_collationis/` · DCO PL pdf | A/B | none | — | 63.8k / — | **no** |
| Vita Augustini, by Possidius [not by A.] (—) | augustinus.it `latino/vita_possidio/` · DCO PL pdf | A/B | Weiskotten 1919 (Princeton, Latin+English), archive.org `cu31924029266513` | A | 11.6k / — | **no** |

## Latin sources, ranked (apply to every row unless a note says otherwise)

1. **augustinus.it**: `https://www.augustinus.it/latino/<dir>/index.htm`, a frameset leading to `index2.htm`, then `sommario.htm`, then one page per book: `<dir>_<n>_libro.htm` (text), `_note.htm` (biblical refs). It's the clean HTML of the whole PL corpus (PL 32–46), keyed to the Maurist/Migne text, one page per book/letter/sermon. The headings inside the text ("Loquentes signis utimur (1, 1-7, 20)") and the note pages are the Italian NBA's editorial apparatus (Città Nuova), not Augustine. **Strip them.** The Latin pages carry no copyright or licence notice. Tier: **A** for the PL/Maurist text it reproduces. It drops to **B** where NBA silently follows a modern critical text (CCL/CSEL) and for the editorial headings. Encoding is ISO-8859-1. This is the best source for an import: complete, uniform, already divided per book/letter/sermon.
2. **Documenta Catholica Omnia**: the author page `https://www.documentacatholicaomnia.eu/20_40_0354-0430-_Augustinus,_Sanctus.html` lists 311 `MLT.pdf` files (Migne PL scans with a text layer, 1841–49, tier A) and 112 `LT.doc` files. The `LT.doc` files are copies of the augustinus.it text. Use the PL PDFs to check augustinus.it readings against Migne. Its `EN.doc` files are NPNF dumps, and **some are mislabelled**: "De unico baptismo EN" is Contra litteras Petiliani, "Speculum EN" is De consensu evangelistarum. Don't trust DCO's English labels.
3. **The Latin Library** (`https://www.thelatinlibrary.com/august.html`) has only a few works: Confessiones, De civitate Dei, De Trinitate, Contra Iulianum opus imperfectum I–II, Sermones 1–75 (partial), De dialectica, De fide et symbolo, De catechizandis rudibus, Regula. Clean HTML, editions unstated, tier A/B. Use it to cross-check those works.
4. **CSEL** volumes on archive.org: critical texts, 1887–1930 volumes tier A. Search "Sancti Aureli Augustini Opera" (≈40 scans, e.g. `sanctiaureliaugu00auguuoft` = CSEL 63, Knöll 1922: C. Acad., De beata vita, De ordine). Also G. Morin, *Sermones post Maurinos reperti* (Miscellanea Agostiniana I, 1930) and Morin 1917 (`MN41725ucmf_2`) for the non-Maurist sermons. These are OCR of critical editions, the best way to adjudicate readings, not to import from.
5. **Corpus Corporum** (mlat.uzh.ch) carries the PL Augustine as XML. Not opened in this pass (JS front end). Unverified.
6. Confessions only: J. J. O'Donnell's Stoa edition (Skutella/Verheijen text with commentary), and Loeb 1912 (Watts' 1631 translation revised by W. H. D. Rouse, with Latin facing; tier A).

## English: what PD exists beyond the corpus

The corpus's English is all NPNF (Schaff, 1886–88, via New Advent): 48 books.

These are the PD English texts the corpus lacks:

- **Enarrationes in Psalmos, complete.** The corpus's NPNF VIII text is *condensed* from the Oxford Library of the Fathers (LF) translation. I measured it: the LF OCR runs 1.6× the corpus text for the same psalms (Pss. 55–57: 32.5k vs 19.7k; Pss. 65–68: 48.1k vs 30.8k; part of that is LF footnotes and page heads). The full LF translation is on archive.org:
  - vol. I (Ps. 1–36), `24ALibraryOfFathersOfTheHolyCatholicV24`
  - vol. II (37–52), `…V25`
  - vol. III (53–75), `…V30`
  - vol. IV (76–101), `…V32`
  - vol. V (102–125), `…V37`
  - vol. VI (126–150), `…V39`

  It runs 1.41M words of OCR in all and is tier A (Oxford, 1847–57; translators Tweed, Wilkins, Scratton and others). Replacing or supplementing the condensed NPNF with it would restore roughly a third of the text.
- **De fide et operibus** and **De agone christiano**: LF 22 *Seventeen Short Treatises* (Oxford 1847; tr. C. L. Cornish and H. Browne), archive.org `seventeenshort00augu` (whole volume ≈325k words of OCR). Both are missing from NPNF and the corpus. Tier A. The other 15 treatises in LF 22 duplicate NPNF III, and they're a second English witness for cross-checking it.
- **De magistro**: F. E. Tourscher OSA, *The Philosophy of Teaching* (Villanova 1924), archive.org `philosophyofteac00augu` (21k words of OCR; the front matter OCR is garbage and the body needs checking). Tier A.
- **Tourscher's other Peter Reilly Latin–English editions**: *De quantitate animae (The Measure of the Soul)* 1933, *De beata vita (Happiness: a study)* 1937, *De libero arbitrio* 1937. Tourscher died in 1939, so these are **tier A by the 70-year rule**. US renewal status wasn't checked. **None is openly online**: archive.org has *De libero arbitrio* only as a lending copy (`saintaugustinede0000fran`), and HathiTrust is search-only (record 001932346). Importing them would require scanning a physical copy.
- **Contra Academicos**:
  - D. J. Kavanagh OSA, *Answer to Skeptics* (Cosmopolitan Science & Art, New York 1943, "Copyright 1943"), archive.org `answertoskeptics00augu`. Open, 77k words of OCR with a bad first page. **B?**: the US 1943 renewal (due 1970–71) is unverified; the Stanford renewal database timed out.
  - M. P. Garvey (Marquette 1957, "Copyright ©, by the Marquette University Press, 1957"), archive.org `augustinesagainsttheacademicians`. Open, 47k. **B?**, unverified.
- **De ordine**: R. P. Russell, *Divine Providence and the Problem of Evil* (Cosmopolitan 1942). **B?** unverified, not located online.
- **De immortalitate animae** (with De magistro): G. G. Leckie 1938 (Appleton-Century). Lending copy only, **B?** unverified.
- **De haeresibus**: L. G. Müller 1956 (CUA Patristic Studies 90). **B?** unverified.
- **Vita by Possidius**: H. T. Weiskotten 1919 (Princeton), Latin + English, archive.org `cu31924029266513`. Tier A.
- **Regula**: *Rule of St Augustine* (Sinsinawa 1889), archive.org `RuleOfSaintAugustine`. Tier A.
- Alternative English for works already in the corpus, for cross-checking:
  - Pusey's Confessions (LF 1838)
  - Watts/Loeb 1912 Confessions
  - LF 16 & 20 *Sermons on Selected Lessons* (MacMullen 1844–45): the same 97 sermons as NPNF VI
  - J. P. Christopher, *De catechizandis rudibus* 1926 (CUA)
  - R. E. Cleveland, *Soliloquies* 1910
  - Outler's Confessions/Enchiridion 1955 (CCEL; the CCEL page states public domain, not rechecked here)

**No PD English found** (tier C only, from Fathers of the Church (FOTC), Ancient Christian Writers (ACW), the Library of Christian Classics (LCC, Burleigh 1953) and The Works of Saint Augustine (WSA, New City Press)):
- Retractationes (Bogan FOTC 1968)
- the three Genesis commentaries
- De musica (Taliaferro FOTC 1947; the archive.org copy `augustine-on-music-de-musica` is an unauthorised upload of FOTC 4)
- De vera religione, Ad Simplicianum (Burleigh LCC 1953)
- De diversis quaestionibus LXXXIII
- the Romans/Galatians expositions
- Contra Iulianum and the Opus imperfectum
- Quaestiones and Locutiones in Heptateuchum
- the anti-Donatist works after 400 except De baptismo and Contra litt. Petiliani
- the anti-Manichaean works Contra Adimantum, Felicem, Secundinum, Adversarium
- the anti-Arian works (Collatio, Contra Maximinum, Contra sermonem Arrianorum)
- De divinatione daemonum, De adulterinis coniugiis, De octo Dulcitii quaestionibus, Ad Orosium
- the four short sermons-treatises of FOTC 16 (De disciplina christiana, De utilitate ieiunii, De excidio urbis, plus Adversus Iudaeos in FOTC 27)
- all the letters NPNF omits (≈140), including the Retractationes-listed letter-books ep. 140 (De gratia Novi Testamenti), 147 (De videndo Deo), 187 (De praesentia Dei)
- all sermons beyond Serm. 51–147 (≈460 sermons, incl. Dolbeau and Erfurt)

These can be imported Latin-only, with pt-BR (and if wanted en-US) translated by our pipeline from the Latin.

## Notes on structure

- Use the Maurist (Benedictine) numbering throughout:
  - letters 1–270 plus Divjak 1*–29*
  - sermons 1–396, then the post-Maurist sermons by collection (Denis, Guelferbytanus, Mai, Morin, Frangipane, Lambot, Wilmart), then Dolbeau 1–31 / Étaix and Erfurt 1–6, which augustinus.it lists separately (`discorsi/discorsi_nuovi_index.htm`, `discorsi_erfurt_index.htm`)
  - the corpus's `letters/ch001` = Ep. 1, already Maurist-numbered (161 letters, 1–269 with gaps)
  - the corpus's `sermons-on-selected-lessons…/Sermon 1` = **Serm. 51** (NPNF renumbered 51–147 as 1–97). A Latin import must map these back, or keep the Maurist ids and leave the NPNF titles as display names.
- The Enarrationes on Ps. 118 (119) are 32 sermons. Several psalms have 2–4 enarrationes (e.g. Pss. 30, 31, 32, 33, 34, 36, 58, 70, 88, 101, 103). augustinus.it splits them per enarratio.
- Several works travel inside other books. Ad inquisitiones Ianuarii = epp. 54–55, De origine animae = ep. 166, De sententia Iacobi = ep. 167, De correctione Donatistarum = ep. 185, Quaestiones contra paganos = ep. 102. Import them once, as letters.
- On augustinus.it, *Secundini epistula*, *Sermo Arrianorum*, *Gesta collationis Carthaginiensis* and *Possidius' Vita* are texts by others that Augustine's dossier transmits. Include them as appendices, attributed.
- The lost works listed in the Retractationes have no text: the Disciplinarum libri except the De grammatica/dialectica fragments, Contra ep. Donati, Contra partem Donati, Contra Hilarum, Contra Centurium, Probationum et testimoniorum, Contra Donatistam nescio quem, Admonitio Donatistarum, Expositio ep. Iacobi, De Maximianistis, Ad Emeritum.

## Portuguese

Where I looked: pt.wikisource (*Autor:Agostinho de Hipona*), archive.org (language:por), and web searches (catalogues RIBAC/BN Portugal, publishers). **I did not search dominiopublico.gov.br, bndigital.bn.gov.br, purl.pt, Permanência or Obras Católicas directly.** I found **no public-domain Portuguese translation of any genuine Augustine work** that is online and attributable. Every complete Portuguese version found is modern and copyrighted. pt-BR has to come from our pipeline, from the Latin or from the NPNF English, as it does now for the 35 corpus books that already have pt-BR.

| Work | Portuguese translations, best first | Tier | Notes |
|---|---|---|---|
| Confessiones | J. Oliveira Santos SJ & A. Ambrósio de Pina SJ, Livraria Apostolado da Imprensa, Porto (11th ed. 1984; also used in Abril's *Os Pensadores*) | C (translators' dates unverified; still sold) | Complete, the standard Portuguese version. A widely circulated PDF is not a licence. |
| | A. do Espírito Santo, J. Beato & M. C. Pimentel, bilingual, INCM Lisbon 2001 | C | Complete, critical. |
| | Lorenzo Mammì (Penguin-Companhia 2017); Lusosofia/UBI books VII, X, XI (open-access academic PDF) | C | |
| De civitate Dei | J. Dias Pereira (Gulbenkian, 1991–2000); Oscar Paes Leme (Vozes) | C | |
| Most treatises (De Trinitate, De libero arbitrio, Contra Academicos, De beata vita, De ordine, De magistro, De vera religione, De doctrina christiana, De Genesi ad litteram, Enarrationes, Sermones, the anti-Pelagian works…) | Paulus, coleção *Patrística* (several dozen volumes) | C | |
| De magistro | Editora Fi 2015 (open-access PDF linked from pt.wikisource) | B? (licence not checked) | Complete. |
| De cura pro mortuis gerenda, Contra mendacium, Enarratio in Ps. 127 | archive.org `santo-agostinho-os-cuidados-para-com-os-mortos_202201`, `santo-agostinho-contra-a-mentira`, `santo-agostinho-comentarios-ao-salmo-127`; the uploader applied a Public Domain Mark, but no translator or source is named | unverified | Usable only after the translation's origin is identified. |
| *Meditações*, *Solilóquios*, *Manual* (old Portuguese editions, 17th–19th c.) | Pseudo-Augustinian medieval compilations, **not** Augustine's *Soliloquia* | — (spurious) | Don't confuse them with the genuine works. |

Bottom line: no Portuguese source is usable for import. The Portuguese editions above are only for spot-checking terminology (e.g. Paulus' renderings of technical terms).

## Recommendation

**Layout.** Add `la/` beside the existing `en-US/` in each `church-fathers/augustine/<work>/` book. The English is already chaptered NPNF, and the Latin must be split to the same chapter ids. For new works, create `church-fathers/augustine/<slug>/` with `la` canonical, keeping the existing flat naming (e.g. `contra-academicos`, `de-libero-arbitrio`, `de-genesi-ad-litteram`, `retractationes`). This avoids a second Augustine tree; an `augustine-opera-omnia/` umbrella would split the author across two places. Alternatively, if the corpus's direction is `<author>-opera-omnia` (as with Aquinas and Denis), move the 48 NPNF books into `augustine-opera-omnia/` in the same change and add the Latin there.

Watch three structural mismatches:
1. **Sermons**: NPNF "Sermon 1–97" = Maurist Serm. 51–147. Re-id them by Maurist number.
2. **Letters**: the corpus already uses Maurist numbers. augustinus.it's file numbers are sequential (92/A sits between 92 and 93), so map them through `tavola_lettere.htm`.
3. **Enarrationes**: per psalm, with multiple enarrationes for some psalms.

**Import order:**
1. **Latin for the 48 books already in English** (≈2.9M Latin words, e.g. De civitate Dei 304k, Tractatus in Ioh. 268k, Contra Faustum 130k, De Trinitate 119k, Confessiones 81k). Each gets a `la/` source, which is what the corpus model (original canonical) requires.
2. **The early philosophical dialogues and the anti-Pelagian/Genesis works with no English** (De libero arbitrio, De magistro, De vera religione, Contra Academicos, De beata vita, De ordine, De quantitate animae, De immortalitate animae, De musica, the three Genesis commentaries, Retractationes, Contra Iulianum, Opus imperfectum). These are Latin-only, except De magistro (Tourscher 1924) and the B?/offline translations noted above.
3. **De fide et operibus** and **De agone christiano** (Latin + LF 22 English, both PD).
4. **The full LF Enarrationes** to replace or sit beside the condensed NPNF English, plus the Latin.
5. **Remaining letters** (147 letters, 228k Latin) and **sermons** (≈500, 803k Latin), Latin-only.
6. **The anti-Donatist, anti-Manichaean and anti-Arian treatises, the exegetical questions, and the doubtful/appendix texts**, Latin-only.

**Can't be sourced cleanly:**
- **English for ≈2.4M Latin words** has no open PD translation: everything in the "none PD" rows, ≈140 letters and ≈500 sermons. Only FOTC/ACW/LCC/WSA (tier C) exist.
- Three PD-by-death Tourscher translations (De libero arbitrio, De quantitate animae, De beata vita) are **not online**.
- Kavanagh/Garvey/Russell/Leckie/Müller are **unverified B**: a US copyright-renewal check is still needed before any use.
- On the Latin side nothing is blocked. augustinus.it covers every surviving work. Its NBA section headings must be stripped, and readings can be checked against PL (DCO) or the CSEL scans.

## Total size

- **Latin (augustinus.it, all 110 directories): ≈5.46M words.** About 0.15M of that is texts by others transmitted with Augustine: Possidius 12k, Gesta collationis 64k, Secundinus/Sermo Arrianorum inside their rows, the doubtful Speculum 62k.
  - Latin of works whose English is already in the corpus: ≈2.95M.
  - Latin with **no English in the corpus**: ≈2.51M (whole works 1.48M + missing letters 0.23M + missing sermons 0.80M). Of this, PD English is openly available for only ≈30k words (De agone christiano, De fide et operibus, De magistro, Regula, Possidius).
- **English already in corpus**: ≈3.93M words (NPNF). Adding the full LF Enarrationes would bring ≈0.5M more English (1.41M OCR words vs 0.65M condensed, minus notes).
