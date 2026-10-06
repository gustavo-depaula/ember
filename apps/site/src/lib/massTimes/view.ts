// A church and its schedule as HTML, from the app's own schedule logic. The
// same functions draw a page at build and a result in the browser, so a church
// reads alike wherever it is rendered. Strings only: no DOM, no framework.
import type { Church, ChurchLink, ChurchText, Service, ServiceKind } from '@ember/api'
import type { TFunction } from 'i18next'
import {
  dayLabel,
  describeOtherRule,
  formatDistanceKm,
  formatTimeOfDay,
  serviceKindOrder,
  shortDayLabel,
  weekdayName,
} from '@/features/mass-times/format'
import { nextService, wallClockNow } from '@/lib/mass-times/schedule'
import { weeklySchedule } from '@/lib/mass-times/weekly'
import type { Translate } from './t'

export type ChurchDetail = Church & {
  services: Service[]
  texts: ChurchText[]
  links: ChurchLink[]
}
export type ListedChurch = Church & { services?: Service[] | null; distanceKm?: number }

export type ViewContext = {
  t: Translate
  locale: string
  /** Where a church's own page lives. */
  churchHref: (id: string) => string
  /** Omitted at build: a static page cannot know "today" or "next". */
  now?: Date
  /** The service a list is about; Mass unless the reader chose another. */
  kind?: ServiceKind
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (text: string | null | undefined) => (text ?? '').replace(/[&<>"]/g, (c) => entities[c])
const tf = (t: Translate) => t as unknown as TFunction

const sectionLabel: Record<ServiceKind, string> = {
  mass: 'massTimes.masses',
  confession: 'massTimes.confession',
  adoration: 'massTimes.adoration',
} as Record<ServiceKind, string>

function place(church: Church): string {
  return [church.address, church.city, church.region].filter(Boolean).join(' · ')
}

function nextOf(church: ListedChurch, ctx: ViewContext) {
  const now = ctx.now && wallClockNow(church.timezone, ctx.now)
  return now
    ? nextService(church.services ?? [], {
        timezone: church.timezone,
        kind: ctx.kind ?? 'mass',
        now,
      })
    : undefined
}

/**
 * Churches by how soon their next service begins; those with none listed keep
 * their order (nearest first) at the end.
 */
export function bySoonest(churches: ListedChurch[], ctx: ViewContext): ListedChurch[] {
  const when = new Map(churches.map((church) => [church, nextOf(church, ctx)?.instant.getTime()]))
  return [...churches].sort(
    (a, b) => (when.get(a) ?? Number.POSITIVE_INFINITY) - (when.get(b) ?? Number.POSITIVE_INFINITY),
  )
}

export function churchRowHtml(church: ListedChurch, ctx: ViewContext): string {
  const { t, locale } = ctx
  const services = church.services ?? []
  const now = ctx.now && wallClockNow(church.timezone, ctx.now)
  const next = nextOf(church, ctx)
  const time = next
    ? `<span class="mt-time">${formatTimeOfDay(next.service.startTime)}</span><span class="mt-day">${esc(shortDayLabel(next.occurrence.date, now, tf(t), locale))}</span>`
    : `<span class="mt-none">${esc(t(services.length ? 'massTimes.noUpcoming' : 'massTimes.notListed'))}</span>`
  const distance =
    church.distanceKm === undefined
      ? ''
      : `<span class="mt-dist">${formatDistanceKm(church.distanceKm, locale)}</span>`
  return `<a class="mt-row" href="${esc(ctx.churchHref(church.id))}"><span class="mt-when">${time}</span><span class="mt-body"><span class="mt-name"><span>${esc(church.longName ?? church.name)}</span>${distance}</span><span class="mt-place">${esc(place(church))}</span></span></a>`
}

function weeklyHtml(
  services: Service[],
  kind: ServiceKind,
  ctx: ViewContext,
  today?: number,
): string {
  const { t, locale } = ctx
  const schedule = weeklySchedule(services, kind)
  if (!schedule.days.length && !schedule.other.length) return ''
  const days = schedule.days
    .map(
      (day) =>
        `<div class="mt-week-row${day.dow === today ? ' today' : ''}"><span class="mt-week-day">${esc(weekdayName(day.dow, locale))}</span><span class="mt-week-times">${day.times
          .map((time) => `<time>${formatTimeOfDay(time)}</time>`)
          .join('')}</span></div>`,
    )
    .join('')
  const other = schedule.other
    .map(
      (rule) =>
        `<div class="mt-week-row other"><span class="mt-week-day">${esc(describeOtherRule(rule, tf(t), locale))}</span><span class="mt-week-times"><time>${formatTimeOfDay(rule.startTime)}</time></span></div>`,
    )
    .join('')
  return `<section class="mt-section"><h2 class="mt-label">${esc(t(sectionLabel[kind]))}</h2>${days}${other}</section>`
}

const linkLabels: Record<string, string> = {
  website: 'massTimes.website',
}

export function churchHtml(church: ChurchDetail, ctx: ViewContext): string {
  const { t, locale } = ctx
  const now = ctx.now && wallClockNow(church.timezone, ctx.now)
  const next = now
    ? nextService(church.services, { timezone: church.timezone, kind: 'mass', now })
    : undefined
  const nextHtml = next
    ? `<p class="mt-next"><span class="mt-next-time">${formatTimeOfDay(next.service.startTime)}</span><span class="mt-next-label">${esc(t('massTimes.nextMass'))} · ${esc(dayLabel(next.occurrence.date, now, tf(t), locale))}</span></p>`
    : ''
  const contacts = [
    `<a href="https://www.google.com/maps/search/?api=1&query=${church.lat},${church.lng}" rel="noopener">${esc(t('massTimes.directions'))}</a>`,
    church.phoneE164 && `<a href="tel:${esc(church.phoneE164)}">${esc(t('massTimes.call'))}</a>`,
    church.email && `<a href="mailto:${esc(church.email)}">${esc(t('massTimes.email'))}</a>`,
    ...church.links.map(
      (link) =>
        `<a href="${esc(link.url)}" rel="noopener nofollow">${esc(linkLabels[link.kind] ? t(linkLabels[link.kind]) : link.kind.charAt(0).toUpperCase() + link.kind.slice(1))}</a>`,
    ),
  ]
    .filter(Boolean)
    .join('')
  const sections = serviceKindOrder
    .map((kind) => weeklyHtml(church.services, kind, ctx, now?.getUTCDay()))
    .join('')
  const texts = church.texts.length
    ? `<section class="mt-section"><h2 class="mt-label">${esc(t('massTimes.asListed'))}</h2><div class="mt-listed">${church.texts
        .map(
          (text) =>
            `<div><span class="mt-text-kind">${esc(t(`massTimes.textKind.${text.kind}`))}</span><p>${esc(text.rawText).replace(/\n/g, '<br>')}</p></div>`,
        )
        .join('')}</div></section>`
    : ''
  const verified = church.lastVerifiedAt
    ? `<p class="mt-verified">${esc(
        t('massTimes.lastVerified', {
          date: new Date(church.lastVerifiedAt).toLocaleDateString(locale, {
            dateStyle: 'medium',
            timeZone: 'UTC',
          }),
        }),
      )}</p>`
    : ''
  const empty = !sections && !texts ? `<p class="mt-none">${esc(t('massTimes.notListed'))}</p>` : ''
  return `<header class="mt-head"><h1>${esc(church.longName ?? church.name)}</h1><p class="mt-address">${esc(place(church))}</p>${nextHtml}</header><nav class="mt-contacts">${contacts}</nav>${sections}${empty}${texts}${verified}`
}
