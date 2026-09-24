import { describe, expect, test } from 'vitest'

import { breakWidth, fitToPlatform, type MeasureFit } from '../measureFit'

/**
 * Drives the loop the way `ReadingParagraph` does on device — break at the
 * measure `breakWidth` gives, let a platform report its line count, feed that
 * back through `fitToPlatform` — until the fit stops changing. `platformLines`
 * stands in for the platform's own shaper: how many lines it lays the model's
 * lines out on at a given break width.
 */
function settle({
  key = 'k',
  widthPx = 300,
  fontSizePx = 22,
  modelLines = 5,
  platformLines,
}: {
  key?: string
  widthPx?: number
  fontSizePx?: number
  modelLines?: number
  platformLines: (breakPx: number) => number
}) {
  let fit: MeasureFit | undefined
  const tried: number[] = []
  for (let attempt = 0; attempt < 20; attempt++) {
    const px = breakWidth(fit, key, widthPx, fontSizePx)
    if (px === undefined) return { tried, width: undefined, fit }
    tried.push(px)
    const next = fitToPlatform(fit, key, platformLines(px), modelLines)
    if (next === fit) return { tried, width: px, fit }
    fit = next
  }
  throw new Error('fit never settled')
}

describe('fitting a justified measure to the platform', () => {
  // The platform measures at the width it is offered and draws in a frame
  // rounded to the pixel grid; a line that fits at measure and not at draw is
  // re-broken at draw only. One device pixel is the platform's share of the
  // headroom; one CSS pixel covers what the shaper snaps.
  test('breaks a device pixel plus a CSS pixel short of the measure', () => {
    const px = breakWidth(undefined, 'k', 300, 22) as number
    expect(300 - px).toBeGreaterThan(1)
    expect(300 - px).toBeLessThanOrEqual(2)
  })

  test('leaves a paragraph the platform agrees with alone', () => {
    const { tried, width } = settle({ platformLines: () => 5 })
    expect(tried).toHaveLength(1)
    expect(width).toBe(tried[0])
  })

  test('narrows a pixel at a time until the platform agrees', () => {
    const first = breakWidth(undefined, 'k', 300, 22) as number
    // The platform only fits the model's lines two pixels narrower.
    const { tried, width } = settle({ platformLines: (px) => (px <= first - 2 ? 5 : 6) })
    expect(tried).toEqual([first, first - 1, first - 2])
    expect(width).toBe(first - 2)
  })

  // A tenth of an em is past any disagreement a shaper has shown; beyond it
  // the paragraph is being drawn in a face the model doesn't describe.
  test('gives up and goes ragged when no narrowing satisfies the platform', () => {
    const small = settle({ fontSizePx: 22, platformLines: () => 6 })
    expect(small.width).toBeUndefined()
    expect(small.tried).toHaveLength(3)
    expect(settle({ fontSizePx: 32, platformLines: () => 6 }).tried).toHaveLength(4)
  })

  test('starts again from zero for a different model', () => {
    const fit = fitToPlatform(undefined, 'a', 6, 5)
    expect(fit).toEqual({ key: 'a', shrinkPx: 1 })
    // New text, measure or face: the old correction belonged to another layout.
    expect(breakWidth(fit, 'b', 300, 22)).toBe(breakWidth(undefined, 'b', 300, 22))
    expect(fitToPlatform(fit, 'b', 6, 5)).toEqual({ key: 'b', shrinkPx: 1 })
  })

  test('ignores a report before there is a model to compare with', () => {
    const fit = { key: 'a', shrinkPx: 1 }
    expect(fitToPlatform(fit, 'a', 3, 0)).toBe(fit)
    expect(fitToPlatform(fit, 'a', 4, 5)).toBe(fit)
  })
})
