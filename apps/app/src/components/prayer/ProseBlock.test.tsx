import { cleanup, render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it } from 'vitest'
import { config } from '@/config/tamagui.config'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { unhyphenated } from '@/test/text'
import { ProseBlock } from './ProseBlock'

afterEach(() => {
  cleanup()
  usePreferencesStore.setState({ textAlign: 'justify' })
})

function renderProse(markdown: string) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      <ProseBlock text={{ primary: markdown }} />
    </TamaguiProvider>,
  )
}

// Tamagui compiles style props to atomic classes rather than inline styles, so
// the alignment a block asks for is readable only off the class list.
const alignOf = (el: Element) => (el.className.match(/_textAlign-(\w+)/)?.[1] ?? 'unset') as string

// Long-form prose is what the platform justifier is worst at: it fills each
// line greedily and never hyphenates, so book paragraphs open rivers of
// whitespace. Every text block here therefore hands its breaks to the
// Knuth–Plass pass and sets itself `left`, which is what tells the platform to
// leave the lines exactly where the breaker put them.
describe('ProseBlock', () => {
  it('never asks the platform to justify a paragraph', () => {
    renderProse('A paragraph long enough to want breaking well.')
    expect(alignOf(screen.getByText(/A paragraph long enough/, unhyphenated))).toBe('left')
  })

  it('leaves list items and blockquotes on the same path', () => {
    renderProse('- one item\n\n> a quoted line')
    expect(alignOf(screen.getByText(/one item/, unhyphenated))).toBe('left')
    expect(alignOf(screen.getByText(/a quoted line/, unhyphenated))).toBe('left')
  })

  it('keeps emphasis rendered when the text is justified', () => {
    renderProse('a paragraph with *emphasis* in it')
    expect(screen.getByText('emphasis', unhyphenated)).toBeTruthy()
    expect(screen.getByText(/a paragraph with/, unhyphenated)).toBeTruthy()
    expect(screen.getByText(/in it/, unhyphenated)).toBeTruthy()
  })

  it('draws list markers inline, so the justifier measures them', () => {
    renderProse('- first\n- second')
    expect(screen.getByText(/• first/, unhyphenated)).toBeTruthy()
    expect(screen.getByText(/• second/, unhyphenated)).toBeTruthy()
  })

  it('numbers an ordered list', () => {
    renderProse('1. first\n2. second')
    expect(screen.getByText(/1\. first/, unhyphenated)).toBeTruthy()
    expect(screen.getByText(/2\. second/, unhyphenated)).toBeTruthy()
  })

  it('splits a blockquote at its internal blank lines', () => {
    renderProse('> first part\n>\n> second part')
    expect(screen.getByText(/first part/, unhyphenated)).toBeTruthy()
    expect(screen.getByText(/second part/, unhyphenated)).toBeTruthy()
  })

  it('still renders headings and images', () => {
    const { container } = renderProse('## A heading\n\n![alt](https://example.test/a.jpg)')
    expect(screen.getByText('A heading')).toBeTruthy()
    expect(container.querySelectorAll('img').length).toBeGreaterThan(0)
  })

  // The reader's "left" setting is a request for ragged right, not for a
  // differently-broken paragraph — it must not route through the justifier.
  it('honours the left-aligned reading preference', () => {
    usePreferencesStore.setState({ textAlign: 'left' })
    renderProse('A paragraph the reader wants ragged.')
    expect(alignOf(screen.getByText(/A paragraph the reader wants/, unhyphenated))).toBe('left')
  })

  // A blockquote is italic throughout, and the face has to be NAMED rather than
  // asked for as a slant — see `blockFace`. Easy to lose on the left-aligned
  // path, which has no justifier to hand the base style to. Compared against a
  // plain paragraph because the family lands in a hashed class: what matters is
  // that the quote is not set in the same face as the body.
  it.each(['justify', 'left'] as const)('sets a blockquote in italic when %s', (textAlign) => {
    usePreferencesStore.setState({ textAlign })
    renderProse('a plain paragraph\n\n> a quoted line')
    const familyOf = (el: Element) => el.className.match(/_ff-\S+/)?.[0]
    expect(familyOf(screen.getByText(/a quoted line/, unhyphenated))).toBeTruthy()
    expect(familyOf(screen.getByText(/a quoted line/, unhyphenated))).not.toBe(
      familyOf(screen.getByText(/a plain paragraph/, unhyphenated)),
    )
  })
})
