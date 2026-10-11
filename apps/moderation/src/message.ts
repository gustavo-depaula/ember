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

export function changeMessage(entry: StoredHistoryEntry, lang: Lang): string {
  const { before, after } = entry
  if (!before || !after) return ''
  const t = words[lang]
  const kind = (key: string) => (t.kinds as Record<string, string>)[key] ?? key

  // The resolution still carries the ids that pair a moved time with the one it replaced; the
  // stored services have taken the ids of their new slots.
  const schedule = entry.resolution.services
    ? diffSchedule(before.services ?? [], entry.resolution.services).flatMap((row) => {
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

  const fields = (Object.keys(t.fields) as FieldKey[])
    .filter((key) => (before[key] ?? '') !== (after[key] ?? ''))
    .map((key) => `- ${t.fields[key]}: ${before[key] || t.none} → ${after[key] || t.none}`)

  const oldLinks = new Set((before.links ?? []).map((link) => link.url))
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
  return [
    [after.name, place, `${after.lat.toFixed(5)}, ${after.lng.toFixed(5)}`]
      .filter(Boolean)
      .join('\n'),
    [`${t.changes}:`, ...schedule, ...fields, ...links].join('\n'),
    standing.length ? [`${t.now}:`, ...standing].join('\n') : '',
    `${t.confirmed} ${entry.appliedAt.slice(0, 10)} ${t.by}.`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
