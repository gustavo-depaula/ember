import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import { setCatalog } from '@/content/contentIndex'
import type { Completion } from '@/db/schema'

import { liturgicalActs, roundActs } from '../acts'

// The built corpus catalog (`pnpm build:corpus`): forms get their group's
// liturgicalAct at build, and that's what the app reads.
beforeAll(() => {
  const catalog = resolve(__dirname, '../../../../../../_site/hearth/v2/catalog.json')
  setCatalog(JSON.parse(readFileSync(catalog, 'utf-8')))
})

const prayed = (prayed_id: string, sub_id = 'default'): Completion => ({
  id: 0,
  practice_id: 'practice/plan-practice',
  sub_id,
  date: '2026-10-04',
  completed_at: 0,
  prayed_id,
})
const kinds = (...ids: string[]) => liturgicalActs(ids.map((id) => prayed(id))).map((a) => a.kind)

describe('liturgicalActs', () => {
  it('counts Mass in either form', () => {
    expect(kinds('mass', 'mass-vetus-ordo')).toEqual(['mass', 'mass'])
  })

  it('counts every form of the breviaries and the Liturgy of the Hours as the Office', () => {
    const office = [
      'liturgy-of-the-hours',
      'divine-office',
      'breviary-1955',
      'breviary-office-of-the-dead',
      'breviary-little-office-bvm',
      'breviary-monastic-1617',
    ]
    expect(kinds(...office)).toEqual(office.map(() => 'office'))
  })

  it('does not count a standalone Little Office, or a devotion', () => {
    expect(kinds('little-office-bvm', 'little-office-bvm-carmelite', 'rosary')).toEqual([])
  })

  it('ignores backfilled days', () => {
    expect(liturgicalActs([prayed('mass', 'backfill')])).toEqual([])
  })
})

describe('roundActs', () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../../../../../content/practices/ember-days/manifest.json'),
      'utf-8',
    ),
  )
  const acts = (p: ReturnType<typeof plan>) => roundActs(p, today, () => manifest).acts

  // Advent 2026: Wednesday 16, Friday 18 and Saturday 19 December.
  const plan = (marked: Record<string, string>) => {
    const completions = new Map(
      Object.entries(marked).map(([date, on], i): [number, Completion] => [
        i,
        {
          id: i,
          practice_id: 'ember-days',
          sub_id: 'default',
          date,
          completed_at: new Date(`${on}T12:00:00`).getTime(),
        },
      ]),
    )
    return {
      slots: new Map([
        [
          'slot',
          {
            id: 'slot',
            practice_id: 'ember-days',
            enabled: 1,
            sort_order: 0,
            tier: 'extra' as const,
            time: null,
            time_block: 'flexible' as const,
            notify: null,
            schedule: '{"type":"ember-days"}',
          },
        ],
      ]),
      cursors: new Map(),
      completions,
      completionsByPractice: new Map([['ember-days', new Set(completions.keys())]]),
    }
  }
  const today = new Date(2026, 11, 20)

  it("gives the season's act once all three days are kept, dated the Saturday", () => {
    const kept = plan({
      '2026-12-16': '2026-12-16',
      '2026-12-18': '2026-12-18',
      '2026-12-19': '2026-12-19',
    })
    expect(acts(kept)).toEqual([{ kind: 'emberDaysFinished', ember: 'advent', date: '2026-12-19' }])
  })

  it('gives nothing for a week with a day missed, or one ticked the day after', () => {
    expect(acts(plan({ '2026-12-16': '2026-12-16', '2026-12-19': '2026-12-19' }))).toEqual([])
    const late = plan({
      '2026-12-16': '2026-12-16',
      '2026-12-18': '2026-12-19',
      '2026-12-19': '2026-12-19',
    })
    expect(acts(late)).toEqual([])
  })
})
