import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import { setCatalog } from '@/content/contentIndex'
import type { Completion } from '@/db/schema'

import { liturgicalActs, prayedDayActs } from '../acts'

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

describe('prayedDayActs', () => {
  const day = (...ids: string[]) => prayedDayActs(ids.map((id) => prayed(id)))

  it('counts a day with the offering, the rosary and the examen, in any of their forms', () => {
    const kept = [{ kind: 'prayedDay', date: '2026-10-04' }]
    expect(day('morning-offering', 'rosary', 'examination-of-conscience')).toEqual(kept)
    expect(day('morning-offering-carmelite', 'rosary', 'examination-of-conscience')).toEqual(kept)
  })

  it('does not count a day missing one, or one made up by a backfill', () => {
    expect(day('morning-offering', 'rosary', 'rosary-54-day-novena')).toEqual([])
    const backfilled = [
      prayed('morning-offering'),
      prayed('rosary'),
      prayed('examination-of-conscience', 'backfill'),
    ]
    expect(prayedDayActs(backfilled)).toEqual([])
  })
})
