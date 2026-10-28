import type { ProposedService } from './moderation'
import {
  bulletinOrder,
  describeService,
  diffSchedule,
  type Lang,
  riteLabels,
  serviceKinds,
} from './schedule'
import type { Church, moderationChange, Service } from './schema'

// A logged change, church by church: what changed and the schedule as it now stands. The API
// serves it at `/changes` for pages to draw, and as a plain-text message another Mass-times
// directory can act on (it travels by email and contact form), which the moderation desk shows
// for copying. Both come from `changeDetails`, so the page and the message cannot disagree.

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
    serviceFields: {
      rite: 'rite',
      language: 'language',
      locationNote: 'place',
      note: 'note',
      exdate: 'cancelled dates',
      rdate: 'added dates',
    },
    values: {
      active: 'open',
      temporarily_closed: 'temporarily closed',
      closed: 'closed',
      diocesan: 'diocesan',
      religious_institute: 'religious institute',
      society_apostolic_life: 'society of apostolic life',
      personal_prelature: 'personal prelature',
      ordinariate: 'ordinariate',
      independent: 'independent',
      other: 'other',
      full_communion: 'in full communion',
      irregular: 'irregular',
      not_in_communion: 'not in communion with Rome',
    },
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
    serviceFields: {
      rite: 'rito',
      language: 'idioma',
      locationNote: 'local',
      note: 'observação',
      exdate: 'datas canceladas',
      rdate: 'datas acrescentadas',
    },
    values: {
      active: 'aberta',
      temporarily_closed: 'fechada temporariamente',
      closed: 'fechada',
      diocesan: 'diocesana',
      religious_institute: 'instituto religioso',
      society_apostolic_life: 'sociedade de vida apostólica',
      personal_prelature: 'prelazia pessoal',
      ordinariate: 'ordinariato',
      independent: 'independente',
      other: 'outra',
      full_communion: 'em plena comunhão',
      irregular: 'irregular',
      not_in_communion: 'fora da comunhão com Roma',
    },
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

type FieldKey = keyof typeof words.en.fields
type ChangeEntry = Pick<
  typeof moderationChange.$inferSelect,
  'churchId' | 'appliedAt' | 'records' | 'resolution'
>

// The language a church's own neighbours would write to each other in.
export function churchLang(church: Church | undefined): Lang {
  const brazil = church?.countryCode === 'BR' || church?.timezone.startsWith('America/Sao_Paulo')
  return brazil ? 'pt' : 'en'
}

/**
 * One line of what changed: a service or a field. `before` is missing for something new and
 * `after` for something removed.
 */
export type ChangeLine = { label: string; before?: string; after?: string }

export type ChangedChurch = {
  id: string
  name: string
  /** Created by this change: most other directories don't have it yet. */
  isNew: boolean
  /** The parish this church is a chapel of. */
  parish?: { id: string; name: string }
  place: string
  lat: number
  lng: number
  /** Empty for a church the change created: all of it is new. */
  changes: ChangeLine[]
  /** The schedule as it now stands, a line of times per kind of service. */
  schedule: Array<{ kind: string; label: string; times: string[] }>
}

const serviceFields = ['rite', 'language', 'locationNote', 'note', 'exdate', 'rdate'] as const

// A service whose days and times stayed put changed in something its schedule line doesn't
// show, so each side names it: "Dom 09:00 · rito: nenhum" → "Dom 09:00 · rito: Novus Ordo".
function withServiceFields(
  line: string,
  service: Service | ProposedService,
  other: Service | ProposedService,
  lang: Lang,
): string {
  const t = words[lang]
  const shown = (key: (typeof serviceFields)[number]) => {
    const value = service[key]
    if (!value) return t.none
    return key === 'rite' ? (riteLabels[value] ?? value) : value
  }
  return [
    line,
    ...serviceFields
      .filter((key) => (service[key] || undefined) !== (other[key] || undefined))
      .map((key) => `${t.serviceFields[key]}: ${shown(key)}`),
  ].join(' · ')
}

