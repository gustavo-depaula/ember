import type { SQLiteDatabase } from 'expo-sqlite'

export type SqlBindValue = string | number | boolean | null | Uint8Array
export type SqlBindParams = SqlBindValue[]

export type Statement = { sql: string; params?: SqlBindParams }

/**
 * The database API the app's code is written against. On a phone it wraps
 * expo-sqlite's `SQLiteDatabase`; the website runs the same code over a
 * SQLite of its own.
 *
 * Departure from `SQLiteDatabase`: a transaction is `runBatchInTx(statements)`,
 * a list of statements run together, rather than a callback holding the
 * transaction open, so callers can't use intermediate results inside it.
 */
export type EmberDb = {
  execAsync(sql: string): Promise<void>
  runAsync(
    sql: string,
    params?: SqlBindParams,
  ): Promise<{ lastInsertRowId: number; changes: number }>
  getAllAsync<T>(sql: string, params?: SqlBindParams): Promise<T[]>
  getFirstAsync<T>(sql: string, params?: SqlBindParams): Promise<T | null>
  runBatchInTx(statements: Statement[]): Promise<void>
  closeAsync(): Promise<void>
}

/**
 * `withTransactionAsync` is documented as non-exclusive and can be interrupted
 * by other async queries — concurrent calls race on BEGIN/COMMIT/ROLLBACK and
 * surface as "cannot rollback - no transaction is active". Batched
 * transactions are serialized per connection to prevent that race.
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
