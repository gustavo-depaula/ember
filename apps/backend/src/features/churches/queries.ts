import type { Church } from '@ember/api'
import { church, churchCell, verificationEvent } from '@ember/api'
import { and, asc, count, desc, eq, gt, inArray, type SQL, sql } from 'drizzle-orm'
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

export type ViewportFilter = {
  ranges: Array<[string, string]>
  bbox: Bbox
  kind?: string
  rite?: string
  status?: string
  institute?: string
}

const inRanges = (
  column: typeof church.geohash | typeof churchCell.cell,
  ranges: Array<[string, string]>,
) =>
  sql`(${sql.join(
    ranges.map(([lo, hi]) => sql`(${column} >= ${lo} AND ${column} < ${hi})`),
    sql` OR `,
  )})`

// Services are embedded JSON; a church qualifies when any of its services matches.
function offers(kind?: string, rite?: string): SQL | undefined {
  if (!kind && !rite) return undefined
  const k = kind ? sql`json_extract(value, '$.kind') = ${kind}` : sql`1`
  const r = rite ? sql`json_extract(value, '$.rite') = ${rite}` : sql`1`
  return sql`EXISTS (SELECT 1 FROM json_each(${church.services}) WHERE ${k} AND ${r})`
}

// Geohash ranges (the indexed prune) + the exact box + service filters, in SQL — so clusters and the
// capped list all see the same set, and a kind filter applies before any cap.
function viewportWhere(f: ViewportFilter): SQL {
  return and(
    inRanges(church.geohash, f.ranges),
    sql`${church.lat} BETWEEN ${f.bbox.minLat} AND ${f.bbox.maxLat}`,
    sql`${church.lng} BETWEEN ${f.bbox.minLng} AND ${f.bbox.maxLng}`,
    f.status ? eq(church.status, f.status) : undefined,
    f.institute ? eq(church.institute, f.institute) : undefined,
    offers(f.kind, f.rite),
  ) as SQL
}

// With `limit`, the scan stops at that many churches: asking for one more than fits tells a caller
// the box overflows without counting it.
export function churchesInViewport(db: Db, f: ViewportFilter, limit?: number): Promise<Church[]> {
  const rows = db.select().from(church).where(viewportWhere(f))
  return limit === undefined ? rows : rows.limit(limit)
}

export type CellCount = {
  cell: string
  count: number
  lat: number
  lng: number
  // Only for a one-church cell.
  churchId?: string
  churchName?: string
}

// Churches grouped by geohash cell of length `precision`: count + centroid per cell. `churchId`
// and `churchName` are only meaningful for a one-church cell (MIN over a single row is that row).
export function cellCounts(db: Db, f: ViewportFilter, precision: number): Promise<CellCount[]> {
  const cell = sql<string>`substr(${church.geohash}, 1, ${precision})`
  return db
    .select({
      cell,
      count: count(),
      lat: sql<number>`avg(${church.lat})`,
      lng: sql<number>`avg(${church.lng})`,
      churchId: sql<string>`min(${church.id})`,
      churchName: sql<string>`min(${church.name})`,
    })
    .from(church)
    .where(viewportWhere(f))
    .groupBy(cell)
}

// The same counts read from `church_cell`, which the triggers on `church` keep: a row per cell
// instead of a scan of its churches. A cell is counted whole, so one straddling the box's edge
// includes its churches just outside.
export function storedCellCounts(
  db: Db,
  q: { precision: number; ranges: Array<[string, string]>; kind?: string },
): Promise<CellCount[]> {
  return db
    .select({
      cell: churchCell.cell,
      count: churchCell.count,
      lat: sql<number>`${churchCell.latSum} / ${churchCell.count}`,
      lng: sql<number>`${churchCell.lngSum} / ${churchCell.count}`,
    })
    .from(churchCell)
    .where(
      and(
        eq(churchCell.precision, q.precision),
        eq(churchCell.kind, q.kind ?? ''),
        inRanges(churchCell.cell, q.ranges),
      ),
    )
}

// Who the churches in these cells are: `church_cell` counts a one-church cell without naming it.
export function churchesInCells(
  db: Db,
  q: { ranges: Array<[string, string]>; kind?: string },
): Promise<Pick<Church, 'id' | 'name' | 'geohash'>[]> {
  return db
    .select({ id: church.id, name: church.name, geohash: church.geohash })
    .from(church)
    .where(and(inRanges(church.geohash, q.ranges), offers(q.kind)))
}

export type ChurchIndexRow = Pick<
  Church,
  | 'id'
  | 'name'
  | 'longName'
  | 'city'
  | 'region'
  | 'countryCode'
  | 'hasStructuredSchedule'
  | 'updatedAt'
>

// The catalogue in id order, keyset-paged: each page is one range scan of the primary key, so
// walking every church costs the table once however deep the walk goes. Rows are the few columns a
// sitemap or a place listing needs, not the embedded schedule.
export function churchIndexPage(
  db: Db,
  page: { after?: string; scheduled?: boolean; limit: number },
): Promise<ChurchIndexRow[]> {
  const conds: SQL[] = []
  if (page.after) conds.push(gt(church.id, page.after))
  if (page.scheduled) conds.push(eq(church.hasStructuredSchedule, true))
  return db
    .select({
      id: church.id,
      name: church.name,
      longName: church.longName,
      city: church.city,
      region: church.region,
      countryCode: church.countryCode,
      hasStructuredSchedule: church.hasStructuredSchedule,
      updatedAt: church.updatedAt,
    })
    .from(church)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(church.id))
    .limit(page.limit)
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

// FTS5 name search → church ids; the caller hydrates full rows. The virtual table isn't in the
// Drizzle schema, so this drops to raw `sql`. With `near`, matches come nearest-first: a name like
// "Carmo" matches thousands of churches worldwide, and text rank alone puts every bare "Carmo" in
// Portugal ahead of the "NS do Carmo" down the street. Distance is the equirectangular square —
// plain arithmetic, since D1 may lack SQLite's math functions — with the longitude scale computed here.
export async function churchIdsMatchingText(
  db: Db,
  q: string,
  page: { limit: number; offset: number; near?: { lat: number; lng: number } },
): Promise<string[]> {
  const match = toPrefixMatchQuery(q)
  if (!match) return []
  const order = page.near
    ? (() => {
        const { lat, lng } = page.near
        const k = Math.cos((lat * Math.PI) / 180)
        return sql`((c.lat - ${lat}) * (c.lat - ${lat}) + (c.lng - ${lng}) * (c.lng - ${lng}) * ${k * k}), rank`
      })()
    : sql`rank`
  const rows = await db.all<{ id: string }>(sql`
    SELECT c.id AS id
    FROM church c
    JOIN church_fts ON church_fts.rowid = c.rowid
    WHERE church_fts MATCH ${match}
    ORDER BY ${order}
    LIMIT ${page.limit} OFFSET ${page.offset}
  `)
  return rows.map((r) => r.id)
}

export function churchesByIds(db: Db, ids: string[]): Promise<Church[]> {
  if (ids.length === 0) return Promise.resolve([])
  return db.select().from(church).where(inArray(church.id, ids))
}
