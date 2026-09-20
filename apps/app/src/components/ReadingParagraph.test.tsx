import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config } from '@/config/tamagui.config'
import type { ProseBlock, ProseInline } from '@/content/primitives'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { ProducerHtmlBlock } from './include/ProducerHtmlBlock'
import { VersesBlock } from './VersesBlock'

// jsdom measures every element as 0×0, and a zero measure is exactly what makes
// the justifier decline. Giving the layout a real width is what lets these
// exercise the justified render path rather than only its fallback.
const measuredWidth = 320
const realRect = Element.prototype.getBoundingClientRect

function measurable() {
  Element.prototype.getBoundingClientRect = () =>
    ({
      width: measuredWidth,
      height: 40,
      top: 0,
      left: 0,
      right: measuredWidth,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    }) as DOMRect
}

beforeEach(() => usePreferencesStore.setState({ textAlign: 'justify' }))
afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect
  cleanup()
  usePreferencesStore.setState({ textAlign: 'justify' })
})

const wrap = (ui: ReactNode) =>
  render(
    <TamaguiProvider config={config} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
  )

// Tamagui compiles style props to atomic classes, so what a block asked the
// platform for is readable only off the class list.
const alignOf = (el: Element) => el.className.match(/_textAlign-(\w+)/)?.[1] ?? 'unset'

const paragraph = (inline: ProseInline[]) => [{ kind: 'paragraph', inline }] as ProseBlock[]

const verse = (text: string) => (
  <VersesBlock type="verses" style="numbered" items={[{ num: 1, text: { primary: text } }]} />
)

const long =
  'In principio erat Verbum et Verbum erat apud Deum et Deus erat Verbum hoc erat in principio apud Deum.'

// Breaks inside "intende" at this measure, which is what makes it useful here.
const hyphenating = 'Deus in adiutorium meum intende Domine ad adiuvandum me festina.'

describe('reading surfaces hand their line breaking to the justifier', () => {
  it('never asks the platform to justify', () => {
    const { container } = wrap(verse(long))
    expect(alignOf(container.querySelector('[accessibilitylabel]') as Element)).toBe('left')
  })

  it('breaks a measured paragraph into lines with its own word spacing', () => {
    measurable()
    const { container } = wrap(verse(long))
    const block = container.querySelector('[accessibilitylabel]') as Element
    // Each gap is a lone space carrying the width the breaker allotted it, and
    // the two lines get different amounts — that difference IS the justifying.
    const gaps = Array.from(block.querySelectorAll('span[style*="letter-spacing"]')).map((s) =>
      Number((s.getAttribute('style') ?? '').match(/letter-spacing: ([\d.]+)px/)?.[1]),
    )
    expect(gaps.length).toBeGreaterThan(4)
    expect(new Set(gaps).size).toBeGreaterThan(1)
    expect(block.textContent).toContain('In principio erat Verbum')
  })

  it('sets a cento citation at its own size, not the body size', () => {
    measurable()
    const { container } = wrap(
      <VersesBlock
        type="verses"
        style="cento"
        items={[{ text: { primary: long }, ref: { primary: 'Ps. 69:2' } }]}
      />,
    )
    // Leaf spans only — an ancestor's textContent starts with the citation too.
    const citation = Array.from(container.querySelectorAll('span')).find(
      (s) => s.childElementCount === 0 && s.textContent?.startsWith('PS.'),
    )
    expect(citation).toBeTruthy()
    // 0.72 × 22px body, and tracked — both measured, so the verse that follows
    // is placed against a citation of the width actually drawn.
    const style = citation?.getAttribute('style') ?? ''
    expect(style).toContain('font-size: 16px')
    expect(style).toContain('letter-spacing: 0.4px')
    // One piece, not three: `atomic` kept "PS. 69:2" whole, and the gap that
    // sets it off from the verse carries no flex of its own.
    expect(citation?.textContent).toMatch(/^PS\.\s*69:2$/)
  })

  // The renderer has to DRAW the hyphen the breaker priced: justif inserts it
  // outside the text tree, so it is its own piece rather than a character in
  // the word. The citation is what tightens this measure enough to need one.
  it('draws the hyphen at a break the breaker planned', () => {
    measurable()
    const { container } = wrap(
      <VersesBlock
        type="verses"
        style="cento"
        items={[{ text: { primary: hyphenating }, ref: { primary: 'Ps. 69:2' } }]}
      />,
    )
    const block = container.querySelector('[accessibilitylabel]') as Element
    const leaves = Array.from(block.querySelectorAll('span')).filter(
      (s) => s.childElementCount === 0,
    )
    expect(leaves.some((s) => s.textContent === '-')).toBe(true)
    // And the word itself is unbroken text — the hyphen is not spliced into it,
    // which is what keeps selection and copy clean.
    expect(block.textContent).not.toContain('--')
  })

  it('keeps a cross-reference tappable inside justified text', () => {
    measurable()
    const onRefPress = vi.fn()
    wrap(
      <ProducerHtmlBlock
        blocks={paragraph([
          { kind: 'text', text: 'Man is capable of God, as the Catechism says at ' },
          { kind: 'ref', ref: 'book/ccc#1213', text: '1213' },
          { kind: 'text', text: ', on the sacrament of baptism and its effects.' },
        ])}
        onRefPress={onRefPress}
      />,
    )
    fireEvent.click(screen.getByText('1213'))
    expect(onRefPress).toHaveBeenCalledWith('book/ccc#1213')
  })

  it('does not fuse two adjacent cross-references into one tap target', () => {
    measurable()
    const onRefPress = vi.fn()
    wrap(
      <ProducerHtmlBlock
        blocks={paragraph([
          { kind: 'ref', ref: 'book/ccc#1', text: 'one' },
          { kind: 'ref', ref: 'book/ccc#2', text: 'two' },
        ])}
        onRefPress={onRefPress}
      />,
    )
    fireEvent.click(screen.getByText('two'))
    expect(onRefPress).toHaveBeenCalledWith('book/ccc#2')
    expect(onRefPress).not.toHaveBeenCalledWith('book/ccc#1')
  })

  // A hard newline is a paragraph boundary the breaker has no model for, so
  // those paragraphs stay on the plain renderer — with their content intact.
  it('falls back, without losing text, when a paragraph carries a hard break', () => {
    measurable()
    wrap(
      <ProducerHtmlBlock
        blocks={paragraph([
          { kind: 'text', text: 'first half' },
          { kind: 'break' },
          { kind: 'text', text: 'second half' },
        ])}
      />,
    )
    expect(screen.getByText(/first half/)).toBeTruthy()
    expect(screen.getByText(/second half/)).toBeTruthy()
  })

  it('renders the whole verse when the measure is unavailable', () => {
    // No `measurable()`: the first frame, before onLayout. The fallback has to
    // be a real rendering of the same text.
    wrap(verse(long))
    expect(screen.getByText(new RegExp(long.slice(0, 40)))).toBeTruthy()
  })

  it('honours the reader asking for ragged right', () => {
    usePreferencesStore.setState({ textAlign: 'left' })
    measurable()
    const { container } = wrap(verse(long))
    const block = container.querySelector('[accessibilitylabel]') as Element
    expect(alignOf(block)).toBe('left')
    // Ragged means the platform wraps it — no per-gap spacing spans at all.
    expect(block.querySelectorAll('span[style*="letter-spacing"]')).toHaveLength(0)
  })
})
