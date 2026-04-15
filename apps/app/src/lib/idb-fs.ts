const dbName = 'ember-fs'
const storeName = 'files'
const dbVersion = 1

let dbPromise: Promise<IDBDatabase> | undefined

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, dbVersion)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(storeName)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx(
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; done: Promise<void> }> {
  const db = await openDb()
  const transaction = db.transaction(storeName, mode)
  const store = transaction.objectStore(storeName)
  const done = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  return { store, done }
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbWriteFile(path: string, data: string | Uint8Array): Promise<void> {
  const { store, done } = await tx('readwrite')
  store.put(data, path)
  await done
}

export async function idbWriteBatch(entries: [string, string | Uint8Array][]): Promise<void> {
  const { store, done } = await tx('readwrite')
  for (const [path, data] of entries) {
    store.put(data, path)
  }
  await done
}

export async function idbReadText(path: string): Promise<string | undefined> {
  const { store } = await tx('readonly')
  const result = await request(store.get(path))
  if (typeof result === 'string') return result
  if (result instanceof Uint8Array) return new TextDecoder().decode(result)
  return undefined
}

export async function idbReadBinary(path: string): Promise<Uint8Array | undefined> {
  const { store } = await tx('readonly')
  const result = await request(store.get(path))
  if (result instanceof Uint8Array) return result
  if (typeof result === 'string') return new TextEncoder().encode(result)
  return undefined
}

export async function idbDeletePrefix(prefix: string): Promise<void> {
  const { store, done } = await tx('readwrite')
  const range = IDBKeyRange.bound(prefix, prefix + '\uffff')
  const cursorReq = store.openKeyCursor(range)
  await new Promise<void>((resolve, reject) => {
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (cursor) {
        store.delete(cursor.key)
        cursor.continue()
      } else {
        resolve()
      }
    }
    cursorReq.onerror = () => reject(cursorReq.error)
  })
  await done
}

export async function idbClearAll(): Promise<void> {
  const { store, done } = await tx('readwrite')
  store.clear()
  await done
}
