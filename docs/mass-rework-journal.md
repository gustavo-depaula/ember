# Mass Rework — Working Journal

Daily log of the audit-improve-commit loop on the `mass-rework` branch.
Each entry: what I noticed, what I changed, what surprised me. Written so
the next person (or me on a different day) can pick up cold.

Read top-to-bottom for chronology. Newest entries at the bottom.

---

## Day 0 — Branching off `main`

State at branch point: many in-flight Mass changes already on disk but
uncommitted. Decision: commit the existing work in 4–5 logical bundles
(vendor + engine + app + content + tooling), then enter a tight loop —
audit gap → plan → implement → test → simplify → atomic commit → journal
entry — for the rest of the night.

### What's already done before this branch (uncommitted)

**Engine (`packages/content-engine`):**
- DataSource registry (`data-sources.ts`) — practices declare `load: [{ as, source }]`; engine looks the source up by name and calls `source.load(args, ctx)`. `ctx` exposes `fetchAsset(libraryId, path)` / `fetchOwnAsset(path)` so sources read from installed libraries (no remote fetches).
- Path-aware access in `select.on` / `select.from` / `repeat.from` / template substitution (e.g. `celebration.primary.title`).
- New primitives: `choice-rich-text` (per-slot picker over a celebration's primary + alternates with citation/intro/conclusion/response slots), `liturgical-color` (color swatch + label), `call` (parameterized fragment invocation), `select.from` (dynamic-options select), heading `from` (read a LocalizedText from a path).
- Cycle template substitution (`readings.{{day.cycle}}.firstReading`) with fallback to `readings.default.<slot>` when the cycle path is empty.
- `liturgical-day` data source migrated out of the engine into the registry — `meditacoes-ligorio` was the first real consumer.

**Mass-of package (`packages/mass-of`):**
- `enumerateCelebrations(date)` — returns 1+ celebrations per day. Multi-celebration days handled: Holy Thursday (chrism + lords-supper), Christmas (vigil/night/dawn/day), Holy Family Sunday, Mary Mother of God, Epiphany, Baptism of the Lord, Trinity, Corpus Christi (universal Thu + Brazil's transferred Sun), Sacred Heart, Christ the King.
- Late-Advent + Christmas Octave + Epiphany season day-NNN mapping (Dec 17 – Jan 13).
- `pickCycle(date)` for Year A/B/C Sundays + Year I/II weekdays.
- Sanctoral fold-in: tempore + saint as alternates of each other.
- Precedence: solemnities suppress tempore everywhere; feasts suppress tempore weekdays; memorials are fully suppressed on Sundays (saint omitted entirely).
- Easter Octave + Holy Week + Christmas Octave suppress sanctoral entirely.

**Mass flow (`content/libraries/base/practices/mass/flow.json`):**
- OF rite branch fully rewritten: top-level celebration picker (`select from: 'day.celebrations'`), per-rite dispatch (`select on: celebration.rite`), per-slot pickers (`choice-rich-text`).
- Reading slots use `readings.{{day.cycle}}.<slot>` for cycle-aware Sunday rendering.
- Final blessing season-aware via `select on: celebration.primary.season` — Lent doesn't show the Christmas blessing.
- Sequence dispatch (Vítima Pascal on Easter Sunday, Veni Sancte Spiritus on Pentecost) inserted after secondReading, silent on weekdays.
- All five paschal prefaces selectable via per-alternative chip toggle (Páscoa I…V).
- Liturgical color swatch + celebration title surface in the body.
- 11 V/R "Lord be with you" exchanges replaced with a `call` to a single fragment.

**App rewiring:**
- `useGospelOfTheDay` hook reading from the mass-of source (replaced the runtime `evangelizo`/`liturgia-diaria` fetchers — `apps/app/src/lib/mass-propers/of/` deleted).
- `useProperForSlot` hook narrowed to EF only.
- `ChoiceRichTextBlock` + `LiturgicalColorBlock` components.
- `LibraryManager.loadInstalledLibraries` drops stale install records on boot so a missing IDB content auto-recovers via the seed path.

**Content tooling:**
- `scripts/build-ember-extra-pray.sh` clones a pinned ember-extra commit and `cp -R`'s the `data/` tree into `content/libraries/base/of/` (vendored, not a submodule).
- `scripts/extract-solemn-blessings.py` parses the giant Bendiciones blob into a structured-options JSON.
- `scripts/splice-blessings.py` season-aware-wraps the blessings into the Mass flow.
- `scripts/dedupe-heading-chip.py` removes redundant heading-above-chip-label duplications.
- `scripts/add-greeting-macro.py` factors the Lord-be-with-you V/R into a fragment.
- `scripts/add-sequence.py` inserts the Sequence dispatch.
- `scripts/validate-flows.ts` validates every flow.json + manifest.json against the engine's primitive set.

### Bugs caught during the audit phase (already fixed)

- **Preface double-prefix bug.** `hydratePreface` produced paths like
  `library/preface/preface.pf016.json` because ember-extra's `prefaceRef`
  field already includes the `preface.` prefix and my code prepended it
  again. Every Mass since the ember-extra integration day-1 silently
  rendered with NO preface body — the dialogue jumped straight to the
  Sanctus. Fixed; now `prefaceRef` is fed directly to `formularyPath`,
  with a fallback for the bare-form fixtures used in tests.
- **Multiple prefaces dropped.** Even with the bug above fixed, I was
  only rendering the proper preface — the celebration's
  `alternativeRefs` list was being ignored. Real problem because Easter
  weekdays expose all 5 paschal prefaces. Now `hydratePreface` fetches
  proper + alternatives and stuffs them into a single `alternatives[]`
  array; each entry carries its own `label` ("Páscoa I" / "Páscoa II"
  derived from the title). Engine's choice-rich-text alternative
  handling now picks them up as separate chip options.
- **Silent select dispatch falling back to options[0].** `select on:`
  with a value matching no option id was returning the first option
  instead of falling through to `default`. Caused the Easter Sunday
  sequence to render on every Easter weekday. Fixed.
- **Sunday OT readings empty.** Slot path `readings.default.firstReading`
  doesn't exist on Sundays — they ship under `readings.A/B/C`. Added
  cycle-template substitution + `default` fallback in the engine.
- **Stale install records on web.** When the IDB was wiped but SQL
  retained an `installed_books` row, the boot path threw and the user
  got a stuck blank page. Fixed: `loadInstalledLibraries` drops the
  stale row and lets the seed-from-registry path run on the next reload.

### Open known gaps (deferred to the loop)

- Asperges (Sprinkling Rite) — alternative to Penitential Act on Sundays.
- Antiphon citations sometimes missing in ember-extra (data, not code).
- Ferial title formatting: "Quinta semana Terça-feira" → "Terça-feira da V Semana da Páscoa".

### UX ideas the user has surfaced

- Enhanced preface / EP picker as horizontal cards showing the opening
  excerpt of each — easier to identify which one the priest is praying.
- Reading experience could be denser: collapsible sections for non-
  essential parts (long Eucharistic Prayer narratives, lengthy rubrics).
- General: the page is long. Anything we can do to make the praying flow
  feel less like scrolling and more like turning a page.

---

## Iteration 1 — Card-style preface + EP picker

**Audit observation.** The preface chip toggle was just labels ("Páscoa
I", "Páscoa II", …); during Mass the user can't quickly recognize which
preface the priest is praying. The Eucharistic Prayer chips suffer the
same: "OE I / II / III / IV" with no discriminator.

**Plan.** Add a `pickerStyle: 'chips' | 'cards'` knob to `options` and
`choice-rich-text` primitives. Cards = vertical list, each card =
title + 2-line italic excerpt. Apply to preface and Eucharistic Prayer.

**Trap I walked into and the user caught.** First version derived the
excerpt from the body's first non-rubric line — useless because all
five paschal prefaces open with "Na verdade, é digno e justo," which
is the universal liturgical incipit. The Páscoa II–V cards all read
identically.

**Pivot.** The differentiator is the *subtitle* of each preface title
("O mistério pascal", "A vida nova em Cristo", "O Cristo vivo, que
sempre intercede por nós", etc.) — it's *exactly* what I was throwing
away when I abbreviated the title from "PREFÁCIO DA PÁSCOA I O
mistério pascal" → "Páscoa I". `hydratePreface` now extracts both: the
abbreviated label AND the subtitle as `excerpt`. Plumbed through
SlotDataShape → ExtractedSlot → RenderedChoiceRichText option →
OptionCard. Cards now read "Páscoa I — O mistério pascal" etc.

**Simplify pass findings (applied).** Three review agents flagged
duplicated CardPicker JSX between OptionsBlock and ChoiceRichTextBlock
(extracted shared `OptionCard` component) and a stringly-typed
`'chips' | 'cards'` repeated 6+ times (added `PickerStyle` type alias
exported from content-engine). One efficiency finding (excerpt
recomputed every render in ChoiceRichTextBlock) became a non-issue
once the excerpt comes from the engine via `data.excerpt` rather than
being derived in the renderer — the helper is now gone entirely.

**Bumped to library 1.4.3.**
---

## Iteration 2 (interrupted) — ember-extra removed day-NNN IDs

User pushed a new commit upstream (`0de123f`) that replaces the cryptic
`day-NNN.weekday.json` filenames I'd been mapping to with canonical
liturgical slugs:

- `day-117` … `day-124.<wd>` → `tempore.advent.dec-17` … `dec-24`
- `day-129/130/131` → `dec-29/30/31`
- `day-140.sunday` → `holy-family`
- `day-141.monday` → `mary-mother-of-god`
- `day-160.sunday` → `second-sunday-after-christmas`
- `day-170.sunday` → `epiphany`
- `day-171.monday … day-176.saturday` → `after-epiphany.<weekday>`
- `day-810.sunday` → `baptism-of-the-lord`

Bumped the submodule pointer; rewrote `christmasSeasonIdFor()` and the
Dec 24 special block in `temporeIdsForDate()`. Tests trimmed (no more
"weekday folder is fixed by date" weirdness to assert). 51 tests pass.

The earlier paragraph in this journal documenting the day-NNN scheme
is now historical context; the live calendar code uses the new slugs.

**Bumped to library 1.4.4.**

Resuming planned iteration 2 (collapsible primitive for silent /
explanatory sections) next.

---

## Iteration 2 — Collapsible primitive

**Audit observation.** Preparação das Oferendas dumps six silent priest
prayers + accompanying rubrics inline. The user only audibly hears
"Orai, irmãos e irmãs… / Receba o Senhor por tuas mãos…"; everything
else is the priest praying quietly while the offertory chant happens.
Inline rendering of all that is a wall of text that interrupts the
reading flow.

**Plan.** Add a `collapsible` flow primitive: title visible, body
hidden by default, expandable on tap. Wrap the six silent prayers in
a single collapsible "Orações em silêncio". Audible Orate-fratres
exchange stays visible.

**Implementation.** New `collapsible` section type in types.ts +
engine resolver case. New `CollapsibleBlock` renderer (chevron-right
collapsed, chevron-down expanded, uppercase $1 label matching the
existing LiturgicalColorBlock typography family). Splice script
`scripts/wrap-silent-offerings.py` walks the flow and wraps everything
between the `Preparação das Oferendas` subheading and the Orate-fratres
prayer.

**Simplify findings (applied).** Reuse agent flagged 3 collapsible-ish
components elsewhere in the codebase (CollapsiblePrayer, the inner
CollapsibleSection in PracticeTeachingContent, plus my new
CollapsibleBlock) — different visual roles, not pure duplicates, but
worth a `useCollapsible` hook in a follow-up. Quality agent flagged
that the Python splice script mixes in-place mutation with a
"found?" return — added a header comment marking it one-shot.
Efficiency agent noted the chevron `Icon = open ? ChevronDown : ChevronRight`
const swap forces a remount per toggle — inlined the JSX choice
instead. Functional setter `setOpen((o) => !o)` for the toggle.

**Bumped to library 1.4.5.**

---

## Iteration 3 — Celebration banner

**Audit observation.** The day's identity (title + liturgical color)
rendered as two stacked elements: a small heading "Quinta semana
Terça-feira", then a 12px swatch "BRANCA" line, then the Visualização
chip. Doesn't read like a missal page; reads like a metadata stack.

**Plan.** A `celebration-banner` primitive that fuses title + color
+ rank + cycle into one missal-style block: 14px color dot inline
with a large burgundy title, plus a small uppercase subtitle line
("SOLENIDADE · ANO B").

**Implementation.** New flow primitive + RenderedSection variant.
Engine resolver reads `celebration.primary` (title + liturgicalColor
+ rank) and `day.cycle`, builds a localized subtitle (Solemnity /
Feast / Memorial / Optional Memorial in en-US + pt-BR; "Year A/B/C"
or "I/II"). New `CelebrationBanner` renderer just paints the
BilingualText — no language logic.

**Simplify pass findings (applied).**

- The 7-color hex map + white/rose/gold ring rule was duplicated
  between `LiturgicalColorBlock` and the banner. Extracted shared
  `LiturgicalColorDot` component (size prop, default 12). Both call
  sites now render via the dot.
- `RANK_LABEL` was hardcoded pt-BR in the renderer — moved to the
  engine alongside `LITURGICAL_COLOR_LABELS`, returning BilingualText.
  Renderer is now language-agnostic.
- Cycle regex tightened from `/^(A|B|C|I{1,3})$/` (over-accepted
  impossible "III") to `/^(A|B|C|I|II)$/`.

**Bumped to library 1.4.6.**

---

## Iteration 4 — Section-marker primitive

**Audit observation.** Reading the page top-to-bottom, the four major
divisions of the Mass (Initial Rites, Liturgy of the Word, Liturgy of
the Eucharist, Concluding Rites) had the same visual weight as
sub-section headings like Glória, Credo, Antífona da Comunhão. No
typographic anchor for the macro structure.

**Plan.** A new `section-marker` primitive. Centered uppercase title
flanked by horizontal rules. Generous vertical margin. Sibling to
`heading`, not a `level` prop on it — the renders diverge enough that
forcing every consumer through a switch in SectionBlock is uglier than
two parallel cases.

**Implementation.** Engine resolver is one line. Renderer is ~25 lines
of Tamagui (XStack with two `flex={1}` View dividers + a centered
`flexShrink={0}` text). One inline Python rewrite promoted 14 heading
sections (the major headings appear in three views — Missa Completa,
Próprios, Leituras — hence 14 not 4).

**Simplify pass caught a real bug.** I'd accidentally added the
`case 'section-marker'` resolver case twice in `engine.ts` (the first
one was reached, the second was unreachable). The reuse-review agent
spotted it. Deduped.

**Bumped to library 1.4.7.**

---

## Iteration 5 — Cards expand inline + Credo

**Audit observation.** Tagged the Credo widget `pickerStyle: cards`,
reloaded, and immediately saw the wart: the selected card showed the
body's first line as a truncated excerpt AND the full body rendered
beneath the picker. Same opening line ("Creio em um só Deus, Pai
todo-poderoso…") appearing twice.

**Plan.** Selected card *expands inline* with the full body replacing
the excerpt. Other cards stay title + excerpt. Picker section below
disappears (body lives inside the picked card).

**Implementation.** `OptionCard` accepts `children?: ReactNode`; if
the card is selected AND children are passed, children render inside
the card (in a YStack with a small marginTop). Excerpt only shows
when no expanded body is provided.

`OptionsBlock`: cards branch passes `selected ? sections : null` per
card. Chips branch wrapped in a fragment so the chip row + body
sequence is unchanged.

`ChoiceRichTextBlock`: extracted `renderBody(opt)` helper (citation
+ introduction + body + conclusion + response). Cards branch invokes
it as the selected card's children; chips branch invokes it once
below the chip row.

**Simplify findings (applied).** Renamed `option` → `opt` in the
chips branch of ChoiceRichTextBlock for consistency with the rest
of the file. Other findings (`<>` necessity, `!!children` looseness)
were correct as-is.

**Bumped to library 1.4.8.**

---

## Iteration 6 — More cards (Memorial Acclamation + Penitential Act)

Tiny iteration. Both widgets had useless chip labels (just "A B C"
or "Forma A/B/C") that gave the user nothing to choose between
without expanding each. With pickerStyle: cards now applied:
- Memorial Acclamation cards show "Mistério da fé!" / "Mistério da
  fé e do amor!" / "Mistério da fé para a salvação do mundo!" as
  the discriminator.
- Penitential Act cards show the opening line of each form
  (Confiteor / Senhor, tende piedade / Tropos).

Library 1.4.9. Pure data change — no code touched.

---

## Iteration 7 — Sentence-level paragraphs for readings

**Audit observation.** Today's first reading is 1147 chars in a single
ember-extra paragraph. The renderer faithfully showed it as one
continuous wall of text. Hard to read prayerfully.

**Plan.** When a plain-text body is over a threshold (240 chars) AND
has no `\n` breaks, fall back to sentence-level chunking: split on
sentence-end punctuation (`. ! ? … ” " ' »` + ASCII `...`) followed by
whitespace and an uppercase letter / open quote. Each sentence
becomes its own RichTextLine, rendered as its own paragraph.

**Trade-offs.**
- Threshold: 240 chars. Most prayers (Collects, antiphons) fit under
  it; long readings exceed it. Tested via two unit tests.
- False positives: abbreviations ("S. Paulo", "Cf. Mt", "Pe. João")
  split mid-name. Documented in the helper. Cost accepted.
- Doesn't run when ember-extra ships typed-segment `lines` (the
  rich-text path) or when there are real `\n` breaks already.

Verified in Chrome: today's first reading + gospel now read as a
sequence of clean paragraphs.

---

## Iteration 8 — Liturgical-color tint on section markers

**Audit observation.** Day's color was visible only as a 14px dot in
the banner. Section markers used a neutral border color, visually
detached from the day's identity.

**Plan.** Tint the section-marker flanking rules in the day's
liturgical color, low opacity. White / rose / gold fall back to
the default border color (too pale on light backgrounds).

**Implementation.** `section-marker` gains `colorFrom?: string`
(dotted path); resolver looks up the color and emits it on the
rendered section. Renderer applies COLOR_HEX at 0.6 opacity. Inline
Python pass tagged 14 section-markers in flow.json with
`colorFrom: "celebration.primary.liturgicalColor"`.

Today is white, so visually identical. Red days (martyrs), green
(OT), violet (Lent/Advent), black (All Souls) will now thread the
liturgical color through the page's section breaks.

**Bumped to library 1.5.0.**

---
