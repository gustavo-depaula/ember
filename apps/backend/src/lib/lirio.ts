import type { CreatedChurch, ProposedService, RecordChange } from '@ember/api/src/moderation'
import { asProposed, dayCodes, weeklyDays, weeklyRule } from '@ember/api/src/schedule'
import type { Church, ChurchLink } from '@ember/api/src/schema'

// Lírio Católico's directory against ours, for the admin panel's Lírio desk. Pure, like
// `moderation.ts`: it reads his records and our church and says what could change.
//
// His model is one grid per kind: weekday → times, nothing else. It can't say "first Friday of the
// month" or "only in Lent", so his grid is never laid over ours. A change is what he did — a time he
// added, a time he removed, a field he edited — and lands only on our plain weekly rules. A monthly
// or seasonal Mass of ours is outside anything he can express, so nothing here removes it.

export type LirioDay = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB'
export type LirioGrid = Partial<Record<LirioDay, string[]>>

export type LirioRecord = {
  id: number
  nome: string
  cidade?: string
  uf?: string
  bairro?: string
  endereco?: string
  cep?: string
  telefones?: string[]
  site?: string
  instagram?: string
  paroco?: string
  observacoes?: string
  eventos?: string
  atualizado?: string
  lat?: number
  lng?: number
  missas?: LirioGrid
  confissoes?: LirioGrid
  adoracao?: LirioGrid
}

const lirioDays: Record<LirioDay, string> = {
  DOM: 'SU',
  SEG: 'MO',
  TER: 'TU',
  QUA: 'WE',
  QUI: 'TH',
  SEX: 'FR',
  SAB: 'SA',
}
const grids = { missas: 'mass', confissoes: 'confession', adoracao: 'adoration' } as const
type ServiceKind = (typeof grids)[keyof typeof grids]

// A field of his we can carry over, or one we have no place for and only show.
const fields = {
  nome: 'name',
  endereco: 'address',
  cep: 'postalCode',
  telefones: 'phone',
  site: 'website',
  instagram: 'instagram',
} as const
const notes = { paroco: 'pastor', observacoes: 'info', eventos: 'events' } as const
export type LirioField = (typeof fields)[keyof typeof fields]
export type LirioNote = (typeof notes)[keyof typeof notes]

export type LirioChange =
  | { key: string; type: 'field'; field: LirioField; before?: string; after?: string }
  | { key: string; type: 'note'; field: LirioNote; before?: string; after?: string }
  | {
      key: string
      type: 'slot'
      kind: ServiceKind
      op: 'add' | 'remove'
      day: string // BYDAY code
      startTime: string
      endTime?: string
    }

// What he changed between two of his records. `before` is missing for a church he added (then
// everything he holds counts as a change), `after` for one he removed (nothing to carry over).
export function lirioChanges(before: LirioRecord | undefined, after: LirioRecord): LirioChange[] {
  const changes: LirioChange[] = []
  for (const [key, field] of Object.entries(fields) as Array<[keyof typeof fields, LirioField]>) {
    const x = text(before?.[key])
    const y = text(after[key])
    if (comparable(field, x) !== comparable(field, y)) {
      changes.push({ key: `field-${field}`, type: 'field', field, before: x, after: y })
    }
  }
  for (const [key, field] of Object.entries(notes) as Array<[keyof typeof notes, LirioNote]>) {
    const x = text(before?.[key])
    const y = text(after[key])
    if (comparable(field, x) !== comparable(field, y)) {
      changes.push({ key: `note-${field}`, type: 'note', field, before: x, after: y })
    }
  }
  for (const [grid, kind] of Object.entries(grids) as Array<[keyof typeof grids, ServiceKind]>) {
    const x = slots(before?.[grid])
    const y = slots(after[grid])
    for (const [id, slot] of y) {
      if (!x.has(id)) changes.push({ key: `${kind}+${id}`, type: 'slot', kind, op: 'add', ...slot })
    }
    for (const [id, slot] of x) {
      if (!y.has(id))
        changes.push({ key: `${kind}-${id}`, type: 'slot', kind, op: 'remove', ...slot })
    }
  }
  return changes
}

