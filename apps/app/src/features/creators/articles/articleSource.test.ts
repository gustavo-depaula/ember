import { describe, expect, it } from 'vitest'

import type { CreatorChannel } from '@/content/manifestTypes'
import { resolveArticleMode } from './articleSource'

const baseChannel: CreatorChannel = { kind: 'rss', feedUrl: 'https://example.org/feed' }

describe('resolveArticleMode', () => {
  it('defaults to summary mode when fullText is unset', () => {
    const result = resolveArticleMode(baseChannel, 'A short summary.')
    expect(result.mode).toBe('summary')
    expect(result.body).toBe('A short summary.')
  })

  it('uses fullText mode when channel allowlists it', () => {
    const result = resolveArticleMode({ ...baseChannel, fullText: true }, '<p>Full body.</p>')
    expect(result.mode).toBe('fullText')
    expect(result.body).toBe('<p>Full body.</p>')
  })

  it('falls back to summary when fullText is on but no body content present', () => {
    const result = resolveArticleMode({ ...baseChannel, fullText: true }, '')
    expect(result.mode).toBe('summary')
    expect(result.body).toBe('')
  })
})
