import { describe, expect, it } from 'vitest'

import { encodeRange, resolveAnchor } from '../highlightAnchor'

function makeDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument('t')
  doc.body.innerHTML = html
  return doc
}

function selectTextRange(
  doc: Document,
  startNode: Text,
  sOff: number,
  endNode: Text,
  eOff: number,
): Range {
  const r = doc.createRange()
  r.setStart(startNode, sOff)
  r.setEnd(endNode, eOff)
  return r
}

describe('highlightAnchor', () => {
  it('encodes + decodes a simple within-paragraph range', () => {
    const doc = makeDoc('<p>The quick brown fox.</p>')
    const p = doc.querySelector('p') as HTMLElement
    const text = p.firstChild as Text
    const range = selectTextRange(doc, text, 4, text, 9) // "quick"
    const anchor = encodeRange(doc.body, range)
    expect(anchor).toEqual({ startOffset: 4, endOffset: 9 })
    const round = resolveAnchor(doc, anchor)
    expect(round?.toString()).toBe('quick')
  })

  it('round-trips across multiple paragraphs', () => {
    const doc = makeDoc('<p>Hello</p><p>world</p>')
    const ps = doc.querySelectorAll('p')
    const t1 = ps[0].firstChild as Text
    const t2 = ps[1].firstChild as Text
    const range = selectTextRange(doc, t1, 2, t2, 3) // "llo" + "wor"
    const anchor = encodeRange(doc.body, range)
    expect(anchor).toEqual({ startOffset: 2, endOffset: 8 })
    const round = resolveAnchor(doc, anchor)
    expect(round?.toString()).toBe('llowor')
  })

  it('handles nested inline elements (em, strong)', () => {
    const doc = makeDoc('<p>Be <em>brave</em> and <strong>bold</strong>.</p>')
    // Plain text is "Be brave and bold." — 18 chars
    const anchor = { startOffset: 3, endOffset: 8 } // "brave"
    const round = resolveAnchor(doc, anchor)
    expect(round?.toString()).toBe('brave')
    // round-trip the round-tripped range
    const re = encodeRange(doc.body, round as Range)
    expect(re).toEqual(anchor)
  })

  it('returns undefined for an anchor past the end of the text', () => {
    const doc = makeDoc('<p>hi</p>')
    expect(resolveAnchor(doc, { startOffset: 99, endOffset: 100 })).toBeUndefined()
  })

  it('encodes a range that starts at the very beginning', () => {
    const doc = makeDoc('<p>Once upon a time</p>')
    const t = (doc.querySelector('p') as HTMLElement).firstChild as Text
    const r = selectTextRange(doc, t, 0, t, 4) // "Once"
    expect(encodeRange(doc.body, r)).toEqual({ startOffset: 0, endOffset: 4 })
  })

  it('round-trips through a deeply nested span tree', () => {
    const doc = makeDoc('<p><span><span>alpha </span>beta </span>gamma</p>')
    // plain text: "alpha beta gamma"
    const anchor = { startOffset: 6, endOffset: 10 } // "beta"
    const round = resolveAnchor(doc, anchor)
    expect(round?.toString()).toBe('beta')
  })
})
