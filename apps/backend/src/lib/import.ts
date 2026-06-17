// Deep imports (not the barrel) so the CLI run under tsx doesn't transitively load `expand.ts` →
// `rrule` (CJS), which the import path never needs.
import type { ChurchDump } from '@ember/api/src/dump'
import { church, churchLink, churchText, service } from '@ember/api/src/schema'
import { getTableColumns, inArray, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { Db } from '../db'
import { encodeGeohash } from './geo'

// Pure import logic (worker-safe — no node:fs). The CLI shell lives in scripts/import.ts.
// Reads `@ember/api` `ChurchDump` records, derives each church's slug id + geohash, then either
// inserts via Drizzle (`importRows`) or emits a `.sql` dump (`rowsToSql`) for `wrangler d1 import`.

// `sourceId -> generated id` for every dump church that carried a `sourceId`. Lets the (origin-blind)
// producer line its own records up with the ids we slugged — the only thing flowing back out.
export type IdMapping = { sourceId: string; id: string }

export type BuiltRows = {
  churches: (typeof church.$inferInsert)[]
  services: (typeof service.$inferInsert)[]
  texts: (typeof churchText.$inferInsert)[]
  links: (typeof churchLink.$inferInsert)[]
  mapping: IdMapping[]
}

// `prior` is the `sourceId -> id` mapping from an earlier import. Passing it makes re-imports
// idempotent on identity: a church with a known `sourceId` keeps its existing id even if its name or
// city changed (so app favorites / check-ins / reminders, all keyed on church id, never break). New
// `sourceId`s get a fresh slug that avoids every prior id. The returned `mapping` is the full updated
// ledger (reuse it as `prior` next time).
export function buildRows(dump: ChurchDump[], prior: IdMapping[] = []): BuiltRows {
  const rows: BuiltRows = { churches: [], services: [], texts: [], links: [], mapping: [] }
  const priorId = new Map(prior.map((m) => [m.sourceId, m.id]))
  // Reserve every prior id so a new church never slugs onto an id already owned by another source.
  const usedIds = new Set<string>(prior.map((m) => m.id))

  for (const d of dump) {
    const known = d.sourceId !== undefined ? priorId.get(d.sourceId) : undefined
    const id = known ?? uniqueSlug([d.name, d.city, d.region], usedIds)
    if (d.sourceId !== undefined) rows.mapping.push({ sourceId: d.sourceId, id })
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

// Child tables — no stable id of their own, so a re-import replaces a church's set wholesale.
const childTables = [service, churchText, churchLink] as const

// Apply via Drizzle, idempotently. Churches upsert on their id (last import wins for canonical
// fields); each imported church's children are deleted then reinserted, so re-running the same dump
// converges instead of duplicating. `correction` / `verification_event` reference churches but are
// never touched (no FK cascade), so crowd input survives a re-import. For the initial ~138k-church
// load use `rowsToSql` → `wrangler d1 import` instead (one bulk INSERT pass into an empty DB).
export async function importRows(db: Db, rows: BuiltRows): Promise<void> {
  for (const group of chunk(rows.churches, 25))
    if (group.length)
      await db
        .insert(church)
        .values(group)
        .onConflictDoUpdate({
          target: church.id,
          set: excludedSet(church),
        })

  const churchIds = rows.churches.map((c) => c.id)
  for (const table of childTables)
    for (const group of chunk(churchIds, 100))
      if (group.length) await db.delete(table).where(inArray(table.churchId, group))

  await insertChunked(db, service, rows.services)
  await insertChunked(db, churchText, rows.texts)
  await insertChunked(db, churchLink, rows.links)
}

async function insertChunked<T extends (typeof childTables)[number]>(
  db: Db,
  table: T,
  values: T['$inferInsert'][],
): Promise<void> {
  for (const group of chunk(values, 25)) {
    if (group.length) await db.insert(table).values(group)
  }
}

// ON CONFLICT DO UPDATE set that overwrites every non-PK column from the incoming row (`excluded.*`).
function excludedSet(table: typeof church): Record<string, ReturnType<typeof sql.raw>> {
  const set: Record<string, ReturnType<typeof sql.raw>> = {}
  for (const [key, col] of Object.entries(getTableColumns(table))) {
    if (col.primary) continue
    set[key] = sql.raw(`excluded."${col.name}"`)
  }
  return set
}

// Serialize the rows to a `.sql` dump. The schema is the single source of truth: Drizzle generates
// each statement's column list + placeholders; we inline the params as SQL literals. One
// self-contained statement per row keeps column lists aligned and the file streamable.
//
// `upsert: false` (default) → plain INSERTs for the initial bulk `wrangler d1 import` into an empty
// DB. `upsert: true` → idempotent re-import: churches `ON CONFLICT DO UPDATE`, each imported church's
// children deleted then reinserted. Apply the re-import SQL with `wrangler d1 execute --file`.
export function rowsToSql(rows: BuiltRows, { upsert = false }: { upsert?: boolean } = {}): string {
  const qb = drizzle({} as D1Database)
  const out: string[] = []
  const push = (q: { toSQL(): { sql: string; params: unknown[] } }) => {
    const { sql, params } = q.toSQL()
    out.push(`${inlineParams(sql, params)};`)
  }

  for (const row of rows.churches) {
    const insert = qb.insert(church).values(row)
    push(
      upsert ? insert.onConflictDoUpdate({ target: church.id, set: excludedSet(church) }) : insert,
    )
  }
  if (upsert) {
    const churchIds = rows.churches.map((c) => c.id)
    for (const table of childTables)
      for (const group of chunk(churchIds, 200))
        if (group.length) push(qb.delete(table).where(inArray(table.churchId, group)))
  }
  for (const row of rows.services) push(qb.insert(service).values(row))
  for (const row of rows.texts) push(qb.insert(churchText).values(row))
  for (const row of rows.links) push(qb.insert(churchLink).values(row))

  return out.join('\n')
}

// The `sourceId -> generated id` sidecar, one JSON object per line. The producer reads it back to
// align its records with the slugged ids; the public side keeps no copy.
export function mappingToJsonl(mapping: IdMapping[]): string {
  return mapping.map((m) => JSON.stringify(m)).join('\n')
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
