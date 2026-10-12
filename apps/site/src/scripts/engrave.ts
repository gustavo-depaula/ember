// Engraves a chant in the reader's browser, to the width it is read at.
//
// A page that only has a chant folded under a prayer does not carry its score
// as markup: it carries the GABC, and this module — the app's own layout, with
// its font tables — is fetched the first time a reader opens one. A phone and a
// desk then each get a score set for them, where a page built ahead of time
// has to guess a width.
import { layoutScore } from '@/features/chant/layoutScore'
import { scoreSvg } from '@/features/chant/scoreSvg'

let serial = 0

export function engrave(sheet: HTMLElement, gabc: string, label: string) {
  const idPrefix = `engraved-${++serial}-`
  let drawnAt = 0
  const draw = () => {
    const width = Math.floor(sheet.clientWidth)
    // Hidden, or a resize too small to move a line break.
    if (width < 120 || Math.abs(width - drawnAt) < 8) return
    drawnAt = width
    sheet.innerHTML = scoreSvg(layoutScore(gabc, { width, scale: width < 520 ? 1 : 1.15 }), {
      idPrefix,
      label,
    })
  }
  draw()
  new ResizeObserver(draw).observe(sheet)
}
