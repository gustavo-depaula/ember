import type { SQLiteDatabase } from 'expo-sqlite'
import { openDatabaseAsync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'

import initialMigration from './migrations/0001_initial.sql'
import completedChaptersMigration from './migrations/0002_completed_chapters.sql'

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
				// Migration 0002: add completed_chapters column (idempotent via try/catch)
				try {
					await _db.execAsync(completedChaptersMigration)
				} catch {
					// Column already exists — ignore
				}
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
