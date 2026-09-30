import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { PracticeManifest } from '@/content/manifestTypes'
import type { Completion } from '@/db/schema'

import { liturgicalActOf, liturgicalActs } from '../acts'

// The real practice manifests, straight from content/.
const practices = resolve(__dirname, '../../../../../../content/practices')
const manifestOf = (id: string): PracticeManifest | undefined => {
  const path = `${practices}/${id}/manifest.json`
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : undefined
}

let nextId = 1
const completion = (practice_id: string, prayed_id: string | undefined, sub_id = 'default') =>
  ({
    id: nextId++,
    practice_id,
    sub_id,
    date: '2026-10-04',
    completed_at: 0,
    prayed_id,
  }) satisfies Completion

describe('liturgicalActOf', () => {
  it('finds Mass in either form', () => {
    expect(liturgicalActOf('mass', manifestOf)).toBe('mass')
    expect(liturgicalActOf('mass-vetus-ordo', manifestOf)).toBe('mass')
  })

  it('counts every form of the breviaries and the Liturgy of the Hours as the Office', () => {
    for (const id of [
      'liturgy-of-the-hours',
      'divine-office',
      'breviary',
      'breviary-1955',
      'breviary-office-of-the-dead',
      'breviary-little-office-bvm',
      'breviary-monastic-1617',
    ]) {
      expect(liturgicalActOf(id, manifestOf), id).toBe('office')
    }
  })

  it('does not count a standalone Little Office, or a devotion', () => {
    expect(liturgicalActOf('little-office-bvm', manifestOf)).toBeUndefined()
    expect(liturgicalActOf('little-office-bvm-carmelite', manifestOf)).toBeUndefined()
    expect(liturgicalActOf('rosary', manifestOf)).toBeUndefined()
  })
})

describe('liturgicalActs', () => {
  const prayedIdOf = (c: Completion) => c.prayed_id ?? c.practice_id

  it('reads what was prayed, not the plan practice it was logged under', () => {
    const acts = liturgicalActs(
      [
        completion('practice/breviary', 'breviary-1955'),
        completion('practice/mass', 'mass-vetus-ordo'),
        completion('practice/rosary', 'rosary'),
      ],
      prayedIdOf,
      manifestOf,
    )
    expect(acts).toEqual([
      { kind: 'office', date: '2026-10-04' },
      { kind: 'mass', date: '2026-10-04' },
    ])
  })

  it('ignores backfilled days', () => {
    const acts = liturgicalActs(
      [completion('practice/mass', undefined, 'backfill')],
      (c) => c.practice_id.replace('practice/', ''),
      manifestOf,
    )
    expect(acts).toEqual([])
  })
})
