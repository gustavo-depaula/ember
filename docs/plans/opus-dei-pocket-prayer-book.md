# Opus Dei Pocket Prayer Book — import

Source: `https://opusdei.org/{lang}/prayers/` (the Pocket Prayer Book / *Devocionário*,
"Compilation and design: Office of Communication of Opus Dei, Version 2025").
Probed 2026-09-27; everything below was observed on the live site, not assumed.

## What the site is

**Access.** Every path under `opusdei.org` (the prayers *and* the gospel/meditation
pages our runtime sources already fetch) answers plain HTTP with a Cloudflare managed
challenge (403, "Just a moment…"). A headed Chromium clears it on its own
and gets the server-rendered page; no XHR/JSON API sits behind it — the whole
section is in the HTML.

**Structure.** Two levels only: 12 sections per language, each one page listing its
prayers in full.

| en id | pt-BR id | la id | en | pt-BR |
|---|---|---|---|---|
| 296 | 191 | 31 | Common Prayers (9) | Orações comuns (9) |
| 297 | 192 | 32 | Blessed Trinity (6) | Ssma. Trindade (6) |
| 298 | 193 | 33 | Eucharistic Adoration (7) | Adoração Eucarística (3) |
| 299 | 194 | 34 | Holy Spirit (3) | Espírito Santo (3) |
| 300 | 195 | 35 | Our Lady (11) | Nossa Senhora (12) |
| 301 | 196 | 36 | Before Mass (4) | Antes da Missa (4) |
| 302 | 197 | 37 | After Mass (9) | Depois da Missa (9) |
| 303 | 198 | 38 | Other Prayers (9) | Outras devoções (9) |
| 304 | 199 | 64 | Hymns (11) | Hinos (5) |
| 305 | 200 | 39 | For the Dead (1) | Falecidos (1) |
| 306 | 201 | 52 | Doctrine (13) | Doutrina (13) |
| 307 | 202 | — | Prayer Cards (16) | Estampas (16) |

99 en / 90 pt-BR prayers. The two languages don't carry the same set: pt-BR omits four
Eucharistic hymns (Sacris solemniis, Lauda Sion, Iesu dulcis memoria, Verbum supernum)
and most of the Hymns section, and adds a *Consagração a Nossa Senhora*. The section
Prayer Cards has no Latin.

**URLs.** `/{lang}/prayers/section/?section1={id in lang}&section2={id in 2nd lang}`.
The second-language column is whatever `pb2` was on the home page
(`/{lang}/prayers/?pb1=en&pb2=pt-br`); an empty `section2=` gives a single column.
Language codes are `latin, en, pt-br, pt-pt, es, it, fr, ca, da-dk, hr-hr, hu-hu,
ro-ro, sk-sk, sl-si, sv-se`.

**Block alignment.** A two-language page renders each prayer as

```html
<div class="prayer-wrapper double">
  <div class="prayer-titles">
    <h2 class="left"  id="dm-prayer-2147" lang="en">Prayer to St. Michael</h2>
    <h2 class="right" id="dm-prayer-1421" lang="pt-BR">Oração a São Miguel Arcanjo</h2>
  </div>
  <div class="prayer">
    <div class="left"  lang="en"    style="grid-row: auto / span N"><p>…</p>×N</div>
    <div class="right" lang="pt-BR" style="grid-row: auto / span N"><p>…</p>×N</div>
  </div>
</div>
```

The columns are a CSS subgrid, so **paragraph *i* of one language lines up with
paragraph *i* of the other**, and both have exactly N `<p>` (checked on all nine
prayers of After Mass: 1/1, 3/3, 4/4, 17/17, …, 55/55). Prayer ids differ per
language (`en 2147 ↔ la 228 ↔ pt-BR 1421`); a two-column page is what pairs them.

**Inline markup inside `<p>`:**

| markup | meaning | flow DSL target |
|---|---|---|
| `<svg class="icon-prayer-v">` + `.dot-vr` | ℣ | `response` verse `v` |
| `<svg class="icon-prayer-r">` + `.dot-vr` | ℟ | `response` verse `r` |
| `<span class="rb">` (whole paragraph) | rubric line ("All stand and…") | `rubric` |
| `<span class="rub">` (inline) | red text: verse numbers, "Antiphon.", parentheses | keep as leading label / strip numbers |
| `<span class="pq">` inside `.rub` | seasonal condition ("Easter Time") | `select` on season, or a rubric |
| `<p class="cn">` | centred subtitle (canticle title, citation) | `subheading` |
| `.rub.dm` / `.rub.md` / `.up.md` / `.nig` | citations, small caps variants | investigate during parsing |
| `&nbsp;`, `U+2060` word joiners | typographic glue | normalise away |

## Phases

### 1. Pages

- Saved once from a browser (a headed Chromium clears the challenge): every language
  the site has, 14 vernaculars plus Latin — `en, pt-br, pt-pt, es, it, fr, ca, da-dk,
  hr-hr, hu-hu, ro-ro, sk-sk, sl-si, sv-se, latin`.
- Each language × section as `{lang}+latin`, so Latin is the pivot every language
  aligns to; `en+{lang}` for Prayer Cards, which have no Latin.
