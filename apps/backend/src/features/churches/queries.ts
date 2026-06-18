import type { Church } from '@ember/api'
import { church, verificationEvent } from '@ember/api'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { Db } from '../../db'
import type { Bbox } from '../../lib/geo'

// Geo prefilter: OR of half-open geohash prefix ranges. Built with the query builder (so rows map
// to camelCase typed Church) plus a raw `sql` fragment for the ranges — which stays sargable on the
// BINARY-collated geohash index. The caller haversine-refines the survivors.
export function churchesInGeohashRanges(
  db: Db,
  ranges: Array<[string, string]>,
  filters: { status?: string; institute?: string },
): Promise<Church[]> {
  const geoExpr = sql`(${sql.join(
    ranges.map(([lo, hi]) => sql`${church.geohash} >= ${lo} AND ${church.geohash} < ${hi}`),
    sql` OR `,
  )})`
  const conds = [geoExpr]
  if (filters.status) conds.push(eq(church.status, filters.status))
  if (filters.institute) conds.push(eq(church.institute, filters.institute))
  return db
    .select()
    .from(church)
    .where(and(...conds))
}

export async function churchById(db: Db, id: string): Promise<Church | undefined> {
  const rows = await db.select().from(church).where(eq(church.id, id)).limit(1)
  return rows[0]
}

export function verificationsForChurch(
  db: Db,
  churchId: string,
  page: { limit: number; offset: number },
) {
  return db
    .select()
    .from(verificationEvent)
    .where(eq(verificationEvent.churchId, churchId))
    .orderBy(desc(verificationEvent.createdAt))
    .limit(page.limit)
    .offset(page.offset)
}

// User text → a safe FTS5 prefix query. Each alphanumeric token (Unicode-aware, so accented names
// work) becomes a quoted prefix term, e.g. `Sagra Fam` → `"sagra"* "fam"*` — enabling search-as-you-
// type while neutralizing FTS operator characters the user might type.
export function toPrefixMatchQuery(raw: string): string {
  const tokens = raw.match(/[\p{L}\p{N}]+/gu) ?? []
  return tokens.map((token) => `"${token}"*`).join(' ')
}

// FTS5 name search → church ids in rank order; the caller hydrates full rows. The virtual table
// isn't in the Drizzle schema, so this drops to raw `sql`.
export async function churchIdsMatchingText(
  db: Db,
  q: string,
  page: { limit: number; offset: number },
): Promise<string[]> {
  const match = toPrefixMatchQuery(q)
  if (!match) return []
  const rows = await db.all<{ id: string }>(sql`
    SELECT c.id AS id
    FROM church c
    JOIN church_fts ON church_fts.rowid = c.rowid
    WHERE church_fts MATCH ${match}
    ORDER BY rank
    LIMIT ${page.limit} OFFSET ${page.offset}
  `)
  return rows.map((r) => r.id)
}

// Browse / filter (non-FTS path): country/city/bbox + church-level filters.
export function browseChurches(
  db: Db,
  opts: {
    country?: string
    city?: string
    bbox?: Bbox
    institute?: string
    status?: string
    limit: number
    offset: number
  },
): Promise<Church[]> {
  const conds = []
  if (opts.country) conds.push(eq(church.country, opts.country))
  if (opts.city) conds.push(eq(church.city, opts.city))
  if (opts.institute) conds.push(eq(church.institute, opts.institute))
  if (opts.status) conds.push(eq(church.status, opts.status))
  if (opts.bbox) {
    conds.push(
      sql`${church.lat} >= ${opts.bbox.minLat} AND ${church.lat} <= ${opts.bbox.maxLat} AND ${church.lng} >= ${opts.bbox.minLng} AND ${church.lng} <= ${opts.bbox.maxLng}`,
    )
  }
  return db
    .select()
    .from(church)
    .where(conds.length ? and(...conds) : undefined)
    .limit(opts.limit)
    .offset(opts.offset)
}

export function churchesByIds(db: Db, ids: string[]): Promise<Church[]> {
  if (ids.length === 0) return Promise.resolve([])
  return db.select().from(church).where(inArray(church.id, ids))
}
