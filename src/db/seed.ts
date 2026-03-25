import { count } from 'drizzle-orm'

import { db } from './client'
import { practices } from './schema'

const mvpPractices = [
	{ id: 'morning-offering', name: 'Morning Offering', icon: '🌅', sortOrder: 1 },
	{ id: 'mental-prayer', name: 'Mental Prayer', icon: '🙏', sortOrder: 2 },
	{ id: 'holy-mass', name: 'Holy Mass', icon: '✝️', sortOrder: 3 },
	{ id: 'spiritual-reading', name: 'Spiritual Reading', icon: '📖', sortOrder: 4 },
	{ id: 'angelus', name: 'Angelus', icon: '🔔', sortOrder: 5 },
	{ id: 'rosary', name: 'Rosary', icon: '📿', sortOrder: 6 },
	{ id: 'examination-conscience', name: 'Examination of Conscience', icon: '🕯️', sortOrder: 7 },
	{ id: 'night-prayer', name: 'Night Prayer', icon: '🌙', sortOrder: 8 },
]

export async function seedPractices() {
	const [result] = await db.select({ total: count() }).from(practices)
	if (result.total > 0) return

	await db.insert(practices).values(
		mvpPractices.map((p) => ({
			...p,
			frequency: 'daily' as const,
			enabled: 1,
		})),
	)
}
