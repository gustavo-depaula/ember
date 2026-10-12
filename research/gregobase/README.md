# GregoBase across Ember

**Question.** GregoBase holds some 18,700 chant scores under CC0. Beyond a
library to browse (the Kyriale, shipped), where else in Ember does that data
belong, and by what mechanism does a score get to the text it sets?

**Where things stand.** Three mechanisms are built and running on a branch;
one more is measured and not built. The numbers below are reproducible with the
scripts here.

## The idea everything rests on: link by the words

A score and the text it sets are two editions of the same words — the
Gradual's and the Missal's. Reduce both to what every edition agrees on
(letters only, no accents, `j`→`i`, `æ`→`e`, …) and a text finds its score by
comparing openings. No table of days, no ids to maintain: the link holds for
any day, any book and any screen that shows that text.

`scripts/chant_link.py` is that method. Its results, by what it was pointed at:

| Text of | Texts | With a score | |
|---|---|---|---|
| 1962 Missal: Introits | 188 | 184 | 98% |
| Offertories | 153 | 149 | 97% |
| Communions | 184 | 181 | 98% |
| Graduals | 181 | 163 | 90% |
| Alleluias | 218 | 206 | 94% |
| Tracts | 69 | 60 | 87% |
| Sequences | 5 | 5 | 100% |
| **Missal, all** | **998** | **948** | **95%** (`link_mass.py`, any book) |
| 1960 Breviary: antiphons | 1,975 | 1,646 | 83% |
| hymns | 246 | 166 | 67% |
| responsories | 988 | 756 | 77% |
| short responsories | 133 | 110 | 83% |
| **Breviary, all** | **3,342** | **2,678** | **80%** (`link_office.py`) |
| Prayers in `content/practices` | — | 68 | whole-text match (`link_practices.py`) |

What matters to someone at Mass is the day, not the text. Assembling every
Mass of a liturgical year (Advent 2026 – Advent 2027) with the app's own engine
and looking each sung proper up in the built index, with **Roman books only**:

| | found |
|---|---|
| Introit | 364 / 369 |
| Gradual | 319 / 321 |
| Alleluia | 257 / 258 |
| Tract or sequence | 47 / 47 |
| Offertory | 360 / 369 |
| Communion | 356 / 369 |
| **Days with every sung proper** | **347 / 371** |

Three things the first runs got wrong, each found by looking at the output:

- **The Commons of the Saints are not in the Missal's folder.** Divinum Officium
  keeps them with the Breviary's (`horas/Latin/Commune`). Without them a
  quarter of all days missed their Introit.
- **Same words, another rite.** Where the Roman Gradual lacked a text the
  linker took the Dominican Gradual's — a different melody. The books are now
  a closed list (Graduale Romanum 1961, Liber Usualis, GR 1908, GR 1974, the
  Offertoriale), and a text with no Roman score has none.
- **"Triplex" transcriptions.** Some GregoBase scores carry St Gall neumes after
  a `|` in each note group. The engraver reads those as notes and draws
  nonsense. They are filtered out (`plain_gabc`).

False positives: of 1,104 linked sections, 8 scored under 0.90, and all 8 are
the same chant with a variant wording (`quod in aure auditis` / `… dicit
Dominus`) or another saint's name in a shared melody (*Gaudeamus*).

## How to ship thousands of scores (`pack.py`)

| Set | Scores | GABC | As catalog items | As bundles + index |
|---|---|---|---|---|
| Mass propers | 906 | 0.57 MB | catalog +156 KB | catalog +2 KB, index 31 KB |
| Breviary | 2,575 | 1.33 MB | catalog +454 KB | catalog +5 KB, index 98 KB |
| All of GregoBase | 18,712 | 11.5 MB | catalog +3.3 MB | catalog +34 KB, index 724 KB |

The catalog (≈750 KB) is read at every launch, so a score that nobody browses
to must not be in it. Hence two tiers:

- **Library** — a score in a chant book (`content/chants/`, one catalog item
  each): browsable, searchable, addressable as `chant/<id>`.
