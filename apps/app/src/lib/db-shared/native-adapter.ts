import type { SQLiteDatabase } from 'expo-sqlite'

import type { EmberDb, Statement } from './protocol'

/**
 * Wraps the real `SQLiteDatabase` (native) so it satisfies `EmberDb`.
 * The only departure is `runBatchInTx`, which composes `withTransactionAsync`
 * + `runAsync` so call sites have a single API across native and web.
 *
 * `withTransactionAsync` is documented as non-exclusive and can be interrupted
 * by other async queries — concurrent calls race on BEGIN/COMMIT/ROLLBACK and
 * surface as "cannot rollback - no transaction is active". We serialize
 * batched-transaction calls per connection to prevent that race.
 */
export function adaptNativeDb(db: SQLiteDatabase): EmberDb {
  const serialize = createSerialQueue()
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getAllAsync: (sql, params = []) => db.getAllAsync(sql, params),
    getFirstAsync: (sql, params = []) => db.getFirstAsync(sql, params),
    closeAsync: () => db.closeAsync(),
    runBatchInTx: async (statements: Statement[]) => {
      if (statements.length === 0) return
      await serialize(() =>
        db.withTransactionAsync(async () => {
          for (const s of statements) {
            await db.runAsync(s.sql, s.params ?? [])
          }
        }),
      )
    },
  }
}

function createSerialQueue() {
  let tail: Promise<unknown> = Promise.resolve()
  return async function serialize<T>(task: () => Promise<T>): Promise<T> {
    const result = tail.then(task, task)
    tail = result.then(
      () => {},
      () => {},
    )
    return result
  }
}
