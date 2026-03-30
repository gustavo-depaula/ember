import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SQLiteDatabase } from 'expo-sqlite'
import { openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'

import initialMigration from './migrations/0001_initial.sql'
import completedChaptersMigration from './migrations/0002_completed_chapters.sql'
import customizablePracticesMigration from './migrations/0003_customizable_practices.sql'
import contentColumnsMigration from './migrations/0004_practice_content_columns.sql'
import readingTracksMigration from './migrations/0005_reading_tracks.sql'
import practiceCompletionsMigration from './migrations/0006_practice_completions.sql'
import practiceReadingTracksMigration from './migrations/0007_practice_reading_tracks.sql'
import dataModelV2Migration from './migrations/0008_data_model_v2.sql'

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

        // Legacy migrations (idempotent)
        await _db.execAsync(initialMigration)
        try {
          await _db.execAsync(completedChaptersMigration)
        } catch {}
        try {
          await _db.execAsync(customizablePracticesMigration)
        } catch {}
        try {
          await _db.execAsync(contentColumnsMigration)
        } catch {}
        await _db.execAsync(readingTracksMigration)
        await _db.execAsync(practiceCompletionsMigration)
        await _db.execAsync(practiceReadingTracksMigration)

        // V2 migration
        await _db.execAsync(dataModelV2Migration)

        // Migrate AsyncStorage → preferences table
        await migrateAsyncStorage()

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

const asyncStorageKeys = [
  'translation',
  'psalter-cycle',
  'language',
  'liturgical-calendar',
  'jurisdiction',
  'time-travel-date',
  'form-preferences',
  'mass-form',
  'reading-font-family',
  'reading-font-size',
  'reading-line-height',
  'reading-margin',
  'reading-text-align',
  'theme',
  'bible-book',
  'bible-chapter',
  'catechism-paragraph',
]

async function migrateAsyncStorage() {
  if (!_db) return

  // Check if migration already ran
  const existing = await _db.getFirstAsync<{ cnt: number }>(
    'SELECT count(*) as cnt FROM preferences',
  )
  if (existing && existing.cnt > 0) return

  const values = await AsyncStorage.multiGet(asyncStorageKeys)
  const toInsert = values.filter(([_, v]) => v !== null) as [string, string][]

  if (toInsert.length === 0) return

  for (const [key, value] of toInsert) {
    await _db.runAsync('INSERT OR IGNORE INTO preferences (key, value) VALUES (?, ?)', [key, value])
  }

  // Migrate legacy mass-form to form-preferences
  const massForm = toInsert.find(([k]) => k === 'mass-form')
  if (massForm) {
    const formPrefsRow = toInsert.find(([k]) => k === 'form-preferences')
    let formPrefs: Record<string, string> = {}
    if (formPrefsRow) {
      try {
        formPrefs = JSON.parse(formPrefsRow[1])
      } catch {}
    }
    if (!formPrefs.mass) {
      formPrefs.mass = massForm[1]
      await _db.runAsync('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)', [
        'form-preferences',
        JSON.stringify(formPrefs),
      ])
    }
  }
}
