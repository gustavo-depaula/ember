import { describe, expect, it } from 'vitest'

import { firstMarkdownHeading } from './meditationSubtitle'

describe('firstMarkdownHeading', () => {
  it('returns the first ATX heading, stripped of marks', () => {
    expect(firstMarkdownHeading('# Da temeridade do pecador\n\nCorpo da meditação…')).toBe(
      'Da temeridade do pecador',
    )
  })

  it('handles deeper heading levels and trailing hashes', () => {
    expect(firstMarkdownHeading('### Meditazione II — L’amore di Dio ###')).toBe(
      'Meditazione II — L’amore di Dio',
    )
  })

  it('skips leading blank lines and front matter prose', () => {
    expect(firstMarkdownHeading('\n\nSome intro line\n# The Title\nbody')).toBe('The Title')
  })

  it('returns undefined when there is no heading', () => {
    expect(firstMarkdownHeading('just a paragraph with a # in the middle')).toBeUndefined()
    expect(firstMarkdownHeading('')).toBeUndefined()
  })
})
