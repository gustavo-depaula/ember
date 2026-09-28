import { describe, expect, it } from 'vitest'
import compline from '../../../../../../content/practices/divine-office/data/compline-psalms.json'
import officeHymns from '../../../../../../content/practices/divine-office/data/office-hymns.json'
import psalter from '../../../../../../content/practices/divine-office/data/psalter-30-day.json'
import divineOffice from '../../../../../../content/practices/divine-office/flow.json'
import littleOffice from '../../../../../../content/practices/little-office-bvm/flow.json'
import { flow, flowDef, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { type EngineContext, resolveFlow, resolveFlowAsync } from '../../../engine'
import type { CycleData, FlowDefinition } from '../../../types'

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

describe('resolveFlowAsync — the offices open with their hymn', () => {
  it('renders every hour of the Divine Office and the Little Office with its hymn', async () => {
    const cycleData = {
      'office-hymns': officeHymns,
      'psalter-30-day': psalter,
      'compline-psalms': compline,
    } as Record<string, CycleData>
    for (const [name, office] of Object.entries({ divineOffice, littleOffice })) {
      const [select] = await resolveFlowAsync(
        office as FlowDefinition,
        makeContext({ cycleData, numbering: 'mt' }),
        makeEngineContext(),
      )
      if (select?.type !== 'select') throw new Error(`${name}: no hour select`)
      for (const option of select.options) {
        expect(
          option.sections.find((s) => s.type === 'hymn'),
          `${name} ${option.id}`,
        ).toMatchObject({
          title: { primary: expect.stringMatching(/\w/) },
          text: { primary: expect.stringMatching(/\w/) },
        })
      }
    }
  })
})
