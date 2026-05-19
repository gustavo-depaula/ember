import { describe, expect, it } from 'vitest'
import { flow, flowDef, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { type EngineContext, resolveFlow, resolveFlowAsync } from '../../../engine'

describe('resolveFlowAsync — cycle with prose+book', () => {
  it('preloads the current cycle entry chapter for prose+book sections', async () => {
    const cycleData = {
      indexBy: 'program-day' as const,
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
      programDay: 1,
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
            sections: [
              {
                type: 'prose',
                book: 'morrow-my-catholic-faith',
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
      expect(result[0].text.primary).toBe('Content of session-002')
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
      flow({
        type: 'cycle',
        data: 'psalter',
        sections: [
          {
            type: 'include',
            ref: 'producer/psalmody',
            params: { psalms: '{{psalms}}' },
          },
        ],
      }),
      makeContext({
        numbering: 'lxx',
        cycleData: {
          psalter: {
            indexBy: 'day-of-month',
            contextKey: 'numbering',
            entries: {
              lxx: [{ psalms: [90, 91] }],
              mt: [{ psalms: [91, 92] }],
            },
          },
        },
      }),
      makeEngineContext(),
    )
    expect(result).toMatchObject([
      { type: 'include', ref: 'producer/psalmody', params: { psalms: [90, 91] } },
    ])
  })
})

// =============================================================================
// Integration tests
// =============================================================================
