import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { openDatabaseSync } from 'expo-sqlite'

import migrations from '../../drizzle/migrations'

const expo = openDatabaseSync('ember.db')
export const db = drizzle(expo)

export function useDbMigrations() {
	return useMigrations(db, migrations)
}
