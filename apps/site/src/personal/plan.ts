// The day's plan of life on the home page of a connected browser: the app's
// own rules — which slots fall today, which part of the day is open, what the
// card's band says — drawn as the app draws them (TimeBlockSection,
// PlanOfLifeCard) into the places PersonalPlan.astro leaves empty.
import { type DayCalendar, logicalDay } from '@ember/liturgical'
import { buildOfYearCalendar } from '@ember/missal'
import { format } from 'date-fns'
import {
  bareId,
  canonicalize,
  getEntry,
  getRememberedManifest,
  rememberManifestBody,
} from '@/content/contentIndex'
import { getManifest, loadCatalogFromHearth, loadFlow } from '@/content/resolver'
import { getJson } from '@/content/store'
import { resolveCompletions, type SlotState, useEventStore } from '@/db/events'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { backbonePractices, prayNowFor } from '@/features/explore/prayNow'
import { clockOf } from '@/features/explore/prayNowOrder'
import { entriesAround, owedAt, planStanding } from '@/features/home/planStanding'
import { completedSlotsOn, setSlotDone } from '@/features/plan-of-life/completion'
import { planSlots, scheduleContextFor, slotsDueOn } from '@/features/plan-of-life/due'
import { enrichSlot } from '@/features/plan-of-life/getPracticeName'
import {
  type BlockState,
  type DayPart,
  dayMinutes,
  dayPartStates,
  getActiveBlocks,
  getActiveDayParts,
  getBlockCompletion,
  getCurrentTimeBlock,
} from '@/features/plan-of-life/timeBlocks'
import i18n, { localizeContent } from '@/lib/i18n'
import {
  loadMissalCalendar,
  regionsForJurisdiction,
  transfersForJurisdiction,
} from '@/lib/missal/loaders'
import type { Locale } from '~/lib/locales'
import { href } from '~/routes'

const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en-US'
const t = i18n.t.bind(i18n)
const cardEntries = 4

const tiers = { essential: 2, ideal: 1, extra: 0 } as const
// The card's band is the day's light (PlanOfLifeCard's bandTone).
const bands = {
  green: ['#1E4A32', '#0C2418'],
  gold: ['#8B6914', '#352608'],
  red: ['#6B1620', '#2A080C'],
}
const bandOf = { done: bands.green, ontrack: bands.green, delayed: bands.gold, atrisk: bands.red }

function esc(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

const glyphs = new Map<string, string>()
function glyph(name: string): string {
  if (glyphs.size === 0) {
    const template = document.querySelector<HTMLTemplateElement>('[data-plan-icons]')
    for (const span of template?.content.querySelectorAll<HTMLElement>('[data-icon]') ?? []) {
      glyphs.set(span.dataset.icon ?? '', span.innerHTML)
    }
  }
  return glyphs.get(name) ?? glyphs.get('sparkles') ?? ''
}

function dots(tier: keyof typeof tiers): string {
  return `<span class="pl-dots" aria-hidden="true">${'<i class="TIER"></i>'.repeat(tiers[tier]).replaceAll('TIER', tier)}</span>`
}

// ── What the plan needs from the corpus ─────────────────────────────────

let catalog: Promise<unknown> | undefined
const calendars = new Map<string, Promise<Map<string, DayCalendar>>>()

/** The practices a slot names and prays, warmed so the app's naming finds them. */
async function warm(slots: SlotState[]): Promise<void> {
  catalog ??= loadCatalogFromHearth()
  await catalog
  const { practices } = useEventStore.getState()
  // The backbone too: Pray now offers it when the plan has nothing timed.
  const ids = [
    ...slots.flatMap((s) => [s.practice_id, practices.get(s.practice_id)?.active_variant]),
    ...backbonePractices,
  ]
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      const entry = id ? getEntry(canonicalize(id, 'practice') ?? id) : undefined
      if (!entry || getRememberedManifest(entry.hash) !== undefined) return
      rememberManifestBody(entry.hash, await getJson(entry.hash))
    }),
  )
  // A pinned slot is named by its choice ("Sext"), and an office known by its
  // hours, both held in the flow.
  await Promise.all(
    slots.map((s) => loadFlow(practices.get(s.practice_id)?.active_variant ?? s.practice_id)),
  )
}

