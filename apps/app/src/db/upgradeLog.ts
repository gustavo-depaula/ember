import type { EmberDb } from '@/lib/db-shared/protocol'

import { adoptLegacyTables } from './adoptLegacyTables'
import { dropPlaceholders, replayAll } from './events'

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
  await db.execAsync(`PRAGMA user_version = ${logVersion}`)
}
