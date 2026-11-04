import type { Resolution } from '@ember/api/src/moderation'
import { church as churchTable, lirioItem } from '@ember/api/src/schema'
import {
  boundingBox,
  coveringPrefixes,
  haversineKm,
  prefixRanges,
} from '@ember/backend/src/lib/geo'
import { changeState, type LirioRecord, lirioChanges } from '@ember/backend/src/lib/lirio'
import { createD1, fromRow, lit, type Row } from './d1'
import type { DeskApi } from './desk'
import type { LirioDesk, LirioItem, Seen } from './types'

// The Lírio desk. Lírio Católico's directory grew from the same scrape as ours; each week the
// moderator downloads his copy and uploads it here. Every church of his whose `atualizado` moved
// since the copy before becomes an item: what he changed, set against our church, to carry over or
// skip. Nothing reaches the directory except through the moderation desk's own apply, so the change
// log and undo hold these changes like any other.

// A church of his and one of ours are the same when they stand this close: his import kept the
// scrape's coordinates to 4 decimals (about 10 m).
const sameKm = 0.02
// How far the desk looks for a church of ours that one he added may already be, and for the one a
// new church takes its country and timezone from.
const nearbyKm = 1
const anchorKm = 60
const nearbyLimit = 6
// Statements per D1 batch when an upload writes many rows.
const batchSize = 200

