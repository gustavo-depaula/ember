import type { SQLiteDatabase } from 'expo-sqlite'

let _db: SQLiteDatabase | undefined

export function getDb(): SQLiteDatabase {
  if (!_db) throw new Error('Database not initialized — call useDbInit first')
  return _db
}

export function setDb(db: SQLiteDatabase | undefined) {
  _db = db
}
