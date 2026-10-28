// `@/db/client` in the browser: the account code opens, reads and erases the
// database through it, as on a phone.
import { createEventsTable, replayAll } from '@/db/events'
import { getDb, setDb } from '@/db/instance'
import { connected } from '~/personal/connected'
import { eraseSaved, openBrowserDb } from './db'

export { getDb }

/** Opens this browser's database and folds its log. `onChange`: another tab wrote. */
export async function openDatabase(onChange: () => void): Promise<void> {
  const db = await openBrowserDb(onChange)
  const made = await db.getFirstAsync("SELECT 1 FROM sqlite_master WHERE name = 'events'")
  if (!made) {
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
    )
    await createEventsTable(db)
  }
  setDb(db)
  await replayAll()
}

/** Erases what this browser holds and reloads every tab of the site. */
export async function resetDatabase(): Promise<void> {
  connected.set(false)
  await eraseSaved()
  location.reload()
}
