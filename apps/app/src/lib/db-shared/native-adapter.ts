import type { SQLiteDatabase } from 'expo-sqlite'

import type { EmberDb, Statement } from './protocol'

/**
 * Wraps the real `SQLiteDatabase` (native) so it satisfies `EmberDb`.
 * The only departure is `runBatchInTx`, which composes `withTransactionAsync`
 * + `runAsync` so call sites have a single API across native and web.
 */
export function adaptNativeDb(db: SQLiteDatabase): EmberDb {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getAllAsync: (sql, params = []) => db.getAllAsync(sql, params),
    getFirstAsync: (sql, params = []) => db.getFirstAsync(sql, params),
    closeAsync: () => db.closeAsync(),
    runBatchInTx: async (statements: Statement[]) => {
      if (statements.length === 0) return
      await db.withTransactionAsync(async () => {
        for (const s of statements) {
          await db.runAsync(s.sql, s.params ?? [])
        }
      })
    },
  }
}
