import type { ProposedService } from '@ember/api/src/moderation'
import type { Church } from '@ember/api/src/schema'
import type { StoredHistoryEntry } from '../server/types'
import type { FieldKey } from './draft'
import { bulletinOrder, describeService, diffSchedule, type Lang, serviceKinds } from './schedule'

// A logged change as a plain-text message another Mass-times directory can act on: which church,
// what changed, and the schedule as it now stands. Plain text because it travels by email and
// contact form.

const words = {
  en: {
    kinds: { mass: 'Mass', confession: 'Confession', adoration: 'Adoration' },
    added: 'new',
    removed: 'removed',
    changes: 'What changed',
    now: 'Schedule now',
    details: 'Details',
    none: 'none',
    website: 'Website',
    newChurch: 'not in most directories',
    chapelOf: 'Chapel of',
    confirmed: 'Confirmed',
    by: 'by the Ember Mass-times directory',
    fields: {
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
    },
  },
  pt: {
    kinds: { mass: 'Missa', confession: 'Confissão', adoration: 'Adoração' },
    added: 'horário novo',
    removed: 'horário removido',
    changes: 'O que mudou',
    now: 'Horários atuais',
    details: 'Dados',
    none: 'nenhum',
    website: 'Site',
    newChurch: 'ausente da maioria dos diretórios',
    chapelOf: 'Capela da paróquia',
    confirmed: 'Confirmado em',
    by: 'pelo diretório de horários de Missa do Ember',
    fields: {
      name: 'Nome',
      longName: 'Nome completo',
      address: 'Endereço',
      city: 'Cidade',
      region: 'Estado',
      postalCode: 'CEP',
      country: 'País',
      phoneE164: 'Telefone',
      email: 'E-mail',
      status: 'Situação',
      parishId: 'Capela da paróquia',
      administration: 'Administração',
      institute: 'Instituto',
      canonicalStatus: 'Situação canônica',
      note: 'Observação',
    },
  },
} satisfies Record<Lang, unknown>

// The language a church's own neighbours would write to each other in.
export function churchLang(church: Church | undefined): Lang {
  const brazil = church?.countryCode === 'BR' || church?.timezone.startsWith('America/Sao_Paulo')
  return brazil ? 'pt' : 'en'
}

// One church's part of a message. `proposed` is the schedule as the resolution stated it, which
// still carries the ids that pair a moved time with the one it replaced (the stored services have
// taken the ids of their new slots).
function churchSection(
  before: Church | undefined,
  after: Church,
  proposed: ProposedService[] | undefined,
  nameOf: (id: string) => string,
  lang: Lang,
): string {
  const t = words[lang]
  const kind = (key: string) => (t.kinds as Record<string, string>)[key] ?? key

  const schedule = proposed
    ? diffSchedule(before?.services ?? [], proposed).flatMap((row) => {
        if (row.state === 'same') return []
        if (row.state === 'removed') {
          return [`- ${kind(row.before.kind)}: ${describeService(row.before, lang)} (${t.removed})`]
        }
        const now = describeService(row.service, lang)
        return row.state === 'added'
          ? [`- ${kind(row.service.kind)}: ${now} (${t.added})`]
          : [`- ${kind(row.service.kind)}: ${describeService(row.before, lang)} → ${now}`]
      })
    : []

  const shown = (key: FieldKey, value: string | null) => {
    if (!value) return t.none
    return key === 'parishId' ? nameOf(value) : value
  }
  const fields = before
    ? (Object.keys(t.fields) as FieldKey[])
        .filter((key) => (before[key] ?? '') !== (after[key] ?? ''))
        .map((key) => `- ${t.fields[key]}: ${shown(key, before[key])} → ${shown(key, after[key])}`)
    : []

  const oldLinks = new Set((before?.links ?? []).map((link) => link.url))
  const links = (after.links ?? [])
    .filter((link) => !oldLinks.has(link.url))
    .map((link) => `- ${link.kind === 'website' ? t.website : link.kind}: ${link.url}`)

  const standing = serviceKinds.flatMap((key) => {
    const times = (after.services ?? [])
      .filter((service) => service.kind === key)
      .sort(bulletinOrder)
      .map((service) => describeService(service, lang))
    return times.length ? [`${kind(key)}: ${times.join('; ')}`] : []
  })

  const place = [after.address, after.city, after.region, after.country].filter(Boolean).join(', ')
  const changes = [...schedule, ...fields, ...links]
  return [
    [
      before ? after.name : `${after.name} (${t.newChurch})`,
      after.parishId ? `${t.chapelOf} ${nameOf(after.parishId)}` : '',
      place,
      `${after.lat.toFixed(5)}, ${after.lng.toFixed(5)}`,
    ]
      .filter(Boolean)
      .join('\n'),
    before && changes.length ? [`${t.changes}:`, ...changes].join('\n') : '',
    standing.length ? [`${t.now}:`, ...standing].join('\n') : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

// A resolution that reached several churches of a parish reads as one message, church by church.
export function changeMessage(entry: StoredHistoryEntry, lang: Lang): string {
  const { resolution, records } = entry
  const names = new Map(records.map((record) => [record.after.id, record.after.name]))
  const nameOf = (id: string) => names.get(id) ?? id
  const created = records.filter((record) => !record.before)

  const sections = records.map(({ before, after }) => {
    const proposed = (() => {
      if (!before)
        return resolution.created?.[created.findIndex((c) => c.after === after)]?.services
      if (after.id === entry.churchId) return resolution.services
      return resolution.related?.find((related) => related.churchId === after.id)?.services
    })()
    return churchSection(before, after, proposed, nameOf, lang)
  })
  return [
    ...sections,
    `${words[lang].confirmed} ${entry.appliedAt.slice(0, 10)} ${words[lang].by}.`,
  ].join('\n\n')
}