- Kept in `research/opus-dei-prayerbook/.cache/`, gitignored. No scraper is kept in
  the repo: `prayerbook.json` is the committed snapshot.

### 2. Parser → aligned JSON

- `scripts/parse-opus-dei-prayerbook.mjs` turns each wrapper into
  `{ ids: {la, en, pt-BR, …}, section, title: {lang: …}, blocks: [{ kind, text: {lang: …} }] }`,
  with one entry per aligned `<p>` index. It has as many language keys as the site
  has translations of that prayer.
- Language keys are BCP-47, matching the corpus: `en-US, pt-BR, pt-PT, es, it, fr, ca,
  da-DK, hr-HR, hu-HU, ro-RO, sk-SK, sl-SI, sv-SE, la`.
- Classify each block (`prayer | response(v/r) | rubric | subheading | antiphon`)
  from the markup table above.
- Merge the `{lang}+latin` pairings on the Latin prayer id. For Prayer Cards, which
  have no Latin, merge on the `en+{lang}` pairings with English as the pivot.
- **Assertions, fail loud:**
  - paragraph counts are equal within each pair;
  - a ℣/℟ in one column sits at the same index in the other;
  - every prayer in every language lands in the merge exactly once. Print a coverage
    matrix of prayers × languages, since the sets differ; pt-BR alone lacks ten of the
    English hymns (four Eucharistic, six in Hymns).
- Output `research/opus-dei-prayerbook/prayerbook.json`, committed. It's the reviewable
  snapshot of the "Version 2025" text, and a later capture is diffed against it.

### 3. Match table against the corpus

A fuzzy title pass on the 70 non-Doctrine, non-Card prayers matched about 38 to
existing practices (angelus, memorare, anima-christi, te-deum, pange-lingua, …). It
also produced false hits, like Psalm 2 → `odod-psalm-121` and Act of Love →
`act-of-hope`. So the mapping is by hand: `research/opus-dei-prayerbook/catalog.json`
maps each book prayer to a practice id (and carries metadata for new ones), and
`links.tsv` joins translations the site files under different sections.

Likely **new** practices:
- *We Fly to Your Protection* (Sub tuum)
- *Stabat Mater*
- *Blessed Be Your Purity*
- *Prayers of St. Thomas Aquinas / St. Ambrose / St. Bonaventure*: check against
  `aquinas-before-communion` and `aquinas-after-communion` first
- *Universal Prayer* (Clement XI)
- *To Jesus Christ Crucified* (En ego)
- *Canticle of the Three Children*
- *O Good Cross*
- *Blessing for a Journey*
- *Preces*: the Work's own, and the most Opus-Dei-specific item in the book
- *Confiteor*, *Athanasian Creed*, *Angelic Trisagion*
- the hymns: *Ubi caritas, Pax in caelo, Rorate, Te Ioseph, Media vita, Ave verum,
  Ave maris stella, Benedictus, Oremus pro Pontifice, Lux aeterna, Vexilla Regis,
  Iesu dulcis memoria*
- *Responsory for the Dead*

### 4. Emit / patch practices

A script (`scripts/import-opus-dei-prayerbook.py`) reads `prayerbook.json` and `catalog.json`:

- **Existing practice:** add every language key that's missing (`la`, `es`, `it`, …).
  Never overwrite en/pt-BR silently; print a diff for review instead.
- **New practice:** write a `manifest.json` in the house shape (`form: "prayer"`,
  inline flow, `flowMode: "scroll"`, `completion: "flow-end"`, categories and tags,
  a `source` naming the Pocket Prayer Book and its URL). The inline text carries every
  language the book has. Aligned blocks become one inline `prayer` with `\n`-joined
  lines, or `response` verses for ℣/℟. `.rb` becomes `rubric`, and a `.pq` season
  becomes a `select` on liturgical season.
- The script writes descriptions, history and howToPray as TODO stubs. Those get
  written by hand per practice, never auto-generated from the site.
- `pnpm validate-flows` and `pnpm build:corpus`.
- The engine types only `en-US | pt-BR | la` (`packages/content-engine/src/types.ts`).
  Extra keys already exist in data (`intimita-divina` has `it`), but check that
  `validate-flows` and `build:corpus` pass them through rather than rejecting or
  stripping them. Widen the type only if something breaks.

### 5. Collection

Add a `collection/opus-dei-prayerbook` ("Pocket Prayer Book" / "Devocionário") whose
12 sections mirror the book's and reference both existing and new practices. It could
also be new sections in `collection/opus-dei`, but that collection is ordered by the
plan of life rather than the book, so a separate collection is cleaner.

### 6. Verify

- Open a sample in the iOS simulator (maestro) with `pnpm hearth`, one practice per
  block kind: Sub tuum (plain), Canticle of the Three Children (numbered verses +
  antiphon + Easter alleluia), Preces (℣/℟ + rubrics).
- Check that the Latin column shows up wherever the reader offers Latin.

## Open questions

- Doctrine was imported as one practice, `formulas-of-catholic-doctrine`.
- Prayer Cards: prayers for the causes of beatification. Is a cause's prayer a practice
  like any other, even though its text changes as the cause advances?
