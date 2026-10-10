import type { EmberDb } from '@/lib/db-shared/protocol'

import { adoptLegacyTables } from './adoptLegacyTables'
import { dropPlaceholders, emitBatch, replayAll, useEventStore } from './events'

// What a database from before the log took its present shape still needs,
// done once: `user_version` records that it has been.
const logVersion = 1

export async function upgradeLog(db: EmberDb): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  if ((row?.user_version ?? 0) >= logVersion) return
  await dropPlaceholders(db)
  // Adopting reads what the log already holds.
  await replayAll()
  await adoptLegacyTables(db)
  await renameToCorpusIds()
  await db.execAsync(`PRAGMA user_version = ${logVersion}`)
}

// Practices launch once wrote under ids of its own, with an English name and
// no text to pray. The corpus holds each now; one that was taken up moves to
// the corpus practice and takes its name from there.
const corpusIds: Record<string, string> = {
  'examination-conscience': 'practice/examination-of-conscience',
  'blessed-sacrament': 'practice/visit-blessed-sacrament',
  'three-oclock': 'practice/three-oclock-prayer',
  akathist: 'practice/akathist-hymn-to-the-theotokos-and-ever-vrgin-mary',
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