function yearCalendar(year: number, jurisdiction: string | undefined) {
  const key = `${year}:${jurisdiction ?? ''}`
  let pending = calendars.get(key)
  if (!pending) {
    pending = loadMissalCalendar().then((calendar) =>
      calendar
        ? buildOfYearCalendar({ year, calendar, regions: regionsForJurisdiction(jurisdiction) })
        : new Map(),
    )
    calendars.set(key, pending)
  }
  return pending
}

// ── The day ─────────────────────────────────────────────────────────────

type Day = {
  today: Date
  date: string
  slots: SlotState[]
  due: SlotState[]
  done: Set<string>
  holyDay: boolean
}

async function readDay(): Promise<Day> {
  const state = useEventStore.getState()
  const slots = planSlots(state)
  await warm(slots)
  const today = logicalDay(new Date())
  const date = format(today, 'yyyy-MM-dd')
  const jurisdiction = state.preferences.get('jurisdiction')
  const calendar = await yearCalendar(today.getFullYear(), jurisdiction)
  const ctx = scheduleContextFor(today, transfersForJurisdiction(jurisdiction), calendar)
  return {
    today,
    date,
    slots,
    due: slotsDueOn(useEventStore.getState(), date, ctx, today),
    done: completedSlotsOn(date, useEventStore.getState()),
    holyDay: ctx?.dayCalendar?.principal?.entry.holyDayOfObligation === true,
  }
}

// ── Drawing ─────────────────────────────────────────────────────────────

// A part opened or folded by hand, or held open while its practices are
// ticked, so the list never folds under the pointer. Cleared when the day turns.
let overrides: Partial<Record<DayPart, BlockState>> = {}
let overridesFor = ''

function prayerHref(slot: SlotState): string | undefined {
  const prayed = useEventStore.getState().practices.get(slot.practice_id)?.active_variant
  const id = canonicalize(prayed ?? slot.practice_id, 'practice')
  return id && getEntry(id) ? href.prayer(locale, bareId(id)) : undefined
}

function listHtml(day: Day): string {
  if (day.due.length === 0) {
    return `<p class="pl-empty">${esc(t(day.slots.length > 0 ? 'home.planNothingToday' : 'home.emptyPlan'))}</p>`
  }
  const parts = getActiveDayParts(day.due)
  const states = dayPartStates(parts, new Date().getHours(), day.done)
  const shown = parts.map(({ part, slots }) => ({
    part,
    slots,
    state: overrides[part] ?? states.get(part) ?? 'preview',
  }))
  const blocks = shown.map(({ part, slots, state }) => {
    const label = t(`dayPart.${part}`)
    const { completed, total } = getBlockCompletion(
      slots.map((s) => s.id),
      day.done,
    )
    const count = `<span class="pl-count">${completed}/${total}</span>`
    const head = (expanded: boolean, inner: string, kind = '') =>
      `<button class="pl-head${kind}" type="button" data-fold="${part}" data-state="${state}" aria-expanded="${expanded}" aria-label="${esc(t(expanded ? 'a11y.collapseBlock' : 'a11y.expandBlock', { name: label }))}">${inner}</button>`
    const name = `<span class="pl-part">${esc(label)}</span>`
    if (state === 'collapsed') {
      return head(false, `${name}${count}${completed === total ? glyph('check') : ''}`)
    }
    if (state === 'preview') {
      const left = slots
        .filter((s) => !day.done.has(s.id))
        .map((s) => enrichSlot(s, t).name)
        .join(' · ')
      return head(
        false,
        `<span class="pl-line">${name}${count}</span><span class="pl-names">${esc(left)}</span>`,
        ' pl-preview',
      )
    }
    const rows = slots.map((slot) => {
      const item = enrichSlot(slot, t)
      const done = day.done.has(slot.id)
      const link = prayerHref(slot)
      const title = link
        ? `<a class="pl-name" href="${link}">${esc(item.name)}</a>`
        : `<span class="pl-name">${esc(item.name)}</span>`
      const label = t(done ? 'a11y.untogglePractice' : 'a11y.togglePractice', { name: item.name })
      return `<div class="pl-row${done ? ' done' : ''}">
        <button class="pl-check" type="button" role="checkbox" aria-checked="${done}" aria-label="${esc(label)}" data-tick="${esc(slot.id)}">${done ? glyph('check') : ''}</button>
        <span class="pl-icon" aria-hidden="true">${glyph(item.icon)}</span>
        <span class="pl-text">${title}${item.subtitle ? `<span class="pl-sub">${esc(item.subtitle)}</span>` : ''}</span>
        ${!done && tiers[slot.tier] > 0 ? dots(slot.tier) : ''}
        ${link ? `<span class="pl-chev" aria-hidden="true">${glyph('chevron-right')}</span>` : ''}
      </div>`
    })
    return `<div class="pl-open">${head(true, `${name}${count}`)}${rows.join('')}</div>`
  })
  // The dots mean nothing until named, and only the open parts show them.
  const waiting = new Set(
    shown
      .filter(({ state }) => state === 'expanded')
      .flatMap(({ slots }) => slots)
      .filter((s) => !day.done.has(s.id))
      .map((s) => s.tier),
  )
  const legend = (['essential', 'ideal'] as const)
    .filter((tier) => waiting.has(tier))
    .map((tier) => `<span>${dots(tier)} ${esc(t(`tier.${tier}`))}</span>`)
    .join('')
  return `<div class="pl">${blocks.join('')}${legend ? `<div class="pl-legend" aria-hidden="true">${legend}</div>` : ''}</div>`
}