export function createLirio(env: { DB: D1Database }, target: LirioDesk['target'], desk: DeskApi) {
  const d1 = createD1(env.DB)

  async function load(): Promise<LirioDesk> {
    // Undoing a change on the moderation desk puts the item it carried back in the queue.
    await d1.execute([
      `UPDATE lirio_item SET status = 'pending', settled_at = NULL, change_id = NULL
       WHERE status = 'applied'
         AND change_id IN (SELECT id FROM moderation_change WHERE undone_at IS NOT NULL)`,
    ])
    const [itemRows, [held], settled] = await d1.query(
      "SELECT * FROM lirio_item WHERE status = 'pending' ORDER BY created_at, lirio_id",
      'SELECT COUNT(*) AS n, MAX(updated) AS latest FROM lirio_church',
      "SELECT status, COUNT(*) AS n FROM lirio_item WHERE status != 'pending' GROUP BY status",
    )
    const items = itemRows.map((row) => fromRow(lirioItem, row))
    const ids = [...new Set(items.flatMap((item) => item.churchId ?? []))]
    const [churchRows] = await d1.query(
      `SELECT * FROM church WHERE id IN (${ids.map(lit).join(', ') || "''"})`,
    )
    const churches = new Map(churchRows.map((row) => [row.id as string, fromRow(churchTable, row)]))

    // For a church of his we can't name: ours around where he puts it.
    const unplaced = items.filter((item) => {
      const record = item.after as LirioRecord | null
      return !item.churchId && record?.lat !== undefined && record.lng !== undefined
    })
    const around = unplaced.length
      ? await d1.query(
          ...unplaced.map((item) => {
            const { lat, lng } = item.after as Required<LirioRecord>
            return `SELECT * FROM church WHERE ${cells(lat, lng, nearbyKm)}`
          }),
        )
      : []
    const nearby = new Map(
      unplaced.map((item, index) => {
        const { lat, lng } = item.after as Required<LirioRecord>
        const found = around[index]
          .map((row) => fromRow(churchTable, row))
          .map((c) => ({
            church: c,
            distanceKm: Math.round(haversineKm(lat, lng, c.lat, c.lng) * 100) / 100,
          }))
          .filter((n) => n.distanceKm <= nearbyKm)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, nearbyLimit)
        return [item.id, found]
      }),
    )

    return {
      target,
      held: Number(held?.n ?? 0),
      latestEdit: (held?.latest as string | null) ?? undefined,
      items: items.flatMap((item): LirioItem[] => {
        const before = (item.before as LirioRecord | null) ?? undefined
        const after = (item.after as LirioRecord | null) ?? undefined
        const church = item.churchId ? churches.get(item.churchId) : undefined
        const changes = after
          ? lirioChanges(before, after).map((change) => ({
              ...change,
              state: changeState(church, change),
            }))
          : []
        // An edit he took back leaves nothing to decide.
        if (after && changes.length === 0) return []
        return [
          {
            id: item.id,
            lirioId: item.lirioId,
            createdAt: item.createdAt,
            before,
            after,
            church,
            nearby: nearby.get(item.id) ?? [],
            changes,
          },
        ]
      }),
      applied: Number(settled.find((row) => row.status === 'applied')?.n ?? 0),
      skipped: Number(settled.find((row) => row.status === 'skipped')?.n ?? 0),
    }
  }

  // A week's download, as the page read it out of the zip. The first ever only sets the baseline.
  async function upload(records: LirioRecord[]): Promise<LirioDesk & { report: string }> {
    if (records.length < 1000) {
      throw new Error(`The download holds ${records.length} churches; his has some 15,000.`)
    }
    const [heldRows, pendingRows] = await d1.query(
      'SELECT lirio_id, updated, church_id, record FROM lirio_church',
      "SELECT id, lirio_id FROM lirio_item WHERE status = 'pending'",
    )
    const held = new Map(heldRows.map((row) => [Number(row.lirio_id), row]))
    const pending = new Map(pendingRows.map((row) => [Number(row.lirio_id), row.id as string]))
    const baseline = held.size === 0
    const now = new Date().toISOString()
    const statements: string[] = []
    const counts = { added: 0, changed: 0, removed: 0 }

    const item = (
      lirioId: number,
      churchId: unknown,
      before: unknown,
      after: LirioRecord | null,
    ) => {
      const open = pending.get(lirioId)
      // A church already waiting keeps the copy it was first compared with; only his latest moves.
      if (open) return `UPDATE lirio_item SET after = ${json(after)} WHERE id = ${lit(open)}`
      return `INSERT INTO lirio_item (id, lirio_id, church_id, status, before, after, created_at)
        VALUES (${lit(crypto.randomUUID())}, ${lirioId}, ${lit(churchId ?? null)}, 'pending',
        ${json(before)}, ${json(after)}, ${lit(now)})`
    }

    const fresh = records.filter((record) => !held.has(record.id))
    const joined = await joinByPlace(fresh)
    for (const record of records) {
      const prior = held.get(record.id)
      const updated = record.atualizado ?? null
      if (!prior) {
        const churchId = joined.get(record.id) ?? null
        statements.push(
          `INSERT INTO lirio_church (lirio_id, record, updated, church_id)
           VALUES (${record.id}, ${json(record)}, ${lit(updated)}, ${lit(churchId)})`,
        )
        if (!baseline) {
          statements.push(item(record.id, churchId, null, record))
          counts.added++
        }
        continue
      }
      if (prior.updated === updated) continue
      statements.push(
        `UPDATE lirio_church SET record = ${json(record)}, updated = ${lit(updated)}
         WHERE lirio_id = ${record.id}`,
        item(record.id, prior.church_id, JSON.parse(prior.record as string), record),
      )
      counts.changed++
    }
    const present = new Set(records.map((record) => record.id))
    for (const [lirioId, prior] of held) {
      if (present.has(lirioId)) continue
      statements.push(
        item(lirioId, prior.church_id, JSON.parse(prior.record as string), null),
        `DELETE FROM lirio_church WHERE lirio_id = ${lirioId}`,
      )
      counts.removed++
    }
    for (let i = 0; i < statements.length; i += batchSize) {
      await d1.execute(statements.slice(i, i + batchSize))
    }

    const report = baseline
      ? `Took ${records.length} churches as the starting copy. Next week's upload lists what he changed.`
      : `${counts.changed} changed, ${counts.added} added, ${counts.removed} removed since the last upload.`
    return { ...(await load()), report }
  }

  // Ours for each church of his standing where one of ours stands.
  async function joinByPlace(records: LirioRecord[]): Promise<Map<number, string>> {
    const placed = records.filter((r) => r.lat !== undefined && r.lng !== undefined)
    if (placed.length === 0) return new Map()
    const found = await d1.query(
      ...placed.map(
        (r) => `SELECT id, lat, lng FROM church WHERE ${cells(r.lat ?? 0, r.lng ?? 0, sameKm)}`,
      ),
    )
    return new Map(
      placed.flatMap((record, index) => {
        const match = found[index].find(
          (row: Row) =>
            haversineKm(record.lat ?? 0, record.lng ?? 0, row.lat as number, row.lng as number) <=
            sameKm,
        )
        return match ? [[record.id, match.id as string]] : []
      }),
    )
  }

  async function pendingItem(id: string) {
    const [[row]] = await d1.query(
      `SELECT * FROM lirio_item WHERE id = ${lit(id)} AND status = 'pending'`,
    )
    if (!row) throw new Error('That change is no longer waiting. Refresh.')
    return fromRow(lirioItem, row)
  }

  // Say which church of ours a church he added (or one we couldn't place) is.
  async function match(id: string, churchId: string | undefined): Promise<LirioDesk> {
    const found = await pendingItem(id)
    await d1.execute([
      `UPDATE lirio_item SET church_id = ${lit(churchId ?? null)} WHERE id = ${lit(id)}`,
      `UPDATE lirio_church SET church_id = ${lit(churchId ?? null)} WHERE lirio_id = ${found.lirioId}`,
    ])
    return load()
  }

  // Carry an item over: a resolution about our church, or, for a church we don't hold, one that
  // creates it beside the nearest church of ours, whose country and timezone it takes.
  async function apply(
    id: string,
    body: { resolution: Resolution; seen: Seen },
  ): Promise<LirioDesk> {
    const found = await pendingItem(id)
    const created = body.resolution.created?.[0]
    const anchor = found.churchId ? undefined : created && (await nearest(created.lat, created.lng))
    const churchId = found.churchId ?? anchor?.id
    if (!churchId) {
      throw new Error(
        created
          ? `No church of ours stands within ${anchorKm} km to take a timezone from.`
          : 'Pick the church of ours this is, or add it as a new church.',
      )
    }
    const seen = anchor ? { [anchor.id]: anchor.updatedAt } : body.seen
    const record = (found.after ?? found.before) as LirioRecord
    const edited = record.atualizado ? `, edited ${record.atualizado.slice(0, 10)}` : ''
    const changeId = await desk.write(
      churchId,
      body.resolution,
      seen,
      `Lírio Católico: ${record.nome}${edited}`,
    )
    await settle(id, 'applied', changeId)
    return load()
  }

  // Widening, so a city centre stops at its first few streets.
  async function nearest(lat: number, lng: number) {
    for (const km of [2, 15, anchorKm]) {
      const [rows] = await d1.query(`SELECT * FROM church WHERE ${cells(lat, lng, km)}`)
      const found = rows
        .map((row) => fromRow(churchTable, row))
        .map((c) => ({ c, km: haversineKm(lat, lng, c.lat, c.lng) }))
        .filter((n) => n.km <= km)
        .sort((a, b) => a.km - b.km)[0]?.c
      if (found) return found
    }
    return undefined
  }

  async function skip(id: string): Promise<LirioDesk> {
    await pendingItem(id)
    await settle(id, 'skipped')
    return load()
  }

  async function settle(id: string, status: 'applied' | 'skipped', changeId?: string) {
    await d1.execute([
      `UPDATE lirio_item SET status = ${lit(status)}, settled_at = ${lit(new Date().toISOString())},
       change_id = ${lit(changeId ?? null)} WHERE id = ${lit(id)}`,
    ])
  }

  return { load, upload, match, apply, skip }
}

// A JSON column's literal; NULL for a record that isn't there.
function json(value: unknown): string {
  return value === null || value === undefined ? 'NULL' : lit(JSON.stringify(value))
}

// The geohash ranges covering a disc, as a WHERE clause on `church`.
function cells(lat: number, lng: number, km: number): string {
  const precision = km < 0.1 ? 7 : km < 5 ? 5 : km < 20 ? 4 : 3
  const prefixes = coveringPrefixes(boundingBox(lat, lng, km), precision)
  return prefixRanges(prefixes)
    .map(([lo, hi]) => `(geohash >= ${lit(lo)} AND geohash < ${lit(hi)})`)
    .join(' OR ')
}
