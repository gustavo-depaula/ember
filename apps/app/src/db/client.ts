import { deleteDatabaseAsync, openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'
import { Platform } from 'react-native'

import { adaptNativeDb } from '@/lib/db-shared/native-adapter'

import { createEventsTable, replayAll } from './events'
import { getDb, setDb } from './instance'
import initialMigration from './migrations/0001_initial.sql'

// Native-only imports
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
        if (Platform.OS === 'web') {
          // Web: leader-elect via Web Locks; only the leader opens the OPFS-backed
          // SQLite file. Followers proxy SQL through BroadcastChannel.
          const { initEmberDb } = await import('@/lib/db-shared/manager')
          const proxy = await initEmberDb()
          setDb(proxy)
        } else {
          const rawDb = await openDatabaseAsync('ember.db')
          // One-time drop of the legacy custody schema (severity / fall_policy
          // columns existed in commit 2b520eb3 and earlier). Detect by
          // probing sqlite_master for the old column name; if present, drop
          // the three custody tables before re-running the migration so the
          // simplified shape lands cleanly. Idempotent: post-wipe, the probe
          // finds no severity column and this branch is skipped.
          const legacy = await rawDb.getFirstAsync<{ sql: string | null }>(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='commitments'",
          )
          if (legacy?.sql?.includes('severity')) {
            await rawDb.execAsync(
              'DROP TABLE IF EXISTS commitment_events; DROP TABLE IF EXISTS custody_sessions; DROP TABLE IF EXISTS commitments;',
            )
          }
          await rawDb.execAsync(initialMigration)
          const adapted = adaptNativeDb(rawDb)
          await createEventsTable(adapted)
          setDb(adapted)
        }

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
    const fs = require('expo-file-system') as typeof import('expo-file-system')
    const blobsDir = new fs.Directory(fs.Paths.document, 'blobs/')
    if (blobsDir.exists) blobsDir.delete()
    await expo.reloadAppAsync('Database reset')
  }
}
