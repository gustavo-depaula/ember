import { moderationChange, moderationReview, moderationRun } from '@ember/api/src/schema'
import { desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { Review, StoredHistoryEntry } from './types'

// The desk's working state, in the three moderation tables beside the directory: Claude's draft for
// each church, the review runs under way, and the log that undo and the change messages read.

export type RunRow = typeof moderationRun.$inferSelect
export type Store = ReturnType<typeof createStore>

// How many applied resolutions the desk reads back. Undo only ever concerns the latest ones.
const changeLimit = 300

const orUndefined = <T>(value: T | null): T | undefined => value ?? undefined

export function createStore(d1: D1Database) {
  const db = drizzle(d1)

  async function reviews(): Promise<Map<string, Review>> {
    const rows = await db.select().from(moderationReview)
    return new Map(
      rows.map(({ churchId, costUsd, ...row }) => [
        churchId,
        { ...row, costUsd: orUndefined(costUsd) },
      ]),
    )
  }

  async function writeReview(churchId: string, review: Review & { brief: number }) {
    const { outdated: _outdated, ...row } = review
    await db
      .insert(moderationReview)
      .values({ churchId, ...row })
      .onConflictDoUpdate({ target: moderationReview.churchId, set: row })
  }

  async function clearCase(churchId: string) {
    await db.batch([
      db.delete(moderationReview).where(eq(moderationReview.churchId, churchId)),
      db.delete(moderationRun).where(eq(moderationRun.churchId, churchId)),
    ])
  }

  const runs = () => db.select().from(moderationRun)

  async function run(id: string): Promise<RunRow | undefined> {
    const [row] = await db.select().from(moderationRun).where(eq(moderationRun.id, id))
    return row
  }

  async function writeRun(row: RunRow) {
    const { churchId, ...set } = row
    await db
      .insert(moderationRun)
      .values(row)
      .onConflictDoUpdate({ target: moderationRun.churchId, set })
  }

  // By run id, so a late report from a run that was stopped and started again changes nothing.
  async function updateRun(id: string, set: Partial<RunRow>) {
    await db.update(moderationRun).set(set).where(eq(moderationRun.id, id))
  }

  async function deleteRun(id: string) {
    await db.delete(moderationRun).where(eq(moderationRun.id, id))
  }

  // Newest first.
  async function changes(): Promise<StoredHistoryEntry[]> {
    const rows = await db
      .select()
      .from(moderationChange)
      .orderBy(desc(moderationChange.appliedAt))
      .limit(changeLimit)
    return rows.map(({ basis, undoneAt, sharedAt, ...row }) => ({
      ...row,
      basis: orUndefined(basis),
      undoneAt: orUndefined(undoneAt),
      sharedAt: orUndefined(sharedAt),
    }))
  }

  async function writeChange(entry: StoredHistoryEntry) {
    const row = {
      ...entry,
      basis: entry.basis ?? null,
      undoneAt: entry.undoneAt ?? null,
      sharedAt: entry.sharedAt ?? null,
    }
    const { id: _id, ...set } = row
    await db
      .insert(moderationChange)
      .values(row)
      .onConflictDoUpdate({ target: moderationChange.id, set })
  }

  return {
    reviews,
    writeReview,
    clearCase,
    runs,
    run,
    writeRun,
    updateRun,
    deleteRun,
    changes,
    writeChange,
  }
}