// One church's part of a change. `proposed` is the schedule as the resolution stated it, which
// still carries the ids that pair a moved time with the one it replaced (the stored services have
// taken the ids of their new slots).
function changedChurch(
  before: Church | undefined,
  after: Church,
  proposed: ProposedService[] | undefined,
  nameOf: (id: string) => string,
  lang: Lang,
): ChangedChurch {
  const t = words[lang]
  const kind = (key: string) => (t.kinds as Record<string, string>)[key] ?? key

  const schedule: ChangeLine[] = proposed
    ? diffSchedule(before?.services ?? [], proposed).flatMap((row): ChangeLine[] => {
        if (row.state === 'same') return []
        if (row.state === 'removed') {
          return [{ label: kind(row.before.kind), before: describeService(row.before, lang) }]
        }
        const now = describeService(row.service, lang)
        if (row.state === 'added') return [{ label: kind(row.service.kind), after: now }]
        const then = describeService(row.before, lang)
        if (then !== now) return [{ label: kind(row.service.kind), before: then, after: now }]
        return [
          {
            label: kind(row.service.kind),
            before: withServiceFields(then, row.before, row.service, lang),
            after: withServiceFields(now, row.service, row.before, lang),
          },
        ]
      })
    : []

  // The coded fields read as words; the rest are text already.
  const shown = (key: FieldKey, value: string | null) => {
    if (!value) return t.none
    if (key === 'parishId') return nameOf(value)
    const coded = key === 'status' || key === 'administration' || key === 'canonicalStatus'
    return coded ? ((t.values as Record<string, string>)[value] ?? value) : value
  }
  const fields: ChangeLine[] = before
    ? (Object.keys(t.fields) as FieldKey[])
        .filter((key) => (before[key] ?? '') !== (after[key] ?? ''))
        .map((key) => ({
          label: t.fields[key],
          before: shown(key, before[key]),
          after: shown(key, after[key]),
        }))
    : []

  const oldLinks = new Set((before?.links ?? []).map((link) => link.url))
  const links: ChangeLine[] = (after.links ?? [])
    .filter((link) => !oldLinks.has(link.url))
    .map((link) => ({ label: link.kind === 'website' ? t.website : link.kind, after: link.url }))

  return {
    id: after.id,
    name: after.name,
    isNew: !before,
    parish: after.parishId ? { id: after.parishId, name: nameOf(after.parishId) } : undefined,
    place: [after.address, after.city, after.region, after.country].filter(Boolean).join(', '),
    lat: after.lat,
    lng: after.lng,
    changes: before ? [...schedule, ...fields, ...links] : [],
    schedule: serviceKinds.flatMap((key) => {
      const times = (after.services ?? [])
        .filter((service) => service.kind === key)
        .sort(bulletinOrder)
        .map((service) => describeService(service, lang))
      return times.length ? [{ kind: key, label: kind(key), times }] : []
    }),
  }
}

/** Every church a change touched, the one it was about first. */
export function changeDetails(entry: ChangeEntry, lang: Lang): ChangedChurch[] {
  const { resolution, records } = entry
  const names = new Map(records.map((record) => [record.after.id, record.after.name]))
  const nameOf = (id: string) => names.get(id) ?? id
  const created = records.filter((record) => !record.before)

  return records.map(({ before, after }) => {
    const proposed = (() => {
      if (!before)
        return resolution.created?.[created.findIndex((c) => c.after === after)]?.services
      if (after.id === entry.churchId) return resolution.services
      return resolution.related?.find((related) => related.churchId === after.id)?.services
    })()
    return changedChurch(before, after, proposed, nameOf, lang)
  })
}

function changeLineText({ label, before, after }: ChangeLine, lang: Lang): string {
  if (before === undefined) return `- ${label}: ${after} (${words[lang].added})`
  if (after === undefined) return `- ${label}: ${before} (${words[lang].removed})`
  return `- ${label}: ${before} → ${after}`
}

// A resolution that reached several churches of a parish reads as one message, church by church.
export function changeMessage(entry: ChangeEntry, lang: Lang): string {
  const t = words[lang]
  const sections = changeDetails(entry, lang).map((church) =>
    [
      [
        church.isNew ? `${church.name} (${t.newChurch})` : church.name,
        church.parish ? `${t.chapelOf} ${church.parish.name}` : '',
        church.place,
        `${church.lat.toFixed(5)}, ${church.lng.toFixed(5)}`,
      ]
        .filter(Boolean)
        .join('\n'),
      church.changes.length
        ? [`${t.changes}:`, ...church.changes.map((line) => changeLineText(line, lang))].join('\n')
        : '',
      church.schedule.length
        ? [
            `${t.now}:`,
            ...church.schedule.map(({ label, times }) => `${label}: ${times.join('; ')}`),
          ].join('\n')
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  )
  return [...sections, `${t.confirmed} ${entry.appliedAt.slice(0, 10)} ${t.by}.`].join('\n\n')
}
