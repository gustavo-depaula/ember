// Deep imports for the same reason as ./import: the moderation desk runs this under tsx.
import type {
  CreatedChurch,
  ProposedService,
  RecordChange,
  Resolution,
} from '@ember/api/src/moderation'
import { type Church, church, correction, type Service } from '@ember/api/src/schema'
import { and, eq, getTableColumns, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { encodeGeohash } from './geo'
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

function settleServices(churchId: string, current: Service[], proposed: ProposedService[]) {
  const services = proposed.map((service) => settleService(churchId, current, service))
  if (new Set(services.map((service) => service.id)).size !== services.length) {
    throw new Error('Two entries describe the same service (same kind, pattern and time).')
  }
  return services
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? [])
}

// The columns a change sets on its church, or undefined when it leaves the church alone. Any
// change, or `verified` (a correction about this church was accepted), counts as a moderator
// having verified the church.
export function resolveChurch(
  current: Church,
  change: RecordChange,
  now: Date,
  verified: boolean,
): ChurchUpdate | undefined {
  const fields: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(change.fields)) {
    const next = value?.trim() || null
    if (key === 'name' && !next) throw new Error('A church needs a name.')
    if (next !== (current[key as keyof RecordChange['fields']] ?? null)) fields[key] = next
  }
  const set: ChurchUpdate = fields

  if (change.services) {
    const services = settleServices(current.id, current.services ?? [], change.services)
    if (!sameJson(services, current.services)) {
      set.services = services.length ? services : null
      set.hasStructuredSchedule = services.length > 0
    }
  }
  if (change.texts && !sameJson(change.texts, current.texts)) {
    set.texts = change.texts.length ? change.texts : null
  }
  if (change.links && !sameJson(change.links, current.links)) {
    set.links = change.links.length ? change.links : null
  }

  if (Object.keys(set).length === 0 && !verified) return undefined
  const iso = now.toISOString()
  return { ...set, lastVerifiedAt: iso, verifiedSource: 'moderator', updatedAt: iso }
}

// A church the resolution adds, as a chapel of `parish` standing in `near`'s country and timezone.
function createChurch(
  id: string,
  created: CreatedChurch,
  near: Church,
  parishId: string,
  now: Date,
): Church {
  const services = settleServices(id, [], created.services)
  const iso = now.toISOString()
  const blank = Object.fromEntries(Object.keys(getTableColumns(church)).map((key) => [key, null]))
  return {
    ...(blank as unknown as Church),
    id,
    name: created.name,
    address: created.address?.trim() || null,
    city: created.city?.trim() || near.city,
    region: created.region?.trim() || near.region,
    postalCode: created.postalCode?.trim() || null,
    country: near.country,
    countryCode: near.countryCode,
    lat: created.lat,
    lng: created.lng,
    geohash: encodeGeohash(created.lat, created.lng),
    timezone: near.timezone,
    status: 'active',
    parishId,
    hasStructuredSchedule: services.length > 0,
    lastVerifiedAt: iso,
    verifiedSource: 'moderator',
    updatedAt: iso,
    services: services.length ? services : null,
    texts: created.texts?.length ? created.texts : null,
    links: created.links?.length ? created.links : null,
  }
}

export type ResolutionPlan = {
  statements: string[]
  // Every church the resolution touches, as it was and as it will be; `before` is missing for one
  // the resolution creates. The church the corrections are about comes first when it changes.
  records: Array<{ before?: Church; after: Church }>
}

// What carrying out a resolution takes.
//
// `current` is the church the corrections are about, undefined when they name one the directory
// doesn't hold (they can then only be rejected). `known` holds the current row of every other
// church the resolution may name, as a related church or as a parish. `createdIds` is an unused id
// for each church it creates. Only corrections still pending are touched, so applying twice is a
// no-op.
export function planResolution(
  resolution: Resolution,
  context: {
    churchId: string
    current: Church | undefined
    known: Church[]
    createdIds: string[]
    now: Date
    reviewedBy?: string
  },
): ResolutionPlan {
  const { churchId, current, known, createdIds, now, reviewedBy = 'moderator' } = context
  const byId = new Map([...known, ...(current ? [current] : [])].map((c) => [c.id, c]))
  const statements: string[] = []
  const records: ResolutionPlan['records'] = []

  const change = (before: Church, recordChange: RecordChange, verified: boolean) => {
    const update = resolveChurch(before, recordChange, now, verified)
    if (!update) return
    if (update.parishId) checkParish(before, update.parishId, byId)
    statements.push(toSql(qb.update(church).set(update).where(eq(church.id, before.id))))
    records.push({ before, after: { ...before, ...update } as Church })
  }

  const accepted = resolution.verdicts.some((verdict) => verdict.status === 'accepted')
  if (current) change(current, resolution, accepted)

  for (const related of resolution.related ?? []) {
    const before = byId.get(related.churchId)
    if (!before || related.churchId === churchId) {
      throw new Error(`${related.churchId} is not a church this resolution can change.`)
    }
    change(before, related, false)
  }

  const created = resolution.created ?? []
  if (created.length && !current) throw new Error('A new church needs a parish to belong to.')
  created.forEach((entry, index) => {
    const id = createdIds[index]
    if (!current || !id) throw new Error(`No id was reserved for ${entry.name}.`)
    // The parish as the resolution leaves it: the church itself, or the one it is a chapel of.
    const parishId =
      records.find((r) => r.after.id === churchId)?.after.parishId ?? current.parishId
    const after = createChurch(id, entry, current, parishId ?? current.id, now)
    statements.push(toSql(qb.insert(church).values(after)))
    records.push({ after })
  })

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
  return { statements, records }
}

// Parishes are one level deep: a chapel's parish is a church that is nobody's chapel.
function checkParish(chapel: Church, parishId: string, byId: Map<string, Church>) {
  const parish = byId.get(parishId)
  if (!parish) throw new Error(`${parishId}, named as a parish, is not a church the desk loaded.`)
  if (parish.id === chapel.id) throw new Error(`${chapel.name} cannot be its own parish.`)
  if (parish.parishId)
    throw new Error(`${parish.name} is itself a chapel, so it cannot be a parish.`)
}

// Undo: put each church back as it was read before the resolution, remove the ones it created, and
// reopen its corrections.
export function restoreToSql(
  befores: Church[],
  createdIds: string[],
  correctionIds: string[],
): string[] {
  const known = Object.keys(getTableColumns(church))
  const statements = befores.map(({ id, ...columns }) => {
    const set = Object.fromEntries(Object.entries(columns).filter(([key]) => known.includes(key)))
    // A row saved before the parish column existed has no value for it.
    return toSql(
      qb
        .update(church)
        .set({ parishId: null, ...set })
        .where(eq(church.id, id)),
    )
  })
  if (createdIds.length) {
    statements.push(toSql(qb.delete(church).where(inArray(church.id, createdIds))))
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
