// Deep imports (not the barrel) so the CLI run under tsx doesn't transitively load `expand.ts` →
// `rrule` (CJS), which the import path never needs.
import type { ChurchDump, ServiceDump } from '@ember/api/src/dump'
import { church } from '@ember/api/src/schema'
import { getTableColumns, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { Db } from '../db'
import { encodeGeohash } from './geo'

// Pure import logic (worker-safe — no node:fs). The CLI shell lives in scripts/import.ts.
// Reads `@ember/api` `ChurchDump` records, derives each church's slug id + geohash, and embeds the
// schedule/text/link content as JSON on the church row (no child tables). Then either inserts via
// Drizzle (`importRows`) or emits a `.sql` dump (`rowsToSql`).

// `sourceId -> generated id` for every dump church that carried a `sourceId`. Lets the (origin-blind)
// producer line its own records up with the ids we slugged — the only thing flowing back out.
export type IdMapping = { sourceId: string; id: string }

export type BuiltRows = {
  churches: (typeof church.$inferInsert)[]
  mapping: IdMapping[]
}

// `prior` is the `sourceId -> id` mapping from an earlier import. Passing it makes re-imports
// idempotent on identity: a church with a known `sourceId` keeps its existing id even if its name or
// city changed (so app favorites / check-ins / reminders, all keyed on church id, never break). New
// `sourceId`s get a fresh slug that avoids every prior id. The returned `mapping` is the full updated
// ledger (reuse it as `prior` next time).
export function buildRows(dump: ChurchDump[], prior: IdMapping[] = []): BuiltRows {
  const rows: BuiltRows = { churches: [], mapping: [] }
  const priorId = new Map(prior.map((m) => [m.sourceId, m.id]))
  // Reserve every prior id so a new church never slugs onto an id already owned by another source.
  const usedIds = new Set<string>(prior.map((m) => m.id))

  for (const d of dump) {
    const known = d.sourceId !== undefined ? priorId.get(d.sourceId) : undefined
    const id = known ?? uniqueSlug([d.name, d.city, d.region], usedIds)
    if (d.sourceId !== undefined) rows.mapping.push({ sourceId: d.sourceId, id })

    const services = (d.services ?? []).map((s) => ({ id: serviceId(id, s), ...s }))
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
      hasStructuredSchedule: d.hasStructuredSchedule ?? services.length > 0,
      lastVerifiedAt: d.lastVerifiedAt,
      verifiedSource: d.verifiedSource,
      // embedded owned content — null (not []) when empty, so an absent column reads cleanly
      services: services.length ? services : undefined,
      texts: d.texts?.length ? d.texts : undefined,
      links: d.links?.length ? d.links : undefined,
    })
  }
  return rows
}

// Deterministic per-church service id (`churchId:hash(slot)`) so a `correction` can target one Mass
// and a re-import keeps the same id for an unchanged slot — strictly more stable than a random UUID.
function serviceId(churchId: string, s: ServiceDump): string {
  const sig = [s.kind, s.rrule, s.startTime, s.endTime ?? '', s.language ?? '', s.rite ?? ''].join(
    '|',
  )
  return `${churchId}:${fnv1a(sig)}`
}

function fnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

// Apply via Drizzle, idempotently: churches upsert on their id (last import wins; the embedded
// services/texts/links are replaced wholesale, since they live on the row). `correction` /
// `verification_event` reference churches but are never touched, so crowd input survives a re-import.
// For the initial ~138k-church load use `rowsToSql` → `wrangler d1 import` instead.
export async function importRows(db: Db, rows: BuiltRows): Promise<void> {
  for (const group of chunk(rows.churches, 25))
    if (group.length)
      await db
        .insert(church)
        .values(group)
        .onConflictDoUpdate({ target: church.id, set: excludedSet(church) })
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

// Serialize the church rows to a `.sql` dump. The schema is the single source of truth: Drizzle
// generates each statement's column list + placeholders (embedded JSON columns serialize to a JSON
// string param); we inline the params as SQL literals. One self-contained statement per row.
//
// `upsert: false` (default) → plain INSERTs for the initial bulk `wrangler d1 import` into an empty
// DB. `upsert: true` → re-import: `ON CONFLICT DO UPDATE` (replaces the whole row incl. its embedded
// content). Apply the re-import SQL with `wrangler d1 execute --file`.
export function rowsToSql(rows: BuiltRows, { upsert = false }: { upsert?: boolean } = {}): string {
  const qb = drizzle({} as D1Database)
  const out: string[] = []
  for (const row of rows.churches) {
    const insert = qb.insert(church).values(row)
    const q = upsert
      ? insert.onConflictDoUpdate({ target: church.id, set: excludedSet(church) })
      : insert
    const { sql, params } = q.toSQL()
    out.push(`${inlineParams(sql, params)};`)
  }
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
