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

## Iteration 9 — Prettify ferial titles

**Audit observation.** "Quinta semana Terça-feira" reads like raw
data. Sundays and OT weekdays in ember-extra are already well-formed
("QUINTO DOMINGO DA PÁSCOA", "Terça-feira da 29ª Semana do Tempo
Comum") — only Advent / Lent / Easter weekdays have the awkward form.

**Plan.** Rewrite at celebration-banner resolution. Detect the pattern
("<Ordinal> semana <Weekday>" pt-BR / "<Season> Season <Ordinal> Week
<Weekday>" en). Convert ordinal to Roman numeral. Render natural
phrasing per locale. Non-matching titles pass through.

**Implementation.** `prettifyFerialTitle()` in its own file
(`packages/content-engine/src/prettifyFerialTitle.ts`). Per-locale
`FERIAL_RULES` array — regex + ordinal map + season phrase map +
render fn. Engine.ts just imports and calls it. Self-contained
pure-string logic. Adding a third language = one new array entry.

**Simplify pass.** Reuse-review agent flagged the original two
parallel locale tables and suggested consolidating into
`FERIAL_RULES`. Same agent caught the `(out as Record<string,string>).en =`
cast — fixed by widening the helper's signature with a generic
`<T extends LocaleTitle>` and an internal `mutated` Record. Also
moved out of engine.ts (which is at 1700+ lines) into a sibling file.

**No library bump** — engine-only change, no flow.json or content
edits. Today now reads "Terça-feira da V Semana da Páscoa".

---

## Iteration 10 — Cards for Saudação + Despedida

Tiny data iteration. Greeting forms A/B/C didn't distinguish on chip
labels (A and B both start "A graça…"). Cards show the opening of
each. Dismissal forms similarly. Library 1.5.1.

---

## Iteration 11 — Dedupe heading-vs-chip-label, second pass

**Audit observation.** Clicked into the "Próprios" view to see what's
there. Found the heading-vs-chip-label duplication still present —
"Oração do Dia" heading immediately above an "Oração do dia"
choice-rich-text label, and "Segunda Leitura" heading above "Segunda
Leitura (Domingos e Solenidades)".

**Cause.** My earlier `dedupe-heading-chip.py` matched by exact pt-BR
equality, so a casing diff or a parenthetical suffix on the label
both kept the duplicate alive.

**Fix.** Widened the match to case-insensitive equality OR case-
insensitive prefix match. Re-ran. 6 more redundant headings removed.

Library 1.5.2.

---

## Iteration 12 — liturgical-color-scope (React Context)

**Audit observation.** SectionMarker tinted with the liturgical
color (from #53) but selected card borders still showed the default
gold accent — disconnected from the day's identity, especially loud
on red / violet days.

**Plan.** A `liturgical-color-scope` flow primitive that wraps a
body and propagates the resolved color via React Context to
descendants. SectionMarker + OptionCard fall back to context when
their own color is undefined, so the day's color threads through the
page transparently.

**Implementation.** New flow primitive (FlowSection + RenderedSection).
Engine resolver validates the color string and either emits a
wrapping section or passes children through unchanged (no scope
when color is unknown). New `LiturgicalColorContext` + provider in
`apps/app/src/components/prayer/`. SectionBlock dispatches the new
section by wrapping children in the provider. OptionCard reads context
for its selected border (saturated red/green/violet/black tint; pale
white/rose/gold falls back to default gold). SectionMarker similar.

`flow.json` wraps the OF rite body in a single scope reading from
`celebration.primary.liturgicalColor`.

Today is white — no visible change. Red / green / violet / black
days will subtly carry the color through every selected card border
and section-marker rule.

**Bumped to library 1.5.3.**

---

## Iteration 13 — Document Mass primitives in CONTRIBUTING

Caught up the contributor docs with the new primitives that landed
in iterations 1-12: celebration-banner, liturgical-color,
liturgical-color-scope, section-marker, collapsible, plus the
pickerStyle: 'cards' extension on choice-rich-text and options.

No code change.

---

## Iteration 14 — Asperges (Sprinkling Rite) on Sundays

The Penitential Act picker has three forms (A: Confiteor, B, C: Tropos)
but the Roman Missal allows a fourth on Sundays — bênção e aspersão da
água em memória do Batismo, especially during Easter — and we offered
no way for the user to follow it. Added as a 4th option card on the
existing pickerStyle: 'cards' picker.

Authored inline (`scripts/add-asperges.py`) from the Brazilian Roman
Missal (CNBB) rather than extracted from ember-extra's ordinario.json
because the source mixes intro rubrics, multiple alternative blessing
forms, an optional salt-blessing rite, and 10 alternative aspersion
antiphons that don't all belong in one card. The card authors a single
end-to-end path: priest's invitation → blessing prayer → aspersion
antiphon → final blessing → "this replaces the Penitential Act"
closing rubric.

The two aspersion antiphons (Asperges me from Ps 50 and Vidi aquam
from Ez 47) are wrapped in a `select on celebration.primary.season`
with `easter` → Vidi aquam, `default` → Asperges me. So the user only
sees the antiphon for the actual season, not both with rubric
disclaimers — same pattern the Final Blessing already uses for the
seasonal solemn blessings.

`/simplify` pass caught: (1) the script's 21-line docstring narrating
rationale belongs in the journal, not the file header — trimmed to
one line; (2) the season-aware antiphon split was the cleaner pattern
than rubric-tagged alternatives, applied; (3) one of the two opening
rubrics (the "after the greeting, the priest stands at his chair…"
prep rubric) was redundant once the priest's invitation prayer
followed immediately — dropped.

Library bumped to 1.5.4.

---

## Iteration 15 — EP IV / V preface duplication

Picked Eucharistic Prayer IV during Mass on a Sunday in Tempo Comum
and the user prays *two* prefaces back-to-back: first the day's
preface (rendered above the EP picker), then the Sanctus, then the EP
IV card expands and the missal-mandated rubric "EP IV has a fixed
Preface, may not be used with another" is followed by the EP IV
preface text and a "Holy, Holy, Holy (as above)" rubric back-
referencing a Sanctus already prayed. EP V (Brazilian, 4 variants)
has the same shape — each variant ships its own thematic preface.

Root cause was order: the outer flow rendered `dialogue → day-preface
→ Sanctus → EP options`, which works for EP I/II/III (which use the
day's preface) but never for EP IV/V (whose preface is intrinsic to
the EP itself).

Fix is structural — hoist the preface block into each EP card. New
fragments: `of-preface-dialogue` (the 4-line dialogue), `of-sanctus`
(the chant), `of-day-preface` (the picker), `of-ep-day-preface-head`
(bundles all three for the EPs that use the day's preface). Each EP
card emits the right shape:

- **EP I, II, III** → `call: of-ep-day-preface-head` then body
- **EP IV** → `call: of-preface-dialogue` then its inline preface
  text then `call: of-sanctus` then body (replaces the old "Holy,
  Holy, Holy (as above)" rubric)
- **EP V (a/b/c/d)** → outer card calls dialogue once, each variant
  emits its preface text + `call: of-sanctus` + body

The outer flow now ends with a single rubric pointing the user at the
EP picker below — "All stand. The Priest begins the Preface dialogue,
which belongs to the Eucharistic Prayer chosen below." — and the EP
options widget itself.

`/simplify` caught: (1) a dead `INLINE_PREFACE_EP_IDS` set that wasn't
referenced; (2) two redundant `new_sections` reassignments in the
rebuild loop; (3) an empty `elif of-ep5: pass` branch with narrating
comments — dropped; (4) **EP I/II/III each duplicated the same
3-call header** — extracted into the new `of-ep-day-preface-head`
fragment so each card now uses one call instead of three.

Library bumped to 1.5.5.

---
