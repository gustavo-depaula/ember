import { subDays } from 'date-fns'

import type { EmberDb } from '@/lib/db-shared/protocol'

import { adoptLegacyTables } from './adoptLegacyTables'
import { dropPlaceholders, emitBatch, replayAll, useEventStore } from './events'
import type { AppEvent } from './events/types'

/**
 * Runs `step` if this database hasn't reached `version` yet, and records that
 * it has. What a database from before the log took its present shape still
 * needs is done this way, once: a new install passes every step with nothing
 * to do, so a device that later takes on an account's log repairs nothing in it.
 */
export async function once(db: EmberDb, version: number, step: () => Promise<void>): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  if ((row?.user_version ?? 0) >= version) return
  await step()
  await db.execAsync(`PRAGMA user_version = ${version}`)
}

export function upgradeLog(db: EmberDb): Promise<void> {
  return once(db, 1, async () => {
    await dropPlaceholders(db)
    // The steps below read what the log already holds.
    await replayAll()
    await adoptLegacyTables(db)
    await renameToCorpusIds()
    await recordReadingKeptAsTotals()
  })
}

// Practices launch once wrote under ids of its own, with an English name and
// no text to pray. The corpus holds each now; one that was taken up moves to
// the corpus practice and takes its name from there.
const corpusIds: Record<string, string> = {
  'examination-conscience': 'practice/examination-of-conscience',
  'blessed-sacrament': 'practice/visit-blessed-sacrament',
  'three-oclock': 'practice/three-oclock-prayer',
  akathist: 'practice/akathist-hymn-to-the-theotokos-and-ever-vrgin-mary',
  trisagion: 'practice/trisagion-prayers',
  paraklesis: 'practice/paraklesis',
  prostrations: 'practice/prostrations',
}

async function renameToCorpusIds(): Promise<void> {
  const { practices } = useEventStore.getState()
  const events = Object.entries(corpusIds)
    .filter(([fromId]) => practices.has(fromId))
    .flatMap(([fromId, toId]) => [
      { type: 'PracticeMerged' as const, fromId, toId },
      {
        type: 'PracticeUpdated' as const,
        practiceId: toId,
        customName: null,
        customIcon: null,
        customDesc: null,
      },
    ])
  if (events.length > 0) await emitBatch(events)
}

// A book's reading was kept as two running values: the time read in all, and
// the last day of its current run of days with the run's length. Reading is
// recorded by the day now; these become the days and the time they stood for.
async function recordReadingKeptAsTotals(): Promise<void> {
  const events: AppEvent[] = []
  const lastDayOf = new Map<string, string>()
  const cursors = [...useEventStore.getState().cursors.values()]

  for (const cursor of cursors) {
    const bookId = /^book\/(.+)\/streak$/.exec(cursor.id)?.[1]
    if (!bookId) continue
    const { lastDay, count } = JSON.parse(cursor.position) as { lastDay: string; count: number }
    lastDayOf.set(bookId, lastDay)
    for (let back = 0; back < count; back++) {
      const date = subDays(new Date(`${lastDay}T12:00:00`), back)
        .toISOString()
        .slice(0, 10)
      events.push({ type: 'ReadingLogged', bookId, date, ms: 0 })
    }
  }
  for (const cursor of cursors) {
    const bookId = /^book\/(.+)\/read-time$/.exec(cursor.id)?.[1]
    if (!bookId) continue
    const { totalMs } = JSON.parse(cursor.position) as { totalMs: number }
    const date = lastDayOf.get(bookId) ?? cursor.started_at
    events.push({ type: 'ReadingLogged', bookId, date, ms: totalMs })
  }
  if (events.length > 0) await emitBatch(events)
}
