// The database of a browser that is one of an account's devices: the app's
// own schema in SQLite compiled to WebAssembly, held in memory and saved whole
// to IndexedDB after every write. It holds an event log and a few settings, so
// saving it whole costs little.
//
// Every tab has its own copy in memory. A write takes a lock shared by the
// tabs, first picks up a newer save if another tab made one, then saves and
// tells the other tabs, which load the save before they next read.
import initSqlJs, { type Database, type SqlValue } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import type { EmberDb, SqlBindParams, Statement } from '@/db/emberDb'

const idbName = 'ember'
const store = 'database'
const lockName = 'ember-db'
const channel = new BroadcastChannel('ember-db')

type Saved = { bytes: Uint8Array; version: number }

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

let idb: Promise<IDBDatabase> | undefined
function openIdb(): Promise<IDBDatabase> {
  idb ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(idbName, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(store)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return idb
}

async function readSaved(key: 'bytes' | 'version'): Promise<unknown> {
  const tx = (await openIdb()).transaction(store, 'readonly')
  return request(tx.objectStore(store).get(key))
}

async function save({ bytes, version }: Saved): Promise<void> {
  const tx = (await openIdb()).transaction(store, 'readwrite')
  tx.objectStore(store).put(bytes, 'bytes')
  tx.objectStore(store).put(version, 'version')
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Forgets the saved database; every tab of the site reloads. */
export async function eraseSaved(): Promise<void> {
  const tx = (await openIdb()).transaction(store, 'readwrite')
  tx.objectStore(store).clear()
  await request(tx.objectStore(store).count())
  channel.postMessage('erased')
}

// The DOM types take the callback's promise for the lock's result; the lock resolves to what it settles to.
function locked<T>(work: () => Promise<T>): Promise<T> {
  return navigator.locks.request(lockName, work) as unknown as Promise<T>
}

function bind(params: SqlBindParams = []): SqlValue[] {
  return params.map((p) => (typeof p === 'boolean' ? Number(p) : p))
}

/**
 * Opens the saved database, or an empty one. `onChange` runs when another tab
 * has written, after this tab has its write.
 */
export async function openBrowserDb(onChange: () => void): Promise<EmberDb> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  let version = ((await readSaved('version')) as number | undefined) ?? 0
  const loaded = (await readSaved('bytes')) as Uint8Array | undefined
  let db: Database = new SQL.Database(loaded)

  async function catchUp(): Promise<boolean> {
    const latest = ((await readSaved('version')) as number | undefined) ?? 0
    if (latest === version) return false
    const bytes = (await readSaved('bytes')) as Uint8Array | undefined
    db.close()
    db = new SQL.Database(bytes)
    version = latest
    return true
  }

  channel.onmessage = (message) => {
    if (message.data === 'erased') {
      location.reload()
      return
    }
    locked(catchUp).then((changed) => changed && onChange())
  }

  function write<T>(work: () => T): Promise<T> {
    return locked(async () => {
      await catchUp()
      const result = work()
      version += 1
      await save({ bytes: db.export(), version })
      channel.postMessage(version)
      return result
    })
  }

  function rows<T>(sql: string, params?: SqlBindParams): T[] {
    const statement = db.prepare(sql)
    try {
      statement.bind(bind(params))
      const out: T[] = []
      while (statement.step()) out.push(statement.getAsObject() as T)
      return out
    } finally {
      statement.free()
    }
  }

  return {
    execAsync: (sql) => write(() => void db.exec(sql)),
    runAsync: (sql, params) =>
      write(() => {
        db.run(sql, bind(params))
        const changes = db.getRowsModified()
        const lastInsertRowId = Number(
          db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] ?? 0,
        )
        return { changes, lastInsertRowId }
      }),
    getAllAsync: async (sql, params) => rows(sql, params),
    getFirstAsync: async <T>(sql: string, params?: SqlBindParams) =>
      rows<T>(sql, params)[0] ?? null,
    runBatchInTx: (statements: Statement[]) =>
      write(() => {
        db.exec('BEGIN')
        try {
          for (const s of statements) db.run(s.sql, bind(s.params))
          db.exec('COMMIT')
        } catch (err) {
          db.exec('ROLLBACK')
          throw err
        }
      }),
    closeAsync: async () => db.close(),
  }
}
