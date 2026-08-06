import { cleanup, render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it } from 'vitest'
import { config } from '@/config/tamagui.config'
import { Typography } from '../typography'
import { emphasisStyle, InlineMarkdownRubric } from './InlineMarkdown'

afterEach(cleanup)

function renderRubric(source: string) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      <Typography variant="rubric">
        <InlineMarkdownRubric source={source} />
      </Typography>
    </TamaguiProvider>,
  )
}

// The rubric baseline is italic, so emphasis flips to roman rather than adding a
// slant that isn't there to add. Each span names its own face and clears the
// inherited italic — see the comment on `italicRunFaces`.
describe('InlineMarkdownRubric', () => {
  it('renders plain text with no emphasis span', () => {
    renderRubric('Make them attentively, but briefly.')
    expect(screen.getByText('Make them attentively, but briefly.')).toBeTruthy()
  })

  it('flips *italic* to the roman face', () => {
    renderRubric('take some resolution — *not a general one*, such as this')
    const span = screen.getByText('not a general one')
    expect(span).toHaveStyle({ fontFamily: 'EBGaramond_400Regular', fontStyle: 'normal' })
  })

  // React Native Web's Text base class carries `font: 14px …` — a shorthand that
  // resets size, leading and ink. Without an explicit `inherit` an emphasis span
  // drops the rubric's burgundy and its 16px, and renders 14px black.
  // Asserted on the inline style rather than the computed one: jsdom resolves an
  // inherited length back to a px value, which would hide the very thing at issue.
  it('keeps the surrounding ink, size and leading', () => {
    renderRubric('the encyclical *Quamquam Pluries*')
    const style = screen.getByText('Quamquam Pluries').getAttribute('style') ?? ''
    expect(style).toContain('color: inherit')
    expect(style).toContain('font-size: inherit')
    expect(style).toContain('line-height: inherit')
  })

  it('keeps the slant on **bold** and adds weight', () => {
    renderRubric('**Chew the word.** Repeat it.')
    const span = screen.getByText('Chew the word.')
    expect(span).toHaveStyle({ fontFamily: 'EBGaramond_700Bold_Italic', fontStyle: 'normal' })
  })

  it('renders ***both*** as bold roman — bold, flipped for the same reason', () => {
    renderRubric('***Never*** end without one.')
    const span = screen.getByText('Never')
    expect(span).toHaveStyle({ fontFamily: 'EBGaramond_700Bold', fontStyle: 'normal' })
  })

  it('keeps the surrounding text alongside the emphasis', () => {
    renderRubric('from the encyclical *Quamquam Pluries* (1889).')
    expect(screen.getByText('Quamquam Pluries')).toBeTruthy()
    // The surrounding runs keep their own spacing, so match loosely.
    expect(screen.getByText(/from the encyclical/)).toBeTruthy()
    expect(screen.getByText(/\(1889\)\./)).toBeTruthy()
  })
})

// The same trap on the shared path — prayer bodies, annotation rows, todo notes.
// Emphasis names a face; it must never name an ink, a size or a leading.
describe('emphasisStyle', () => {
  const inherited = { color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }

  it('inherits ink, size and leading for the EB Garamond faces', () => {
    expect(emphasisStyle('EBGaramond_400Regular', 700, true)).toEqual({
      ...inherited,
      fontFamily: 'EBGaramond_700Bold_Italic',
    })
  })

  it('inherits them on the synthetic fallback for fonts without italic faces', () => {
    expect(emphasisStyle('Lora', 700, true)).toEqual({
      ...inherited,
      fontFamily: 'Lora',
      fontWeight: '700',
      fontStyle: 'italic',
    })
  })
})
