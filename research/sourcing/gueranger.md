# Dom Prosper Guéranger (1805–1875): sourcing report

Guéranger, abbot of Solesmes, died in 1875. Everything he published in his lifetime, and everything his monks published by 1931, is **tier A** everywhere. So is the work of the people who carried on and translated his books: Dom Lucien Fromage (1845–1916, LC authority dates, unverified), Dom Laurence Shepherd (d. 1885), and the Stanbrook nuns, whose translations were all printed by 1912. The only copyright questions are:

- texts **first published after 2000**: the *Mémoires autobiographiques* (Solesmes 2005) and the modern Solesmes editions of the 1850s articles;
- **modern editorial matter** in reprints (Loreto's "restored" Liturgical Year, Biretta Books' *Holy Mass*, Angelico, Morin 1979–84).

Not in the corpus. `_corpus-books.txt` and `content/books/` have no Guéranger, and only the Catholic Encyclopedia mentions him.

The raw downloads used for counting are in `research/sourcing/gueranger/`:

- `ia/`: archive.org `_djvu.txt` of all 15 French volumes (1911 Oudin), all 15 English volumes and several minor works;
- `dgapi/`: the full WordPress REST dump of domgueranger.net, 266 posts;
- `sf/`: Sensus Fidelium samples;
- `dg-counts.txt`: word count per domgueranger.net post.

The counting script is `research/sourcing/gueranger-dgcount.py`.

Gallica was **not searched**. Cloudflare blocked every scripted request (`Attention Required!`). HathiTrust and Google Books were not checked either, so a manual Gallica pass could add better French scans.

## Summary table