function cardHtml(day: Day): string {
  const blocks = getActiveBlocks(day.due).map(({ block, def }) => ({
    block,
    slots: def.slots.map((s) => ({
      id: s.id,
      name: enrichSlot(s, t).name,
      essential: s.tier === 'essential',
      owed: owedAt(block, s.time),
    })),
  }))
  const now = new Date()
  const standing = planStanding(
    blocks,
    day.done,
    dayMinutes(now.getHours() * 60 + now.getMinutes()),
  )
  const total = standing.entries.length
  const noPlan = day.slots.length === 0
  const [from, to] = total > 0 ? bandOf[standing.standing] : bands.red
  const band =
    total > 0
      ? `<span>${esc(t('home.planCount', { done: standing.done, total }).toLocaleUpperCase())}</span><b>${esc(t(`home.planStanding.${standing.standing}`).toLocaleUpperCase())}</b>`
      : `<span>${esc(t(noPlan ? 'home.planToBegin' : 'home.planEmptyDay').toLocaleUpperCase())}</span>`
  const entries = (() => {
    if (total === 0)
      return `<li class="note">${esc(t(noPlan ? 'home.planInvite' : 'home.planNothingToday'))}</li>`
    if (standing.standing === 'done') return '<li class="note">Pax Christi.</li>'
    return entriesAround(standing.entries, getCurrentTimeBlock(now.getHours()), cardEntries)
      .map((e) => `<li class="${e.status}">${esc(e.name)}</li>`)
      .join('')
  })()
  return `<span class="sheet" style="--from:${from};--to:${to}">
    <span class="band">${band}</span>
    <span class="title">${esc(t('home.planOfLife'))}</span>
    <ul>${entries}</ul>
  </span>
  <span class="caption">${esc(t('home.planForToday'))}</span>`
}

