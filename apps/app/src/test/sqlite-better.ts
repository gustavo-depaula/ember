/**
 * Test-only adapter that exposes the subset of `expo-sqlite`'s async API used
 * by `db/repositories/*` and `db/events/store.ts`, backed by `better-sqlite3`.
 * Wired in via `vi.mock('expo-sqlite', ...)` from `src/test/setup.ts`.
 *
 * SQL semantics are real SQLite — same C library expo-sqlite uses on device.
 */

import Database from 'better-sqlite3'

type Params = readonly unknown[] | undefined

type RunResult = { lastInsertRowId: number; changes: number }

type FakeDb = {
  execAsync: (sql: string) => Promise<void>
  getFirstAsync: <T>(sql: string, params?: Params) => Promise<T | undefined>
  getAllAsync: <T>(sql: string, params?: Params) => Promise<T[]>
  runAsync: (sql: string, params?: Params) => Promise<RunResult>
  withTransactionAsync: (cb: () => Promise<void>) => Promise<void>
  closeAsync: () => Promise<void>
}

const dbs = new Map<string, Database.Database>()

function normalizeParams(params: Params): unknown[] {
  if (!params) return []
  return params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p))
}

function wrap(handle: Database.Database, name: string): FakeDb {
  return {
    async execAsync(sql) {
      handle.exec(sql)
    },
    async getFirstAsync<T>(sql: string, params?: Params) {
      const row = handle.prepare(sql).get(...normalizeParams(params)) as T | undefined
      return row ?? undefined
    },
    async getAllAsync<T>(sql: string, params?: Params) {
      return handle.prepare(sql).all(...normalizeParams(params)) as T[]
    },
    async runAsync(sql: string, params?: Params) {
      const info = handle.prepare(sql).run(...normalizeParams(params))
      return {
        lastInsertRowId: Number(info.lastInsertRowid ?? 0),
        changes: info.changes,
      }
    },
    async withTransactionAsync(cb) {
      // better-sqlite3's `transaction()` requires a sync callback, but
      // expo-sqlite's API hands us async work. Drive BEGIN/COMMIT manually so
      // the callback can await freely.
      handle.exec('BEGIN')
      try {
        await cb()
        handle.exec('COMMIT')
      } catch (err) {
        handle.exec('ROLLBACK')
        throw err
      }
    },
    async closeAsync() {
      handle.close()
      dbs.delete(name)
    },
  }
}

export async function openDatabaseAsync(name: string): Promise<FakeDb> {
  let handle = dbs.get(name)
  if (!handle) {
    handle = new Database(':memory:')
    dbs.set(name, handle)
  }
  return wrap(handle, name)
}

export async function deleteDatabaseAsync(name: string): Promise<void> {
  const handle = dbs.get(name)
  if (handle) {
    handle.close()
    dbs.delete(name)
  }
}

export function resetAllTestDbs(): void {
  for (const [, handle] of dbs) handle.close()
  dbs.clear()
}
