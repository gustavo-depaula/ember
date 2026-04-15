import { deleteDatabaseAsync, openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'
import { Platform } from 'react-native'

import { createEventsTable, replayAll } from './events'
import { getDb, setDb } from './instance'
import initialMigration from './migrations/0001_initial.sql'

// Native-only imports
// biome-ignore lint: conditional require for platform compat
const nativeFs = Platform.OS !== 'web' ? (require('expo-file-system') as any) : undefined
// biome-ignore lint: conditional require for platform compat
const expo = Platform.OS !== 'web' ? (require('expo') as any) : undefined

export { getDb }

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
        const _db = await openDatabaseAsync('ember.db')
        setDb(_db)
        await _db.execAsync(initialMigration)

        // Event sourcing: create events table + replay into memory
        await createEventsTable(_db)
        await replayAll()

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

export async function resetDatabase() {
  try {
    const db = getDb()
    await db.closeAsync()
  } catch {
    // db not initialized, nothing to close
  }
  setDb(undefined)
  await deleteDatabaseAsync('ember.db')

  if (Platform.OS === 'web') {
    const { idbClearAll } = await import('@/lib/idb-fs')
    await idbClearAll()
    window.location.reload()
  } else {
    const { Directory, Paths } = nativeFs
    const booksDir = new Directory(Paths.document, 'books/')
    if (booksDir.exists) booksDir.delete()
    await expo.reloadAppAsync('Database reset')
  }
}
