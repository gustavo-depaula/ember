import { describe, expect, it } from 'vitest'
import { flow, flowDef, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { type EngineContext, resolveFlow, resolveFlowAsync } from '../../../engine'

describe('resolveFlowAsync — cycle template with prose+book', () => {
  it('preloads book chapters from cycle template sections', async () => {
    const cycleData = {
      indexBy: 'fixed' as const,
      entries: {
        default: [
          { chapterId: 'session-001' },
          { chapterId: 'session-002' },
          { chapterId: 'session-003' },
        ],
      },
    }

    const context = makeContext({
      cycleData: { 'session-progression': cycleData },
    })

    const engineContext: EngineContext = {
      ...makeEngineContext(),
      language: 'pt-BR',
      contentLanguage: 'pt-BR',
      loadBookChapterTextAsync: async (_book, chapter) => ({
        'pt-BR': `Content of ${chapter}`,
      }),
    }

    const result = await resolveFlowAsync(
      flowDef({
        sections: [
          {
            type: 'cycle',
            data: 'session-progression',
            as: 'template',
            sections: [
              {
                type: 'prose',
                book: 'catechetical-formation',
                chapter: '{{chapterId}}',
                langPolicy: 'active-language',
              },
            ],
          },
        ],
      }),
      context,
      engineContext,
    )

    expect(result.length).toBe(1)
    expect(result[0].type).toBe('prose')
    if (result[0].type === 'prose') {
      expect(result[0].text.primary).toContain('session-')
    }
  })

  it('preloads literal prose+book chapters from non-cycle sections', async () => {
    const engineContext: EngineContext = {
      ...makeEngineContext(),
      language: 'pt-BR',
      contentLanguage: 'pt-BR',
      loadBookChapterTextAsync: async (_book, chapter) => ({
        'pt-BR': `Content of ${chapter}`,
      }),
    }

    const result = await resolveFlowAsync(
      flowDef({
        sections: [
          {
            type: 'prose',
            book: 'some-book',
            chapter: 'intro',
            langPolicy: 'active-language',
          },
        ],
      }),
      makeContext(),
      engineContext,
    )

    expect(result).toEqual([{ type: 'prose', text: { primary: 'Content of intro' } }])
  })
})

describe('resolveFlow — CycleData contextKey', () => {
  it('uses contextKey to select entry set', () => {
    const result = resolveFlow(
      flow({ type: 'cycle', data: 'psalter', as: 'psalmody' }),
      makeContext({
        numbering: 'lxx',
        cycleData: {
          psalter: {
            indexBy: 'day-of-month',
            contextKey: 'numbering',
            entries: { lxx: [[90, 91]], mt: [[91, 92]] },
          },
        },
      }),
      makeEngineContext(),
    )
    expect(result).toMatchObject([{ type: 'psalmody' }])
  })
})

// =============================================================================
// Integration tests
// =============================================================================
