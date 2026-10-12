import type { ProposedService, RecordChange, Resolution } from '@ember/api/src/moderation'
import type { Church, ChurchLink, ChurchText } from '@ember/api/src/schema'
import type { Case } from '../worker/types'
import { asProposed, diffSchedule } from './schedule'

// What the moderator is about to apply for one case. It starts as Claude's proposal (or as the
// records untouched) and is edited freely; only its differences from the records are sent. A case
// is about one church, but a parish and its chapels share a schedule, so the draft can also reach
// other churches already in the directory (`related`) and add ones that are missing (`created`).

export const fieldLabels = {
  name: 'Name',
  longName: 'Full name',
  address: 'Address',
  city: 'City',
  region: 'State / region',
  postalCode: 'Postal code',
  country: 'Country',
  phoneE164: 'Phone',
  email: 'Email',
  status: 'Status',
  parishId: 'Chapel of',
  administration: 'Administration',
  institute: 'Institute',
  canonicalStatus: 'Canonical status',
  note: 'Note',
} as const

export type FieldKey = keyof typeof fieldLabels
export type Verdict = Resolution['verdicts'][number]['status']

// One church's record as it will be.
export type RecordDraft = {
  fields: Record<FieldKey, string>
  services: ProposedService[]
  texts: ChurchText[]
  links: ChurchLink[]
}

export type Draft = {
  verdicts: Record<string, Verdict | undefined>
  record: RecordDraft
  related: Array<{ churchId: string; record: RecordDraft }>
  // `key` only tells new churches apart on the page; coordinates stay text while being typed.
  created: Array<{ key: string; lat: string; lng: string; record: RecordDraft }>
}

const fieldKeys = Object.keys(fieldLabels) as FieldKey[]

// A church's record untouched (blank for a church that doesn't exist yet).
export function recordOf(church: Church | undefined): RecordDraft {
  return {
    fields: Object.fromEntries(
      fieldKeys.map((key) => [key, church?.[key] ?? '']),
    ) as RecordDraft['fields'],
    services: (church?.services ?? []).map(asProposed),
    texts: church?.texts ?? [],
    links: church?.links ?? [],
  }
}

export function otherChurch(item: Case, churchId: string): Church | undefined {
  return item.others.find((other) => other.church.id === churchId)?.church
}

// A record with a proposed change laid over it.
function withChange(church: Church | undefined, change: Partial<RecordChange>): RecordDraft {
  const record = recordOf(church)
  return {
    fields: { ...record.fields, ...change.fields },
    services: change.services ?? record.services,
    texts: change.texts ?? record.texts,
    links: change.links ?? record.links,
  }
}

export function recordDraft(item: Case): Draft {
  return { verdicts: {}, record: recordOf(item.church), related: [], created: [] }
}

export function proposalDraft(item: Case): Draft {
  const proposal = item.review?.proposal
  if (!proposal) return recordDraft(item)
  return {
    verdicts: Object.fromEntries(
      proposal.verdicts
        .filter((verdict) => item.suggestions.some((suggestion) => suggestion.id === verdict.id))
        .map((verdict) => [verdict.id, verdict.status]),
    ),
    record: withChange(item.church, proposal),
    related: (proposal.related ?? [])
      .filter((related) => otherChurch(item, related.churchId))
      .map((related) => ({
        churchId: related.churchId,
        record: withChange(otherChurch(item, related.churchId), related),
      })),
    created: (proposal.created ?? []).map(({ lat, lng, services, texts, links, ...fields }, i) => ({
      key: `new-${i}`,
      lat: String(lat),
      lng: String(lng),
      record: withChange(undefined, { fields, services, texts, links }),
    })),
  }
}

export function changedFields(church: Church | undefined, record: RecordDraft): FieldKey[] {
  return fieldKeys.filter((key) => record.fields[key].trim() !== (church?.[key] ?? ''))
}

const differs = (a: unknown, b: unknown) => JSON.stringify(a ?? []) !== JSON.stringify(b ?? [])

// How far one record departs from its church.
export function recordChanges(church: Church | undefined, record: RecordDraft) {
  const schedule = diffSchedule(church?.services ?? [], record.services).filter(
    (row) => row.state !== 'same',
  ).length
  const texts = differs(record.texts, church?.texts)
  const links = differs(record.links, church?.links)
  const details = changedFields(church, record).length + Number(texts) + Number(links)
  return { schedule, texts, links, details, any: schedule + details > 0 }
}

// How far the whole draft departs from the directory, for the Approve button and the queue.
export function countChanges(item: Case, draft: Draft) {
  const records = [
    recordChanges(item.church, draft.record),
    ...draft.related.map((related) =>
      recordChanges(otherChurch(item, related.churchId), related.record),
    ),
  ]
  const schedule = records.reduce((sum, record) => sum + record.schedule, 0)
  const details = records.reduce((sum, record) => sum + record.details, 0)
  const verdicts = Object.values(draft.verdicts).filter(Boolean) as Verdict[]
  return {
    schedule,
    details,
    created: draft.created.length,
    verdicts,
    any: schedule + details + draft.created.length + verdicts.length > 0,
  }
}

function toChange(church: Church | undefined, record: RecordDraft): RecordChange {
  const changes = recordChanges(church, record)
  return {
    fields: Object.fromEntries(
      changedFields(church, record).map((key) => [key, record.fields[key]]),
    ),
    services: changes.schedule ? record.services : undefined,
    texts: changes.texts ? record.texts : undefined,
    links: changes.links ? record.links : undefined,
  }
}

export function toResolution(item: Case, draft: Draft): Resolution {
  const related = draft.related
    .filter(({ churchId, record }) => recordChanges(otherChurch(item, churchId), record).any)
    .map(({ churchId, record }) => ({
      churchId,
      ...toChange(otherChurch(item, churchId), record),
    }))
  const created = draft.created.map(({ lat, lng, record }) => ({
    name: record.fields.name,
    address: record.fields.address || undefined,
    city: record.fields.city || undefined,
    region: record.fields.region || undefined,
    postalCode: record.fields.postalCode || undefined,
    lat: Number(lat),
    lng: Number(lng),
    services: record.services,
    texts: record.texts.length ? record.texts : undefined,
    links: record.links.length ? record.links : undefined,
  }))
  return {
    ...toChange(item.church, draft.record),
    related: related.length ? related : undefined,
    created: created.length ? created : undefined,
    verdicts: Object.entries(draft.verdicts).flatMap(([id, status]) =>
      status ? [{ id, status }] : [],
    ),
  }
}
