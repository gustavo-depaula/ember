import type { EmberDb } from '@/lib/db-shared/protocol'

let _db: EmberDb | undefined

export function getDb(): EmberDb {
  if (!_db) throw new Error('Database not initialized — call useDbInit first')
  return _db
}

export function setDb(db: EmberDb | undefined) {
  _db = db
}
