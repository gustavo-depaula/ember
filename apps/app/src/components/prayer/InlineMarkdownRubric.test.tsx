import { cleanup, render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it } from 'vitest'
import { config } from '@/config/tamagui.config'
import { Typography } from '../typography'
import { InlineMarkdownRubric } from './InlineMarkdown'

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
