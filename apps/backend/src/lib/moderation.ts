// Deep imports for the same reason as ./import: the moderation desk runs this under tsx.
import type { ProposedService, Resolution } from '@ember/api/src/moderation'
import { type Church, church, correction, type Service } from '@ember/api/src/schema'
import { and, eq, getTableColumns, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { inlineParams, serviceId } from './import'

// Turns a moderator's resolution into the SQL that carries it out. Pure and worker-safe: the
// moderation desk (apps/moderation) reaches D1 through wrangler, which takes SQL text, so this
// emits statements the way `rowsToSql` does and never holds a database. Run a returned list as one
// batch.

type ChurchUpdate = Partial<typeof church.$inferInsert>
type Statement = { toSQL(): { sql: string; params: unknown[] } }

const qb = drizzle({} as D1Database)

function toSql(query: Statement): string {
  const { sql, params } = query.toSQL()
  return inlineParams(sql, params)
}

const serviceContent = [
  'kind',
  'rite',
  'language',
  'rrule',
  'startTime',
  'endTime',
  'exdate',
  'rdate',
  'locationNote',
  'note',
] as const

// A proposed entry as it will be stored. The id is always the slot's hash (the import's invariant),
// so an entry that still matches a stored service is that service, provenance and all; anything new
// or edited is the moderator's.
function settleService(churchId: string, current: Service[], proposed: ProposedService): Service {
  const content = Object.fromEntries(
    serviceContent.flatMap((key) => {
      const value = proposed[key]?.trim()
      return value ? [[key, value]] : []
    }),
  ) as Omit<ProposedService, 'id'>
  const id = serviceId(churchId, content)
  const prior = current.find((service) => service.id === id)
  if (prior && serviceContent.every((key) => (prior[key] ?? undefined) === content[key])) {
    return prior
  }
  return { id, ...content, source: 'manual' }
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? [])
}

// The columns a resolution changes on its church, or undefined when it leaves the church alone
// (every correction rejected, nothing edited). Any change, or any accepted correction, counts as a
// moderator having verified the church.
export function resolveChurch(
  current: Church,
  resolution: Resolution,
  now: Date,
): ChurchUpdate | undefined {
  const fields: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(resolution.fields)) {
    const next = value.trim() || null
    if (key === 'name' && !next) throw new Error('A church needs a name.')
    if (next !== (current[key as keyof Resolution['fields']] ?? null)) fields[key] = next
  }
  const set: ChurchUpdate = fields

  if (resolution.services) {
    const services = resolution.services.map((s) =>
      settleService(current.id, current.services ?? [], s),
    )
    const ids = new Set(services.map((service) => service.id))
    if (ids.size !== services.length) {
      throw new Error('Two entries describe the same service (same kind, pattern and time).')
    }
    if (!sameJson(services, current.services)) {
      set.services = services.length ? services : null
      set.hasStructuredSchedule = services.length > 0
    }
  }
  if (resolution.texts && !sameJson(resolution.texts, current.texts)) {
    set.texts = resolution.texts.length ? resolution.texts : null
  }
  if (resolution.links && !sameJson(resolution.links, current.links)) {
    set.links = resolution.links.length ? resolution.links : null
  }

  const accepted = resolution.verdicts.some((verdict) => verdict.status === 'accepted')
  if (Object.keys(set).length === 0 && !accepted) return undefined

  const iso = now.toISOString()
  return { ...set, lastVerifiedAt: iso, verifiedSource: 'moderator', updatedAt: iso }
}

// `current` is undefined when the corrections name a church the directory doesn't hold; they can
// then only be rejected. Only corrections still pending are touched, so applying twice is a no-op.
export function resolutionToSql(
  churchId: string,
  current: Church | undefined,
  resolution: Resolution,
  now: Date,
  reviewedBy = 'moderator',
): string[] {
  const update = current ? resolveChurch(current, resolution, now) : undefined
  const statements = update
    ? [toSql(qb.update(church).set(update).where(eq(church.id, churchId)))]
    : []
  for (const verdict of resolution.verdicts) {
    statements.push(
      toSql(
        qb
          .update(correction)
          .set({ status: verdict.status, reviewedAt: now.toISOString(), reviewedBy })
          .where(
            and(
              eq(correction.id, verdict.id),
              eq(correction.churchId, churchId),
              eq(correction.status, 'pending'),
            ),
          ),
      ),
    )
  }
  return statements
}

// Undo: put the church back as it was read before the resolution and reopen its corrections.
export function restoreToSql(before: Church | undefined, correctionIds: string[]): string[] {
  const statements: string[] = []
  if (before) {
    const { id, ...columns } = before
    const known = Object.keys(getTableColumns(church))
    const set = Object.fromEntries(Object.entries(columns).filter(([key]) => known.includes(key)))
    statements.push(toSql(qb.update(church).set(set).where(eq(church.id, id))))
  }
  if (correctionIds.length) {
    statements.push(
      toSql(
        qb
          .update(correction)
          .set({ status: 'pending', reviewedAt: null, reviewedBy: null })
          .where(inArray(correction.id, correctionIds)),
      ),
    )
  }
  return statements
}
