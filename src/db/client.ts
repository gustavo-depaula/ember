import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite'
import { useEffect, useReducer } from 'react'

import migrations from '../../drizzle/migrations'

let _db: ReturnType<typeof drizzle> | undefined

// Lazy proxy — defers openDatabaseSync until first property access (after init)
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_, prop) {
		if (!_db) throw new Error('Database not initialized — call useDbMigrations first')
		return Reflect.get(_db, prop)
	},
})

type MigrationState = { success: boolean; error: unknown }

// On web, openDatabaseSync fails because the wa-sqlite WASM worker hasn't loaded yet.
// We first open async (which awaits the worker), then open sync for drizzle.
export function useDbMigrations() {
	const [state, dispatch] = useReducer(
		(_prev: MigrationState, action: { type: 'done' } | { type: 'error'; error: unknown }) => {
			if (action.type === 'done') return { success: true, error: undefined }
			return { success: false, error: action.error }
		},
		{ success: false, error: undefined },
	)

	useEffect(() => {
		let cancelled = false

		async function init() {
			try {
				// Async open warms up the wa-sqlite worker (loads WASM, initializes VFS).
				// After this resolves, sync operations won't timeout.
				await openDatabaseAsync('ember.db')

				const expo = openDatabaseSync('ember.db')
				_db = drizzle(expo)
				await migrate(_db, migrations)

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
