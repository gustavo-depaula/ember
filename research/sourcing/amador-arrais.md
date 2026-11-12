# D. Frei Amador Arrais OCarm (c. 1530–1600): sourcing report

Bibliography from Barbosa Machado, *Bibliotheca Lusitana* I (1741), pp. 122–124 (archive `bibliothecalusit01barbuoft`), and the editor's prologue of the 1846 edition. Carmelite of Lisbon/Coimbra (habit 1545), preacher to King Sebastian, coadjutor of Évora (bishop of Tripoli *in partibus*, 1578), bishop of Portalegre (1581), resigned and retired to the Carmelite College of Coimbra, where he died in 1600.

Works — essentially one:
1. ***Diálogos*** — ten dialogues between the sick Antíoco and various visitors: I *Das queixas dos enfermos e cura dos médicos*; II *Do alívio dos afligidos*; III *Da gente judaica*; IV *Da glória e triunfo dos Lusitanos*; V *Das condições e partes do bom Príncipe*; VI *Das vias por que Deus neste tempo nos chama*; VII *Da paciência e fortaleza cristã*; VIII *Do testamento cristão*; IX *Consolação para a hora da morte*; X *Da invocação de Nossa Senhora*. Coimbra, António de Mariz, 1589 (4to); **revised and enlarged by the author, posthumous, Coimbra, Diogo Gomes Loureiro, 1604** (folio, [22], 341 ff., each dialogue in numbered chapters); Lisboa, Typ. Rollandiana, **1846**, "nova edição" of the 1604 text; modern: Porto, Lello & Irmão, 1974 (ed. M. Lopes de Almeida) — C (unverified). Infopédia notes that his brother Jerónimo Arrais began the work.
2. Barbosa also credits him with the diocesan *Constituições* of Portalegre ("trabalhou com grande desvelo nas Constituições por onde se governou muitos anos o bispado"); not printed under his name, not located. Sermons as royal preacher: none printed.

Not in the corpus (`_corpus-books.txt`, `content/books/` checked).

## Summary

| Work | Original source (URL, edition) | Tier | English source | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Diálogos (10 dialogues, 1604 revised text) | Rollandiana 1846: https://archive.org/details/dialogosrevistos00arrauoft · princeps of the revision, Coimbra 1604: BND https://purl.pt/14115, archive copies https://archive.org/details/res-3036-v-0000-obra-completa-t-24-c-r-0150 and https://archive.org/details/dialogos-d.-amador-arrais-1604 | A | none | — | ~370,000 (OCR 400,800 for the dialogues, 1846) / — | no |
| Diálogos, first version (Coimbra 1589) | not found online | — | none | — | — | no |
| Constituições do bispado de Portalegre (collaboration) | not located | — | — | — | — | no |

## Notes, sources ranked

### Diálogos
A humanist consolation book in the Ciceronian dialogue form, ranging from medicine and patience to Jewish questions, Portuguese history and the good prince, and ending with death and Marian invocation; dialogues III–V are historical-political rather than spiritual. Each dialogue is long (25–50k words) and divided into numbered chapters (the 1846 edition keeps the 1604 chapter numbering, cited e.g. "Diálogo 10, cap. 85"). Split: one file per dialogue part of ≈ 10 chapters, or one per chapter (several hundred, short) — prefer groups of chapters under each dialogue.

Original, ranked:
1. **Lisboa, Typ. Rollandiana, 1846** (archive `dialogosrevistos00arrauoft`, Toronto/Robarts, 916 images) — A. The 1604 revised text reset in modern type with the old spelling kept (*&, cõtinua, ne, polo, antiguos, Deos*); editor's prologue with a biography and notes; *Taboada* (index) at the end. OCR good (proxy 0.85). **Base text.** 423,334 OCR tokens in all; 400,800 between the start of Dialogue I and the *Taboada*.
2. **Coimbra, Diogo Gomes Loureiro, 1604** — BND https://purl.pt/14115 (Public Domain Mark; image-only PDF), and two archive.org uploads of PDFs of it with archive OCR: `res-3036-v-0000-obra-completa-t-24-c-r-0150` (373,000 OCR tokens) and `dialogos-d.-amador-arrais-1604` (378,600) — A. Authority for collation; long-ſ OCR (*fe, faber, perfuadir*).
3. **Coimbra, António de Mariz, 1589** — the first version (shorter, before the author's revision): not found on BND, archive.org or Google (Google Books API quota exhausted during this research — unverified). Only needed for a variorum.
4. Lello 1974 — modern spelling, editor's notes: C (unverified), not online.
Nothing on pt.wikisource, Gutenberg or Domínio Público (searched dominiopublico.mec.gov.br; www host returns 403).

English: none found (no English, Latin or Spanish translation is recorded by Barbosa or found on archive.org).

## Portuguese
The original is Portuguese (above). Orthography layers:
- **1589 / 1604 Coimbra prints**: late-16th-c. spelling with abbreviations and long ſ — scans (1604 online).
- **1846 Rollandiana**: 1604 text in old spelling, modern type, good OCR — **recommended canonical `pt-PT/` text**, collated against the 1604 scan.
- **1974 Lello**: modernized — not usable.

## Recommendation

Layout: `amador-arrais-opera-omnia/dialogos` (one work; an `opera-omnia` folder only for consistency — `amador-arrais-dialogos` would also do), `pt-PT/` canonical (1846 text), `pt-BR/` as a spelling modernization, `en-US/` by pipeline translation.
- **Import: `…/dialogos`**, all ten dialogues, from the 1846 OCR (strip running heads, page numbers and the *Taboada*; keep the editor's prologue out or as an appendix), proofread against the BND 1604 scan.
- Spiritually central for Ember: VI–X (vocation, patience, Christian testament, preparation for death, Our Lady); I–II (sickness and affliction) also devotional. III (*Da gente judaica*) is a 16th-c. anti-Jewish polemic and needs editorial framing.

Cannot be sourced cleanly: the 1589 first version; any English; the Portalegre *Constituições*.

Total size: Portuguese ≈ 370,000 words; English 0.

Raw downloads: `research/sourcing/amador-arrais/ia/` (counts in `counts.tsv`).