// What to pray now: the app's own pick (PrayNowCard), in the carousel's
// first place, where a visitor sees the card that presents the app.
function fillPrayNow(day: Day): void {
  const card = document.querySelector<HTMLAnchorElement>('[data-pray-now]')
  const mark = document.querySelector<HTMLElement>('[data-pray-mark]')
  if (!card || !mark) return
  for (const el of document.querySelectorAll<HTMLElement>('[data-app-card], [data-app-mark]')) {
    el.hidden = true
  }
  const { completions, completionsByDate } = useEventStore.getState()
  const prayedToday = resolveCompletions(completionsByDate.get(day.date), completions).map(
    (c) => c.practice_id,
  )
  const pick = prayNowFor({
    slots: day.due,
    completedIds: day.done,
    prayedToday,
    today: day.today,
    holyDay: day.holyDay,
    wall: new Date(),
    t,
  })
  card.hidden = !pick
  mark.hidden = !pick
  // The carousel's marks follow the cards in view.
  card.parentElement?.dispatchEvent(new Event('scroll'))
  if (!pick) return
  const { next, comingUp, suggestion, block, minutes } = pick
  const ref = canonicalize(next.practice_id, 'practice') ?? next.practice_id
  const manifest = getManifest(next.practice_id)
  const marker = t(
    (() => {
      if (suggestion) return 'explore.prayNow.suggestion'
      if (comingUp) return 'explore.prayNow.comingUp'
      return 'explore.prayNow.label'
    })(),
  )
  const tone = toneForKey(ref)
  card.style.setProperty('--from', tone.from)
  card.style.setProperty('--to', tone.to)
  card.href = getEntry(ref) ? href.prayer(locale, bareId(ref)) : href.section(locale, 'prayers')
  const art = artFor(ref)?.uri
  const artBox = card.querySelector<HTMLElement>('[data-pray-art]')
  const plate = card.querySelector<HTMLElement>('[data-pray-plate]')
  if (artBox && plate) {
    artBox.hidden = !art
    plate.hidden = !!art
    if (art) artBox.querySelector('img')?.setAttribute('src', art)
  }
  const description = manifest?.description ? localizeContent(manifest.description) : undefined
  const text = (name: string, value: string) => {
    const el = card.querySelector<HTMLElement>(`[data-pray-${name}]`)
    if (el) el.textContent = value
  }
  text('kicker', `${marker} · ${comingUp ? clockOf(next.due) : t(`timeBlock.${block}`)}`)
  text('title', next.name)
  text('sub', [next.subtitle, description].filter(Boolean).join(' — '))
  text('minutes', minutes ?? '')
  text('tier', suggestion ? '' : t(`tier.${next.tier}`))
}

// ── Mounting ────────────────────────────────────────────────────────────

export function mountPlan(): void {
  const panel = document.querySelector<HTMLElement>('[data-plan-panel]')
  const card = document.querySelector<HTMLButtonElement>('[data-plan-card]')
  const sheet = document.querySelector<HTMLElement>('[data-plan-sheet]')
  const scrim = document.querySelector<HTMLElement>('[data-plan-scrim]')
  if (!panel || !card || !sheet || !scrim) return
  const lists = [...document.querySelectorAll<HTMLElement>('[data-plan-list]')]

  let latest: Day | undefined
  let drawing = 0
  const draw = async () => {
    const mine = ++drawing
    const day = await readDay()
    // A later draw has started meanwhile; its day is the newer.
    if (mine !== drawing) return
    if (overridesFor !== day.date) {
      overrides = {}
      overridesFor = day.date
    }
    latest = day
    const list = listHtml(day)
    for (const el of lists) el.innerHTML = list
    card.innerHTML = cardHtml(day)
    fillPrayNow(day)
    panel.hidden = false
    card.hidden = false
  }

  function redraw() {
    draw().catch((err: unknown) => {
      for (const el of lists)
        el.innerHTML = `<p class="pl-empty">${esc(t('account.couldNotReach'))}</p>`
      throw err
    })
  }

  for (const el of lists) {
    el.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const fold = target.closest<HTMLElement>('[data-fold]')
      if (fold) {
        const part = fold.dataset.fold as DayPart
        overrides[part] = fold.dataset.state === 'expanded' ? 'collapsed' : 'expanded'
        redraw()
        return
      }
      const tick = target.closest<HTMLElement>('[data-tick]')
      if (!tick || !latest) return
      const slotKey = tick.dataset.tick ?? ''
      const done = !latest.done.has(slotKey)
      // Hold the part open as it is while its practices are ticked.
      const part = getActiveDayParts(latest.due).find(({ slots }) =>
        slots.some((s) => s.id === slotKey),
      )?.part
      if (part && !overrides[part]) overrides[part] = 'expanded'
      setSlotDone(slotKey, latest.date, done).catch((err: unknown) => {
        alert(t('account.couldNotReach'))
        throw err
      })
    })
  }

  const open = (on: boolean) => {
    sheet.hidden = !on
    scrim.hidden = !on
    if (on) sheet.querySelector<HTMLElement>('[data-plan-close]')?.focus()
    else card.focus()
  }
  card.addEventListener('click', () => open(true))
  scrim.addEventListener('click', () => open(false))
  sheet.querySelector('[data-plan-close]')?.addEventListener('click', () => open(false))
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !sheet.hidden) open(false)
  })

  // The log changed — ticked here, or brought in from another tab or device —
  // or the hour or the day turned.
  useEventStore.subscribe(redraw)
  setInterval(redraw, 60_000)
  redraw()
}
