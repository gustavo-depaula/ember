import {
  attachment,
  church,
  churchLink,
  churchText,
  correction,
  service,
  verificationEvent,
} from '@ember/api'
import { drizzle } from 'drizzle-orm/d1'

const schema = {
  church,
  service,
  churchText,
  churchLink,
  correction,
  verificationEvent,
  attachment,
}

// Drizzle client over the D1 binding. Simple CRUD uses the query builder; the hot geo queries drop
// to raw `sql` templates (see features/churches/queries.ts).
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Db = ReturnType<typeof createDb>
