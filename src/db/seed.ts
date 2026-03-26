import { format } from 'date-fns'

import { getDb } from './client'

const mvpPractices = [
  { id: 'morning-offering', name: 'Morning Offering', icon: 'sunrise', sortOrder: 1 },
  { id: 'mental-prayer', name: 'Mental Prayer', icon: 'prayer', sortOrder: 2 },
  { id: 'holy-mass', name: 'Holy Mass', icon: 'mass', sortOrder: 3 },
  { id: 'spiritual-reading', name: 'Spiritual Reading', icon: 'reading', sortOrder: 4 },
  { id: 'angelus', name: 'Angelus', icon: 'bell', sortOrder: 5 },
  { id: 'rosary', name: 'Rosary', icon: 'rosary', sortOrder: 6 },
  { id: 'examination-conscience', name: 'Examination of Conscience', icon: 'candle', sortOrder: 7 },
  { id: 'night-prayer', name: 'Night Prayer', icon: 'moon', sortOrder: 8 },
]

const practiceIcons: Record<string, string> = {
  sunrise: '\u{1F305}',
  prayer: '\u{1F64F}',
  mass: '\u26EA',
  reading: '\u{1F4D6}',
  bell: '\u{1F514}',
  rosary: '\u{1F4FF}',
  candle: '\u{1F56F}',
  moon: '\u{1F319}',
}

export function getPracticeIcon(key: string): string {
  return practiceIcons[key] ?? key
}

export async function seedPractices() {
  const db = getDb()
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM practices',
  )
  if (result && result.total > 0) return

  for (const p of mvpPractices) {
    await db.runAsync(
      'INSERT INTO practices (id, name, icon, frequency, enabled, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [p.id, p.name, p.icon, 'daily', 1, p.sortOrder],
    )
  }
}

export async function seedReadingProgress() {
  const db = getDb()
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM reading_progress',
  )
  if (result && result.total > 0) return

  const today = format(new Date(), 'yyyy-MM-dd')

  for (const row of [
    { type: 'ot', book: 'genesis', chapter: 1 },
    { type: 'nt', book: 'matthew', chapter: 1 },
    { type: 'catechism', book: 'ccc', chapter: 1 },
  ]) {
    await db.runAsync(
      'INSERT INTO reading_progress (type, current_book, current_chapter, start_date) VALUES (?, ?, ?, ?)',
      [row.type, row.book, row.chapter, today],
    )
  }
}
