// Deep imports (not the barrel) so the CLI run under tsx doesn't transitively load `expand.ts` →
// `rrule` (CJS), which the import path never needs.
import type { ChurchDump } from '@ember/api/src/dump'
import { church, churchLink, churchText, service } from '@ember/api/src/schema'
import { drizzle } from 'drizzle-orm/d1'
import type { Db } from '../db'
import { encodeGeohash } from './geo'

// Pure import logic (worker-safe — no node:fs). The CLI shell lives in scripts/import.ts.
// Reads `@ember/api` `ChurchDump` records, derives each church's slug id + geohash, then either
// inserts via Drizzle (`importRows`) or emits a `.sql` dump (`rowsToSql`) for `wrangler d1 import`.

export type BuiltRows = {
  churches: (typeof church.$inferInsert)[]
  services: (typeof service.$inferInsert)[]
  texts: (typeof churchText.$inferInsert)[]
  links: (typeof churchLink.$inferInsert)[]
}

export function buildRows(dump: ChurchDump[]): BuiltRows {
  const rows: BuiltRows = { churches: [], services: [], texts: [], links: [] }
  const usedIds = new Set<string>()

  for (const d of dump) {
    const id = uniqueSlug([d.name, d.city, d.region], usedIds)
    rows.churches.push({
      id,
      name: d.name,
      longName: d.longName,
      address: d.address,
      city: d.city,
      region: d.region,
      postalCode: d.postalCode,
      country: d.country,
      countryCode: d.countryCode,
      lat: d.lat,
      lng: d.lng,
      geohash: encodeGeohash(d.lat, d.lng),
      timezone: d.timezone,
      phoneE164: d.phoneE164,
      email: d.email,
      status: d.status,
      featured: d.featured,
      administration: d.administration,
      institute: d.institute,
      canonicalStatus: d.canonicalStatus,
      note: d.note,
      hasStructuredSchedule: d.hasStructuredSchedule ?? (d.services?.length ?? 0) > 0,
      lastVerifiedAt: d.lastVerifiedAt,
      verifiedSource: d.verifiedSource,
    })
    for (const s of d.services ?? [])
      rows.services.push({ id: crypto.randomUUID(), churchId: id, ...s })
    for (const t of d.texts ?? []) rows.texts.push({ churchId: id, ...t })
    for (const l of d.links ?? []) rows.links.push({ churchId: id, ...l })
  }
  return rows
}

// Insert via Drizzle, chunked to stay within D1's bound-variable limit. Parents before children
// (FK). For the initial ~138k-church load use `rowsToSql` → `wrangler d1 import` instead.
export async function importRows(db: Db, rows: BuiltRows): Promise<void> {
  await insertChunked(db, church, rows.churches)
  await insertChunked(db, service, rows.services)
  await insertChunked(db, churchText, rows.texts)
  await insertChunked(db, churchLink, rows.links)
}

async function insertChunked<
  T extends typeof church | typeof service | typeof churchText | typeof churchLink,
>(db: Db, table: T, values: T['$inferInsert'][]): Promise<void> {
  for (const group of chunk(values, 25)) {
    if (group.length) await db.insert(table).values(group)
  }
}

// Serialize the rows to a `.sql` dump for `wrangler d1 import`. The schema is the single source of
// truth: Drizzle generates each INSERT's column list + placeholders; we inline the params as SQL
// literals. One self-contained statement per row keeps column lists aligned and the file streamable.
export function rowsToSql(rows: BuiltRows): string {
  const qb = drizzle({} as D1Database)
  const out: string[] = []
  const emit = <T extends typeof church | typeof service | typeof churchText | typeof churchLink>(
    table: T,
    values: T['$inferInsert'][],
  ) => {
    for (const row of values) {
      const { sql, params } = qb.insert(table).values(row).toSQL()
      out.push(`${inlineParams(sql, params)};`)
    }
  }
  emit(church, rows.churches)
  emit(service, rows.services)
  emit(churchText, rows.texts)
  emit(churchLink, rows.links)
  return out.join('\n')
}

function inlineParams(sql: string, params: unknown[]): string {
  let i = 0
  return sql.replace(/\?/g, () => sqlLiteral(params[i++]))
}

function sqlLiteral(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? '1' : '0'
  return `'${String(v).replace(/'/g, "''")}'`
}

function uniqueSlug(parts: (string | undefined)[], used: Set<string>): string {
  const base = slugify(parts.filter(Boolean).join(' ')) || 'church'
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`
  used.add(id)
  return id
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/['’]/g, '') // drop apostrophes so "Mary's" → "marys", not "mary-s"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
