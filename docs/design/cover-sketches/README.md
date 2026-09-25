# Cover & tile sketches

HTML mocks for generated covers — what a book, practice, or prayer shows when it
has no art (today: a single versal letter on a jewel tone). They use the app's
real tones (`apps/app/src/features/explore/bgColor.ts`) and fonts (EB Garamond,
Cinzel, UnifrakturMaguntia) loaded straight from `node_modules`, so open them
from this folder in a browser after `pnpm install`.

Screenshots were taken with headless Chrome at 2x:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1180,1100 \
  --virtual-time-budget=3000 --screenshot=out.png "file://$PWD/formats.html?f=classic,gilt"
```

## Books — `formats.html`, `sketch.html`, `closeup.html`

Bound volumes, 2:3, with a left binding reflex (dark spine edge → crease → light
streak). Each carries title, author, a cross, and the "EMBER LIBRARY" imprint.

**Decided: keep all 8 formats, binding on.** Flat versions (`?flat=1`,
`formats-*-flat.png`) were rejected.

| Format | Intended for |
|---|---|
| Classic | default |
| Gilt | Marian / devotional classics |
| Library label | catechisms, formation |
| Quarter leather | Church Fathers, theology |
| Arch | mystics, contemplatives |
| Watermark | modern authors |
| Banded | anthologies, reference |
| Missal | liturgical texts |

Proposed pick order: manifest override → collection/genre → hash of the id
(like the tone). Below ~80pt, fall back to Classic.

## Practices — `practices.html`

Square, color-led (a real block of the jewel tone), with icon and cadence
("Daily · 20 min").

**Kept:** Colored holy card (R), Vigil (D), Illuminated leaf (O), Ordo (P).
**Now:** Colored holy card wherever practice tiles exist today.
**Later:** Illuminated leaf as the header while praying; Vigil / Ordo by context
(the practice due now / the day's schedule). The idea is that the style follows
the *context* a practice is shown in, not the practice itself.

Rejected: Medallion (A), Niche (B, not carried forward), Ribbon as a style (C —
maybe as a Plan-of-Life marker), Stained glass (E), Scapular (Q), and the
architectural set in `trad-*.png` (Quatrefoil, Gloria, Antependium, Orphrey,
Triptych, Book of Hours) — wrong brief; the wanted vibe is printed devotional
objects, like the prayer cards.

## Prayers — `practices.html`

Square, cream grounds with color only in thin details — the inverse of practices.

**Kept:** Holy card (F) and Breviary page (G). Wax seal (H) dropped.

## Collections — `collections.html`, `coll-*.png`

Square, like the painted collection tiles; painted collections keep their art.
The object says what kind of gathering it is.

**Kept:** Boxed set (L1) and Slipcase (L2) for library collections, Packet (D1)
for devotional ones, Ordo (R1) for plans, weekdays and seasons.
**Kept for later, not chosen:** Ex libris (L3), Bundle (D2), Tucked missal (D3),
Ribbons (R2), Horologium (R3).

## Articles (chapters) — `collections.html`

Portrait 10:13, between the square cards and the tall books. Tract (A1) vs
Pamphlet (A3) still undecided — compare `coll-context-tract.png` and
`coll-context-pamph.png`. Periodical (A2) and Title page (A4) kept for later.

## Query params

- `formats.html?f=classic,gilt,…&flat=1`
- `practices.html?f=<keys>&mixed=1&family=1` — keys: `medal niche ribbon vigil glass quatre gloria frontal orphrey trip hours leaf ordo scap stock holy page seal`
- `collections.html?s=library,devotion,rule,articles,context` — context picks with `&l=boxed&d=packet&r=ordo&a=pamph` (collection candidates L1–L3 / D1–D3 / R1–R3, article candidates A1–A4; undecided)