Word counts are measured from the downloaded text unless marked ~. OCR counts include front matter, the index and the Latin liturgical texts.

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **L'Année liturgique**, 15 vols (vols 1–9 by Guéranger 1841–66; vols 10–15 by Dom L. Fromage 1878–1901) | ① domgueranger.net HTML, vols 1–6 complete plus the opening of vol 7 (14th ed. 1900) ② archive.org `lanneliturgiqu01gu`–`15gu` (Oudin 1911, all 15) ③ fr.wikisource, tome 1 only (1858) | A | ① archive.org `V01`–`V15TheLiturgicalYear` (Shepherd vols 1–12, Stanbrook nuns 13–15; Duffy/Stanbrook 1870–1912) ② sensusfidelium.com HTML, per day ③ archive.org `liturgicalyear01gura`… (Duffy 1867–) | A | 2,530k OCR (≈1,003k clean HTML for vols 1–6) / 2,540k OCR | No |
| Institutions liturgiques (1st ed. 3 vols 1840–51; 2nd ed. 4 vols 1878–85) | archive.org: 2nd ed. `institutions-liturgiques-tome-1…4-0000002xx`, `institutions011878gu`, `institutionslitu0003vari`, `InstitutionsLiturgiques` (t. 4); 1st ed. `institutionslitu01gu`, `institutionslitu02gu`, `bub_gb_HgwlFUZL8C0C`; domgueranger.net has chs. II–III and "L'hérésie antiliturgique" only | A | none complete (only modern partial translations of the "anti-liturgical heresy" chapter; tier unverified) | – | ~1,000k (2nd ed., from byte counts; t. 1 = 209k, t. 3 = 235k measured) / – | No |
| De la monarchie pontificale (1870), with Défense de l'Église romaine contre le P. Gratry (3 letters, 1870) and De la définition de l'infaillibilité / Réponse aux dernières objections (1870) | ① domgueranger.net HTML, 2nd ed. ② archive.org `delamonarchiepon00gu` (Palmé 1870), `dfensedeleglis00gu`, `deladfinitionde00gugoog` | A | none found | – | 150k (dg, whole cluster); 88k for Monarchie alone (OCR) / – | No |
| Mémoire sur l'Immaculée Conception (1850) | ① domgueranger.net (Solesmes 2004 reprint, with a modern foreword) ② archive.org `bub_gb_XeHLuSYnFqUC` (Julien-Lanier 1850) | A (the 1850 text) | none found | 39k (dg) / 46k (OCR) | No |
| Marie d'Agréda et la Cité mystique, 28 articles (L'Univers 1858–59) | domgueranger.net HTML, 28 posts | A | none found | 111k | No |
| Essais sur le naturalisme contemporain: Du naturalisme dans la philosophie (1857–58), Du naturalisme dans l'histoire (13 articles 1858–59) | ① domgueranger.net (from "Archives Dom Guéranger, Solesmes 2005") ② archive.org `natural_philo_gueranger` (the 7 philosophy articles) | A (the articles) | none found | 53k (history) + ~28k (philosophy, from byte count) | No |
| Considérations sur la liturgie catholique and its Défenses (Mémorial catholique 1830, 8 pieces) | domgueranger.net HTML | A | none | 35k | No |
| Le jansénisme et la Compagnie de Jésus (1858, 3 articles) | domgueranger.net HTML (Revue de l'Anjou 1858) | A | none | 31k | No |
| Conférences sur la vie chrétienne (given 1872–74, from monks' notes, posthumous Solesmes printing) | domgueranger.net HTML, 30 conferences | A (printing year unverified; the text is a 19th-century record) | none found | 67k | No |
| Explication des prières et des cérémonies de la sainte messe (2nd ed. Solesmes 1885) | domgueranger.net HTML | A | *Explanation of the Prayers and Ceremonies of Holy Mass*, Stanbrook/Shepherd, Duffy 1885: isidore.co OCR PDF (calibre id 5723); sanctamissa.org PDF (Biretta Books ©2007 reprint, not to be used) | A (the 1885 text) | 41k / ~40k (est.) | No |
| Notions sur la vie religieuse et monastique (Solesmes 1885) | domgueranger.net HTML | A | *Religious and Monastic Life Explained*, Herder 1908: archive.org `religiousmonasti00gura` | A | 22k / 24k | No |
| L'Église ou la société de la louange divine (Solesmes 1875) | domgueranger.net HTML (bundled with Cécile Bruyère's *Le prêtre et l'ordre de S. Benoît*) | A | not found (an English version is said to exist; unverified) | ~4k (Guéranger's part) | No |
| Essai sur la médaille ou croix de saint Benoît (1862) | ① domgueranger.net HTML ② archive.org `essaisurlorigine00gu` (Oudin 1887) | A | *The Medal or Cross of St. Benedict*, Burns & Oates 1880: archive.org `TheMedalOrCrossOfStBenedict`, `medalorcrossstb01gugoog` | A | 32k / 37k | No |
| Histoire de sainte Cécile (1849) / Sainte Cécile et la société romaine (1874) | not verified online (the 1874 book is on Google Books / Gallica, unchecked) | A | *Life of Saint Cecilia*, Philadelphia 1866: archive.org `lifeofsaintcecil00gura`, `lifeofsaintcecil0000pros` | A | ~200k (1874, est.) / 116k | No |
| Origines de l'Église romaine (1836) | not found as a text; domgueranger.net's post of that name is Delatte's account of it | A | none | unknown | No |
| De l'élection et de la nomination des évêques (1831) | not found; the dg post is from Delatte's biography, not the pamphlet | A | none | small | No |
| Exercices de sainte Gertrude (tr. 1863) / Enchiridion benedictinum (1862, with Brémond) | domgueranger.net (preface and introduction only) | A | – (a translation of Gertrude, not his own work) | 8k (prefaces) | No |
| Mémoires autobiographiques 1805–1833 (written c. 1860s, **first published Solesmes 2005**) | domgueranger.net HTML, which reproduces "© 2005 S.A.S. La Froidfontaine – Éditions de Solesmes" | **C** (editio princeps 2005; the edition is sold) | none | 70k | No |
| Letters, sermons (e.g. Panégyrique de S. François de Sales), Déclarations sur la Règle, minor polemics (Lettre à Mgr de Reims 1843, Défense des Institutions 1844–47) | scattered: domgueranger.net (Panégyrique 16k), archive.org `examendesinstit00gugoog` (the opponent's side) | A | none | unknown | No |

## L'Année liturgique: the main work

### Structure

The work runs to 15 volumes.

| Vol | Contents | Author |
|---|---|---|
| 1 | Avent | Guéranger |
| 2–3 | Temps de Noël | Guéranger |
| 4 | Septuagésime | Guéranger |
| 5 | Carême | Guéranger |
| 6 | Passion et Semaine sainte | Guéranger |
| 7–9 | Temps pascal | Guéranger |
| 10–15 | Temps après la Pentecôte | Dom Lucien Fromage ("PREMIER … SIXIÈME VOLUME DE LA CONTINUATION" on the title pages of vols 10–15) |

Each season opens with chapters headed *Historique / Mystique / Pratique*, then prayers for Mass and the Office. Then comes the **Propre du Temps**, one section per Sunday and feria, and the **Propre des Saints**, one section per feast, in calendar order. Liturgical texts are given in Latin with a translation (Latin first, then the vernacular), so a sizeable share of every volume is Latin. Footnotes are mostly references.

The natural chapter split is **one file per day or feast**, a few thousand entries in all. That maps directly onto the EF calendar (`resolveDay`), which makes this a candidate for a daily-reading surface tied to the Divinum Officium calendar. Note that Fromage's sanctoral follows the pre-1911 calendar.

### French sources, best first

1. **domgueranger.net** (Societas pro canonizatione D. Guéranger). Clean WordPress HTML of vols 1–6 and the historical intro to vol 7, with footnotes as `[↩]` anchors. The Avent pages state "QUATORZIÈME ÉDITION 1900".
   - It has 21 posts and **1,002,733 words**, measured through `/wp-json/wp/v2/posts`. One post per section, e.g. `annee-liturgique-lavent-propre-du-temps` (44k words) and `lannee-liturgique-jeudi-vendredi-et-samedi-saint-propre-du-temps` (112k).
   - Its only notice is the site footer "Copyright © 2026 Societas pro canonizatione D. Guéranger". It states no licence. A faithful transcription of a 1900 text creates no new right in France, so the text is A. Credit the site anyway.
   - Each post is one huge page per section, so it has to be split by headings.
2. **archive.org 1911 Oudin edition** (PIMS, University of Toronto), `lanneliturgiqu01gu` … `lanneliturgiqu15gu`. The **only complete French set**, with full `_djvu.txt` for all 15 volumes, **2,529,803 words**.
   - The OCR is good for its age: running headers are mixed into the text, end-of-line hyphenation is left in ("dé- dains"), and there is occasional junk ("'-.").
   - This is the source for vols 7–15 and the cross-check for 1–6.
3. **fr.wikisource**, `L'année liturgique (Guéranger, tome1)/…`: the Préface générale, chapters 1–6, the Litanies and part of the Propre du temps, from a **1858** scan, proofread. Tome 1 only. Use it to cross-check the earlier edition.
4. Other scans: archive.org `bub_gb_0-L9BvMc4XQC` (1841 first edition, vol 1) and `lanneliturgique01gugoog`; PTSEM Commons has Oudin vols in various editions (1909, 1913). Gallica was not searched (Cloudflare).

### English sources, best first

1. **archive.org `V01TheLiturgicalYear` … `V15TheLiturgicalYear`**: a complete uploaded set (Google scans) with a "Public Domain Mark 1.0" licence URL. Editions are mixed, from Vol 1 (2nd ed., 1870) up to the 3rd editions of 1900–1912.
   - Title pages: vols 1–12 "Translated from the French by the Rev. Dom Laurence Shepherd, monk of … Stanbrook"; vols 13–15 "Translated from the French by the Benedictines of Stanbrook".
   - **2,376,798 words** for the 14 volumes whose text downloaded. `V02`'s `_djvu.txt` returns HTTP 500 every time; use `liturgicalyear02gura` (165k words) instead. The set totals ≈2.54M words.
   - OCR is good (Google), apart from a Google boilerplate first page.
   - These are the Dublin/Stanbrook British texts. Catholicism.org notes that the later *American* reprints were "somewhat expurgated", which is one more reason to prefer them.
2. **sensusfidelium.com/the-liturgical-year-dom-prosper-gueranger/**: clean HTML, one page per day or feast, with Latin and English in alternation.
   - It has volume index pages I–XV and month pages (e.g. November, 30 feast links; January 44; Lent 57; Easter 50; Septuagesima 39; Time after Pentecost 51).
   - Footer of each text: "This text is taken from The Liturgical Year, authored by Dom Prosper Gueranger (1841-1875)". It states no licence: the only © is the site design ("©2023 SO' Creative").
   - Coverage looks near-complete, but I did not crawl it whole. It is the best cross-check, since the text is already segmented by day.
3. **archive.org Duffy 1867–68 sets**: `liturgicalyear01gura` … `12gura` (UNC) and `liturgicalyear02gu` … `12gu` (PTSEM). The Fromage continuation is in `liturgicalyeart00fromgoog` … `03fromgoog` (1870–83). There are also isidore.co calibre OCR PDFs of individual volumes.
4. EWTN hosts only the General Preface ("Electronic Copyright 2000 EWTN … All Rights Reserved"). Avoid it; it is redundant.
5. Loreto Publications sells a "restored" 15-volume set. Its restorations are tier **C**; the underlying 19th-century text is A.

## Notes on the other works

- **Institutions liturgiques.** A history of the Latin liturgy, with the famous chapter on the "anti-liturgical heresy" and long Latin appendices.
  - The 2nd edition (Palmé/Société générale, 1878–85, 4 vols; t. 4 is "Polémique liturgique", which includes the Lettre à Mgr de Reims and the Défenses) is the fuller text.
  - All four tomes have `_djvu.txt` on archive.org; t. 1 has 208,917 words and t. 3 has 234,747. `InstitutionsLiturgiques` (t. 4) has a filename with spaces that I could not fetch; use `institutions-liturgiques-tome-4-000000293` (1.6 MB of text).
  - The chapter split follows the author's chapters. There is no usable English.
- **domgueranger.net minor works.** These reproduce Solesmes printings: 1885 for *Notions*, *Explication de la messe* and the *Conférences*; 1875 for *L'Église ou la société de la louange divine*.
  - Some come from **modern Solesmes reprints** with forewords: the *Mémoire* on the Immaculate Conception says "Solesmes, 2004 – Avant-propos de la présente édition", and *Naturalisme* "Archives Dom Guéranger, Solesmes 2005". Take Guéranger's text and drop the modern forewords. The 1850 *Mémoire* is also on archive.org to check against.
  - **Beware of posts that are not Guéranger.** About 527k words on the site are Dom Delatte's biography *Dom Guéranger, abbé de Solesmes* (1909–10; tier A, but a different author and a candidate of its own). The "Origines de l'Église romaine" and "De l'élection et la nomination des évêques" posts are chapters of that biography; I verified the opening text of each. Other posts are Soltner, Abbé Blanc, Dom Guépin, Piolin, and "In Spiritu et veritate" (an anthology): all secondary.
- ***Mémoires autobiographiques.*** The manuscript is Guéranger's, but it was first published in 2005, and the site reproduces "© 2005 S.A.S. La Froidfontaine – Éditions de Solesmes … ISBN 2-85274-259-4". In the EU a first publication of a PD work carries a 25-year right, to 2030. **C until then.**
- ***Conférences sur la vie chrétienne*** and the ***Explication de la messe*** are notes taken by monks at his conferences, edited after his death. They are authentic, but not his finished prose; flag them that way in metadata.
- **No English** exists for the polemical and theological works (*Monarchie pontificale*, *Mémoire IC*, *Naturalisme*, *Marie d'Agréda*, *Considérations*, *Institutions*). Their en-US would have to be ours.

## Portuguese

**No complete or usable Portuguese translation of any Guéranger work was found**, so pt-BR will have to come from our own pipeline.

Searched: archive.org (`language:por`; title "ano litúrgico"), the general web in Portuguese (Permanência, FSSPX Brasil, Salve Maria, catolicosribeiraopreto, padrepauloricardo), and pt.wikipedia.

Not checked:

- Google Books, whose API returned HTTP 429 "Quota exceeded" for the day;
- dominiopublico.gov.br, bndigital and purl.pt, which have no usable scripted search, so they need a manual pass;
- 19th-century Portuguese printings of *Ano Liturgico*, *Medalha de S. Bento* or *Santa Cecilia*, which may exist in BN Portugal or BN Brasil.

What turned up, best first:

1. ***O Ano Litúrgico*, Edições Paulinas, 1956, vol. I.** Quoted in a search snippet as "D. Prosper Guèranger, O Ano Liturgico, Ed. Paulina, 1956, Volume I". I could not find the citation on the page it was attributed to, so the edition is **unverified**. The translator is unknown. Paulinas is an active publisher and the translation dates from 1956, so it is presumably **C**. There is no online text.
2. **salvemaria.com.br, category "Ano Litúrgico"**: individual days in Portuguese (Quarta-feira de Cinzas, the Sundays of Lent, "Os Impropérios na Liturgia da Sexta-Feira Santa"), credited "Ano Litúrgico, Tomo IV / Tomo VI" and translated by "um congregado mariano" (anonymous). Footer: "Salve Maria © 2014-26. Todos os direitos reservados." **Tier C** (rights reserved, no licence). A handful of pages, so it serves at most as a terminology reference.
3. archive.org "A HERESIA ANTI-LITÚRGICA" (`a-heresia-anti-litu-rgica`, 2026) is **not Guéranger**: it is a sermon by Fr Juan Carlos Ceriani about the topic, translated from Spanish.

## Recommendation

**Layout:** `gueranger-opera-omnia/`.

- `annee-liturgique/`, with volume folders (`01-avent`, `02-noel-1`, … `15-temps-apres-pentecote-6`, keeping the Fromage volumes marked as continuation) and one chapter per day or feast.
- `institutions-liturgiques/`
- `monarchie-pontificale/` (with the Gratry *Défenses* and the infallibility pamphlets as `opuscula`)
- `immaculee-conception/`
- `marie-d-agreda/`
- `naturalisme/`
- `considerations-liturgie/`
- `jansenisme/`
- `conferences-vie-chretienne/`
- `explication-messe/`
- `notions-vie-monastique/`
- `louange-divine/`
- `medaille-saint-benoit/`
- `sainte-cecile/`

**Import order:**

1. ***L'Année liturgique***, vols 1–6 first: fr-FR from domgueranger.net HTML (clean, already in sections), checked against the 1911 OCR; en-US from the Shepherd volumes on archive.org, checked against Sensus Fidelium's per-day HTML. Then vols 7–15 from the 1911 OCR plus the archive.org English. This is the most useful Guéranger for Ember, being day-by-day and matching the EF calendar.
2. The short spiritual works where English exists: *Explication de la messe* / *Holy Mass* (1885), *Notions* / *Religious and Monastic Life Explained* (1908), *Médaille* / *Medal of St Benedict* (1880).
3. *Sainte Cécile*, once a French text is located (manual Gallica search), with the 1866 English.
4. The French-only works: *Institutions*, *Monarchie pontificale*, *Mémoire IC*, *Naturalisme*, *Marie d'Agréda*, *Considérations*, *Jansénisme*, *Conférences*, *Louange divine*.

**Cannot be sourced cleanly:**

- the *Mémoires autobiographiques* (C until ~2030);
- *Origines de l'Église romaine* (1836) and *De l'élection des évêques* (1831), for which no text was found (try Gallica and Google Books);
- the correspondence (no edited corpus online);
- *Sainte Cécile* in French (not verified);
- English for any of the polemical or theological works (none exists).

**Total size**, French originals, approximate and including the Latin in the liturgical texts: *Année liturgique* ≈2.5M + *Institutions* ≈1.0M + *Monarchie* cluster 0.15M + *Sainte Cécile* ≈0.2M + minor works ≈0.45M = **≈4.3M words**. Existing PD English covers ≈2.8M words: the Liturgical Year 2.54M plus Cecilia, Medal, Holy Mass and Monastic Life ≈0.22M.
