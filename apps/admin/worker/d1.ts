import { inlineParams } from '@ember/backend/src/lib/import'
import { getTableColumns, type InferSelectModel } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

// The directory, read and written as SQL text. A resolution is planned as statements
// (`planResolution`, shared with the backend's tests), so the desk's own reads are written the
// same way and every value is inlined as a literal.

export type Row = Record<string, unknown>
export type D1 = ReturnType<typeof createD1>

export function lit(value: unknown): string {
  return inlineParams('?', [value])
}

// A raw D1 row (snake_case, JSON as text) as the model Drizzle would have returned.
export function fromRow<T extends SQLiteTable>(table: T, row: Row): InferSelectModel<T> {
  return Object.fromEntries(
    Object.entries(getTableColumns(table)).map(([key, column]) => {
      const value = row[column.name]
      return [key, value === null || value === undefined ? null : column.mapFromDriverValue(value)]
    }),
  ) as InferSelectModel<T>
}

export function createD1(db: D1Database) {
  // One result set per statement; statements sent together run as one transaction.
  async function query(...statements: string[]): Promise<Row[][]> {
    const results = await db.batch<Row>(statements.map((statement) => db.prepare(statement)))
    return results.map((result) => result.results)
  }

  async function execute(statements: string[]): Promise<void> {
    await db.batch(statements.map((statement) => db.prepare(statement)))
  }

  return { query, execute }
}
