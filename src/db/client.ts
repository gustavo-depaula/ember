import type { SQLiteDatabase } from 'expo-sqlite'
import { openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'

import initialMigration from './migrations/0001_initial.sql'

let _db: SQLiteDatabase | undefined

export function getDb(): SQLiteDatabase {
  if (!_db) throw new Error('Database not initialized — call useDbInit first')
  return _db
}

type DbState = { success: boolean; error: unknown }

export function useDbInit() {
  const [state, dispatch] = useReducer(
    (_prev: DbState, action: { type: 'done' } | { type: 'error'; error: unknown }) => {
      if (action.type === 'done') return { success: true, error: undefined }
      return { success: false, error: action.error }
    },
    { success: false, error: undefined },
  )

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        _db = await openDatabaseAsync('ember.db')
        await _db.execAsync(initialMigration)

        if (!cancelled) dispatch({ type: 'done' })
      } catch (err) {
        if (!cancelled) dispatch({ type: 'error', error: err })
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
