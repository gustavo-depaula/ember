import { deleteDatabaseAsync, openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'
import { Platform } from 'react-native'

import { createEventsTable, replayAll } from './events'
import { getDb, setDb } from './instance'
import initialMigration from './migrations/0001_initial.sql'
import corpusMigration from './migrations/0002_corpus.sql'

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
        await _db.execAsync(corpusMigration)

        // One-shot purge of v1's extracted library files (~70MB) on first boot
        // after the v2 upgrade. Idempotent via a preference flag.
        const purgedRow = await _db.getFirstAsync<{ value: string }>(
          'SELECT value FROM preferences WHERE key = ?',
          ['hearth-v2-purged'],
        )
        if (!purgedRow) {
          await purgeV1Storage()
          await _db.runAsync(
            'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
            ['hearth-v2-purged', '1'],
          )
        }

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

async function purgeV1Storage(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const { idbDeletePrefix } = await import('@/lib/idb-fs')
      await idbDeletePrefix('books/')
    } else {
      const { Directory, Paths } = nativeFs
      const booksDir = new Directory(Paths.document, 'books/')
      if (booksDir.exists) booksDir.delete()
    }
  } catch (err) {
    console.warn('[startup] v1 storage purge failed:', err)
  }
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
