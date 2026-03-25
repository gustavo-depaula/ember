import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const practices = sqliteTable('practices', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	frequency: text('frequency').notNull().default('daily'),
	enabled: integer('enabled').notNull().default(1),
	sortOrder: integer('sort_order').notNull(),
})

export const practiceLogs = sqliteTable(
	'practice_logs',
	{
		date: text('date').notNull(),
		practiceId: text('practice_id')
			.notNull()
			.references(() => practices.id),
		completed: integer('completed').notNull().default(0),
		completedAt: integer('completed_at'),
	},
	(table) => [
		primaryKey({ columns: [table.date, table.practiceId] }),
		index('idx_practice_logs_date').on(table.date),
		index('idx_practice_logs_practice').on(table.practiceId),
	],
)

export const readingProgress = sqliteTable('reading_progress', {
	type: text('type').primaryKey(),
	currentBook: text('current_book').notNull(),
	currentChapter: integer('current_chapter').notNull(),
	currentVerse: integer('current_verse').notNull().default(1),
	completedBooks: text('completed_books').notNull().default('[]'),
	startDate: text('start_date').notNull(),
})

export const dailyOffice = sqliteTable(
	'daily_office',
	{
		date: text('date').notNull(),
		hour: text('hour').notNull(),
		completed: integer('completed').notNull().default(0),
		completedAt: integer('completed_at'),
	},
	(table) => [
		primaryKey({ columns: [table.date, table.hour] }),
		index('idx_daily_office_date').on(table.date),
	],
)

export const officePreferences = sqliteTable('office_preferences', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
})

export const cachedTranslations = sqliteTable(
	'cached_translations',
	{
		translation: text('translation').notNull(),
		book: text('book').notNull(),
		chapter: integer('chapter').notNull(),
		content: text('content').notNull(),
		cachedAt: integer('cached_at').notNull(),
	},
	(table) => [primaryKey({ columns: [table.translation, table.book, table.chapter] })],
)
