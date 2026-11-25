import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { nextHalfHour } from '../defaultSlot'
import { ruleGuide } from '../ruleGuide'

const practicesDir = resolve(process.cwd(), '../../content/practices')
const defaultSlot = (practiceId: string) => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(practicesDir, practiceId.replace('practice/', ''), 'manifest.json'),
      'utf8',
    ),
  )
  return manifest.defaults?.slots?.[0]
}

describe('nextHalfHour', () => {
  it.each([
    ['07:00', '07:30'],
    ['07:29', '07:30'],
    ['07:30', '08:00'],
    ['21:13', '21:30'],
    ['23:45', '00:00'],
  ])('at %s opens on %s', (now, expected) => {
    const [h, m] = now.split(':').map(Number)
    expect(nextHalfHour(new Date(2026, 10, 23, h, m))).toBe(expected)
  })
})

// Every row of "Add to the rule" goes in with one tap, so each needs its own hour.
describe('the rule guide’s practices', () => {
  const entries = ruleGuide.flatMap((tier) => tier.entries)

  it.each(
    entries
      // The Mass asks its own days and hour; the Office adds one slot per hour, each timed.
      .filter((e) => !e.massDays && e.practiceId !== 'practice/liturgy-of-the-hours')
      .map((e) => [e.practiceId]),
  )('%s has a default hour', (practiceId) => {
    expect(defaultSlot(practiceId)?.time).toMatch(/^\d\d:\d\d$/)
  })

  it.each([
    ['practice/rosary', { time: '20:00' }],
    ['practice/angelus', { time: '12:00' }],
    ['practice/confession', { time: '10:00', schedule: { type: 'nth-weekday', n: [1], day: 6 } }],
  ])('%s goes in at %o', (practiceId, expected) => {
    expect(defaultSlot(practiceId)).toMatchObject(expected)
  })
})
