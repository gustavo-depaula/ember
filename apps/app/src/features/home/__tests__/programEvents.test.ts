import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { PracticeManifest } from '@/content/manifestTypes'

import { type JoinedProgram, programEvents } from '../programEvents'

// The real novenas, as the corpus dates them.
const practices = `${resolve(__dirname, '../../../../../../content/practices')}/`
const manifests = readdirSync(practices)
  .map(
    (dir) =>
      JSON.parse(readFileSync(`${practices}${dir}/manifest.json`, 'utf-8')) as PracticeManifest,
  )
  .filter((m) => m.program)
const manifest = (id: string) => manifests.find((m) => m.id === id) as PracticeManifest

// Saturday 10 October 2026.
const today = new Date(2026, 9, 10)
const novena = (id: string, startDate: string, prayed: string[] = []): JoinedProgram => ({
  manifest: manifest(id),
  schedule: { type: 'fixed-program', totalDays: 9, startDate },
  cursor: { started_at: startDate },
  completionDatesAsc: prayed,
})
const row = (joined: JoinedProgram[] = []) =>
  programEvents({ joined, manifests, today }).map((e) => [e.manifest.id, e.away])

describe('programEvents', () => {
  it('lists the novenas whose first day falls within two weeks, soonest first', () => {
    expect(row()).toEqual([
      ['st-peter-of-alcantara-novena', 0],
      ['st-john-paul-ii-novena', 3],
      ['st-anthony-galvao-novena', 6],
      ['all-saints-novena', 13],
    ])
  })

  it('leaves out a novena already under way that was never joined', () => {
    expect(row().map(([id]) => id)).not.toContain('our-lady-aparecida-novena')
  })

  it('puts a novena under way first, on the day its dates make it', () => {
    const prayed = [
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
    ]
    const [first] = programEvents({
      joined: [novena('our-lady-aparecida-novena', '2026-10-03', prayed)],
      manifests,
      today,
    })
    expect(first).toMatchObject({
      joined: true,
      day: 8,
      kept: 7,
      prayedToday: false,
      canPray: true,
    })
  })

  it("marks today's day prayed, and keeps a missed day from moving the count", () => {
    const [first] = programEvents({
      joined: [novena('our-lady-aparecida-novena', '2026-10-03', ['2026-10-03', '2026-10-10'])],
      manifests,
      today,
    })
    expect(first).toMatchObject({ day: 8, kept: 2, prayedToday: true, canPray: false })
  })

  it('shows a joined novena waiting for its day once, as joined', () => {
    const events = programEvents({
      joined: [novena('st-john-paul-ii-novena', '2026-10-13')],
      manifests,
      today,
    })
    const jp2 = events.filter((e) => e.manifest.id === 'st-john-paul-ii-novena')
    expect(jp2).toHaveLength(1)
    expect(jp2[0]).toMatchObject({ joined: true, away: 3 })
    expect(jp2[0].day).toBeUndefined()
  })

  it('drops a novena whose days have all gone by', () => {
    const all = programEvents({
      joined: [novena('st-faustina-novena', '2026-09-26', ['2026-09-26'])],
      manifests,
      today,
    })
    expect(all.map((e) => e.manifest.id)).not.toContain('st-faustina-novena')
  })
})