function text(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || undefined
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

// Formatting isn't a change: phones compare as national digits, the rest by their words.
function comparable(field: string, value: string | undefined): string {
  if (!value) return ''
  if (field === 'phone') {
    return value
      .split(',')
      .map((phone) => phone.replace(/\D/g, '').replace(/^55/, ''))
      .sort()
      .join(',')
  }
  if (field === 'instagram') return instagramHandle(value) ?? ''
  return value.replace(/\s+/g, ' ').toLowerCase()
}

// "07:00" or "12:00–19:00" under each weekday → slots keyed `SU 07:00`.
function slots(grid: LirioGrid | undefined) {
  const out = new Map<string, { day: string; startTime: string; endTime?: string }>()
  for (const [day, times] of Object.entries(grid ?? {}) as Array<[LirioDay, string[]]>) {
    const code = lirioDays[day]
    if (!code) continue
    for (const time of times) {
      const [startTime, endTime] = time.split(/\s*[–-]\s*/).map(clock)
      if (!startTime) continue
      out.set(`${code} ${startTime}`, { day: code, startTime, endTime })
    }
  }
  return out
}

function clock(time: string | undefined): string | undefined {
  const m = time?.match(/^(\d{1,2})[:h](\d{2})$/)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : undefined
}

// How a change stands against our church: `ready` to carry over, `already` true of ours, `absent`
// a removal of something ours never had, `info` a note we have no field for, and `narrower` a time he
// added that ours holds on fewer dates than every week (a first Friday, a Lent-only Mass): his grid
// can only write it as weekly, so it is the one change never to take on his word.
export type ChangeState = 'ready' | 'already' | 'absent' | 'info' | 'narrower'

export function changeState(church: Church | undefined, change: LirioChange): ChangeState {
  if (change.type === 'note') return 'info'
  if (!church) return 'ready'
  if (change.type === 'field') {
    const ours = ourField(church, change.field)
    return comparable(change.field, ours) === comparable(change.field, change.after)
      ? 'already'
      : 'ready'
  }
  const services = church.services ?? []
  const has = services.some((service) => weeklyHolds(service, change))
  if (change.op === 'remove') return has ? 'ready' : 'absent'
  if (has) return 'already'
  return services.some((service) => narrowerHolds(service, change)) ? 'narrower' : 'ready'
}

export function ourField(church: Church, field: LirioField): string | undefined {
  switch (field) {
    case 'name':
      return church.longName ?? church.name
    case 'address':
      return church.address ?? undefined
    case 'postalCode':
      return church.postalCode ?? undefined
    case 'phone':
      return church.phoneE164 ?? undefined
    case 'website':
      return church.links?.find((link) => link.kind === 'website')?.url
    case 'instagram':
      return church.links?.find((link) => link.kind === 'instagram')?.url
  }
}

// A rule of ours that is "these days, every week" (no months, no ordinals) and holds this slot.
function weeklyHolds(
  service: { kind: string; rrule: string; startTime: string },
  slot: { kind: string; day: string; startTime: string },
): boolean {
  if (service.kind !== slot.kind || service.startTime !== slot.startTime) return false
  return weeklyDays(service.rrule)?.includes(dayCodes.indexOf(slot.day)) ?? false
}

// A rule of ours at this slot's time and weekday that isn't every week: a monthly ordinal or a
// season's months.
function narrowerHolds(
  service: { kind: string; rrule: string; startTime: string },
  slot: { kind: string; day: string; startTime: string },
): boolean {
  if (service.kind !== slot.kind || service.startTime !== slot.startTime) return false
  if (weeklyDays(service.rrule)) return false
  const byDay = service.rrule.match(/BYDAY=([^;]+)/)?.[1] ?? ''
  return byDay.split(',').some((token) => token.replace(/^[+-]?\d/, '') === slot.day)
}

// The picked changes as a change to our church's record.
export function toRecordChange(church: Church, picked: LirioChange[]): RecordChange {
  const change: RecordChange = { fields: {} }
  const links = [...(church.links ?? [])]
  let linksChanged = false
  for (const item of picked) {
    if (item.type !== 'field') continue
    const value = item.after ?? ''
    if (item.field === 'name') change.fields[church.longName ? 'longName' : 'name'] = value
    if (item.field === 'address') change.fields.address = value
    if (item.field === 'postalCode') change.fields.postalCode = value
    if (item.field === 'phone') change.fields.phoneE164 = phoneE164(value) ?? ''
    if (item.field === 'website' || item.field === 'instagram') {
      const url = item.field === 'website' ? websiteUrl(value) : instagramUrl(value)
      const at = links.findIndex((link) => link.kind === item.field)
      if (at >= 0) links.splice(at, 1)
      if (url) links.push({ kind: item.field, url } as ChurchLink)
      linksChanged = true
    }
  }
  if (linksChanged) change.links = links

  const slotChanges = picked.filter((item) => item.type === 'slot')
  if (slotChanges.length) {
    change.services = slotChanges.reduce(applySlot, (church.services ?? []).map(asProposed))
  }
  return change
}

// A slot he added or removed, on our services. A removal takes the day off our weekly rule at that
// time (and the rule with it, once no day is left); an addition joins a weekly rule at the same time
// or starts one. Rules that aren't plain weekly ones are never touched.
function applySlot(
  services: ProposedService[],
  slot: Extract<LirioChange, { type: 'slot' }>,
): ProposedService[] {
  const day = dayCodes.indexOf(slot.day)
  if (slot.op === 'remove') {
    return services.flatMap((service) => {
      if (!weeklyHolds(service, slot)) return [service]
      const days = (weeklyDays(service.rrule) ?? []).filter((d) => d !== day)
      return days.length ? [{ ...service, rrule: weeklyRule(days) }] : []
    })
  }
  if (services.some((service) => weeklyHolds(service, slot))) return services
  const joins = services.findIndex(
    (service) =>
      service.kind === slot.kind &&
      service.startTime === slot.startTime &&
      (service.endTime ?? undefined) === slot.endTime &&
      weeklyDays(service.rrule) !== undefined,
  )
  if (joins >= 0) {
    return services.map((service, i) =>
      i === joins
        ? { ...service, rrule: weeklyRule([...(weeklyDays(service.rrule) ?? []), day]) }
        : service,
    )
  }
  return [
    ...services,
    {
      kind: slot.kind,
      rrule: weeklyRule([day]),
      startTime: slot.startTime,
      ...(slot.endTime ? { endTime: slot.endTime } : {}),
    },
  ]
}

// A church of his we don't hold, as a church of its own. Undefined without coordinates: the
// moderator has to place it first.
export function toCreated(
  record: LirioRecord,
  place?: { lat: number; lng: number },
): CreatedChurch | undefined {
  const lat = place?.lat ?? record.lat
  const lng = place?.lng ?? record.lng
  if (lat === undefined || lng === undefined) return undefined
  const services = lirioChanges(undefined, record)
    .filter((change) => change.type === 'slot')
    .reduce(applySlot, [] as ProposedService[])
  const links = [
    record.site && websiteUrl(record.site) && { kind: 'website', url: websiteUrl(record.site) },
    record.instagram &&
      instagramUrl(record.instagram) && { kind: 'instagram', url: instagramUrl(record.instagram) },
  ].filter(Boolean) as ChurchLink[]
  return {
    standalone: true,
    name: record.nome,
    address: record.endereco,
    city: record.cidade,
    region: record.uf,
    postalCode: record.cep,
    phoneE164: phoneE164(record.telefones?.[0]),
    lat,
    lng,
    services,
    links: links.length ? links : undefined,
  }
}

// "(75) 3261-3443" → "+557532613443". Brazilian numbers only: his directory is Brazil's.
export function phoneE164(phone: string | undefined): string | undefined {
  const digits = phone?.split(',')[0]?.replace(/\D/g, '') ?? ''
  if (digits.length < 10) return undefined
  return `+${digits.startsWith('55') && digits.length > 11 ? digits : `55${digits}`}`
}

function websiteUrl(site: string): string | undefined {
  const value = site.trim()
  if (!value) return undefined
  return /^https?:\/\//.test(value) ? value : `https://${value}`
}

// He keeps a bare handle, a "@handle" or a whole profile URL; ours keep the URL.
function instagramHandle(value: string): string | undefined {
  const m = value.trim().match(/^(?:https?:\/\/(?:www\.)?instagram\.com\/)?@?([\w.]+)\/?/i)
  return m?.[1]?.toLowerCase()
}

function instagramUrl(value: string): string | undefined {
  const handle = instagramHandle(value)
  return handle ? `https://www.instagram.com/${handle}/` : undefined
}