- **Propers** — a score reached only through the text it sets
  (`content/chant-propers/`): bundled 48 to a blob by genre, behind one
  `chant-index` blob that maps a text's folded opening to `<bundle>/<chant>`.
  A Mass opens the index and five or six bundles.

## What is built (branch, not main)

1. **The Latin Mass sings.** Each sung proper is followed by one folded line —
   `CHANT · Omnia quae fecisti · Mode III` — that opens in place onto the
   score. Found at runtime by text (`features/chant/propers.ts`), from the
   index the corpus build writes. The Python that builds the index and the
   TypeScript that queries it are held together by 116 shared vectors
   (`scripts/chant-link-vectors.json`).
2. **The ordinary follows the calendar.** The Kyrie, Gloria, Sanctus and Credo
   of the Mass carry the chant of the day's Mass of the Kyriale, chosen by the
   Kyriale's own headings from the rank and season the 1962 calendar resolves
   (`features/chant/ordinary.ts`). Where the book offers several Masses for a
   kind of day, the first it prints is taken.
3. **Prayers carry their chant.** A `chant` flow node; 68 prayers already in the
   corpus got one, placed by `import-gregobase.py --prayers`, which matches a
   prayer to its score by the *whole* Latin text (so the Hail Mary does not
   find the offertory that only opens with its words). The 68 scores are a
   second book in the chant library, *Hymns and antiphons*.
4. **On the website, a folded chant is engraved in the browser** when opened,
   at the reader's own width (`apps/site/src/scripts/engrave.ts`): the page
   carries the GABC, not two pre-drawn SVGs, and the engraver is fetched on
   first use.
5. **Hear the melody** (website chant pages). `melodyOf` reads a score as the
   notes a voice sings — flats applied, dotted notes doubled, a breath at each
   bar — and the page sounds them with Web Audio.

Two ways a text gets its chant were tried side by side on purpose:

| | By its words (Mass) | By its flow (prayers) |
|---|---|---|
| Authoring | none | one node per prayer, written by the importer |
| Covers | anything that shows the text, any day | exactly the prayers that name it |
| Choice of melody | the importer's book ranking | explicit, reviewable in the diff |
| Fits | machine-assembled liturgy | hand-authored practices |

## Not built, and why

- **The Divine Office.** 80% of its chant is in GregoBase and the same index
  would serve it. Not imported: 920 of those scores are from the *Nocturnale
  Romanum* (2002), a modern edition whose 33 flagged chants suggest its status
  wants a look before 900 more ship; and the hours need a decision on where a
  score sits beside a psalm it is only the antiphon of.
- **The Ordinary Form.** The Graduale Romanum of 1974 is thin in GregoBase
  (≈300 scores) and the Missal's spoken antiphons often differ from the
  Gradual's sung ones, so text-linking will not carry it. It needs the *Ordo
  Cantus Missae* as a table.
- **Agnus Dei and Ite** of the day's ordinary: the Missal prints them inside
  larger sections with no head of their own to hang a chant line on.
- **Melody in the app.** `melodyOf` is shared code, but `expo-audio` is excluded
  from the native build, so playback there waits on a rebuild.

## Open questions for a human

- **The 68 melodies.** Each prayer took the plainest setting in the first parish
  book that has it (the simple tone of the *Salve Regina*, of the *Te Deum*).
  `practice-links.json` lists every alternative considered; the choice for the
  best-known ones deserves a singer's eye.
- **The ordinary's first-listed rule** gives Mass IV for every II class feast,
  never *De Angelis* (VIII). True to the book; possibly not to practice.
- **Wording.** A score's lyrics are the Gradual's and can differ by a word from
  the Missal text printed above it. That is how the books are.

## Files

- `gb.py` — the dump as records; `link_mass.py`, `link_office.py`,
  `link_practices.py` — the three linking runs and their `*-links.json`;
  `pack.py` — the shipping measurements.
- The method itself graduated to `scripts/chant_link.py`; the import to
  `scripts/import-gregobase.py` (`--propers`, `--prayers`, `--sync`).
