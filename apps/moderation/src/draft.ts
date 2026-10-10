import type { ProposedService, Resolution } from '@ember/api/src/moderation'
import type { ChurchLink, ChurchText } from '@ember/api/src/schema'
import type { Case } from '../server/types'
import { asProposed, diffSchedule } from './schedule'

// What the moderator is about to apply for one church. It starts as Claude's proposal (or as the
// record untouched) and is edited freely; only its differences from the record are sent.

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
  administration: 'Administration',
  institute: 'Institute',
  canonicalStatus: 'Canonical status',
  note: 'Note',
} as const

export type FieldKey = keyof typeof fieldLabels
export type Verdict = Resolution['verdicts'][number]['status']

export type Draft = {
  fields: Record<FieldKey, string>
  services: ProposedService[]
  texts: ChurchText[]
  links: ChurchLink[]
  verdicts: Record<string, Verdict | undefined>
}

const fieldKeys = Object.keys(fieldLabels) as FieldKey[]

export function recordDraft(item: Case): Draft {
  return {
    fields: Object.fromEntries(
      fieldKeys.map((key) => [key, item.church?.[key] ?? '']),
    ) as Draft['fields'],
    services: (item.church?.services ?? []).map(asProposed),
    texts: item.church?.texts ?? [],
    links: item.church?.links ?? [],
    verdicts: {},
  }
}

export function proposalDraft(item: Case): Draft {
  const record = recordDraft(item)
  const proposal = item.review?.proposal
  if (!proposal) return record
  return {
    fields: { ...record.fields, ...proposal.fields },
    services: proposal.services ?? record.services,
    texts: proposal.texts ?? record.texts,
    links: proposal.links ?? record.links,
    verdicts: Object.fromEntries(
      proposal.verdicts
        .filter((verdict) => item.suggestions.some((suggestion) => suggestion.id === verdict.id))
        .map((verdict) => [verdict.id, verdict.status]),
    ),
  }
}

export function changedFields(item: Case, draft: Draft): FieldKey[] {
  return fieldKeys.filter((key) => draft.fields[key].trim() !== (item.church?.[key] ?? ''))
}

const differs = (a: unknown, b: unknown) => JSON.stringify(a ?? []) !== JSON.stringify(b ?? [])

// How far the draft departs from the record, for the Apply button and the queue.
export function countChanges(item: Case, draft: Draft) {
  const schedule = diffSchedule(item.church?.services ?? [], draft.services).filter(
    (row) => row.state !== 'same',
  ).length
  const texts = differs(draft.texts, item.church?.texts)
  const links = differs(draft.links, item.church?.links)
  const fields = changedFields(item, draft).length
  const verdicts = Object.values(draft.verdicts).filter(Boolean) as Verdict[]
  return {
    schedule,
    details: fields + Number(texts) + Number(links),
    texts,
    links,
    verdicts,
    any: schedule + fields + Number(texts) + Number(links) + verdicts.length > 0,
  }
}

export function toResolution(item: Case, draft: Draft): Resolution {
  const changes = countChanges(item, draft)
  return {
    fields: Object.fromEntries(changedFields(item, draft).map((key) => [key, draft.fields[key]])),
    services: changes.schedule ? draft.services : undefined,
    texts: changes.texts ? draft.texts : undefined,
    links: changes.links ? draft.links : undefined,
    verdicts: Object.entries(draft.verdicts).flatMap(([id, status]) =>
      status ? [{ id, status }] : [],
    ),
  }
}
