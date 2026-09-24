import { PixelRatio } from 'react-native'

/**
 * How a justified paragraph's measure is fitted to the platform that draws it.
 *
 * The breaker places lines against the font tables; the platform then lays the
 * same text out with its own shaper and reports how many lines it used. When it
 * used more, a line the breaker placed did not fit — a contextual alternate the
 * tables cannot carry, a face rendered by something other than the file that
 * was measured. The paragraph is re-broken a pixel narrower, until the two
 * agree or the model is judged unable to describe this text and the paragraph
 * goes ragged. Ragged text is a lesser failure than a missing line.
 *
 * Two functions, one per half of that loop, so the loop itself can be driven
 * without a layout engine: `breakWidth` answers "what measure should the
 * breaker work to now", `fitToPlatform` takes what the platform reported.
 */

/**
 * How much narrower than its measure a paragraph is being set, and for which
 * model. `key` names what the model was built from — measure, size, face,
 * language, text — so a new one starts again from zero rather than inheriting a
 * correction that belonged to a different layout.
 */
export type MeasureFit = { key: string; shrinkPx: number }

/**
 * How far short of its container the breaker always places a line.
 *
 * The platform measures a `Text` at the width Yoga offers it, then draws it in
 * a frame Yoga has rounded to the pixel grid — up to half a device pixel
 * narrower. A line that fit at measure and does not fit at draw is re-broken
 * at draw only: the break lands on an empty line box (the newline that was
 * meant to end it), everything below shifts down, and the last line falls
 * outside the height the view was given — never laid out, its slot blank.
 * That is exactly one device pixel of headroom, and it is the whole of the
 * platform's share.
 *
 * The rest is the model's share. The tables carry advances, the f-ligatures
 * and GPOS pair kerning, so what they sum is what a shaper draws to within
 * the pairs the font applies contextually; measured against a real shaper
 * over 12 chapters × 7 faces × 5 sizes × 4 measures that residual stays under
 * a CSS pixel on a full line, so one CSS pixel is what is reserved for it.
 * Whatever exceeds both is caught by `fitToPlatform` — so the headroom only
 * has to cover the case the platform never reports.
 *
 * Two pixels on a 393-pt phone, uniformly, on every line: the right margin
 * moves in by less than a hair, and lines still meet it flush.
 */
const headroomPx = () => 1 / PixelRatio.get() + 1

/**
 * The most a paragraph's measure is narrowed, a pixel per attempt, before it
 * goes ragged. A tenth of an em is well past any disagreement a shaper has
 * shown; a paragraph that still needs more is being drawn in something other
 * than the face that was measured.
 */
const maxShrinkPx = (fontSizePx: number) => Math.max(2, Math.round(fontSizePx * 0.1))

/**
 * The measure the breaker should set this paragraph to, or `undefined` when
 * the fit has given up on it and it must render ragged.
 */
export function breakWidth(
  fit: MeasureFit | undefined,
  key: string,
  widthPx: number,
  fontSizePx: number,
): number | undefined {
  const shrinkPx = fit?.key === key ? fit.shrinkPx : 0
  if (shrinkPx > maxShrinkPx(fontSizePx)) return undefined
  return widthPx - headroomPx() - shrinkPx
}

/**
 * The platform has laid out the lines the model built for `key` and reports
 * how many it actually used. Returns `fit` itself when nothing needs to change,
 * so a state setter can skip the render. Fewer lines than the model cannot
 * happen: every model line ends in a newline the platform has to honour.
 */
export function fitToPlatform(
  fit: MeasureFit | undefined,
  key: string,
  platformLines: number,
  modelLines: number,
): MeasureFit | undefined {
  if (!modelLines || platformLines <= modelLines) return fit
  return { key, shrinkPx: (fit?.key === key ? fit.shrinkPx : 0) + 1 }
}
